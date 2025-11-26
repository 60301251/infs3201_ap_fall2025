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
    findPhotosByAlbum
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

    let inAlbum = false
    const al = p.albums || []
    for (let j = 0; j < al.length; j++) {
      if (al[j] === album.id) { 
        inAlbum = true
        break
      }
    }

    if (!inAlbum) continue


    const vis = p.visibility || 'public'
    if (vis === 'public' || Number(p.ownerId) === Number(currentUserId)) {
      visiblePhotos.push(p)
    }
  }

  return { album, photos: visiblePhotos }
}
/**
 * Retrieves all photos in an album that the user is allowed to see.
 * Public photos are visible to everyone.
 * Private photos are visible only to their owner.
 *
 * @async
 * @param {number|string} albumId - Album ID
 * @param {number|string} userId  - Logged-in user ID
 * @returns {Promise<Array<Object>>}
 */
async function getPhotosByAlbum(albumId, userEmail) {
    const photos = await loadPhoto(); 
    const result = [];
     for (const photo of photos) {
        if (!photo.albums || !photo.albums.includes(albumId)) continue;
             if (photo.visibility === "public" || photo.ownerEmail === userEmail) {
            result.push(photo)
        }
    }

    return result
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

async function uploadPhoto(albumId, req) {
    if (!req.files || !req.files.photo) {
        throw new Error("No file uploaded")
    }

    const photo = req.files.photo;

    // Ensure /photos folder exists
    const photosDir = path.join(__dirname, 'photos')
    if (!fs.existsSync(photosDir)) {
        fs.mkdirSync(photosDir)
    }

    // Save file to /photos
    const uploadPath = path.join(photosDir, photo.name)
    await photo.mv(uploadPath)

    // Prepare photo info for DB
    const photoData = {
        albumId: albumId,
        filePath: photo.name, // store only filename
        title: req.body.title || '',
        description: req.body.description || '',
        visibility: req.body.visibility || 'public',
        uploadedAt: new Date()
    }
    return photoData;
}





async function getNextPhotoId() {
    const db = await connPool;
    const counters = db.collection("counters");

    const result = await counters.findOneAndUpdate(
        { name: "photoId" },
        { $inc: { value: 1 } },
        { upsert: true, returnDocument: "after" }
    );

    return result.value.value;
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
    logout,
    getUserBySession,
    createSession,
    searchPhotos,
    uploadPhoto,
    getNextPhotoId
}