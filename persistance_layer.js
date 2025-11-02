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

let client=null

async function connectDatabase(){
    if(!client){
        client=new MongoClient('mongodb+srv://60301251:12class34@cluster0.j7qvb.mongodb.net/')
        await client.connect()
    }
}

function hashPassword(password){
    const salt = crypto.randomBytes(16).toString('hex')
    const hash= crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex')
    return {salt, hash}
}

function verifyPassword(password, salt,storedHash){
    const hash= crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex')
    return hash == storedHash
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

    for (let photo of photoList) {
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
    return await photos.findOne({ id: Number(id) }) || null
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

module.exports={
    loadPhoto,
    loadAlbum,
    saveAlbum,
    savePhoto,
    findPhoto,
    findAlbum,
    findAlbumbyName,
    updatePhoto
}
