/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 3
*/


const express= require('express')
const path=require('path')
const handlebars= require('express-handlebars')
const bodyParser=require('body-parser')
const routes= require('./routes/handlers')

const app=express()
const PORT=3000

app.use(bodyParser.urlencoded({extended: true}))
app.use('/photos', express.static(path.join(__dirname,'photos')))
app.use('/public', express.static(path.join(__dirname,'public')))

app.engine('handlebars',handlebars.engine({layoutsDir: undefined}))
app.set('view engine','handlebars')
app.set('views',path.join(__dirname,'templates'))

app.use('/',routes)

app.listen(PORT, () => console.log(`Server running at http://localhost:3000`))
