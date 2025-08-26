import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Ajv
const ajv = new Ajv();
addFormats(ajv);

// Load the schema and data
const schemaPath = path.join(__dirname, '../src/profile.schema.json');
const dataPath = path.join(__dirname, '../profile_data.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Validate the data against the schema
const validate = ajv.compile(schema);
const valid = validate(data);

if (valid) {
  console.log('✅ profile_data.json is valid!');
  process.exit(0);
} else {
  console.error('❌ profile_data.json is invalid:');
  console.error(ajv.errorsText(validate.errors));
  process.exit(1);
}
