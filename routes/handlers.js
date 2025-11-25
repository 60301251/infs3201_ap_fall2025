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
const fileUpload = require('express-fileupload')
const persistance = require('../persistance_layer')
const { getUserBySession } = require('../business_layer')


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
async function requireLogin(req, res, next) {

  const sessionId = req.cookies?.sessionId
  if (!sessionId) {
    return res.redirect('/login')}
  const user = await getUserBySession(sessionId)
  if (!user){
     return res.redirect('/login')}
  req.user = { id: Number(user.id), name: user.name, email: user.email }
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
 * Renders the homepage displaying all available albums for the logged-in user.
 *
 * @route GET /
 * @async
 * @param {express.Request} req - Contains authenticated user information.
 * @param {express.Response} res - Renders the homepage or an error page.
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
 * Renders the login page for existing users.
 * If a valid session already exists, the user is redirected to the homepage.
 *
 * @route GET /login
 * @param {express.Request} req - Includes potential session cookies.
 * @param {express.Response} res - Renders the login view or redirects.
 * @returns {void}
 */
router.get('/login', async (req, res) => {

  const sessionId = req.cookies?.sessionId
  if (sessionId) {
    const user = await getUserBySession(sessionId)
    if (user) {
      return res.redirect('/')
    }
  }
  res.render('login')
})


/**
 * Handles user login: validates input, authenticates the user,
 * creates a session, sets a session cookie, and redirects to home.
 *
 * @route POST /login
 * @async
 * @param {Object} req - Express request object containing email and password.
 * @param {Object} res - Express response object used to render views or redirect.
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
    const { sessionId, user } = result
    res.cookie('sessionId', sessionId, { httpOnly: true,sameSite:'lax', maxAge: 24 * 60 * 60 * 1000 })
    res.redirect('/')
  } 
  catch {
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
 * Loads a photo owned by the logged-in user and renders the edit form.
 * Ensures that only the owner of the photo can access the edit page.
 *
 * @route GET /photo/:id/edit
 * @async
 * @param {express.Request} req - Request containing the photo ID and user session.
 * @param {express.Response} res - Response used to render the edit page.
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
 * Processes the photo edit form and updates the photo’s details.
 * Only the photo owner can modify the title, description, or visibility.
 * Redirects back to the photo page on success or shows an error page on failure.
 *
 * @route POST /photo/:id/edit
 * @async
 * @param {express.Request} req - Express request containing form data and user info.
 * @param {express.Response} res - Express response used to render errors or redirect.
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
 * Adds a new tag to a specific photo.
 * Only the photo owner can add tags, and empty or duplicate tags are rejected.
 *
 * @route POST /photo/:id/tag
 * @async
 * @param {express.Request} req - Contains the tag in the request body.
 * @param {express.Response} res - Used to render errors or redirect.
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
 * Adds a new tag to a specific photo.
 * Only the photo owner can add tags, and empty or duplicate tags are rejected.
 *
 * @route POST /photo/:id/tag
 * @async
 * @param {express.Request} req - Contains the tag in the request body.
 * @param {express.Response} res - Used to render errors or redirect.
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

    const added = await business.addPhotoComment(photo.id, req.user, text)
    if (!added) {
      return res.render('error', { message: "Failed to add comment.", layout: undefined })
    }

    res.redirect(`/photo/${photo.id}`)
  } catch (err) {
    console.error("Error in POST /photo/:id/comment:", err)
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
    if (!album) return res.render('error', { message: "Album not found", layout: undefined })

    try {
        const photos = await business.getPhotosByAlbum(albumId, req.user.email)
        res.render('album_gallery', { album, photos, user: req.user, layout: undefined })
    } catch (err) {
        console.error('Error loading photos:', err)
        res.render('error', { message: "Failed to load album.", layout: undefined })
    }
})

/**
 * Performs a search across public photos by title, description, or tags
 * and displays the matching results in a grid.
 *
 * @route GET /search
 * @async
 * @param {express.Request} req - Contains the search query in req.query.q.
 * @param {express.Response} res - Renders the search results or an error page.
 */

router.get('/search', requireLogin, async (req, res) => {
  const raw = req.query.q || ''
  const searchTerm = String(raw).trim()

  try {
    const photos = await business.searchPhotos(searchTerm)
    res.render('search', {
      photos: photos,
      searchTerm: searchTerm,
      user: req.user,
      layout: undefined
    })
  } catch {
    res.render('error', { message: "Search failed.", layout: undefined })
  }
})


/**
 * Renders the signup page where new users can create an account.
 *
 * @route GET /signup
 * @param {express.Request} req - Incoming request.
 * @param {express.Response} res - Used to render the signup view.
 */

router.get('/signup', (req, res) => {
  res.render('signup', { layout: undefined })
})

/**
 * Processes user registration by validating input and creating a new account.
 * Rejects missing fields and prevents signup with an already-registered email.
 *
 * @route POST /signup
 * @async
 * @param {express.Request} req - Contains user details (name, email, password).
 * @param {express.Response} res - Renders errors or redirects to the login page.
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

/**
 * GET /album/:name
 * 
 * Renders the gallery page for a specific album.
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Route parameters.
 * @param {string} req.params.name - The name of the album to display.
 * @param {Object} req.session - Session object containing user information.
 * @param {string} req.session.userEmail - The email of the current user.
 * @param {Object} res - Express response object.
 *
 * @returns {void} Renders 'album_gallery' view with album photos if found,
 *   otherwise renders 'error' view with a not found message.
 */
router.get('/album/name/:name', async (req, res) => {
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


/**
 * Displays the gallery view for a specific album.
 * Validates the album ID, checks that the album exists, and then
 * loads all photos visible to the logged-in user before rendering the gallery.
 *
 * @route GET /album/:id/gallery
 * @async
 * @param {express.Request} req - Contains the album ID and authenticated user info.
 * @param {express.Response} res - Renders the album gallery or an error page.
 * @returns {Promise<void>}
 */

router.get('/album/:id/gallery', requireLogin, async (req, res) => {
    const albumId = Number(req.params.id)

    if (isNaN(albumId)) {
        return res.render('error', { 
            message: "Invalid album ID.",
            layout: undefined
        })
    }

    try {
        const album = await business.getAlbum(albumId)

        if (!album) {
            return res.render('error', { 
                message: "Album not found.",
                layout: undefined
            })
        }

        const photos = await business.getByAlbum(album.name, req.session.userId)

        res.render('album_gallery', {
            album: photos?.album || album,
            photos: photos?.photos || [],
            user: req.user,
            layout: undefined
        })

    } catch (err) {
        console.error("Error loading album gallery:", err)

        return res.render('error', { 
            message: "Failed to load album gallery.",
            layout: undefined
        })
    }
})


/**
 * Renders the photo upload page for a specific album.
 * Ensures the album ID is valid and the album exists before showing the form.
 *
 * @route GET /album/:albumId/upload
 * @async
 * @param {express.Request} req - Contains the album ID and authenticated user info.
 * @param {express.Response} res - Renders the upload page or an error page.
 * @returns {Promise<void>}
 */
router.get('/album/:albumId/upload', requireLogin, async (req, res) => {
    const albumId = Number(req.params.albumId);
    const album = await persistance.findAlbum(albumId);
    if (!album) return res.render('error', { message: 'Album not found' });

    res.render('upload', { album });
})



/**
 * Handles uploading a new photo to a specific album.
 * Validates the user session, checks for an uploaded file, and then
 * sends the photo data to the business layer for saving. Redirects
 * back to the album page on success or displays an error on failure.
 *
 * @route POST /:albumId/upload
 * @async
 * @param {express.Request} req - Contains the uploaded file, album ID, and form fields.
 * @param {express.Response} res - Used to render error pages or redirect after upload.
 * @returns {Promise<void>}
 */

router.post('/album/:albumId/upload', requireLogin, async (req, res) => {
    const albumId = Number(req.params.albumId);

    if (!req.files || !req.files.photo) {
        return res.render('error', { message: 'No file uploaded' });
    }

    try {
        const photoId = await business.uploadPhoto(
            req.user.id,
            albumId,
            req.files.photo,
            {
                title: req.body.title,
                description: req.body.description,
                visibility: req.body.visibility
            }
        );
        res.redirect(`/album/${albumId}`);
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'Photo upload failed: ' + err.message });
            }
});
/**
 * @exports router
 * @description Exports the Express router handling all photo and album routes.
 */
module.exports = router