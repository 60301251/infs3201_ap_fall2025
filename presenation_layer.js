/**
* Name:Eva Paul
* Student ID:60301251
* INFS3201-5/6- Web Tech 2 
* Assignment 2
*/

const prompt=require('prompt-sync')()


const{
    getPhoto,
    getAlbum,
    updatePhoto,
    getByAlbum,
    addTag
}=("./business_layer")

//Disply photo details by ID
async function displayPhoto(PhotoId){
    const photo= await getPhoto(PhotoId)

    if(!photo){
        console.log("Error: Photo not found!")
        return
    }
    else{
        console.log(`Filename: ${photo.filename}`)
        console.log(`Title: ${photo.title}`)
        console.log('Date: ${new Date(photo.date).toDateString()}')
        console.log(`Albums: ${photo.albums}`)
        console.log(`Tags: ${photo.tags}`)

    }
}

// To update details of photo using photoId
async function updatePhotoDetails(photoId){
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

//To create a CSV file about the album details
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

//To add tags to a photo
async function tagPhoto(photoId){
    let newTag=prompt("Enter new Tag: ")
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

