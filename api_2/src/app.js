const express = require('express');
const cors = require('cors');
const comprovanteRoutes = require('./routes/comprovanteRoutes');
const { sequelize } = require('./config/database');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Sincronizar com o banco de dados
sequelize.sync()
    .then(() => {
        console.log('Conexão com o banco de dados estabelecida com sucesso');
    })
    .catch(err => {
        console.error('Erro ao conectar com o banco de dados:', err);
    });

// Rotas
app.use('/api', comprovanteRoutes);

// Middleware de erro
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

module.exports = app;