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
const path=require('path')
const handlebars= require('express-handlebars')
const bodyParser=require('body-parser')
const routes= require('./routes/handlers')
const cookieParser= require('cookie-parser')
const business=require('./business_layer')

const app=express()
const PORT=8000

/**
 * Initializes Express session middleware.
 * Enables user login sessions using cookies.
 * 
 * @property {string} secret - Key for signing session ID cookies.
 * @property {boolean} resave - Prevents saving unchanged sessions.
 * @property {boolean} saveUninitialized - Avoids saving empty sessions.
 */
app.use(bodyParser.urlencoded({extended: true}))
app.use('/photos', express.static(path.join(__dirname,'photos')))
app.use('/public', express.static(path.join(__dirname,'public')))

/**
 * Create Handlebars instance with custom helpers
 * @type {import('express-handlebars').CreateOptions}
 */
const hbs = handlebars.create({
  helpers: {
    eq: function (a, b) {
      return a === b;
    }
  },
  layoutsDir: undefined
});

/**
 * Set Handlebars as the view engine
 */
app.engine('handlebars',handlebars.engine({layoutsDir: undefined}))
app.set('view engine','handlebars')
app.set('views',path.join(__dirname,'templates'))

/**
 * Middleware to attach the logged-in user to the request object based on a session ID cookie.
 * 
 * Checks if `req.cookies.sessionId` exists, and if so, fetches the corresponding user
 * from the business layer. The user object is then attached to `req.user`.
 * 
 * If no session ID is present or the user is not found, `req.user` is set to `null`.
 * 
 * @async
 * @function
 * @param {express.Request} req - The Express request object. May include cookies.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The next middleware function in the chain.
 * @returns {Promise<void>} Calls `next()` after attaching `req.user`.
 */
app.use(async (req, res, next) => {
    const sessionId = req.cookies && req.cookies.sessionId;

    if (!sessionId) {
        req.user = null;
        return next();
    }

    const user = await business.getUserBySession(sessionId);
    req.user = user || null;

    next();
});

/**
 * Route handler setup
 * @param {express.Router} routes - Imported route handlers
 */
app.use('/',routes)

/**
 * Starts the server on defined PORT
 * @function
 * @returns {void} Logs message when server starts
 */
app.listen(PORT, () => console.log(`Server running at http://localhost:8000`))
