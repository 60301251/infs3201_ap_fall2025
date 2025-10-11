/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 3
*/

const fs=require('fs/promises')

/**
 * To load photos from the file
 * @async
 * @returns {Promise<Object[]>} Array of photo objects.
*/
async function loadPhoto(){
    let data=await fs.readFile("photos.json","utf8")
    return JSON.parse(data)
}

/**
 * To save photos back to the file
 * @async
 * @param {Object[]} photoList - Array of photo objects to save.
 * @returns {Promise<void>}
*/
async function savePhoto(photoList){
    await fs.writeFile("photos.json", JSON.stringify(photoList,null,2))
}
/**
 * To load albums from the file
 * @async
 * @returns {Promise<Object[]>} Array of album objects.
*/
async function loadAlbum(){
    let data=await fs.readFile("albums.json","utf8")
    return JSON.parse(data)
}
/**
 * To save albums back to the file
 * @async
 * @param {Object[]} albumList - Array of album objects to save.
 * @returns {Promise<void>}
*/
async function saveAlbum(albumList){
    await fs.writeFile("albums.json", JSON.stringify(albumList,null,2))
}

/**
 * Find a photo using photoID
 * @async
 * @param {number} photoId - ID of the photo.
 * @returns {Promise<Object|null>} Photo object if found, otherwise null.
*/
async function findPhoto(photoId){
    let photos = await loadPhoto()
    let albums = await loadAlbum()

    for(let i=0;i<photos.length;i++){
        if(Number(photos[i].id)==Number(photoId)){
            return photos[i]
        }
    }
    return null
}

/**
 * Find an album using albumID
 * @async
 * @param {number} albumId - ID of the album.
 * @returns {Promise<Object|null>} Album object if found, otherwise null.
*/
async function findAlbum(albumId){
    let albums = await loadAlbum()

    for(let i=0;i<albums.length;i++){
        if(albums[i].id==albumId){
            return albums[i]
        }
    }
    return null
}

/**
 * Find album using album name
 * @async
 * @param {string} albumName - Name of the album.
 * @returns {Promise<Object|null>} Album object if found, otherwise null.

*/
async function findAlbumbyName(albumName){
    let albums=await loadAlbum()
    for(let i=0;i<albums.length;i++){
        if(albums[i].name.toLowerCase()===albumName.toLowerCase()){
            return albums[i]
        }
    }
    return null     
} 

module.exports={
    loadPhoto,
    loadAlbum,
    savePhoto,
    saveAlbum,
    findPhoto,
    findAlbum,
    findAlbumbyName,
}
