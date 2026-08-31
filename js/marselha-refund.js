/**
 * Sistema de Reembolso - Tarão de Marselha
 * Quando a IA não consegue responder, retorna os 30 créditos automaticamente
 */

function reembolsarMarselhA(email, creditosDeduzidos) {
  try {
    var user = findUser(email);
    if (!user) return false;

    // ✅ RETORNA OS CRÉDITOS
    user.credits += creditosDeduzidos;
    saveUser(user);
    updateCreditsDisplay();

    // 📝 LOG DO REEMBOLSO (para auditoria)
    var logKey = 'refund_log_marselha_' + email;
    var logs = JSON.parse(localStorage.getItem(logKey) || '[]');
    logs.push({
      data: new Date().toISOString(),
      tipo: 'Tarão de Marselha',
      creditos: creditosDeduzidos,
      saldo_anterior: user.credits - creditosDeduzidos,
      saldo_novo: user.credits
    });
    localStorage.setItem(logKey, JSON.stringify(logs));

    return true;
  } catch (err) {
    console.error('Erro ao processar reembolso Marselha:', err);
    return false;
  }
}

function mostrarNotificacaoReembolsoMarselha(creditos) {
  var msg = '✨ Créditos retornados! +' + creditos + ' créditos restaurados (Tarão de Marselha)';
  showModal('Reembolso Automático', msg);
}