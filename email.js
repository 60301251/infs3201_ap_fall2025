function sendMail(to, subject, body) {
    console.log("=== EMAIL NOTIFICATION ===")
    console.log("To:", to)
    console.log("Subject:", subject)
    console.log("Body:", body)
    console.log("==========================")
}

module.exports = { sendMail }