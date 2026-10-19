import { Player, Formation, OpponentTeam, SwotData, TacticalNotes, OpponentPlayer, ClubProfile } from '../types';

export const HGUFC_CLUB_PROFILE: ClubProfile = {
  id: 'club-hgufc',
  name: 'Hougang United Football Club',
  shortName: 'Hougang United FC',
  code: 'HGUFC',
  primaryColor: '#EA580C',
  secondaryColor: '#1E293B',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original',
  localLogoUrl: '/hougang-united-logo.svg',
  stadium: 'Jalan Besar Stadium',
  league: 'Singapore Premier League (SPL)',
};

export const INITIAL_PLAYERS: Player[] = [
  // 3 Goalkeepers (Distinct GK Styling)
  { id: 'p-1', name: 'Zaiful Nizam', number: 1, position: 'GK', preferredFoot: 'Right', notes: 'Experienced shot-stopper, vocal leader from deep' },
  { id: 'p-2', name: 'Aizil Yazid', number: 18, position: 'GK', preferredFoot: 'Right', notes: 'Agile shot-stopper, high reflex reactions' },
  { id: 'p-3', name: 'Kenji Rusydi', number: 25, position: 'GK', preferredFoot: 'Left', notes: 'Sweeper keeper, confident distributing with left foot' },

  // 10 Defenders
  { id: 'p-4', name: 'Nazrul Nazari', number: 4, position: 'DEF', preferredFoot: 'Right', notes: 'Dynamic right fullback, rapid recovery pace, inverted support' },
  { id: 'p-5', name: 'Anders Aplin', number: 5, position: 'DEF', preferredFoot: 'Right', notes: 'Commanding center-back, aerial duel dominance' },
  { id: 'p-6', name: 'Farhan Zulkifli', number: 3, position: 'DEF', preferredFoot: 'Left', notes: 'Explosive left wingback, overlapping threat in final third' },
  { id: 'p-7', name: 'Kazuma Takayama', number: 6, position: 'DEF', preferredFoot: 'Right', notes: 'Composed ball-playing defender, line-breaking distribution' },
  { id: 'p-8', name: 'Ajay Robson', number: 12, position: 'DEF', preferredFoot: 'Right', notes: 'Strong stopper, aggressive 1v1 ground duel tackle rate' },
  { id: 'p-9', name: 'Jordan Vestering', number: 17, position: 'DEF', preferredFoot: 'Left', notes: 'Defensive left-back, disciplined rest-defense positioning' },
  { id: 'p-10', name: 'Harhys Stewart', number: 15, position: 'DEF', preferredFoot: 'Right', notes: 'Versatile defender / defensive anchor, tactical reading' },
  { id: 'p-11', name: 'Rayan Azmi', number: 22, position: 'DEF', preferredFoot: 'Right', notes: 'Youth academy graduate, athletic recovery speed' },
  { id: 'p-12', name: 'Danish Irfan', number: 27, position: 'DEF', preferredFoot: 'Right', notes: 'Stout central defender, dependable low-block aerial clearing' },
  { id: 'p-13', name: 'Umar Akhbar', number: 29, position: 'DEF', preferredFoot: 'Right', notes: 'Wide fullback cover, energetic up-and-down stamina' },

  // 10 Midfielders
  { id: 'p-14', name: 'Shahdan Sulaiman', number: 8, position: 'MID', preferredFoot: 'Right', notes: 'Metronomic deep-lying playmaker, pinpoint diagonal switches' },
  { id: 'p-15', name: 'Kristijan Krajcek', number: 10, position: 'MID', preferredFoot: 'Both', notes: 'Creative playmaker, operates between lines & half-spaces' },
  { id: 'p-16', name: 'Zulfahmi Arifin', number: 7, position: 'MID', preferredFoot: 'Left', notes: 'Left-footed maestro, dead-ball specialist and set-piece threat' },
  { id: 'p-17', name: 'Ismail Salihovic', number: 14, position: 'MID', preferredFoot: 'Right', notes: 'Box-to-box engine, counter-press trigger leader' },
  { id: 'p-18', name: 'Hazzuwan Halim', number: 11, position: 'MID', preferredFoot: 'Right', notes: 'High work-rate inverted winger / wide midfielder' },
  { id: 'p-19', name: 'Justin Hui', number: 16, position: 'MID', preferredFoot: 'Right', notes: 'Tenacious pressing midfielder, high ball turnover rate' },
  { id: 'p-20', name: 'Nikesh Singh', number: 20, position: 'MID', preferredFoot: 'Right', notes: 'Central distributor, short-medium combination play' },
  { id: 'p-21', name: 'Nurisham Jupri', number: 24, position: 'MID', preferredFoot: 'Right', notes: 'Holding midfielder, screen in front of back-four' },
  { id: 'p-22', name: 'Farhan Azman', number: 26, position: 'MID', preferredFoot: 'Left', notes: 'Left-sided midfielder with sharp delivery into penalty box' },
  { id: 'p-23', name: 'Asraf Zahid', number: 28, position: 'MID', preferredFoot: 'Right', notes: 'Energetic transitional carrier, fast progressive ball carrying' },

  // 7 Forwards
  { id: 'p-24', name: 'Dejan Racic', number: 9, position: 'FWD', preferredFoot: 'Right', notes: 'Lethal target striker, physical presence in the 18-yard box' },
  { id: 'p-25', name: 'Petar Sliskovic', number: 99, position: 'FWD', preferredFoot: 'Right', notes: 'Prolific finisher, clinical first-time shooter in the box' },
  { id: 'p-26', name: 'Gabriel Quak', number: 77, position: 'FWD', preferredFoot: 'Left', notes: 'Veteran winger, electric cut-inside shoot or cross specialist' },
  { id: 'p-27', name: 'Shahril Ishak', number: 19, position: 'FWD', preferredFoot: 'Right', notes: 'Tactical veteran forward, exceptional penalty box movement' },
  { id: 'p-28', name: 'Amir Zalani', number: 21, position: 'FWD', preferredFoot: 'Right', notes: 'Pacy wide forward, runs in behind opponent high defensive lines' },
  { id: 'p-29', name: 'Louka Vaissierre', number: 23, position: 'FWD', preferredFoot: 'Left', notes: 'Tricky dribbler, wins fouls in advanced attacking third' },
  { id: 'p-30', name: 'Sahil Suhaimi', number: 32, position: 'FWD', preferredFoot: 'Right', notes: 'Instinctive poacher, versatile striker/winger, dangerous on second-ball rebounds' },
];

export const INITIAL_FORMATIONS: Formation[] = [
  {
    id: 'form-433',
    name: '4-3-3 Attacking',
    category: '4-at-back',
    tacticalDescription: 'High wide wingers creating half-space isolation, balanced three-man midfield triangle, dual attacking #8s.',
    positions: [
      { role: 'GK', position: 'GK', x: 50, y: 92 },
      { role: 'RB', position: 'DEF', x: 86, y: 76 },
      { role: 'RCB', position: 'DEF', x: 63, y: 80 },
      { role: 'LCB', position: 'DEF', x: 37, y: 80 },
      { role: 'LB', position: 'DEF', x: 14, y: 76 },
      { role: 'DM (6)', position: 'MID', x: 50, y: 65 },
      { role: 'RCM (8)', position: 'MID', x: 68, y: 53 },
      { role: 'LCM (8)', position: 'MID', x: 32, y: 53 },
      { role: 'RW', position: 'FWD', x: 82, y: 32 },
      { role: 'ST', position: 'FWD', x: 50, y: 24 },
      { role: 'LW', position: 'FWD', x: 18, y: 32 },
    ]
  },
  {
    id: 'form-4231',
    name: '4-2-3-1 Balanced',
    category: '4-at-back',
    tacticalDescription: 'Double pivot rest-defense screen, central playmaker #10 between the lines, wide attacking wingers.',
    positions: [
      { role: 'GK', position: 'GK', x: 50, y: 92 },
      { role: 'RB', position: 'DEF', x: 85, y: 77 },
      { role: 'RCB', position: 'DEF', x: 62, y: 80 },
      { role: 'LCB', position: 'DEF', x: 38, y: 80 },
      { role: 'LB', position: 'DEF', x: 15, y: 77 },
      { role: 'RDM', position: 'MID', x: 62, y: 64 },
      { role: 'LDM', position: 'MID', x: 38, y: 64 },
      { role: 'RAM', position: 'MID', x: 80, y: 44 },
      { role: 'CAM', position: 'MID', x: 50, y: 42 },
      { role: 'LAM', position: 'MID', x: 20, y: 44 },
      { role: 'ST', position: 'FWD', x: 50, y: 25 },
    ]
  },
  {
    id: 'form-442-flat',
    name: '4-4-2 Flat',
    category: '4-at-back',
    tacticalDescription: 'Compact two banks of four, disciplined low/mid-block spacing, direct striker partnership.',
    positions: [
      { role: 'GK', position: 'GK', x: 50, y: 92 },
      { role: 'RB', position: 'DEF', x: 85, y: 78 },
      { role: 'RCB', position: 'DEF', x: 62, y: 80 },
      { role: 'LCB', position: 'DEF', x: 38, y: 80 },
      { role: 'LB', position: 'DEF', x: 15, y: 78 },
      { role: 'RM', position: 'MID', x: 85, y: 55 },
      { role: 'RCM', position: 'MID', x: 60, y: 57 },
      { role: 'LCM', position: 'MID', x: 40, y: 57 },
      { role: 'LM', position: 'MID', x: 15, y: 55 },
      { role: 'RS', position: 'FWD', x: 62, y: 28 },
      { role: 'LS', position: 'FWD', x: 38, y: 28 },
    ]
  },
  {
    id: 'form-442-diamond',
    name: '4-4-2 Diamond',
    category: '4-at-back',
    tacticalDescription: 'Central midfield superiority, single pivot anchor with tip #10 behind two split forwards, fullbacks provide width.',
    positions: [
      { role: 'GK', position: 'GK', x: 50, y: 92 },
      { role: 'RB', position: 'DEF', x: 86, y: 74 },
      { role: 'RCB', position: 'DEF', x: 62, y: 80 },
      { role: 'LCB', position: 'DEF', x: 38, y: 80 },
      { role: 'LB', position: 'DEF', x: 14, y: 74 },
      { role: 'CDM', position: 'MID', x: 50, y: 66 },
      { role: 'RCM', position: 'MID', x: 68, y: 53 },
      { role: 'LCM', position: 'MID', x: 32, y: 53 },
      { role: 'CAM', position: 'MID', x: 50, y: 40 },
      { role: 'RS', position: 'FWD', x: 62, y: 26 },
      { role: 'LS', position: 'FWD', x: 38, y: 26 },
    ]
  },
  {
    id: 'form-352',
    name: '3-5-2 Fluid',
    category: '3-at-back',
    tacticalDescription: 'Three central defenders with attacking wingbacks, strong 3-man midfield axis, dual central strikers.',
    positions: [
      { role: 'GK', position: 'GK', x: 50, y: 92 },
      { role: 'RCB', position: 'DEF', x: 72, y: 80 },
      { role: 'CB', position: 'DEF', x: 50, y: 82 },
      { role: 'LCB', position: 'DEF', x: 28, y: 80 },
      { role: 'RWB', position: 'DEF', x: 88, y: 60 },
      { role: 'LWB', position: 'DEF', x: 12, y: 60 },
      { role: 'DM', position: 'MID', x: 50, y: 64 },
      { role: 'RCM', position: 'MID', x: 65, y: 49 },
      { role: 'LCM', position: 'MID', x: 35, y: 49 },
      { role: 'RS', position: 'FWD', x: 62, y: 26 },
      { role: 'LS', position: 'FWD', x: 38, y: 26 },
    ]
  },
  {
    id: 'form-343-flat',
    name: '3-4-3 Flat',
    category: '3-at-back',
    tacticalDescription: 'Aggressive front three with wide wing play, two central controllers and wide midfield support.',
    positions: [
      { role: 'GK', position: 'GK', x: 50, y: 92 },
      { role: 'RCB', position: 'DEF', x: 72, y: 80 },
      { role: 'CB', position: 'DEF', x: 50, y: 82 },
      { role: 'LCB', position: 'DEF', x: 28, y: 80 },
      { role: 'RM', position: 'MID', x: 88, y: 58 },
      { role: 'RCM', position: 'MID', x: 60, y: 60 },
      { role: 'LCM', position: 'MID', x: 40, y: 60 },
      { role: 'LM', position: 'MID', x: 12, y: 58 },
      { role: 'RW', position: 'FWD', x: 80, y: 30 },
      { role: 'ST', position: 'FWD', x: 50, y: 24 },
      { role: 'LW', position: 'FWD', x: 20, y: 30 },
    ]
  },
  {
    id: 'form-343-diamond',
    name: '3-4-3 Diamond',
    category: '3-at-back',
    tacticalDescription: '3-1-2-1-3 structure: Johan Cruyff style positional play, overloaded center and pure wide wingers.',
    positions: [
      { role: 'GK', position: 'GK', x: 50, y: 92 },
      { role: 'RCB', position: 'DEF', x: 72, y: 80 },
      { role: 'CB', position: 'DEF', x: 50, y: 82 },
      { role: 'LCB', position: 'DEF', x: 28, y: 80 },
      { role: 'CDM', position: 'MID', x: 50, y: 68 },
      { role: 'RCM', position: 'MID', x: 68, y: 55 },
      { role: 'LCM', position: 'MID', x: 32, y: 55 },
      { role: 'CAM', position: 'MID', x: 50, y: 42 },
      { role: 'RW', position: 'FWD', x: 82, y: 28 },
      { role: 'ST', position: 'FWD', x: 50, y: 22 },
      { role: 'LW', position: 'FWD', x: 18, y: 28 },
    ]
  },
  {
    id: 'form-532',
    name: '5-3-2 Resilient',
    category: '5-at-back',
    tacticalDescription: 'Solid 5-man defensive foundation, disciplined low block, counter-attacking through dual strikers.',
    positions: [
      { role: 'GK', position: 'GK', x: 50, y: 92 },
      { role: 'RWB', position: 'DEF', x: 88, y: 72 },
      { role: 'RCB', position: 'DEF', x: 68, y: 81 },
      { role: 'CB', position: 'DEF', x: 50, y: 83 },
      { role: 'LCB', position: 'DEF', x: 32, y: 81 },
      { role: 'LWB', position: 'DEF', x: 12, y: 72 },
      { role: 'RCM', position: 'MID', x: 68, y: 56 },
      { role: 'CM', position: 'MID', x: 50, y: 59 },
      { role: 'LCM', position: 'MID', x: 32, y: 56 },
      { role: 'RS', position: 'FWD', x: 62, y: 27 },
      { role: 'LS', position: 'FWD', x: 38, y: 27 },
    ]
  },
  {
    id: 'form-541',
    name: '5-4-1 Compact Block',
    category: '5-at-back',
    tacticalDescription: 'Impenetrable defensive low block, denial of central half-spaces, isolated lone forward holding play.',
    positions: [
      { role: 'GK', position: 'GK', x: 50, y: 92 },
      { role: 'RWB', position: 'DEF', x: 88, y: 74 },
      { role: 'RCB', position: 'DEF', x: 68, y: 82 },
      { role: 'CB', position: 'DEF', x: 50, y: 84 },
      { role: 'LCB', position: 'DEF', x: 32, y: 82 },
      { role: 'LWB', position: 'DEF', x: 12, y: 74 },
      { role: 'RM', position: 'MID', x: 84, y: 54 },
      { role: 'RCM', position: 'MID', x: 60, y: 58 },
      { role: 'LCM', position: 'MID', x: 40, y: 58 },
      { role: 'LM', position: 'MID', x: 16, y: 54 },
      { role: 'ST', position: 'FWD', x: 50, y: 26 },
    ]
  }
];

export const INITIAL_OPPONENTS: OpponentTeam[] = [
  {
    id: 'opp-lcs',
    name: 'Lion City Sailors',
    shortName: 'Sailors',
    primaryColor: '#002B49',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=128&auto=format&fit=crop&q=80',
    stadium: 'Bishan Stadium',
    defaultFormation: 'form-433',
    tacticalStyle: 'High-possession positional dominance, inverted wingers attacking half-spaces, high defensive line with aggressive rest-defense counter-press.',
    strengths: [
      'High technical quality in central midfield distribution',
      'Dangerous 1v1 wingers cutting into shooting zones',
      'Overloading the attacking third during sustained pressure'
    ],
    weaknesses: [
      'Vulnerable space behind fullbacks during offensive transitions',
      'Susceptible to direct vertical counters between CB and LB',
      'Can get frustrated against disciplined low-block compactness'
    ],
    keyPlayers: ['Bart Ramselaar', 'Shawal Anuar', 'Maxime Lestienne', 'Bailey Wright'],
    players: [
      { id: 'lcs-1', name: 'Izwan Mahbud', number: 1, position: 'GK', role: 'GK' },
      { id: 'lcs-2', name: 'Lionel Tan', number: 4, position: 'DEF', role: 'RB' },
      { id: 'lcs-3', name: 'Bailey Wright', number: 5, position: 'DEF', role: 'RCB' },
      { id: 'lcs-4', name: 'Toni Datkovic', number: 2, position: 'DEF', role: 'LCB' },
      { id: 'lcs-5', name: 'Chris van Huizen', number: 22, position: 'DEF', role: 'LB' },
      { id: 'lcs-6', name: 'Rui Pires', number: 6, position: 'MID', role: 'DM' },
      { id: 'lcs-7', name: 'Hariss Harun', number: 14, position: 'MID', role: 'RCM' },
      { id: 'lcs-8', name: 'Bart Ramselaar', number: 10, position: 'MID', role: 'LCM' },
      { id: 'lcs-9', name: 'Maxime Lestienne', number: 17, position: 'FWD', role: 'RW' },
      { id: 'lcs-10', name: 'Lennart Thy', number: 9, position: 'FWD', role: 'ST' },
      { id: 'lcs-11', name: 'Shawal Anuar', number: 7, position: 'FWD', role: 'LW' },
    ]
  },
  {
    id: 'opp-tampines',
    name: 'Tampines Rovers',
    shortName: 'Stags',
    primaryColor: '#EAB308',
    secondaryColor: '#1E293B',
    logoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=128&auto=format&fit=crop&q=80',
    stadium: 'Our Tampines Hub (OTH)',
    defaultFormation: 'form-4231',
    tacticalStyle: 'Fluid combinations through thirds, intricate short passing triangles, overlapping fullbacks generating cutbacks.',
    strengths: [
      'Excellent passing rhythm and spatial awareness on artificial turf',
      'Clinical finishing from central cutback opportunities',
      'Deep-lying midfielder dictates tempo with diagonal long balls'
    ],
    weaknesses: [
      'Center-backs struggle when isolated in foot races against pacy forwards',
      'Over-committing fullbacks leaves flanks open for fast breakaways',
      'Vulnerability during defensive set pieces in the 6-yard box'
    ],
    keyPlayers: ['Boris Kopitovic', 'Kyoga Nakamura', 'Faris Ramli', 'Milos Zlatkovic'],
    players: [
      { id: 'tam-1', name: 'Syazwan Buhari', number: 24, position: 'GK', role: 'GK' },
      { id: 'tam-2', name: 'Irfan Najeeb', number: 8, position: 'DEF', role: 'RB' },
      { id: 'tam-3', name: 'Shuya Yamashita', number: 4, position: 'DEF', role: 'RCB' },
      { id: 'tam-4', name: 'Milos Zlatkovic', number: 5, position: 'DEF', role: 'LCB' },
      { id: 'tam-5', name: 'Glenn Kweh', number: 23, position: 'DEF', role: 'LB' },
      { id: 'tam-6', name: 'Kyoga Nakamura', number: 6, position: 'MID', role: 'RDM' },
      { id: 'tam-7', name: 'Shah Shahiran', number: 7, position: 'MID', role: 'LDM' },
      { id: 'tam-8', name: 'Joel Chew', number: 15, position: 'MID', role: 'CAM' },
      { id: 'tam-9', name: 'Taufik Suparno', number: 11, position: 'FWD', role: 'RAM' },
      { id: 'tam-10', name: 'Faris Ramli', number: 10, position: 'FWD', role: 'LAM' },
      { id: 'tam-11', name: 'Boris Kopitovic', number: 9, position: 'FWD', role: 'ST' },
    ]
  },
  {
    id: 'opp-geylang',
    name: 'Geylang International',
    shortName: 'Eagles',
    primaryColor: '#15803D',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=128&auto=format&fit=crop&q=80',
    stadium: 'Jalan Besar Stadium',
    defaultFormation: 'form-442-flat',
    tacticalStyle: 'High-intensity direct transitions, rapid ball circulation to wide channels, aggressive second ball contestation.',
    strengths: [
      'Devastating forward transitions off opposition midfield turnovers',
      'Dynamic striker duo with intelligent complementary movement',
      'High physical stamina and fierce pressing in wide zones'
    ],
    weaknesses: [
      'Spaces open up between midfield line and defense line when pressed high',
      'Inconsistent concentration in defensive transition after losing possession',
      'Defensive lapses during early phases of second half'
    ],
    keyPlayers: ['Ryoya Taniguchi', 'Vincent Bezecourt', 'Takahiro Tezuka'],
    players: [
      { id: 'gey-1', name: 'Rudy Khairullah', number: 1, position: 'GK', role: 'GK' },
      { id: 'gey-2', name: 'Ahmad Syahir', number: 2, position: 'DEF', role: 'RB' },
      { id: 'gey-3', name: 'Rio Sakuma', number: 3, position: 'DEF', role: 'RCB' },
      { id: 'gey-4', name: 'Keito Hariya', number: 4, position: 'DEF', role: 'LCB' },
      { id: 'gey-5', name: 'Shakir Hamzah', number: 5, position: 'DEF', role: 'LB' },
      { id: 'gey-6', name: 'Takahiro Tezuka', number: 8, position: 'MID', role: 'RM' },
      { id: 'gey-7', name: 'Vincent Bezecourt', number: 10, position: 'MID', role: 'RCM' },
      { id: 'gey-8', name: 'Joshua Pereira', number: 6, position: 'MID', role: 'LCM' },
      { id: 'gey-9', name: 'Iqbal Hussain', number: 11, position: 'MID', role: 'LM' },
      { id: 'gey-10', name: 'Ryoya Taniguchi', number: 9, position: 'FWD', role: 'RS' },
      { id: 'gey-11', name: 'Zikos Chua', number: 19, position: 'FWD', role: 'LS' },
    ]
  },
  {
    id: 'opp-balestier',
    name: 'Balestier Khalsa',
    shortName: 'Tigers',
    primaryColor: '#DC2626',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=128&auto=format&fit=crop&q=80',
    stadium: 'Bishan Stadium',
    defaultFormation: 'form-352',
    tacticalStyle: 'High octane direct football, early crosses targeted into penalty box, physical aerial presence.',
    strengths: [
      'Physically imposing attacking unit creating chaos in the box',
      'Dangerous set-piece deliveries and long throw-in routines',
      'Direct channel balls exploiting backline hesitation'
    ],
    weaknesses: [
      'Back-three leaves severe half-space voids when wingbacks push high',
      'High concession rate from central ground combination play',
      'Susceptible to tactical fouls in dangerous free-kick zones'
    ],
    keyPlayers: ['Kodai Tanaka', 'Alen Kozar', 'Madhu Mohana'],
    players: [
      { id: 'bal-1', name: 'Hafiz Ahmad', number: 1, position: 'GK', role: 'GK' },
      { id: 'bal-2', name: 'Madhu Mohana', number: 4, position: 'DEF', role: 'RCB' },
      { id: 'bal-3', name: 'Jordan Emaviwe', number: 5, position: 'DEF', role: 'CB' },
      { id: 'bal-4', name: 'Syabil Hisham', number: 3, position: 'DEF', role: 'LCB' },
      { id: 'bal-5', name: 'Fudhil I\'yadh', number: 12, position: 'DEF', role: 'RWB' },
      { id: 'bal-6', name: 'Darren Teh', number: 11, position: 'DEF', role: 'LWB' },
      { id: 'bal-7', name: 'Alen Kozar', number: 6, position: 'MID', role: 'DM' },
      { id: 'bal-8', name: 'Ignatius Ang', number: 8, position: 'MID', role: 'RCM' },
      { id: 'bal-9', name: 'Masahiro Sugita', number: 10, position: 'MID', role: 'LCM' },
      { id: 'bal-10', name: 'Kodai Tanaka', number: 9, position: 'FWD', role: 'RS' },
      { id: 'bal-11', name: 'Ismail Salihovic', number: 17, position: 'FWD', role: 'LS' },
    ]
  },
  {
    id: 'opp-jurong',
    name: 'Jurong FC',
    shortName: 'Cobras',
    primaryColor: '#2563EB',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=128&auto=format&fit=crop&q=80',
    stadium: 'Jurong Stadium',
    defaultFormation: 'form-532',
    tacticalStyle: 'Ultra-compact defensive low block, rigid 5-man backline, rapid vertical counter-attacks.',
    strengths: [
      'Dense central congestion denying zone 14 shooting opportunities',
      'Tenacious tackling in defensive third',
      'Quick direct outlets into the attacking channels'
    ],
    weaknesses: [
      'Low possession share causes progressive stamina depletion in final 20 mins',
      'Limited creative variation when forced to chase the match',
      'Vulnerable to switched play overloading weak-side wingback'
    ],
    keyPlayers: ['Hariss Harun', 'Iqbal Hussain', 'Delwinder Singh'],
    players: [
      { id: 'jur-1', name: 'Bryan Quek', number: 1, position: 'GK', role: 'GK' },
      { id: 'jur-2', name: 'Delwinder Singh', number: 2, position: 'DEF', role: 'RCB' },
      { id: 'jur-3', name: 'Faizal Roslan', number: 3, position: 'DEF', role: 'CB' },
      { id: 'jur-4', name: 'Faritz Hameed', number: 4, position: 'DEF', role: 'LCB' },
      { id: 'jur-5', name: 'Zulqarnaen Suzliman', number: 12, position: 'DEF', role: 'RWB' },
      { id: 'jur-6', name: 'Nazrul Ahmad', number: 14, position: 'DEF', role: 'LWB' },
      { id: 'jur-7', name: 'Anumanthan Kumar', number: 6, position: 'MID', role: 'RCM' },
      { id: 'jur-8', name: 'Hami Syahin', number: 8, position: 'MID', role: 'CM' },
      { id: 'jur-9', name: 'Song Ui-young', number: 10, position: 'MID', role: 'LCM' },
      { id: 'jur-10', name: 'Iqbal Hussain', number: 9, position: 'FWD', role: 'RS' },
      { id: 'jur-11', name: 'Khairul Amri', number: 19, position: 'FWD', role: 'LS' },
    ]
  },
  {
    id: 'opp-tanjongpagar',
    name: 'Tanjong Pagar United',
    shortName: 'Jaguars',
    primaryColor: '#7C2D12',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=128&auto=format&fit=crop&q=80',
    stadium: 'Jurong East Stadium',
    defaultFormation: 'form-541',
    tacticalStyle: 'Pragmatic defensive resilience, heavy focus on physical challenges and set-piece executions.',
    strengths: [
      'Resolute defending deep inside the 18-yard box',
      'Threatening aerial aerials from offensive corners and free-kicks',
      'High discipline in maintaining defensive line shape'
    ],
    weaknesses: [
      'Struggles to retain possession under coordinated mid-pitch pressing',
      'Slow recovery speed when forced to retreat facing own goal',
      'Isolated forward struggles against structured rest-defense'
    ],
    keyPlayers: ['Salif Cisse', 'Mirko Sugic', 'Faizal Roslan'],
    players: [
      { id: 'tpu-1', name: 'Prathip Ekamparam', number: 1, position: 'GK', role: 'GK' },
      { id: 'tpu-2', name: 'Syed Akmal', number: 2, position: 'DEF', role: 'RWB' },
      { id: 'tpu-3', name: 'Faizal Roslan', number: 5, position: 'DEF', role: 'RCB' },
      { id: 'tpu-4', name: 'Pathy Malivela', number: 4, position: 'DEF', role: 'CB' },
      { id: 'tpu-5', name: 'Raihan Rahman', number: 3, position: 'DEF', role: 'LCB' },
      { id: 'tpu-6', name: 'Shahrin Saberin', number: 13, position: 'DEF', role: 'LWB' },
      { id: 'tpu-7', name: 'Mirko Sugic', number: 8, position: 'MID', role: 'RM' },
      { id: 'tpu-8', name: 'Blake Ricciuto', number: 6, position: 'MID', role: 'RCM' },
      { id: 'tpu-9', name: 'Fathullah Rahmat', number: 10, position: 'MID', role: 'LCM' },
      { id: 'tpu-10', name: 'Rezza Rezky', number: 11, position: 'MID', role: 'LM' },
      { id: 'tpu-11', name: 'Salif Cisse', number: 9, position: 'FWD', role: 'ST' },
    ]
  },
  {
    id: 'opp-younglions',
    name: 'Young Lions',
    shortName: 'Young Lions',
    primaryColor: '#DC2626',
    secondaryColor: '#1E293B',
    logoUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=128&auto=format&fit=crop&q=80',
    stadium: 'Jalan Besar Stadium',
    defaultFormation: 'form-433',
    tacticalStyle: 'High-energy pressing enthusiasm, enthusiastic build-up play from the back, young technical dynamism.',
    strengths: [
      'Fearless running and high physical intensity throughout the 90 minutes',
      'Speedy wide attackers willing to take defenders on in 1v1 situations',
      'Modern pressing triggers when opposing center-backs play back-passes'
    ],
    weaknesses: [
      'Prone to tactical game-management lapses under sustained pressure',
      'Frequent defensive disorganization during defensive set-piece delivery',
      'Can be trapped during build-up when pressed with numerical equality'
    ],
    keyPlayers: ['Kieran Teo', 'Kanwarpreet Singh', 'Fairuz Fazli'],
    players: [
      { id: 'yl-1', name: 'Aizil Yazid', number: 1, position: 'GK', role: 'GK' },
      { id: 'yl-2', name: 'Fairuz Fazli', number: 2, position: 'DEF', role: 'RB' },
      { id: 'yl-3', name: 'Kieran Teo', number: 4, position: 'DEF', role: 'RCB' },
      { id: 'yl-4', name: 'Aqil Yazid', number: 5, position: 'DEF', role: 'LCB' },
      { id: 'yl-5', name: 'Nur Adam Abdullah', number: 3, position: 'DEF', role: 'LB' },
      { id: 'yl-6', name: 'Kanwarpreet Singh', number: 6, position: 'MID', role: 'DM' },
      { id: 'yl-7', name: 'Harhys Stewart', number: 8, position: 'MID', role: 'RCM' },
      { id: 'yl-8', name: 'Rasaq Akeem', number: 10, position: 'MID', role: 'LCM' },
      { id: 'yl-9', name: 'Khairin Nadim', number: 7, position: 'FWD', role: 'RW' },
      { id: 'yl-10', name: 'Ilhan Fandi', number: 9, position: 'FWD', role: 'ST' },
      { id: 'yl-11', name: 'Farhan Zulkifli', number: 11, position: 'FWD', role: 'LW' },
    ]
  }
];

export const INITIAL_SWOT: SwotData = {
  ourStrengths: '• Highly fluid midfield rotation (Shahdan Sulaiman & Kristijan Krajcek) creating progressive half-space passing lanes.\n• Fast wide wing play with Farhan Zulkifli & Gabriel Quak delivering pinpoint early crosses.\n• Aggressive counter-pressing intensity immediately upon losing possession in the attacking third.',
  ourWeaknesses: '• Rest-defense vulnerability when both fullbacks push beyond the halfway line simultaneously.\n• Occasional spatial gap between double pivot and center-backs during fast opposition vertical transitions.\n• Inconsistent conversion rate from secondary attacking phases (second balls around the 18-yard box).',
  rivalStrengths: '• Rapid transition via inverted wingers targeting the inside channels and half-spaces.\n• Aerial prowess and second-ball contestation on offensive corner kicks.\n• High-line pressing traps forcing hurried back-passes to our goalkeeper.',
  rivalWeaknesses: '• Center-backs lack recovery acceleration when turned facing their own goal.\n• Disconnect between pressing front-three and retreating midfield bank leaves Zone 14 unattended.\n• High defensive line leaves significant space behind for direct chipped through-balls.'
};

export const INITIAL_TACTICAL_NOTES: TacticalNotes = {
  buildUpPhase: 'Circulate through the back-three / deep pivot (2+1 build-up shape). Draw the opponent forward press before releasing diagonal switch to our isolated weak-side winger.',
  inPossessionStructure: 'Establish a 3-2-4-1 attacking structure. Wingbacks hold maximum pitch width to stretch opponent fullbacks, while our two attacking midfielders occupy the left and right half-spaces.',
  outOfPossessionTransition: 'Immediate 5-second counter-press (Gegenpressing). The nearest two players collapse on the ball carrier, while the holding midfielder seals the central passing escape route.',
  pressingTriggers: 'Trigger high block pressing trap when opponent center-back receives ball with closed body shape or makes an inward square pass to their single defensive midfielder.',
  restDefense: 'Maintain a strict 3+2 rest-defense structure (both CBs + opposite fullback tucking inside + holding pivot) to eliminate central counter-attack pathways.',
  setPieces: 'Inswinging delivery targeting the near post flick-on for our trailing central defender. Form 3-man boundary outside the 18-yard box to win the second ball.'
};
