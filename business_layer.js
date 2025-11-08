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
    updatePhoto : updatePhotoDB,
    addComment,
    getCommentsByPhoto,
    getByAlbum,
    createSession,
    getUserBySession,
    deleteSession
} = require('./persistance_layer')

async function signup(name, email, password) {
    return await registerUser(name, email, password)
    
}

async function login(email, password) {
    const user = await loginUser(email, password);
    if (!user) return null;

    const sessionId = await createSession(user.id);
    return { user, sessionId };
}

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
async function updatePhoto(photoId,newtitle,newdes, newVisibility){
    const update={}

    if(newtitle && newtitle.trim()!== ""){
        update.title=newtitle.trim()
    }
    if(newdes && newdes.trim()!== ""){
        update.description=newdes.trim()
    }

    if(newVisibility && (newVisibility === "public" || newVisibility === "private")){
        update.visibility = newVisibility
    }

    if(Object.keys(update).length === 0){
        return null
    }
    const updatedPhoto= await updatePhotoDB(Number(photoId),update)

    if(!updatedPhoto){
        return null
    }
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
    await savePhoto([photo])
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
