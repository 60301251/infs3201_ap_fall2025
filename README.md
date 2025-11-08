INFS3201-WEB TECH 2- Project

TEAM MEMBERS:
1)Eva Paul_60301251
2)Mufeeda Kalam_60303289
3)Aysha Sultana_60099830

PROJECT DESCRIPTION:
This project is a photo media management system build for our final project for INFS3201-Web Technology.

PHASE 1- Implements User Registrantion and  Authentication, Photo Visibility, Comments for each photos

MONGODB LINK:
mongodb+srv://60301251:<db_password>@cluster0.j7qvb.mongodb.net/

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

SECURITY AND DATA HANDLING:
* Passwords hashed using PBKDF2 + salt
* No plaintext password storage
* Custom cookie-based session system (no express-session)
* No external libraries beyond course scope
