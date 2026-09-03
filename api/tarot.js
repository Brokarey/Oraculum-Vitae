// api/tarot.js — Oraculum Vitae com IA (Gemini 3.6 Flash)
const { processarReembolso } = require('./creditos.js');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { pergunta, cartas, baralho, area } = req.body || {};

  if (!pergunta || !cartas || cartas.length === 0) {
    return res.status(400).json({ error: 'Envie a pergunta e as cartas.' });
  }
  // ===== FILTRO DE PERGUNTA SEM SENTIDO (POR PALAVRA) =====
  function ehSemSentido(texto) {
    if (!texto) return true;
    var t = texto.trim();
    if (t.length < 4) return true;

    // Palavras comuns do português (conectivos, verbos, pronomes)
    var comuns = ['vou','eu','quero','saber','meu','minha','me','se','o','a','os','as','um','uma','de','do','da','dos','das','em','no','na','nos','nas','com','para','por','que','qual','quem','como','quando','onde','porque','ser','estou','esta','estao','tem','ter','fazer','vai','vamos','pode','posso','preciso','gostaria','amor','trabalho','dinheiro','saude','vida','futuro','relacionamento','casa','familia','hoje','amanha','agora','sempre','nunca','isso','isto','aquilo','ele','ela','eles','elas','voce','nos','nossa','nosso','essa','esse','esta','este','ano','mes','dia','semana','novo','nova','conseguir','acontecer','sera','sera','vira','virao'];

    var palavras = t.toLowerCase().split(/\s+/);
    var invalidas = 0;
    var total = 0;

    for (var i = 0; i < palavras.length; i++) {
      var p = palavras[i].replace(/[^a-zà-ú]/gi, '');
      if (p.length === 0) continue;
      total++;

      if (comuns.indexOf(p) > -1) continue;              // palavra conhecida → ok

      if (!/[aeiouáéíóúâêôãõà]/.test(p)) { invalidas++; continue; }  // sem vogal → inválida

      if (/([bcdfghjklmnpqrstvwxyz]{3,})/.test(p)) { invalidas++; continue; }  // 3+ consoantes seguidas → inválida

      if (p.length <= 2) { invalidas++; continue; }      // muito curta e estranha → inválida
    }

    if (total === 0) return true;
    if (invalidas === total) return true;                 // nenhuma palavra válida
    if (invalidas / total > 0.5) return true;            // maioria inválida
    return false;
  }
  // ===== FIM DO FILTRO =====
   if (ehSemSentido(pergunta)) {
    return res.status(200).json({
      status: 'reformular',
      mensagem: 'Sua pergunta não foi compreendida. O crédito foi devolvido. Reformule por favor.',
      reembolsoEfetuado: true
    });
  }
  // ===== FIM DO FILTRO =====
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
  }

  const modelo = 'gemini-3.6-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent?key=' + apiKey;

  // Monta a lista de cartas com todos os significados do site
  const cartasTexto = cartas.map(function (c, i) {
    var linha = (i + 1) + '. ' + c.nome;
    if (c.posicao) linha += ' (posição: ' + c.posicao + ')';
    if (c.descricao) linha += ' | Energia: ' + c.descricao;
    if (c.cenario) linha += ' | Significado principal: ' + c.cenario;
    if (c.caminho) linha += ' | Conselho/desdobramento: ' + c.caminho;
    if (c.postura) linha += ' | Postura/outro: ' + c.postura;
    return linha;
  }).join('\n');

  // Determina o método e o nº de parágrafos (regra: 1 parágrafo por carta)
  var metodo = (baralho || '').toLowerCase();
  var numParagrafos = cartas.length;
  var instrucoesEspecificas = '';

  if (metodo.indexOf('dia') > -1) {
    numParagrafos = 1;
    instrucoesEspecificas = 'Esta é a Carta do Dia. A área da vida sorteada foi: "' + area + '". Interprete a carta EXCLUSIVAMENTE nessa área, como um conselho único e direcionado para as próximas 24 horas. Um único parágrafo rico e específico.';
  } else if (metodo.indexOf('sim') > -1 || metodo.indexOf('nao') > -1 || metodo.indexOf('talvez') > -1) {
    numParagrafos = 1;
    instrucoesEspecificas = 'Este é o método Sim, Não ou Talvez. Comece o parágrafo com um veredito claro (Sim, Não ou Talvez), seguido de uma explicação profunda e coerente com a carta, respondendo diretamente à pergunta.';
  } else if (metodo.indexOf('afrodite') > -1) {
    numParagrafos = 7;
    instrucoesEspecificas = 'Este é o Templo de Afrodite (Tarô do Amor, 7 cartas). Cartas 1-3 = O Consulente (1 Mental, 2 Emocional, 3 Físico/Instintivo); Cartas 4-6 = O Parceiro (4 Mental, 5 Emocional, 6 Físico/Instintivo); Carta 7 = O Futuro da relação. Interprete cada carta na posição e compare os pares (1x4, 2x5, 3x6) para revelar se pensamentos, sentimentos e química se alinham. 7 parágrafos, um por carta, tom afetivo e profundo.';
  } else if (metodo.indexOf('marselha') > -1) {
    numParagrafos = 3;
    instrucoesEspecificas = 'Este é o Tarô de Marselha (3 cartas), revelando uma linha do tempo: Carta 1 = O Passado (a origem/raiz do problema), Carta 2 = O Presente (o momento atual), Carta 3 = O Futuro (o caminho provável). Interprete cada carta na posição temporal, com o estilo tradicional e atemporal do Tarô de Marselha. 3 parágrafos, um por carta.';
  } else if (metodo.indexOf('2 carta') > -1 || metodo.indexOf('duas carta') > -1) {
    numParagrafos = 2;
    instrucoesEspecificas = 'Tarô de 2 Cartas. Carta 1 (Arcano Maior) = o tema central, a energia arquetípica dominante e a grande lição. Carta 2 (Arcano Menor) = a aplicação prática no cotidiano, as ações imediatas e os detalhes do dia a dia. 2 parágrafos, um por carta.';
  } else if (metodo.indexOf('3 carta') > -1) {
    numParagrafos = 3;
    instrucoesEspecificas = 'Tarô de 3 Cartas (Passado, Presente e Futuro). Carta 1 = Passado, Carta 2 = Presente, Carta 3 = Futuro. Construa uma narrativa linear e integrada. 3 parágrafos, um por carta.';
  } else if (metodo.indexOf('5 carta') > -1) {
    numParagrafos = 5;
    instrucoesEspecificas = 'Tarô de 5 Cartas (Método em Cruz - Sistema Péladan). Carta 1 = O que está a favor, Carta 2 = O que está contra, Carta 3 = O Caminho (ação necessária), Carta 4 = O Desfecho (resultado), Carta 5 = A Síntese (energia central que une as outras). 5 parágrafos, um por carta.';
  } else if (metodo.indexOf('7 carta') > -1) {
    numParagrafos = 7;
    instrucoesEspecificas = 'Tarô de 7 Cartas (Método da Ferradura). Carta 1 = O Passado, Carta 2 = O Presente, Carta 3 = O Futuro Próximo, Carta 4 = A Atitude, Carta 5 = O Entorno, Carta 6 = Obstáculos ou Conselho, Carta 7 = O Resultado. 7 parágrafos, um por carta.';
  } else if (metodo.indexOf('10 carta') > -1) {
    numParagrafos = 10;
    instrucoesEspecificas = 'Tarô de 10 Cartas (Cruz Celta). Carta 1 = Momento Atual, Carta 2 = Obstáculo, Carta 3 = Base/Raiz, Carta 4 = Passado Recente, Carta 5 = Topo/Coroamento, Carta 6 = Futuro Imediato, Carta 7 = O Consulente, Carta 8 = Ambiente Externo, Carta 9 = Esperanças e Medos, Carta 10 = Resultado Final. 10 parágrafos, um por carta, como um raio-X completo da situação.';
  } else {
    instrucoesEspecificas = 'Interprete cada carta na ordem tirada, em relação à pergunta. ' + numParagrafos + ' parágrafos, um por carta.';
  }

var prompt = 'Você é um tarólogo mestre com décadas de experiência, conhecido por leituras profundas, sensíveis e transformadoras. Escreve em português do Brasil, com estilo rico, fluido e envolvente.\n\n' +
  'EXIGÊNCIA DE IDIOMA: escreva SEMPRE em português do Brasil, com ortografia impecável, sem nenhum erro de acentuação, concordância, regência ou pontuação. Revise mentalmente antes de responder.\n\n' +
   'ANTES DE TUDO, avalie a pergunta do consulente: "' + pergunta + '".\n' +
  '- Se a pergunta for SEM SENTIDO, GIBBERISH, texto aleatório, letras soltas ou sem significado algum (ex.: "vou dsfd dfdfd", "asdf", "xcvbnm"): responda com o status "reformular" e uma mensagem acolhedora dizendo que a pergunta não foi compreendida, que o crédito desta consulta foi devolvido e pedindo para ele reformular com uma pergunta clara e específica.\n' +
  '- Se a pergunta for VAGA, GENÉRICA ou sem contexto (ex.: "me diz meu futuro", "o que vai acontecer", "tô confuso, me ajuda"): responda apenas com o status "reformular" e uma mensagem acolhedora explicando o padrão de pergunta específica (quem, o quê, contexto, prazo) e um exemplo.\n' +
  '- Se a pergunta for ESPECÍFICA, coerente e fizer sentido: responda com o status "leitura".\n\n' +
  'Método utilizado: ' + (baralho || 'Tarô') + ' — ' + cartas.length + ' carta(s).\n\n' +
  'Cartas sorteadas NA ORDEM EM QUE FORAM TIRADAS (respeite rigorosamente esta ordem):\n' + cartasTexto + '\n\n' +
  instrucoesEspecificas + '\n\n' +
  'Regras da leitura:\n' +
  '1. Se a pergunta for válida, gere EXATAMENTE ' + numParagrafos + ' parágrafo(s) de interpretação.\n' +
  '2. Cada parágrafo interpreta UMA carta, na ordem tirada, em relação à pergunta e à posição dela. Não pule nem misture cartas.\n' +
  '3. Os parágrafos devem ter COERÊNCIA e LÓGICA entre si: um conecta-se ao seguinte, construindo uma narrativa única e progressiva.\n' +
  '4. Seja ÚNICO e ORIGINAL: nada de textos genéricos ou prontos. Cada leitura parece feita sob medida para esta pergunta e estas cartas.\n' +
  '5. Equilibre simbolismo, arquétipo, emoção, psicologia e conselho prático.\n' +
  '6. Tom acolhedor, sábio, poético quando apropriado. NUNCA alarmista, NUNCA determinista, NUNCA com clichês de horóscopo.\n' +
  '7. A resposta DEVE começar com "<strong>RESPOSTA:</strong>" (a palavra RESPOSTA em negrito, seguida de dois-pontos) e, logo depois, o conteúdo da leitura. Nada antes disso.\n' +
  '8. Separe os parágrafos com dupla quebra de linha (\\n\\n). Use texto simples, sem marcadores, sem emojis, sem títulos, exceto o "<strong>RESPOSTA:</strong>" inicial.';

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              status: { type: 'STRING', enum: ['reformular', 'leitura'] },
              mensagem: { type: 'STRING' },
              resposta: { type: 'STRING' }
            },
            required: ['status']
          }
        }
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      return res.status(502).json({ error: 'Erro do Gemini: ' + JSON.stringify(dados) });
    }

    const raw = dados && dados.candidates && dados.candidates[0] && dados.candidates[0].content && dados.candidates[0].content.parts && dados.candidates[0].content.parts[0] ? dados.candidates[0].content.parts[0].text : null;

    if (!raw) {
      return res.status(502).json({ error: 'A IA não retornou resposta. Detalhes: ' + JSON.stringify(dados) });
    }

     function extrairJSON(texto) {
      if (typeof texto !== 'string') return null;
      var t = texto.trim();
      if (!t) return null;
      var inicio = t.indexOf('{');
      var fim = t.lastIndexOf('}');
      if (inicio > -1 && fim > inicio) {
        t = t.substring(inicio, fim + 1);
      }
      try { return JSON.parse(t); } catch (e) { return null; }
    }
    var parsed = extrairJSON(raw);
    if (!parsed || !parsed.status) {
      return res.status(502).json({ error: 'Resposta da IA em formato inesperado: ' + raw });
    }
    if (parsed.status === 'reformular') {
  // A pergunta não foi compreendida → devolve o crédito ao usuário
  const reembolso = await processarReembolso(parsed, (req.body.usuarioId || null), (req.body.custo || 0));
  return res.status(200).json({
    status: 'reformular',
    mensagem: reembolso.mensagem,
    reembolsoEfetuado: reembolso.reembolsou
  });
}

    if (!parsed.resposta) {
      return res.status(502).json({ error: 'A IA não gerou a leitura.' });
    }

    res.status(200).json({ status: 'leitura', resposta: parsed.resposta, area: area || null });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao chamar a IA: ' + err.message });
  }
}
