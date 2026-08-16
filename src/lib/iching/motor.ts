// ============================================================
// MOTOR DO I CHING — MÉTODO DAS TRÊS MOEDAS
// ============================================================
// Regras do método clássico:
// - Cada moeda: cara (yang) = 3 pontos | coroa (yin) = 2 pontos
// - 3 moedas por lance, total por lance entre 6 e 9
// - 6 = yin mutável | 7 = yang fixo | 8 = yin fixo | 9 = yang mutável
// - Linhas mutáveis (6 e 9) geram o hexagrama derivado (mutação)
// ============================================================

export type ValorLinha = 6 | 7 | 8 | 9;

export interface Linha {
  posicao: number;      // 1 (base) a 6 (topo)
  valor: ValorLinha;    // 6, 7, 8 ou 9
  isYang: boolean;      // true = linha inteira (yang), false = linha partida (yin)
  isMutavel: boolean;   // true se valor é 6 ou 9
}

export interface ResultadoConsulta {
  linhas: Linha[];
  hexagramaBase: number;      // número do hexagrama original (1-64)
  hexagramaMutacao: number;   // número do hexagrama derivado (após mutações)
  temMutacao: boolean;        // true se houver pelo menos uma linha mutável
  linhasMutaveis: number[];   // posições das linhas mutáveis
  trigramaInferior: string;   // nome do trigrama inferior
  trigramaSuperior: string;   // nome do trigrama superior
}

// ============================================================
// SORTEIO DAS TRÊS MOEDAS
// ============================================================
// Simula o lançamento de 3 moedas. Cada moeda retorna 2 (coroa) ou 3 (cara).
// O total só pode ser 6, 7, 8 ou 9 — exatamente como no método tradicional.
function lancarTresMoedas(): ValorLinha {
  const moeda1 = Math.random() < 0.5 ? 2 : 3;
  const moeda2 = Math.random() < 0.5 ? 2 : 3;
  const moeda3 = Math.random() < 0.5 ? 2 : 3;
  const total = moeda1 + moeda2 + moeda3;
  return total as ValorLinha;
}

// ============================================================
// CONSTRUÇÃO DAS 6 LINHAS (de baixo para cima)
// ============================================================
function construirLinhas(): Linha[] {
  const linhas: Linha[] = [];
  for (let posicao = 1; posicao <= 6; posicao++) {
    const valor = lancarTresMoedas();
    linhas.push({
      posicao,
      valor,
      isYang: valor === 7 || valor === 9,
      isMutavel: valor === 6 || valor === 9,
    });
  }
  return linhas;
}

// ============================================================
// TRIGRAMAS
// ============================================================
// Cada trigrama é representado por 3 linhas (de baixo para cima).
// 1 = yang (linha inteira), 0 = yin (linha partida).
// CORRIGIDO: Xun (Vento) = 011 e Dui (Lago) = 110.
export const TRIGRAMAS: Record<string, string> = {
  '111': 'Qian (O Céu)',
  '000': 'Kun (A Terra)',
  '100': 'Zhen (O Trovão)',
  '010': 'Kan (A Água)',
  '001': 'Gen (A Montanha)',
  '011': 'Xun (O Vento)',
  '101': 'Li (O Fogo)',
  '110': 'Dui (O Lago)',
};

// Converte as 6 linhas em dois trigramas (inferior e superior)
function extrairTrigramas(linhas: Linha[]): { inferior: string; superior: string } {
  // Linhas 1,2,3 = trigrama inferior (de baixo para cima)
  const binInferior = linhas
    .slice(0, 3)
    .map((l) => (l.isYang ? '1' : '0'))
    .join('');
  // Linhas 4,5,6 = trigrama superior (de baixo para cima)
  const binSuperior = linhas
    .slice(3, 6)
    .map((l) => (l.isYang ? '1' : '0'))
    .join('');

  return {
    inferior: TRIGRAMAS[binInferior] ?? 'Desconhecido',
    superior: TRIGRAMAS[binSuperior] ?? 'Desconhecido',
  };
}

// ============================================================
// TABELA DE HEXAGRAMAS (número -> padrão binário das 6 linhas)
// ============================================================
// Sequência King Wen tradicional. Cada padrão = trigrama inferior (3 bits)
// + trigrama superior (3 bits), lidos de baixo para cima (1 = yang, 0 = yin).
// CORRIGIDO: todos os 64 padrões conferidos contra os trigramas tradicionais.
export const TABELA_HEXAGRAMAS: Record<number, string> = {
  1: '111111',  2: '000000',  3: '100010',  4: '010001',
  5: '111010',  6: '010111',  7: '000010',  8: '010000',
  9: '111011', 10: '110111', 11: '111000', 12: '000111',
  13: '111101', 14: '101111', 15: '001000', 16: '000100',
  17: '100110', 18: '011001', 19: '110000', 20: '000011',
  21: '100101', 22: '101001', 23: '000001', 24: '100000',
  25: '100111', 26: '111001', 27: '100001', 28: '011110',
  29: '010010', 30: '101101', 31: '001110', 32: '011100',
  33: '001111', 34: '111100', 35: '000101', 36: '101000',
  37: '101011', 38: '110101', 39: '001010', 40: '010100',
  41: '110001', 42: '100011', 43: '111110', 44: '011111',
  45: '000110', 46: '011000', 47: '010110', 48: '011010',
  49: '101110', 50: '011101', 51: '100100', 52: '001001',
  53: '001011', 54: '110100', 55: '101100', 56: '001101',
  57: '011011', 58: '110110', 59: '010011', 60: '110010',
  61: '110011', 62: '001100', 63: '101010', 64: '010101',
};

// ============================================================
// FUNÇÃO PRINCIPAL — REALIZAR CONSULTA
// ============================================================
export function realizarConsulta(): ResultadoConsulta {
  const linhas = construirLinhas();

  // Hexagrama base (padrão binário das 6 linhas, de baixo para cima)
  const binBase = linhas.map((l) => (l.isYang ? '1' : '0')).join('');

  // Encontra o número do hexagrama base
  let hexagramaBase = 0;
  for (const [num, bin] of Object.entries(TABELA_HEXAGRAMAS)) {
    if (bin === binBase) {
      hexagramaBase = parseInt(num, 10);
      break;
    }
  }

  // Hexagrama de mutação (inverte apenas as linhas mutáveis)
  const binMutacao = linhas
    .map((l) => {
      if (l.isMutavel) {
        return l.isYang ? '0' : '1'; // inverte
      }
      return l.isYang ? '1' : '0';   // mantém
    })
    .join('');

  let hexagramaMutacao = 0;
  for (const [num, bin] of Object.entries(TABELA_HEXAGRAMAS)) {
    if (bin === binMutacao) {
      hexagramaMutacao = parseInt(num, 10);
      break;
    }
  }

  const linhasMutaveis = linhas
    .filter((l) => l.isMutavel)
    .map((l) => l.posicao);

  const trigramas = extrairTrigramas(linhas);

  return {
    linhas,
    hexagramaBase,
    hexagramaMutacao,
    temMutacao: linhasMutaveis.length > 0,
    linhasMutaveis,
    trigramaInferior: trigramas.inferior,
    trigramaSuperior: trigramas.superior,
  };
}
// ============================================================
// BASE DE DADOS DOS 64 HEXAGRAMAS — PARTE 1 (1 a 32)
// Textos clássicos (Julgamento, Imagem e as 6 linhas)
// ============================================================

export interface Hexagrama {
  numero: number;
  nome: string;          // nome em português
  nomeChines: string;    // pinyin (e caractere)
  sentenca: string;      // o Julgamento
  imagem: string;        // a Imagem
  linhas: string[];      // textos das 6 linhas (base → topo)
}

export const HEXAGRAMAS_PARTE1: Record<number, Hexagrama> = {
  1: {
    numero: 1,
    nome: 'O Criativo',
    nomeChines: 'Qian (乾)',
    sentenca: 'Sublime êxito. Propício é perseverar.',
    imagem: 'O céu se move com força: assim o homem superior se fortalece e nunca se cansa.',
    linhas: [
      'Dragão oculto. Não deves agir.',
      'O dragão aparece no campo: propício ver o grande homem.',
      'O homem superior é ativo o dia todo; à noite, vigilante. Perigo, mas sem culpa.',
      'Salto vacilante sobre o abismo. Nenhuma culpa.',
      'O dragão voa no céu: propício ver o grande homem.',
      'Dragão arrogante. Haverá arrependimento.',
    ],
  },
  2: {
    numero: 2,
    nome: 'O Receptivo',
    nomeChines: 'Kun (坤)',
    sentenca: 'Sublime êxito, se perseverares como a égua. O homem superior tem um rumo e vai adiante; primeiro perde o caminho, depois o encontra. Sereno perseverar traz fortuna.',
    imagem: 'A terra suporta tudo: assim o homem superior acolhe com ampla virtude.',
    linhas: [
      'Pisar a geada traz o gelo duro.',
      'Direto, reto, grande. Sem esforço, nada fica por fazer.',
      'Guarda a beleza e permanece firme. Se servires ao rei, não busques a glória; leva a obra até o fim.',
      'Saco amarrado. Nem culpa, nem louvor.',
      'Veste amarela. Fortuna suprema.',
      'Dragões lutam no campo. Sangue azul e amarelo.',
    ],
  },
  3: {
    numero: 3,
    nome: 'A Dificuldade Inicial',
    nomeChines: 'Zhun (屯)',
    sentenca: 'Dificuldade no princípio. Propício perseverar. Não empreendas nada; é favorável nomear príncipes.',
    imagem: 'Nuvens e trovão: assim o homem superior põe ordem no caos.',
    linhas: [
      'Hesitação. Propício permanecer firme; favorece o emprego de auxiliares.',
      'A donzela é casta e não se entrega ao cortejo. Dez anos depois, casa-se.',
      'Caçar o veado sem guia: só te perdes na mata. O homem superior percebe a hora de parar; continuar traz humilhação.',
      'Cavalo e carruagem que se aproximam; busca a união. Tudo corre bem; nada a perder.',
      'Pequena vantagem na perseverança; grande vantagem na firmeza. O pequeno obtém pouco; o grande, muito.',
      'Cavalos e carruagem derramam lágrimas de sangue.',
    ],
  },
  4: {
    numero: 4,
    nome: 'A Juventude Inexperiente',
    nomeChines: 'Meng (蒙)',
    sentenca: 'A juventude inexperiente. Não é a mim que ela busca; sou eu que a busco. Ao primeiro oráculo respondo; perguntar duas e três vezes é importunar; ao importuno não respondo. Propício perseverar.',
    imagem: 'Uma fonte junto ao monte: assim o homem superior cultiva a virtude com firmeza de propósito.',
    linhas: [
      'Para educar o inexperiente é preciso disciplina; liberar o delito traz mácula.',
      'Indulgente com o inexperiente, bom; aceitar a mulher traz fortuna; o filho assume a casa.',
      'Não cases com a moça que vê um homem de bronze e perde o próprio rumo.',
      'O inexperiente acorrentado: humilhação.',
      'O inexperiente ingênuo: fortuna.',
      'Na correção do inexperiente, castigar não favorece; apenas defender-se do mal.',
    ],
  },
  5: {
    numero: 5,
    nome: 'A Espera',
    nomeChines: 'Xu (需)',
    sentenca: 'A espera. Se fores sincero, terás êxito e grande sorte. Propício cruzar a grande água.',
    imagem: 'Nuvens sobem ao céu: assim o homem superior se alimenta e descansa, cultivando a espera.',
    linhas: [
      'Espera na campina. Propício perseverar; nada de culpa.',
      'Espera na areia. Pequenas críticas, mas o fim é bom.',
      'Espera na lama: a chegada do inimigo.',
      'Espera no sangue. Sai da cova.',
      'Espera no vinho e na comida. Perseverar traz fortuna.',
      'Chegaste à morada. Três visitantes chegam; honra-os.',
    ],
  },
  6: {
    numero: 6,
    nome: 'O Conflito',
    nomeChines: 'Song (讼)',
    sentenca: 'Conflito. Embora sejas sincero, serás obstruído; permanece alerta no meio. Ao fim, desgraça. Propício ver o grande homem; não propício cruzar a grande água.',
    imagem: 'Céu e água afastam-se: assim o homem superior reflete antes de agir.',
    linhas: [
      'Não prolongues a questão; pequenas palavras, e o fim é bom.',
      'Não podes contender; volta e foge. O povo da tua cidade, trezentas casas, fica sem culpa.',
      'Nutre a virtude antiga. Perseverar traz perigo, mas ao fim fortuna. Se servires ao rei, nada realizarás.',
      'Não podes contender; retorna e submete-te. Mudar de propósito traz paz e fortuna.',
      'Contende; propício ver o grande homem.',
      'Concede-lhe o cinturão de couro; três vezes ao amanhecer te será tirado.',
    ],
  },
  7: {
    numero: 7,
    nome: 'O Exército',
    nomeChines: 'Shi (师)',
    sentenca: 'O exército. Perseverar traz fortuna para o homem maduro; nenhuma culpa.',
    imagem: 'No centro da terra está a água: assim o homem superior nutre o povo e reúne as massas.',
    linhas: [
      'O exército sai em ordem; se não for disciplinado, desgraça, mesmo com boa causa.',
      'No meio do exército, boa sorte; nenhuma culpa; o rei concede três vezes.',
      'O exército carrega mortos no carro: desgraça.',
      'O exército recua; nenhuma culpa.',
      'Há caça no campo; propício capturar a presa; nenhuma culpa. O mais velho comanda, o mais jovem transporta os mortos; perseverar traz desgraça.',
      'O grande príncipe dá ordens, funda estados e casas; homens inferiores não devem ser empregados.',
    ],
  },
  8: {
    numero: 8,
    nome: 'A Solidariedade',
    nomeChines: 'Bi (比)',
    sentenca: 'Solidariedade traz fortuna. Investiga o oráculo mais uma vez; então a grande alma persevera. Nenhuma culpa. Os inquietos chegam gradualmente; os tardios terão desgraça.',
    imagem: 'Sobre a terra está a água: assim os reis antigos estabeleceram os estados e nutriram os príncipes.',
    linhas: [
      'Sê sincero e solidário; nenhuma culpa. Sinceridade plena como vaso cheio; ao fim, outras coisas chegam.',
      'Solidário por dentro. Perseverar traz fortuna.',
      'Solidário com os errados.',
      'Solidário por fora também: perseverar traz fortuna.',
      'Solidariedade manifesta. O rei caça de três lados; perde a presa adiante; o povo da cidade não é advertido; fortuna.',
      'Solidariedade sem princípio: desgraça.',
    ],
  },
  9: {
    numero: 9,
    nome: 'A Força Domadora do Pequeno',
    nomeChines: 'Xiao Chu (小畜)',
    sentenca: 'O pequeno domina. Êxito. Nuvens densas, sem chuva, vindas da nossa região ocidental.',
    imagem: 'O vento sopra no céu: assim o homem superior refina o caráter.',
    linhas: [
      'Retorna pelo próprio caminho. Que culpa? Fortuna.',
      'Deixa-se levar; retorna. Boa sorte.',
      'Carruagem solta os raios das rodas; marido e mulher trocam olhares.',
      'Se fores sincero, o sangue se afasta e o medo se dissipa. Nenhuma culpa.',
      'Sincero e unido; enriqueces o vizinho.',
      'Choveu; a virtude se cumpriu. Se a mulher perseverar, perigo; a lua quase cheia. O homem superior cavalga ao pôr do sol: desgraça.',
    ],
  },
  10: {
    numero: 10,
    nome: 'O Andar',
    nomeChines: 'Lu (履)',
    sentenca: 'Pisar a cauda do tigre que não morde: êxito.',
    imagem: 'Céu acima, lago abaixo: assim o homem superior distingue alto e baixo e dá paz ao povo.',
    linhas: [
      'Andar com simplicidade. Ir adiante, sem culpa.',
      'Andar num caminho plano e uniforme; a perseverança do homem solitário traz fortuna.',
      'O caolho vê; o coxo anda. Pisa a cauda do tigre que o morde. Desgraça. O guerreiro age pelo grande príncipe.',
      'Pisa a cauda do tigre; cauteloso. Ao fim, fortuna.',
      'Pisa com decisão; perseverar traz perigo.',
      'Considera o teu andar e examina os presságios; se tudo for examinado, fortuna suprema.',
    ],
  },
  11: {
    numero: 11,
    nome: 'A Paz',
    nomeChines: 'Tai (泰)',
    sentenca: 'A paz. O pequeno parte, o grande chega. Fortuna, êxito.',
    imagem: 'Céu e terra se unem: assim o governante completa e regula o curso da natureza e auxilia o povo.',
    linhas: [
      'Arrancar o junco que enraíza; cada um segue a sua espécie. Marchar traz fortuna.',
      'Abranger o selvagem, cruzar o rio sem afundar, não desprezar o distante, não esquecer os companheiros: andar no meio traz glória.',
      'Nenhuma planície sem colina, nenhuma ida sem volta. Na aflição perseverar, sem culpa. Não te preocupes com a tua sinceridade; no alimento haverá felicidade.',
      'Voa sem se orgulhar; o vizinho não se enriquece com a advertência; é sincero no meio.',
      'O imperador Di Yi casa a filha; bênção e grande fortuna.',
      'O muro cai no fosso; não uses o exército; anuncia na tua cidade; ainda que perseveres, humilhação.',
    ],
  },
  12: {
    numero: 12,
    nome: 'A Estagnação',
    nomeChines: 'Pi (否)',
    sentenca: 'A estagnação. Não é propício perseverar na direção do homem inferior. O grande parte, o pequeno chega.',
    imagem: 'Céu e terra não se unem: assim o homem superior retrai a virtude e evita as dificuldades; não pode ser recompensado.',
    linhas: [
      'Arrancar o junco que enraíza; cada um segue a sua espécie. Perseverar traz fortuna e êxito.',
      'Suportar e alimentar; também é fortuna para o pequeno.',
      'Carregar vergonha.',
      'Quem age conforme o mandato não tem culpa; os companheiros partilham a bênção.',
      'Cessar a estagnação! O grande homem: fortuna. Mas cuidado: amarra-o ao tronco da amoreira.',
      'Cessar a estagnação! Primeiro a estagnação, depois a fortuna.',
    ],
  },
  13: {
    numero: 13,
    nome: 'A Comunidade',
    nomeChines: 'Tong Ren (同人)',
    sentenca: 'A comunidade com os homens. Êxito no campo aberto. Propício cruzar a grande água; propício perseverar no homem superior.',
    imagem: 'Céu e fogo: assim o homem superior distingue os clãs e as coisas.',
    linhas: [
      'Comunidade no portão. Nenhuma culpa.',
      'Comunidade com os parentes. Humilhação.',
      'Esconde armas na moita; sobe a colina alta; três anos sem levantar.',
      'Sobe o muro, não podes atacar. Fortuna.',
      'Os companheiros primeiro choram e depois riem; grandes forças se encontram.',
      'Comunidade nos subúrbios. Nenhum arrependimento.',
    ],
  },
  14: {
    numero: 14,
    nome: 'A Posse do Grande',
    nomeChines: 'Da You (大有)',
    sentenca: 'Posse do grande. Êxito supremo.',
    imagem: 'Fogo no céu: assim o homem superior corta o mal e promove o bem, respondendo ao céu.',
    linhas: [
      'Nenhuma relação com o que é prejudicial; não há culpa. Se tiveres consciência disso, nada de erro.',
      'Grande carroça para carregar; há um destino; nada de erro.',
      'Um príncipe a apresenta ao Filho do Céu; o pequeno não pode fazê-lo.',
      'Ele se distingue dos demais; nenhuma culpa.',
      'Sua sinceridade une; imponente e digno. Fortuna.',
      'Bênção do céu. Êxito supremo; tudo favorece.',
    ],
  },
  15: {
    numero: 15,
    nome: 'A Modéstia',
    nomeChines: 'Qian (谦)',
    sentenca: 'A modéstia. Êxito. O homem superior leva as coisas até o fim.',
    imagem: 'No centro da terra está uma montanha: assim o homem superior diminui o que é demais e aumenta o que falta.',
    linhas: [
      'O homem modesto, modesto em sua modéstia: cruzar a grande água é propício.',
      'Modéstia manifesta. Perseverar traz fortuna.',
      'O homem superior laborioso e modesto; leva as coisas até o fim. Fortuna.',
      'Nada de desfavorável; tudo é humildade.',
      'Não enriquecido pelo vizinho; propício atacar e conquistar; nada de desfavorável.',
      'Modéstia manifesta; propício mover os exércitos, castigar a própria cidade.',
    ],
  },
  16: {
    numero: 16,
    nome: 'O Entusiasmo',
    nomeChines: 'Yu (豫)',
    sentenca: 'Entusiasmo. Propício instituir príncipes e mover exércitos.',
    imagem: 'O trovão irrompe da terra: assim os reis antigos compuseram música e honraram a virtude.',
    linhas: [
      'Entusiasmo anunciado. Desgraça.',
      'Firme como uma rocha; sem perder o dia. Perseverar traz fortuna.',
      'Olhar para cima com entusiasmo: arrependimento; tardio, arrependimento.',
      'Fonte do entusiasmo; grandes conquistas. Não duvides; os amigos se reúnem.',
      'Persistir na doença; nunca morre.',
      'Entusiasmo oculto. Se mudares depois de feito, sem culpa; mas se permaneceres obstinado, haverá arrependimento.',
    ],
  },
  17: {
    numero: 17,
    nome: 'O Seguimento',
    nomeChines: 'Sui (随)',
    sentenca: 'O seguimento. Êxito supremo. Propício perseverar; nenhuma culpa.',
    imagem: 'Trovão no lago: assim o homem superior descansa à noite e se retira.',
    linhas: [
      'O oficial muda; o portão se abre; perseverar traz fortuna.',
      'Agarra o pequeno e perde o grande.',
      'Agarra o grande e perde o pequeno. O que buscas, obténs; propício permanecer firme.',
      'Seguir gera êxito. Perseverar traz desgraça. Se fores sincero no caminho e claro, que mácula haverá?',
      'Sincero no bem. Fortuna.',
      'Apego firme; preso. O rei apresenta a oferta no monte ocidental.',
    ],
  },
  18: {
    numero: 18,
    nome: 'O Trabalho sobre o Corrompido',
    nomeChines: 'Gu (蛊)',
    sentenca: 'Trabalhar sobre o corrompido. Êxito supremo. Propício cruzar a grande água; três dias antes, três dias depois.',
    imagem: 'Vento abaixo, montanha acima: assim o homem superior desperta o povo e nutre a virtude.',
    linhas: [
      'Corrigir o que herdou do pai; se houver um filho, o pai não é culpado; perigo, mas ao fim fortuna.',
      'Corrigir o que herdou da mãe. Não se deve ser demasiado rígido.',
      'Corrigir o que herdou do pai. Haverá arrependimento; nenhuma grande culpa.',
      'Tolerar o que herdou do pai; ver as coisas com indulgência: humilhação.',
      'Corrigir o que herdou do pai; recebe elogios.',
      'Não serve ao rei nem aos príncipes; eleva o próprio caminho.',
    ],
  },
  19: {
    numero: 19,
    nome: 'A Aproximação',
    nomeChines: 'Lin (临)',
    sentenca: 'Aproximação. Êxito supremo. Propício perseverar. No oitavo mês, haverá desgraça.',
    imagem: 'A terra acima do lago: assim o homem superior ensina e pensa sem se cansar, tolera e protege o povo sem limite.',
    linhas: [
      'Aproximação conjunta. Perseverar traz fortuna.',
      'Aproximação propícia. Fortuna; tudo favorece.',
      'Aproximação agradável. Nada de favorável; se fores consciente disso, nenhuma culpa.',
      'Aproximação completa. Nenhuma culpa.',
      'Aproximação sábia. Propício para o grande príncipe.',
      'Aproximação generosa. Fortuna; nenhuma culpa.',
    ],
  },
  20: {
    numero: 20,
    nome: 'A Contemplação',
    nomeChines: 'Guan (观)',
    sentenca: 'A contemplação. Lavaste as mãos, mas ainda não ofereceste. Sincero e digno.',
    imagem: 'O vento corre sobre a terra: assim os reis antigos inspecionavam as regiões e observavam o povo.',
    linhas: [
      'Contemplação juvenil. Para o homem inferior, nenhuma culpa; para o homem superior, humilhação.',
      'Contemplação através da fresta; propício para a mulher perseverar.',
      'Contemplar o progresso e o recuo da própria vida.',
      'Contemplar a luz do reino; propício ser hóspede do rei.',
      'Contemplar a própria vida. O homem superior, sem culpa.',
      'Contemplar a vida dos outros. O homem superior, sem culpa.',
    ],
  },
  21: {
    numero: 21,
    nome: 'A Mordida Através',
    nomeChines: 'Shi He (噬嗑)',
    sentenca: 'A mordida através. Êxito. Propício usar a justiça.',
    imagem: 'Trovão e relâmpago: assim os reis antigos tornaram firmes as leis e as sentenças.',
    linhas: [
      'Pés algemados, dedos cortados. Nenhuma culpa.',
      'Morde a carne macia, corta o nariz. Nenhuma culpa.',
      'Morde carne velha; encontra veneno. Pequena humilhação; nenhuma culpa.',
      'Morde osso seco, carne salgada; propício perseverar no esforço.',
      'Morde carne seca; encontra ouro. Perseverar com consciência: nenhuma culpa.',
      'Mãos algemadas, orelhas cortadas. Desgraça.',
    ],
  },
  22: {
    numero: 22,
    nome: 'A Graça',
    nomeChines: 'Bi (贲)',
    sentenca: 'A graça. Êxito. Pequena vantagem em ter para onde ir.',
    imagem: 'Fogo abaixo, montanha acima: assim o homem superior esclarece os assuntos, sem ousar decidir de forma arbitrária.',
    linhas: [
      'A graça nos dedos dos pés; deixa a carruagem e caminha.',
      'A graça na barba.',
      'Graça e brilho. Perseverar traz fortuna.',
      'Graça ou simplicidade? Um cavalo branco chega como asa; não é ladrão, é pretendente.',
      'Graça nas colinas e jardins; o rolo de seda é pequeno. Humilhação; ao fim, fortuna.',
      'Graça simples. Nenhuma culpa.',
    ],
  },
  23: {
    numero: 23,
    nome: 'O Esfacelamento',
    nomeChines: 'Bo (剥)',
    sentenca: 'O esfacelamento. Não é propício ter para onde ir.',
    imagem: 'A montanha apoia-se na terra: assim os superiores garantem a sorte dos inferiores.',
    linhas: [
      'A perna da cama é esfacelada; destrói-se o fundamento. Desgraça.',
      'A cama é esfacelada na borda; destrói-se a base. Desgraça.',
      'Esfacela-se com ele. Nenhuma culpa.',
      'A cama esfacela-se até a pele. Desgraça.',
      'Peixes em fileira; a graça chega através dos favoritos internos. Nada de desfavorável.',
      'Fruto grande ainda não comido; o homem superior obtém carruagem, o inferior perde a casa.',
    ],
  },
  24: {
    numero: 24,
    nome: 'O Retorno',
    nomeChines: 'Fu (复)',
    sentenca: 'O retorno. Êxito. Saindo e entrando sem ferir; os amigos chegam sem culpa. O caminho vai e vem; no sétimo dia retorna. Propício ter para onde ir.',
    imagem: 'Trovão no centro da terra: assim os reis antigos fecharam os portões no solstício; os mercadores não viajavam, o príncipe não inspecionava.',
    linhas: [
      'Retorno à distância; não te arrependas de pequenos erros. Grande fortuna.',
      'Retorno sereno. Fortuna.',
      'Retorno a passos frequentes. Perigo, mas nenhuma culpa.',
      'Caminha no meio, sozinho. Retorno.',
      'Retorno generoso. Nenhum arrependimento.',
      'Perder o retorno: desgraça, desastre, calamidade; mover exércitos seria ruína total.',
    ],
  },
  25: {
    numero: 25,
    nome: 'A Inocência',
    nomeChines: 'Wu Wang (无妄)',
    sentenca: 'A inocência. Êxito supremo. Propício perseverar. Se não fores correto, terás desgraça; não é propício empreender nada.',
    imagem: 'Trovão sob o céu: assim os reis antigos nutriam todas as coisas na harmonia das estações.',
    linhas: [
      'Inocência no agir. Fortuna.',
      'Não arar para colher, não cultivar para usar; assim é útil ir adiante.',
      'Calamidade da inocência: como uma vaca amarrada; o viajante obtém, o habitante perde.',
      'Quem é capaz de perseverar, nenhuma culpa.',
      'Doença da inocência; sem remédio, alegria.',
      'Inocência no agir: desgraça; nada de favorável.',
    ],
  },
  26: {
    numero: 26,
    nome: 'A Força Domadora do Grande',
    nomeChines: 'Da Chu (大畜)',
    sentenca: 'A força domadora do grande. Propício perseverar. Não comer em casa traz fortuna; propício cruzar a grande água.',
    imagem: 'O céu dentro da montanha: assim o homem superior acumula memórias, palavras e obras.',
    linhas: [
      'Há perigo; propício parar.',
      'A carruagem perde os raios.',
      'Bom cavalo em perseguição; propício ser firme na adversidade; praticar a disciplina diariamente; propício ter para onde ir.',
      'A canga do novilho. Grande fortuna.',
      'Dentes de javali castrado. Fortuna.',
      'Atingir o caminho do céu. Êxito.',
    ],
  },
  27: {
    numero: 27,
    nome: 'A Nutrição',
    nomeChines: 'Yi (颐)',
    sentenca: 'A nutrição. Perseverar traz fortuna. Observa a boca: procurar alimento para si e para os outros.',
    imagem: 'Ao pé da montanha, trovão: assim o homem superior é cuidadoso com as palavras e comedido no comer e beber.',
    linhas: [
      'Largar a tartaruga e olhar para mim com avidez: desgraça.',
      'Nutrição voltada para cima; negligência em relação ao que está abaixo. Perseverar traz desgraça.',
      'Contra a nutrição: desgraça. Dez anos sem agir; nada de favorável.',
      'Nutrição voltada para baixo. Olhar penetrante: tigre faminto espreita a presa.',
      'Contra a nutrição. Se perseverares com consciência, fortuna; não se pode cruzar a grande água.',
      'Fonte da nutrição. Perigo, mas fortuna; propício cruzar a grande água.',
    ],
  },
  28: {
    numero: 28,
    nome: 'A Preponderância do Grande',
    nomeChines: 'Da Guo (大过)',
    sentenca: 'A preponderância do grande. A viga cede. Propício ter para onde ir; êxito.',
    imagem: 'O lago sobe acima das árvores: assim o homem superior, na solidão, não se aflige, e no mundo não se isola.',
    linhas: [
      'Esteira de junco para se sentar. Nenhuma culpa.',
      'O salgueiro velho brota; o velho casa com a jovem. Nada de desfavorável.',
      'A viga cede. Desgraça.',
      'A viga se eleva. Fortuna; mas há humilhação se houver outras intenções.',
      'O salgueiro velho floresce; a velha casa com o jovem. Nem louvor nem culpa.',
      'Atravessar a água: a água sobe acima da cabeça. Desgraça; mas nenhuma culpa.',
    ],
  },
  29: {
    numero: 29,
    nome: 'O Abismal',
    nomeChines: 'Kan (坎)',
    sentenca: 'O abismal, repetido. Se fores sincero, terás êxito no coração e as ações terão valor.',
    imagem: 'Água que flui e chega sempre ao seu lugar: assim o homem superior anda com constância e ensina os assuntos.',
    linhas: [
      'Abismo repetido. Cai na cova. Desgraça.',
      'O abismo é perigoso. Busca apenas o que podes obter.',
      'Vem e vai, abismo sobre abismo; perigo. Primeiro na cova, depois na prisão. Não agir.',
      'Vaso de barro e vinho, tigela de arroz. Simples e sincero; ao fim, nenhuma culpa.',
      'O abismo não transborda; nivelado. Nenhuma culpa.',
      'Amarrado com cordas e cadeias, preso entre espinhos; três anos sem êxito. Desgraça.',
    ],
  },
  30: {
    numero: 30,
    nome: 'O Fogo',
    nomeChines: 'Li (离)',
    sentenca: 'O fogo. Propício perseverar. Êxito. Nutrir a vaca traz fortuna.',
    imagem: 'A luz dupla surge: assim o grande homem ilumina as quatro direções.',
    linhas: [
      'Passos confusos. Mas se fores cuidadoso, nenhuma culpa.',
      'Luz amarela. Fortuna suprema.',
      'Sol poente: os homens batem no pote e cantam; presságio de desgraça.',
      'Chega de repente, como fogo. Morre, é abandonado.',
      'Lágrimas em torrentes, suspiros tristes. Fortuna.',
      'O rei usa a força para corrigir; capturam os chefes, mas não ferem o povo. Nenhuma culpa.',
    ],
  },
  31: {
    numero: 31,
    nome: 'A Influência',
    nomeChines: 'Xian (咸)',
    sentenca: 'A influência. Êxito. Propício perseverar. Tomar uma esposa traz fortuna.',
    imagem: 'Lago acima, montanha abaixo: assim o homem superior se recebe com humildade.',
    linhas: [
      'Influência no dedão do pé.',
      'Influência nas panturrilhas. Desgraça; permanecer traz fortuna.',
      'Influência nas coxas; apega-se ao que segue. Ir adiante traz humilhação.',
      'Perseverar traz fortuna; arrependimentos desaparecem. Se fores inquieto, pensamentos se amontoam.',
      'Influência na nuca. Nenhum arrependimento.',
      'Influência na mandíbula, na língua, nas bochechas.',
    ],
  },
  32: {
    numero: 32,
    nome: 'A Duração',
    nomeChines: 'Heng (恒)',
    sentenca: 'A duração. Êxito. Nenhuma culpa. Propício perseverar. Propício ter para onde ir.',
    imagem: 'Trovão e vento: assim o homem superior permanece firme e não muda de direção.',
    linhas: [
      'Duração profunda. Perseverar traz desgraça; nada de favorável.',
      'Arrependimentos desaparecem.',
      'Quem não cultiva a virtude constante carrega a vergonha; perseverar traz humilhação.',
      'Nenhuma presa no campo.',
      'Virtude constante. Perseverar traz fortuna para a mulher, desgraça para o homem.',
      'Duração agitada. Desgraça.',
    ],
  },
};
// ============================================================
// BASE DE DADOS DOS 64 HEXAGRAMAS — PARTE 2 (33 a 64)
// Textos clássicos (Julgamento, Imagem e as 6 linhas)
// ============================================================

import type { Hexagrama } from './hexagramas-1';

export const HEXAGRAMAS_PARTE2: Record<number, Hexagrama> = {
  33: {
    numero: 33,
    nome: 'A Retirada',
    nomeChines: 'Dun (遯)',
    sentenca: 'Êxito. No que é pequeno, propício perseverar.',
    imagem: 'Montanha sob o céu: assim o homem superior mantém o inferior à distância, não por ódio, mas por dignidade.',
    linhas: [
      'A cauda da retirada: perigo. Não empreendas nada.',
      'Retém-no com correias de couro amarelo; ninguém pode soltá-lo.',
      'Retirada amarrada: doença e perigo. Nutrir servos e concubinas traz fortuna.',
      'Retirada favorável: fortuna para o homem superior; o contrário para o inferior.',
      'Retirada graciosa: perseverar traz fortuna.',
      'Retirada alegre: nada de desfavorável.',
    ],
  },
  34: {
    numero: 34,
    nome: 'O Poder do Grande',
    nomeChines: 'Da Zhuang (大壯)',
    sentenca: 'Propício perseverar.',
    imagem: 'O trovão no céu: assim o homem superior não pisa em caminhos contrários à propriedade.',
    linhas: [
      'Poder nos dedos dos pés: avançar traz desgraça.',
      'Perseverar traz fortuna.',
      'O homem inferior usa a força; o homem superior não o faz. Perseverar é perigoso. O carneiro investe contra a cerca e fica com os chifres presos.',
      'Perseverar traz fortuna; o arrependimento desaparece. A cerca se abre; a força é como o eixo de uma grande carruagem.',
      'Perde o carneiro com facilidade: nenhum arrependimento.',
      'O carneiro investe contra a cerca: não pode recuar, não pode avançar. Nada de favorável; reconhecer a dificuldade traz fortuna.',
    ],
  },
  35: {
    numero: 35,
    nome: 'O Progresso',
    nomeChines: 'Jin (晉)',
    sentenca: 'O progresso. O príncipe é honrado com cavalos e recebe audiências três vezes em um dia.',
    imagem: 'O sol nasce sobre a terra: assim o homem superior faz brilhar a sua luminosa virtude.',
    linhas: [
      'Progresso, mas detido: perseverar traz fortuna. Se não encontrares confiança, permanece generoso; nenhuma culpa.',
      'Progresso, mas com aflição: perseverar traz fortuna. Recebe esta grande bênção da mãe real.',
      'Todos confiam nele: o arrependimento desaparece.',
      'Progresso como um hamster: perseverar traz perigo.',
      'O arrependimento desaparece. Não te preocupes com ganho e perda. Ir adiante traz fortuna; nada de desfavorável.',
      'Progresso até os chifres: pode-se usá-lo para corrigir a própria cidade. Perigo, fortuna, nenhuma culpa. Perseverar traz humilhação.',
    ],
  },
  36: {
    numero: 36,
    nome: 'O Esmaecimento da Luz',
    nomeChines: 'Ming Yi (明夷)',
    sentenca: 'O esmaecimento da luz. Propício perseverar na adversidade.',
    imagem: 'A luz entra na terra: assim o homem superior administra a multidão sem ostentar o seu brilho.',
    linhas: [
      'Esmaecimento da luz no voo: ele abaixa as asas. O homem superior, em sua jornada, fica três dias sem comer; onde vai, o anfitrião tem palavras.',
      'Esmaecimento da luz: ferido na coxa esquerda. Salva-se com a força de um cavalo. Fortuna.',
      'Esmaecimento da luz na caçada ao sul: o grande chefe é capturado. Não se deve ser apressado na perseverança.',
      'Entra no lado esquerdo do ventre; alcança o coração da luz obscurecida e deixa o portão e o pátio.',
      'Esmaecimento da luz como o do príncipe Ji Zi: propício perseverar.',
      'Não luz, mas trevas: primeiro sobe ao céu, depois cai na terra.',
    ],
  },
  37: {
    numero: 37,
    nome: 'A Família',
    nomeChines: 'Jia Ren (家人)',
    sentenca: 'A família. Propício para a mulher perseverar.',
    imagem: 'O vento sai do fogo: assim o homem superior ordena as palavras e as obras com constância.',
    linhas: [
      'Firme reclusão na família: o arrependimento desaparece.',
      'Ela não busca coisas próprias; no centro da casa prepara as refeições. Perseverar traz fortuna.',
      'Quando a família é severa, há arrependimento e perigo, mas fortuna. Quando mulher e filhos riem às gargalhadas, no fim há humilhação.',
      'Enriquecer a família: grande fortuna.',
      'O rei se aproxima da família como um hóspede: não te preocupes, fortuna.',
      'Sua obra inspira respeito: no fim, fortuna.',
    ],
  },
  38: {
    numero: 38,
    nome: 'A Oposição',
    nomeChines: 'Kui (睽)',
    sentenca: 'A oposição. Pequenas coisas trazem fortuna.',
    imagem: 'Fogo acima, lago abaixo: assim o homem superior distingue as semelhanças e as diferenças.',
    linhas: [
      'O arrependimento desaparece. Se perderes o cavalo, não o persigas; ele retornará. Ver o homem mau: nenhuma culpa.',
      'Encontra o seu senhor numa rua estreita: nenhuma culpa.',
      'Vê-se a carruagem arrastada para trás, os bois detidos, o homem com a cabeça raspada e o nariz cortado. Sem começo, mas com fim.',
      'Isolado pela oposição: encontra um homem de igual sentir; sinceridade e perigo, nenhuma culpa.',
      'O arrependimento desaparece. O companheiro morde através da pele. Ir adiante, que culpa há?',
      'Isolado: vê um porco carregando lama e uma carruagem cheia de fantasmas. Primeiro arma o arco, depois o depõe. Não é ladrão, é pretendente. Ir adiante e encontrar a chuva traz fortuna.',
    ],
  },
  39: {
    numero: 39,
    nome: 'O Obstáculo',
    nomeChines: 'Jian (蹇)',
    sentenca: 'O obstáculo. Propício para o sudoeste; não propício para o nordeste. Propício ver o grande homem; perseverar traz fortuna.',
    imagem: 'A água sobre a montanha: assim o homem superior volta a atenção para si mesmo e cultiva a virtude.',
    linhas: [
      'Ir adiante traz obstáculo; voltar traz louvor.',
      'O servo do rei está cercado de obstáculos; não é culpa sua.',
      'Ir adiante traz obstáculo; ele volta.',
      'Ir adiante traz obstáculo; ele chega à união.',
      'No meio do grande obstáculo, os amigos chegam.',
      'Ir adiante traz obstáculo; voltar traz grande êxito. Fortuna. Propício ver o grande homem.',
    ],
  },
  40: {
    numero: 40,
    nome: 'A Libertação',
    nomeChines: 'Jie (解)',
    sentenca: 'A libertação. Propício para o sudoeste. Se não há mais nada a fazer, é propício que isso volte. Se ainda há algo a fazer, chegar cedo traz fortuna.',
    imagem: 'O trovão e a chuva chegam: assim o homem superior perdoa os erros e absolve as culpas.',
    linhas: [
      'Nenhuma culpa.',
      'Mata três raposas no campo e recebe uma flecha amarela. Perseverar traz fortuna.',
      'Carregar um fardo nas costas e ainda assim andar de carruagem: isso atrai ladrões. Perseverar traz humilhação.',
      'Liberta-te do teu dedão. Então o companheiro chega com sinceridade.',
      'O homem superior se liberta: fortuna. Ele mostra sinceridade até ao homem inferior.',
      'O príncipe atira no falcão sobre o alto muro e o abate. Nada de desfavorável.',
    ],
  },
  41: {
    numero: 41,
    nome: 'A Diminuição',
    nomeChines: 'Sun (損)',
    sentenca: 'A diminuição. Se fores sincero, grande fortuna; nenhuma culpa. Pode-se perseverar. Propício empreender algo. Como oferecer? Dois vasos de barro bastam.',
    imagem: 'Montanha sobre o lago: assim o homem superior domina a ira e refreia os desejos.',
    linhas: [
      'Ir depressa quando a própria tarefa está feita: nenhuma culpa. Considera quanto deves diminuir.',
      'Propício perseverar. Empreender algo traz desgraça. Sem diminuir a si mesmo, pode-se trazer aumento aos outros.',
      'Quando três pessoas viajam, uma é diminuída; quando uma pessoa viaja, encontra um companheiro.',
      'Diminuir as próprias faltas: é logo motivo de alegria. Nenhuma culpa.',
      'Alguém o aumenta com dez pares de carapaças de tartaruga; não se pode recusar. Fortuna suprema.',
      'Nenhuma diminuição, mas aumento: nenhuma culpa. Perseverar traz fortuna. Propício empreender algo. Ganha servos, mas não uma casa.',
    ],
  },
  42: {
    numero: 42,
    nome: 'O Aumento',
    nomeChines: 'Yi (益)',
    sentenca: 'O aumento. Propício empreender algo. Propício cruzar a grande água.',
    imagem: 'O vento e o trovão: assim o homem superior, vendo o bem, imita-o; vendo o erro, corrige-o.',
    linhas: [
      'Propício realizar grandes obras: fortuna suprema, nenhuma culpa.',
      'Alguém o aumenta com dez pares de carapaças de tartaruga; não se pode recusar. Perseverança eterna traz fortuna. O rei apresenta a oferenda ao Senhor: fortuna.',
      'Ser aumentado por acontecimentos infelizes: nenhuma culpa. Se fores sincero e andares no meio, anuncia-o ao príncipe com a tabuinha de jade.',
      'Andando no meio, anuncia-se ao príncipe, que o segue. Propício usá-lo para mudar a capital.',
      'Sincero no coração que dá; não perguntes: fortuna suprema. A sinceridade será recompensada com virtude.',
      'Ninguém o aumenta; alguns o ferem. Se o coração não permanecer constante, desgraça.',
    ],
  },
  43: {
    numero: 43,
    nome: 'A Ruptura',
    nomeChines: 'Guai (夬)',
    sentenca: 'A ruptura. Deve-se anunciar com sinceridade ao próprio povo. Perigo diante, mas confiança. Anunciar aos companheiros: tomar as armas. Propício empreender algo.',
    imagem: 'O lago sobre o céu: assim o homem superior distribui as riquezas e não as acumula; é gracioso e não ostenta a virtude.',
    linhas: [
      'Poder nos dedos da frente: ir adiante sem poder vencer é uma falta.',
      'Grita com vigilância. À noite há um inimigo armado. Não te preocupes.',
      'Poder nas maçãs do rosto: desgraça. O homem superior resolve com firmeza; andando só, encontra a chuva, é molhado e censurado. Nenhuma culpa.',
      'Sem pele nas coxas; andar é difícil. Se for conduzido como uma ovelha, o arrependimento desaparece. Mas não se acredita nessas palavras.',
      'Resolver com firmeza sobre as ervas daninhas: andar no meio, nenhuma culpa.',
      'Nenhum grito; no fim, desgraça.',
    ],
  },
  44: {
    numero: 44,
    nome: 'O Encontro',
    nomeChines: 'Gou (姤)',
    sentenca: 'O encontro. A mulher é poderosa. Não se deve casar com tal mulher.',
    imagem: 'O vento sob o céu: assim o príncipe distribui as ordens e as proclama às quatro direções.',
    linhas: [
      'Amarrado a um freio de metal: perseverar traz fortuna. Se fores a qualquer lugar, verás desgraça. Um porco magro certamente virá investindo.',
      'Um peixe no cesto: nenhuma culpa, mas não convém servi-lo ao hóspede.',
      'Sem pele nas coxas; andar é difícil. Perigo, mas nenhuma grande culpa.',
      'Nenhum peixe no cesto: a desgraça surge.',
      'Um melão coberto por folhas de salgueiro; beleza oculta. Um destino cai do céu.',
      'Encontro com os chifres: humilhação, mas nenhuma culpa.',
    ],
  },
  45: {
    numero: 45,
    nome: 'A Reunião',
    nomeChines: 'Cui (萃)',
    sentenca: 'A reunião. Êxito. O rei aproxima-se do templo. Propício ver o grande homem; êxito e prosperidade. Perseverar traz fortuna. Grande oferenda: propício. Empreender algo traz fortuna.',
    imagem: 'O lago sobre a terra: assim o homem superior renova as armas para guardar-se do imprevisto.',
    linhas: [
      'Se fores sincero mas não até o fim, há confusão e reunião. Se gritares, um aperto de mãos e risos. Não te preocupes; ir adiante é sem culpa.',
      'Ser conduzido traz fortuna, nenhuma culpa. Sincero, convém trazer uma pequena oferenda.',
      'Reunir-se e suspirar: nada de favorável. Ir adiante é sem culpa; pequena humilhação.',
      'Grande fortuna, nenhuma culpa.',
      'Reunido em posição: nenhuma culpa. Se ainda não há confiança, é preciso perseverar por muito tempo na virtude; o arrependimento desaparece.',
      'Suspirando e chorando: nenhuma culpa.',
    ],
  },
  46: {
    numero: 46,
    nome: 'O Ascender',
    nomeChines: 'Sheng (升)',
    sentenca: 'O ascender. Êxito supremo. Ver o grande homem; não temas. Marchar para o sul traz fortuna.',
    imagem: 'A madeira cresce da terra: assim o homem superior se dedica à virtude e acumula as pequenas coisas para alcançar o grande.',
    linhas: [
      'Ascender com confiança: grande fortuna.',
      'Sincero, convém trazer uma pequena oferenda: nenhuma culpa.',
      'Ascender para uma cidade vazia.',
      'O rei oferece o sacrifício no Monte Qi: fortuna, nenhuma culpa.',
      'Perseverar traz fortuna; sobe-se os degraus.',
      'Ascender na escuridão: convém perseverar sem cessar.',
    ],
  },
  47: {
    numero: 47,
    nome: 'A Opressão',
    nomeChines: 'Kun (困)',
    sentenca: 'A opressão. Êxito. Perseverança. O grande homem traz fortuna; nenhuma culpa. Mas há palavras que não são acreditadas.',
    imagem: 'O lago sem água: assim o homem superior empenha a vida no cumprimento do propósito.',
    linhas: [
      'Senta-se oprimido sob uma árvore nua e erra por um vale sombrio; por três anos nada se vê.',
      'Oprimido em meio à comida e à bebida. As cobertas escarlates estão chegando. Convém oferecer o sacrifício. Empreender algo traz desgraça, mas nenhuma culpa.',
      'Oprimido por uma rocha, apoiado em espinhos. Entra na casa e não vê a própria esposa: desgraça.',
      'Chegando muito devagar, oprimido por uma carruagem de ouro: humilhação, mas o fim é bom.',
      'Nariz e pés cortados; oprimido pelas cobertas escarlates. Aos poucos chega a libertação. Convém oferecer o sacrifício.',
      'Oprimido por cipós e espinhos, em posição perigosa. Diz-se: agir traz arrependimento. Se te arrependeres, ir adiante traz fortuna.',
    ],
  },
  48: {
    numero: 48,
    nome: 'O Poço',
    nomeChines: 'Jing (井)',
    sentenca: 'O poço. Muda-se a cidade, não se muda o poço. Não se perde nem se ganha. Vai-se e vem-se ao poço; se não se chega à água, ou o balde se quebra, desgraça.',
    imagem: 'A madeira sobre a água: assim o homem superior encoraja o povo ao trabalho e o exorta à ajuda mútua.',
    linhas: [
      'O poço está lodoso; ninguém bebe. Nenhum animal chega a um poço velho.',
      'O poço é um buraco para peixes; o cântaro está quebrado e vaza.',
      'O poço foi limpo, mas ninguém bebe; isso entristece o meu coração, pois se poderia tirar dele. Se o rei fosse claro, todos partilhariam a bênção.',
      'O poço é revestido: nenhuma culpa.',
      'O poço está límpido; a fonte fria é bebida.',
      'Tirar do poço sem fechá-lo: sincero, fortuna suprema.',
    ],
  },
  49: {
    numero: 49,
    nome: 'A Revolução',
    nomeChines: 'Ge (革)',
    sentenca: 'A revolução. No dia próprio, crê-se nela. Êxito supremo. Propício perseverar; o arrependimento desaparece.',
    imagem: 'O fogo no lago: assim o homem superior põe o calendário em ordem e torna claras as estações.',
    linhas: [
      'Envolvido no couro de uma vaca amarela.',
      'Quando chega o próprio dia, pode-se mudar. Ir adiante traz fortuna, nenhuma culpa.',
      'Ir adiante traz desgraça; perseverar é perigoso. Quando a palavra da mudança se repete três vezes, tem-se confiança.',
      'O arrependimento desaparece. Sincero, muda-se o mandato. Fortuna.',
      'O grande homem muda como o tigre. Mesmo antes do oráculo, ele é sincero.',
      'O homem superior muda como o leopardo; o homem inferior muda de rosto. Ir adiante traz desgraça; permanecer perseverante traz fortuna.',
    ],
  },
  50: {
    numero: 50,
    nome: 'O Caldeirão',
    nomeChines: 'Ding (鼎)',
    sentenca: 'O caldeirão. Grande êxito e fortuna.',
    imagem: 'O fogo sobre a madeira: assim o homem superior consolida o destino pela conduta correta.',
    linhas: [
      'Um caldeirão com as pernas para cima: convém retirar o que está estragado. Toma-se uma concubina por causa de seu filho. Nenhuma culpa.',
      'O caldeirão tem alimento. Meus companheiros invejam, mas não podem me ferir. Fortuna.',
      'A alça do caldeirão é alterada; o caminho está bloqueado; a gordura do faisão não é comida. Quando a chuva cai, o arrependimento se dissolve. No fim, fortuna.',
      'As pernas do caldeirão se quebram; a refeição do príncipe é derramada e a coisa fica manchada. Desgraça.',
      'O caldeirão tem alças amarelas e argolas de ouro. Propício perseverar.',
      'O caldeirão tem argolas de jade: grande fortuna, nada de desfavorável.',
    ],
  },
  51: {
    numero: 51,
    nome: 'O Trovão',
    nomeChines: 'Zhen (震)',
    sentenca: 'O trovão. Êxito. O trovão chega e fica-se assustado; depois ri-se e conversa-se. O trovão assusta a cem léguas; mas não se deixa cair a colher de sacrifício.',
    imagem: 'O trovão se repete: assim o homem superior, em temor e tremor, examina-se e aperfeiçoa-se.',
    linhas: [
      'O trovão chega, e fica-se assustado; depois ri-se e conversa-se. Fortuna.',
      'O trovão chega com perigo; perde-se os bens e sobe-se ao nono monte. Não persigas; após sete dias, recuperas.',
      'O trovão aterroriza; se agires, nenhum desastre.',
      'O trovão atola-se.',
      'O trovão vai e vem com perigo. Não há perda, mas há trabalho a fazer.',
      'O trovão atinge com terror; olha-se em volta assustado. Ir adiante traz desgraça. Se o trovão não atinge o próprio corpo, mas o vizinho, nenhuma culpa. Haverá palavras sobre casamento.',
    ],
  },
  52: {
    numero: 52,
    nome: 'A Montanha',
    nomeChines: 'Gen (艮)',
    sentenca: 'A montanha. Quietude das costas; não se sente o próprio corpo. Anda-se no pátio, não se vê a própria pessoa. Nenhuma culpa.',
    imagem: 'Montanhas próximas umas das outras: assim o homem superior não deixa os pensamentos vagarem além do seu lugar.',
    linhas: [
      'Manter os dedos dos pés quietos: nenhuma culpa. Convém perseverar com constância.',
      'Manter as panturrilhas quietas: não se pode salvar o que se segue; o coração não se alegra.',
      'Manter os quadris quietos: os lombos se partem; perigo, e o coração sufoca.',
      'Manter o tronco quieto: nenhuma culpa.',
      'Manter as mandíbulas quietas: as palavras têm ordem. O arrependimento desaparece.',
      'Quietude generosa: fortuna.',
    ],
  },
  53: {
    numero: 53,
    nome: 'O Desenvolvimento',
    nomeChines: 'Jian (漸)',
    sentenca: 'O desenvolvimento. A donzela se casa. Fortuna. Propício perseverar.',
    imagem: 'A madeira sobre a montanha: assim o homem superior permanece na dignidade e na virtude, aperfeiçoando os costumes.',
    linhas: [
      'O ganso selvagem aproxima-se gradualmente da margem. O jovem está em perigo; há palavras, mas nenhuma culpa.',
      'O ganso selvagem aproxima-se gradualmente do rochedo, onde come e bebe em paz. Fortuna.',
      'O ganso selvagem aproxima-se gradualmente do planalto. O homem parte e não retorna; a mulher concebe, mas não dá à luz. Desgraça. Convém defender-se dos ladrões.',
      'O ganso selvagem aproxima-se gradualmente da árvore; talvez encontre um galho plano. Nenhuma culpa.',
      'O ganso selvagem aproxima-se gradualmente do cume. A mulher não concebe por três anos; no fim, nada pode impedir. Fortuna.',
      'O ganso selvagem aproxima-se gradualmente do planalto; suas penas podem servir à cerimônia. Fortuna.',
    ],
  },
  54: {
    numero: 54,
    nome: 'A Donzela que se Casa',
    nomeChines: 'Gui Mei (歸妹)',
    sentenca: 'A donzela que se casa. Empreender traz desgraça; nada de favorável.',
    imagem: 'O trovão sobre o lago: assim o homem superior, conhecendo o fim, considera o começo.',
    linhas: [
      'A donzela que se casa como irmã mais nova. Como um coxo que pode andar: ir adiante traz fortuna.',
      'Como um caolho que pode ver: convém perseverar como um solitário.',
      'A donzela que se casa como serva; ela retorna como irmã mais nova.',
      'A donzela que se casa adia; o adiamento tem seu tempo.',
      'O imperador Di Yi casa a filha; as mangas da noiva não são tão finas como as da irmã mais nova. A lua quase cheia: fortuna.',
      'A mulher segura o cesto vazio; o homem degola o carneiro sem sangue. Nada de favorável.',
    ],
  },
  55: {
    numero: 55,
    nome: 'A Abundância',
    nomeChines: 'Feng (豐)',
    sentenca: 'A abundância. Êxito. O rei alcança a abundância. Não te aflijas; sê como o sol ao meio-dia.',
    imagem: 'O trovão e o relâmpago chegam: assim o homem superior decide os litígios e aplica as penas.',
    linhas: [
      'Encontra o seu senhor correspondente. Mesmo em dez dias, nenhuma culpa. Ir adiante traz honra.',
      'A cortina é tão espessa que se vê a Ursa Maior ao meio-dia. Ir adiante traz suspeita e doença. Sincero e aberto: fortuna.',
      'A cortina é tão espessa que se veem pequenas estrelas ao meio-dia. Quebra-se o braço direito: nenhuma culpa.',
      'A cortina é espessa; vê-se a Ursa Maior ao meio-dia. Encontra-se o seu senhor oculto: fortuna.',
      'Traz-se o brilho: fortuna, louvor e alegria.',
      'A casa está cheia de abundância, mas a família fica oculta; espiando pela porta, ninguém está lá; por três anos nada se vê. Desgraça.',
    ],
  },
  56: {
    numero: 56,
    nome: 'O Viajante',
    nomeChines: 'Lu (旅)',
    sentenca: 'O viajante. Pequenas coisas trazem êxito; perseverar no viajante traz fortuna.',
    imagem: 'O fogo sobre a montanha: assim o homem superior é claro e cuidadoso na punição e não prolonga os litígios.',
    linhas: [
      'O viajante é mesquinho e miúdo: atrai a calamidade sobre si mesmo.',
      'O viajante chega a uma estalagem, guarda os seus bens e encontra um servo fiel.',
      'A estalagem do viajante queima; ele perde o servo. Perseverar traz perigo.',
      'O viajante descansa em um abrigo; obtém os seus bens e um machado, mas o coração não se alegra.',
      'Atira num faisão; uma flecha se perde. No fim, honra e cargo.',
      'O ninho do pássaro queima; o viajante primeiro ri, depois chora. Perde a vaca com facilidade. Desgraça.',
    ],
  },
  57: {
    numero: 57,
    nome: 'O Vento (O Suave)',
    nomeChines: 'Xun (巽)',
    sentenca: 'O vento. Êxito pequeno. Propício ter para onde ir; propício ver o grande homem.',
    imagem: 'Ventos que se sucedem: assim o homem superior propaga as ordens e realiza as obras.',
    linhas: [
      'Avançar e recuar: convém perseverar como um guerreiro.',
      'Penetração sob a cama. Sacerdotes e magos em grande número: fortuna, nenhuma culpa.',
      'Penetração repetida: humilhação.',
      'O arrependimento desaparece. Na caçada, apanham-se três espécies de caça.',
      'Perseverar traz fortuna, o arrependimento desaparece, nada de desfavorável. Sem começo, mas com fim. Três dias antes, três dias depois: fortuna.',
      'Penetração sob a cama; perde os bens e o machado. Perseverar traz desgraça.',
    ],
  },
  58: {
    numero: 58,
    nome: 'O Lago (O Alegre)',
    nomeChines: 'Dui (兌)',
    sentenca: 'O lago. Êxito. Propício perseverar.',
    imagem: 'Lagos apoiados um no outro: assim o homem superior se reúne com os amigos para a discussão e o aprendizado.',
    linhas: [
      'Alegria harmoniosa: fortuna.',
      'Alegria sincera: fortuna, o arrependimento desaparece.',
      'Alegria que chega de fora: desgraça.',
      'Alegria em deliberação; ainda não há paz. Isola-se a doença; há alegria.',
      'Sincero para com o que é nocivo: perigo.',
      'Alegria sedutora.',
    ],
  },
  59: {
    numero: 59,
    nome: 'A Dispersão',
    nomeChines: 'Huan (渙)',
    sentenca: 'A dispersão. Êxito. O rei aproxima-se do templo. Propício cruzar a grande água; propício perseverar.',
    imagem: 'O vento sobre a água: assim os reis de outrora sacrificavam ao Senhor e construíam templos.',
    linhas: [
      'Salvar-se com a força de um cavalo: fortuna.',
      'Na dispersão, apressa-se para o seu refúgio. O arrependimento desaparece.',
      'Dispersar a si mesmo: nenhum arrependimento.',
      'Dispersar o próprio grupo: fortuna suprema. A dispersão conduz ao cume; é o que os homens comuns não imaginam.',
      'Dispersar a sua grande voz: a casa do rei é dispersa. Nenhuma culpa.',
      'Dispersar o sangue: partir e afastar-se para longe. Nenhuma culpa.',
    ],
  },
  60: {
    numero: 60,
    nome: 'A Limitação',
    nomeChines: 'Jie (節)',
    sentenca: 'A limitação. Êxito. Mas não se pode perseverar em uma limitação amarga.',
    imagem: 'A água sobre o lago: assim o homem superior cria número e medida e examina a virtude e a conduta.',
    linhas: [
      'Não sair da porta e do pátio: nenhuma culpa.',
      'Não sair do portão e do pátio: desgraça.',
      'Quem não se limita terá de lamentar. Nenhuma culpa.',
      'Limitação contente: êxito.',
      'Limitação doce: fortuna. Ir adiante traz honra.',
      'Limitação amarga: perseverar traz desgraça. O arrependimento desaparece.',
    ],
  },
  61: {
    numero: 61,
    nome: 'A Verdade Interior',
    nomeChines: 'Zhong Fu (中孚)',
    sentenca: 'A verdade interior. Porcos e peixes: fortuna. Propício cruzar a grande água; propício perseverar.',
    imagem: 'O vento sobre o lago: assim o homem superior discute os litígios e adia as execuções.',
    linhas: [
      'Estar preparado traz fortuna. Se houver intenções ocultas, fica-se inquieto.',
      'A garça chama à sombra; seus filhotes respondem. Tenho uma boa taça; partilharei contigo.',
      'Encontra-se um companheiro; ora se bate o tambor, ora se para; ora se chora, ora se canta.',
      'A lua quase cheia; o companheiro do cavalo se perde. Nenhuma culpa.',
      'Sincero e unido: nenhuma culpa.',
      'O canto do galo sobe ao céu: perseverar traz desgraça.',
    ],
  },
  62: {
    numero: 62,
    nome: 'A Preponderância do Pequeno',
    nomeChines: 'Xiao Guo (小過)',
    sentenca: 'A preponderância do pequeno. Êxito. Propício perseverar. Pequenas coisas podem ser feitas; grandes coisas, não. O pássaro que voa deixa a mensagem: não subas, desce; grande fortuna.',
    imagem: 'O trovão sobre a montanha: assim o homem superior é muito modesto na conduta, muito pesaroso no luto e muito frugal nos gastos.',
    linhas: [
      'Um pássaro que voa traz desgraça.',
      'Passar pelo avô, encontrar a avó; não alcançar o príncipe, encontrar o servo. Nenhuma culpa.',
      'Não exageres; fica de guarda. Se seguires, poderás ser ferido. Desgraça.',
      'Nenhuma culpa. Sem exagerar, encontra-se. Ir adiante é perigoso; é preciso cautela. Não uses a perseverança eterna.',
      'Nuvens densas, sem chuva, vindas da nossa região ocidental. O príncipe atira e acerta o que está na caverna.',
      'Sem encontrar, exagera-se; o pássaro voa para longe. Desgraça; chama-se a isso desastre e calamidade.',
    ],
  },
  63: {
    numero: 63,
    nome: 'Depois da Conclusão',
    nomeChines: 'Ji Ji (既濟)',
    sentenca: 'Depois da conclusão. Êxito no pequeno. Propício perseverar. No começo, fortuna; no fim, desordem.',
    imagem: 'A água sobre o fogo: assim o homem superior pensa na desgraça e se arma contra ela.',
    linhas: [
      'Arrastar a roda, molhar a cauda: nenhuma culpa.',
      'A mulher perde a cortina; não persigas; após sete dias, recupera.',
      'O antepassado Gao Zong ataca a região dos demônios; após três anos, conquista. Não empregues homens inferiores.',
      'As melhores vestes viram trapos; fica alerta o dia todo.',
      'O vizinho do leste degola um boi; isso não se compara à pequena oferenda do vizinho do oeste, que verdadeiramente recebe a bênção.',
      'Molhar a cabeça: perigo.',
    ],
  },
  64: {
    numero: 64,
    nome: 'Antes da Conclusão',
    nomeChines: 'Wei Ji (未濟)',
    sentenca: 'Antes da conclusão. Êxito. Mas a raposa, após atravessar, molha a cauda; nada de favorável.',
    imagem: 'O fogo sobre a água: assim o homem superior é cuidadoso em distinguir as coisas e pô-las no devido lugar.',
    linhas: [
      'Molhar a cauda: humilhação.',
      'Arrastar a roda: perseverar traz fortuna.',
      'Antes da conclusão, ir adiante traz desgraça; mas convém cruzar a grande água.',
      'Perseverar traz fortuna, o arrependimento desaparece. Com choque, ataca-se a região dos demônios; após três anos, há recompensa do grande reino.',
      'Perseverar traz fortuna, nenhum arrependimento. A luz do homem superior é sincera: fortuna.',
      'Sincero no vinho: nenhuma culpa. Mas molhar a cabeça: a sinceridade se perde.',
    ],
  },
};
// ============================================================
// HEXAGRAMAS — ÍNDICE ÚNICO E BUSCA
// ============================================================

import type { Hexagrama } from './hexagramas-1';
import { HEXAGRAMAS_PARTE1 } from './hexagramas-1';
import { HEXAGRAMAS_PARTE2 } from './hexagramas-2';

export const HEXAGRAMAS: Record<number, Hexagrama> = {
  ...HEXAGRAMAS_PARTE1,
  ...HEXAGRAMAS_PARTE2,
};

export function buscarHexagrama(numero: number): Hexagrama | undefined {
  return HEXAGRAMAS[numero];
}

export function listarHexagramas(): Hexagrama[] {
  return Object.values(HEXAGRAMAS).sort((a, b) => a.numero - b.numero);
}
'use client';

import { useState, type CSSProperties } from 'react';
import { realizarConsulta } from '../../lib/iching/motor';
import type { Linha, ResultadoConsulta } from '../../lib/iching/motor';
import { buscarHexagrama } from '../../lib/iching/hexagramas';
import type { Hexagrama } from '../../lib/iching/hexagramas';

interface EstadoConsulta {
  resultado: ResultadoConsulta;
  base: Hexagrama;
  mutacao: Hexagrama | null;
}

const VALOR_LABEL: Record<number, string> = {
  6: '6 · Yin mutável',
  7: '7 · Yang fixa',
  8: '8 · Yin fixa',
  9: '9 · Yang mutável',
};

function LinhaHexagrama({ linha }: { linha: Linha }) {
  const estiloBarra: CSSProperties = {
    height: 18,
    backgroundColor: '#d4af37',
    borderRadius: 3,
    flex: 1,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: 240,
          gap: linha.isYang ? 0 : 8,
          padding: 2,
          borderRadius: 4,
          background: linha.isMutavel ? 'rgba(255, 150, 40, 0.10)' : 'transparent',
          boxShadow: linha.isMutavel ? '0 0 10px rgba(255, 150, 40, 0.45)' : 'none',
        }}
        title={VALOR_LABEL[linha.valor]}
      >
        {linha.isYang ? (
          <div style={estiloBarra} />
        ) : (
          <>
            <div style={estiloBarra} />
            <div style={estiloBarra} />
          </>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          color: linha.isMutavel ? '#ffb84d' : '#9b8a63',
          marginTop: 3,
          textAlign: 'center',
        }}
      >
        Linha {linha.posicao} — {VALOR_LABEL[linha.valor]}
      </div>
    </div>
  );
}

export default function PaginaIChing() {
  const [pergunta, setPergunta] = useState('');
  const [estado, setEstado] = useState<EstadoConsulta | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function consultar() {
    setErro(null);
    setEstado(null);
    setCarregando(true);
    window.setTimeout(() => {
      try {
        const resultado = realizarConsulta();
        const base = buscarHexagrama(resultado.hexagramaBase);
        if (!base) {
          throw new Error('Não foi possível identificar o hexagrama sorteado.');
        }
        const mutacao = resultado.temMutacao
          ? buscarHexagrama(resultado.hexagramaMutacao) ?? null
          : null;
        setEstado({ resultado, base, mutacao });
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Ocorreu um erro inesperado ao consultar o oráculo.');
      } finally {
        setCarregando(false);
      }
    }, 800);
  }

  function novaConsulta() {
    setEstado(null);
    setPergunta('');
    setErro(null);
  }

  const linhasExibicao = estado ? [...estado.resultado.linhas].reverse() : [];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1b1030 0%, #0d0716 60%, #07030c 100%)',
        color: '#e8dcc0',
        fontFamily: 'Georgia, "Times New Roman", serif',
        padding: '40px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: 40, letterSpacing: 6, color: '#d4af37', margin: 0, textAlign: 'center' }}>
        I CHING
      </h1>
      <p style={{ marginTop: 4, fontSize: 15, color: '#a3926e', textAlign: 'center' }}>
        O Oráculo das Mutações — método das três moedas
      </p>

      <div
        style={{
          marginTop: 28,
          width: '100%',
          maxWidth: 640,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <label htmlFor="pergunta" style={{ display: 'block', fontSize: 14, color: '#c9b98a', marginBottom: 8 }}>
          Faça a sua pergunta ao oráculo:
        </label>
        <input
          id="pergunta"
          type="text"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          placeholder="Ex.: Devo aceitar essa proposta?"
          maxLength={200}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 8,
            border: '1px solid rgba(212,175,55,0.4)',
            background: 'rgba(0,0,0,0.35)',
            color: '#f2e8cf',
            fontSize: 16,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        <button
          type="button"
          onClick={consultar}
          disabled={carregando}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '14px 0',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #d4af37, #b8860b)',
            color: '#160d02',
            fontSize: 17,
            fontWeight: 'bold',
            cursor: carregando ? 'wait' : 'pointer',
            letterSpacing: 2,
          }}
        >
          {carregando ? 'Lançando as moedas…' : 'CONSULTAR O ORÁCULO'}
        </button>

        {erro && (
          <p style={{ marginTop: 14, color: '#ff8a7a', fontSize: 14, textAlign: 'center' }}>{erro}</p>
        )}
      </div>

      {estado && (
        <div style={{ marginTop: 32, width: '100%', maxWidth: 860 }}>
          {pergunta && (
            <p style={{ textAlign: 'center', fontSize: 15, color: '#c9b98a', fontStyle: 'italic' }}>
              “{pergunta}”
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginTop: 8 }}>
            <section
              style={{
                flex: '1 1 280px',
                minWidth: 280,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h2 style={{ margin: '0 0 4px', color: '#d4af37', fontSize: 22 }}>
                Hexagrama {estado.resultado.hexagramaBase}
              </h2>
              <p style={{ margin: 0, color: '#a3926e', fontSize: 13 }}>
                {estado.base.nome} · {estado.base.nomeChines}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16 }}>
                {linhasExibicao.map((linha) => (
                  <LinhaHexagrama key={linha.posicao} linha={linha} />
                ))}
              </div>
              <p style={{ margin: '16px 0 4px', color: '#c9b98a', fontSize: 13 }}>
                {estado.resultado.trigramaInferior} · abaixo
              </p>
              <p style={{ margin: 0, color: '#c9b98a', fontSize: 13 }}>
                {estado.resultado.trigramaSuperior} · acima
              </p>
            </section>

            <section
              style={{
                flex: '1 1 380px',
                minWidth: 300,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h2 style={{ margin: 0, color: '#d4af37', fontSize: 18 }}>O Julgamento</h2>
              <p style={{ marginTop: 8, fontSize: 15, lineHeight: 1.6 }}>{estado.base.sentenca}</p>

              <h3 style={{ margin: '18px 0 4px', color: '#d4af37', fontSize: 15 }}>A Imagem</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#d8cba4' }}>{estado.base.imagem}</p>
            </section>
          </div>

          {estado.resultado.temMutacao ? (
            <div
              style={{
                marginTop: 24,
                background: 'rgba(255,150,40,0.06)',
                border: '1px solid rgba(255,170,60,0.35)',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h2 style={{ margin: 0, color: '#ffb84d', fontSize: 18 }}>
                Linhas mutáveis: {estado.resultado.linhasMutaveis.join(', ')}
              </h2>
              <p style={{ margin: '6px 0 12px', fontSize: 13, color: '#c9a86a' }}>
                As linhas mutáveis transformam o hexagrama {estado.resultado.hexagramaBase} no hexagrama{' '}
                {estado.resultado.hexagramaMutacao}.
              </p>

              {estado.resultado.linhasMutaveis.map((pos) => {
                const texto = estado.base.linhas[pos - 1];
                return (
                  <div key={pos} style={{ marginBottom: 12 }}>
                    <strong style={{ color: '#ffb84d' }}>Linha {pos}:</strong>{' '}
                    <span style={{ color: '#e8dcc0' }}>{texto}</span>
                  </div>
                );
              })}

              {estado.mutacao && (
                <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,170,60,0.25)', paddingTop: 14 }}>
                  <h3 style={{ margin: 0, color: '#d4af37', fontSize: 17 }}>
                    Hexagrama resultante: {estado.resultado.hexagramaMutacao} — {estado.mutacao.nome}
                  </h3>
                  <p style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>{estado.mutacao.sentenca}</p>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                marginTop: 24,
                background: 'rgba(212,175,55,0.06)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: 16,
                padding: 20,
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, color: '#c9b98a', fontSize: 15 }}>
                Nenhuma linha mutável — a situação está estável. Considere apenas o hexagrama atual.
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              type="button"
              onClick={novaConsulta}
              style={{
                padding: '12px 32px',
                borderRadius: 8,
                border: '1px solid rgba(212,175,55,0.5)',
                background: 'transparent',
                color: '#d4af37',
                fontSize: 15,
                cursor: 'pointer',
                letterSpacing: 2,
              }}
            >
              FAZER NOVA CONSULTA
            </button>
          </div>
        </div>
      )}

      <p
        style={{
          marginTop: 40,
          maxWidth: 560,
          textAlign: 'center',
          fontSize: 12,
          color: '#6f6246',
          lineHeight: 1.6,
        }}
      >
        O I Ching é um oráculo milenar da tradição chinesa, baseado nas 64 combinações de seis linhas.
        Cada consulta usa três moedas lançadas seis vezes: 6 e 9 indicam linhas mutáveis, 7 e 8 linhas fixas.
        As respostas são guias de reflexão — a decisão final é sempre sua.
      </p>
    </div>
  );
}