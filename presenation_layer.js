/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 3
*/

const prompt=require('prompt-sync')()


const{
    getPhoto,
    getAlbum,
    updatePhoto,
    getByAlbum,
    addTag
}=require("./business_layer")

/** 
 * Disply photo details by ID
 * @async
 * @param {number} PhotoId - The ID of the photo to display.
 * @returns {Promise<void>}
*/

async function displayPhoto(PhotoId){
    const photo= await getPhoto(PhotoId)

    if(!photo){
        console.log("Error: Photo not found!")
        return
    }
    else{
        console.log(`Filename: ${photo.filename}`)
        console.log(`Title: ${photo.title}`)
        console.log(`Date: ${new Date(photo.date).toDateString()}`)
        console.log(`Albums: ${(photo.albums || []).join(",")}`)
        console.log(`Tags: ${(photo.tags || []).join(",")}`)

    }
}

/**
 * To update details of photo using photoId
 * @async
 * @param {number} photoId - The ID of the photo to update.
 * @returns {Promise<void>}
*/
async function updatePhotoDetails(photoId){
       let photo = await getPhoto(photoId)

    if (photo === null) {
        console.log("Error: Photo not found!")
        return
    }
     console.log("Press enter to reuse existing value. ")
     let newtitle = prompt(`Enter value for title [${photo.title}]: `)
     let newdes= prompt(`Enter value for description [${photo.description}]: `)

     const updated = await updatePhoto(photoId,newtitle,newdes)
        if(!updated){
            console.log("Error: Photo not found! ")
        }
        else{
            console.log("Photo updated!")
        }

     }

/**
 * To create a CSV file about the album details
 * @async
 * @param {string} albumname - Name of the album to display.
 * @returns {Promise<void>}
*/
async function displayAlbumPhotos(albumname) {
    const result= await getByAlbum(albumname)

    if(!result){
        console.log("Album not found")
        return
    }
    else{
        console.log("Album: ",result.album.name)
        console.log("filename,resolution,tags")

        for (let photo of result.photos){
            let tagsString=photo.tags.join(":")
            console.log(`${photo.filename},${photo.resolution},${tagsString}`)
        }

    }  
}

/**
 * To add tags to a photo
 * @async
 * @param {number} photoId - The ID of the photo to tag.
 * @param {string} newTag - The tag to add.
 * @returns {Promise<void>}
*/
async function tagPhoto(photoId,newTag){
    const result= await addTag(photoId,newTag)

    if(result===null){
        console.log("Photo not found")
    }
    else if(result==="duplicate"){
        console.log(`Tag ${newTag} already exists for this photo.`)
    }
    else{
        console.log("Updated!")
    }
}

/**
 * Main function
 * @async
 * @returns {Promise<void>}
*/
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
            await displayPhoto(photoId)
       }
         else if (selection == 2){
             let photoId =Number(prompt("Photo ID? "))
            await updatePhotoDetails(photoId)
        }
         else if (selection == 3) {
            let  albumName = prompt("What is the name of the album? ")
            await displayAlbumPhotos(albumName)
        }
         else if (selection == 4) {
            let photoId=Number(prompt("What is the photo ID to tag? "))
            let newTag = prompt("What tag to add? ")
            await tagPhoto(photoId,newTag)
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

