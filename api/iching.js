export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido'
    });
  }

  try {
    const {
      pergunta,
      metodo,
      hexagrama,
      hexagramaMutante,
      linhasMoveis,
      foco
    } = req.body || {};

    if (!pergunta || !hexagrama) {
      return res.status(400).json({
        erro: 'Dados incompletos'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        erro: 'Chave da IA não configurada no servidor'
      });
    }

    const prompt = `
Você é um intérprete do I Ching, o Livro das Mutações.

Escreva uma leitura única, acolhedora e reflexiva em português do Brasil,
com aproximadamente 350 a 500 palavras. Relacione a interpretação
diretamente à pergunta do consulente. Não faça promessas absolutas,
não trate a leitura como diagnóstico e não substitua aconselhamento
médico, psicológico, jurídico ou financeiro.

Método: ${metodo || 'I Ching'}
Pergunta: ${pergunta}

Hexagrama principal:
${JSON.stringify(hexagrama)}

Hexagrama mutante:
${JSON.stringify(hexagramaMutante || null)}

Linhas móveis:
${JSON.stringify(linhasMoveis || [])}

Foco do dia:
${foco || 'Não se aplica'}

Escreva em parágrafos fluidos, sem listas numeradas.
Termine com um conselho prático e equilibrado.
`;

    const respostaGemini = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
      encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1200
          }
        })
      }
    );

    const dados = await respostaGemini.json();

    if (!respostaGemini.ok) {
      console.error('Erro Gemini:', dados);
      return res.status(502).json({
        erro: 'A IA não respondeu corretamente'
      });
    }

    const texto =
      dados &&
      dados.candidates &&
      dados.candidates[0] &&
      dados.candidates[0].content &&
      dados.candidates[0].content.parts &&
      dados.candidates[0].content.parts[0] &&
      dados.candidates[0].content.parts[0].text;

    if (!texto) {
      return res.status(502).json({
        erro: 'A IA retornou uma resposta vazia'
      });
    }

    return res.status(200).json({
      resposta: texto,
      foco: foco || null
    });
  } catch (erro) {
    console.error('Erro interno:', erro);

    return res.status(500).json({
      erro: 'Erro interno ao consultar o oráculo'
    });
  }
}
