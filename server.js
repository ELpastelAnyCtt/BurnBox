const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// In-memory storage for demo purposes
let salas = [
  {
    id: 'sala1',
    nome: 'Chat Geral BurnBox',
    usuarios: 15,
    preview: 'Bem-vindo ao chat geral BurnBox!',
    tempoAutoDestruicao: 0,
    criador: null,
    fixa: true,
    mensagens: []
  },
  {
    id: 'sala2',
    nome: 'Discussões Livres',
    usuarios: 23,
    preview: 'Converse sobre qualquer coisa aqui...',
    tempoAutoDestruicao: 60,
    criador: null,
    mensagens: []
  },
  {
    id: 'sala3',
    nome: 'Confissões Anônimas',
    usuarios: 47,
    preview: 'Compartilhe seus segredos anonimamente...',
    tempoAutoDestruicao: 60,
    criador: null,
    mensagens: []
  }
];

let usuariosOnline = 28;

// API Routes

// GET /api/salas - Listar todas as salas
app.get('/api/salas', (req, res) => {
  res.json({
    sucesso: true,
    salas: salas.map(sala => ({
      id: sala.id,
      nome: sala.nome,
      usuarios: sala.usuarios,
      preview: sala.preview,
      tempoAutoDestruicao: sala.tempoAutoDestruicao,
      criador: sala.criador,
      fixa: sala.fixa
    })),
    usuariosOnline: usuariosOnline
  });
});

// POST /api/salas - Criar nova sala
app.post('/api/salas', (req, res) => {
  const { nome, tempoAutoDestruicao, criador } = req.body;

  if (!nome) {
    return res.status(400).json({ sucesso: false, erro: 'Nome da sala é obrigatório' });
  }

  const novaSala = {
    id: uuidv4(),
    nome: nome,
    usuarios: 1,
    preview: 'Sala recém-criada',
    tempoAutoDestruicao: tempoAutoDestruicao || 360,
    criador: criador,
    fixa: false,
    mensagens: []
  };

  salas.push(novaSala);

  res.json({
    sucesso: true,
    sala: {
      id: novaSala.id,
      nome: novaSala.nome,
      usuarios: novaSala.usuarios,
      preview: novaSala.preview,
      tempoAutoDestruicao: novaSala.tempoAutoDestruicao,
      criador: novaSala.criador,
      fixa: novaSala.fixa
    }
  });
});

// DELETE /api/salas/:id - Deletar sala
app.delete('/api/salas/:id', (req, res) => {
  const { id } = req.params;
  const { criador } = req.body;

  const salaIndex = salas.findIndex(s => s.id === id);

  if (salaIndex === -1) {
    return res.status(404).json({ sucesso: false, erro: 'Sala não encontrada' });
  }

  const sala = salas[salaIndex];

  // Verificar se o usuário é o criador
  if (sala.criador !== criador) {
    return res.status(403).json({ sucesso: false, erro: 'Apenas o criador pode deletar a sala' });
  }

  // Não permitir deletar salas fixas
  if (sala.fixa) {
    return res.status(403).json({ sucesso: false, erro: 'Não é possível deletar salas oficiais' });
  }

  salas.splice(salaIndex, 1);

  res.json({ sucesso: true });
});

// GET /api/salas/:id/mensagens - Obter mensagens de uma sala
app.get('/api/salas/:id/mensagens', (req, res) => {
  const { id } = req.params;

  const sala = salas.find(s => s.id === id);

  if (!sala) {
    return res.status(404).json({ sucesso: false, erro: 'Sala não encontrada' });
  }

  res.json({
    sucesso: true,
    mensagens: sala.mensagens
  });
});

// POST /api/salas/:id/mensagens - Enviar mensagem para uma sala
app.post('/api/salas/:id/mensagens', (req, res) => {
  const { id } = req.params;
  const { remetente, texto } = req.body;

  if (!remetente || !texto) {
    return res.status(400).json({ sucesso: false, erro: 'Remetente e texto são obrigatórios' });
  }

  const sala = salas.find(s => s.id === id);

  if (!sala) {
    return res.status(404).json({ sucesso: false, erro: 'Sala não encontrada' });
  }

  const novaMensagem = {
    id: uuidv4(),
    remetente: remetente,
    texto: texto,
    tempo: new Date().toISOString(),
    sistema: false
  };

  sala.mensagens.push(novaMensagem);

  // Atualizar preview da sala
  sala.preview = texto.length > 50 ? texto.substring(0, 50) + '...' : texto;

  res.json({
    sucesso: true,
    mensagem: novaMensagem
  });
});

// GET /api/gerar-apelido - Gerar apelido aleatório
app.get('/api/gerar-apelido', (req, res) => {
  const numeroAleatorio = Math.floor(Math.random() * 9000) + 1000;
  const apelido = `BURN${numeroAleatorio}#`;

  res.json({
    sucesso: true,
    apelido: apelido
  });
});

// GET /api/gerar-nome-sala - Gerar nome aleatório para sala
app.get('/api/gerar-nome-sala', (req, res) => {
  const prefixos = ['Privada', 'Secreta', 'Anônima', 'Oculta', 'Segura', 'Criptografada', 'Fantasma', 'Silenciosa'];
  const sufixos = ['Sala', 'Espaço', 'Lugar', 'Canal', 'Central', 'Zona', 'Canto', 'Lounge'];
  const prefixoAleatorio = prefixos[Math.floor(Math.random() * prefixos.length)];
  const sufixoAleatorio = sufixos[Math.floor(Math.random() * sufixos.length)];
  const idAleatorio = Math.floor(Math.random() * 9000) + 1000;
  const nomeSala = `${prefixoAleatorio} ${sufixoAleatorio} ${idAleatorio}`;

  res.json({
    sucesso: true,
    nomeSala: nomeSala
  });
});

// Servir index.html para todas as rotas não-API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`BurnBox server running on http://localhost:${PORT}`);
});
