const express = require('express');
const router = express.Router();
const comprovanteController = require('../controllers/comprovanteController');

// Rota para receber comprovantes
router.post('/comprovantes', comprovanteController.receberComprovantes);

// Rota para buscar comprovantes por nome
router.get('/comprovantes/buscar', comprovanteController.buscarPorNome);

// Rota para atualizar o status de um comprovante (validar/invalidar)
router.patch('/comprovantes/:id/status', comprovanteController.atualizarStatus);

// Rota para excluir um comprovante
router.delete('/comprovantes/:id', comprovanteController.excluir);

module.exports = router;