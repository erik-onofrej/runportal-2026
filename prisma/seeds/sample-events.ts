import prisma from '../../lib/prisma';

async function seedSampleEvents() {
  console.log('Starting sample events seed...');

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

  // Create runs for Spring Marathon
  console.log('Creating runs and categories...');

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

  // Create runs for Park Run
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

  // Create standard categories for each run
  const standardCategories = [
    { name: 'Men Open', code: 'MO', gender: 'male', minAge: 18, maxAge: null },
    { name: 'Women Open', code: 'WO', gender: 'female', minAge: 18, maxAge: null },
    { name: 'Men 40-49', code: 'M40', gender: 'male', minAge: 40, maxAge: 49 },
    { name: 'Women 40-49', code: 'W40', gender: 'female', minAge: 40, maxAge: 49 },
    { name: 'Men 50+', code: 'M50', gender: 'male', minAge: 50, maxAge: null },
    { name: 'Women 50+', code: 'W50', gender: 'female', minAge: 50, maxAge: null },
  ];

  const juniorCategories = [
    { name: 'Juniors 16-18', code: 'J16', gender: null, minAge: 16, maxAge: 18 },
  ];

  // Add categories to marathon runs
  for (const run of [fullMarathon, halfMarathon, run10k]) {
    let order = 1;
    for (const cat of standardCategories) {
      await prisma.runCategory.create({
        data: {
          runId: run.id,
          name: cat.name,
          code: cat.code,
          gender: cat.gender,
          minAge: cat.minAge,
          maxAge: cat.maxAge,
          sortOrder: order++,
        },
      });
    }
  }

  // Add categories to park runs (including juniors)
  for (const run of [parkRun5k, parkRun10k]) {
    let order = 1;
    for (const cat of [...standardCategories, ...juniorCategories]) {
      await prisma.runCategory.create({
        data: {
          runId: run.id,
          name: cat.name,
          code: cat.code,
          gender: cat.gender,
          minAge: cat.minAge,
          maxAge: cat.maxAge,
          sortOrder: order++,
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

  // Create sample runners and registrations
  console.log('Creating sample runners and registrations...');

  const runner1 = await prisma.runner.create({
    data: {
      email: 'jan.novak@example.sk',
      firstName: 'Ján',
      lastName: 'Novák',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      phone: '+421 901 234 567',
      city: 'Bratislava',
      club: 'Bratislava Running Club',
    },
  });

  const runner2 = await prisma.runner.create({
    data: {
      email: 'maria.horvath@example.sk',
      firstName: 'Mária',
      lastName: 'Horváthová',
      dateOfBirth: new Date('1990-08-22'),
      gender: 'female',
      phone: '+421 902 345 678',
      city: 'Bratislava',
      club: 'City Runners',
    },
  });

  // Get categories
  const menOpenCategory = await prisma.runCategory.findFirst({
    where: { runId: fullMarathon.id, code: 'MO' },
  });

  const womenOpenCategory = await prisma.runCategory.findFirst({
    where: { runId: halfMarathon.id, code: 'WO' },
  });

  if (menOpenCategory && womenOpenCategory) {
    // Create registrations
    await prisma.registration.create({
      data: {
        runId: fullMarathon.id,
        categoryId: menOpenCategory.id,
        runnerId: runner1.id,
        guestFirstName: 'Ján',
        guestLastName: 'Novák',
        guestEmail: 'jan.novak@example.sk',
        guestPhone: '+421 901 234 567',
        guestDateOfBirth: new Date('1985-05-15'),
        guestGender: 'male',
        guestCity: 'Bratislava',
        guestClub: 'Bratislava Running Club',
        registrationNumber: 'BRM2025-000001',
        paid: true,
        paidAmount: 40.0,
        paidAt: new Date('2025-01-15'),
        status: 'confirmed',
      },
    });

    await prisma.registration.create({
      data: {
        runId: halfMarathon.id,
        categoryId: womenOpenCategory.id,
        runnerId: runner2.id,
        guestFirstName: 'Mária',
        guestLastName: 'Horváthová',
        guestEmail: 'maria.horvath@example.sk',
        guestPhone: '+421 902 345 678',
        guestDateOfBirth: new Date('1990-08-22'),
        guestGender: 'female',
        guestCity: 'Bratislava',
        guestClub: 'City Runners',
        registrationNumber: 'BRM2025-000002',
        paid: true,
        paidAmount: 25.0,
        paidAt: new Date('2025-01-20'),
        status: 'confirmed',
      },
    });

    // Guest registration (no runnerId)
    await prisma.registration.create({
      data: {
        runId: run10k.id,
        categoryId: await prisma.runCategory
          .findFirst({ where: { runId: run10k.id, code: 'MO' } })
          .then((c) => c!.id),
        runnerId: null,
        guestFirstName: 'Peter',
        guestLastName: 'Kováč',
        guestEmail: 'peter.kovac@example.sk',
        guestPhone: '+421 903 456 789',
        guestDateOfBirth: new Date('1995-03-10'),
        guestGender: 'male',
        guestCity: 'Trnava',
        registrationNumber: 'BRM2025-000003',
        paid: false,
        status: 'pending',
      },
    });
  }

  console.log('Sample events seed completed!');
  console.log(`- Created 2 organizers`);
  console.log(`- Created 2 locations`);
  console.log(`- Created 2 partners`);
  console.log(`- Created 2 events`);
  console.log(`- Created 5 runs`);
  console.log(`- Created standard categories for all runs`);
  console.log(`- Created entry fees`);
  console.log(`- Created event schedule`);
  console.log(`- Created 2 runners`);
  console.log(`- Created 3 registrations`);
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
