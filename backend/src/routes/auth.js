const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registro
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const hashed = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, hashed]
    );
    res.status(201).json({ usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar usuário', detalhe: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ erro: 'Usuário não encontrado' });

    const usuario = result.rows[0];
    const valido = await bcrypt.compare(senha, usuario.senha_hash);
    if (!valido) return res.status(401).json({ erro: 'Senha inválida' });

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, {
      expiresIn: '2h'
    });

    res.json({ mensagem: 'Login bem-sucedido', token });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao fazer login', detalhe: err.message });
  }
});

module.exports = router;
