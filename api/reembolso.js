// api/reembolso.js
   'use strict';
   const { processarReembolso } = require('./utils/reembolsoService');

   module.exports = async function handler(req, res) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Método não permitido' });
     }

     const { consultaId, usuarioId, custo, motivo } = req.body || {};

     if (!consultaId || !usuarioId || !custo) {
       return res.status(400).json({ error: 'consultaId, usuarioId e custo são obrigatórios.' });
     }

     const resultado = await processarReembolso(
       { consultaId, usuarioId, custo, motivo },
       usuarioId,
       custo
     );

     return res.status(200).json({
       mensagem: resultado.mensagem,
       reembolsado: resultado.reembolsou,
     });
   };
