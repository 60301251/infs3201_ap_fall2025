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

//Validate login users
async function login(username,password){
    return await findUser(username,password) 
}


//To getPhoto using userId
async function getPhoto(photoId, userId){
    const photo=await findPhoto(photoId)
    if(!photo){
        return null
    }
    if(photo.owner!==userId){
        return "unauthorized" 
    }
    if(photo === "unauthorized"){
    console.log("You cannot access this photo.")
    return
}
    return photo

} 

//Get Album details by ID
async function getAlbum(albumId){
    return await findAlbum(albumId)
}

//To update details of photo using photoId
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