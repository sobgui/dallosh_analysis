import { AuthService } from '@api/auth/service';
import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';
import { COLLECTIONS } from '@configs/constants';
import { User } from '@/types/schema/users.schema';

describe('AuthService', () => {
  let authService: AuthService;
  let mockDb: jest.Mocked<DatabaseAdapter>;

  beforeEach(() => {
    // Create a mock database adapter
    mockDb = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      findMany: jest.fn(),
      insertMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      createCollection: jest.fn(),
      collectionExists: jest.fn(),
    } as any;

    authService = new AuthService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const roleId = 'role-123';

      // Mock: user doesn't exist
      mockDb.findOne.mockResolvedValue(null);

      // Mock: insert user
      const mockUser: User = {
        uid: 'user-123',
        data: {
          email,
          password: 'hashed-password',
          roleId,
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };
      mockDb.insertOne.mockResolvedValue(mockUser);

      const result = await authService.register(email, password, roleId);

      expect(mockDb.findOne).toHaveBeenCalledWith(COLLECTIONS.USERS, {
        'data.email': email,
      });
      expect(mockDb.insertOne).toHaveBeenCalled();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.data.email).toBe(email);
    });

    it('should throw error if user already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';

      // Mock: user already exists
      mockDb.findOne.mockResolvedValue({
        uid: 'existing-user',
        data: { email, password: 'hashed' },
      });

      await expect(authService.register(email, password)).rejects.toThrow(
        'User already exists'
      );

      expect(mockDb.insertOne).not.toHaveBeenCalled();
    });

    it('should register user without roleId', async () => {
      const email = 'user@example.com';
      const password = 'password123';

      mockDb.findOne.mockResolvedValue(null);

      const mockUser: User = {
        uid: 'user-123',
        data: {
          email,
          password: 'hashed-password',
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };
      mockDb.insertOne.mockResolvedValue(mockUser);

      const result = await authService.register(email, password);

      expect(result.user).toBeDefined();
      expect(result.user.data.roleId).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const email = 'user@example.com';
      const password = 'password123';

      // Hash password properly for the test
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      const mockUser: User = {
        uid: 'user-123',
        data: {
          email,
          password: hashedPassword,
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockUser);

      const result = await authService.login(email, password);

      expect(mockDb.findOne).toHaveBeenCalledWith(COLLECTIONS.USERS, {
        'data.email': email,
      });
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockDb.findOne.mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error for wrong password', async () => {
      const email = 'user@example.com';
      const password = 'wrongPassword';

      const mockUser: User = {
        uid: 'user-123',
        data: {
          email,
          password: 'hashed-password',
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockUser);

      await expect(authService.login(email, password)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('getMe', () => {
    it('should return user by uid', async () => {
      const uid = 'user-123';
      const mockUser: User = {
        uid,
        data: {
          email: 'user@example.com',
          password: 'hashed',
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockUser);

      const result = await authService.getMe(uid);

      expect(mockDb.findOne).toHaveBeenCalledWith(COLLECTIONS.USERS, { uid });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const uid = 'nonexistent';

      mockDb.findOne.mockResolvedValue(null);

      const result = await authService.getMe(uid);

      expect(result).toBeNull();
    });
  });

  describe('updateAccount', () => {
    it('should update user account', async () => {
      const uid = 'user-123';
      const updates = { email: 'newemail@example.com' };
      const updatedBy = 'user-123';

      const mockUser: User = {
        uid,
        data: {
          email: 'newemail@example.com',
          password: 'hashed',
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy,
      };

      mockDb.updateOne.mockResolvedValue({} as any);
      mockDb.findOne.mockResolvedValue(mockUser);

      const result = await authService.updateAccount(uid, updates, updatedBy);

      expect(mockDb.updateOne).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.data.email).toBe(updates.email);
    });

    it('should hash password when updating', async () => {
      const uid = 'user-123';
      const updates = { password: 'newPassword123' };
      const updatedBy = 'user-123';

      const mockUser: User = {
        uid,
        data: {
          email: 'user@example.com',
          password: 'new-hashed-password',
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy,
      };

      mockDb.updateOne.mockResolvedValue({} as any);
      mockDb.findOne.mockResolvedValue(mockUser);

      await authService.updateAccount(uid, updates, updatedBy);

      expect(mockDb.updateOne).toHaveBeenCalled();
      const updateCall = mockDb.updateOne.mock.calls[0][2];
      expect(updateCall['data.password']).toBeDefined();
      expect(updateCall['data.password']).not.toBe(updates.password);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const uid = 'user-123';

      mockDb.deleteOne.mockResolvedValue(true);

      const result = await authService.deleteAccount(uid);

      expect(mockDb.deleteOne).toHaveBeenCalledWith(COLLECTIONS.USERS, { uid });
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      const uid = 'nonexistent';

      mockDb.deleteOne.mockResolvedValue(false);

      const result = await authService.deleteAccount(uid);

      expect(result).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should generate new token for existing user', async () => {
      const uid = 'user-123';
      const mockUser: User = {
        uid,
        data: {
          email: 'user@example.com',
          password: 'hashed',
          roleId: 'role-123',
        },
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      };

      mockDb.findOne.mockResolvedValue(mockUser);

      const token = await authService.refreshToken(uid);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should throw error if user not found', async () => {
      const uid = 'nonexistent';

      mockDb.findOne.mockResolvedValue(null);

      await expect(authService.refreshToken(uid)).rejects.toThrow(
        'User not found'
      );
    });
  });
});

