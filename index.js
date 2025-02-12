const express = require('express');
const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Données temporaires (simulant une base de données)
let data = [
    { id: '1', name: 'John Doe', nickname: 'Johnny' },
    { id: '2', name: 'Jane Doe', nickname: 'Janie' }
];

// Route pour récupérer tous les éléments (READ)
app.get('/items', (req, res) => {
    res.json(data);
});

// Route pour récupérer un élément par son ID (READ)
app.get('/items/:id', (req, res) => {
    const itemId = req.params.id;
    const item = data.find(i => i.id === itemId);
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Route pour créer un nouvel élément (CREATE)
app.post('/items', (req, res) => {
    const newItem = req.body;
    if (!newItem.id || !newItem.name || !newItem.nickname) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    data.push(newItem);
    res.status(201).json(newItem);
});

// Route pour mettre à jour un élément (UPDATE)
app.put('/items/:id', (req, res) => {
    const itemId = req.params.id;
    const updatedItem = req.body;
    const index = data.findIndex(i => i.id === itemId);
    if (index !== -1) {
        data[index] = { ...data[index], ...updatedItem };
        res.json(data[index]);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Route pour supprimer un élément (DELETE)
app.delete('/items/:id', (req, res) => {
    const itemId = req.params.id;
    const index = data.findIndex(i => i.id === itemId);
    if (index !== -1) {
        data.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});