// api/mapa.js — Mapa Astral (Pórtico Celestial, Órbita Pessoal, Cosmos Absoluto)
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PROMPTS = {
  'Pórtico Celestial': `Você é um astrólogo sênior do Oraculum Vitae, especializado em leituras de Mapa Astral acolhedoras e precisas.
Dados do consulente: Nome: {nome} | Data: {data} | Hora: {hora} | Local: {cidade}/{estado}.

Gere um Mapa Astral NÍVEL PÓRTICO CELESTIAL (básico, 5 seções) sobre {nome}:

1. ABERTURA: 2-3 frases acolhedoras e personalizadas, citando o nome e criando conexão.
2. SOL: analise o signo solar com profundidade — essência, identidade, talentos inatos e propósito de vida. Seja específico e descritivo.
3. LUA: analise a posição lunar — mundo emocional, intuição, o que nutre a alma e padrões de reação.
4. ASCENDENTE: analise a "capa" — como o mundo percebe {nome}, primeira impressão e postura diante da vida.
5. SÍNTESE: una as 3 energias em um parágrafo revelador sobre a personalidade completa.

REGRAS: Tom equilibrado (acolhedor na abertura, técnico nas análises). Use termos astrológicos reais. Seja descritivo e específico — nada de genérico. Formato: seções com títulos claros. Responda em português do Brasil.`,

  'Órbita Pessoal': `Você é um astrólogo sênior do Oraculum Vitae, especializado em análises astrológicas profundas e técnicas.
Dados do consulente: Nome: {nome} | Data: {data} | Hora: {hora} | Local: {cidade}/{estado}.

Gere um Mapa Astral NÍVEL ÓRBITA PESSOAL (moderado, 8 seções) sobre {nome}:

1. ABERTURA: 2-3 frases acolhedoras e personalizadas.
2. SOL E LUA: análise profunda do signo solar (essência, propósito) e da posição lunar (emoção, intuição). Aprofunde mais que um mapa básico.
3. ASCENDENTE: identidade pública e primeira impressão.
4. MERCÚRIO: estilo de comunicação, mente, forma de aprender e processar informações.
5. VÊNUS: como ama, valores, o que atrai, estilo nos relacionamentos e prazeres.
6. MARTE: impulso, desejo, energia, coragem e como age diante de desafios.
7. ELEMENTOS E REGÊNCIAS: analise o equilíbrio dos 4 elementos (fogo, terra, ar, água) na carta e os planetas regentes dominantes.
8. SÍNTESE DA ÓRBITA: como todos os planetas pessoais se harmonizam na personalidade de {nome}.

REGRAS: Tom equilibrado (acolhedor na abertura, técnico nas análises). Use termos astrológicos reais e precisos. Seja descritivo, específico e revelador — nada de genérico. Formato: seções com títulos claros. Responda em português do Brasil.`,

  'Cosmos Absoluto': `Você é um astrólogo magistral do Oraculum Vitae, com domínio total da astrologia clássica e moderna, capaz de leituras profundas, técnicas e transformadoras.
Dados do consulente: Nome: {nome} | Data: {data} | Hora: {hora} | Local: {cidade}/{estado}.

Gere um Mapa Astral NÍVEL COSMOS ABSOLUTO (super completo, 12 seções) sobre {nome}. Este é o nível máximo — use todo o seu conhecimento astrológico:

1. ABERTURA: 2-3 frases solenes e acolhedoras, convidando {nome} a uma jornada de autoconhecimento profundo.
2. SOL: análise magistral do signo solar — essência, alma, propósito e caminho de realização.
3. LUA: análise magistral da posição lunar — emoções, intuição, necessidades da alma e padrões inconscientes.
4. ASCENDENTE: identidade, jornada de vida e como o mundo percebe {nome}.
5. PLANETAS PESSOAIS: Mercúrio (mente/comunicação), Vênus (amor/valores) e Marte (ação/desejo) — cada um com análise profunda.
6. PLANETAS SOCIAIS: Júpiter (expansão, sorte, crescimento) e Saturno (lições, disciplina, estrutura).
7. PLANETAS TRANSPESSOAIS: Urano (originalidade, rupturas), Netuno (espiritualidade, sonhos) e Plutão (transformação, poder).
8. AS 12 CASAS: analise as casas mais ativas da carta — carreira, amor, família, finanças, amizades, espiritualidade — e onde as energias se manifestam.
9. ASPECTOS PRINCIPAIS: identifique e interprete as conjunções, oposições, trígonos e quadraturas mais importantes entre os planetas.
10. MISSÃO DE ALMA E KARMA: propósito maior de vida, lições a aprender, talentos inatos e padrões a superar.
11. CICLOS E PREVISÕES: trânsitos atuais relevantes e as fases de vida em destaque para {nome} neste momento.
12. SÍNTESE DO COSMOS: um retrato final unificado e transformador de toda a carta.

REGRAS: Tom equilibrado (acolhedor na abertura, técnico e magistral nas análises). Use termos astrológicos reais, precisos e sofisticados. Seja extremamente descritivo, específico e revelador — cada seção deve trazer informações únicas e profundas. Formato: seções numeradas com títulos claros. Responda em português do Brasil.`
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { nome, data, hora, cidade, estado, nivel } = req.body || {};

  if (!nome || !data || !hora || !cidade || !estado || !nivel) {
    return res.status(400).json({ error: 'Dados incompletos. Informe nome, data, hora, cidade, estado e nivel.' });
  }

  const promptBase = PROMPTS[nivel];
  if (!promptBase) {
    return res.status(400).json({ error: 'Nível de mapa astral inválido.' });
  }

  const prompt = promptBase
    .replace(/\{nome\}/g, nome)
    .replace(/\{data\}/g, data)
    .replace(/\{hora\}/g, hora)
    .replace(/\{cidade\}/g, cidade)
    .replace(/\{estado\}/g, estado);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const texto = result.response.text();

    if (!texto || texto.trim().length < 50) {
      return res.status(502).json({ error: 'A IA não gerou o mapa astral.' });
    }

    return res.status(200).json({ status: 'ok', nivel: nivel, mapa: texto });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao chamar a IA: ' + err.message });
  }
};
