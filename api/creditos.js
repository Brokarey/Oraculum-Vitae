// api/creditos.js — Lógica de reembolso de créditos
// Quando a pergunta NÃO é compreendida pela IA, o crédito é devolvido ao usuário.

// ============================================================
// FUNÇÃO DE REEMBOLSO
// Por enquanto NÃO existe sistema de créditos no site.
// Esta função é o "ponto de ligação" pronto para quando o
// sistema de créditos for criado. Basta implementar o corpo
// com a lógica real do seu banco de dados.
// ============================================================
async function devolverCreditos(userId, custo) {
  // >>> AQUI ENTRA A LÓGICA REAL DE REEMBOLSO QUANDO O SISTEMA DE CRÉDITOS EXISTIR <<<
  // Exemplo futuro (Firebase/Supabase/MongoDB):
  // await db.collection('usuarios').doc(userId).update({
  //   creditos: firebase.firestore.FieldValue.increment(custo)
  // });

  // Por enquanto: retorna sucesso (nada a reembolsar, sistema ainda não existe)
  return { sucesso: true, reembolsado: custo || 0 };
}

// ============================================================
// PROCESSADOR DE REEMBOLSO
// Verifica se a resposta da IA indica que a pergunta NÃO foi
// compreendida (status 'reformular'). Se sim, devolve o crédito.
// ============================================================
async function processarReembolso(parsed, userId, custo) {
  // Só reembolsa quando a IA não compreendeu a pergunta
  if (parsed && parsed.status === 'reformular') {
    const resultado = await devolverCreditos(userId, custo);
    return {
      reembolsou: true,
      mensagem: 'Sua pergunta não foi compreendida. O crédito desta consulta foi devolvido. Por favor, reformule sua pergunta e tente novamente.',
      detalhes: resultado
    };
  }
  return { reembolsou: false };
}

module.exports = { devolverCreditos, processarReembolso };
