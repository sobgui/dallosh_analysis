import { UsersService } from '@api/users/service';
import { DatabaseAdapter } from '@lib/database/base/BaseAdapter';
import { COLLECTIONS } from '@configs/constants';
import { User, UserData } from '@/types/schema/users.schema';

describe('UsersService', () => {
  let usersService: UsersService;
  let mockDb: jest.Mocked<DatabaseAdapter>;

  beforeEach(() => {
    mockDb = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      findMany: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      insertMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      createCollection: jest.fn(),
      collectionExists: jest.fn(),
    } as any;

    usersService = new UsersService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData: UserData = {
        email: 'newuser@example.com',
        password: 'password123',
        roleId: 'role-123',
      };
      const createdBy = 'admin-123';

      const mockUser: User = {
        uid: 'user-123',
        data: userData,
        createdAt: new Date(),
        createdBy,
        updatedAt: new Date(),
        updatedBy: createdBy,
      };

      mockDb.insertOne.mockResolvedValue(mockUser);

      const result = await usersService.create(userData, createdBy);

      expect(mockDb.insertOne).toHaveBeenCalledWith(
        COLLECTIONS.USERS,
        expect.objectContaining({
          data: expect.objectContaining({
            email: userData.email,
          }),
          createdBy,
        })
      );
      expect(result).toBeDefined();
      expect(result.data.email).toBe(userData.email);
    });

    it('should hash password when creating user', async () => {
      const userData: UserData = {
        email: 'user@example.com',
        password: 'plainPassword',
      };
      const createdBy = 'admin-123';

      const mockUser: User = {
        uid: 'user-123',
        data: {
          ...userData,
          password: 'hashed-password',
        },
        createdAt: new Date(),
        createdBy,
        updatedAt: new Date(),
        updatedBy: createdBy,
      };

      mockDb.insertOne.mockResolvedValue(mockUser);

      await usersService.create(userData, createdBy);

      const insertCall = mockDb.insertOne.mock.calls[0][1];
      expect(insertCall.data.password).toBeDefined();
      expect(insertCall.data.password).not.toBe('plainPassword');
    });
  });

  describe('findAll', () => {
    it('should return all users with default filter', async () => {
      const mockUsers: User[] = [
        {
          uid: 'user-1',
          data: {
            email: 'user1@example.com',
            password: 'hashed1',
          },
          createdAt: new Date(),
          createdBy: 'system',
          updatedAt: new Date(),
          updatedBy: 'system',
        },
        {
          uid: 'user-2',
          data: {
            email: 'user2@example.com',
            password: 'hashed2',
          },
          createdAt: new Date(),
          createdBy: 'system',
          updatedAt: new Date(),
          updatedBy: 'system',
        },
      ];

      mockDb.findMany.mockResolvedValue(mockUsers);

      const result = await usersService.findAll();

      expect(mockDb.findMany).toHaveBeenCalledWith(
        COLLECTIONS.USERS,
        {},
        {}
      );
      expect(result).toEqual(mockUsers);
    });

    it('should return filtered users', async () => {
      const filter = { 'data.email': 'test@example.com' };
      const options = { limit: 10 };

      const mockUsers: User[] = [
        {
          uid: 'user-1',
          data: {
            email: 'test@example.com',
            password: 'hashed',
          },
          createdAt: new Date(),
          createdBy: 'system',
          updatedAt: new Date(),
          updatedBy: 'system',
        },
      ];

      mockDb.findMany.mockResolvedValue(mockUsers);

      const result = await usersService.findAll(filter, options);

      expect(mockDb.findMany).toHaveBeenCalledWith(
        COLLECTIONS.USERS,
        filter,
        options
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
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

      const result = await usersService.findOne(uid);

      expect(mockDb.findOne).toHaveBeenCalledWith(COLLECTIONS.USERS, { uid });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const uid = 'nonexistent';

      mockDb.findOne.mockResolvedValue(null);

      const result = await usersService.findOne(uid);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const uid = 'user-123';
      const updates: Partial<UserData> = {
        email: 'newemail@example.com',
      };
      const updatedBy = 'admin-123';

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

      const result = await usersService.update(uid, updates, updatedBy);

      expect(mockDb.updateOne).toHaveBeenCalledWith(
        COLLECTIONS.USERS,
        { uid },
        expect.objectContaining({
          'data.email': updates.email,
          updatedAt: expect.any(Date),
          updatedBy,
        })
      );
      expect(result).toBeDefined();
      expect(result?.data.email).toBe(updates.email);
    });

    it('should hash password when updating', async () => {
      const uid = 'user-123';
      const updates: Partial<UserData> = {
        password: 'newPassword123',
      };
      const updatedBy = 'admin-123';

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

      await usersService.update(uid, updates, updatedBy);

      const updateCall = mockDb.updateOne.mock.calls[0][2];
      expect(updateCall['data.password']).toBeDefined();
      expect(updateCall['data.password']).not.toBe(updates.password);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const uid = 'user-123';

      mockDb.deleteOne.mockResolvedValue(true);

      const result = await usersService.delete(uid);

      expect(mockDb.deleteOne).toHaveBeenCalledWith(COLLECTIONS.USERS, {
        uid,
      });
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      const uid = 'nonexistent';

      mockDb.deleteOne.mockResolvedValue(false);

      const result = await usersService.delete(uid);

      expect(result).toBe(false);
    });
  });
});

