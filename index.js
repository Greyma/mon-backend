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
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
  },
});

app.use(cors());
app.use(bodyParser.json());

// Variables d'état
let inscriptionCount = 0;
let groupsHistory = [];
let currentGroups = [];
let groupCorriger = [];

// Données temporaires (simulant une base de données)
let participants = Array.from({ length: 50 }, (_, i) => ({
  id: `user${i + 1}`,
  name: '',
  nickname: '',
  modifier: 0,
}));

// Données pour les enseignants et groupes d'évaluation
let teachers = [
  { id: 'PROF1', name: 'Dr. Smith' },
  { id: 'PROF2', name: 'Pr. Johnson' },
  { id: 'PROF3', name: 'Mme. Dupont' },
];

let evaluationGroups = [
  { id: '1', name: 'Groupe Alpha', evaluations: [], average: 0, mention: '' },
  { id: '2', name: 'Groupe beta', evaluations: [], average: 0, mention: '' },
  { id: '3', name: 'Groupe Theta', evaluations: [], average: 0, mention: '' },
  { id: '4', name: 'Groupe Gamma', evaluations: [], average: 0, mention: '' },
  { id: '5', name: 'Groupe Mosku', evaluations: [], average: 0, mention: '' },
  { id: '6', name: 'Groupe Tokyo', evaluations: [], average: 0, mention: '' },
  
  { id: '7', name: 'Groupe Finland', evaluations: [], average: 0, mention: '' },
  { id: '8', name: 'Groupe Alger', evaluations: [], average: 0, mention: '' },
  
  { id: '9', name: 'Groupe hong kong', evaluations: [], average: 0, mention: '' },
  { id: '10', name: 'Groupe berlin', evaluations: [], average: 0, mention: '' },
];

const criteriaConfig = [
  { id: '1', maxPoints: 4 },
  { id: '2', maxPoints: 3 },
  { id: '3', maxPoints: 3 },
  { id: '4', maxPoints: 4 },
  { id: '5', maxPoints: 3 },
  { id: '6', maxPoints: 3 },
];

// Helper functions
const calculateMention = (average) => {
  if (average >= 17) return 'Excellent 🏆';
  if (average >= 14) return 'Très Bien 👍';
  if (average >= 10) return 'Satisfaisant ✔️';
  return 'À améliorer ⚠️';
};

const calculateGroupStats = (group) => {
  const total = group.evaluations.reduce((sum, evaluation) => sum + evaluation.total, 0);
  group.average = group.evaluations.length > 0
    ? Math.round((total / group.evaluations.length) * 10) / 10
    : 0;
  group.mention = calculateMention(group.average);
};

// Routes pour les participants
app.get('/participants', (req, res) => {
  res.json(participants);
});

app.get('/participants/:id', (req, res) => {
  const participant = participants.find(p => p.id === req.params.id);
  if (!participant) return res.status(404).json({ message: 'Participant not found' });
  res.json(participant);
});

// Backend (Express.js)
app.post('/api/validate-teacher', (req, res) => {
    const { teacherId } = req.body;
  
    // Vérifier si l'ID est valide
    const teacher = teachers.find(t => t.id === teacherId);
  
    if (teacher) {
      res.json({ valid: true, teacher });
    } else {
      res.status(404).json({ valid: false, message: 'ID enseignant invalide' });
    }
  });

app.post('/participants', (req, res) => {
  const newParticipant = req.body;
  if (!newParticipant.id || !newParticipant.name || !newParticipant.nickname) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  participants.push(newParticipant);
  inscriptionCount++;
  io.emit('updateCount', inscriptionCount);
  res.status(201).json(newParticipant);
});

app.put('/participants/:id', (req, res) => {
  const participant = participants.find(p => p.id === req.params.id);
  if (!participant) return res.status(404).json({ message: 'Participant not found' });

  Object.assign(participant, req.body);
  if (participant.modifier === 0) {
    participant.modifier = 1;
    inscriptionCount++;
    io.emit('updateCount', inscriptionCount);
  }
  io.emit('dataUpdated', participants);
  res.json(participant);
});

app.delete('/participants/:id', (req, res) => {
  const index = participants.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Participant not found' });
  participants.splice(index, 1);
  res.status(204).send();
});

// Routes pour les groupes
app.post('/create-groups', (req, res) => {
  const eligibleParticipants = participants.filter(p =>
    p.modifier === 1 &&
    !currentGroups.some(g => g.members.some(m => m.id === p.id)) );

  if (eligibleParticipants.length === 0) {
    return res.status(400).json({ message: 'Aucun participant éligible' });
  }

  const shuffled = _.shuffle(eligibleParticipants);
  const newGroups = _.chunk(shuffled, 4).map((members, index) => ({
    id: Date.now() + index,
    members,
    createdAt: new Date(),
  }));

  currentGroups = [...currentGroups, ...newGroups];
  groupsHistory.push(...newGroups);

  io.emit('groupsUpdated', currentGroups);
  res.json(currentGroups);
});

app.get('/groups', (req, res) => {
  res.json(currentGroups);
});

// Routes pour les évaluations
app.get('/api/teachers', (req, res) => {
  res.json(teachers);
});

app.get('/api/evaluation-groups', (req, res) => {
  evaluationGroups.forEach(calculateGroupStats);
  res.json(evaluationGroups);
});

app.get('/api/evaluationgroups', (req, res) => {
    groupCorriger.forEach(calculateGroupStats);
    res.json(groupCorriger);
  });
  

app.post('/api/evaluations', (req, res) => {
  const { teacherId, groupId, notes } = req.body;

  const teacher = teachers.find(t => t.id === teacherId);
  const group = evaluationGroups.find(g => g.id === groupId);

  if (!teacher || !group) {
    return res.status(400).json({ error: 'Données invalides' });
  }

  const evaluation = {
    teacherId,
    groupId,
    scores: {},
    total: 0,
    date: new Date(),
  };

  criteriaConfig.forEach(criterion => {
    const level = notes[criterion.id];
    let points = 0;

    switch (level) {
      case 'moyen': points = criterion.maxPoints * 0.575; break;
      case 'avancé': points = criterion.maxPoints * 0.75; break;
      case 'excellent': points = criterion.maxPoints * 0.925; break;
    }

    evaluation.scores[criterion.id] = Math.round(points * 10) / 10;
    evaluation.total += evaluation.scores[criterion.id];
  });

  io.emit('groupsevaluation', evaluationGroups);
  evaluation.total = Math.round(evaluation.total * 10) / 10;
  group.evaluations.push(evaluation);
  calculateGroupStats(group);
  groupCorriger.push(group)

  res.json({
    message: 'Évaluation enregistrée avec succès'
  });
});

// Démarrer le serveur
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});