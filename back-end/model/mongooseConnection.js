const mongoose = require('mongoose')

// amaimshaikh - username
// 6aoeTKfTLEdFh5yc - password

mongoose.connect('mongodb+srv://amaimshaikh:6aoeTKfTLEdFh5yc@requests.dtmre0v.mongodb.net/?retryWrites=true&w=majority').then(() => {
    console.log("Mongoose Connected")
})
.catch(err => {
    console.log("Error:: ", err.message)
})
