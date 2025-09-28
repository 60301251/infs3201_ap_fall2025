/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 2
*/

const{
    loadPhoto,
    loadAlbum,
    savePhoto,
    saveAlbum,
    findPhoto,
    findAlbum,
    findAlbumbyName,
} = require('./persistance_layer')

//Get photo details by ID
async function getPhoto(photoId){
    return await findPhoto(photoId)
}

//Get Album details by ID
async function getAlbum(albumId){
    return await findAlbum(albumId)
}

//To update details of photo using photoId
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

//To create a CSV file about the album details
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

//To add tags to a photo
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