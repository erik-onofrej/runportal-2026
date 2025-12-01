import prisma from '../../lib/prisma';

// Slovak regions and districts data
const regionsData = [
  {
    name: 'Bratislavský kraj',
    code: 'BA',
    sortOrder: 1,
    districts: [
      { name: 'Bratislava I', code: 'BA1', sortOrder: 1 },
      { name: 'Bratislava II', code: 'BA2', sortOrder: 2 },
      { name: 'Bratislava III', code: 'BA3', sortOrder: 3 },
      { name: 'Bratislava IV', code: 'BA4', sortOrder: 4 },
      { name: 'Bratislava V', code: 'BA5', sortOrder: 5 },
      { name: 'Malacky', code: 'BM', sortOrder: 6 },
      { name: 'Pezinok', code: 'BP', sortOrder: 7 },
      { name: 'Senec', code: 'BS', sortOrder: 8 },
    ],
  },
  {
    name: 'Trnavský kraj',
    code: 'TT',
    sortOrder: 2,
    districts: [
      { name: 'Trnava', code: 'TT', sortOrder: 1 },
      { name: 'Dunajská Streda', code: 'TD', sortOrder: 2 },
      { name: 'Galanta', code: 'TG', sortOrder: 3 },
      { name: 'Hlohovec', code: 'TH', sortOrder: 4 },
      { name: 'Piešťany', code: 'TP', sortOrder: 5 },
      { name: 'Senica', code: 'TS', sortOrder: 6 },
      { name: 'Skalica', code: 'TSK', sortOrder: 7 },
    ],
  },
  {
    name: 'Trenčiansky kraj',
    code: 'TN',
    sortOrder: 3,
    districts: [
      { name: 'Trenčín', code: 'TN', sortOrder: 1 },
      { name: 'Bánovce nad Bebravou', code: 'TNB', sortOrder: 2 },
      { name: 'Ilava', code: 'TNI', sortOrder: 3 },
      { name: 'Myjava', code: 'TNM', sortOrder: 4 },
      { name: 'Nové Mesto nad Váhom', code: 'TNN', sortOrder: 5 },
      { name: 'Partizánske', code: 'TNP', sortOrder: 6 },
      { name: 'Považská Bystrica', code: 'TNPB', sortOrder: 7 },
      { name: 'Prievidza', code: 'TNPR', sortOrder: 8 },
      { name: 'Púchov', code: 'TNPU', sortOrder: 9 },
    ],
  },
  {
    name: 'Nitriansky kraj',
    code: 'NR',
    sortOrder: 4,
    districts: [
      { name: 'Nitra', code: 'NR', sortOrder: 1 },
      { name: 'Komárno', code: 'NRK', sortOrder: 2 },
      { name: 'Levice', code: 'NRL', sortOrder: 3 },
      { name: 'Nové Zámky', code: 'NRNZ', sortOrder: 4 },
      { name: 'Šaľa', code: 'NRS', sortOrder: 5 },
      { name: 'Topoľčany', code: 'NRT', sortOrder: 6 },
      { name: 'Zlaté Moravce', code: 'NRZM', sortOrder: 7 },
    ],
  },
  {
    name: 'Žilinský kraj',
    code: 'ZA',
    sortOrder: 5,
    districts: [
      { name: 'Žilina', code: 'ZA', sortOrder: 1 },
      { name: 'Bytča', code: 'ZAB', sortOrder: 2 },
      { name: 'Čadca', code: 'ZAC', sortOrder: 3 },
      { name: 'Dolný Kubín', code: 'ZADK', sortOrder: 4 },
      { name: 'Kysucké Nové Mesto', code: 'ZAKNM', sortOrder: 5 },
      { name: 'Liptovský Mikuláš', code: 'ZALM', sortOrder: 6 },
      { name: 'Martin', code: 'ZAM', sortOrder: 7 },
      { name: 'Námestovo', code: 'ZAN', sortOrder: 8 },
      { name: 'Ružomberok', code: 'ZAR', sortOrder: 9 },
      { name: 'Turčianske Teplice', code: 'ZATT', sortOrder: 10 },
      { name: 'Tvrdošín', code: 'ZATV', sortOrder: 11 },
    ],
  },
  {
    name: 'Banskobystrický kraj',
    code: 'BB',
    sortOrder: 6,
    districts: [
      { name: 'Banská Bystrica', code: 'BB', sortOrder: 1 },
      { name: 'Banská Štiavnica', code: 'BBBS', sortOrder: 2 },
      { name: 'Brezno', code: 'BBB', sortOrder: 3 },
      { name: 'Detva', code: 'BBD', sortOrder: 4 },
      { name: 'Krupina', code: 'BBK', sortOrder: 5 },
      { name: 'Lučenec', code: 'BBL', sortOrder: 6 },
      { name: 'Poltár', code: 'BBP', sortOrder: 7 },
      { name: 'Revúca', code: 'BBR', sortOrder: 8 },
      { name: 'Rimavská Sobota', code: 'BBRS', sortOrder: 9 },
      { name: 'Veľký Krtíš', code: 'BBVK', sortOrder: 10 },
      { name: 'Zvolen', code: 'BBZ', sortOrder: 11 },
      { name: 'Žarnovica', code: 'BBZN', sortOrder: 12 },
      { name: 'Žiar nad Hronom', code: 'BBZH', sortOrder: 13 },
    ],
  },
  {
    name: 'Prešovský kraj',
    code: 'PO',
    sortOrder: 7,
    districts: [
      { name: 'Prešov', code: 'PO', sortOrder: 1 },
      { name: 'Bardejov', code: 'POB', sortOrder: 2 },
      { name: 'Humenné', code: 'POH', sortOrder: 3 },
      { name: 'Kežmarok', code: 'POK', sortOrder: 4 },
      { name: 'Levoča', code: 'POL', sortOrder: 5 },
      { name: 'Medzilaborce', code: 'POM', sortOrder: 6 },
      { name: 'Poprad', code: 'POPP', sortOrder: 7 },
      { name: 'Sabinov', code: 'POS', sortOrder: 8 },
      { name: 'Snina', code: 'POSN', sortOrder: 9 },
      { name: 'Stará Ľubovňa', code: 'POSL', sortOrder: 10 },
      { name: 'Stropkov', code: 'POST', sortOrder: 11 },
      { name: 'Svidník', code: 'POSV', sortOrder: 12 },
      { name: 'Vranov nad Topľou', code: 'POVT', sortOrder: 13 },
    ],
  },
  {
    name: 'Košický kraj',
    code: 'KE',
    sortOrder: 8,
    districts: [
      { name: 'Košice I', code: 'KE1', sortOrder: 1 },
      { name: 'Košice II', code: 'KE2', sortOrder: 2 },
      { name: 'Košice III', code: 'KE3', sortOrder: 3 },
      { name: 'Košice IV', code: 'KE4', sortOrder: 4 },
      { name: 'Košice-okolie', code: 'KEO', sortOrder: 5 },
      { name: 'Gelnica', code: 'KEG', sortOrder: 6 },
      { name: 'Michalovce', code: 'KEM', sortOrder: 7 },
      { name: 'Rožňava', code: 'KER', sortOrder: 8 },
      { name: 'Sobrance', code: 'KES', sortOrder: 9 },
      { name: 'Spišská Nová Ves', code: 'KESNV', sortOrder: 10 },
      { name: 'Trebišov', code: 'KET', sortOrder: 11 },
    ],
  },
];

async function seedSlovakGeography() {
  console.log('Starting Slovak geography seed...');

  for (const regionData of regionsData) {
    const { districts, ...regionInfo } = regionData;

    console.log(`Seeding region: ${regionInfo.name}`);

    // Create or update region
    const region = await prisma.region.upsert({
      where: { code: regionInfo.code },
      update: regionInfo,
      create: regionInfo,
    });

    // Create or update districts
    for (const districtData of districts) {
      console.log(`  - Seeding district: ${districtData.name}`);

      await prisma.district.upsert({
        where: {
          regionId_name: {
            regionId: region.id,
            name: districtData.name,
          },
        },
        update: {
          code: districtData.code,
          sortOrder: districtData.sortOrder,
        },
        create: {
          ...districtData,
          regionId: region.id,
        },
      });
    }
  }

  console.log('Slovak geography seed completed!');
  console.log(`Total regions: 8`);
  console.log(`Total districts: 79`);
}

export default seedSlovakGeography;

// Run directly if this file is executed
if (require.main === module) {
  seedSlovakGeography()
    .catch((e) => {
      console.error('Error seeding Slovak geography:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
