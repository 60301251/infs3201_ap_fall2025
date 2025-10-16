/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 3
*/

const{
    loadPhoto,
    loadAlbum,
    savePhoto,
    saveAlbum,
    findPhoto,
    findAlbum,
    findAlbumbyName,
    updatePhoto : updatePhotoDB
} = require('./persistance_layer')

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
 * To update details of photo using photoId
 * @async
 * @param {number} photoId - ID of the photo to update.
 * @param {string} newtitle - New title (optional).
 * @param {string} newdes - New description (optional).
 * @returns {Promise<Object|null>} Updated photo object, or null if not found.
*/
async function updatePhoto(photoId,newtitle,newdes){
    const update={}

    if(newtitle && newtitle.trim()!== ""){
        update.title=newtitle.trim()
    }
    if(newdes && newdes.trim()!== ""){
        update.description=newdes.trim()
    }
    if(Object.keys(update).length === 0){
        return null
    }
    const updatedPhoto= await updatePhotoDB(photoId,update)

    if(!updatedPhoto){
        return null
    }
    return updatedPhoto
}

/**
 * To create a CSV file about the album details
 * @async
 * @param {string} albumName - Name of the album.
 * @returns {Promise<{album: Object, photos: Object[]} | null>} Object containing album and its photos, or null if album not found.
*/
async function getByAlbum(albumName){
    const album= await findAlbumbyName(albumName)
    let photos = await loadPhoto()
    let albumPhotos=[]

    if(!album){
        return null
    }

    for(let i=0;i<photos.length;i++){
        let present=false
        for(let j=0;j<(photos[i].albums ||[]).length;j++){
            if(photos[i].albums[j]===album.albumId){
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

module.exports={
    getPhoto,
    getAlbum,
    updatePhoto,
    getByAlbum,
    addTag
}