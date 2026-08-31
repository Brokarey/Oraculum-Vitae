/**
 * Integração IA para Tarão de Marselha
 * Detecta quando a IA falha e retorna os 30 créditos automaticamente
 */

var originalBuildMarselha = window.buildMarselhaNarrative;

window.buildMarselhaNarrative = function(cards, pergunta) {
  if (!cards || !cards.length) return originalBuildMarselha.apply(null, arguments);

  var id = 'ia-marselha-' + Date.now() + '-' + Math.floor(Math.random() * 9999);

  setTimeout(function() {
    fetch('/api/tarot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pergunta: pergunta || '',
        cartas: cards.map(function(c) {
          return {
            nome: c.n,
            descricao: c.d,
            cenario: c.cen,
            caminho: c.cam,
            postura: c.out
          };
        }),
        baralho: 'Tarão de Marselha',
        area: null
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var el = document.getElementById(id);
      if (!el) return;

      if (d && d.status === 'reformular') {
        // ❌ IA NÃO CONSEGUIU RESPONDER → REEMBOLSAR 30 CRÉDITOS
        reembolsarMarselhA(currentUser.email, 30);
        mostrarNotificacaoReembolsoMarselha(30);

        el.outerHTML = '<div class="ia-aviso" style="margin:10px 0;padding:12px;border:1px solid #c9a86a55;border-radius:8px;background:#c9a86a11"><p style="margin:0 0 6px;color:#c9a86a"><strong>✨ O oráculo pede uma pergunta mais específica</strong></p><p style="margin:0">' + d.mensagem + '</p><p style="margin:8px 0 0;font-size:13px;color:#aaa">Refaça a pergunta com detalhes e sorteie novamente.</p></div>';
      } else if (d && d.resposta) {
        // ✅ IA RESPONDEU COM SUCESSO
        el.outerHTML = '<div class="ia-resposta" style="margin:10px 0">' + formatarRespostaIA(d.resposta, null) + '</div>';
      } else {
        // ⚠️ ERRO NA API → REEMBOLSAR 30 CRÉDITOS
        reembolsarMarselhA(currentUser.email, 30);
        mostrarNotificacaoReembolsoMarselha(30);

        el.outerHTML = originalBuildMarselha.apply(null, arguments);
      }
    })
    .catch(function(err) {
      // ⚠️ ERRO DE CONEXÃO → REEMBOLSAR 30 CRÉDITOS
      console.error('Erro na consulta Marselha:', err);
      reembolsarMarselhA(currentUser.email, 30);
      mostrarNotificacaoReembolsoMarselha(30);

      var el = document.getElementById(id);
      if (el) el.outerHTML = originalBuildMarselha.apply(null, arguments);
    });
  }, 30);

  return '<div id="' + id + '" style="text-align:center;padding:14px;color:#c9a86a;font-style:italic">Consultando o oráculo...</div>';
};