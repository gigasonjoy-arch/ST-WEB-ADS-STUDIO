/**
 * Security & Credential Utilities for ST Web & Ads Studio
 * Implements SHA-256 cryptographic hashing and multi-factor validation.
 */

// Fallback pure-JS SHA-256 implementation if crypto.subtle is restricted
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j; // Used as a counter across the whole file
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isPrime: { [key: number]: boolean } = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isPrime[candidate]) {
      for (i = 0; i < 300; i += candidate) {
        isPrime[i] = true;
      }
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  ascii += '\x80'; // Append '1' bit (plus zero padding)
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00'; // More zero padding
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ''; // ASCII check: only accept 8-bit characters
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  // Process each 16-word chunk
  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const a = hash[0],
        e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + // S1
        ((e & hash[5]) ^ (~e & hash[6])) + // ch
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | // s1
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + // S0
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Generate SHA-256 hash string for password protection
 */
export async function hashPasswordAsync(password: string): Promise<string> {
  if (!password) return '';
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fall back to sync implementation
  }
  return sha256Sync(password);
}

export function hashPassword(password: string): string {
  if (!password) return '';
  return sha256Sync(password);
}

/**
 * Normalize phone numbers to standard format for reliable matching
 * E.g. "+880 1723-516793" -> "01723516793"
 */
export function normalizeMobileNumber(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');
  // If starts with 880, convert to 0
  if (digits.startsWith('880') && digits.length === 13) {
    digits = '0' + digits.substring(3);
  }
  // If starts with 88 and length 12
  if (digits.startsWith('88') && digits.length === 12) {
    digits = digits.substring(2);
  }
  return digits;
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

/**
 * Validate Bangladeshi / International mobile number format
 */
export function isValidMobileNumber(phone: string): boolean {
  if (!phone) return false;
  const clean = normalizeMobileNumber(phone);
  // Bangladeshi mobile format is 11 digits starting with 01
  if (clean.length === 11 && clean.startsWith('01')) {
    return true;
  }
  // International standard between 9 and 15 digits
  return clean.length >= 9 && clean.length <= 15;
}

/**
 * Pre-hashed default password for initial admin ("stweb2025")
 */
export const DEFAULT_ADMIN_PASSWORD_HASH = hashPassword('stweb2025');
