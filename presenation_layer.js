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

