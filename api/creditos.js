// api/creditos.js — sistema de créditos (em construção)
function processarReembolso(parsed, usuarioId, custo) {
  // TODO: integrar com o sistema de créditos quando estiver pronto
  var mensagem = 'Sua pergunta não foi compreendida. O crédito desta consulta foi devolvido. Reformule com uma pergunta clara e específica.';
  return Promise.resolve({ mensagem: mensagem, reembolsou: false });
}
module.exports = { processarReembolso };
