const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4003;
const mongoose = require("mongoose");
const Livraison = require("./livraison");

const axios = require('axios');

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost/livraison-service").then(()=>{
    console.log("Livraison-service DB Connecter")
}).catch((err)=>console.log(err));;

app.use(express.json());

async function httpRequest(id) {
    const URL = `http://localhost:4002/commande/${id}`
    const response = await axios.get(URL, {
        headers: { 'Content-Type': 'application/json' }
    });

    return response.data;
}

app.post("/livraison/ajouter", (req, res, next)=>{
    const {commande_id, transporteur_i, adresse_livraison} = req.body;

    httpRequest(req.body.commande_id).then(data => {
        if (data) {
            const newLivraison = new Livraison({
                commande_id,
                transporteur_i,
                adresse_livraison
            });

            newLivraison.save().then(livraison => res.status(201).json(livraison))
            .catch(err => res.status(400).json({err}));
        } else {
            res.status(404).json({ message: "Commande not found" });
        }
    }).catch(err => res.status(500).json({ error: "Internal Server Error", details: err }));

});

app.put("/livraison/:id",(req,res)=>{
    const id = req.params.id;
    Livraison.findOneAndUpdate(
        {_id: id},
        {
            $set:{statut:"Confirmée"}
        }
    ).then(livraison => res.status(201).json(livraison))
    .catch(error => res.status(400).json({error}));
})


app.listen(PORT, () => {
    console.log(`Livraison-Service at ${PORT}`);
});