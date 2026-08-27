// api/tarot.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { pergunta, cartas, baralho } = req.body || {};

  if (!pergunta || !cartas || cartas.length === 0) {
    return res.status(400).json({ error: 'Envie a pergunta e as cartas.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
  }

  const modelo = 'gemini-2.0-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent?key=' + apiKey;

  const cartasTexto = cartas.map(function(c){
    return '- ' + c.nome + (c.posicao ? ' (posição: ' + c.posicao + ')' : '');
  }).join('\n');

  const prompt = 'Você é um tarólogo experiente e acolhedor. O consulente fez a seguinte pergunta: "' + pergunta + '".\n\n' +
    'Cartas sorteadas (baralho: ' + (baralho || 'Tarô') + '):\n' + cartasTexto + '\n\n' +
    'Interpretação:\n' +
    '- Interprete cada carta SEMPRE em relação à pergunta feita.\n' +
    '- Equilibre simbolismo esotérico com conselho prático.\n' +
    '- Escreva exatamente ' + cartas.length + ' parágrafo(s) — um para cada carta.\n' +
    '- Seja acolhedor, claro e sem alarmismo.';

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 1024 }
      })
    });

    const dados = await resposta.json();

    // MOSTRA o erro real do Gemini, se houver
    if (!resposta.ok) {
      return res.status(502).json({ error: 'Erro do Gemini: ' + JSON.stringify(dados) });
    }

    const texto = dados && dados.candidates && dados.candidates[0] && dados.candidates[0].content && dados.candidates[0].content.parts && dados.candidates[0].content.parts[0] ? dados.candidates[0].content.parts[0].text : null;

    if (!texto) {
      return res.status(502).json({ error: 'A IA não retornou resposta. Detalhes: ' + JSON.stringify(dados) });
    }

    res.status(200).json({ resposta: texto });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao chamar a IA: ' + err.message });
  }
}
