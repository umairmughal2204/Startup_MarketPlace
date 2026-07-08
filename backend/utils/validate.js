const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isEmail = (value) => typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isPhone = (value) => typeof value === "string" && /^[\d\s()+-]{7,20}$/.test(value.trim());

const isOneOf = (list) => (value) => list.includes(value);

const isPositiveNumber = (value) => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) && num > 0;
};

const isIntInRange = (min, max) => (value) => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isInteger(num) && num >= min && num <= max;
};

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const isValidUrl = (value) => {
  try {
    new URL(String(value));
    return true;
  } catch {
    return false;
  }
};

const isFutureDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
};

const ENGLISH_STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should", "may",
  "might", "must", "can", "could", "to", "of", "in", "on", "for", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below", "between", "under",
  "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all",
  "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
  "only", "own", "so", "than", "too", "very", "just", "this", "that", "these", "those", "i",
  "you", "he", "she", "it", "we", "they", "what", "which", "who", "whom", "whose", "our",
  "your", "their", "its", "my", "me", "him", "her", "them", "us", "am", "if", "because",
  "while", "about", "up", "down", "out", "off", "over", "also",
]);

const isMeaningfulText = (value) => {
  const normalized = String(value).trim().replace(/\s+/g, " ");
  const words = normalized.match(/[A-Za-z][A-Za-z'-]*/g) || [];
  if (words.length === 0) return false;

  const containsDigits = /\d/.test(normalized);
  const nonAlphaCount = (normalized.match(/[^A-Za-z\s]/g) || []).length;
  if (containsDigits || (nonAlphaCount / normalized.length > 0.05 && normalized.length > 10)) {
    return false;
  }

  const stopwordMatches = words.filter((word) => ENGLISH_STOPWORDS.has(word.toLowerCase())).length;
  const requiredStopwords = Math.max(2, Math.ceil(words.length * 0.15));
  if (stopwordMatches < requiredStopwords) return false;

  const vowelWords = words.filter((word) => /[aeiou]/i.test(word));
  const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
  const averageWordLength = words.length > 0 ? totalWordLength / words.length : 0;
  const maxWordLength = words.length > 0 ? Math.max(...words.map((word) => word.length)) : 0;

  const isGibberish =
    vowelWords.length / words.length < 0.4 ||
    averageWordLength < 3 ||
    averageWordLength > 12 ||
    maxWordLength > 20 ||
    (words.length >= 5 &&
      words.filter((word) => word.length >= 7 && (word.match(/[^aeiou]/gi) || []).length / word.length > 0.85).length > 0);

  return !isGibberish;
};

const validateBody = (rules) => (req, res, next) => {
  const body = req.body || {};
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = body[field];
    const present = value !== undefined && value !== null && value !== "";

    if (!present) {
      if (rule.required) errors[field] = rule.message || `${field} is required`;
      continue;
    }

    if (rule.minLength !== undefined && String(value).trim().length < rule.minLength) {
      errors[field] = rule.minLengthMessage || rule.message || `${field} must be at least ${rule.minLength} characters`;
      continue;
    }
    if (rule.maxLength !== undefined && String(value).trim().length > rule.maxLength) {
      errors[field] = rule.maxLengthMessage || rule.message || `${field} must be at most ${rule.maxLength} characters`;
      continue;
    }
    if (rule.check && !rule.check(value)) {
      errors[field] = rule.checkMessage || rule.message || `${field} is invalid`;
      continue;
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  next();
};

module.exports = {
  isNonEmptyString,
  isEmail,
  isPhone,
  isOneOf,
  isPositiveNumber,
  isIntInRange,
  isNonEmptyArray,
  isValidUrl,
  isFutureDate,
  isMeaningfulText,
  validateBody,
};
