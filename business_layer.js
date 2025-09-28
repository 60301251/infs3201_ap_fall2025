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
async fuction getPhoto(photoID){
    return await findPhoto(photoID)
}

