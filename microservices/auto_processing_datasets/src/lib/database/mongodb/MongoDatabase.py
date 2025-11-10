from pymongo import MongoClient
from typing import Optional
from ..base import BaseAdapter
import sys
import os

# Add src to path for absolute imports
_current_dir = os.path.dirname(os.path.abspath(__file__))
_src_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(_current_dir))), 'src')
if _src_dir not in sys.path:
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(_current_dir))))


class MongoDatabase(BaseAdapter):
    """MongoDB adapter implementation."""
    
    def __init__(self, host: str = None, port: int = None, dbname: str = None, 
                 username: str = None, password: str = None):
        from src.configs.env import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
        self.host = host or DB_HOST
        self.port = port or DB_PORT
        self.dbname = dbname or DB_NAME
        self.username = username or DB_USER
        self.password = password or DB_PASSWORD
        self.client: Optional[MongoClient] = None
        self.db = None
    
    def _build_connection_uri(self) -> str:
        """Build MongoDB connection URI."""
        if self.username and self.password:
            return f"mongodb://{self.username}:{self.password}@{self.host}:{self.port}/{self.dbname}?authSource=admin"
        else:
            return f"mongodb://{self.host}:{self.port}/{self.dbname}"
    
    def connect(self) -> None:
        """Connect to MongoDB."""
        try:
            # Close existing connection if any
            if self.client:
                try:
                    self.client.close()
                except:
                    pass
            
            uri = self._build_connection_uri()
            # Only pass authSource if credentials are provided
            # PyMongo doesn't accept None for authSource
            if self.username and self.password:
                self.client = MongoClient(uri, authSource='admin', serverSelectionTimeoutMS=5000)
            else:
                self.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            self.db = self.client[self.dbname]
            
            # Test the connection
            self.client.admin.command('ping')
            print(f"Connected to MongoDB: {self.host}:{self.port}/{self.dbname}")
        except Exception as error:
            print(f"MongoDB connection error: {error}")
            self.client = None
            self.db = None
            raise
    
    def is_connected(self) -> bool:
        """Check if database is connected and connection is alive."""
        try:
            if self.client is None or self.db is None:
                return False
            # Ping the server to check if connection is alive
            self.client.admin.command('ping')
            return True
        except Exception:
            return False
    
    def ensure_connected(self) -> None:
        """Ensure database is connected, reconnect if necessary."""
        if not self.is_connected():
            print("Database connection lost, reconnecting...")
            self.connect()
    
    def disconnect(self) -> None:
        """Disconnect from MongoDB."""
        if self.client:
            try:
                self.client.close()
            except:
                pass
            self.client = None
            self.db = None
            print("Disconnected from MongoDB")
    
    def find_one(self, collection: str, filter: dict) -> dict | None:
        """Find one document in a collection."""
        self.ensure_connected()
        return self.db[collection].find_one(filter)
    
    def update_one(self, collection: str, filter: dict, update: dict) -> None:
        """Update one document in a collection."""
        self.ensure_connected()
        self.db[collection].update_one(filter, {"$set": update})

