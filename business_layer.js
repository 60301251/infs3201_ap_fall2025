/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 2
*/

const{
    loadUsers,
    findUser,
    loadPhoto,
    loadAlbum,
    savePhoto,
    saveAlbum,
    findPhoto,
    findAlbum,
    findAlbumbyName,
} = require('./persistance_layer')

/**
 * Validate login users
 *  @async
 * @param {string} username - The username to validate.
 * @param {string} password - The password to validate.
 * @returns {Promise<Object|null>} The user object if login succeeds, otherwise null.
*/
async function login(username,password){
    return await findUser(username,password) 
}


/**
 * To getPhoto using userId
 *  @async
 * @param {number} photoId - The ID of the photo.
 * @param {number} userId - The ID of the user requesting the photo.
 * @returns {Promise<Object|string|null>} Photo object if allowed, "unauthorized" if access denied, or null if not found.
*/
async function getPhoto(photoId, userId){
    const photo=await findPhoto(photoId)
    if(!photo){
        return null
    }
    if(photo.owner!==userId){
        return "unauthorized" 
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
    return await findAlbum(albumId)
}

/**
 * To update details of photo using photoId
 * @async
 * @param {number} photoId - ID of the photo to update.
 * @param {string} newtitle - New title (optional).
 * @param {string} newdes - New description (optional).
 * @param {number} userId - ID of the user making the update.
 * @returns {Promise<Object|string|null>} Updated photo object, "unauthorized" if access denied, or null if not found.
*/
async function updatePhoto(photoId,newtitle,newdes,userId){
    let photos= await loadPhoto()
    let photo=null

    for(let i=0;i<photos.length;i++){
        if(photos[i].id===photoId){
            photo=photos[i]
            break
        }
    }
    if(!photo){
        return null
    }
    if(photo.owner!==userId){
        return "unauthorized"
        
    }
    if(newtitle && newtitle.trim()!== ""){
        photo.title=newtitle
    }
    if(newdes && newdes.trim()!== ""){
        photo.description=newdes
    }
    await savePhoto(photos)
    return photo
}

/**
 * To create a CSV file about the album details
 * @async
 * @param {string} albumName - Name of the album.
 * @returns {Promise<{album: Object, photos: Object[]} | null>} Object containing album and its photos, or null if album not found.
*/
async function getByAlbum(albumName){
    let album= await findAlbumbyName(albumName)
    let photos = await loadPhoto()
    let albumPhotos=[]

    if(!album){
        return null
    }

    for(let i=0;i<photos.length;i++){
        let present=false
        for(let j=0;j<photos[i].albums.length;j++){
            if(photos[i].albums[j]===album.id){
                present = true
                break
            }
        }
        if(present){
            albumPhotos.push(photos[i])
        }
    }
    return {album, photos: albumPhotos}

}

/**
 * To add tags to a photo
 * @async
 * @param {number} photoId - ID of the photo.
 * @param {string} newTag - Tag to add.
 * @param {number} userId - ID of the user adding the tag.
 * @returns {Promise<Object|string|null>} Updated photo object, "duplicate" if tag exists, "unauthorized" if not owned, or null if not found.
*/
async function addTag(photoId,newTag,userId) {
    let photos= await loadPhoto()
    let photo=null

    for(let i=0;i<photos.length;i++){
        if(photos[i].id===photoId){
            photo=photos[i]
            break
        }
    }
    if(!photo){
        return null
    }
    let duplicate = false
    for (let i = 0; i < photo.tags.length; i++) {
        if (photo.tags[i] === newTag) {
            duplicate = true
            break
        }
    }
    if(duplicate){
        return "duplicate"
    }
    if(photo.owner!==userId){
        return "unauthorized"
    }
    photo.tags.push(newTag)
    await savePhoto(photos)
    return photo
    
}

module.exports={
    login,
    getPhoto,
    getAlbum,
    updatePhoto,
    getByAlbum,
    addTag
}