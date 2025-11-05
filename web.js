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

const app=express()

/**
 * Initializes Express session middleware.
 * Enables user login sessions using cookies.
 * 
 * @property {string} secret - Key for signing session ID cookies.
 * @property {boolean} resave - Prevents saving unchanged sessions.
 * @property {boolean} saveUninitialized - Avoids saving empty sessions.
 */
const PORT=8000

app.use(bodyParser.urlencoded({extended: true}))
app.use('/photos', express.static(path.join(__dirname,'photos')))
app.use('/public', express.static(path.join(__dirname,'public')))


const hbs = handlebars.create({
  helpers: {
    eq: function (a, b) {
      return a === b;
    }
  },
  layoutsDir: undefined
});

app.engine('handlebars',handlebars.engine({layoutsDir: undefined}))
app.set('view engine','handlebars')
app.set('views',path.join(__dirname,'templates'))

app.use('/',routes)

/**
 * Starts the server on defined PORT
 * @function
 * @returns {void} Logs message when server starts
 */
app.listen(PORT, () => console.log(`Server running at http://localhost:8000`))
