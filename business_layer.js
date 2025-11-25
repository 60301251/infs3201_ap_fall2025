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
    connectDatabase,
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
 * Get an album by name and return only photos visible to the current user.
 *
 * @param {string} albumName - Name of the album to search for.
 * @param {string|number} currentUserId - ID of the user requesting the photos.
 * @returns {Promise<{album: Object, photos: Object[] } | null>} Album and filtered photos, or null if album not found.
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
    await savePhoto(photo)
    return photo
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

    for (const photo of photos) {
        if (!photo.albums || !photo.albums.includes(albumId)) continue;

        if (photo.visibility === "public" || photo.ownerEmail === userEmail) {
            result.push(photo)
        }
    }

    return result
}


/**
 * Uploads a photo, saves it to the server, and stores its metadata in MongoDB.
 *
 * @async
 * @param {string|number} userId - The ID of the user uploading the photo.
 * @param {string|number} albumId - The album to which the photo belongs.
 * @param {Object} uploadedFile - The uploaded file object.
 * @param {Object} photoData - Additional photo details (title, description, visibility, ownerEmail).
 * @returns {Promise<string>} The ID of the inserted photo record.
 */

async function uploadPhoto(userId, albumId, uploadedFile, photoData) {
const db = await connectDatabase()
const photosCollection = db.collection('photos')
const photosDir = path.join(__dirname, 'photos')
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir)

const fileExt = path.extname(uploadedFile.name)
const fileName = `${Date.now()}_${userId}${fileExt}`
const filePath = path.join(photosDir, fileName)

await uploadedFile.mv(filePath)

const photoRecord = {
    userId,
    albumId,
    title: photoData.title,
    description: photoData.description,
    visibility: photoData.visibility,
    ownerEmail: photoData.ownerEmail,
    fileName,
    filePath,
    createdAt: new Date()
}

const result = await photosCollection.insertOne(photoRecord)
return result.insertedId
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
    getPhotosByAlbum,
}