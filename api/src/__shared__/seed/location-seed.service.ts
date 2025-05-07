import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";
import * as path from "path";
import { Cell } from "src/locations/entities/cell.entity";
import { District } from "src/locations/entities/district.entity";
import { Province } from "src/locations/entities/province.entity";
import { Sector } from "src/locations/entities/sector.entity";
import { Village } from "src/locations/entities/village.entity";
import { Repository } from "typeorm";

interface LocationData {
  provinces: {
    name: string;
    districts: {
      name: string;
      sectors: {
        name: string;
        cells: {
          name: string;
          villages: {
            name: string;
          }[];
        }[];
      }[];
    }[];
  }[];
}

@Injectable()
export class LocationSeedService {
  private readonly logger = new Logger(LocationSeedService.name);

  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
  ) {}

  async run() {
    try {
      // Check if there are already provinces in the database
      const provinceCount = await this.provinceRepository.count();
      const districtCount = await this.districtRepository.count();
      const sectorCount = await this.sectorRepository.count();
      const cellCount = await this.cellRepository.count();
      const villageCount = await this.villageRepository.count();

      this.logger.log(
        `Current database state: ${provinceCount} provinces, ${districtCount} districts, ${sectorCount} sectors, ${cellCount} cells, and ${villageCount} villages`,
      );

      if (provinceCount > 0) {
        this.logger.log("Locations already seeded. Skipping...");
        return;
      }

      // Read the locations.json file
      const locationsFilePath = path.join(process.cwd(), "locations.json");
      const locationsData = JSON.parse(
        fs.readFileSync(locationsFilePath, "utf8"),
      ) as LocationData;

      // Process each province, district, sector, cell, and village
      for (const provinceData of locationsData.provinces) {
        const provinceName = provinceData.name.toUpperCase();

        // Create and save the province
        const province = new Province();
        province.name = provinceName;
        const savedProvince = await this.provinceRepository.save(province);

        this.logger.log(`Created province: ${provinceName}`);

        for (const districtData of provinceData.districts) {
          const districtName = districtData.name.toUpperCase();

          // Create and save the district
          const district = new District();
          district.name = districtName;
          district.province = savedProvince;
          const savedDistrict = await this.districtRepository.save(district);

          this.logger.log(
            `Created district: ${districtName} in province ${provinceName}`,
          );

          for (const sectorData of districtData.sectors) {
            const sectorName = sectorData.name.toUpperCase();

            // Create and save the sector
            const sector = new Sector();
            sector.name = sectorName;
            sector.district = savedDistrict;
            const savedSector = await this.sectorRepository.save(sector);

            this.logger.log(
              `Created sector: ${sectorName} in district ${districtName}`,
            );

            for (const cellData of sectorData.cells) {
              const cellName = cellData.name.toUpperCase();

              // Create and save the cell
              const cell = new Cell();
              cell.name = cellName;
              cell.sector = savedSector;
              const savedCell = await this.cellRepository.save(cell);

              this.logger.log(
                `Created cell: ${cellName} in sector ${sectorName}`,
              );

              // Create the villages for this cell
              for (const villageData of cellData.villages) {
                const villageName = villageData.name.toUpperCase();

                // Create and save the village
                const village = new Village();
                village.name = villageName;
                village.cell = savedCell;
                await this.villageRepository.save(village);
              }

              this.logger.log(
                `Seeded cell ${cellName} with ${cellData.villages.length} villages in sector ${sectorName}`,
              );
            }
          }
        }
      }

      // Get the final counts
      const finalProvinceCount = await this.provinceRepository.count();
      const finalDistrictCount = await this.districtRepository.count();
      const finalSectorCount = await this.sectorRepository.count();
      const finalCellCount = await this.cellRepository.count();
      const finalVillageCount = await this.villageRepository.count();

      this.logger.log(
        `Location seeding completed successfully. Final state: ${finalProvinceCount} provinces, ${finalDistrictCount} districts, ${finalSectorCount} sectors, ${finalCellCount} cells, and ${finalVillageCount} villages`,
      );
    } catch (error) {
      this.logger.error(`Error seeding locations: ${error.message}`);
      if (error.code === "ENOENT") {
        this.logger.error(
          "locations.json file not found. Make sure it exists in the root directory.",
        );
      }
    }
  }
}
