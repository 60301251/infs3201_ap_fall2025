/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 3
*/

const{ MongoClient}=require('mongodb')
const mongodb= require('mongodb')

async function connectDatabase(){
    if(!client){
        client=new MongoClient('mongodb+srv://60301251:12class34@cluster0.j7qvb.mongodb.net/')
        await client.connect()
    }
}

/**
 * To load photos from the file
 * @async
 * @returns {Promise<Object[]>} Array of photo objects.
*/
async function loadPhoto(){
    await connectDatabase()
    let db=client.db('infs3201_fall2025')
    let photos= await photos.find()
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
    let db=client.db('infs(3201_fall2025')
    let photocollection=db.collection('photos')
    await photocollection.deleteMany({})
    await photocollection.insertMany(photoList)
    
}


/**
 * To load albums from the file
 * @async
 * @returns {Promise<Object[]>} Array of album objects.
*/
async function loadAlbum(){
    await connectDatabase()
    let db=client.db('infs3201_fall2025')
    let albums= await albums.find()
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
    let db=client.db('infs3201_fall2025')
    let albumcollection=db.collection('albums')
    await albumcollection.deleteMany({})
    await albumcollection.insertMany(albumList)
}

/**
 * Find a photo using photoID
 * @async
 * @param {number} photoId - ID of the photo.
 * @returns {Promise<Object|null>} Photo object if found, otherwise null.
*/
async function findPhoto(photoId){
    await connectDatabase()
    let db= client.db('infs3201_fall2025')
    let photos=db.collection('photos')
    let oid = new mongodb.ObjectID(photoId)
    let result = await photos.find({_id:oid })
    let resultData= await result.toArray()
    return resultData[0] || null
}

/**
 * Find an album using albumID
 * @async
 * @param {number} albumId - ID of the album.
 * @returns {Promise<Object|null>} Album object if found, otherwise null.
*/
async function findAlbum(albumId){
    await connectDatabase()
    let db= client.db('infs3201_fall2025')
    let albums= db.collection('albums')
    let oid= new mongodb.ObjectID(albumId)
    let result= await albums.find({_id:oid})
    let resultData= await result.toArray()
    return resultData[0] || null
}

/**
 * Find album using album name
 * @async
 * @param {string} albumName - Name of the album.
 * @returns {Promise<Object|null>} Album object if found, otherwise null.

*/
async function findAlbumbyName(albumName){
    await connectDatabase()
    let db=client.db('infs3201_fall2025')
    let albums=db.collection('albums')
    let result= await albums.find({name: albumName.toLowerCase()})
    let data = await result.toArray()
    return data[0] || null
   
} 

module.exports={
    loadPhoto,
    loadAlbum,
    findPhoto,
    findAlbum,
    findAlbumbyName,
}
