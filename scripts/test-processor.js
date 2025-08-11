import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebhookPayloadValidator {
  constructor() {
    this.stats = {
      total: 0,
      valid: 0,
      invalid: 0,
      messages: 0,
      statuses: 0,
      errors: []
    };
  }

  async validatePayloads(payloadsDir = './payloads') {
    try {
      console.log('🔍 Starting Webhook Payload Validation...\n');
      
      const files = await fs.readdir(payloadsDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      console.log(`📁 Found ${jsonFiles.length} JSON payload files`);
      
      for (const file of jsonFiles) {
        await this.validateFile(path.join(payloadsDir, file));
      }
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Error during validation:', error);
    }
  }

  async validateFile(filePath) {
    const fileName = path.basename(filePath);
    
    try {
      console.log(`📄 Validating: ${fileName}`);
      
      const fileContent = await fs.readFile(filePath, 'utf8');
      const payload = JSON.parse(fileContent);
      
      if (this.isValidPayload(payload)) {
        this.stats.valid++;
        const payloadType = this.determinePayloadType(payload);
        
        if (payloadType === 'message') {
          this.stats.messages++;
          console.log(`  ✅ Valid message payload`);
        } else if (payloadType === 'status') {
          this.stats.statuses++;
          console.log(`  ✅ Valid status payload`);
        }
      } else {
        this.stats.invalid++;
        console.log(`  ❌ Invalid payload structure`);
      }
      
      this.stats.total++;
      
    } catch (error) {
      this.stats.invalid++;
      this.stats.errors.push({ file: fileName, error: error.message });
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  isValidPayload(payload) {
    // Check basic structure
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    // Check required fields
    if (!payload.payload_type || !payload.metaData) {
      return false;
    }

    // Check metaData structure
    if (!payload.metaData.entry || !Array.isArray(payload.metaData.entry)) {
      return false;
    }

    if (payload.metaData.entry.length === 0) {
      return false;
    }

    const entry = payload.metaData.entry[0];
    if (!entry.changes || !Array.isArray(entry.changes)) {
      return false;
    }

    if (entry.changes.length === 0) {
      return false;
    }

    const change = entry.changes[0];
    if (!change.field || !change.value) {
      return false;
    }

    return true;
  }

  determinePayloadType(payload) {
    const value = payload.metaData?.entry?.[0]?.changes?.[0]?.value;
    
    if (value?.messages) {
      return 'message';
    }
    
    if (value?.statuses) {
      return 'status';
    }
    
    return 'unknown';
  }

  printResults() {
    console.log('\n📊 Validation Results:');
    console.log('=====================');
    console.log(`Total files: ${this.stats.total}`);
    console.log(`Valid payloads: ${this.stats.valid}`);
    console.log(`Invalid payloads: ${this.stats.invalid}`);
    console.log(`Message payloads: ${this.stats.messages}`);
    console.log(`Status payloads: ${this.stats.statuses}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.stats.errors.forEach(error => {
        console.log(`  ${error.file}: ${error.error}`);
      });
    }
    
    const successRate = ((this.stats.valid / this.stats.total) * 100).toFixed(1);
    console.log(`\n✅ Success rate: ${successRate}%`);
  }

  async analyzePayloadStructure(payloadsDir = './payloads') {
    try {
      console.log('\n🔬 Analyzing Payload Structure...\n');
      
      const files = await fs.readdir(payloadsDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const structures = {
        message: new Set(),
        status: new Set(),
        unknown: new Set()
      };
      
      for (const file of jsonFiles) {
        const filePath = path.join(payloadsDir, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const payload = JSON.parse(fileContent);
        
        const payloadType = this.determinePayloadType(payload);
        structures[payloadType].add(file);
      }
      
      console.log('📋 Payload Type Distribution:');
      console.log(`  Messages: ${structures.message.size} files`);
      console.log(`  Statuses: ${structures.status.size} files`);
      console.log(`  Unknown: ${structures.unknown.size} files`);
      
      if (structures.message.size > 0) {
        console.log('\n📨 Message Payload Files:');
        structures.message.forEach(file => console.log(`  - ${file}`));
      }
      
      if (structures.status.size > 0) {
        console.log('\n📊 Status Payload Files:');
        structures.status.forEach(file => console.log(`  - ${file}`));
      }
      
    } catch (error) {
      console.error('❌ Error during analysis:', error);
    }
  }
}

// Main execution
async function main() {
  const validator = new WebhookPayloadValidator();
  
  try {
    // Validate all payloads
    await validator.validatePayloads();
    
    // Analyze payload structure
    await validator.analyzePayloadStructure();
    
    console.log('\n🎉 Validation complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export default WebhookPayloadValidator;

// Run if called directly
const isMainModule = process.argv[1] && process.argv[1].endsWith('test-processor.js');

if (isMainModule) {
  main();
}
