/**
* Group 001
* Name and Student ID:Eva Paul_60301251
*                      Mufeeda Kalam_60303289
*                     Aysha Sultana_60099830
* 
* INFS3201-5/6- Web Tech 2 
* Project Phase 1
*/

const{ MongoClient}=require('mongodb')
const mongodb= require('mongodb')
const crypto=require('crypto')

let client=null

async function connectDatabase(){
    if(!client){
        client=new MongoClient('mongodb+srv://60301251:12class34@cluster0.j7qvb.mongodb.net/')
        await client.connect()
    }
}

function hashPassword(password){
    if(!password || typeof password!=='string'){
        throw new Error("Password must be non-empty string")
    }
    const salt = crypto.randomBytes(16).toString('hex')
    const hash= crypto.pbkdf2Sync(password, salt, 1000, 64,'sha512').toString('hex')
    return {salt, hash}
}

function verifyPassword(password, salt,storedHash){
    if(!salt || !storedHash){
        return false
    }
    const hash= crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex')
    return hash == storedHash
}

async function loadAll(collectionName) {
    await connectDatabase()
    const db= client.db('INFS3201_fall2025')
    const collection= db.collection(collectionName)
    const docs= await collection.find({}).toArray()
    return docs
    
}

async function saveDoc(collectionName, doc) {
    await connectDatabase()
    const db= client.db('INFS3201_fall2025')
    const collection= db.collection(collectionName)
    await collection.insertOne(doc)
}
async function registerUser(name, email, password) {
    const users = await loadAll('users');
    for (let u of users) {
        if (u.email === email) {
            return 'exists'};
    }
    const {salt, hash}= hashPassword(password)
    const newUser = { id: users.length + 1, name, email, password: hash, salt: salt};
    await saveDoc('users', newUser);
    return newUser;
}

async function loginUser(email, password) {
    await connectDatabase()
    const db = client.db('INFS3201_fall2025')
    const users = db.collection('users')

    const user = await users.findOne({ email })
    if (!user) {
        return null
    }
    if (user.salt && verifyPassword(password, user.salt, user.password)) {
        return user
    }
    if (!user.salt && user.password === password) {
        const { salt, hash } = hashPassword(password)
        await users.updateOne(
            { _id: user._id },
            { $set: { password: hash, salt: salt } }
        )
        user.password = hash
        user.salt = salt
        return user
    }

    return null
}


/**
 * To load photos from the file
 * @async
 * @returns {Promise<Object[]>} Array of photo objects.
*/
async function loadPhoto(){
    await connectDatabase()
    let db=client.db('INFS3201_fall2025')
    let photocollection=db.collection('photos')
    let result= await photocollection.find()
    let resultData= await result.toArray()
    return resultData
}

/**
 * To save updated photo list to MongoDB
 * @async
 * @param {Object[]} photoList - Array of photo objects to save
 * @returns {Promise<void>}
 */
async function savePhoto(photoList) {
    await connectDatabase()
    const db = client.db('INFS3201_fall2025')
    const photos = db.collection('photos')

    for (let i=0;i<photoList[i];i++) {
        const photo = photoList[i]

        if (photo && !photo.visibility){
            photo.visibility = 'public'
        }

        if (photo.id) {
            await photos.updateOne(
                { id: photo.id },
                { $set: photo },
                { upsert: true }
            )
        }
    }
}
    
/**
 * To load albums from the file
 * @async
 * @returns {Promise<Object[]>} Array of album objects.
*/
async function loadAlbum(){
    await connectDatabase()
    let db=client.db('INFS3201_fall2025')
    let albumcollection=db.collection('albums')
    let result= await albumcollection.find()
    let resultData= await result.toArray()
    return resultData
}

/**
 * To save albums back to MongoDB
 * @async
 * @param {Object[]} albumList - Array of album objects
 * @returns {Promise<void>}
 */
async function saveAlbum(albumList) {
    await connectDatabase()
    let db=client.db('INFS3201_fall2025')
    let albumcollection=db.collection('albums')
    await albumcollection.deleteMany({})
      if(albumList.length>0){
         await albumcollection.insertMany(albumList)
    }
}

async function findUserByEmail(email) {
    const users= await loadAll('users')
    for(let i=0; i<users.length;i++){
        if(users[i].email===email){
            return users[i]
        }
    }
    return null
    
}
/**
 * Find a photo using photoID
 * @async
 * @param {number} photoId - ID of the photo.
 * @returns {Promise<Object|null>} Photo object if found, otherwise null.
*/
async function findPhoto(id){
 await connectDatabase()
    const db = client.db('INFS3201_fall2025')
    const photos = db.collection('photos')
    const photo = await photos.findOne({ id: Number(id) }) || null

    if (photo && !photo.visibility){
            photo.visibility = 'public'
    }
    return photo
}

/**
 * Find an album using albumID
 * @async
 * @param {number} albumId - ID of the album.
 * @returns {Promise<Object|null>} Album object if found, otherwise null.
*/
async function findAlbum(id){
    await connectDatabase()
    const db = client.db('INFS3201_fall2025')
    const albums = db.collection('albums')
    return await albums.findOne({ id: Number(id )}) || null
}

/**
 * Find album using album name
 * @async
 * @param {string} albumName - Name of the album.
 * @returns {Promise<Object|null>} Album object if found, otherwise null.

*/
async function findAlbumbyName(albumName){
    await connectDatabase()
    let db=client.db('INFS3201_fall2025')
    let albums=db.collection('albums')
    let result= await albums.find({name: { $regex: `^${albumName}$`, $options: "i" } })
    let data = await result.toArray()
    return data[0] || null
   
} 

/**
 * Update a photo document by its ID
 * @async
 * @param {string} photoId - The Id of the photo.
 * @param {Object} update - Fields to update (e.g. { title, description }).
 * @returns {Promise<Object|null>} Updated photo object if found, otherwise null.
 */
async function updatePhoto(id, update) {
    await connectDatabase()
    const db = client.db('INFS3201_fall2025')
    const photos = db.collection('photos')
    await photos.updateOne({ id: Number(id )}, { $set: update })
    return await photos.findOne({ id: Number(id )}) || null
}


/* COMMENTS */
/**
 * Add a new comment to a photo.
 * @param {number|string} photoId
 * @param {number|string} userId
 * @param {string} username
 * @param {string} text
 * @returns {Promise<Object>} Inserted comment document
 */
async function addComment(photoId, userId, username, text) {
    await connectDatabase()
    const db = client.db('INFS3201_fall2025')
    const comments = db.collection('comments')
    let nextId = 1
    const ids = await comments.find({}, { projection: { id: 1 } }).toArray()
    for (let i = 0; i < ids.length; i++) {
        if (ids[i] && typeof ids[i].id !== 'undefined' && ids[i].id >= nextId) {
            nextId = ids[i].id + 1
        }
    }

    const doc = {
        id: nextId,
        photoId: Number(photoId),
        userId: userId,
        username: username || "",
        text: text || "",
        createdAt: new Date()
    }

    await comments.insertOne(doc)
    return doc
}

/**
 * Get all comments for a photo, oldest first.
 * @param {number|string} photoId
 * @returns {Promise<Array>}
 */
async function getCommentsByPhoto(photoId) {
    await connectDatabase()
    const db = client.db('INFS3201_fall2025')
    const comments = db.collection('comments')

    const cursor = comments.find({ photoId: Number(photoId) }).sort({ createdAt: 1 })
    const result = await cursor.toArray()
    return result
}

module.exports={
    registerUser,
    loginUser,
    loadPhoto,
    loadAlbum,
    saveAlbum,
    savePhoto,
    findUserByEmail,
    findPhoto,
    findAlbum,
    findAlbumbyName,
    updatePhoto,
    addComment,
    getCommentsByPhoto
}
