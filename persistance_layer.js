/**
* Group 001
* Name and Student ID:Eva Paul_60301251
*                      Mufeeda Kalam_60303289
*                     Aysha Sultana_60099830
* 
* INFS3201-5/6- Web Tech 2 
* Project Phase 2
*/

const{ MongoClient}=require('mongodb')
const crypto=require('crypto')

let client=null

/**
 * Connect to MongoDB database if not already connected.
 * @async
 * @returns {Promise<void>}
 */
async function connectDatabase(){
    if(!client){
        client=new MongoClient('mongodb+srv://60301251:12class34@cluster0.j7qvb.mongodb.net/')
        await client.connect()
    }
}

/**
 * Hash a plaintext password with a randomly generated salt using PBKDF2.
 * @param {string} password
 * @returns {Object} { salt, hash }
 */
function hashPassword(password){
    if(!password || typeof password!=='string'){
        throw new Error("Password must be non-empty string")
    }
    const salt = crypto.randomBytes(16).toString('hex')
    const hash= crypto.pbkdf2Sync(password, salt, 1000, 64,'sha512').toString('hex')
    return {salt, hash}
}

/**
 * Verify a plaintext password against stored hash and salt.
 * @param {string} password
 * @param {string} salt
 * @param {string} storedHash
 * @returns {boolean}
 */
function verifyPassword(password, salt,storedHash){
    if(!salt || !storedHash){
        return false
    }
    const hash= crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex')
    return hash == storedHash
}

/**
 * Load all documents from a MongoDB collection.
 * @async
 * @param {string} collectionName
 * @returns {Promise<Object[]>}
 */
async function loadAll(collectionName) {
    await connectDatabase()
    const db= client.db('INFS3201_fall2025')
    const collection= db.collection(collectionName)
    const docs= await collection.find({}).toArray()
    return docs
    
}

/**
 * Save a document to a MongoDB collection.
 * @async
 * @param {string} collectionName
 * @param {Object} doc
 */
async function saveDoc(collectionName, doc) {
    await connectDatabase()
    const db= client.db('INFS3201_fall2025')
    const collection= db.collection(collectionName)
    await collection.insertOne(doc)
}

/**
 * Register a new user.
 * @async
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object|string>} New user or 'exists'
 */
async function registerUser(name, email, password) {
    const users = await loadAll('users')
    for (let u of users) {
        if (u.email === email) {
            return 'exists'
        }
    }
    const {salt, hash}= hashPassword(password)
    const newUser = { id: users.length + 1, name, email, password: hash, salt: salt}
    await saveDoc('users', newUser)
    return newUser
}

/**
 * Log in a user using email and password.
 * If user has no salt (old data), login with plain password.
 * @async
 * @param {string} email - User email.
 * @param {string} password - Plaintext password.
 * @returns {Promise<Object|null>} User object if login is successful, otherwise null.
 */
async function loginUser(email, password) {
    const users = await loadAll('users')

    for (let u of users) {
        if (u.email === email) {
            if (!u.salt) {
                if (u.password === password) {
                    return u
                }
            } else {
                if (verifyPassword(password, u.salt, u.password)) {
                    return u
                }
            }
        }
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
 * Upserts a single photo document by id.
 * @async
 * @param {Object} photo
 * @returns {Promise<void>}
 */
async function savePhoto(photo) {
    await connectDatabase()
    const db = client.db('INFS3201_fall2025')
    await db.collection('photos').updateOne(
        { id: Number(photo.id) },
        { $set: photo },
        { upsert: true }
  )
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

/**
 * Find a user by their email address.
 * @async
 * @param {string} email - Email of the user.
 * @returns {Promise<Object|null>} User object if found, otherwise null.
 */
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
 * Update an existing photo document by ID and ownerId (so only the owner can update).
 * @async
 * @param {number|string} photoId - The ID of the photo to update.
 * @param {Object} update - The fields to update (e.g. { title, description, visibility }).
 * @param {number|string} userId - The ID of the user performing the update.
 * @returns {Promise<Object|null>} Updated photo object or null if not found.
 */
async function updatePhotoDB(photoId, update, userId) {
    await connectDatabase()
    const db = client.db('INFS3201_fall2025')
    const photos = db.collection('photos')

    const result = await photos.updateOne(
        { id: Number(photoId), ownerId: Number(userId) },
        { $set: update }
    );

    if (result.matchedCount === 0) return null

    return await photos.findOne({ id: Number(photoId) })
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
 * Ensures required indexes for the comments collection.
 * @async
 */
async function ensureCommentIndexes() {
  await connectDatabase()
  const db = client.db('INFS3201_fall2025')
  const comments = db.collection('comments')
  await comments.createIndex({ id: 1 }, { unique: true })
  await comments.createIndex({ photoId: 1, createdAt: 1 })
}

/**
 * Adds a new comment to a photo.
 * @async
 * @param {number|string} photoId - Target photo ID.
 * @param {number|string} userId - Commenter's user ID.
 * @param {string} username - Commenter's name.
 * @param {string} text - Comment text.
 * @returns {Promise<Object>} Inserted comment document.
 */
async function addComment(photoId, userId, username, text) {
  await connectDatabase()
  await ensureCommentIndexes()

  const db = client.db('INFS3201_fall2025')
  const photos = db.collection('photos')
  const comments = db.collection('comments')

  if (!Number.isFinite(Number(photoId))) throw new Error('Invalid photoId')

  const cleanUser = String(username || '').trim()
  const cleanText = String(text || '').trim()
  if (!cleanText) throw new Error('Empty comment')
  if (cleanText.length > 1000) throw new Error('Comment too long')

  const photo = await photos.findOne({ id: Number(photoId) })
  if (!photo) throw new Error('Photo not found')

  const last = await comments.find({}, { projection: { id: 1 } })
    .sort({ id: -1 }).limit(1).toArray()
  const nextId = (last[0]?.id || 0) + 1

  const doc = {
    id: nextId,
    photoId: Number(photoId),
    userId,
    username: cleanUser,
    text: cleanText,
    createdAt: new Date()
  }

  await comments.insertOne(doc)
  return doc
}

/**
 * Retrieves all comments for a photo, sorted by creation time.
 * @async
 * @param {number|string} photoId - Photo ID.
 * @returns {Promise<Object[]>} Array of comment documents.
 */
async function getCommentsByPhoto(photoId) {
  await connectDatabase()
  await ensureCommentIndexes()

  const db = client.db('INFS3201_fall2025')
  const comments = db.collection('comments')

  if (!Number.isFinite(Number(photoId))) return []

  return await comments
    .find({ photoId: Number(photoId) })
    .sort({ createdAt: 1 })
    .toArray()
}


/**
 * Creates a new user session and stores it in MongoDB.
 * @async
 * @param {number|string} userId - Logged-in user's ID.
 * @returns {Promise<string>} The generated session ID.
 */
async function createSession(userId) {
    await connectDatabase();
    const db = client.db('INFS3201_fall2025');
    const sessions = db.collection('sessions');


    const sessionId = crypto.randomBytes(16).toString('hex');
    const sessionDoc = {
        sessionId,
        userId,
        createdAt: new Date()
    };

    await sessions.insertOne(sessionDoc);
    return sessionId;
}

/**
 * Retrieves a user associated with a given session ID.
 * @async
 * @param {string} sessionId - Session identifier.
 * @returns {Promise<Object|null>} User object if found, otherwise null.
 */
async function getUserBySession(sessionId) {
    await connectDatabase();
    const db = client.db('INFS3201_fall2025');
    const sessions = db.collection('sessions');
    const users = db.collection('users');

    const session = await sessions.findOne({ sessionId });
    if (!session) return null;

    const user = await users.findOne({ id: session.userId });
    return user || null;
}

/**
 * Deletes a user session (logout).
 * @async
 * @param {string} sessionId - Session identifier to remove.
 * @returns {Promise<void>}
 */
async function deleteSession(sessionId) {
    await connectDatabase();
    const db = client.db('INFS3201_fall2025');
    const sessions = db.collection('sessions');
    await sessions.deleteOne({ sessionId });
}


/**
 * Search public photos by title, description, or tags.
 * @async
 * @param {string} searchTerm - Text to search for.
 * @returns {Promise<Object[]>} Matching public photos.
 */
async function searchPublicPhotos(searchTerm) {
    await connectDatabase()
    const db = client.db('INFS3201_fall2025')
    const photos = db.collection('photos')

    const term = String(searchTerm || '').trim()
    if (!term) {
        return [];
    }

    const query = {
        visibility: 'public',
        $text: { $search: term }  }

    const cursor = await photos.find(query)
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
    updatePhotoDB,
    findAlbum,
    findAlbumbyName,
    addComment,
    getCommentsByPhoto,
    createSession,
    getUserBySession,
    deleteSession,
}

/** Export for Phase 2 search feature
Allows the business layer to access MongoDB search for public photos
*/
module.exports.searchPublicPhotos = searchPublicPhotos
