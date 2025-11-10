/**
* Group 001
* Name and Student ID:Eva Paul_60301251
*                      Mufeeda Kalam_60303289
*                     Aysha Sultana_60099830
* 
* INFS3201-5/6- Web Tech 2 
* Project Phase 1
*/

const{
    registerUser,
    loginUser,
    loadPhoto,
    loadAlbum,
    savePhoto,
    saveAlbum,
    findPhoto,
    findAlbum,
    findAlbumbyName,
    updatePhotoDB,
    addComment,
    getCommentsByPhoto,
    createSession,
    getUserBySession,
    deleteSession
} = require('./persistance_layer')

/**
 * Register a new user.
 *
 * @param {string} name - User's full name.
 * @param {string} email - User's email address.
 * @param {string} password - Plain text password to register.
 * @returns {Promise<Object>} Newly created user record.
 */
async function signup(name, email, password) {
    return await registerUser(name, email, password)
    
}

/**
 * Authenticate a user and create a session.
 *
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<{user: Object, sessionId: string} | null>} Authenticated user and session ID, or null if invalid login.
 */
async function login(email, password) {
    const user = await loginUser(email, password);
    if (!user) return null;

    const sessionId = await createSession(user.id);
    return { user, sessionId };
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
 * To getPhoto using userId
 *  @async
 * @param {number} photoId - The ID of the photo.
 * @returns {Promise<Object|null>} Photo object if allowed, or null if not found.
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
 * @param {string} currentUserEmail - Email of the user requesting the photos.
 * @returns {Promise<{album: Object, photos: Object[] } | null>} Album and filtered photos, or null if album not found.
 */
async function getByAlbum(albumName, currentUserEmail) {
    const album = await findAlbumbyName(albumName)
    if (!album) return null

    const photos = await loadPhoto()
    let visiblePhotos = []

    for (let photo of photos) {
        if ((photo.albums || []).includes(album.id)) {
            
            if (photo.visibility === "public" || photo.ownerEmail === currentUserEmail) {
                visiblePhotos.push(photo)
            }
        }
    }

    return { album, photos: visiblePhotos }
}


/**
 * To update details of photo using photoId
 * @async
 * @param {number} photoId - ID of the photo to update.
 * @param {string} newtitle - New title (optional).
 * @param {string} newdes - New description (optional).
 * @returns {Promise<Object|null>} Updated photo object, or null if not found.
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
 * To add tags to a photo
 * @async
 * @param {number} photoId - ID of the photo.
 * @param {string} newTag - Tag to add.
 * @returns {Promise<Object|null>} Updated photo object, "duplicate" if tag exists, or null if not found.
*/
async function addTag(photoId,newTag) {
    let photo = await findPhoto(Number(photoId))
    if (!photo){
        return null
    } 
    photo.tags = photo.tags || []
    if (photo.tags.includes(newTag)){
        return 'duplicate'
    } 
    photo.tags.push(newTag)
    await savePhoto(photo)
    return photo
    
}

/* COMMENTS */

/**
 * Create a new comment for a photo.
 * @param {number|string} photoId
 * @param {Object} user - logged-in user object
 * @param {string} text - comment text
 * @returns {Promise<Object|null>} Inserted comment or null on validation failure
 */
async function addPhotoComment(photoId, user, text) {
    if (!user) {
        return null
    }
    if (!text || text.trim() === "") {
        return null
    }
    const cleaned = text.trim()
    const result = await addComment(Number(photoId), user.id, user.name, cleaned)
    return result
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

module.exports={
    signup,
    login,
    getPhoto,
    getAlbum,
    updatePhoto,
    getByAlbum,
    addTag,
    addPhotoComment,
    listPhotoComments,
    loginUser,
    logout,
    getUserBySession,
    createSession
}
