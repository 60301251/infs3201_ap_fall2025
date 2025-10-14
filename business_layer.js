/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 3
*/

const{
    loadPhoto,
    loadAlbum,
    findPhoto,
    findAlbum,
    findAlbumbyName,
} = require('./persistance_layer')

/**
 * To getPhoto using userId
 *  @async
 * @param {number} photoId - The ID of the photo.
 * @returns {Promise<Object|null>} Photo object if allowed, or null if not found.
*/
async function getPhoto(photoId){
    return await findPhoto(photoId)
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
 * @returns {Promise<Object|string|null>} Updated photo object, "unauthorized" if access denied, or null if not found.
*/
async function updatePhoto(photoId,newtitle,newdes){
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
 * @returns {Promise<Object|string|null>} Updated photo object, "duplicate" if tag exists, "unauthorized" if not owned, or null if not found.
*/
async function addTag(photoId,newTag) {
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
    photo.tags.push(newTag)
    await savePhoto(photos)
    return photo
    
}

module.exports={
    getPhoto,
    getAlbum,
    updatePhoto,
    getByAlbum,
    addTag
}