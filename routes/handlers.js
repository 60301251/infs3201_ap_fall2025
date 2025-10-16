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
    const photoCount = result.photos.length
    const photoLabel = photoCount === 1 ? 'photo' : 'photos'

    res.render('album', {
        album,
        photos: result.photos,
        photoCount,
        photoLabel,
        layout: undefined
})
})

router.get('/photo/:id', async(req,res)=>{
    const photo = await getPhoto(Number(req.params.id))
    if (!photo) return res.send("Photo not found")

    res.render('photo', { photo, layout: undefined })
})

router.get('/photo/:id/edit', async (req, res) => {
    const photo = await getPhoto(Number(req.params.id))
    if (!photo) return res.send("Photo not found")

    res.render('edit', { photo, layout: undefined })
})

router.post('/photo/:id/edit', async (req, res) => {
    const { title, description } = req.body
    const updated = await updatePhoto(Number(req.params.id), title, description)
    if (!updated){
         return res.render('error', { 
        message: "Failed to update photo", 
        layout: undefined})
    } 

    res.redirect(`/photo/${req.params.id}`)
})

router.post('/photo/:id/tag', async (req, res) => {
    const { tag } = req.body
    const result = await addTag(Number(req.params.id), tag)

    if (result === 'duplicate') {
        return res.render('error', { 
            message: "Tag already exists.", 
            layout: undefined 
        })
    }
    if (!result) {
        return res.render('error', { 
            message: "Photo not found.", 
            layout: undefined 
        })
    }
    res.redirect(`/photo/${req.params.id}`)
})

module.exports=router