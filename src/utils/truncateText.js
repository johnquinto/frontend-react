/**
 * Trunca o texto com base em um número máximo de caracteres
 * @param {string} text - O texto a ser truncado
 * @param {number} maxChars - O número máximo de caracteres permitido
 * @returns {string} - O texto truncado com "..." se for muito longo
 */
export default function truncateText(text, maxChars) {
  if (text.length <= maxChars) {
    return text; // Retorna o texto original se não ultrapassar o limite
  }
  return text.slice(0, maxChars) + "..."; // Trunca o texto e adiciona "..."
}
