import { MongoDatabase } from '@lib/database/mongodb/MongoDatabase';
import { MongoClient, Db, Collection } from 'mongodb';
import { DatabaseConfig } from '@lib/database/types';

// Mock mongodb
jest.mock('mongodb');

describe('MongoDatabase', () => {
  let mongoDatabase: MongoDatabase;
  let mockClient: jest.Mocked<MongoClient>;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: jest.Mocked<Collection>;
  let testConfig: DatabaseConfig;

  beforeEach(() => {
    // Create test configuration
    testConfig = {
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      dbname: 'test_db',
    };

    // Create mocks
    mockCollection = {
      insertOne: jest.fn(),
      insertMany: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      countDocuments: jest.fn(),
    } as any;

    mockDb = {
      listCollections: jest.fn(),
      createCollection: jest.fn(),
      collection: jest.fn().mockReturnValue(mockCollection),
    } as any;

    mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue(mockDb),
    } as any;

    (MongoClient as jest.MockedClass<typeof MongoClient>).mockImplementation(
      () => mockClient
    );

    mongoDatabase = new MongoDatabase(testConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect to MongoDB successfully', async () => {
      await mongoDatabase.connect();

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.db).toHaveBeenCalled();
    });

    it('should throw error on connection failure', async () => {
      const error = new Error('Connection failed');
      mockClient.connect.mockRejectedValue(error);

      await expect(mongoDatabase.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from MongoDB', async () => {
      await mongoDatabase.connect();
      await mongoDatabase.disconnect();

      expect(mockClient.close).toHaveBeenCalled();
    });

    it('should handle disconnect when not connected', async () => {
      await mongoDatabase.disconnect();
      // Should not throw error
    });
  });

  describe('createCollection', () => {
    it('should create collection if it does not exist', async () => {
      await mongoDatabase.connect();

      const collectionList = {
        toArray: jest.fn().mockResolvedValue([]),
      };
      mockDb.listCollections.mockReturnValue(collectionList as any);

      await mongoDatabase.createCollection('test-collection');

      expect(mockDb.listCollections).toHaveBeenCalledWith({
        name: 'test-collection',
      });
      expect(mockDb.createCollection).toHaveBeenCalledWith('test-collection');
    });

    it('should not create collection if it already exists', async () => {
      await mongoDatabase.connect();

      const collectionList = {
        toArray: jest.fn().mockResolvedValue([{ name: 'test-collection' }]),
      };
      mockDb.listCollections.mockReturnValue(collectionList as any);

      await mongoDatabase.createCollection('test-collection');

      expect(mockDb.createCollection).not.toHaveBeenCalled();
    });
  });

  describe('collectionExists', () => {
    it('should return true if collection exists', async () => {
      await mongoDatabase.connect();

      const collectionList = {
        toArray: jest.fn().mockResolvedValue([{ name: 'test-collection' }]),
      };
      mockDb.listCollections.mockReturnValue(collectionList as any);

      const result = await mongoDatabase.collectionExists('test-collection');

      expect(result).toBe(true);
    });

    it('should return false if collection does not exist', async () => {
      await mongoDatabase.connect();

      const collectionList = {
        toArray: jest.fn().mockResolvedValue([]),
      };
      mockDb.listCollections.mockReturnValue(collectionList as any);

      const result = await mongoDatabase.collectionExists('test-collection');

      expect(result).toBe(false);
    });
  });

  describe('insertOne', () => {
    it('should insert one document', async () => {
      await mongoDatabase.connect();

      const document = { name: 'test', value: 123 };
      const insertResult = { insertedId: 'id-123' };
      mockCollection.insertOne.mockResolvedValue(insertResult as any);

      const result = await mongoDatabase.insertOne('test-collection', document);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(document);
      expect(result).toEqual({ ...document, _id: 'id-123' });
    });
  });

  describe('findOne', () => {
    it('should find one document', async () => {
      await mongoDatabase.connect();

      const filter = { name: 'test' };
      const document = { _id: 'id-123', name: 'test', value: 123 };
      mockCollection.findOne.mockResolvedValue(document);

      const result = await mongoDatabase.findOne('test-collection', filter);

      expect(mockCollection.findOne).toHaveBeenCalledWith(filter);
      expect(result).toEqual(document);
    });

    it('should return null if document not found', async () => {
      await mongoDatabase.connect();

      mockCollection.findOne.mockResolvedValue(null);

      const result = await mongoDatabase.findOne('test-collection', {
        name: 'nonexistent',
      });

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should find many documents', async () => {
      await mongoDatabase.connect();

      const filter = { status: 'active' };
      const documents = [
        { _id: 'id-1', status: 'active' },
        { _id: 'id-2', status: 'active' },
      ];

      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(documents),
      };
      mockCollection.find.mockReturnValue(mockCursor as any);

      const result = await mongoDatabase.findMany('test-collection', filter);

      expect(mockCollection.find).toHaveBeenCalledWith(filter);
      expect(result).toEqual(documents);
    });

    it('should apply options (sort, limit, skip)', async () => {
      await mongoDatabase.connect();

      const filter = {};
      const options = {
        sort: { createdAt: -1 },
        limit: 10,
        skip: 5,
      };

      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };
      mockCollection.find.mockReturnValue(mockCursor as any);

      await mongoDatabase.findMany('test-collection', filter, options);

      expect(mockCursor.sort).toHaveBeenCalledWith(options.sort);
      expect(mockCursor.limit).toHaveBeenCalledWith(options.limit);
      expect(mockCursor.skip).toHaveBeenCalledWith(options.skip);
    });
  });

  describe('updateOne', () => {
    it('should update one document', async () => {
      await mongoDatabase.connect();

      const filter = { _id: 'id-123' };
      const update = { name: 'updated' };
      const updateResult = { modifiedCount: 1 };
      mockCollection.updateOne.mockResolvedValue(updateResult as any);

      const result = await mongoDatabase.updateOne(
        'test-collection',
        filter,
        update
      );

      expect(mockCollection.updateOne).toHaveBeenCalledWith(filter, {
        $set: update,
      });
      expect(result).toEqual(updateResult);
    });
  });

  describe('deleteOne', () => {
    it('should delete one document', async () => {
      await mongoDatabase.connect();

      const filter = { _id: 'id-123' };
      const deleteResult = { deletedCount: 1 };
      mockCollection.deleteOne.mockResolvedValue(deleteResult as any);

      const result = await mongoDatabase.deleteOne('test-collection', filter);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith(filter);
      expect(result).toBe(true);
    });

    it('should return false if no document deleted', async () => {
      await mongoDatabase.connect();

      const filter = { _id: 'nonexistent' };
      const deleteResult = { deletedCount: 0 };
      mockCollection.deleteOne.mockResolvedValue(deleteResult as any);

      const result = await mongoDatabase.deleteOne('test-collection', filter);

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count documents', async () => {
      await mongoDatabase.connect();

      const filter = { status: 'active' };
      mockCollection.countDocuments.mockResolvedValue(5);

      const result = await mongoDatabase.count('test-collection', filter);

      expect(mockCollection.countDocuments).toHaveBeenCalledWith(filter);
      expect(result).toBe(5);
    });

    it('should count all documents with empty filter', async () => {
      await mongoDatabase.connect();

      mockCollection.countDocuments.mockResolvedValue(10);

      const result = await mongoDatabase.count('test-collection');

      expect(mockCollection.countDocuments).toHaveBeenCalledWith({});
      expect(result).toBe(10);
    });
  });
});

