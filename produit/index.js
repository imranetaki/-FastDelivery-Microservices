const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const mongoose = require('mongoose');
const Produit = require('./produit');

app.use(express.json());
mongoose.set('strictQuery',true); 

mongoose.connect("mongodb://localhost:27017/produit-TP5").then(()=>{
    console.log("Produit-TP5 DB Connecter")
}).catch((err)=>console.log(err));

app.post('/produit/ajouter',(req,res)=>{
    const {nom ,description , prix , stock } = req.body;
    const  nvProduit = new Produit({
        nom,
        description,
        prix,
        stock
    });
    nvProduit.save().then(produit =>res.status(201).json(produit)).catch(error => res.status(400).json({error})) ;
});


app.get('/produit/:id',(req,res)=>{
    const id = req.params.id ;
    Produit.find({_id:id})
    .then(produit => res.status(200).json(produit)  )
    .catch(err => res.status(400).json({err}))
    
})

app.patch('/produit/:id/stock',(req,res)=>{
     
    const id = req.params.id;
    const { quantite } = req.body; 

    
    if (quantite === undefined || quantite <= 0) {
        return res.status(400).json({ message: "Quantité invalide." });
    }

    
    Produit.findOneAndUpdate(
        { _id: id },
        { $inc: { stock: -quantite } },  
        { new: true } 
    )
    .then(produit => {
        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvé." });
        }
        res.status(200).json(produit);
    })
    .catch(err => {
        res.status(400).json({ err });
    });
});

app.listen(port,()=>{
    console.log('server est '+port);
})


