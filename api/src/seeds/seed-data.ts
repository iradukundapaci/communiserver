import { UserRole } from '../__shared__/enums/user-role.enum';
import { ETaskStatus } from '../activities/enum/ETaskStatus';

// Generate random dates between January and June 2025
const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const startDate = new Date('2025-01-01');
const endDate = new Date('2025-06-30');

// Sample data for seeding
export const seedData = {
  // Administrative divisions (we'll need at least one of each)
  provinces: [
    { name: 'KIGALI CITY' },
  ],
  
  districts: [
    { name: 'GASABO', provinceName: 'KIGALI CITY' },
  ],
  
  sectors: [
    { name: 'KIMISAGARA', districtName: 'GASABO' },
  ],
  
  cells: [
    { name: 'UBUMWE', sectorName: 'KIMISAGARA' },
  ],

  // 10 Villages
  villages: [
    { name: 'UBWIYUNGE', cellName: 'UBUMWE' },
    { name: 'UBWOBA', cellName: 'UBUMWE' },
    { name: 'UBWENGE', cellName: 'UBUMWE' },
    { name: 'UBWIZA', cellName: 'UBUMWE' },
    { name: 'UBWAMI', cellName: 'UBUMWE' },
    { name: 'UBWATO', cellName: 'UBUMWE' },
    { name: 'UBWOBA BWIZA', cellName: 'UBUMWE' },
    { name: 'UBWENGE BWIZA', cellName: 'UBUMWE' },
    { name: 'UBWIYUNGE BWIZA', cellName: 'UBUMWE' },
    { name: 'UBWAMI BWIZA', cellName: 'UBUMWE' },
  ],

  // 10 Isibos per village (100 total)
  isibos: [] as Array<{ name: string; villageName: string }>,

  // 10 Houses per isibo (1000 total)
  houses: [] as Array<{ code: string; address: string; isiboName: string }>,

  // 3 Citizens per house (3000 total)
  citizens: [] as Array<{
    names: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    villageName: string;
    isiboName: string;
    houseCode: string;
  }>,

  // 50 Activities
  activities: [
    {
      title: 'Community Health Campaign',
      description: 'Organizing health awareness sessions and medical checkups for community members',
      date: getRandomDate(startDate, endDate),
      villageName: 'UBWIYUNGE'
    },
    {
      title: 'Clean Water Initiative',
      description: 'Installing water purification systems and educating on water safety',
      date: getRandomDate(startDate, endDate),
      villageName: 'UBWOBA'
    },
    {
      title: 'Education Support Program',
      description: 'Providing school supplies and tutoring for children in need',
      date: getRandomDate(startDate, endDate),
      villageName: 'UBWENGE'
    },
    {
      title: 'Agricultural Training Workshop',
      description: 'Teaching modern farming techniques and sustainable agriculture',
      date: getRandomDate(startDate, endDate),
      villageName: 'UBWIZA'
    },
    {
      title: 'Women Empowerment Program',
      description: 'Skills training and microfinance for women entrepreneurs',
      date: getRandomDate(startDate, endDate),
      villageName: 'UBWAMI'
    },
    {
      title: 'Youth Sports Tournament',
      description: 'Organizing sports activities to engage youth and promote healthy living',
      date: getRandomDate(startDate, endDate),
      villageName: 'UBWATO'
    },
    {
      title: 'Environmental Conservation',
      description: 'Tree planting and environmental awareness campaigns',
      date: getRandomDate(startDate, endDate),
      villageName: 'UBWOBA BWIZA'
    },
    {
      title: 'Digital Literacy Training',
      description: 'Computer and internet skills training for community members',
      date: getRandomDate(startDate, endDate),
      villageName: 'UBWENGE BWIZA'
    },
    {
      title: 'Small Business Development',
      description: 'Training and support for small business owners and entrepreneurs',
      date: getRandomDate(startDate, endDate),
      villageName: 'UBWIYUNGE BWIZA'
    },
    {
      title: 'Community Infrastructure Repair',
      description: 'Repairing roads, bridges, and community facilities',
      date: getRandomDate(startDate, endDate),
      villageName: 'UBWAMI BWIZA'
    },
  ],

  // Tasks will be generated for each activity and assigned to isibos
  tasks: [] as Array<{
    title: string;
    description: string;
    status: ETaskStatus;
    estimatedCost: number;
    actualCost: number;
    expectedParticipants: number;
    actualParticipants: number;
    expectedFinancialImpact: number;
    actualFinancialImpact: number;
    activityTitle: string;
    isiboName: string;
  }>,

  // Reports for completed tasks
  reports: [] as Array<{
    taskTitle: string;
    activityTitle: string;
    comment: string;
    materialsUsed: string[];
    challengesFaced: string;
    suggestions: string;
    evidenceUrls: string[];
    attendanceEmails: string[];
  }>,
};

// Generate Isibos (10 per village)
seedData.villages.forEach((village, villageIndex) => {
  for (let i = 1; i <= 10; i++) {
    seedData.isibos.push({
      name: `${village.name} ISIBO ${i}`,
      villageName: village.name,
    });
  }
});

// Generate Houses (10 per isibo)
seedData.isibos.forEach((isibo, isiboIndex) => {
  for (let i = 1; i <= 10; i++) {
    seedData.houses.push({
      code: `H${String(isiboIndex + 1).padStart(3, '0')}-${String(i).padStart(2, '0')}`,
      address: `House ${i}, ${isibo.name}, ${isibo.villageName}`,
      isiboName: isibo.name,
    });
  }
});

// Generate Citizens (3 per house)
const firstNames = ['Jean', 'Marie', 'Pierre', 'Agnes', 'Emmanuel', 'Claudine', 'David', 'Esperance', 'Joseph', 'Immaculee'];
const lastNames = ['UWIMANA', 'MUKAMANA', 'NIYONZIMA', 'UWAMAHORO', 'BIZIMANA', 'MUKAMANA', 'NZEYIMANA', 'UWIMANA', 'HABIMANA', 'MUKAMANA'];

seedData.houses.forEach((house, houseIndex) => {
  for (let i = 1; i <= 3; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const names = `${firstName} ${lastName}`;
    
    seedData.citizens.push({
      names,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${houseIndex + 1}.${i}@example.com`,
      phone: `+25078${String(houseIndex * 3 + i).padStart(7, '0')}`,
      password: 'password123',
      role: UserRole.CITIZEN,
      villageName: house.isiboName.split(' ISIBO')[0],
      isiboName: house.isiboName,
      houseCode: house.code,
    });
  }
});

// Generate more activities to reach 50 total
const additionalActivities = [
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

// Add more activities to reach 50 total with unique names
for (let i = seedData.activities.length; i < 50; i++) {
  const baseActivityName = additionalActivities[i - seedData.activities.length];
  const randomVillage = seedData.villages[Math.floor(Math.random() * seedData.villages.length)];

  // Make activity names unique by adding village name
  const uniqueActivityName = `${baseActivityName} - ${randomVillage.name}`;

  seedData.activities.push({
    title: uniqueActivityName,
    description: `Community initiative focused on ${baseActivityName.toLowerCase()} for the benefit of all residents in ${randomVillage.name}`,
    date: getRandomDate(startDate, endDate),
    villageName: randomVillage.name,
  });
}

// Generate Tasks for each activity (assign to unique isibos in the same village)
// Track used combinations to avoid duplicates
const usedCombinations = new Set<string>();

seedData.activities.forEach((activity) => {
  // Get isibos from the same village
  const villageIsibos = seedData.isibos.filter(isibo =>
    isibo.villageName === activity.villageName
  );

  // Create 1-3 tasks per activity (limited by unique constraint)
  const numTasks = Math.min(Math.floor(Math.random() * 3) + 1, villageIsibos.length); // 1-3 tasks, but not more than available isibos

  // Shuffle isibos to get random selection without duplicates
  const shuffledIsibos = [...villageIsibos].sort(() => 0.5 - Math.random());

  let tasksCreated = 0;
  for (let i = 0; i < shuffledIsibos.length && tasksCreated < numTasks; i++) {
    const assignedIsibo = shuffledIsibos[i];
    const combinationKey = `${activity.title}|${assignedIsibo.name}`;

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
    const actualCost = hasReport ? Math.floor(estimatedCost * (0.8 + Math.random() * 0.4)) : 0; // 80-120% of estimated
    const actualParticipants = hasReport ? Math.floor(expectedParticipants * (0.7 + Math.random() * 0.6)) : 0; // 70-130% of expected
    const actualFinancialImpact = hasReport ? Math.floor(expectedFinancialImpact * (0.6 + Math.random() * 0.8)) : 0; // 60-140% of expected

    seedData.tasks.push({
      title: `${activity.title} - Task ${tasksCreated + 1}`,
      description: `Implementation of ${activity.title.toLowerCase()} in ${assignedIsibo.name}`,
      status: hasReport ? ETaskStatus.COMPLETED : ETaskStatus.PENDING,
      estimatedCost,
      actualCost,
      expectedParticipants,
      actualParticipants,
      expectedFinancialImpact,
      actualFinancialImpact,
      activityTitle: activity.title,
      isiboName: assignedIsibo.name,
    });

    tasksCreated++;
  }
});

// Generate Reports for completed tasks
seedData.tasks.forEach((task) => {
  if (task.status === ETaskStatus.COMPLETED) {
    // Get citizens from the same isibo for attendance
    const isiboCitizens = seedData.citizens.filter(citizen =>
      citizen.isiboName === task.isiboName
    );

    // Select random attendees (30-80% of actual participants)
    const numAttendees = Math.min(
      Math.floor(task.actualParticipants * (0.3 + Math.random() * 0.5)),
      isiboCitizens.length
    );

    const attendees = isiboCitizens
      .sort(() => 0.5 - Math.random())
      .slice(0, numAttendees)
      .map(citizen => citizen.email);

    const materials = [
      'Construction materials', 'Educational supplies', 'Medical equipment',
      'Agricultural tools', 'Seeds and fertilizers', 'Water purification tablets',
      'First aid kits', 'Sports equipment', 'Computer equipment', 'Books and stationery'
    ];

    const challenges = [
      'Weather conditions affected the timeline',
      'Limited community participation initially',
      'Transportation challenges for materials',
      'Need for additional technical expertise',
      'Budget constraints required adjustments'
    ];

    const suggestions = [
      'Increase community awareness before implementation',
      'Provide more training for local coordinators',
      'Establish better supply chain management',
      'Create follow-up monitoring system',
      'Develop sustainability plan for long-term impact'
    ];

    seedData.reports.push({
      taskTitle: task.title,
      activityTitle: task.activityTitle,
      comment: `Successfully completed ${task.title.toLowerCase()}. The community showed great enthusiasm and participation throughout the implementation process.`,
      materialsUsed: materials.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2),
      challengesFaced: challenges[Math.floor(Math.random() * challenges.length)],
      suggestions: suggestions[Math.floor(Math.random() * suggestions.length)],
      evidenceUrls: [
        'https://example.com/evidence1.jpg',
        'https://example.com/evidence2.jpg',
        'https://example.com/evidence3.pdf'
      ],
      attendanceEmails: attendees,
    });
  }
});
