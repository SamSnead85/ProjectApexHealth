import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

/**
 * PHI Encryption Utility
 *
 * Provides AES-256-GCM encryption/decryption for Protected Health Information
 * at rest, along with one-way hashing and masking helpers for HIPAA compliance.
 *
 * Encrypted format: base64(iv):base64(authTag):base64(ciphertext)
 */
@Injectable()
export class EncryptionUtil implements OnModuleInit {
  private readonly logger = new Logger(EncryptionUtil.name);

  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16; // 128-bit IV for GCM
  private static readonly AUTH_TAG_LENGTH = 16; // 128-bit auth tag
  private static readonly KEY_LENGTH = 32; // 256-bit key
  private static readonly ENCODING: BufferEncoding = 'base64';

  private encryptionKey!: Buffer;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const rawKey = this.configService.get<string>('PHI_ENCRYPTION_KEY');

    if (!rawKey) {
      this.logger.error(
        'PHI_ENCRYPTION_KEY is not set. PHI encryption will fail at runtime.',
      );
      return;
    }

    // Support hex-encoded or raw key material
    const keyBuffer = rawKey.length === EncryptionUtil.KEY_LENGTH * 2
      ? Buffer.from(rawKey, 'hex')
      : createHash('sha256').update(rawKey).digest();

    if (keyBuffer.length !== EncryptionUtil.KEY_LENGTH) {
      throw new Error(
        `PHI_ENCRYPTION_KEY must resolve to ${EncryptionUtil.KEY_LENGTH} bytes. ` +
        `Got ${keyBuffer.length} bytes.`,
      );
    }

    this.encryptionKey = keyBuffer;
    this.logger.log('PHI encryption key loaded successfully');
  }

  // ───────────────────────────────────────────────
  //  Encryption / Decryption
  // ───────────────────────────────────────────────

  /**
   * Encrypt plaintext using AES-256-GCM.
   *
   * @returns Base64-encoded string in the format `iv:authTag:ciphertext`
   */
  encrypt(plaintext: string): string {
    this.assertKeyLoaded();

    const iv = randomBytes(EncryptionUtil.IV_LENGTH);
    const cipher = createCipheriv(
      EncryptionUtil.ALGORITHM,
      this.encryptionKey,
      iv,
      { authTagLength: EncryptionUtil.AUTH_TAG_LENGTH },
    );

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString(EncryptionUtil.ENCODING),
      authTag.toString(EncryptionUtil.ENCODING),
      encrypted.toString(EncryptionUtil.ENCODING),
    ].join(':');
  }

  /**
   * Decrypt an AES-256-GCM encrypted string.
   *
   * @param encryptedText Base64-encoded string in the format `iv:authTag:ciphertext`
   * @returns The original plaintext
   */
  decrypt(encryptedText: string): string {
    this.assertKeyLoaded();

    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error(
        'Invalid encrypted text format. Expected iv:authTag:ciphertext',
      );
    }

    const [ivB64, authTagB64, ciphertextB64] = parts;
    const iv = Buffer.from(ivB64, EncryptionUtil.ENCODING);
    const authTag = Buffer.from(authTagB64, EncryptionUtil.ENCODING);
    const ciphertext = Buffer.from(ciphertextB64, EncryptionUtil.ENCODING);

    if (iv.length !== EncryptionUtil.IV_LENGTH) {
      throw new Error(`Invalid IV length: expected ${EncryptionUtil.IV_LENGTH}, got ${iv.length}`);
    }
    if (authTag.length !== EncryptionUtil.AUTH_TAG_LENGTH) {
      throw new Error(
        `Invalid auth tag length: expected ${EncryptionUtil.AUTH_TAG_LENGTH}, got ${authTag.length}`,
      );
    }

    const decipher = createDecipheriv(
      EncryptionUtil.ALGORITHM,
      this.encryptionKey,
      iv,
      { authTagLength: EncryptionUtil.AUTH_TAG_LENGTH },
    );
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  // ───────────────────────────────────────────────
  //  Hashing & Masking
  // ───────────────────────────────────────────────

  /**
   * One-way SHA-256 hash for indexing PHI without storing plaintext.
   * Uses the encryption key as an HMAC-like salt to prevent rainbow table attacks.
   */
  hashPHI(value: string): string {
    this.assertKeyLoaded();

    return createHash('sha256')
      .update(this.encryptionKey)
      .update(value)
      .digest('hex');
  }

  /**
   * Mask a Social Security Number, exposing only the last 4 digits.
   *
   * @example maskSSN('123-45-6789') // '***-**-6789'
   * @example maskSSN('123456789')   // '***-**-6789'
   */
  maskSSN(ssn: string): string {
    const digitsOnly = ssn.replace(/\D/g, '');
    if (digitsOnly.length < 4) {
      return '***-**-****';
    }
    const lastFour = digitsOnly.slice(-4);
    return `***-**-${lastFour}`;
  }

  /**
   * Mask a date of birth, exposing only the day.
   *
   * @example maskDOB('1990-03-15') // '****-**-15'
   * @example maskDOB('03/15/1990') // '****-**-15'
   */
  maskDOB(dob: string): string {
    // Try ISO format YYYY-MM-DD
    const isoMatch = dob.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `****-**-${isoMatch[3]}`;
    }

    // Try US format MM/DD/YYYY or MM-DD-YYYY
    const usMatch = dob.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
    if (usMatch) {
      return `****-**-${usMatch[2]}`;
    }

    return '****-**-**';
  }

  /**
   * Deep-clone an object and replace specified field values with `[REDACTED]`.
   * Traverses nested objects and arrays recursively.
   *
   * @param obj   The source object (not mutated)
   * @param fields  Field names to redact
   * @returns A new object with specified fields redacted
   */
  redactPHI<T = any>(obj: T, fields: string[]): T {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactPHI(item, fields)) as unknown as T;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    const fieldSet = new Set(fields);
    const clone: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (fieldSet.has(key)) {
        clone[key] = '[REDACTED]';
      } else if (Array.isArray(value)) {
        clone[key] = value.map((item) => this.redactPHI(item, fields));
      } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        clone[key] = this.redactPHI(value, fields);
      } else {
        clone[key] = value;
      }
    }

    return clone as T;
  }

  // ───────────────────────────────────────────────
  //  Private helpers
  // ───────────────────────────────────────────────

  private assertKeyLoaded(): void {
    if (!this.encryptionKey) {
      throw new Error(
        'PHI encryption key is not loaded. Ensure PHI_ENCRYPTION_KEY environment variable is set.',
      );
    }
  }
}
