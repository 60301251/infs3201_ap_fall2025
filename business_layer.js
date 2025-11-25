/**
* Group 001
* Name and Student ID:Eva Paul_60301251
*                      Mufeeda Kalam_60303289
*                     Aysha Sultana_60099830
* 
* INFS3201-5/6- Web Tech 2 
* Project Phase 2
*/

const{
    registerUser,
    loginUser,
    loadPhoto,
    savePhoto,
    findPhoto,
    findAlbum,
    findAlbumbyName,
    updatePhotoDB,
    addComment,
    getCommentsByPhoto,
    createSession,
    getUserBySession,
    deleteSession,
    searchPublicPhotos,
    findUserById,
} = require('./persistance_layer')
const { sendMail } = require("./email")
const path = require('path')
const fs = require('fs')

/**
 * Register a new user.
 *
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - Plain text password to register
 * @returns {Promise<Object>} Newly created user record
 */
async function signup(name, email, password) {
    return await registerUser(name, email, password)
    
}

/**
 * Authenticate a user and create a session.
 *
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{user: Object, sessionId: string} | null>} Authenticated user and session ID, or null if invalid login
 */
async function login(email, password) {
    const user = await loginUser(email, password)
    if (!user) return null

    const sessionId = await createSession(user.id)
    return { user, sessionId }
}


/**
 * Log out a user by deleting their session.
 *
 * @param {string} sessionId - The session ID to remove.
 * @returns {Promise<void>}
 */
async function logout(sessionId) {
    await deleteSession(sessionId)
    
}

/**
 * Get a photo by ID.
 * @async
 * @param {number|string} photoId - The ID of the photo.
 * @returns {Promise<Object|null>} Photo object if found, otherwise null.
 */
async function getPhoto(photoId){
    const photo=await findPhoto(Number(photoId))
    if(!photo){
        return null
    }
    return photo

}

/**
 * Get Album details by ID
 * @async
 * @param {number} albumId - The ID of the album.
 * @returns {Promise<Object|null>} Album object if found, otherwise null.
*/
async function getAlbum(albumId){ 
    const album = await findAlbum(Number(albumId)) 
    if(!album){ 
        return null 
    } 
    return album 
}

/**
 * Retrieves an album by its name and returns only the photos that belong
 * to that album AND are visible to the current user.  
 *
 * Visibility rules:
 * - Public photos are always visible.
 * - Private photos are visible only to their owner.
 *
 * @async
 * @param {string} albumName - Exact name of the album (case-insensitive).
 * @param {number|string} currentUserId - ID of the user requesting access.
 * @returns {Promise<{album: Object, photos: Object[]} | null>}
 *   Returns an object containing the album and its visible photos,
 *   or null if the album does not exist.
 */

async function getByAlbum(albumName, currentUserId) {
  const album = await findAlbumbyName(albumName)
  if (!album) return null

  const photos = await loadPhoto()
  const visiblePhotos = []

  for (let i = 0; i < photos.length; i++) {
    const p = photos[i]
    if (Number(p.albumId) !== Number(album.id)) {
      continue
    }

    const vis = p.visibility || 'public'
    if (vis === 'public' || Number(p.ownerId) === Number(currentUserId)) {
      visiblePhotos.push(p)
    }
  }

  return { album, photos: visiblePhotos }
}


/**
 * Update details of a photo.
 * @async
 * @param {number|string} photoId - ID of the photo to update
 * @param {number|string} userId - ID of the user performing the update (must own the photo)
 * @param {string} [newTitle] - New title
 * @param {string} [newDes] - New description
 * @param {"public"|"private"} [newVisibility] - New visibility
 * @returns {Promise<Object|null>} Updated photo object, or null if not found or nothing to update
 */
async function updatePhoto(photoId, userId, newTitle, newDes, newVisibility) {
    const update = {}

    if (typeof newTitle === 'string' && newTitle.trim() !== '') {
        update.title = newTitle.trim()
    }

    if (typeof newDes === 'string' && newDes.trim() !== '') {
        update.description = newDes.trim()
    }

    if (newVisibility === 'public' || newVisibility === 'private') {
        update.visibility = newVisibility
    }
    
    
    if (Object.keys(update).length === 0) return null

    const updatedPhoto = await updatePhotoDB(Number(photoId), update, Number(userId))
    return updatedPhoto
}

/**
 * Add a tag to a photo.
 * @async
 * @param {number|string} photoId - ID of the photo
 * @param {string} newTag - Tag to add
 * @returns {Promise<Object|"duplicate"|null>} Updated photo, "duplicate" if tag exists, or null if not found
 */
async function addTag(photoId, newTag) {
  const photo = await findPhoto(Number(photoId))
  if (!photo) return null

  photo.tags = photo.tags || []

  let exists = false
  for (let i = 0; i < photo.tags.length; i++) {
    if (photo.tags[i] === newTag) { exists = true; break }
  }
  if (exists) return 'duplicate'

  photo.tags.push(newTag)

  const updated = await updatePhotoDB(
    Number(photoId),
    { tags: photo.tags },
    Number(photo.ownerId)
  )

  return updated
}


/**
 * Create a new comment for a photo.
 * Allowed only if user is logged in AND (photo is public OR user owns the photo)
 * @param {number|string} photoId
 * @param {Object} user - logged-in user object
 * @param {string} text - comment text
 * @returns {Promise<Object|null>} Inserted comment or null on validation/permission failure
 */
async function addPhotoComment(photoId, user, text) {
    try {
        if (!user) return null
        if (typeof text !== 'string') return null

        const cleaned = text.trim()
        if (cleaned.length < 1 || cleaned.length > 500) return null

        const photo = await findPhoto(Number(photoId))
        if (!photo) return null

        const isOwner = Number(photo.ownerId) === Number(user.id)
        const isPublic = (photo.visibility || 'public') === 'public'
        if (!isOwner && !isPublic) return null

        const comment = await addComment(photo.id, user.id, user.name, cleaned)

        if (!isOwner) {
            const owner = await findUserById(photo.ownerId)
            if (owner && owner.email) {
                const subject = `New Comment on Your Photo`
                const body = `Hello ${owner.name},
                ${user.name} commented on your photo "${photo.title || ''}":
                "${cleaned}"
                Regards,
                Photo App`
                sendMail(owner.email, subject, body)
            } else {
                console.warn("Owner not found for photoId:", photo.id, "ownerId:", photo.ownerId)
            }
        }

        return comment
    } catch (err) {
        console.error("Error in addPhotoComment:", err)
        return null
    }
}

/**
 * List all comments for a photo.
 * @param {number|string} photoId
 * @returns {Promise<Array>}
 */
async function listPhotoComments(photoId) {
    const items = await getCommentsByPhoto(Number(photoId))
    return items
}


/**
 * Search public photos by title, description, or tags.
 *
 * @param {string} searchTerm - Text entered by the user.
 * @returns {Promise<Object[]>} Matching public photo objects.
 */
async function searchPhotos(searchTerm) {
    const term = typeof searchTerm === 'string' ? searchTerm : ''
    const trimmed = term.trim()
    if (!trimmed) {
        return []
    }
    const photos = await searchPublicPhotos(trimmed)
    return photos
}


/**
 * Retrieves all photos that belong to a specific album and are visible to the user.
 *
 * @async
 * @param {string} albumId - The ID of the album to filter photos by
 * @param {string} userEmail - The email of the current user to check for private photo access
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of photo objects 
 *   that belong to the album and are either public or owned by the user
 */

async function getPhotosByAlbum(albumId, userEmail) {
  const photos = await loadPhoto()
  const result = []
  const albumIdNum = Number(albumId)

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i]

    if (Number(photo.albumId) !== albumIdNum) {
      continue
    }

    if (photo.visibility === 'public' || photo.ownerEmail === userEmail) {
      result.push(photo)
    }
  }

  return result
}



/**
 * Uploads a photo file to the server (./photos folder) and stores its
 * metadata in MongoDB. Generates a unique filename, saves the file
 * physically, and calls savePhoto() to assign a numeric photo ID.
 *
 * @async
 * @param {string|number} userId - The ID of the user uploading the photo.
 * @param {string|number} albumId - The album to which the photo belongs.
 * @param {Object} uploadedFile - The uploaded file object from express-fileupload.
 * @param {Object} photoData - Additional form fields (title, description, visibility).
 *
 * @param {string} photoData.title - Photo title entered by the user.
 * @param {string} photoData.description - Photo description entered by the user.
 * @param {"public"|"private"} photoData.visibility - Visibility setting.
 *
 * @returns {Promise<number>} The newly generated numeric photo ID.
 */
<<<<<<< Updated upstream

async function uploadPhoto(userId, albumId, uploadedFile, photoData) {
    // 1. Check album exists
    const album = await findAlbum(Number(albumId));
    if (!album) throw new Error('Album not found');
    const photosDir = path.join(__dirname, 'photos')
    if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir)
  }

  const fileExt = path.extname(uploadedFile.name)
  const fileName = `${Date.now()}_${userId}${fileExt}`
  const diskPath = path.join(photosDir, fileName)

  await uploadedFile.mv(diskPath)

  const record = {
    title: (photoData.title || '').trim(),
    description: (photoData.description || '').trim(),
    visibility: (photoData.visibility === 'private') ? 'private' : 'public',
    ownerId: Number(userId),
    albumId: Number(albumId),
    filePath: fileName
  }

  const newId = await savePhoto(record)
  return newId
}

=======
>>>>>>> Stashed changes
async function uploadPhoto(userid, albumid, uploadedFile, photoData) {


    // 2. Create folder for user/album if not exists
    const dir = path.join(__dirname, '../photos', String(userId), String(albumId));
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (err) {
        throw new Error('Failed to create directory: ' + err.message);
    }

<<<<<<< Updated upstream
    // 3. Save uploaded file using a Promise wrapper
    const savePath = path.join(dir, uploadedFile.name);
    await new Promise((resolve, reject) => {
        uploadedFile.mv(savePath, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // 4. Save photo metadata to MongoDB
    const photoDoc = {
=======
    const savePath = path.join(dir, uploadedFile.name);
    try {
        await uploadedFile.mv(savePath);  
    } catch (err) {
        throw new Error('Failed to save file: ' + err.message);
    }

    const dbPath = path.join(__dirname, '../db.json');
    let db;
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        db = JSON.parse(data);
    } catch (err) {
        throw new Error('Failed to read database: ' + err.message);
    }

    let user = null;
    for (let i = 0; i < db.users.length; i++) {
        if (db.users[i].userid == userid) {
            user = db.users[i];
            break;
        }
    }
    if (!user) throw new Error('User not found');

    let album = null;
    for (let i = 0; i < user.albums.length; i++) {
        if (user.albums[i].albumid == albumid) {
            album = user.albums[i];
            break;
        }
    }
    if (!album) throw new Error('Album not found');

    album.photos.push({
        id: Date.now(), 
        filename: uploadedFile.name,
>>>>>>> Stashed changes
        title: photoData.title || uploadedFile.name,
        description: photoData.description || '',
        visibility: photoData.visibility || 'public',
        ownerId: Number(userId),
        albumId: Number(albumId),
        filePath: path.join('photos', String(userId), String(albumId), uploadedFile.name)
    };

    const photoId = await savePhoto(photoDoc);
    return photoId;
}


module.exports={
    signup,
    login,
    getPhoto,
    getAlbum,
    getByAlbum,
    updatePhoto,
    addTag,
    addPhotoComment,
    getPhotosByAlbum,
    listPhotoComments,
    loginUser,
    logout,
    getUserBySession,
    createSession,
    searchPhotos,
    uploadPhoto,
}