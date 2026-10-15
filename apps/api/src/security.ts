import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';

const scrypt = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => _scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? reject(e) : resolve(k))));

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// Used so a missing user takes as long as a wrong password.
export const DUMMY_HASH = `scrypt$${'00'.repeat(16)}$${'00'.repeat(64)}`;
