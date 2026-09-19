   // api/utils/reembolsoService.js
   'use strict';
   const { createClient } = require('@supabase/supabase-js');

   const MENSAGEM_REEMBOLSO =
     'Sua pergunta não foi compreendida. O crédito desta consulta foi devolvido. Reformule com uma pergunta clara e específica.';

   let supabaseAdmin;

   function obterClienteAdmin() {
     if (supabaseAdmin) return supabaseAdmin;

     const url = process.env.SUPABASE_URL;
     const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

     if (!url || !serviceRoleKey) {
       throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configuradas no servidor.');
     }

     supabaseAdmin = createClient(url, serviceRoleKey, {
       auth: {
         autoRefreshToken: false,
         persistSession: false,
       },
     });

     return supabaseAdmin;
   }

   function extrairConsultaId(parsed) {
     if (!parsed || typeof parsed !== 'object') return null;
     return (
       parsed.consultaId ||
       parsed.consulta_id ||
       parsed.idConsulta ||
       parsed.id_consulta ||
       null
     );
   }

   function ehUuid(valor) {
     return typeof valor === 'string' &&
       /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor);
   }

   /**
    * Devolve o crédito de uma consulta somente uma vez.
    * @param {Object} parsed   – objeto que contém o ID da consulta
    * @param {string} usuarioId – UUID do usuário
    * @param {number} custo    – quantidade de créditos a devolver
    * @returns {Promise<{mensagem:string, reembolsou:boolean}>}
    */
   async function processarReembolso(parsed, usuarioId, custo) {
     const consultaId = extrairConsultaId(parsed);
     const quantidade = Number(custo);

     if (!ehUuid(consultaId) || !ehUuid(usuarioId) || !Number.isInteger(quantidade) || quantidade <= 0) {
       return { mensagem: MENSAGEM_REEMBOLSO, reembolsou: false };
     }

     try {
       const supabase = obterClienteAdmin();

       // 1️⃣ Verifica se a consulta existe, pertence ao usuário e tem o custo correto
       const { data: consulta, error: consultaError } = await supabase
         .from('consultas')
         .select('id, usuario_id, custo, reembolsada')
         .eq('id', consultaId)
         .maybeSingle();

       if (consultaError) throw consultaError;

       if (!consulta || consulta.usuario_id !== usuarioId || Number(consulta.custo) !== quantidade) {
         return { mensagem: MENSAGEM_REEMBOLSO, reembolsou: false };
       }

       // 2️⃣ Chama a função SQL que impede reembolso duplo
       const { data: reembolsou, error: reembolsoError } = await supabase.rpc(
         'reembolsar_consulta',
         {
           p_consulta_id: consultaId,
           p_motivo: 'Pergunta não compreendida ou resposta inválida',
         }
       );

       if (reembolsoError) throw reembolsoError;

       // 3️⃣ (Opcional) grava auditoria
       await supabase.from('historico_reembolsos').insert({
         consulta_id: consultaId,
         usuario_id: usuarioId,
         custo: quantidade,
         motivo: 'Pergunta não compreendida',
         criado_em: new Date().toISOString(),
         sucesso: reembolsou === true,
       });

       return {
         mensagem: MENSAGEM_REEMBOLSO,
         reembolsou: reembolsou === true,
       };
     } catch (error) {
       console.error('Falha ao processar reembolso:', error);
       return { mensagem: MENSAGEM_REEMBOLSO, reembolsou: false };
     }
   }

   module.exports = { processarReembolso };
