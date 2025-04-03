// For testing environment variables
const fs = require('fs');
const path = require('path');

console.log('Current directory:', process.cwd());

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
console.log('.env path:', envPath);
console.log('.env exists:', fs.existsSync(envPath));

// Try to read it directly
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env content (first 10 chars + length):', 
    envContent.substring(0, 10) + '... (' + envContent.length + ' chars)');
    
  // Parse it manually
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  const envVars = {};
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  console.log('Parsed variables:', envVars);
  
  // Check if our specific variable exists
  console.log('REACT_APP_OPENROUTER_API_KEY exists in parsed file:', 
    'REACT_APP_OPENROUTER_API_KEY' in envVars);
}

// Check env var directly
console.log('process.env.REACT_APP_OPENROUTER_API_KEY exists:', 
  process.env.REACT_APP_OPENROUTER_API_KEY ? 'yes' : 'no'); 