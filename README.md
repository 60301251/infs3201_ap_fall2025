INFS3201-WEB TECH 2- Project

TEAM MEMBERS:

1)Eva Paul_60301251

2)Mufeeda Kalam_60303289

3)Aysha Sultana_60099830

PROJECT DESCRIPTION:
This project is a photo media management system build for our final project for INFS3201-Web Technology.

PHASE 1- Implements User Registrantion and  Authentication, Photo Visibility, Comments for each photos

MONGODB LINK:

mongodb+srv://60301251:12class34@cluster0.j7qvb.mongodb.net/

Account:60301251@udst.edu.qa

Password:12class34

RUN THE APPLICATION:
1) npm install
2) node web.js
3) http://localhost:8000

HOW TO TEST:
* Start server
* Visit /signup → create account
* Login
* Browse albums and photos
* Confirm:
    -Public photos visible to all users
  
    -Private photos visible only to owner
  
    -Edit only works on your photos
  
    -Comments only by logged-in users

    -Upload photos by logged in users only

    -Send email notifications to owner of photos when other users comments 

    -Search photos
  

INSTRUCTIONS TO USE:
* Open server using node web.js in your vscode terminal 
* If shows modules not found use npm install
* Open the server
* Login to "mufeeda@gmail.com", with password "abcd"
* This user is the owner for the photos and can access/edit all the photos in the album
* The edit visibility and photo should be only accessible only from this account
* In album beach vacations, sunny beach is private and can be only accessed through this account
* When uploading a photo the file must be selected and click on upload button after selecting the photo then you will be able to see the uploaded photo in the albums
* Under each photos all logged in users will be able to post comments
* The email notification when a user posts a comment will be send to the owner of the photo
* The search button on the index page will allow you to search for the photos using their name

FURTHER INSTRUCTIONS IF NEEDED:
* You could use the account "eva@gmail.com" with password "1234"
* This can be used to see and use the upload function and make sure the uploaded photos are private visibility
 
SECURITY AND DATA HANDLING:
* Passwords hashed using PBKDF2 + salt
* No plaintext password storage
* Custom cookie-based session system (no express-session)
* No external libraries beyond course scope

PROJECT FILE STRUCTURE:
/business_layer.js
/persistance_layer.js
/routes/handlers.js
/templates/*.handlebars
/public/styles/css/*
/web.js
/photos/