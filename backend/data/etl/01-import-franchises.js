import { PrismaClient } from '@prisma/client';
import Logger from './utils/logger.js';

const prisma = new PrismaClient();
const log = new Logger('01-franchises');

const FRANCHISES = [
  {
    name: 'Mumbai Indians',
    shortName: 'MI',
    city: 'Mumbai',
    homeGround: 'Wankhede Stadium',
    titles: 5,
    titleYears: [2013, 2015, 2017, 2019, 2020],
    foundedYear: 2008,
    color: '#004ba0',
  },
  {
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    city: 'Chennai',
    homeGround: 'MA Chidambaram Stadium',
    titles: 5,
    titleYears: [2010, 2011, 2018, 2021, 2023],
    foundedYear: 2008,
    color: '#f9cd05',
  },
  {
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    city: 'Kolkata',
    homeGround: 'Eden Gardens',
    titles: 3,
    titleYears: [2012, 2014, 2024],
    foundedYear: 2008,
    color: '#3a225d',
  },
  {
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    city: 'Bengaluru',
    homeGround: 'M. Chinnaswamy Stadium',
    titles: 0,
    titleYears: [],
    foundedYear: 2008,
    color: '#d4213d',
  },
  {
    name: 'Delhi Capitals',
    shortName: 'DC',
    city: 'Delhi',
    homeGround: 'Arun Jaitley Stadium',
    titles: 0,
    titleYears: [],
    foundedYear: 2008,
    color: '#0078bc',
  },
  {
    name: 'Punjab Kings',
    shortName: 'PBKS',
    city: 'Mohali',
    homeGround: 'PCA Stadium',
    titles: 0,
    titleYears: [],
    foundedYear: 2008,
    color: '#ed1b24',
  },
  {
    name: 'Rajasthan Royals',
    shortName: 'RR',
    city: 'Jaipur',
    homeGround: 'Sawai Mansingh Stadium',
    titles: 1,
    titleYears: [2008],
    foundedYear: 2008,
    color: '#ea1a85',
  },
  {
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    city: 'Hyderabad',
    homeGround: 'Rajiv Gandhi International Cricket Stadium',
    titles: 1,
    titleYears: [2016],
    foundedYear: 2013,
    color: '#ff822a',
  },
  {
    name: 'Gujarat Titans',
    shortName: 'GT',
    city: 'Ahmedabad',
    homeGround: 'Narendra Modi Stadium',
    titles: 1,
    titleYears: [2022],
    foundedYear: 2022,
    color: '#1c1c2b',
  },
  {
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    city: 'Lucknow',
    homeGround: 'BRSABV Ekana Cricket Stadium',
    titles: 0,
    titleYears: [],
    foundedYear: 2022,
    color: '#a72056',
  },
  {
    name: 'Deccan Chargers',
    shortName: 'DCH',
    city: 'Hyderabad',
    homeGround: 'Rajiv Gandhi International Cricket Stadium',
    titles: 1,
    titleYears: [2009],
    foundedYear: 2008,
    color: '#1a4d7c',
  },
  {
    name: 'Rising Pune Supergiant',
    shortName: 'RPS',
    city: 'Pune',
    homeGround: 'Maharashtra Cricket Association Stadium',
    titles: 0,
    titleYears: [],
    foundedYear: 2016,
    color: '#6a5acd',
  },
  {
    name: 'Gujarat Lions',
    shortName: 'GL',
    city: 'Rajkot',
    homeGround: 'Saurashtra Cricket Association Stadium',
    titles: 0,
    titleYears: [],
    foundedYear: 2016,
    color: '#e04f16',
  },
  {
    name: 'Pune Warriors India',
    shortName: 'PWI',
    city: 'Pune',
    homeGround: 'Subrata Roy Sahara Stadium',
    titles: 0,
    titleYears: [],
    foundedYear: 2011,
    color: '#1e90ff',
  },
  {
    name: 'Kochi Tuskers Kerala',
    shortName: 'KTK',
    city: 'Kochi',
    homeGround: 'Jawaharlal Nehru Stadium',
    titles: 0,
    titleYears: [],
    foundedYear: 2011,
    color: '#800080',
  },
];

async function main() {
  log.info(`Importing ${FRANCHISES.length} franchises...`);

  for (let i = 0; i < FRANCHISES.length; i++) {
    const f = FRANCHISES[i];
    await prisma.franchise.upsert({
      where: { shortName: f.shortName },
      update: {
        name: f.name,
        city: f.city,
        homeGround: f.homeGround,
        titles: f.titles,
        titleYears: f.titleYears,
        foundedYear: f.foundedYear,
        color: f.color,
      },
      create: f,
    });
    log.progress(i + 1, FRANCHISES.length, 'franchises');
  }

  log.success(`Upserted ${FRANCHISES.length} franchises`);
  log.done();
}

main()
  .catch((e) => {
    log.error('Failed', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
