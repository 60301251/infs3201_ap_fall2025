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
    addTag,
    addPhotoComment,
    listPhotoComments
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

    const currentUserEmail = req.session?.user?.email || null
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

     const currentUser = req.session.user

    if (photo.visibility === "private" && (!currentUser || photo.ownerId !== currentUser.id)) {
        return res.render('error', { 
            message: "This photo is private and cannot be viewed.", 
            layout: undefined 
        })
    }
    
    const comments = await listPhotoComments(Number(req.params.id))
    res.render('photo', { photo, comments, layout: undefined })
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

    if (!req.session.user || photo.ownerId !== req.session.user.id) {
        return res.render('error', { 
            message: "You can only edit your own photos.", 
            layout: undefined 
        })
    }

    let visibilityOptions = [
        {value: "public", selected: photo.visibility === "public" ? "selected" : ""},
        {value: "private", selected: photo.visibility === "private" ? "selected" : ""}
    ]

    res.render('edit', { photo, visibilityOptions, layout: undefined })
})

/**
 * @route POST /photo/:id/edit
 * @description Handles updating a photo’s title, description, and visibility.
 * @async
 * @function
 * @param {express.Request} req - Express request object containing updated fields in the body.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Redirects to the photo page if successful, otherwise renders an error page.
 */
router.post('/photo/:id/edit', async (req, res) => {
    const { title, description,visibility,ownerId } = req.body
    const photo = await getPhoto(Number(req.params.id));

    if (!photo) {
        return res.render('error', { message: "Photo not found", layout: undefined });
    }

    if (photo.ownerId != ownerId) {
        return res.render('error', { message: "You are not allowed to edit this photo", layout: undefined });
    }

    const updated = await updatePhoto(Number(req.params.id), title, description,visibility)
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

/* COMMENTS */

/**
 * @route POST /photo/:id/comment
 * @description Adds a new comment to a photo, ensuring the user is logged in and authorized.
 * @async
 * @function
 * @param {express.Request} req - Express request object containing comment text in body and user session info.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Redirects to photo page after adding the comment, or shows an error if unauthorized or invalid.
 */
router.post('/photo/:id/comment', async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.render('error', { 
      message: "Please log in to comment.", 
      layout: undefined 
    })
  }

  const photo = await getPhoto(Number(req.params.id))
  // Allow commenting only if the photo is public or owned by the user
  if (photo.visibility === "private" && photo.ownerId !== req.session.user.id) {
    return res.render('error', { 
      message: "You can only comment on your own private photos.", 
      layout: undefined 
    })
  }

  const result = await addPhotoComment(Number(req.params.id), req.session.user, req.body.comment)
  if (!result) {
    return res.render('error', { 
      message: "Failed to add comment (make sure text is not empty).", 
      layout: undefined 
    })
  }

  res.redirect(`/photo/${req.params.id}`)
})

/**
 * @route GET /signup
 * @description Renders the signup page where a new user can register.
 * @function
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 * @returns {void} Renders the 'signup' template.
 */
router.get('/signup', (req,res)=>{
    res.render('signup',{layout: undefined})
})

/**
 * @route POST /signup
 * @description Handles new user registration. Validates fields and prevents duplicate email registration.
 * @async
 * @function
 * @param {express.Request} req - Express request object containing name, email, and password in body.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Redirects to login page if successful or renders an error page on failure.
 */
router.post('/signup', async(req,res)=>{
    const{name, email, password}= req.body
    if (!name || !email || !password) {
        return res.render('error', { message: "All fields are required", layout: undefined })
    }
    const result= await signup(name, email,password)

    if(result==='exists'){
        return res.render('error', {message:"email already registered", layout:undefined})
    }
    res.redirect('/login')
})

/**
 * @route GET /login
 * @description Renders the login page where existing users can authenticate.
 * @function
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 * @returns {void} Renders the 'login' template.
 */
router.get('/login', (req,res)=>{
    res.render('login',{layout: undefined})
})


/**
 * @route POST /login
 * @description Handles user login. Validates email and password, and displays welcome message or error.
 * @async
 * @function
 * @param {express.Request} req - Express request object containing email and password in body.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Sends a welcome message with link to albums or renders an error page on failure.
 */
router.post('/login',async (req,res)=>{
    const{email,password}= req.body
     if (!email || !password) {
        return res.render('error', { message: "All fields are required", layout: undefined })
    }
    const user= await login(email,password)

    if(!user){
        return res.render('error', {message: "Invalid email or password", layout:undefined})

    }
    req.session.user = user
    res.send(`Welcome,${user.name}!<a href='/'>Go to albums</a>`)
})
/**
 * @exports router
 * @description Exports the Express router handling all photo and album routes.
 */
module.exports=router
