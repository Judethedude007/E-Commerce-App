import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'E-commerce-app';

let db = null;
let client = null;

// Connect to MongoDB
async function connectDB() {
  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    db = client.db(dbName);
    
    // Initialize collections
    const collections = {
      users: db.collection('users'),
      products: db.collection('products'),
      ratings: db.collection('ratings'),
      wishlist: db.collection('wishlist')
    };
    
    return collections;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err;
  }
}

// Create a singleton to avoid multiple connections
let collections = null;

export async function getCollections() {
  if (!collections) {
    collections = await connectDB();
  }
  return collections;
}

// Close MongoDB connection when Node.js process ends
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
});