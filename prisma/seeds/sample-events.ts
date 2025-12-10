import prisma from '../../lib/prisma';

// Helper function to generate random registrations
function generateRegistrations(
  runId: number,
  categoryId: number,
  count: number,
  startNumber: number
): any[] {
  const firstNames = ['Ján', 'Peter', 'Martin', 'Tomáš', 'Michal', 'Lukáš', 'Andrej', 'Marek', 'Jakub', 'Filip',
    'Mária', 'Eva', 'Anna', 'Zuzana', 'Katarína', 'Lucia', 'Petra', 'Jana', 'Monika', 'Lenka'];
  const lastNames = ['Novák', 'Kováč', 'Horvát', 'Varga', 'Tóth', 'Nagy', 'Molnár', 'Balog', 'Kiss', 'Szabó',
    'Lukáčová', 'Balážová', 'Gašparová', 'Havranová', 'Takáčová', 'Šimková', 'Bodnárová', 'Poláková'];
  const cities = ['Bratislava', 'Košice', 'Prešov', 'Žilina', 'Banská Bystrica', 'Nitra', 'Trnava', 'Martin', 'Trenčín'];
  const clubs = ['Bratislava Running Club', 'City Runners', 'Trail Blazers', 'Marathon Team SK', 'Speed Demons', null, null];

  const registrations = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const yearOfBirth = 1960 + Math.floor(Math.random() * 45); // 1960-2004
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const city = cities[Math.floor(Math.random() * cities.length)];
    const club = clubs[Math.floor(Math.random() * clubs.length)];
    const paid = Math.random() > 0.1; // 90% paid

    registrations.push({
      runId,
      categoryId,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.sk`,
      phone: `+421 90${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      dateOfBirth: new Date(yearOfBirth, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      gender,
      city,
      club,
      registrationNumber: `REG-${startNumber + i}`,
      paid,
      paidAmount: paid ? (15 + Math.floor(Math.random() * 45)) : null,
      paidAt: paid ? new Date(2025, Math.floor(Math.random() * 11), Math.floor(Math.random() * 28) + 1) : null,
      status: paid ? 'confirmed' : 'pending',
    });
  }
  return registrations;
}

// Helper function to generate results for registrations
function generateResults(
  registrations: any[],
  runId: number,
  distance: number
): any[] {
  return registrations.map((reg, index) => {
    // Generate realistic finish times based on distance
    const baseMinutes = distance * (5 + Math.random() * 5); // 5-10 min per km
    const finishTimeSeconds = Math.floor(baseMinutes * 60);
    const pace = finishTimeSeconds / distance / 60; // min/km

    return {
      registrationId: reg.id, // Will need to be set after registration is created
      runId,
      categoryId: reg.categoryId,
      firstName: reg.firstName,
      lastName: reg.lastName,
      yearOfBirth: reg.dateOfBirth.getFullYear(),
      club: reg.club,
      overallPlace: index + 1,
      categoryPlace: index + 1, // Simplified, would need category-specific calculation
      finishTime: finishTimeSeconds,
      gunTime: finishTimeSeconds + Math.floor(Math.random() * 60), // Add random start delay
      resultStatus: 'finished',
      pace,
      splits: null,
    };
  });
}

async function seedSampleEvents() {
  console.log('Starting sample events seed...');

  // Clear existing event-related data
  console.log('Clearing existing event data...');
  await prisma.eventPartner.deleteMany();
  await prisma.eventSchedule.deleteMany();
  await prisma.runEntryFee.deleteMany();
  await prisma.runCategoryAssignment.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.runResult.deleteMany();
  await prisma.run.deleteMany();
  await prisma.eventAttachment.deleteMany();
  await prisma.event.deleteMany();

  // Get first region and district for locations
  const bratislavaRegion = await prisma.region.findFirst({
    where: { code: 'BA' },
  });

  const bratislavaDistrict = await prisma.district.findFirst({
    where: { code: 'BA1' },
  });

  if (!bratislavaRegion || !bratislavaDistrict) {
    console.error(
      'Slovak geography not seeded! Please run slovak-geography seed first.'
    );
    return;
  }

  // Create sample organizers
  console.log('Creating sample organizers...');

  const runningClub = await prisma.organizer.upsert({
    where: { name: 'Bratislava Running Club' },
    update: {},
    create: {
      name: 'Bratislava Running Club',
      description: 'The premier running club in Bratislava, organizing events since 2010.',
      email: 'info@bratislavarunning.sk',
      phone: '+421 900 123 456',
      website: 'https://bratislavarunning.sk',
      isActive: true,
    },
  });

  const marathonOrg = await prisma.organizer.upsert({
    where: { name: 'Slovak Marathon Association' },
    update: {},
    create: {
      name: 'Slovak Marathon Association',
      description: 'Official marathon and road race organization.',
      email: 'contact@marathon.sk',
      phone: '+421 900 789 012',
      website: 'https://marathon.sk',
      isActive: true,
    },
  });

  const trailOrg = await prisma.organizer.upsert({
    where: { name: 'Trail Runners Slovakia' },
    update: {},
    create: {
      name: 'Trail Runners Slovakia',
      description: 'Mountain and trail running events across Slovakia.',
      email: 'info@trailrunners.sk',
      phone: '+421 900 555 666',
      website: 'https://trailrunners.sk',
      isActive: true,
    },
  });

  const cityRunOrg = await prisma.organizer.upsert({
    where: { name: 'City Run Events' },
    update: {},
    create: {
      name: 'City Run Events',
      description: 'Urban running events and night runs.',
      email: 'hello@cityrunevents.sk',
      phone: '+421 900 777 888',
      website: 'https://cityrunevents.sk',
      isActive: true,
    },
  });

  // Create sample locations
  console.log('Creating sample locations...');

  const parkLocation = await prisma.location.create({
    data: {
      name: 'Sad Janka Kráľa',
      street: 'Sad Janka Kráľa',
      city: 'Bratislava',
      postalCode: '81105',
      districtId: bratislavaDistrict.id,
      regionId: bratislavaRegion.id,
      gpsLatitude: 48.1351,
      gpsLongitude: 17.0887,
      locationNote: 'Oldest public park in Central Europe, on the Petržalka side of the Danube',
    },
  });

  const stadiumLocation = await prisma.location.create({
    data: {
      name: 'Tehelné pole Stadium',
      street: 'Bajkalská 1749/7',
      city: 'Bratislava',
      postalCode: '83103',
      districtId: bratislavaDistrict.id,
      regionId: bratislavaRegion.id,
      gpsLatitude: 48.1542,
      gpsLongitude: 17.1248,
      locationNote: 'National football stadium, used for major sporting events',
    },
  });

  const castleLocation = await prisma.location.create({
    data: {
      name: 'Bratislava Castle',
      street: 'Zámocká 2',
      city: 'Bratislava',
      postalCode: '81106',
      districtId: bratislavaDistrict.id,
      regionId: bratislavaRegion.id,
      gpsLatitude: 48.1426,
      gpsLongitude: 17.1003,
      locationNote: 'Historic castle overlooking the Danube',
    },
  });

  const forestLocation = await prisma.location.create({
    data: {
      name: 'Bratislava Forest Park',
      street: 'Kamzík',
      city: 'Bratislava',
      postalCode: '83104',
      districtId: bratislavaDistrict.id,
      regionId: bratislavaRegion.id,
      gpsLatitude: 48.1860,
      gpsLongitude: 17.1027,
      locationNote: 'Beautiful forest trails in the Little Carpathians',
    },
  });

  const riverLocation = await prisma.location.create({
    data: {
      name: 'Danube Embankment',
      street: 'Nábrežie arm. gen. L. Svobodu',
      city: 'Bratislava',
      postalCode: '81102',
      districtId: bratislavaDistrict.id,
      regionId: bratislavaRegion.id,
      gpsLatitude: 48.1447,
      gpsLongitude: 17.1156,
      locationNote: 'Scenic riverside promenade',
    },
  });

  const oldTownLocation = await prisma.location.create({
    data: {
      name: 'Old Town Square',
      street: 'Hlavné námestie',
      city: 'Bratislava',
      postalCode: '81101',
      districtId: bratislavaDistrict.id,
      regionId: bratislavaRegion.id,
      gpsLatitude: 48.1439,
      gpsLongitude: 17.1097,
      locationNote: 'Heart of Bratislava Old Town',
    },
  });

  // Create sample partners
  console.log('Creating sample partners...');

  const sportBrand = await prisma.partner.upsert({
    where: { name: 'SportRun Slovakia' },
    update: {},
    create: {
      name: 'SportRun Slovakia',
      website: 'https://sportrun.sk',
      type: 'sponsor',
    },
  });

  const energyDrink = await prisma.partner.upsert({
    where: { name: 'Energy Plus' },
    update: {},
    create: {
      name: 'Energy Plus',
      website: 'https://energyplus.sk',
      type: 'sponsor',
    },
  });

  // Create sample events
  console.log('Creating sample events...');

  // Event 1: Autumn Trail Run 2024 - PAST event with results
  const autumnTrail = await prisma.event.upsert({
    where: { slug: 'autumn-trail-run-2024' },
    update: {},
    create: {
      title: 'Autumn Trail Run 2024',
      slug: 'autumn-trail-run-2024',
      description: 'Scenic trail run through autumn forests.',
      longDescription:
        'Experience the beauty of autumn in the Little Carpathians with this challenging trail run. Perfect for trail running enthusiasts.',
      startDate: new Date('2024-10-15T09:00:00'),
      endDate: new Date('2024-10-15T14:00:00'),
      locationId: forestLocation.id,
      organizerId: trailOrg.id,
      contactEmail: 'info@trailrunners.sk',
      contactPhone: '+421 900 555 666',
      bankAccount: 'SK31 1200 0000 1111 2222 3333',
      status: 'completed',
      registrationOpenDate: new Date('2024-08-01T00:00:00'),
      registrationCloseDate: new Date('2024-10-10T23:59:59'),
      maxParticipants: 150,
    },
  });

  // Event 2: Winter City Challenge 2024 - PAST event with results
  const winterChallenge = await prisma.event.upsert({
    where: { slug: 'winter-city-challenge-2024' },
    update: {},
    create: {
      title: 'Winter City Challenge 2024',
      slug: 'winter-city-challenge-2024',
      description: 'Urban running challenge in winter conditions.',
      longDescription:
        'Test your endurance in the winter city challenge. Multiple distance options through the streets of Bratislava.',
      startDate: new Date('2024-11-20T08:00:00'),
      endDate: new Date('2024-11-20T13:00:00'),
      locationId: oldTownLocation.id,
      organizerId: cityRunOrg.id,
      contactEmail: 'hello@cityrunevents.sk',
      contactPhone: '+421 900 777 888',
      bankAccount: 'SK31 1200 0000 4444 5555 6666',
      status: 'completed',
      registrationOpenDate: new Date('2024-09-01T00:00:00'),
      registrationCloseDate: new Date('2024-11-15T23:59:59'),
      maxParticipants: 200,
    },
  });

  // Event 3: Night Run Bratislava 2024 - PAST event with results
  const nightRun = await prisma.event.upsert({
    where: { slug: 'night-run-bratislava-2024' },
    update: {},
    create: {
      title: 'Night Run Bratislava 2024',
      slug: 'night-run-bratislava-2024',
      description: 'Experience Bratislava at night with headlamps.',
      longDescription:
        'A unique night running experience through the illuminated streets of Bratislava. Headlamp required.',
      startDate: new Date('2024-09-28T20:00:00'),
      endDate: new Date('2024-09-28T23:00:00'),
      locationId: riverLocation.id,
      organizerId: cityRunOrg.id,
      contactEmail: 'hello@cityrunevents.sk',
      contactPhone: '+421 900 777 888',
      bankAccount: 'SK31 1200 0000 7777 8888 9999',
      status: 'completed',
      registrationOpenDate: new Date('2024-07-01T00:00:00'),
      registrationCloseDate: new Date('2024-09-25T23:59:59'),
      maxParticipants: 120,
    },
  });

  // Event 4: Spring Half Marathon 2026 - FUTURE event with open registration
  const springHalf = await prisma.event.upsert({
    where: { slug: 'spring-half-marathon-2026' },
    update: {},
    create: {
      title: 'Spring Half Marathon 2026',
      slug: 'spring-half-marathon-2026',
      description: 'Welcome spring with a beautiful half marathon.',
      longDescription:
        'Start the spring season right with this scenic half marathon through Bratislava. Fast and flat course.',
      startDate: new Date('2026-02-15T09:00:00'),
      endDate: new Date('2026-02-15T13:00:00'),
      locationId: stadiumLocation.id,
      organizerId: marathonOrg.id,
      contactEmail: 'contact@marathon.sk',
      contactPhone: '+421 900 789 012',
      bankAccount: 'SK31 1200 0000 1234 4321 5678',
      status: 'published',
      registrationOpenDate: new Date('2025-12-10T00:00:00'),
      registrationCloseDate: new Date('2026-02-10T23:59:59'),
      maxParticipants: 500,
    },
  });

  // Event 5: Summer 10K Series 2026 - FUTURE event with open registration
  const summer10K = await prisma.event.upsert({
    where: { slug: 'summer-10k-series-2026' },
    update: {},
    create: {
      title: 'Summer 10K Series 2026',
      slug: 'summer-10k-series-2026',
      description: 'Summer evening 10K race series.',
      longDescription:
        'Join our popular summer 10K series. Perfect for all levels, great atmosphere and post-race refreshments.',
      startDate: new Date('2026-01-25T18:00:00'),
      endDate: new Date('2026-01-25T21:00:00'),
      locationId: parkLocation.id,
      organizerId: runningClub.id,
      contactEmail: 'info@bratislavarunning.sk',
      contactPhone: '+421 900 123 456',
      bankAccount: 'SK31 1200 0000 9876 5432 1098',
      status: 'published',
      registrationOpenDate: new Date('2025-12-10T00:00:00'),
      registrationCloseDate: new Date('2026-01-20T23:59:59'),
      maxParticipants: 300,
    },
  });

  // Event 6: Bratislava Spring Marathon 2025
  const springMarathon = await prisma.event.upsert({
    where: { slug: 'bratislava-spring-marathon-2025' },
    update: {},
    create: {
      title: 'Bratislava Spring Marathon 2025',
      slug: 'bratislava-spring-marathon-2025',
      description: 'The biggest spring running event in Bratislava.',
      longDescription:
        'Join us for the 15th annual Bratislava Spring Marathon! This event features a full marathon, half marathon, and 10K race through the beautiful streets of Bratislava. The course is fast and scenic, perfect for personal records.',
      startDate: new Date('2025-04-12T08:00:00'),
      endDate: new Date('2025-04-12T14:00:00'),
      locationId: stadiumLocation.id,
      organizerId: marathonOrg.id,
      contactEmail: 'info@bsk-marathon.sk',
      contactPhone: '+421 900 111 222',
      bankAccount: 'SK31 1200 0000 1987 4263 7541',
      paymentNote: 'Please include your registration number in the payment reference.',
      status: 'published',
      registrationOpenDate: new Date('2025-01-01T00:00:00'),
      registrationCloseDate: new Date('2025-04-05T23:59:59'),
      maxParticipants: 5000,
      rules: '- Minimum age for marathon: 18 years\n- Medical certificate required for marathon\n- Time limit: 6 hours for marathon',
    },
  });

  // Event 7: City Park Run 2025
  const parkRun = await prisma.event.upsert({
    where: { slug: 'city-park-run-2025' },
    update: {},
    create: {
      title: 'City Park Run 2025',
      slug: 'city-park-run-2025',
      description: 'Family-friendly running event in the heart of Bratislava.',
      longDescription:
        'A beautiful run through Sad Janka Kráľa park. Perfect for families and beginners. Flat course with great atmosphere.',
      startDate: new Date('2025-05-10T09:00:00'),
      endDate: new Date('2025-05-10T12:00:00'),
      locationId: parkLocation.id,
      organizerId: runningClub.id,
      contactEmail: 'parkrun@bratislavarunning.sk',
      contactPhone: '+421 900 333 444',
      bankAccount: 'SK31 1200 0000 1234 5678 9012',
      paymentNote: 'Payment reference: registration number',
      status: 'published',
      registrationOpenDate: new Date('2025-03-01T00:00:00'),
      registrationCloseDate: new Date('2025-05-03T23:59:59'),
      maxParticipants: 1000,
    },
  });

  // Event 8: Castle Hill Climb 2025
  const castleClimb = await prisma.event.upsert({
    where: { slug: 'castle-hill-climb-2025' },
    update: {},
    create: {
      title: 'Castle Hill Climb 2025',
      slug: 'castle-hill-climb-2025',
      description: 'Challenging uphill race to Bratislava Castle.',
      longDescription:
        'Test your climbing legs with this unique uphill challenge. Short but intense race to the top of Bratislava Castle.',
      startDate: new Date('2025-06-14T10:00:00'),
      endDate: new Date('2025-06-14T13:00:00'),
      locationId: castleLocation.id,
      organizerId: runningClub.id,
      contactEmail: 'info@bratislavarunning.sk',
      contactPhone: '+421 900 123 456',
      bankAccount: 'SK31 1200 0000 1357 2468 9753',
      status: 'published',
      registrationOpenDate: new Date('2025-04-01T00:00:00'),
      registrationCloseDate: new Date('2025-06-10T23:59:59'),
      maxParticipants: 200,
    },
  });

  // Event 9: Riverside Run 2025
  const riversideRun = await prisma.event.upsert({
    where: { slug: 'riverside-run-2025' },
    update: {},
    create: {
      title: 'Riverside Run 2025',
      slug: 'riverside-run-2025',
      description: 'Scenic run along the Danube embankment.',
      longDescription:
        'Enjoy a beautiful run along the Danube River. Flat and fast course with stunning river views.',
      startDate: new Date('2025-07-20T08:00:00'),
      endDate: new Date('2025-07-20T11:00:00'),
      locationId: riverLocation.id,
      organizerId: runningClub.id,
      contactEmail: 'info@bratislavarunning.sk',
      contactPhone: '+421 900 123 456',
      bankAccount: 'SK31 1200 0000 2468 1357 7531',
      status: 'published',
      registrationOpenDate: new Date('2025-05-01T00:00:00'),
      registrationCloseDate: new Date('2025-07-15T23:59:59'),
      maxParticipants: 400,
    },
  });

  // Event 10: Old Town Circuit 2025
  const oldTownCircuit = await prisma.event.upsert({
    where: { slug: 'old-town-circuit-2025' },
    update: {},
    create: {
      title: 'Old Town Circuit 2025',
      slug: 'old-town-circuit-2025',
      description: 'Fast criterium-style race through historic Old Town.',
      longDescription:
        'Multiple laps through the charming streets of Bratislava Old Town. Spectator-friendly course with great atmosphere.',
      startDate: new Date('2025-08-30T17:00:00'),
      endDate: new Date('2025-08-30T20:00:00'),
      locationId: oldTownLocation.id,
      organizerId: cityRunOrg.id,
      contactEmail: 'hello@cityrunevents.sk',
      contactPhone: '+421 900 777 888',
      bankAccount: 'SK31 1200 0000 3579 2468 1357',
      status: 'published',
      registrationOpenDate: new Date('2025-06-01T00:00:00'),
      registrationCloseDate: new Date('2025-08-25T23:59:59'),
      maxParticipants: 250,
    },
  });

  // Create event partners
  await prisma.eventPartner.create({
    data: {
      eventId: springMarathon.id,
      partnerId: sportBrand.id,
      level: 'gold',
      sortOrder: 1,
    },
  });

  await prisma.eventPartner.create({
    data: {
      eventId: springMarathon.id,
      partnerId: energyDrink.id,
      level: 'silver',
      sortOrder: 2,
    },
  });

  // Create runs for all events
  console.log('Creating runs and categories...');

  // Runs for Event 1: Autumn Trail Run 2024 - WITH RESULTS (80 registrations)
  const autumnTrailRun = await prisma.run.create({
    data: {
      eventId: autumnTrail.id,
      name: '15K Trail',
      distance: 15.0,
      elevationGain: 450,
      surface: 'trail',
      startTime: new Date('2024-10-15T09:00:00'),
      maxParticipants: 150,
      sortOrder: 1,
    },
  });

  // Runs for Event 2: Winter City Challenge 2024 - WITH RESULTS (95 registrations)
  const winterChallenge10k = await prisma.run.create({
    data: {
      eventId: winterChallenge.id,
      name: '10K Challenge',
      distance: 10.0,
      elevationGain: 50,
      surface: 'asphalt',
      startTime: new Date('2024-11-20T08:00:00'),
      maxParticipants: 200,
      sortOrder: 1,
    },
  });

  // Runs for Event 3: Night Run Bratislava 2024 - WITH RESULTS (72 registrations)
  const nightRun8k = await prisma.run.create({
    data: {
      eventId: nightRun.id,
      name: '8K Night Run',
      distance: 8.0,
      elevationGain: 30,
      surface: 'asphalt',
      startTime: new Date('2024-09-28T20:00:00'),
      maxParticipants: 120,
      sortOrder: 1,
    },
  });

  // Runs for Event 4: Spring Half Marathon 2026 - OPEN REGISTRATION (25 registrations, no results)
  const springHalfRun = await prisma.run.create({
    data: {
      eventId: springHalf.id,
      name: 'Half Marathon',
      distance: 21.0975,
      elevationGain: 80,
      surface: 'asphalt',
      startTime: new Date('2026-02-15T09:00:00'),
      maxParticipants: 500,
      sortOrder: 1,
    },
  });

  // Runs for Event 5: Summer 10K Series 2026 - OPEN REGISTRATION (28 registrations, no results)
  const summer10KRun = await prisma.run.create({
    data: {
      eventId: summer10K.id,
      name: '10K Race',
      distance: 10.0,
      elevationGain: 20,
      surface: 'asphalt',
      startTime: new Date('2026-01-25T18:00:00'),
      maxParticipants: 300,
      sortOrder: 1,
    },
  });

  // Runs for Event 6: Spring Marathon 2025
  const fullMarathon = await prisma.run.create({
    data: {
      eventId: springMarathon.id,
      name: 'Full Marathon',
      distance: 42.195,
      elevationGain: 120,
      surface: 'asphalt',
      startTime: new Date('2025-04-12T08:00:00'),
      maxParticipants: 2000,
      sortOrder: 1,
    },
  });

  const halfMarathon = await prisma.run.create({
    data: {
      eventId: springMarathon.id,
      name: 'Half Marathon',
      distance: 21.0975,
      elevationGain: 60,
      surface: 'asphalt',
      startTime: new Date('2025-04-12T09:00:00'),
      maxParticipants: 2000,
      sortOrder: 2,
    },
  });

  const run10k = await prisma.run.create({
    data: {
      eventId: springMarathon.id,
      name: '10K Race',
      distance: 10.0,
      elevationGain: 30,
      surface: 'asphalt',
      startTime: new Date('2025-04-12T10:00:00'),
      maxParticipants: 1000,
      sortOrder: 3,
    },
  });

  // Runs for Event 7: Park Run 2025
  const parkRun5k = await prisma.run.create({
    data: {
      eventId: parkRun.id,
      name: '5K Fun Run',
      distance: 5.0,
      elevationGain: 10,
      surface: 'asphalt',
      startTime: new Date('2025-05-10T09:00:00'),
      maxParticipants: 800,
      sortOrder: 1,
    },
  });

  const parkRun10k = await prisma.run.create({
    data: {
      eventId: parkRun.id,
      name: '10K Race',
      distance: 10.0,
      elevationGain: 20,
      surface: 'asphalt',
      startTime: new Date('2025-05-10T10:00:00'),
      maxParticipants: 200,
      sortOrder: 2,
    },
  });

  // Runs for Event 8: Castle Hill Climb 2025
  const castleClimb3k = await prisma.run.create({
    data: {
      eventId: castleClimb.id,
      name: '3K Uphill',
      distance: 3.0,
      elevationGain: 200,
      surface: 'asphalt',
      startTime: new Date('2025-06-14T10:00:00'),
      maxParticipants: 200,
      sortOrder: 1,
    },
  });

  // Runs for Event 9: Riverside Run 2025
  const riversideRun10k = await prisma.run.create({
    data: {
      eventId: riversideRun.id,
      name: '10K Riverside',
      distance: 10.0,
      elevationGain: 10,
      surface: 'asphalt',
      startTime: new Date('2025-07-20T08:00:00'),
      maxParticipants: 400,
      sortOrder: 1,
    },
  });

  // Runs for Event 10: Old Town Circuit 2025
  const oldTownCircuit5k = await prisma.run.create({
    data: {
      eventId: oldTownCircuit.id,
      name: '5K Circuit',
      distance: 5.0,
      elevationGain: 20,
      surface: 'cobblestone',
      startTime: new Date('2025-08-30T17:00:00'),
      maxParticipants: 250,
      sortOrder: 1,
    },
  });

  // Create global categories (many-to-many with runs)
  const categoryDefinitions = [
    { name: 'Men Open', code: 'MO', gender: 'male', minAge: 18, maxAge: null, sortOrder: 1 },
    { name: 'Women Open', code: 'WO', gender: 'female', minAge: 18, maxAge: null, sortOrder: 2 },
    { name: 'Men 40-49', code: 'M40', gender: 'male', minAge: 40, maxAge: 49, sortOrder: 3 },
    { name: 'Women 40-49', code: 'W40', gender: 'female', minAge: 40, maxAge: 49, sortOrder: 4 },
    { name: 'Men 50+', code: 'M50', gender: 'male', minAge: 50, maxAge: null, sortOrder: 5 },
    { name: 'Women 50+', code: 'W50', gender: 'female', minAge: 50, maxAge: null, sortOrder: 6 },
    { name: 'Juniors 16-18', code: 'J16', gender: 'mixed', minAge: 16, maxAge: 18, sortOrder: 7 },
  ];

  // Create or get all categories (global, reusable across events)
  const createdCategories: Record<string, any> = {};
  for (const cat of categoryDefinitions) {
    const category = await prisma.runCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: {
        name: cat.name,
        code: cat.code,
        gender: cat.gender,
        minAge: cat.minAge,
        maxAge: cat.maxAge,
        sortOrder: cat.sortOrder,
      },
    });
    createdCategories[cat.code] = category;
  }

  // Assign standard categories (excluding juniors) to marathon runs
  const standardCategoryCodes = ['MO', 'WO', 'M40', 'W40', 'M50', 'W50'];
  for (const run of [fullMarathon, halfMarathon, run10k]) {
    for (const code of standardCategoryCodes) {
      await prisma.runCategoryAssignment.create({
        data: {
          runId: run.id,
          categoryId: createdCategories[code].id,
        },
      });
    }
  }

  // Assign all categories (including juniors) to park runs
  for (const run of [parkRun5k, parkRun10k]) {
    for (const code of Object.keys(createdCategories)) {
      await prisma.runCategoryAssignment.create({
        data: {
          runId: run.id,
          categoryId: createdCategories[code].id,
        },
      });
    }
  }

  // Create entry fees
  console.log('Creating entry fees...');

  const marathonFees = [
    {
      runId: fullMarathon.id,
      name: 'Early Bird',
      amount: 40.0,
      validFrom: new Date('2025-01-01'),
      validTo: new Date('2025-02-28'),
      sortOrder: 1,
    },
    {
      runId: fullMarathon.id,
      name: 'Regular',
      amount: 50.0,
      validFrom: new Date('2025-03-01'),
      validTo: new Date('2025-03-31'),
      sortOrder: 2,
    },
    {
      runId: fullMarathon.id,
      name: 'Late',
      amount: 60.0,
      validFrom: new Date('2025-04-01'),
      validTo: new Date('2025-04-05'),
      sortOrder: 3,
    },
  ];

  const halfFees = [
    {
      runId: halfMarathon.id,
      name: 'Early Bird',
      amount: 25.0,
      validFrom: new Date('2025-01-01'),
      validTo: new Date('2025-02-28'),
      sortOrder: 1,
    },
    {
      runId: halfMarathon.id,
      name: 'Regular',
      amount: 30.0,
      validFrom: new Date('2025-03-01'),
      validTo: new Date('2025-04-05'),
      sortOrder: 2,
    },
  ];

  const run10kFees = [
    {
      runId: run10k.id,
      name: 'Standard',
      amount: 15.0,
      validFrom: new Date('2025-01-01'),
      validTo: new Date('2025-04-05'),
      sortOrder: 1,
    },
  ];

  const parkRunFees = [
    {
      runId: parkRun5k.id,
      name: 'Standard',
      amount: 10.0,
      validFrom: new Date('2025-03-01'),
      validTo: new Date('2025-05-03'),
      sortOrder: 1,
    },
    {
      runId: parkRun10k.id,
      name: 'Standard',
      amount: 15.0,
      validFrom: new Date('2025-03-01'),
      validTo: new Date('2025-05-03'),
      sortOrder: 1,
    },
  ];

  for (const fee of [...marathonFees, ...halfFees, ...run10kFees, ...parkRunFees]) {
    await prisma.runEntryFee.create({ data: fee });
  }

  // Create event schedule
  console.log('Creating event schedules...');

  const marathonSchedule = [
    {
      eventId: springMarathon.id,
      title: 'Registration Opens',
      description: 'Pick up your race bib and timing chip',
      startTime: new Date('2025-04-11T14:00:00'),
      endTime: new Date('2025-04-11T20:00:00'),
      location: 'Tehelné pole Stadium - Main Entrance',
      sortOrder: 1,
    },
    {
      eventId: springMarathon.id,
      title: 'Race Day Registration',
      startTime: new Date('2025-04-12T06:30:00'),
      endTime: new Date('2025-04-12T07:45:00'),
      location: 'Tehelné pole Stadium',
      sortOrder: 2,
    },
    {
      eventId: springMarathon.id,
      title: 'Marathon Start',
      startTime: new Date('2025-04-12T08:00:00'),
      location: 'Tehelné pole Stadium',
      sortOrder: 3,
    },
    {
      eventId: springMarathon.id,
      title: 'Half Marathon Start',
      startTime: new Date('2025-04-12T09:00:00'),
      location: 'Tehelné pole Stadium',
      sortOrder: 4,
    },
    {
      eventId: springMarathon.id,
      title: '10K Race Start',
      startTime: new Date('2025-04-12T10:00:00'),
      location: 'Tehelné pole Stadium',
      sortOrder: 5,
    },
    {
      eventId: springMarathon.id,
      title: 'Awards Ceremony',
      startTime: new Date('2025-04-12T12:30:00'),
      endTime: new Date('2025-04-12T13:30:00'),
      location: 'Main Stage',
      sortOrder: 6,
    },
  ];

  for (const schedule of marathonSchedule) {
    await prisma.eventSchedule.create({ data: schedule });
  }

  // Create bulk registrations and results
  console.log('Creating bulk registrations and results...');

  // Get categories by code
  const menOpenCategory = await prisma.runCategory.findFirst({
    where: { code: 'MO' },
  });

  if (!menOpenCategory) {
    console.error('Categories not found!');
    return;
  }

  let registrationCounter = 1;

  // 1. Autumn Trail Run - 80 registrations WITH RESULTS
  console.log('Creating Autumn Trail Run registrations and results (80)...');
  const autumnTrailRegistrations = generateRegistrations(
    autumnTrailRun.id,
    menOpenCategory.id,
    80,
    registrationCounter
  );
  const createdAutumnRegs = [];
  for (const reg of autumnTrailRegistrations) {
    const created = await prisma.registration.create({ data: reg });
    createdAutumnRegs.push(created);
  }
  registrationCounter += 80;

  // Create results for autumn trail
  const autumnTrailResults = generateResults(createdAutumnRegs, autumnTrailRun.id, 15.0);
  for (const result of autumnTrailResults) {
    await prisma.runResult.create({
      data: {
        ...result,
        registrationId: createdAutumnRegs[autumnTrailResults.indexOf(result)].id,
      },
    });
  }

  // 2. Winter City Challenge - 95 registrations WITH RESULTS
  console.log('Creating Winter City Challenge registrations and results (95)...');
  const winterChallengeRegistrations = generateRegistrations(
    winterChallenge10k.id,
    menOpenCategory.id,
    95,
    registrationCounter
  );
  const createdWinterRegs = [];
  for (const reg of winterChallengeRegistrations) {
    const created = await prisma.registration.create({ data: reg });
    createdWinterRegs.push(created);
  }
  registrationCounter += 95;

  // Create results for winter challenge
  const winterChallengeResults = generateResults(createdWinterRegs, winterChallenge10k.id, 10.0);
  for (const result of winterChallengeResults) {
    await prisma.runResult.create({
      data: {
        ...result,
        registrationId: createdWinterRegs[winterChallengeResults.indexOf(result)].id,
      },
    });
  }

  // 3. Night Run - 72 registrations WITH RESULTS
  console.log('Creating Night Run registrations and results (72)...');
  const nightRunRegistrations = generateRegistrations(
    nightRun8k.id,
    menOpenCategory.id,
    72,
    registrationCounter
  );
  const createdNightRegs = [];
  for (const reg of nightRunRegistrations) {
    const created = await prisma.registration.create({ data: reg });
    createdNightRegs.push(created);
  }
  registrationCounter += 72;

  // Create results for night run
  const nightRunResults = generateResults(createdNightRegs, nightRun8k.id, 8.0);
  for (const result of nightRunResults) {
    await prisma.runResult.create({
      data: {
        ...result,
        registrationId: createdNightRegs[nightRunResults.indexOf(result)].id,
      },
    });
  }

  // 4. Spring Half Marathon 2026 - 25 registrations, NO RESULTS (open registration)
  console.log('Creating Spring Half Marathon 2026 registrations (25, no results)...');
  const springHalfRegistrations = generateRegistrations(
    springHalfRun.id,
    menOpenCategory.id,
    25,
    registrationCounter
  );
  for (const reg of springHalfRegistrations) {
    await prisma.registration.create({ data: reg });
  }
  registrationCounter += 25;

  // 5. Summer 10K Series 2026 - 28 registrations, NO RESULTS (open registration)
  console.log('Creating Summer 10K Series 2026 registrations (28, no results)...');
  const summer10KRegistrations = generateRegistrations(
    summer10KRun.id,
    menOpenCategory.id,
    28,
    registrationCounter
  );
  for (const reg of summer10KRegistrations) {
    await prisma.registration.create({ data: reg });
  }
  registrationCounter += 28;

  console.log('Sample events seed completed!');
  console.log(`- Created 4 organizers`);
  console.log(`- Created 6 locations`);
  console.log(`- Created 2 partners`);
  console.log(`- Created 10 events`);
  console.log(`- Created 13 runs`);
  console.log(`- Created standard categories for all runs`);
  console.log(`- Created entry fees`);
  console.log(`- Created event schedule`);
  console.log(`- Created 300 registrations (80 + 95 + 72 + 25 + 28)`);
  console.log(`- Created 247 results (for 3 completed events)`);
}

export default seedSampleEvents;

// Run directly if this file is executed
if (require.main === module) {
  seedSampleEvents()
    .catch((e) => {
      console.error('Error seeding sample events:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
