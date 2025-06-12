const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

// Rota de registro
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, hash]
    );
    res.status(201).json({ message: 'Usuário registrado com sucesso!', usuario: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'E-mail já registrado' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

module.exports = router;
