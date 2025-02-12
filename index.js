import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import _ from 'lodash';

const app = express();
const port = 3030;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"]
  }
});

app.use(cors());
app.use(bodyParser.json());

let inscriptionCount = 0; // Stocke le nombre d'inscriptions
let groupsHistory = [];
let currentGroups = [];

// Données temporaires (simulant une base de données)
let data = [
    { id: "a1b2c3", name: "", nickname: "", modifier: 0 },
    { id: "d4e5f6", name: "", nickname: "", modifier: 0 },
    { id: "g7h8i9", name: "", nickname: "", modifier: 0 },
    { id: "j0k1l2", name: "", nickname: "", modifier: 0 },
    { id: "m3n4o5", name: "", nickname: "", modifier: 0 },
    { id: "p6q7r8", name: "", nickname: "", modifier: 0 },
    { id: "s9t0u1", name: "", nickname: "", modifier: 0 },
    { id: "v2w3x4", name: "", nickname: "", modifier: 0 },
    { id: "y5z6a7", name: "", nickname: "", modifier: 0 },
    { id: "b8c9d0", name: "", nickname: "", modifier: 0 },
    { id: "e1f2g3", name: "", nickname: "", modifier: 0 },
    { id: "h4i5j6", name: "", nickname: "", modifier: 0 },
    { id: "k7l8m9", name: "", nickname: "", modifier: 0 },
    { id: "n0o1p2", name: "", nickname: "", modifier: 0 },
    { id: "q3r4s5", name: "", nickname: "", modifier: 0 },
    { id: "t6u7v8", name: "", nickname: "", modifier: 0 },
    { id: "w9x0y1", name: "", nickname: "", modifier: 0 },
    { id: "z2a3b4", name: "", nickname: "", modifier: 0 },
    { id: "c5d6e7", name: "", nickname: "", modifier: 0 },
    { id: "f8g9h0", name: "", nickname: "", modifier: 0 },
    { id: "i1j2k3", name: "", nickname: "", modifier: 0 },
    { id: "l4m5n6", name: "", nickname: "", modifier: 0 },
    { id: "o7p8q9", name: "", nickname: "", modifier: 0 },
    { id: "r0s1t2", name: "", nickname: "", modifier: 0 },
    { id: "u3v4w5", name: "", nickname: "", modifier: 0 },
    { id: "x6y7z8", name: "", nickname: "", modifier: 0 },
    { id: "a9b0c1", name: "", nickname: "", modifier: 0 },
    { id: "d2e3f4", name: "", nickname: "", modifier: 0 },
    { id: "g5h6i7", name: "", nickname: "", modifier: 0 },
    { id: "j8k9l0", name: "", nickname: "", modifier: 0 },
    { id: "m1n2o3", name: "", nickname: "", modifier: 0 },
    { id: "p4q5r6", name: "", nickname: "", modifier: 0 },
    { id: "s7t8u9", name: "", nickname: "", modifier: 0 },
    { id: "v0w1x2", name: "", nickname: "", modifier: 0 },
    { id: "y3z4a5", name: "", nickname: "", modifier: 0 },
    { id: "b6c7d8", name: "", nickname: "", modifier: 0 },
    { id: "e9f0g1", name: "", nickname: "", modifier: 0 },
    { id: "h2i3j4", name: "", nickname: "", modifier: 0 },
    { id: "k5l6m7", name: "", nickname: "", modifier: 0 },
    { id: "n8o9p0", name: "", nickname: "", modifier: 0 },
    { id: "q1r2s3", name: "", nickname: "", modifier: 0 },
    { id: "t4u5v6", name: "", nickname: "", modifier: 0 },
    { id: "w7x8y9", name: "", nickname: "", modifier: 0 },
    { id: "z0a1b2", name: "", nickname: "", modifier: 0 },
    { id: "c3d4e5", name: "", nickname: "", modifier: 0 },
    { id: "f6g7h8", name: "", nickname: "", modifier: 0 },
    { id: "i9j0k1", name: "", nickname: "", modifier: 0 },
    { id: "l2m3n4", name: "", nickname: "", modifier: 0 },
    { id: "o5p6q7", name: "", nickname: "", modifier: 0 },
    { id: "r8s9t0", name: "", nickname: "", modifier: 0 }
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
    inscriptionCount++;
    io.emit('updateCount', inscriptionCount); 
    data.push(newItem);
    res.status(201).json(newItem);
});

// Modifier la route de création des groupes
app.post('/create-groups', (req, res) => {
    // Récupérer les participants éligibles
    const eligibleParticipants = data.filter(user => 
        user.modifier === 1 && 
        !currentGroups.some(group => 
            group.members.some(member => member.id === user.id))
        );

    if (eligibleParticipants.length === 0) {
        return res.status(400).json({ message: 'Aucun participant éligible' });
    }

    // Création des groupes
    const shuffled = _.shuffle(eligibleParticipants);
    const newGroups = _.chunk(shuffled, 4).map((members, index) => ({
        id: Date.now() + index,
        members,
        createdAt: new Date()
    }));

    // Mise à jour des données
    currentGroups = [...currentGroups, ...newGroups];
    groupsHistory.push(...newGroups);

    // Mise à jour en temps réel
    io.emit('groupsUpdated', currentGroups);
    res.json(currentGroups);
});

// Ajouter une route pour récupérer les groupes
app.get('/groups', (req, res) => {
    res.json(currentGroups);
});

app.get('/data', (req, res) => {
    io.emit('dataUpdated', data);
    res.json(data);
});

// Modifier la route PUT pour gérer le modifier
app.put('/items/:id', (req, res) => {
    const itemId = req.params.id;
    const updatedItem = req.body;
    const index = data.findIndex(i => i.id === itemId);

    if (index === -1) {
        return res.status(404).json({ message: 'Item not found' });
    }

    data[index] = { ...data[index], ...updatedItem };

    const isEligibleNow = data[index].modifier === 0 ;

    if (isEligibleNow) {
        data[index].modifier = 1 ;
        inscriptionCount++;
        io.emit('updateCount', inscriptionCount);
    }

    res.json(data[index]);
});

// Route pour récupérer le nombre d'inscriptions
app.get('/count', (req, res) => {
    res.json({ count: inscriptionCount });
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
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});