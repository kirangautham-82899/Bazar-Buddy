// Product search tuned for vendors typing (or speaking):
// matches names, keywords and categories, tolerates small typos, and ranks exact
// word matches above prefixes, substrings and fuzzy hits.

export const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
};

const allowedTypos = (token) => (token.length >= 7 ? 2 : token.length >= 4 ? 1 : 0);

const scoreToken = (token, words) => {
  let best = 0;
  for (const word of words) {
    // "tomato" is an exact hit for "tomatoes" (and the other way round).
    if (word === token || word === `${token}s` || word === `${token}es` || token === `${word}s`) return 3;
    if (word.startsWith(token)) best = Math.max(best, 2);
    else if (token.length >= 3 && word.includes(token)) best = Math.max(best, 1.5);
    else if (allowedTypos(token) && levenshtein(token, word) <= allowedTypos(token)) {
      best = Math.max(best, 1);
    }
  }
  return best;
};

const searchableWords = (product, categoryLabels = {}) => {
  const phrases = [
    product.name,
    ...(product.keywords || []),
    product.category,
    categoryLabels[product.category] || '',
  ];
  return [...new Set(phrases.flatMap((p) => normalize(p).split(' ')).filter(Boolean))];
};

const scoreProduct = (product, query, categoryLabels) => {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (!tokens.length) return 1;
  const words = searchableWords(product, categoryLabels);
  let total = 0;
  for (const token of tokens) {
    const score = scoreToken(token, words);
    if (!score) return 0; // every word the vendor typed must match something
    total += score;
  }
  return total;
};

export const searchProducts = (products, query, { category = 'all', categoryLabels } = {}) => {
  const inCategory = category === 'all' ? products : products.filter((p) => p.category === category);
  if (!normalize(query)) return inCategory;
  return inCategory
    .map((product, index) => ({ product, index, score: scoreProduct(product, query, categoryLabels) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.product);
};
