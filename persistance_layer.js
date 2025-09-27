/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 2
*/

const { isUtf8 } = require('buffer')
const { readFile } = require('fs')
const fs=require('fs/promises')

async function loadPhoto(){
    let data=await fs.readFile("photos.json","Utf8")
    return JSON.parse(data)
}

async function savePhoto(photoList){
    await fs.writeFile("photos.json", JSON.stringify(photoList,null,2))
}
async function loadAlbum(){
    let data=await fs.readFile("albums.json","Utf8")
    return JSON.parse(data)
}

async function saveAlbum(albumList){
    await fs.writeFile("albums.json", JSON.stringify(albumList,null,2))
}

//Find a photo using photoID
async function findPhoto(photoId){
    let photos = await loadPhoto()
    let albums = await loadAlbum()

    for(let i=0;i<photos.length;i++){
        if(photos[i].id==photoId){
            return photos[i]
        }
    }
    return null
}

//Find an album using albumID
async function findAlbum(albumId){
    let albums = await loadAlbum()

    for(let i=0;i<albums.length;i++){
        if(albums[i].id==albumId){
            return albums[i]
        }
    }
    return null
}
