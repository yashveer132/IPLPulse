import fs from 'fs';
import { parse } from 'csv-parse/sync';


const COLUMN_PRESETS = {
  default: {
    playerName: ['player', 'player_name', 'Player', 'Player Name', 'PLAYER', 'name'],
    basePrice: ['base_price', 'Base Price', 'BASE PRICE', 'base_price_lakh', 'base_price_lakhs'],
    soldPrice: ['sold_price', 'winning_bid', 'Sold Price', 'SOLD PRICE', 'final_price', 'cost_in_cr', 'Price', 'Amount'],
    team: ['team', 'Team', 'TEAM', 'franchise', 'Franchise', 'sold_to'],
    season: ['season', 'Season', 'SEASON', 'year', 'Year', 'auction_year'],
    role: ['role', 'Role', 'ROLE', 'player_role', 'type', 'Type', 'specialism'],
    nationality: ['nationality', 'Nationality', 'country', 'Country', 'type', 'Player Origin'],
    status: ['status', 'Status', 'STATUS', 'auction_status', 'sold_unsold'],
  },
};


function findColumn(row, aliases) {
  for (const alias of aliases) {
    if (row[alias] !== undefined) return alias;
  }
  return null;
}


export function parsePriceToLakhs(value) {
  if (value === null || value === undefined || value === '' || value === 'NA') return null;

  const str = String(value).trim().replace(/[₹,\s]/g, '');

  if (/cr/i.test(str)) {
    const num = parseFloat(str.replace(/cr.*$/i, ''));
    return isNaN(num) ? null : num * 100;
  }

  if (/l(?:akh)?s?/i.test(str)) {
    const num = parseFloat(str.replace(/l(?:akh)?s?.*$/i, ''));
    return isNaN(num) ? null : num;
  }

  const num = parseFloat(str);
  if (isNaN(num)) return null;

  if (num > 100000) return num / 100000;
  if (num > 100) return num;
  if (str.includes('.') && num < 30) return num * 100;

  return num;
}


function normalizeNationality(val) {
  if (!val) return 'Indian';
  const lower = String(val).toLowerCase().trim();
  if (lower === 'indian' || lower === 'india' || lower === 'ind') return 'Indian';
  return 'Overseas';
}


function normalizeRole(val) {
  if (!val) return 'All-Rounder';
  const lower = String(val).toLowerCase().trim();
  if (lower.includes('bat')) return 'Batter';
  if (lower.includes('bowl') || lower.includes('fast') || lower.includes('spin') || lower.includes('pace')) return 'Bowler';
  if (lower.includes('keep') || lower.includes('wk') || lower.includes('wicket')) return 'Wicket-Keeper';
  if (lower.includes('all')) return 'All-Rounder';
  return 'All-Rounder';
}


function normalizeStatus(val, soldPrice, team) {
  if (!val) {
    if (soldPrice && team) return 'Sold';
    return 'Unsold';
  }
  const lower = String(val).toLowerCase().trim();
  if (lower.includes('retain')) return 'Retained';
  if (lower.includes('rtm') || lower.includes('right to match')) return 'RTM';
  if (lower.includes('unsold') || lower === 'no') return 'Unsold';
  return 'Sold';
}


const TEAM_SHORT_MAP = {
  'mumbai indians': 'MI', 'mi': 'MI',
  'chennai super kings': 'CSK', 'csk': 'CSK',
  'royal challengers bangalore': 'RCB', 'royal challengers bengaluru': 'RCB', 'rcb': 'RCB',
  'kolkata knight riders': 'KKR', 'kkr': 'KKR',
  'delhi capitals': 'DC', 'delhi daredevils': 'DC', 'dc': 'DC', 'dd': 'DC',
  'punjab kings': 'PBKS', 'kings xi punjab': 'PBKS', 'pbks': 'PBKS', 'kxip': 'PBKS',
  'rajasthan royals': 'RR', 'rr': 'RR',
  'sunrisers hyderabad': 'SRH', 'srh': 'SRH', 'deccan chargers': 'SRH',
  'gujarat titans': 'GT', 'gt': 'GT',
  'lucknow super giants': 'LSG', 'lsg': 'LSG',
  'rising pune supergiant': 'RPS', 'rising pune supergiants': 'RPS', 'rps': 'RPS',
  'gujarat lions': 'GL', 'gl': 'GL',
  'pune warriors india': 'PWI', 'pwi': 'PWI',
  'kochi tuskers kerala': 'KTK', 'ktk': 'KTK',
};

function normalizeTeam(val) {
  if (!val || val === 'NA' || val === '-') return null;
  const lower = String(val).toLowerCase().trim();
  return TEAM_SHORT_MAP[lower] || String(val).trim();
}


export function parseAuctionCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  });

  if (records.length === 0) return [];

  const preset = COLUMN_PRESETS.default;
  const firstRow = records[0];
  const colMap = {
    playerName: findColumn(firstRow, preset.playerName),
    basePrice: findColumn(firstRow, preset.basePrice),
    soldPrice: findColumn(firstRow, preset.soldPrice),
    team: findColumn(firstRow, preset.team),
    season: findColumn(firstRow, preset.season),
    role: findColumn(firstRow, preset.role),
    nationality: findColumn(firstRow, preset.nationality),
    status: findColumn(firstRow, preset.status),
  };

  if (!colMap.playerName) {
    console.error('Could not find player name column. Available columns:', Object.keys(firstRow));
    return [];
  }

  const results = [];

  for (const row of records) {
    const playerName = row[colMap.playerName]?.trim();
    if (!playerName) continue;

    const basePrice = parsePriceToLakhs(colMap.basePrice ? row[colMap.basePrice] : null);
    const soldPrice = parsePriceToLakhs(colMap.soldPrice ? row[colMap.soldPrice] : null);
    const team = normalizeTeam(colMap.team ? row[colMap.team] : null);
    const season = colMap.season ? parseInt(row[colMap.season], 10) : null;
    const role = normalizeRole(colMap.role ? row[colMap.role] : null);
    const nationality = normalizeNationality(colMap.nationality ? row[colMap.nationality] : null);
    const status = normalizeStatus(
      colMap.status ? row[colMap.status] : null,
      soldPrice,
      team
    );

    results.push({
      playerName,
      basePrice: basePrice || 20,
      soldPrice,
      team,
      season,
      role,
      nationality,
      status,
      isRetained: status === 'Retained',
    });
  }

  return results;
}
