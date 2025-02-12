const express = require('express');
const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Données temporaires (simulant une base de données)
let data = [
    { "id": "a1b2c3", "name": "", "nickname": "" },
    { "id": "d4e5f6", "name": "", "nickname": "" },
    { "id": "g7h8i9", "name": "", "nickname": "" },
    { "id": "j0k1l2", "name": "", "nickname": "" },
    { "id": "m3n4o5", "name": "", "nickname": "" },
    { "id": "p6q7r8", "name": "", "nickname": "" },
    { "id": "s9t0u1", "name": "", "nickname": "" },
    { "id": "v2w3x4", "name": "", "nickname": "" },
    { "id": "y5z6a7", "name": "", "nickname": "" },
    { "id": "b8c9d0", "name": "", "nickname": "" },
    { "id": "e1f2g3", "name": "", "nickname": "" },
    { "id": "h4i5j6", "name": "", "nickname": "" },
    { "id": "k7l8m9", "name": "", "nickname": "" },
    { "id": "n0o1p2", "name": "", "nickname": "" },
    { "id": "q3r4s5", "name": "", "nickname": "" },
    { "id": "t6u7v8", "name": "", "nickname": "" },
    { "id": "w9x0y1", "name": "", "nickname": "" },
    { "id": "z2a3b4", "name": "", "nickname": "" },
    { "id": "c5d6e7", "name": "", "nickname": "" },
    { "id": "f8g9h0", "name": "", "nickname": "" },
    { "id": "i1j2k3", "name": "", "nickname": "" },
    { "id": "l4m5n6", "name": "", "nickname": "" },
    { "id": "o7p8q9", "name": "", "nickname": "" },
    { "id": "r0s1t2", "name": "", "nickname": "" },
    { "id": "u3v4w5", "name": "", "nickname": "" },
    { "id": "x6y7z8", "name": "", "nickname": "" },
    { "id": "a9b0c1", "name": "", "nickname": "" },
    { "id": "d2e3f4", "name": "", "nickname": "" },
    { "id": "g5h6i7", "name": "", "nickname": "" },
    { "id": "j8k9l0", "name": "", "nickname": "" },
    { "id": "m1n2o3", "name": "", "nickname": "" },
    { "id": "p4q5r6", "name": "", "nickname": "" },
    { "id": "s7t8u9", "name": "", "nickname": "" },
    { "id": "v0w1x2", "name": "", "nickname": "" },
    { "id": "y3z4a5", "name": "", "nickname": "" },
    { "id": "b6c7d8", "name": "", "nickname": "" },
    { "id": "e9f0g1", "name": "", "nickname": "" },
    { "id": "h2i3j4", "name": "", "nickname": "" },
    { "id": "k5l6m7", "name": "", "nickname": "" },
    { "id": "n8o9p0", "name": "", "nickname": "" },
    { "id": "q1r2s3", "name": "", "nickname": "" },
    { "id": "t4u5v6", "name": "", "nickname": "" },
    { "id": "w7x8y9", "name": "", "nickname": "" },
    { "id": "z0a1b2", "name": "", "nickname": "" },
    { "id": "c3d4e5", "name": "", "nickname": "" },
    { "id": "f6g7h8", "name": "", "nickname": "" },
    { "id": "i9j0k1", "name": "", "nickname": "" },
    { "id": "l2m3n4", "name": "", "nickname": "" },
    { "id": "o5p6q7", "name": "", "nickname": "" },
    { "id": "r8s9t0", "name": "", "nickname": "" }
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