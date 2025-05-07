const fs = require('fs');
const path = require('path');

// Read the locations.json file
try {
  console.log('Reading locations.json file...');
  const locationsFilePath = path.join(__dirname, 'locations.json');
  const locationsData = JSON.parse(fs.readFileSync(locationsFilePath, 'utf8'));
  console.log('Successfully parsed locations.json');

  // Simple object to store sector names and count occurrences
  const sectorNames = {};
  let totalSectors = 0;
  
  // Process the data to extract sector names
  console.log('Processing data...');
  locationsData.provinces.forEach(province => {
    province.districts.forEach(district => {
      district.sectors.forEach(sector => {
        totalSectors++;
        const sectorName = sector.name.toUpperCase();
        
        if (!sectorNames[sectorName]) {
          sectorNames[sectorName] = [];
        }
        
        sectorNames[sectorName].push({
          province: province.name,
          district: district.name,
          cellCount: sector.cells.length
        });
      });
    });
  });

  // Print summary
  console.log(`\nTotal sectors in file: ${totalSectors}`);
  console.log(`Total unique sector names: ${Object.keys(sectorNames).length}`);
  
  // Check for duplicate sector names
  const duplicates = Object.entries(sectorNames)
    .filter(([_, locations]) => locations.length > 1);
  
  console.log(`\nFound ${duplicates.length} sector names that appear in multiple locations:`);
  
  duplicates.forEach(([name, locations]) => {
    console.log(`\nSector name: ${name} (appears in ${locations.length} locations)`);
    locations.forEach(loc => {
      console.log(`  - Province: ${loc.province}, District: ${loc.district}, Cell Count: ${loc.cellCount}`);
    });
  });

} catch (error) {
  console.error('Error processing locations.json:', error.message);
  if (error.code === 'ENOENT') {
    console.error('locations.json file not found. Make sure it exists in the api directory.');
  }
}
