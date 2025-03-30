const mongoose = require("mongoose");

const produitSchema = new mongoose.Schema({
    nom  :  String ,
    description  : String ,
    prix  :  Number ,
    stock  : Number ,
    creared_at:{
        type:Date,
        default:Date.now()
    }
})

module.exports = Produit = mongoose.model('Produit',produitSchema)