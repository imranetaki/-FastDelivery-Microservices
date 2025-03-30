const express = require('express');
const app = express();
const port = process.env.PORT || 4001;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const users = require('./utilisateur');
const jwt = require("jsonwebtoken"); 
const isAuthenticated = require('./authentifications');

app.use(express.json());
mongoose.set('strictQuery',true); 

mongoose.connect("mongodb://localhost:27017/utilisateur-TP5").then(()=>{
    console.log("Auth-TP5 DB Connecter")
}).catch((err)=>console.log(err));


app.post('/auth/register',async (req, res) => {
    let { nom, email, mot_de_passe } = req.body; 
    const userExists = await Utilisateur.findOne({ email });
    if (userExists) {
        return res.json({ message: "Cet utilisateur existe déjà" });
    } else {
        bcrypt.hash(mot_de_passe, 10, (err, hash) => {
             if (err) {
             return res.status(500).json({
             error: err,
             });
            }else{
                mot_de_passe = hash;
                const newUtilisateur = new users({
                     nom,
                     email,
                     mot_de_passe
                     });
                    newUtilisateur.save()
                    .then(user => res.status(201).json(user))
                    .catch(error => res.status(400).json({ error }));
                    }
            }
        
        );
    }
})

app.post('/auth/login',async (req, res) => {
    const { email, mot_de_passe } = req.body;
    const utilisateur = await users.findOne({ email });
    if (!utilisateur) {
        return res.json({ message: "Utilisateur introuvable" });
    } else {
        bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe).then(resultat => {
    if (!resultat) {
         return res.json({ message: "Mot de passe incorrect" });
    }
    else {
        const payload = {
            id: utilisateur._id,
            email: utilisateur.email, 
            nom: utilisateur.nom
        };
        jwt.sign(payload, "secret", (err, token) => {
            if (err) console.log(err);
            else 
             return res.json({ token: token });
            });
    }
        });
    }
});

app.get('/auth/profil', isAuthenticated, async (req, res) => {
    try {
        console.log("Recherche de l'utilisateur avec ID :", req.user.id);
        const utilisateur = await users.findOne({ _id: req.user.id });
        console.log(utilisateur);
        res.json(utilisateur);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.listen(port,()=>{
    console.log("démarahe de serveur sur "+port);
})

