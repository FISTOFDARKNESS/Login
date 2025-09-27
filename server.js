const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

let ratings = {};

app.get('/api/ratings/:productId', (req, res) => {
    const productId = req.params.productId;
    res.json(ratings[productId] || []);
});

app.post('/api/ratings', (req, res) => {
    const { productId, userName, rating, comment } = req.body;
    
    if (!productId || !userName || !rating || !comment) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    if (!ratings[productId]) {
        ratings[productId] = [];
    }
    
    const newRating = {
        userName,
        rating,
        comment,
        date: new Date().toISOString()
    };
    
    ratings[productId].push(newRating);
    
    const avgRating = ratings[productId].reduce((sum, r) => sum + r.rating, 0) / ratings[productId].length;
    
    res.json({ 
        success: true, 
        averageRating: avgRating.toFixed(1),
        totalRatings: ratings[productId].length
    });
});

app.get('/api/ratings/:productId/average', (req, res) => {
    const productId = req.params.productId;
    const productRatings = ratings[productId] || [];
    
    if (productRatings.length === 0) {
        return res.json({ averageRating: 4.0, totalRatings: 0 });
    }
    
    const avgRating = productRatings.reduce((sum, r) => sum + r.rating, 0) / productRatings.length;
    res.json({ averageRating: avgRating.toFixed(1), totalRatings: productRatings.length });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});