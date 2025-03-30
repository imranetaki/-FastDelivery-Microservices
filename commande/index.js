const express = require("express");
const mongoose = require("mongoose");
const app = express();
const Commande = require("./commande");
const isAuthenticated = require("./authMiddleware");
const port = process.env.PORT || 4002;
const axios = require("axios"); 


app.use(express.json());

mongoose.set('strictQuery',true); 

mongoose.connect("mongodb://localhost:27017/commande-TP5").then(()=>{
    console.log("commende-TP5 DB Connecter")
}).catch((err)=>console.log(err));

async function httpRequest(produits) {
    try {
        let produitsDetails = [];
        let prixTotal = 0;

        
        for (const item of produits) {
            const url = `http://localhost:4000/produit/${item.produit_id}`; 
            const response = await axios.get(url);

            const produit = response.data[0];  
            console.log("Produit récupéré:", produit); 

            if (!produit) {
                throw new Error(`Produit avec l'ID ${item.produit_id} non trouvé.`);
            }

            
            if (produit.stock < item.quantite) {
                throw new Error(`Produit ${produit.nom} en stock insuffisant. Stock disponible: ${produit.stock}, Quantité demandée: ${item.quantite}`);
            }

            
            const totalProduit = produit.prix * item.quantite;
            prixTotal += totalProduit;


            produitsDetails.push({
                produit_id: produit._id,
                nom: produit.nom,
                prix: produit.prix,
                quantite: item.quantite,
                total: totalProduit
            });
            console.log(produit.stock+" - "+item.quantite+" = "+(produit.stock - item.quantite)); // Debugging
           
            await axios.patch(`http://localhost:4000/produit/${produit._id}/stock`, {
                quantite : item.quantite  
            });
        }
        
        return { produits: produitsDetails, prixTotal };
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API des produits:", error);
        throw error;
    }
}

 // Exemple de données de commande à envoyer dans le corps de la requête :
 /*{
    "produits" :[{"produit_id":"67e7b2e03345b2b85a94e64a","quantite" :2 },
    {"produit_id":"67e88ed280e6798ab543521b","quantite" :2 }]
 } */

app.post("/commande/ajouter", isAuthenticated, async (req, res) => {
    try {
        const client_id = req.user.id;  
        const { produits } = req.body;  

        if (!produits || produits.length === 0) {
            return res.status(400).json({ message: "Aucun produit dans la commande." });
        }

        
        const { produits: produitsAvecDetails, prixTotal } = await httpRequest(produits);

        console.log("Produits avec détails:", produitsAvecDetails ,"client_id:", client_id, "prixTotal:", prixTotal); 

        
        const nouvelleCommande = new Commande({
            produits: produitsAvecDetails,
            client_id: client_id,
            prix_total: prixTotal,
            statut: 'En attente',  
            created_at: new Date(),
        });

        
        await nouvelleCommande.save();

        
        res.status(201).json({
            message: "Commande ajoutée avec succès.",
            commande: nouvelleCommande
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la commande:", error);
        res.status(500).json({ message: error.message });
    }
});


app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});


app.get('/commande/:id', async (req, res) => {
    try {
        const commandeId = req.params.id;  
        const commande = await Commande.findOne({ _id: commandeId })
            

        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée." });
        }

        
        res.status(200).json(commande);
    } catch (error) {
        console.error("Erreur lors de la récupération de la commande:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});



app.patch('/commande/:id/statut', isAuthenticated, async (req, res) => {
    try {
        const commandeId = req.params.id;  
        const { statut } = req.body;  

        
        if (!['Confirmée', 'Expédiée'].includes(statut)) {
            return res.status(400).json({ message: "Statut invalide. Utilisez 'Confirmée' ou 'Expédiée'." });
        }

        
        const commande = await Commande.findOneAndUpdate(
            { _id: commandeId },
            { statut: statut },
            { new: true }  
        );

        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée." });
        }

        
        res.status(200).json({
            message: `Statut de la commande mis à jour en '${statut}'.`,
            commande: commande
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de la commande:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});
