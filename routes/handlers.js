/**
* Group 001
* Name and Student ID:Eva Paul_60301251
*                      Mufeeda Kalam_60303289
*                     Aysha Sultana_60099830
* 
* INFS3201-5/6- Web Tech 2 
* Project Phase 2
*/

const express = require('express')
const router = express.Router()
const business = require('../business_layer')
const persistance = require('../persistance_layer')

/**
 * Middleware to ensure the user is logged in.
 *
 * Redirects to /login if no authenticated user is found.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
function requireLogin(req, res, next) {
  if (!req.user) return res.redirect('/login')
  next()
}

/**
 * @function getId
 * @description Safely extracts a numeric ID from request parameters.
 * @param {express.Request} req - The Express request object.
 * @returns {(number|null)} The numeric ID if valid, otherwise null.
 */
function getId(req) {
  const id = Number(req.params.id)
  return Number.isFinite(id) ? id : null
}

/**
 * @route GET /
 * @description Renders the homepage showing a list of all albums.
 * @async
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/', requireLogin, async (req, res) => {
  try {
    const albums = await persistance.loadAlbum()
    res.render('index', { albums, user: req.user, layout: undefined })
  } catch (e) {
    res.render('error', { message: "Failed to load albums.", layout: undefined })
  }
})

/**
 * @route GET /login
 * @description Renders the login page where existing users can authenticate.
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {void}
 */
router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/')
  res.render('login')
})

/**
 * @route POST /login
 * @description Handles user login. Validates email and password, then sets a session cookie.
 * @async
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim()
  const password = (req.body.password || '').trim()

  if (!email || !password) {
    return res.render('error', { message: "All fields are required", layout: undefined })
  }
  try {
    const result = await business.login(email, password)
    if (!result) {
      return res.render('error', { message: "Invalid email or password", layout: undefined })
    }
    const { sessionId } = result
    res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
    res.redirect('/')
  } catch {
    res.render('error', { message: "Login failed.", layout: undefined })
  }
})

/**
 * Log out the current user by clearing session and redirecting to login.
 *
 * @route GET /logout
 * @param {Request} req - Express request containing session cookie.
 * @param {Response} res - Express response to clear cookie and redirect.
 * @returns {void}
 */
router.get('/logout', async (req, res) => {
  const sessionId = req.cookies?.sessionId
  try {
    if (sessionId) await business.logout(sessionId)
  } finally {
    res.clearCookie('sessionId')
    res.redirect('/login')
  }
})

/**
 * @route GET /photo/:id
 * @description Displays information about a specific photo and its comments.
 * @async
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/photo/:id', requireLogin, async (req, res) => {
  const photoId = getId(req)
  if (photoId === null) {
    return res.render('error', { message: "Invalid photo ID.", layout: undefined })
  }

  try {
    const photo = await business.getPhoto(photoId)
    if (!photo) {
      return res.render('error', { message: "Photo not found", layout: undefined })
    }

    if (
      photo.visibility === 'private' &&
      (!req.user || Number(req.user.id) !== Number(photo.ownerId))
    ) {
      return res.render('error', { message: "This photo is private", layout: undefined })
    }

    const comments = await business.listPhotoComments(photo.id)
    res.render('photo', { photo, comments, user: req.user, layout: undefined })
  } catch {
    res.render('error', { message: "Failed to load photo.", layout: undefined })
  }
})


/**
 * @route GET /photo/:id/edit
 * @description Renders an edit form for a specific photo.
 * @async
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.get('/photo/:id/edit', requireLogin, async (req, res) => {
  const photoId = getId(req)
  if (photoId === null) {
    return res.render('error', { message: "Invalid photo ID.", layout: undefined })
  }

  try {
    const photo = await business.getPhoto(photoId)
    if (!photo || Number(photo.ownerId) !== Number(req.user.id)) {
    return res.render('error', { message: "You can only edit your own photos.", layout: undefined })
    }

    const visibilityOptions = [
      { value: "public", selected: photo.visibility === "public" ? "selected" : "" },
      { value: "private", selected: photo.visibility === "private" ? "selected" : "" }
    ]

    res.render('edit', { photo, visibilityOptions, layout: undefined })
  } catch {
    res.render('error', { message: "Failed to load edit form.", layout: undefined })
  }
})

/**
 * @route POST /photo/:id/edit
 * @description Updates a photo’s title, description, and visibility.
 * @async
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.post('/photo/:id/edit', requireLogin, async (req, res) => {
  const photoId = getId(req)
  if (photoId === null) {
    return res.render('error', { message: "Invalid photo ID.", layout: undefined })
  }

  try {
    const title = (req.body.title || '').trim()     
    const description = (req.body.description || '').trim()
    const visibility = (req.body.visibility || '').trim()

    const updatedPhoto = await business.updatePhoto(photoId, req.user.id, title, description, visibility)
    if (!updatedPhoto) {
      return res.render('error', { message: 'Failed to update photo', layout: undefined })
    }
    res.redirect(`/photo/${photoId}`)
  } catch (error) {
    console.error('Error updating photo:', error)
    res.render('error', { message: 'An error occurred while updating the photo', layout: undefined })
  }
})

/**
 * @route POST /photo/:id/tag
 * @description Add a tag to a photo. Only the owner can tag their photo. Empty tags are rejected.
 * @async
 * @param {express.Request} req - Contains { tag } in body and :id in params.
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.post('/photo/:id/tag', requireLogin, async (req, res) => {
  const photoId = getId(req)
  if (photoId === null) {
    return res.render('error', { message: "Invalid photo ID.", layout: undefined })
  }

  const raw = req.body.tag
  const tag = (raw || '').trim() 

  if (!tag) {
    return res.render('error', { message: "Tag cannot be empty.", layout: undefined })
  }

  try {
    const photo = await business.getPhoto(photoId)
    if (!photo) {
      return res.render('error', { message: "Photo not found.", layout: undefined })
    }

    if (Number(photo.ownerId) !== Number(req.user.id)) {
    return res.render('error', { message: "You can only tag your own photo.", layout: undefined })
    }

    const result = await business.addTag(photoId, tag)
    if (result === 'duplicate') {
      return res.render('error', { message: "Tag already exists.", layout: undefined })
    }
    if (!result) {
      return res.render('error', { message: "Failed to add tag.", layout: undefined })
    }

    res.redirect(`/photo/${photoId}`)
  } catch {
    res.render('error', { message: "Failed to add tag.", layout: undefined })
  }
})

/**
 * @route POST /photo/:id/comment
 * @description Adds a new comment to a photo, ensuring the user is logged in and authorized.
 * @async
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.post('/photo/:id/comment', requireLogin, async (req, res) => {
  const photoId = getId(req)
  if (photoId === null) {
    return res.render('error', { message: "Invalid photo ID.", layout: undefined })
  }

  const text = (req.body.comment || '').trim()
  if (!text) {
    return res.render('error', { message: "Comment cannot be empty.", layout: undefined })
  }

  try {
    const photo = await business.getPhoto(photoId)
    if (!photo) {
      return res.render('error', { message: "Photo not found.", layout: undefined })
    }
    
    if (photo.visibility === "private" && Number(photo.ownerId) !== Number(req.user.id)) {
    return res.render('error', { message: "You can only comment on your own private photos.", layout: undefined })
    }

    const ok = await business.addPhotoComment(photo.id, req.user, text)
    if (!ok) {
      return res.render('error', { message: "Failed to add comment.", layout: undefined })
    }

    res.redirect(`/photo/${photo.id}`)
  } catch {
    res.render('error', { message: "Failed to add comment.", layout: undefined })
  }
})

/**
 * Render a specific album and its photos.
 * 
 * @route GET /album/:id
 * @param {Request} req - Express request with album ID and user session.
 * @param {Response} res - Express response to render the album page.
 * @returns {void}
 */
router.get('/album/:id', requireLogin, async (req, res) => {
  const albumId = Number(req.params.id)

  if (isNaN(albumId)) {
    return res.render('error', { message: "Invalid album ID.", layout: undefined })
  }

  const album = await business.getAlbum(albumId)

  if (!album) {
    return res.render('error', { message: "Album not found", layout: undefined })
  }

  const result = await business.getByAlbum(album.name, req.user?.id)
  if (!result) {
       
        return res.render('album_gallery', { album, photos: [], user: req.user, layout: undefined })
    }

  
    res.render('album_gallery', { album: result.album, photos: result.photos, user: req.user, layout: undefined })
})

/**
 * @route GET /signup
 * @description Renders the signup page where a new user can register.
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {void}
 */
router.get('/signup', (req, res) => {
  res.render('signup', { layout: undefined })
})

/**
 * @route POST /signup
 * @description Handles new user registration. Validates fields and prevents duplicate email registration.
 * @async
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */
router.post('/signup', async (req, res) => {
  const name = (req.body.name || '').trim()
  const email = (req.body.email || '').trim()
  const password = (req.body.password || '').trim()

  if (!name || !email || !password) {
    return res.render('error', { message: "All fields are required", layout: undefined })
  }
  try {
    const result = await business.signup(name, email, password)
    if (result === 'exists') {
      return res.render('error', { message: "email already registered", layout: undefined })
    }
    res.redirect('/login')
  } catch {
    res.render('error', { message: "Signup failed.", layout: undefined })
  }
})

router.get('/album/:name', async (req, res) => {
    const albumName = req.params.name
    const album = await business.findAlbumbyName(albumName)

    if (!album) {
        return res.render('error', { message: "Album not found" })
    }

    const photos = await business.getPhotosByAlbum(album.id, req.session.userEmail)

    res.render('album_gallery', {
        albumName: album.name,
        photos: photos
    })
})
router.get('/album/:id/gallery', requireLogin, async (req, res) => {
    const albumId = Number(req.params.id)

    if (isNaN(albumId)) {
        return res.render('error', { message: "Invalid album ID.", layout: undefined })
    }
    try {
        const album = await business.getAlbum(albumId)
        if (!album) {
            return res.render('error', { message: "Album not found", layout: undefined })
        } 
        const photos = await business.getByAlbum(album.name, req.user?.id)
        res.render('album_gallery', {
            album: photos?.album || album,
            photos: photos?.photos || [],
            user: req.user,
            layout: undefined
        });

    } catch (error) {
        console.error("Error loading album gallery:", error);
        res.render('error', { message: "Failed to load album gallery.", layout: undefined })
    }
})



/**
 * @exports router
 * @description Exports the Express router handling all photo and album routes.
 */
module.exports = router