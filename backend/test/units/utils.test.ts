import { generateUID, signToken, verifyToken, hashPassword, comparePassword, JWTPayload } from '@utils';

describe('Utils', () => {
  describe('generateUID', () => {
    it('should generate a unique ID', () => {
      const uid1 = generateUID();
      const uid2 = generateUID();

      expect(uid1).toBeDefined();
      expect(uid2).toBeDefined();
      expect(uid1).not.toBe(uid2);
      expect(typeof uid1).toBe('string');
      expect(uid1.length).toBeGreaterThan(0);
    });

    it('should generate valid UUID format', () => {
      const uid = generateUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(uid)).toBe(true);
    });
  });

  describe('signToken', () => {
    it('should sign a JWT token with payload', () => {
      const payload: JWTPayload = {
        uid: 'test-uid',
        email: 'test@example.com',
        roleId: 'role-123',
      };

      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should sign token without roleId', () => {
      const payload: JWTPayload = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      const token = signToken(payload);
      expect(token).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const payload: JWTPayload = {
        uid: 'test-uid',
        email: 'test@example.com',
        roleId: 'role-123',
      };

      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.uid).toBe(payload.uid);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.roleId).toBe(payload.roleId);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow('Invalid or expired token');
    });

    it('should throw error for empty token', () => {
      expect(() => {
        verifyToken('');
      }).toThrow();
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hashed1 = await hashPassword(password);
      const hashed2 = await hashPassword(password);

      // bcrypt includes salt, so hashes should be different
      expect(hashed1).not.toBe(hashed2);
    });

    it('should hash empty string', async () => {
      const hashed = await hashPassword('');
      expect(hashed).toBeDefined();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      const result = await comparePassword(password, hashed);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashed = await hashPassword(password);

      const result = await comparePassword(wrongPassword, hashed);
      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      const result = await comparePassword('', hashed);
      expect(result).toBe(false);
    });
  });
});

