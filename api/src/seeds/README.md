# Database Seeding

This directory contains scripts to seed the database with comprehensive test data for the community management system.

## What Gets Seeded

The seeding script creates a complete hierarchical structure with realistic data:

### Administrative Structure
- **1 Province**: KIGALI CITY
- **1 District**: GASABO
- **1 Sector**: KIMISAGARA  
- **1 Cell**: UBUMWE
- **10 Villages**: Various village names

### Community Structure
- **100 Isibos**: 10 isibos per village
- **1,000 Houses**: 10 houses per isibo with unique codes
- **3,000 Citizens**: 3 citizens per house with realistic names and contact info

### Activities & Tasks
- **50 Activities**: Community initiatives spanning January-June 2025
  - Health campaigns, education programs, infrastructure projects
  - Agricultural training, women empowerment, youth programs
  - Environmental conservation, digital literacy, etc.
- **150-250 Tasks**: 2-5 tasks per activity assigned to random isibos
  - Realistic cost estimates and participant expectations
  - 70% completed with reports, 30% pending

### Reports
- **Reports for all completed tasks** including:
  - Detailed comments and descriptions
  - Materials used and challenges faced
  - Suggestions for improvement
  - Evidence URLs (sample links)
  - Attendance tracking with actual citizen participation

## Data Characteristics

### Realistic Relationships
- Citizens are properly assigned to houses, isibos, villages, and cells
- Tasks are assigned to isibos within the same village as the activity
- Reports include actual citizens from the assigned isibo as attendees

### Financial Data
- **Estimated Costs**: 50,000 - 550,000 RWF per task
- **Actual Costs**: 80-120% of estimated (for completed tasks)
- **Expected Participants**: 10-60 per task
- **Actual Participants**: 70-130% of expected (for completed tasks)
- **Financial Impact**: 100,000 - 1,100,000 RWF expected per task

### Dates
- All activities are scheduled between **January 1, 2025** and **June 30, 2025**
- Random distribution across this 6-month period

### Task Status Logic
- **Completed Tasks (70%)**: Have reports with actual data
- **Pending Tasks (30%)**: No reports, actual values are 0

## How to Run

### Prerequisites
1. Ensure the database is running and accessible
2. Make sure all migrations have been run
3. Have at least one ADMIN user in the system (seeding preserves existing admins)

### Running the Seed Script

```bash
# Navigate to the API directory
cd api

# Install dependencies (if not already done)
npm install

# Run the seeding script
npm run seed:data
```

### What Happens During Seeding

1. **Data Cleanup**: Removes existing data (preserves ADMIN users)
2. **Administrative Setup**: Creates provinces, districts, sectors, cells
3. **Location Creation**: Creates villages and isibos
4. **Housing Setup**: Creates houses with unique codes
5. **Citizen Registration**: Creates citizens with hashed passwords
6. **Activity Planning**: Creates 50 diverse community activities
7. **Task Assignment**: Creates and assigns tasks to isibos
8. **Report Generation**: Creates reports for completed tasks with attendance

### Expected Output

```
🌱 Starting database seeding...
🧹 Clearing existing data...
🏛️ Creating provinces...
   ✓ Created province: KIGALI CITY
🏘️ Creating districts...
   ✓ Created district: GASABO
🏞️ Creating sectors...
   ✓ Created sector: KIMISAGARA
🏠 Creating cells...
   ✓ Created cell: UBUMWE
🏘️ Creating villages...
   ✓ Created village: UBWIYUNGE
   ... (10 villages total)
🏘️ Creating isibos...
   ✓ Created isibo: UBWIYUNGE ISIBO 1
   ... (100 isibos total)
🏠 Creating houses...
   ✓ Created house: H001-01
   ... (1000 houses total)
👥 Creating citizens...
   ✓ Created citizen: Jean UWIMANA
   ... (3000 citizens total)
🎯 Creating activities...
   ✓ Created activity: Community Health Campaign
   ... (50 activities total)
📋 Creating tasks...
   ✓ Created task: Community Health Campaign - Task 1
   ... (150-250 tasks total)
📊 Creating reports...
   ✓ Created report for: Community Health Campaign - Task 1
   ... (reports for ~70% of tasks)

🎉 Database seeding completed successfully!
📊 Summary:
   • 1 provinces
   • 1 districts
   • 1 sectors
   • 1 cells
   • 10 villages
   • 100 isibos
   • 1000 houses
   • 3000 citizens
   • 50 activities
   • 200+ tasks
   • 140+ reports

✨ All data has been seeded with realistic relationships and dates between January-June 2025!
```

## Data Structure

### Sample Data Examples

**Village Names**: UBWIYUNGE, UBWOBA, UBWENGE, UBWIZA, UBWAMI, etc.

**Isibo Names**: "UBWIYUNGE ISIBO 1", "UBWIYUNGE ISIBO 2", etc.

**House Codes**: H001-01, H001-02, H002-01, etc.

**Citizen Names**: Jean UWIMANA, Marie MUKAMANA, Pierre NIYONZIMA, etc.

**Activity Types**: 
- Health: Community Health Campaign, Maternal Health Program
- Education: Education Support Program, Adult Literacy Classes  
- Agriculture: Agricultural Training Workshop, Crop Diversification
- Infrastructure: Community Infrastructure Repair, Road Safety
- Social: Women Empowerment Program, Youth Sports Tournament

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Ensure database is running and .env file is configured
2. **Migration Error**: Run `npm run typeorm:run-migration` first
3. **Permission Error**: Ensure database user has CREATE/DROP permissions
4. **Memory Issues**: The script creates 3000+ records, ensure adequate memory

### Cleanup

To remove all seeded data and start fresh:
```bash
npm run seed:data
```
The script automatically cleans existing data before seeding.

## Files

- `seed-data.ts`: Contains all the seed data definitions and generation logic
- `seed.ts`: Main seeding script that creates database records
- `README.md`: This documentation file

## Notes

- All passwords are hashed using bcrypt with salt rounds of 10
- Default password for all citizens: `password123`
- Email format: `firstname.lastname{index}.{member}@example.com`
- Phone format: `+25078{7-digit-number}`
- All names are transformed to uppercase as per entity requirements
- Evidence URLs are placeholder links for demonstration
