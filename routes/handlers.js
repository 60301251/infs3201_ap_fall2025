/**
* Group 001
* Name and Student ID:Eva Paul_60301251
*                      Mufeeda Kalam_60303289
*                     Aysha Sultana_60099830
* 
* INFS3201-5/6- Web Tech 2 
* Project Phase 1
*/

const express= require('express')
const router=express.Router()
const{
    signup,
    login,
    getPhoto,
    getAlbum,
    updatePhoto,
    getByAlbum,
    addTag
}= require('../business_layer')

/**
 * @route GET /
 * @description Renders the homepage showing a list of all albums.
 * @async
 * @function
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Renders the 'index' template with album data.
 */

router.get('/', async(req,res)=>{
    const albums=await require('../persistance_layer').loadAlbum()
    res.render('index' , {albums, layout: undefined})
})


/**
 * @route GET /album/:id
 * @description Displays details of a specific album and its photos.
 * @async
 * @function
 * @param {express.Request} req - Express request object, containing album ID in params.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Renders the 'album' template with album details and photos.
 */
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


/**
 * @route GET /photo/:id
 * @description Displays information about a specific photo.
 * @async
 * @function
 * @param {express.Request} req - Express request object, containing photo ID in params.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Renders the 'photo' template or sends an error message if not found.
 */

router.get('/photo/:id', async(req,res)=>{
    const photo = await getPhoto(Number(req.params.id))
    if (!photo) return res.send("Photo not found")

    res.render('photo', { photo, layout: undefined })
})

/**
 * @route GET /photo/:id/edit
 * @description Renders an edit form for a specific photo.
 * @async
 * @function
 * @param {express.Request} req - Express request object, containing photo ID in params.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Renders the 'edit' template or an error message if not found.
 */

router.get('/photo/:id/edit', async (req, res) => {
    const photo = await getPhoto(Number(req.params.id))
    if (!photo) return res.send("Photo not found")

    res.render('edit', { photo, layout: undefined })
})

/**
 * @route POST /photo/:id/edit
 * @description Handles updating a photo’s title and description.
 * @async
 * @function
 * @param {express.Request} req - Express request object containing updated fields in the body.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Redirects to photo page if successful, otherwise renders an error page.
 */
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

/**
 * @route POST /photo/:id/tag
 * @description Adds a new tag to the selected photo.
 * @async
 * @function
 * @param {express.Request} req - Express request object containing new tag in the body.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Redirects to photo page if successful, otherwise renders an error page.
 */

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

router.get('/signup', (req,res)=>{
    res.render('signup',{layout: undefined})
})

router.post('/signup', async(req,res)=>{
    const{name, email, password}= req.body
    if (!name || !email || !password) {
        return res.render('error', { message: "All fields are required", layout: undefined })
    }
    const result= await signup(name, email.password)

    if(result==='exists'){
        return res.render('error', {message:"email already registered", layout:undefined})
    }
    res.send("Signup Successful!<a href='/login'>Login</a>")
})
router.get('/login', (req,res)=>{
    res.render('login',{layout: undefined})
})

router.post('/login',async (req,res)=>{
    const{email,password}= req.body
    const user= await login(email,password)

    if(!user){
        return res.render('error', {message: "Invalid email or password", layout:undefined})

    }
    res.send(`Welcome,${user.name}!<a href='/'>Go to albums</a>`)
})
/**
 * @exports router
 * @description Exports the Express router handling all photo and album routes.
 */
module.exports=router