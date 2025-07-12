import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// Import entities
import { Province } from '../locations/entities/province.entity';
import { District } from '../locations/entities/district.entity';
import { Sector } from '../locations/entities/sector.entity';
import { Cell } from '../locations/entities/cell.entity';
import { Village } from '../locations/entities/village.entity';
import { Isibo } from '../locations/entities/isibo.entity';
import { House } from '../locations/entities/house.entity';
import { User } from '../users/entities/user.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Task } from '../activities/entities/task.entity';
import { Report } from '../activities/entities/report.entity';
import { LocationSeedService } from '../__shared__/seed/location-seed.service';
import { UserRole } from '../__shared__/enums/user-role.enum';
import { ETaskStatus } from '../activities/enum/ETaskStatus';

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const locationSeedService = app.get(LocationSeedService);

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await dataSource.query('DELETE FROM report_attendance');
    await dataSource.query('DELETE FROM reports');
    await dataSource.query('DELETE FROM tasks');
    await dataSource.query('DELETE FROM activities');

    // Clear leader references first to avoid foreign key constraints
    await dataSource.query('UPDATE isibos SET leader_id = NULL WHERE leader_id IS NOT NULL');
    await dataSource.query('UPDATE villages SET leader_id = NULL WHERE leader_id IS NOT NULL');
    await dataSource.query('UPDATE cells SET leader_id = NULL WHERE leader_id IS NOT NULL');

    // Now we can safely delete users (except admins)
    await dataSource.query('DELETE FROM users WHERE role != \'ADMIN\'');
    await dataSource.query('DELETE FROM houses');
    await dataSource.query('DELETE FROM isibos');
    await dataSource.query('DELETE FROM villages');
    await dataSource.query('DELETE FROM cells');
    await dataSource.query('DELETE FROM sectors');
    await dataSource.query('DELETE FROM districts');
    await dataSource.query('DELETE FROM provinces');

    // First, seed the real Rwanda location data
    console.log('🗺️ Seeding Rwanda location data...');
    await locationSeedService.run();

    // Find Gihanga village and get its cell
    console.log('🔍 Finding Gihanga village...');
    const gihangaVillage = await dataSource.getRepository(Village).findOne({
      where: { name: 'GIHANGA' },
      relations: ['cell']
    });

    if (!gihangaVillage) {
      throw new Error('Gihanga village not found in the seeded data');
    }

    console.log(`✓ Found Gihanga village in cell: ${gihangaVillage.cell.name}`);

    // Get all villages in the same cell as Gihanga
    const cellVillages = await dataSource.getRepository(Village).find({
      where: { cell: { id: gihangaVillage.cell.id } },
      relations: ['cell']
    });

    console.log(`✓ Found ${cellVillages.length} villages in cell ${gihangaVillage.cell.name}`);

    // Get repositories
    const provinceRepo = dataSource.getRepository(Province);
    const districtRepo = dataSource.getRepository(District);
    const sectorRepo = dataSource.getRepository(Sector);
    const cellRepo = dataSource.getRepository(Cell);
    const villageRepo = dataSource.getRepository(Village);
    const isiboRepo = dataSource.getRepository(Isibo);
    const houseRepo = dataSource.getRepository(House);
    const userRepo = dataSource.getRepository(User);
    const activityRepo = dataSource.getRepository(Activity);
    const taskRepo = dataSource.getRepository(Task);
    const reportRepo = dataSource.getRepository(Report);

    // Now use the villages from Gihanga's cell for creating isibos
    console.log('🏘️ Using villages from Gihanga\'s cell for isibo creation...');
    const villages = new Map<string, Village>();
    cellVillages.forEach(village => {
      villages.set(village.name, village);
      console.log(`   ✓ Using village: ${village.name}`);
    });

    // 6. Create Isibos (10 per village) with real Rwandan names
    console.log('🏘️ Creating isibos...');
    const isibos = new Map<string, Isibo>();

    // Real Rwandan isibo/cooperative names
  const isiboNames = [
    'UBUMWE', 'UBWIYUNGE', 'ISHEMA', 'INTEGO', 'INTAMBWE', 'IMBERE',
    'UBUDASA', 'AGACIRO', 'INDANGAGACIRO', 'UMURAVA', 'UBUTWARI',
    'UKURI', 'UBUNYAKURI', 'UBUTABERA', 'UBWOROHERANE', 'UKWIGIRA',
    'UBUPFURA', 'ICYEREKEZO', 'URUMURI', 'IMIRIMO', 'GIRANEZA',
    'ISUKU', 'DUFATANYE', 'TWIYUBAKE', 'AMAHORO', 'ITABAZA',
    'AKARIMI', 'IMPUHWE', 'URUKUNDO', 'UBWUZUZANYE', 'IMBARAGA',
    'INTWARI', 'ICYIZERE', 'URUGERO', 'UBURERE', 'INSHINGANO',
    'INKOMEZI', 'UBUREZI', 'GUTANGA', 'IMENA', 'UMUSEKE',
    'UBWIHANGANE', 'UBUSABANE', 'UBURYOHE', 'ITABIRE',
    'INAMA', 'ABIZERWA', 'AMAHIRWE', 'ABANYAKURI', 'ABANYABIGWI',
    'URUGWATI', 'UBUKORIKORI', 'UBUMENYI', 'UMURYANGO', 'IMPANO',
    'UBUPFURA', 'UBUSABANE', 'UBUHANGA', 'INTEGANYA', 'UMUCYO',
    'GIRAMAHORO', 'GIRAMIGISHA', 'ICYEREKEZO', 'INTAMBWE',
    'UBUSABANE', 'URUKUNDO', 'UBUNYAMAHIRWE', 'ICYEREKEZO',
    'IMVANO', 'UBWENGE', 'UBUZIRANENGE', 'UMUTEKANO', 'UBUSABANE',
    'UMURAGE', 'ISHEMA', 'INTEGO', 'UMUVUDUKO', 'UBURENGANZIRA',
    'IMIKORERE', 'UBUTABERA', 'ICYEREKEZO', 'IMYITWARIRE', 'ICYIZERE',
    'IMPINDUKA', 'IMIRIMO', 'ICYEREKEZO', 'UBUMUNTU', 'UBUSABANE',
    'UBUDASA', 'GUTANGA'
  ];

    for (const village of cellVillages) {
      for (let i = 1; i <= 10; i++) {
        const isiboName = isiboNames[(cellVillages.indexOf(village) * 10 + i - 1) % isiboNames.length];
        const uniqueIsiboName = `${isiboName} - ${village.name}`;
        const isibo = isiboRepo.create({
          name: uniqueIsiboName,
          village: village,
        });
        const savedIsibo = await isiboRepo.save(isibo);
        isibos.set(uniqueIsiboName, savedIsibo);
        console.log(`   ✓ Created isibo: ${uniqueIsiboName}`);
      }
    }

    // 7. Create Houses (10 per isibo) with Kigali street addresses
    console.log('🏠 Creating houses...');
    const houses = new Map<string, House>();
    let houseCounter = 1;

    // Generate realistic Kigali street addresses
    const generateKigaliAddress = (houseCode: string): string => {
      const streets = [
        'KN 1 St', 'KN 2 St', 'KN 3 St', 'KN 4 St', 'KN 5 St', 'KN 6 St', 'KN 7 St', 'KN 8 St', 'KN 9 St', 'KN 10 St',
        'KN 11 St', 'KN 12 St', 'KN 13 St', 'KN 14 St', 'KN 15 St', 'KN 16 St', 'KN 17 St', 'KN 18 St', 'KN 19 St', 'KN 20 St',
        'KN 21 St', 'KN 22 St', 'KN 23 St', 'KN 24 St', 'KN 25 St', 'KN 26 St', 'KN 27 St', 'KN 28 St', 'KN 29 St', 'KN 30 St',
        'KN 31 St', 'KN 32 St', 'KN 33 St', 'KN 34 St', 'KN 35 St', 'KN 36 St', 'KN 37 St', 'KN 38 St', 'KN 39 St', 'KN 40 St',
        'KN 41 St', 'KN 42 St', 'KN 43 St', 'KN 44 St', 'KN 45 St', 'KN 46 St', 'KN 47 St', 'KN 48 St', 'KN 49 St', 'KN 50 St',
        'KG 1 Ave', 'KG 2 Ave', 'KG 3 Ave', 'KG 4 Ave', 'KG 5 Ave', 'KG 6 Ave', 'KG 7 Ave', 'KG 8 Ave', 'KG 9 Ave', 'KG 10 Ave',
        'KG 11 Ave', 'KG 12 Ave', 'KG 13 Ave', 'KG 14 Ave', 'KG 15 Ave', 'KG 16 Ave', 'KG 17 Ave', 'KG 18 Ave', 'KG 19 Ave', 'KG 20 Ave'
      ];

      const houseNumbers = Math.floor(Math.random() * 200) + 1; // 1-200
      const streetIndex = Math.floor(Math.random() * streets.length);
      return `${streets[streetIndex]} ${houseNumbers}, ${houseCode}`;
    };

    for (const [isiboName, isibo] of isibos) {
      for (let i = 1; i <= 10; i++) {
        const houseCode = `H${String(houseCounter).padStart(3, '0')}-${String(i).padStart(2, '0')}`;
        const address = generateKigaliAddress(houseCode);

        const house = houseRepo.create({
          code: houseCode,
          address: address,
          isibo: isibo,
        });
        const savedHouse = await houseRepo.save(house);
        houses.set(houseCode, savedHouse);
        console.log(`   ✓ Created house: ${houseCode} at ${address}`);
      }
      houseCounter++;
    }

    // 8. Create Citizens (3 per house)
    console.log('👥 Creating citizens...');
    const users = new Map<string, User>();
    let citizenCounter = 1;

    // Get sample names from seedData
    const firstNames = ['Jean', 'Marie', 'Pierre', 'Agnes', 'Emmanuel', 'Claudine', 'Innocent', 'Esperance', 'Damascene', 'Vestine'];
    const lastNames = ['UWIMANA', 'MUKAMANA', 'NIYONZIMA', 'UWIMANA', 'HABIMANA', 'MUKAMANA', 'NZEYIMANA', 'UWIMANA', 'MUKAMANA', 'NIYONZIMA'];

    for (const [houseCode, house] of houses) {
      for (let i = 1; i <= 3; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const names = `${firstName} ${lastName}`;

        const hashedPassword = await bcrypt.hash('password123', 10);

        const user = userRepo.create({
          names,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${citizenCounter}.${i}@example.com`,
          phone: `+25078${String(citizenCounter * 3 + i).padStart(7, '0')}`,
          password: hashedPassword,
          role: UserRole.CITIZEN,
          village: house.isibo.village,
          isibo: house.isibo,
          house: house,
          cell: gihangaVillage.cell,
        });

        const savedUser = await userRepo.save(user);
        users.set(user.email, savedUser);
        console.log(`   ✓ Created citizen: ${names}`);
      }
      citizenCounter++;
    }

    console.log(`✅ Created ${users.size} citizens`);

    // 9. Create Activities (50 total, distributed across villages)
    console.log('🎯 Creating activities...');
    const activities = new Map<string, Activity>();

    // Activity types
    const activityTypes = [
      'Community Health Campaign', 'Education Support Program', 'Agricultural Training Workshop',
      'Community Infrastructure Repair', 'Women Empowerment Program', 'Youth Sports Tournament',
      'Maternal Health Program', 'Child Nutrition Campaign', 'Elderly Care Initiative',
      'Disability Support Services', 'Mental Health Awareness', 'HIV/AIDS Prevention',
      'Malaria Prevention Campaign', 'Vaccination Drive', 'Family Planning Education',
      'Emergency Preparedness Training', 'Disaster Response Drill', 'First Aid Training',
      'Road Safety Campaign', 'Fire Safety Education', 'Home Security Awareness',
      'Financial Literacy Program', 'Savings Group Formation', 'Credit Union Development',
      'Cooperative Formation', 'Market Access Program', 'Value Chain Development',
      'Livestock Management Training', 'Crop Diversification Program', 'Irrigation System Setup',
      'Soil Conservation Project', 'Seed Distribution Program', 'Fertilizer Education',
      'Pest Control Training', 'Harvest Management', 'Post-Harvest Processing',
      'Community Garden Project', 'School Feeding Program', 'Adult Literacy Classes',
      'Vocational Skills Training', 'Leadership Development', 'Conflict Resolution Training',
      'Peace Building Initiative', 'Cultural Preservation', 'Traditional Crafts Workshop',
      'Music and Arts Program', 'Community Library Setup'
    ];

    // Generate random dates between January and June 2025
    const getRandomDate = (start: Date, end: Date): Date => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-06-30');

    for (let i = 0; i < 50; i++) {
      const activityType = activityTypes[i % activityTypes.length];
      const randomVillage = cellVillages[Math.floor(Math.random() * cellVillages.length)];
      const uniqueTitle = `${activityType} - ${randomVillage.name}`;

      const activity = activityRepo.create({
        title: uniqueTitle,
        description: `Community initiative focused on ${activityType.toLowerCase()} for the benefit of all residents in ${randomVillage.name}`,
        date: getRandomDate(startDate, endDate),
        village: randomVillage,
      });

      const savedActivity = await activityRepo.save(activity);
      activities.set(uniqueTitle, savedActivity);
      console.log(`   ✓ Created activity: ${uniqueTitle}`);
    }

    console.log(`✅ Created ${activities.size} activities`);

    // 10. Create Tasks (1-3 tasks per activity)
    console.log('📋 Creating tasks...');
    const tasks = new Map<string, Task>();
    const usedCombinations = new Set<string>();

    for (const [activityTitle, activity] of activities) {
      // Get isibos from the same village as the activity
      const villageIsibos = Array.from(isibos.values()).filter(isibo =>
        isibo.village.id === activity.village.id
      );

      // Create 1-3 tasks per activity
      const numTasks = Math.min(Math.floor(Math.random() * 3) + 1, villageIsibos.length);
      const shuffledIsibos = [...villageIsibos].sort(() => 0.5 - Math.random());

      let tasksCreated = 0;
      for (let i = 0; i < shuffledIsibos.length && tasksCreated < numTasks; i++) {
        const assignedIsibo = shuffledIsibos[i];
        const combinationKey = `${activityTitle}|${assignedIsibo.name}`;

        // Skip if this combination already exists
        if (usedCombinations.has(combinationKey)) {
          continue;
        }

        usedCombinations.add(combinationKey);

        const estimatedCost = Math.floor(Math.random() * 500000) + 50000; // 50k - 550k RWF
        const expectedParticipants = Math.floor(Math.random() * 50) + 10; // 10-60 participants
        const expectedFinancialImpact = Math.floor(Math.random() * 1000000) + 100000; // 100k - 1.1M RWF

        // 70% chance of having a report (completed), 30% pending
        const hasReport = Math.random() < 0.7;
        const actualCost = hasReport ? Math.floor(estimatedCost * (0.8 + Math.random() * 0.4)) : 0;
        const actualParticipants = hasReport ? Math.floor(expectedParticipants * (0.7 + Math.random() * 0.6)) : 0;
        const actualFinancialImpact = hasReport ? Math.floor(expectedFinancialImpact * (0.6 + Math.random() * 0.8)) : 0;

        const taskTitle = `${activityTitle} - Task ${tasksCreated + 1}`;
        const task = taskRepo.create({
          title: taskTitle,
          description: `Implementation of ${activityTitle.toLowerCase()} in ${assignedIsibo.name}`,
          status: hasReport ? ETaskStatus.COMPLETED : ETaskStatus.PENDING,
          estimatedCost,
          actualCost,
          expectedParticipants,
          actualParticipants,
          expectedFinancialImpact,
          actualFinancialImpact,
          activity: activity,
          isibo: assignedIsibo,
        });

        const savedTask = await taskRepo.save(task);
        tasks.set(taskTitle, savedTask);
        console.log(`   ✓ Created task: ${taskTitle}`);
        tasksCreated++;
      }
    }

    console.log(`✅ Created ${tasks.size} tasks`);

    // 11. Create Reports (for completed tasks only) with realistic Rwandan content
    console.log('📊 Creating reports...');
    let reportCount = 0;

    // Realistic Rwandan report content
    const getRealisticReportContent = (activityTitle: string) => {
      const comments = [
        'Igikorwa cyagenze neza, abaturage benshi bitabiriye kandi bagaragaje ubushake bwo gufasha.',
        'Ikiganiro cyagenze neza, ariko hari ibibazo bimwe na bimwe byagaragaye mu gihe cy\'igikorwa.',
        'Abaturage bagaragaje ubwoba bwo kwiga no gufasha mu bikorwa by\'iterambere ry\'umudugudu.',
        'Igikorwa cyarangiye neza, ariko dukeneye ubufasha bw\'ibikoresho no gufata amafoto.',
        'Ikiganiro cyagenze neza, abaturage benshi bagaragaje ko bashaka gukomeza gufasha.',
        'Igikorwa cyagenze neza cyane, abaturage bose bagaragaje ubushake bwo gufasha.',
        'Ikiganiro cyagenze neza, ariko hari ibibazo bimwe na bimwe byagaragaye.',
        'Abaturage bagaragaje ubwoba bwo kwiga no gufasha mu bikorwa by\'iterambere.',
        'Igikorwa cyarangiye neza, ariko dukeneye ubufasha bw\'ibikoresho.',
        'Ikiganiro cyagenze neza, abaturage benshi bagaragaje ubushake bwo gukomeza.'
      ];

      const materials = [
        ['Ibikoresho by\'ubuzima', 'Amazi meza', 'Ibiti by\'ubwiyunge', 'Imiti y\'ibanze'],
        ['Imbuto z\'ibirayi', 'Ifumbire', 'Udushinge', 'Amazi yo kuhira'],
        ['Ibitabo by\'uburezi', 'Ibikoresho byo kwandika', 'Ameza n\'intebe', 'Imbuga za radiyo'],
        ['Ibikoresho byo kubaka', 'Amabuye', 'Icyuzi', 'Ibiti by\'ubwubatsi'],
        ['Imyenda y\'abagore', 'Ibikoresho byo gufuka', 'Amashini yo gufuka', 'Ibikoresho by\'ubucuruzi'],
        ['Ibikoresho by\'imikino', 'Umupira', 'Ibikoresho by\'ubuzima', 'Amazi meza'],
        ['Imiti y\'abagore batwite', 'Ibikoresho by\'ubuzima', 'Amazi meza', 'Ibiryo by\'abana'],
        ['Ibiryo by\'abana', 'Amata', 'Ibirayi', 'Amaru'],
        ['Ibikoresho by\'abasaza', 'Imiti y\'abasaza', 'Intebe z\'abasaza', 'Ibikoresho by\'ubuzima']
      ];

      const challenges = [
        'Ikirere kibi cyatumye abaturage benshi badashobora kwitabira igikorwa.',
        'Kubura ibikoresho bihagije byatumye igikorwa kidashobora kugenda neza.',
        'Inzira mbi zatumye abaturage bamwe badashobora kugera ku gikorwa.',
        'Kubura amafaranga ahagije kwatumye igikorwa kidashobora kugenda neza.',
        'Kutamenya gahunda y\'igikorwa neza kwatumye abaturage benshi batitabira.',
        'Kubura ubufasha bw\'ubuyobozi bw\'akarere kwatumye igikorwa kidashobora kugenda neza.',
        'Kutamenya ururimi rw\'icyongereza kwatumye abaturage bamwe batamenya neza.',
        'Kubura ibikoresho by\'ubuzima kwatumye igikorwa kidashobora kugenda neza.',
        'Kutamenya gahunda y\'igikorwa neza kwatumye abaturage benshi batitabira.',
        'Kubura amafaranga ahagije kwatumye igikorwa kidashobora kugenda neza.'
      ];

      const suggestions = [
        'Gukora inama n\'abaturage mbere y\'igikorwa kugira ngo babone ubwoba bwo gufasha.',
        'Gushaka ubufasha bw\'ibikoresho no gufata amafoto z\'igikorwa.',
        'Gukora gahunda nziza y\'igikorwa no gutangaza abaturage mbere.',
        'Gushaka ubufasha bw\'amafaranga kugira ngo igikorwa gishobore kugenda neza.',
        'Gukora amahugurwa y\'abaturage kugira ngo bamenye neza icyo bagomba gukora.',
        'Gushaka ubufasha bw\'ubuyobozi bw\'akarere kugira ngo igikorwa gishobore kugenda neza.',
        'Gukora amahugurwa y\'ururimi kugira ngo abaturage bamenye neza.',
        'Gushaka ubufasha bw\'ibikoresho by\'ubuzima kugira ngo igikorwa gishobore kugenda neza.',
        'Gukora gahunda nziza y\'igikorwa no gutangaza abaturage mbere y\'igikorwa.',
        'Gushaka ubufasha bw\'amafaranga no gukora gahunda nziza y\'igikorwa.'
      ];

      const commentIndex = Math.floor(Math.random() * comments.length);
      const materialIndex = Math.floor(Math.random() * materials.length);
      const challengeIndex = Math.floor(Math.random() * challenges.length);
      const suggestionIndex = Math.floor(Math.random() * suggestions.length);

      return {
        comment: comments[commentIndex],
        materials: materials[materialIndex],
        challenge: challenges[challengeIndex],
        suggestion: suggestions[suggestionIndex]
      };
    };

    for (const [taskTitle, task] of tasks) {
      // Only create reports for completed tasks
      if (task.status !== ETaskStatus.COMPLETED) {
        continue;
      }

      // Get users from the same isibo as the task for attendance
      const isiboUsers = Array.from(users.values()).filter(user =>
        user.isibo.id === task.isibo.id
      );

      // Select random attendance (50-80% of isibo users)
      const attendanceCount = Math.floor(isiboUsers.length * (0.5 + Math.random() * 0.3));
      const shuffledUsers = [...isiboUsers].sort(() => 0.5 - Math.random());
      const attendanceUsers = shuffledUsers.slice(0, attendanceCount);

      // Get realistic content
      const reportContent = getRealisticReportContent(task.activity.title);

      const report = reportRepo.create({
        activity: { id: task.activity.id } as Activity,
        task: { id: task.id } as Task,
        comment: reportContent.comment,
        materialsUsed: reportContent.materials,
        challengesFaced: reportContent.challenge,
        suggestions: reportContent.suggestion,
        evidenceUrls: [`https://storage.communiserver.rw/evidence/${reportCount + 1}.jpg`],
      });

      const savedReport = await reportRepo.save(report);

      // Set attendance separately
      savedReport.attendance = attendanceUsers;
      await reportRepo.save(savedReport);

      reportCount++;
      console.log(`   ✓ Created report for: ${taskTitle}`);
    }

    console.log(`✅ Created ${reportCount} reports`);

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Real Rwanda location data seeded`);
    console.log(`   • ${cellVillages.length} villages from ${gihangaVillage.cell.name} cell`);
    console.log(`   • ${isibos.size} isibos (10 per village)`);
    console.log(`   • ${houses.size} houses (10 per isibo)`);
    console.log(`   • ${users.size} citizens (3 per house)`);
    console.log(`   • ${activities.size} activities`);
    console.log(`   • ${tasks.size} tasks`);
    console.log(`   • ${reportCount} reports`);
    console.log('\n✨ All data has been seeded using real Rwanda locations with Gihanga village\'s cell!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run the seeding
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🌱 Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
