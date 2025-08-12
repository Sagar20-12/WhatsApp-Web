const { MongoClient } = require('mongodb');

// MongoDB connection configuration
const MONGODB_URI = 'mongodb+srv://whatsapp:Ssr20122002@vistagram.phcydle.mongodb.net/?retryWrites=true&w=majority&appName=Vistagram';
const DATABASE_NAME = 'whatsapp';
const COLLECTION_NAME = 'processed_messages';

async function testConnection() {
  console.log('🧪 Testing MongoDB Connection...\n');
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    console.log(`📊 Database: ${DATABASE_NAME}`);
    console.log(`📝 Collection: ${COLLECTION_NAME}`);
    
    // Count documents
    const count = await collection.countDocuments();
    console.log(`📈 Total documents: ${count}`);
    
    if (count > 0) {
      // Show sample documents
      console.log('\n📄 Sample documents:');
      const samples = await collection.find({}).limit(3).toArray();
      samples.forEach((doc, index) => {
        console.log(`\n--- Document ${index + 1} ---`);
        console.log('ID:', doc._id);
        console.log('Message ID:', doc.message_id);
        console.log('Contact Name:', doc.contact_name);
        console.log('Message Body:', doc.message_body?.substring(0, 50) + '...');
        console.log('Status:', doc.status);
        console.log('Timestamp:', new Date(doc.timestamp * 1000).toLocaleString());
      });
      
      // Show conversation IDs
      console.log('\n💬 Conversations found:');
      const conversations = await collection.distinct('conversation_id');
      conversations.forEach((convId, index) => {
        console.log(`${index + 1}. ${convId}`);
      });
      
    } else {
      console.log('\n⚠️  No documents found in collection');
      console.log('💡 You may need to run the payload processor first:');
      console.log('   cd scripts && npm start');
    }
    
    await client.close();
    console.log('\n🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check if MongoDB Atlas is accessible');
    console.error('2. Verify the connection string');
    console.error('3. Check network connectivity');
    console.error('4. Ensure the database and collection exist');
  }
}

testConnection();
