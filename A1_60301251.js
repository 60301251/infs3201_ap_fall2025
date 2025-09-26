/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 1
*/

const fs = require('fs/promises')
const prompt = require('prompt-sync')()

/**
 * To load all photos
 * @returns {Promise<Array>}
 */

async function loadPhoto() {
    let data= await fs.readFile("photos.json", "utf8")
    return JSON.parse(data)
    
}

/** 
 * To load all albums
 * @returns {Promise<Array>}
*/
async function loadAlbum() {
    let db= await fs.readFile("albums.json", "utf8")
    return JSON.parse(db)
    
}
/**
 * To save photos nback to the file
 * @param {Array} photoList - List of photos
 * @returns {Promise<void>}
*/
async function savePhoto(photoList){
    await fs.writeFile("photos.json",JSON.stringify(photoList))
}

/**
 * To save albums back to the file
 * @param {Array} albumList - List of albums
 * @returns {Promise<void>}
 */
async function saveAlbum(albumList){
    await fs.writeFile("albums.json",JSON.stringify(albumList))
}

/**
* To find photos using photoId and display its details
* @param {number} photoId - ID of the photo
* @returns {Promise<void>}
*/
async function findPhoto(photoId) {
    let photos=await loadPhoto()
    let albums= await loadAlbum()
    let photo=null

    for(let i=0 ; i<photos.length; i++){
        if(photos[i].id===photoId){
            photo=photos[i]
            break
        }
    
    }
    if(!photo){
        console.log("Error: Photo not found!")
        return
    }
       
    else{
        console.log(`Filename: ${photo.filename}`)
        console.log(`Title: ${photo.title}`)

        let date = new Date(photo.date)
        let formattedDate = date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
        console.log(`Date: ${formattedDate}`)

        console.log(`Albums: ${photo.albums}`)
        console.log(`Tags: ${photo.tags}`)
        } 
}

/**
 * To update details of photo using photoId
 * @param {number} photoId - ID of the photo
 * @returns {Promise<void>}
*/
async function updatePhoto(photoId) {
    let photos = await loadPhoto()
    let photo=null
    for(let i=0;i<photos.length;i++){
        if(photos[i].id===photoId){
            photo=photos[i]
            break
        }
    }
    if(!photo){
        console.log("Error: Photo not found! ")
        return
    }
    else{
        console.log("Press enter to reuse existing value. ")

        let newtitle = prompt(`Enter value for title [${photo.title}]: `)
        if(newtitle.trim()!==""){
            photo.title=newtitle
        }
        let newdes= prompt(`Enter value for description [${photo.description}]: `)
        if(newdes!==""){
            photo.description=newdes
        }

        await savePhoto(photos)
        console.log("Photo updated!")
    }    
}

/**
 * To create a CSV file about the album details
 * @param {string} albumName - Name of the album
 * @returns {Promise<void>}
*/
async function photoList(albumname) {
    let photos= await loadPhoto()
    let albums=await loadAlbum()

    let albumid=null
    for(let i=0;i<albums.length;i++){
        if(albums[i].name.toLowerCase()===albumname.toLowerCase()){
            albumid=Number (albums[i].id)
            break
        }
    }
    if(!albumid){
        console.log("Album not found")
        return
    }
    else{
        console.log("filename,resolution,tags")
        
    for (let photo of photos) {
        if (photo.albums.includes(albumid)) {
            let tagsString = photo.tags.join(":")
            console.log(`${photo.filename},${photo.resolution},${tagsString}`)
        }
    }
}

}

/**
 * To add tags to a photo
 * @param {number} photoId - ID of the photo
 * @param {string} newTag - Tag to add
 * @returns {Promise<void>}
*/
async function addTag(photoId,newTag) {
    let photos= await loadPhoto()
    let photo=null

    for(let i=0;i<photos.length;i++){
        if(photos[i].id===photoId){
            photo=photos[i]
            break
        }

    
    if(!photo){
        console.log("Photo not found")
        return
    }}
    let duplicate = false
    for (let i = 0; i < photo.tags.length; i++) {
        if (photo.tags[i] === newTag) {
            duplicate = true
            break
        }
    }
     if (duplicate) {
        console.log(`Tag ${newTag} already exists for this photo.`)
        return
    }
    
    photo.tags.push(newTag)
    await savePhoto(photos)
    console.log("Updated!")

    
}


//The main function 
async function application(){
    while (true) {
        console.log('Options:')
        console.log('1. Find Photo')
        console.log('2. Update Photo details')
        console.log('3. Album Photo List')
        console.log('4. Tag Photo')
        console.log('5. Exit')
        
        let selection = Number(prompt("Your selection > "))  

        if (selection == 1) {
            let photoId=Number(prompt("Photo ID? "))
            await findPhoto(photoId)
       }
         else if (selection == 2){
             let photoId = Number(prompt("Photo ID? "))
            await updatePhoto(photoId)
        }
         else if (selection == 3) {
            let  albumname = prompt("What is the name of the album? ").toLowerCase()
            await photoList(albumname)
        }
         else if (selection == 4) {
            let photoId=Number(prompt("What is the photo ID to tag? "))
            let newTag = prompt("What tag to add? ")
            await addTag(photoId,newTag)
        }
         else if (selection == 5) {
            break 
         }
        else {
            console.log(' ERROR!!! Pick a number between 1 and 5')
         }
     }

}
application()