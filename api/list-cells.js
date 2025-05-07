const fs = require("fs");
const path = require("path");

// Read the locations.json file
try {
  console.log("Reading locations.json file...");
  const locationsFilePath = path.join(__dirname, "locations.json");
  const locationsData = JSON.parse(fs.readFileSync(locationsFilePath, "utf8"));
  console.log("Successfully parsed locations.json");

  // Simple object to store cell names and count occurrences
  const cellNames = {};
  let totalCells = 0;

  // Process the data to extract cell names
  console.log("Processing data...");
  locationsData.provinces.forEach((province) => {
    province.districts.forEach((district) => {
      district.sectors.forEach((sector) => {
        sector.cells.forEach((cell) => {
          totalCells++;
          const cellName = cell.name.toUpperCase();

          if (!cellNames[cellName]) {
            cellNames[cellName] = [];
          }

          cellNames[cellName].push({
            province: province.name,
            district: district.name,
            sector: sector.name,
          });
        });
      });
    });
  });

  // Print summary
  console.log(`\nTotal cells in file: ${totalCells}`);
  console.log(`Total unique cell names: ${Object.keys(cellNames).length}`);

  // Check for duplicate cell names
  const duplicates = Object.entries(cellNames).filter(
    ([_, locations]) => locations.length > 1,
  );

  console.log(
    `\nFound ${duplicates.length} cell names that appear in multiple locations:`,
  );

  duplicates.forEach(([name, locations]) => {
    console.log(
      `\nCell name: ${name} (appears in ${locations.length} locations)`,
    );
    locations.forEach((loc) => {
      console.log(
        `  - Province: ${loc.province}, District: ${loc.district}, Sector: ${loc.sector}`,
      );
    });
  });
} catch (error) {
  console.error("Error processing locations.json:", error.message);
  if (error.code === "ENOENT") {
    console.error(
      "locations.json file not found. Make sure it exists in the api directory.",
    );
  }
}
