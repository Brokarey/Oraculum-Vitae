// api/numerologia.js — Numerologia Pitagórica (grátis e premium)
const PROMPTS = {
  'gratis': `Você é um numerólogo sênior do Oraculum Vitae, especializado em numerologia pitagórica.
Dados do consulente: Nome: {nome} | Data de nascimento: {data}.
Calcule os 4 pilares da numerologia pitagórica e gere um perfil acolhedor e preciso sobre {nome}:
1. MOTIVAÇÃO (ALMA): o número da soma das vogais do nome — o que move a pessoa por dentro, seus desejos da alma.
2. IMPRESSÃO (EGO): o número da soma das consoantes — como a pessoa se apresenta e é percebida.
3. EXPRESSÃO (PERSONALIDADE): o número da soma de todas as letras — os talentos e a forma de se expressar.
4. DESTINO (CAMINHO DE VIDA): o número da soma da data de nascimento — a missão e o propósito de vida.
Para cada pilar: apresente o número calculado e um texto curto (3-4 frases) e dissertativo, específico e revelador sobre o significado daquele número para {nome}.
REGRAS: Tom acolhedor e preciso. Use termos numerológicos reais. Seja específico — nada de genérico. Formato: seções com títulos claros. Responda em português do Brasil.`,
  'premium': `Você é um numerólogo magistral do Oraculum Vitae, com domínio total da numerologia pitagórica.
Dados do consulente: Nome: {nome} | Data de nascimento: {data} | Ano atual: {ano}.
Gere um perfil numerológico COMPLETO e aprofundado sobre {nome}, com textos longos, dissertativos e personalizados para cada seção:
1. MOTIVAÇÃO (ALMA): vogais do nome — desejos da alma.
2. IMPRESSÃO (EGO): consoantes — como é percebido.
3. EXPRESSÃO (PERSONALIDADE): todas as letras — talentos e expressão.
4. DESTINO (CAMINHO DE VIDA): data de nascimento — missão de vida.
5. ATITUDE: dia + mês de nascimento — a primeira impressão que passa.
6. ANIVERSÁRIO: o dia do nascimento — seu presente de nascimento.
7. ANO PESSOAL: dia + mês + ano atual — a energia do ano presente ({ano}).
8. MÊS PESSOAL: ano pessoal + mês atual — a energia do momento.
9. CICLOS DE VIDA: Formação, Produtividade e Colheita — as fases da vida.
10. DESAFIOS (LIÇÕES DE VIDA): os 4 desafios numerológicos — obstáculos a superar.
11. TALISMÃ: cor, dia da semana e números de sorte ligados ao número do destino.
12. NÚMEROS MESTRES: destaque se 11, 22 ou 33 aparecerem.
Para cada seção: apresente o número calculado e um texto longo, dissertativo e profundamente personalizado, específico e transformador.
REGRAS: Tom acolhedor na abertura, técnico e magistral nas análises. Use termos numerológicos reais. Seja extremamente descritivo e específico — cada seção deve trazer informações únicas. Formato: seções numeradas com títulos claros. Responda em português do Brasil.`
};
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { nome, data, tipo } = req.body || {};
  if (!nome || !data || !tipo) {
    return res.status(400).json({ error: 'Dados incompletos. Informe nome, data e tipo.' });
  }
  const promptBase = PROMPTS[tipo];
  if (!promptBase) {
    return res.status(400).json({ error: 'Tipo de numerologia inválido.' });
  }
  const ano = String(new Date().getFullYear());
  const prompt = promptBase
    .replace(/\{nome\}/g, nome)
    .replace(/\{data\}/g, data)
    .replace(/\{ano\}/g, ano);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
  }
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + apiKey;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await resp.json();
    const texto = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : '';
    if (!texto || texto.trim().length < 50) {
      return res.status(502).json({ error: 'A IA não gerou a numerologia.' });
    }
    return res.status(200).json({ status: 'ok', tipo: tipo, resposta: texto });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao chamar a IA: ' + err.message });
  }
};
