const fs = require('fs');
const path = require('path');

// Read the locations.json file
try {
  console.log('Reading locations.json file...');
  const locationsFilePath = path.join(__dirname, 'locations.json');
  const locationsData = JSON.parse(fs.readFileSync(locationsFilePath, 'utf8'));
  console.log('Successfully parsed locations.json');

  // Simple object to store district names and count occurrences
  const districtNames = {};
  let totalDistricts = 0;
  
  // Process the data to extract district names
  console.log('Processing data...');
  locationsData.provinces.forEach(province => {
    province.districts.forEach(district => {
      totalDistricts++;
      const districtName = district.name.toUpperCase();
      
      if (!districtNames[districtName]) {
        districtNames[districtName] = [];
      }
      
      districtNames[districtName].push({
        province: province.name,
        sectorCount: district.sectors.length
      });
    });
  });

  // Print summary
  console.log(`\nTotal districts in file: ${totalDistricts}`);
  console.log(`Total unique district names: ${Object.keys(districtNames).length}`);
  
  // Check for duplicate district names
  const duplicates = Object.entries(districtNames)
    .filter(([_, locations]) => locations.length > 1);
  
  console.log(`\nFound ${duplicates.length} district names that appear in multiple locations:`);
  
  duplicates.forEach(([name, locations]) => {
    console.log(`\nDistrict name: ${name} (appears in ${locations.length} locations)`);
    locations.forEach(loc => {
      console.log(`  - Province: ${loc.province}, Sector Count: ${loc.sectorCount}`);
    });
  });

  // Also print all provinces for reference
  console.log('\n=== All Provinces ===');
  const provinces = new Set();
  locationsData.provinces.forEach(province => {
    provinces.add(province.name);
  });
  
  console.log(`Total provinces: ${provinces.size}`);
  console.log('Province names:');
  Array.from(provinces).sort().forEach(name => {
    console.log(`  - ${name}`);
  });

} catch (error) {
  console.error('Error processing locations.json:', error.message);
  if (error.code === 'ENOENT') {
    console.error('locations.json file not found. Make sure it exists in the api directory.');
  }
}
