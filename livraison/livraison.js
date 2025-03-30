
const mongoose = require("mongoose");

const LivraisonSchema = mongoose.Schema({
    commande_id: String,
    transporteur_i: String,
    statut: {
        type: String,
        default: 'En attente',
    },
    adresse_livraison: String,
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = Livraison = mongoose.model("Livraison", LivraisonSchema);