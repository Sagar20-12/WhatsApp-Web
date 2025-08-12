const WhatsAppPayloadProcessor = require('./process-whatsapp-payloads');

async function testProcessor() {
  console.log('🧪 Testing WhatsApp Payload Processor...\n');
  
  const processor = new WhatsAppPayloadProcessor();
  
  try {
    // Test connection
    console.log('1. Testing MongoDB connection...');
    await processor.connect();
    console.log('✅ Connection successful\n');
    
    // Test payload file reading
    console.log('2. Testing payload file reading...');
    const files = processor.readPayloadFiles();
    console.log(`✅ Found ${files.length} payload files\n`);
    
    // Test payload parsing
    console.log('3. Testing payload parsing...');
    if (files.length > 0) {
      const { payload } = processor.parsePayloadFile(files[0]);
      const payloadType = processor.getPayloadType(payload);
      console.log(`✅ Successfully parsed ${files[0]} as ${payloadType} payload\n`);
      
      // Test data extraction
      console.log('4. Testing data extraction...');
      if (payloadType === 'message') {
        const messageData = processor.extractMessageData(payload);
        console.log('✅ Message data extracted:');
        console.log(`   - Message ID: ${messageData.message_id}`);
        console.log(`   - From: ${messageData.from}`);
        console.log(`   - Contact: ${messageData.contact_name}`);
        console.log(`   - Body: ${messageData.message_body.substring(0, 50)}...`);
      } else if (payloadType === 'status') {
        const statusData = processor.extractStatusData(payload);
        console.log('✅ Status data extracted:');
        console.log(`   - Message ID: ${statusData.message_id}`);
        console.log(`   - Status: ${statusData.status}`);
        console.log(`   - Timestamp: ${statusData.timestamp}`);
      }
    }
    
    console.log('\n5. Testing database operations...');
    
    // Test creating indexes
    await processor.createIndexes();
    console.log('✅ Indexes created successfully');
    
    // Test processing a single file
    if (files.length > 0) {
      console.log(`\n6. Testing single file processing: ${files[0]}`);
      await processor.processPayloadFile(files[0]);
      console.log('✅ Single file processing completed');
    }
    
    // Display summary
    console.log('\n7. Testing summary display...');
    await processor.displaySummary();
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await processor.disconnect();
  }
}

// Run tests if called directly
if (require.main === module) {
  testProcessor().catch(console.error);
}

module.exports = testProcessor;
