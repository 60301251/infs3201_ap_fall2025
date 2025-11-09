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
const business=  require('../business_layer')
const persistance= require('../persistance_layer')

function requireLogin(req, res, next) {
    if (!req.user) return res.redirect('/login')
    next()
}

/**
 * @route GET /
 * @description Renders the homepage showing a list of all albums.
 * @async
 * @function
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<void>} Renders the 'index' template with album data.
 */

router.get('/', requireLogin, async (req, res) => {
    const albums = await persistance.loadAlbum()
    res.render('index', { albums, user: req.user, layout: undefined })
})


/**
 * @route GET /login
 * @description Renders the login page where existing users can authenticate.
 * @function
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 * @returns {void} Renders the 'login' template.
 */
router.get('/login', (req, res) => {
    if (req.user) return res.redirect('/')
    res.render('login')  
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
    const result= await business.login(email,password)

    if(!result){
        return res.render('error', {message: "Invalid email or password", layout:undefined})

    }
    const{sessionId}= result

    res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 24*60*60*1000 })
    res.redirect('/')
})

router.get('/logout', async (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) await business.logout(sessionId)
    res.clearCookie('sessionId')
    res.redirect('/login')
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
router.get('/album/:id', requireLogin, async (req, res) => {
    const albumId = Number(req.params.id)
    const album = await business.getAlbum(albumId)

    if (!album) {
        return res.render('error', { message: "Album not found", layout: undefined })
    }

    const result = await business.getByAlbum(album.name, req.user.email)

    if (!result) {
        return res.render('album', { album, photos: [], user: req.user, layout: undefined })
    }

    return res.render('album', { 
        album: result.album, 
        photos: result.photos, 
        user: req.user,
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

router.get('/photo/:id', async (req, res) => {
    const photo = await business.getPhoto(Number(req.params.id));
    if (!photo) {
        return res.render('error', { message: "Photo not found" })}

    if (photo.visibility === 'private' && (!req.user || req.user.id !== photo.ownerId)) {
        return res.render('error', { message: "This photo is private" })
    }

    const comments = await business.listPhotoComments(photo.id)
    res.render('photo', { photo, comments, user: req.user })
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
    const photo = await business.getPhoto(Number(req.params.id))

    if (!req.user || photo.ownerId !== req.user.id) {
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
router.post("/photo/:id/edit", async (req, res) => {
  try {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");

    const { id } = req.params;
    const { title, description, visibility } = req.body;

    const updatedPhoto = await persistence.updatePhoto(
      id,
      title,
      description,
      visibility,
      user.id 
    );

    if (!updatedPhoto) {
      return res.render("error", { message: "Failed to update photo" });
    }

    res.redirect("/myphotos");
  } catch (error) {
    console.error("Error updating photo:", error);
    res.render("error", { message: "An error occurred while updating the photo" });
  }
});

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
    const result = await business.addTag(Number(req.params.id), tag)

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
  if (!req.user) {
    return res.render('error', { 
      message: "Please log in to comment.", 
      layout: undefined 
    })
  }

  const photo = await business.getPhoto(Number(req.params.id))
  if (photo.visibility === "private" && photo.ownerId !== req.user.id) {
    return res.render('error', { 
      message: "You can only comment on your own private photos.", 
      layout: undefined 
    })
  }

  const result = await business.addPhotoComment(Number(req.params.id), req.user, req.body.comment)
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
    const result= await business.signup(name, email,password)

    if(result==='exists'){
        return res.render('error', {message:"email already registered", layout:undefined})
    }
    res.redirect('/login')
})



/**
 * @exports router
 * @description Exports the Express router handling all photo and album routes.
 */
module.exports=router
