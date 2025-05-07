const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourcePath = path.join(__dirname, 'locations.json');
const destPath = path.join(__dirname, '..', 'locations.json');

// Check if source file exists
if (!fs.existsSync(sourcePath)) {
  console.error('Source file not found:', sourcePath);
  process.exit(1);
}

// Copy the file
try {
  fs.copyFileSync(sourcePath, destPath);
  console.log('Successfully copied locations.json to the root directory');
} catch (error) {
  console.error('Error copying file:', error.message);
  process.exit(1);
}
