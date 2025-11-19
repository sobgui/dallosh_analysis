import { MongoClient, Db, Collection, MongoClientOptions } from 'mongodb';
import { DatabaseAdapter } from '../base/BaseAdapter';
import { DatabaseConfig } from '../types';

export class MongoDatabase implements DatabaseAdapter {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  private buildConnectionUri(): string {
    const { host, port, dbname, auth } = this.config;

    if (auth?.username && auth?.password) {
      // Connection with authentication - use admin database for auth
      return `mongodb://${encodeURIComponent(auth.username)}:${encodeURIComponent(auth.password)}@${host}:${port}/${dbname}?authSource=admin`;
    } else {
      // Connection without authentication
      return `mongodb://${host}:${port}/${dbname}`;
    }
  }

  

  async connect(): Promise<void> {
    try {
      const uri = this.buildConnectionUri();
      const options: MongoClientOptions = {
        ...this.config.options,
        authSource: this.config.auth ? 'admin' : undefined,
      };

      this.client = new MongoClient(uri, options);
      await this.client.connect();
      this.db = this.client.db(this.config.dbname);
      console.log(`Connected to MongoDB: ${this.config.host}:${this.config.port}/${this.config.dbname}`);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }


  async createCollection(name: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    try {
      const collections = await this.db.listCollections({ name }).toArray();
      if (collections.length === 0) {
        await this.db.createCollection(name);
        console.log(`Collection ${name} created`);
      }
    } catch (error) {
      console.error(`Error creating collection ${name}:`, error);
      throw error;
    }
  }

  async collectionExists(name: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    const collections = await this.db.listCollections({ name }).toArray();
    return collections.length > 0;
  }

  private getCollection(collection: string): Collection {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection(collection);
  }

  async insertOne(collection: string, document: any): Promise<any> {
    const result = await this.getCollection(collection).insertOne(document);
    return { ...document, _id: result.insertedId };
  }

  async insertMany(collection: string, documents: any[]): Promise<any[]> {
    const result = await this.getCollection(collection).insertMany(documents);
    return documents.map((doc, index) => ({
      ...doc,
      _id: result.insertedIds[index],
    }));
  }

  async findOne(collection: string, filter: any): Promise<any | null> {
    return await this.getCollection(collection).findOne(filter);
  }

  async findMany(
    collection: string,
    filter: any = {},
    options: any = {}
  ): Promise<any[]> {
    const cursor = this.getCollection(collection).find(filter);
    
    if (options.sort) {
      cursor.sort(options.sort);
    }
    if (options.limit) {
      cursor.limit(options.limit);
    }
    if (options.skip) {
      cursor.skip(options.skip);
    }

    return await cursor.toArray();
  }

  async updateOne(collection: string, filter: any, update: any): Promise<any> {
    const result = await this.getCollection(collection).updateOne(filter, {
      $set: update,
    });
    return result;
  }

  async updateMany(
    collection: string,
    filter: any,
    update: any
  ): Promise<number> {
    const result = await this.getCollection(collection).updateMany(filter, {
      $set: update,
    });
    return result.modifiedCount;
  }

  async deleteOne(collection: string, filter: any): Promise<boolean> {
    const result = await this.getCollection(collection).deleteOne(filter);
    return result.deletedCount > 0;
  }

  async deleteMany(collection: string, filter: any): Promise<number> {
    const result = await this.getCollection(collection).deleteMany(filter);
    return result.deletedCount;
  }

  async count(collection: string, filter: any = {}): Promise<number> {
    return await this.getCollection(collection).countDocuments(filter);
  }
}

