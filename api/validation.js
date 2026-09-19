// api/validation.js
const { z } = require('zod');
const { PALAVRAS_PROIBIDAS } = require('./prohibitedWords');

// Regex que aceita apenas caracteres válidos em português (letras, acentos, números, pontuação)
const REGEX_CARACTERES = /^[\p{L}\p{N}\s.,;:!?'"()-]+$/u;

/* -------------------------------------------------
   Schema da pergunta enviada ao endpoint de leitura.
   - tamanho entre 10 e 200 caracteres
   - apenas caracteres permitidos
   - sem palavras de violência ou insultos
   - coerência mínima (≥ 2 palavras distintas)
   ------------------------------------------------- */
const perguntaSchema = z
  .string()
  .min(10, { message: 'A pergunta deve ter no mínimo 10 caracteres.' })
  .max(200, { message: 'A pergunta deve ter no máximo 200 caracteres.' })
  .refine(
    (val) => REGEX_CARACTERES.test(val),
    { message: 'A pergunta contém caracteres inválidos.' }
  )
  .refine(
    (val) => {
      const lower = val.toLowerCase();
      return !PALAVRAS_PROIBIDAS.some((p) => lower.includes(p));
    },
    { message: 'A pergunta contém termos proibidos.' }
  )
  .refine(
    (val) => {
      const palavras = val.trim().toLowerCase().split(/\s+/).filter(Boolean);
      return new Set(palavras).size >= 2;
    },
    { message: 'A pergunta parece incompleta ou incoerente.' }
  );

module.exports = { perguntaSchema };
