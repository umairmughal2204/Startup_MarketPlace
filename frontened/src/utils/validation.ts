import type { KeyboardEvent } from 'react';

export const sanitizeNumberInput = (
  value: string,
  options: { allowDecimal?: boolean; maxLength?: number } = {},
) => {
  const { allowDecimal = false, maxLength } = options;
  let sanitized = value.replace(allowDecimal ? /[^\d.]/g : /\D/g, '');

  if (allowDecimal) {
    const [whole = '', ...decimalParts] = sanitized.split('.');
    sanitized = decimalParts.length > 0 ? `${whole}.${decimalParts.join('')}` : whole;
  }

  return typeof maxLength === 'number' ? sanitized.slice(0, maxLength) : sanitized;
};

export const preventInvalidNumberKey = (
  event: KeyboardEvent<HTMLInputElement>,
  options: { allowDecimal?: boolean } = {},
) => {
  const blockedKeys = ['e', 'E', '+', '-'];
  if (!options.allowDecimal) blockedKeys.push('.', ',');
  if (blockedKeys.includes(event.key)) event.preventDefault();
};

export const parseValidatedNumber = (
  value: string | number,
  options: { min?: number; max?: number; integer?: boolean; label?: string } = {},
) => {
  const numberValue = typeof value === 'number' ? value : Number(value);
  const label = options.label || 'Number';

  if (!Number.isFinite(numberValue)) return { value: null, error: `${label} must be a valid number.` };
  if (typeof options.min === 'number' && numberValue < options.min) {
    return { value: null, error: `${label} must be at least ${options.min}.` };
  }
  if (typeof options.max === 'number' && numberValue > options.max) {
    return { value: null, error: `${label} must be no more than ${options.max}.` };
  }
  if (options.integer && !Number.isInteger(numberValue)) {
    return { value: null, error: `${label} must be a whole number.` };
  }

  return { value: numberValue, error: null };
};

export const isBlank = (value: string | null | undefined) => !value || value.trim().length === 0;

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidPhone = (value: string) => /^[\d\s()+-]{7,20}$/.test(value.trim());

export const validateMeaningfulDescription = (value: string) => {
  const trimmedValue = value.trim();
  const normalized = trimmedValue.replace(/\s+/g, ' ');
  const words = normalized.match(/[A-Za-z][A-Za-z'-]*/g) || [];

  if (words.length === 0) {
      return 'Description text is too short.';
  }

  // Check for presence of digits or excessive special characters directly in the normalized string
  const containsDigits = /\d/.test(normalized);
  const nonAlphaCount = (normalized.match(/[^A-Za-z\s]/g) || []).length;
  if (containsDigits || (nonAlphaCount / normalized.length > 0.05 && normalized.length > 10)) { // More than 5% non-alpha/space for longer strings
      return 'Please enter a valid description. Avoid unusual characters or numbers.';
  }

  const vowelWords = words.filter((word) => /[aeiou]/i.test(word));
  
  // Stricter check for average word length and maximum word length
  const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
  const averageWordLength = words.length > 0 ? totalWordLength / words.length : 0;
  const maxWordLength = words.length > 0 ? Math.max(...words.map(word => word.length)) : 0;

  // Combine gibberish conditions
  const isGibberish = 
    (vowelWords.length / words.length < 0.4) || // Very low overall vowel ratio
    (averageWordLength < 3 || averageWordLength > 12) || // Unusually short or long average word length
    (maxWordLength > 20) || // Extremely long single words (gibberish often has these)
    (words.length >= 5 && words.filter(word => word.length >= 7 && (word.match(/[^aeiou]/gi) || []).length / word.length > 0.85).length > 0); // Presence of very consonant-heavy long words

  if (isGibberish) {
    return 'Please enter a valid description.';
  }

  // Length check (if not gibberish)
  if (words.length < 8 || normalized.length < 45) {
    return 'Description text is too short.';
  }

  return null;
};
