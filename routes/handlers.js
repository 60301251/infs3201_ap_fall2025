/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 3
*/

const express= require('express')
const router=express.Router()
const{
    getPhoto,
    getAlbum,
    updatePhoto,
    getByAlbum,
    addTag
}= require('../business_layer')

router.get('/', async(req,res)=>{
    const albums=await require('../persistance_layer').loadAlbum()
    res.render('index' , {albums, layout: undefined})
})

router.get('/album/:id', async(req,res)=>{
    const album= await getAlbum(Number(req.params.id))
    if(!album){
        return res.send("Album not found")
    }

    const result=await getByAlbum(album.name)
    res.render('album',{album, photos:result.photos,photoCount:result.photos.length,layout:undefined})
})