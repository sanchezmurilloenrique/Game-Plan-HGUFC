import { Player, Formation, OpponentTeam, CampogramPlay, CampogramToken, CampogramStep } from '../types';

/**
 * Helper to build campogram tokens from HGUFC squad and Opponent team
 */
export function buildTokensFromSquadAndOpponent(
  hgufcPlayers: Player[],
  hgufcFormation: Formation,
  opponent: OpponentTeam,
  rivalFormation: Formation
): CampogramToken[] {
  const tokens: CampogramToken[] = [];

  // 1. HGUFC Starting XI tokens
  const starters = hgufcPlayers.filter(p => p.isStarting);
  const eligibleStarters = starters.length === 11 ? starters : hgufcPlayers.slice(0, 11);

  hgufcFormation.positions.forEach((pos, idx) => {
    const player = eligibleStarters[idx] || hgufcPlayers[idx] || {
      id: `hgufc-player-${idx + 1}`,
      name: `HGUFC #${idx + 1}`,
      number: idx + 1,
      position: pos.position,
      roleLabel: pos.role,
    };

    tokens.push({
      id: `hgufc-${player.id}`,
      type: 'hgufc',
      originalId: player.id,
      number: player.number || (idx + 1),
      name: player.name,
      position: player.position || pos.position,
      role: pos.role,
      x: player.pitchX !== undefined ? player.pitchX : pos.x,
      y: player.pitchY !== undefined ? player.pitchY : pos.y,
      teamColor: '#EA580C', // HGUFC Orange
      textColor: '#FFFFFF',
    });
  });

  // 2. Opponent tokens (Mirrored formation at top of pitch: y = 100 - pos.y)
  const rivalPlayers = opponent.players && opponent.players.length >= 11 
    ? opponent.players 
    : [];

  rivalFormation.positions.forEach((pos, idx) => {
    const oppPlayer = rivalPlayers[idx] || {
      id: `opp-${idx + 1}`,
      name: `Rival #${idx + 1}`,
      number: idx + 1,
      position: pos.position,
      role: pos.role,
    };

    const mirroredY = Math.round(100 - pos.y);

    tokens.push({
      id: `opp-${oppPlayer.id || idx}`,
      type: 'opponent',
      originalId: oppPlayer.id,
      number: oppPlayer.number || (idx + 1),
      name: oppPlayer.name,
      position: oppPlayer.position || pos.position,
      role: pos.role,
      x: oppPlayer.pitchX !== undefined ? oppPlayer.pitchX : pos.x,
      y: oppPlayer.pitchY !== undefined ? oppPlayer.pitchY : mirroredY,
      teamColor: opponent.primaryColor || '#002B49',
      textColor: opponent.secondaryColor || '#FFFFFF',
    });
  });

  // 3. Ball Token
  tokens.push({
    id: 'ball-1',
    type: 'ball',
    number: 0,
    name: 'Ball',
    position: 'BALL',
    role: 'Ball',
    x: 50,
    y: 88,
    teamColor: '#FFFFFF',
    textColor: '#000000',
  });

  return tokens;
}

/**
 * Pre-configured tactical animation play routines (in English with real squad names)
 */
export const DEFAULT_CAMPOGRAM_PLAYS: CampogramPlay[] = [
  {
    id: 'play-salida-433',
    title: '4-3-3 Build-Up vs High Press',
    description: 'Split center-backs, wide fullback progression, and third-man combination into attacking channel.',
    category: 'Build-Up Phase',
    speed: 1,
    loop: true,
    steps: [
      {
        id: 'step-salida-1',
        stepNumber: 1,
        title: 'Step 1: Deep Goal-Kick Shape & Initial Separation',
        description: 'Goalkeeper Zaiful Nizam controls from 6-yard box. Center-backs Aplin and Takayama split wide. Opponent presses in compact 4-4-2 block.',
        tokens: [
          // HGUFC (Defending bottom: y: 70-95)
          { id: 'hgufc-p-1', originalId: 'p-1', type: 'hgufc', number: 1, name: 'Zaiful Nizam', position: 'GK', role: 'GK', x: 50, y: 92, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-4', originalId: 'p-4', type: 'hgufc', number: 4, name: 'Nazrul Nazari', position: 'DEF', role: 'RB', x: 86, y: 76, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-5', originalId: 'p-5', type: 'hgufc', number: 5, name: 'Anders Aplin', position: 'DEF', role: 'RCB', x: 68, y: 84, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-7', originalId: 'p-7', type: 'hgufc', number: 6, name: 'Kazuma Takayama', position: 'DEF', role: 'LCB', x: 32, y: 84, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-6', originalId: 'p-6', type: 'hgufc', number: 3, name: 'Farhan Zulkifli', position: 'DEF', role: 'LB', x: 14, y: 76, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-14', originalId: 'p-14', type: 'hgufc', number: 8, name: 'Shahdan Sulaiman', position: 'MID', role: 'DM', x: 50, y: 68, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-15', originalId: 'p-15', type: 'hgufc', number: 10, name: 'Kristijan Krajcek', position: 'MID', role: 'RCM', x: 67, y: 55, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-17', originalId: 'p-17', type: 'hgufc', number: 14, name: 'Ismail Salihovic', position: 'MID', role: 'LCM', x: 33, y: 55, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-26', originalId: 'p-26', type: 'hgufc', number: 77, name: 'Gabriel Quak', position: 'FWD', role: 'RW', x: 84, y: 36, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-24', originalId: 'p-24', type: 'hgufc', number: 9, name: 'Dejan Racic', position: 'FWD', role: 'ST', x: 50, y: 28, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-28', originalId: 'p-28', type: 'hgufc', number: 21, name: 'Amir Zalani', position: 'FWD', role: 'LW', x: 16, y: 36, teamColor: '#EA580C', textColor: '#FFF' },
          // Rival Tokens (Real Sailors players)
          { id: 'opp-lcs-10', originalId: 'lcs-10', type: 'opponent', number: 9, name: 'Lennart Thy', position: 'FWD', role: 'ST', x: 44, y: 72, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-11', originalId: 'lcs-11', type: 'opponent', number: 7, name: 'Shawal Anuar', position: 'FWD', role: 'ST', x: 58, y: 72, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-9', originalId: 'lcs-9', type: 'opponent', number: 17, name: 'Maxime Lestienne', position: 'FWD', role: 'LM', x: 80, y: 64, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-7', originalId: 'lcs-7', type: 'opponent', number: 14, name: 'Hariss Harun', position: 'MID', role: 'RM', x: 20, y: 64, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-6', originalId: 'lcs-6', type: 'opponent', number: 6, name: 'Rui Pires', position: 'MID', role: 'CM', x: 42, y: 52, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-8', originalId: 'lcs-8', type: 'opponent', number: 10, name: 'Bart Ramselaar', position: 'MID', role: 'CM', x: 58, y: 52, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-2', originalId: 'lcs-2', type: 'opponent', number: 4, name: 'Lionel Tan', position: 'DEF', role: 'RB', x: 18, y: 32, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-3', originalId: 'lcs-3', type: 'opponent', number: 5, name: 'Bailey Wright', position: 'DEF', role: 'RCB', x: 38, y: 24, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-4', originalId: 'lcs-4', type: 'opponent', number: 2, name: 'Toni Datkovic', position: 'DEF', role: 'LCB', x: 62, y: 24, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-5', originalId: 'lcs-5', type: 'opponent', number: 22, name: 'Chris van Huizen', position: 'DEF', role: 'LB', x: 82, y: 32, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-1', originalId: 'lcs-1', type: 'opponent', number: 1, name: 'Izwan Mahbud', position: 'GK', role: 'GK', x: 50, y: 8, teamColor: '#002B49', textColor: '#FFF' },
          // Ball
          { id: 'ball-1', type: 'ball', number: 0, name: 'Ball', position: 'BALL', role: 'Ball', x: 50, y: 90, teamColor: '#FFFFFF', textColor: '#000' },
        ]
      },
      {
        id: 'step-salida-2',
        stepNumber: 2,
        title: 'Step 2: Lateral Delivery to Nazrul Nazari & Pressing Trigger',
        description: 'Goalkeeper hits low driven pass to right-back Nazrul Nazari. Opponent winger Lestienne jumps to press while Krajcek drops into right half-space.',
        tokens: [
          // HGUFC
          { id: 'hgufc-p-1', originalId: 'p-1', type: 'hgufc', number: 1, name: 'Zaiful Nizam', position: 'GK', role: 'GK', x: 50, y: 91, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-4', originalId: 'p-4', type: 'hgufc', number: 4, name: 'Nazrul Nazari', position: 'DEF', role: 'RB', x: 87, y: 68, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-5', originalId: 'p-5', type: 'hgufc', number: 5, name: 'Anders Aplin', position: 'DEF', role: 'RCB', x: 67, y: 80, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-7', originalId: 'p-7', type: 'hgufc', number: 6, name: 'Kazuma Takayama', position: 'DEF', role: 'LCB', x: 34, y: 82, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-6', originalId: 'p-6', type: 'hgufc', number: 3, name: 'Farhan Zulkifli', position: 'DEF', role: 'LB', x: 14, y: 72, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-14', originalId: 'p-14', type: 'hgufc', number: 8, name: 'Shahdan Sulaiman', position: 'MID', role: 'DM', x: 56, y: 64, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-15', originalId: 'p-15', type: 'hgufc', number: 10, name: 'Kristijan Krajcek', position: 'MID', role: 'RCM', x: 74, y: 52, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-17', originalId: 'p-17', type: 'hgufc', number: 14, name: 'Ismail Salihovic', position: 'MID', role: 'LCM', x: 36, y: 56, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-26', originalId: 'p-26', type: 'hgufc', number: 77, name: 'Gabriel Quak', position: 'FWD', role: 'RW', x: 86, y: 32, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-24', originalId: 'p-24', type: 'hgufc', number: 9, name: 'Dejan Racic', position: 'FWD', role: 'ST', x: 52, y: 25, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-28', originalId: 'p-28', type: 'hgufc', number: 21, name: 'Amir Zalani', position: 'FWD', role: 'LW', x: 17, y: 34, teamColor: '#EA580C', textColor: '#FFF' },
          // Rival
          { id: 'opp-lcs-10', originalId: 'lcs-10', type: 'opponent', number: 9, name: 'Lennart Thy', position: 'FWD', role: 'ST', x: 54, y: 76, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-11', originalId: 'lcs-11', type: 'opponent', number: 7, name: 'Shawal Anuar', position: 'FWD', role: 'ST', x: 64, y: 73, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-9', originalId: 'lcs-9', type: 'opponent', number: 17, name: 'Maxime Lestienne', position: 'FWD', role: 'LM', x: 85, y: 65, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-7', originalId: 'lcs-7', type: 'opponent', number: 14, name: 'Hariss Harun', position: 'MID', role: 'RM', x: 23, y: 61, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-6', originalId: 'lcs-6', type: 'opponent', number: 6, name: 'Rui Pires', position: 'MID', role: 'CM', x: 48, y: 53, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-8', originalId: 'lcs-8', type: 'opponent', number: 10, name: 'Bart Ramselaar', position: 'MID', role: 'CM', x: 68, y: 51, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-2', originalId: 'lcs-2', type: 'opponent', number: 4, name: 'Lionel Tan', position: 'DEF', role: 'RB', x: 19, y: 31, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-3', originalId: 'lcs-3', type: 'opponent', number: 5, name: 'Bailey Wright', position: 'DEF', role: 'RCB', x: 40, y: 23, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-4', originalId: 'lcs-4', type: 'opponent', number: 2, name: 'Toni Datkovic', position: 'DEF', role: 'LCB', x: 63, y: 23, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-5', originalId: 'lcs-5', type: 'opponent', number: 22, name: 'Chris van Huizen', position: 'DEF', role: 'LB', x: 84, y: 30, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-1', originalId: 'lcs-1', type: 'opponent', number: 1, name: 'Izwan Mahbud', position: 'GK', role: 'GK', x: 50, y: 8, teamColor: '#002B49', textColor: '#FFF' },
          // Ball at RB foot
          { id: 'ball-1', type: 'ball', number: 0, name: 'Ball', position: 'BALL', role: 'Ball', x: 87, y: 67, teamColor: '#FFFFFF', textColor: '#000' },
        ]
      },
      {
        id: 'step-salida-3',
        stepNumber: 3,
        title: 'Step 3: Central Triangulation & Penetration to Gabriel Quak',
        description: 'Nazrul plays into Krajcek who releases Gabriel Quak with a diagonal pass into deep flank behind the defensive line.',
        tokens: [
          // HGUFC
          { id: 'hgufc-p-1', originalId: 'p-1', type: 'hgufc', number: 1, name: 'Zaiful Nizam', position: 'GK', role: 'GK', x: 50, y: 89, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-4', originalId: 'p-4', type: 'hgufc', number: 4, name: 'Nazrul Nazari', position: 'DEF', role: 'RB', x: 86, y: 55, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-5', originalId: 'p-5', type: 'hgufc', number: 5, name: 'Anders Aplin', position: 'DEF', role: 'RCB', x: 64, y: 72, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-7', originalId: 'p-7', type: 'hgufc', number: 6, name: 'Kazuma Takayama', position: 'DEF', role: 'LCB', x: 36, y: 74, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-6', originalId: 'p-6', type: 'hgufc', number: 3, name: 'Farhan Zulkifli', position: 'DEF', role: 'LB', x: 15, y: 65, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-14', originalId: 'p-14', type: 'hgufc', number: 8, name: 'Shahdan Sulaiman', position: 'MID', role: 'DM', x: 63, y: 48, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-15', originalId: 'p-15', type: 'hgufc', number: 10, name: 'Kristijan Krajcek', position: 'MID', role: 'RCM', x: 73, y: 40, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-17', originalId: 'p-17', type: 'hgufc', number: 14, name: 'Ismail Salihovic', position: 'MID', role: 'LCM', x: 42, y: 46, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-26', originalId: 'p-26', type: 'hgufc', number: 77, name: 'Gabriel Quak', position: 'FWD', role: 'RW', x: 83, y: 19, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-24', originalId: 'p-24', type: 'hgufc', number: 9, name: 'Dejan Racic', position: 'FWD', role: 'ST', x: 53, y: 17, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-28', originalId: 'p-28', type: 'hgufc', number: 21, name: 'Amir Zalani', position: 'FWD', role: 'LW', x: 22, y: 22, teamColor: '#EA580C', textColor: '#FFF' },
          // Rival
          { id: 'opp-lcs-10', originalId: 'lcs-10', type: 'opponent', number: 9, name: 'Lennart Thy', position: 'FWD', role: 'ST', x: 60, y: 68, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-11', originalId: 'lcs-11', type: 'opponent', number: 7, name: 'Shawal Anuar', position: 'FWD', role: 'ST', x: 72, y: 62, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-9', originalId: 'lcs-9', type: 'opponent', number: 17, name: 'Maxime Lestienne', position: 'FWD', role: 'LM', x: 88, y: 52, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-7', originalId: 'lcs-7', type: 'opponent', number: 14, name: 'Hariss Harun', position: 'MID', role: 'RM', x: 28, y: 55, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-6', originalId: 'lcs-6', type: 'opponent', number: 6, name: 'Rui Pires', position: 'MID', role: 'CM', x: 52, y: 45, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-8', originalId: 'lcs-8', type: 'opponent', number: 10, name: 'Bart Ramselaar', position: 'MID', role: 'CM', x: 72, y: 43, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-2', originalId: 'lcs-2', type: 'opponent', number: 4, name: 'Lionel Tan', position: 'DEF', role: 'RB', x: 23, y: 25, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-3', originalId: 'lcs-3', type: 'opponent', number: 5, name: 'Bailey Wright', position: 'DEF', role: 'RCB', x: 44, y: 19, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-4', originalId: 'lcs-4', type: 'opponent', number: 2, name: 'Toni Datkovic', position: 'DEF', role: 'LCB', x: 62, y: 18, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-5', originalId: 'lcs-5', type: 'opponent', number: 22, name: 'Chris van Huizen', position: 'DEF', role: 'LB', x: 83, y: 22, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-1', originalId: 'lcs-1', type: 'opponent', number: 1, name: 'Izwan Mahbud', position: 'GK', role: 'GK', x: 50, y: 9, teamColor: '#002B49', textColor: '#FFF' },
          // Ball
          { id: 'ball-1', type: 'ball', number: 0, name: 'Ball', position: 'BALL', role: 'Ball', x: 83, y: 18, teamColor: '#FFFFFF', textColor: '#000' },
        ]
      }
    ]
  },
  {
    id: 'play-contraataque',
    title: 'Rapid Vertical Counter-Attack',
    description: 'Central turnover, instant through-ball into target forward, and dual diagonal attacking runs.',
    category: 'Offensive Transition',
    speed: 1.2,
    loop: true,
    steps: [
      {
        id: 'step-contra-1',
        stepNumber: 1,
        title: 'Step 1: Midfield Turnover by Ismail Salihovic',
        description: 'Ismail Salihovic intercepts ball in central circle with rival midfield unbalanced.',
        tokens: [
          { id: 'hgufc-p-1', originalId: 'p-1', type: 'hgufc', number: 1, name: 'Zaiful Nizam', position: 'GK', role: 'GK', x: 50, y: 88, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-5', originalId: 'p-5', type: 'hgufc', number: 5, name: 'Anders Aplin', position: 'DEF', role: 'RCB', x: 62, y: 75, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-7', originalId: 'p-7', type: 'hgufc', number: 6, name: 'Kazuma Takayama', position: 'DEF', role: 'LCB', x: 38, y: 75, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-4', originalId: 'p-4', type: 'hgufc', number: 4, name: 'Nazrul Nazari', position: 'DEF', role: 'RB', x: 80, y: 70, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-6', originalId: 'p-6', type: 'hgufc', number: 3, name: 'Farhan Zulkifli', position: 'DEF', role: 'LB', x: 20, y: 70, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-14', originalId: 'p-14', type: 'hgufc', number: 8, name: 'Shahdan Sulaiman', position: 'MID', role: 'DM', x: 48, y: 55, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-15', originalId: 'p-15', type: 'hgufc', number: 10, name: 'Kristijan Krajcek', position: 'MID', role: 'RCM', x: 62, y: 48, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-17', originalId: 'p-17', type: 'hgufc', number: 14, name: 'Ismail Salihovic', position: 'MID', role: 'LCM', x: 44, y: 47, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-26', originalId: 'p-26', type: 'hgufc', number: 77, name: 'Gabriel Quak', position: 'FWD', role: 'RW', x: 78, y: 38, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-24', originalId: 'p-24', type: 'hgufc', number: 9, name: 'Dejan Racic', position: 'FWD', role: 'ST', x: 50, y: 35, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-28', originalId: 'p-28', type: 'hgufc', number: 21, name: 'Amir Zalani', position: 'FWD', role: 'LW', x: 22, y: 38, teamColor: '#EA580C', textColor: '#FFF' },
          // Rival
          { id: 'opp-lcs-10', originalId: 'lcs-10', type: 'opponent', number: 9, name: 'Lennart Thy', position: 'FWD', role: 'ST', x: 48, y: 68, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-6', originalId: 'lcs-6', type: 'opponent', number: 6, name: 'Rui Pires', position: 'MID', role: 'CM', x: 46, y: 49, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-8', originalId: 'lcs-8', type: 'opponent', number: 10, name: 'Bart Ramselaar', position: 'MID', role: 'CM', x: 56, y: 47, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-3', originalId: 'lcs-3', type: 'opponent', number: 5, name: 'Bailey Wright', position: 'DEF', role: 'RCB', x: 42, y: 28, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-4', originalId: 'lcs-4', type: 'opponent', number: 2, name: 'Toni Datkovic', position: 'DEF', role: 'LCB', x: 60, y: 28, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-1', originalId: 'lcs-1', type: 'opponent', number: 1, name: 'Izwan Mahbud', position: 'GK', role: 'GK', x: 50, y: 8, teamColor: '#002B49', textColor: '#FFF' },
          // Ball
          { id: 'ball-1', type: 'ball', number: 0, name: 'Ball', position: 'BALL', role: 'Ball', x: 44, y: 47, teamColor: '#FFF', textColor: '#000' },
        ]
      },
      {
        id: 'step-contra-2',
        stepNumber: 2,
        title: 'Step 2: Penetrative Through-Ball into Dejan Racic',
        description: 'Salihovic clips ball into Racic as wingers Quak and Zalani sprint behind center-backs.',
        tokens: [
          { id: 'hgufc-p-1', originalId: 'p-1', type: 'hgufc', number: 1, name: 'Zaiful Nizam', position: 'GK', role: 'GK', x: 50, y: 85, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-5', originalId: 'p-5', type: 'hgufc', number: 5, name: 'Anders Aplin', position: 'DEF', role: 'RCB', x: 62, y: 70, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-7', originalId: 'p-7', type: 'hgufc', number: 6, name: 'Kazuma Takayama', position: 'DEF', role: 'LCB', x: 38, y: 70, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-4', originalId: 'p-4', type: 'hgufc', number: 4, name: 'Nazrul Nazari', position: 'DEF', role: 'RB', x: 80, y: 62, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-6', originalId: 'p-6', type: 'hgufc', number: 3, name: 'Farhan Zulkifli', position: 'DEF', role: 'LB', x: 20, y: 62, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-14', originalId: 'p-14', type: 'hgufc', number: 8, name: 'Shahdan Sulaiman', position: 'MID', role: 'DM', x: 50, y: 48, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-15', originalId: 'p-15', type: 'hgufc', number: 10, name: 'Kristijan Krajcek', position: 'MID', role: 'RCM', x: 65, y: 35, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-17', originalId: 'p-17', type: 'hgufc', number: 14, name: 'Ismail Salihovic', position: 'MID', role: 'LCM', x: 44, y: 42, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-26', originalId: 'p-26', type: 'hgufc', number: 77, name: 'Gabriel Quak', position: 'FWD', role: 'RW', x: 74, y: 22, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-24', originalId: 'p-24', type: 'hgufc', number: 9, name: 'Dejan Racic', position: 'FWD', role: 'ST', x: 52, y: 23, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-28', originalId: 'p-28', type: 'hgufc', number: 21, name: 'Amir Zalani', position: 'FWD', role: 'LW', x: 28, y: 22, teamColor: '#EA580C', textColor: '#FFF' },
          // Rival
          { id: 'opp-lcs-10', originalId: 'lcs-10', type: 'opponent', number: 9, name: 'Lennart Thy', position: 'FWD', role: 'ST', x: 48, y: 65, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-6', originalId: 'lcs-6', type: 'opponent', number: 6, name: 'Rui Pires', position: 'MID', role: 'CM', x: 47, y: 46, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-8', originalId: 'lcs-8', type: 'opponent', number: 10, name: 'Bart Ramselaar', position: 'MID', role: 'CM', x: 58, y: 44, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-3', originalId: 'lcs-3', type: 'opponent', number: 5, name: 'Bailey Wright', position: 'DEF', role: 'RCB', x: 44, y: 24, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-4', originalId: 'lcs-4', type: 'opponent', number: 2, name: 'Toni Datkovic', position: 'DEF', role: 'LCB', x: 58, y: 24, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-1', originalId: 'lcs-1', type: 'opponent', number: 1, name: 'Izwan Mahbud', position: 'GK', role: 'GK', x: 50, y: 9, teamColor: '#002B49', textColor: '#FFF' },
          // Ball at Dejan Racic
          { id: 'ball-1', type: 'ball', number: 0, name: 'Ball', position: 'BALL', role: 'Ball', x: 52, y: 23, teamColor: '#FFF', textColor: '#000' },
        ]
      },
      {
        id: 'step-contra-3',
        stepNumber: 3,
        title: 'Step 3: Cutback & Gabriel Quak 1v1 Goal Finish',
        description: 'Racic squares ball to incoming Gabriel Quak inside 18-yard box for low finish past goalkeeper Izwan Mahbud.',
        tokens: [
          { id: 'hgufc-p-1', originalId: 'p-1', type: 'hgufc', number: 1, name: 'Zaiful Nizam', position: 'GK', role: 'GK', x: 50, y: 85, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-5', originalId: 'p-5', type: 'hgufc', number: 5, name: 'Anders Aplin', position: 'DEF', role: 'RCB', x: 62, y: 65, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-7', originalId: 'p-7', type: 'hgufc', number: 6, name: 'Kazuma Takayama', position: 'DEF', role: 'LCB', x: 38, y: 65, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-4', originalId: 'p-4', type: 'hgufc', number: 4, name: 'Nazrul Nazari', position: 'DEF', role: 'RB', x: 78, y: 52, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-6', originalId: 'p-6', type: 'hgufc', number: 3, name: 'Farhan Zulkifli', position: 'DEF', role: 'LB', x: 22, y: 52, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-14', originalId: 'p-14', type: 'hgufc', number: 8, name: 'Shahdan Sulaiman', position: 'MID', role: 'DM', x: 50, y: 40, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-15', originalId: 'p-15', type: 'hgufc', number: 10, name: 'Kristijan Krajcek', position: 'MID', role: 'RCM', x: 62, y: 22, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-17', originalId: 'p-17', type: 'hgufc', number: 14, name: 'Ismail Salihovic', position: 'MID', role: 'LCM', x: 40, y: 28, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-26', originalId: 'p-26', type: 'hgufc', number: 77, name: 'Gabriel Quak', position: 'FWD', role: 'RW', x: 60, y: 12, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-24', originalId: 'p-24', type: 'hgufc', number: 9, name: 'Dejan Racic', position: 'FWD', role: 'ST', x: 48, y: 14, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-28', originalId: 'p-28', type: 'hgufc', number: 21, name: 'Amir Zalani', position: 'FWD', role: 'LW', x: 34, y: 14, teamColor: '#EA580C', textColor: '#FFF' },
          // Rival
          { id: 'opp-lcs-10', originalId: 'lcs-10', type: 'opponent', number: 9, name: 'Lennart Thy', position: 'FWD', role: 'ST', x: 48, y: 55, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-6', originalId: 'lcs-6', type: 'opponent', number: 6, name: 'Rui Pires', position: 'MID', role: 'CM', x: 48, y: 38, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-8', originalId: 'lcs-8', type: 'opponent', number: 10, name: 'Bart Ramselaar', position: 'MID', role: 'CM', x: 56, y: 36, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-3', originalId: 'lcs-3', type: 'opponent', number: 5, name: 'Bailey Wright', position: 'DEF', role: 'RCB', x: 44, y: 15, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-4', originalId: 'lcs-4', type: 'opponent', number: 2, name: 'Toni Datkovic', position: 'DEF', role: 'LCB', x: 55, y: 15, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-1', originalId: 'lcs-1', type: 'opponent', number: 1, name: 'Izwan Mahbud', position: 'GK', role: 'GK', x: 50, y: 8, teamColor: '#002B49', textColor: '#FFF' },
          // Ball at Gabriel Quak
          { id: 'ball-1', type: 'ball', number: 0, name: 'Ball', position: 'BALL', role: 'Ball', x: 57, y: 11, teamColor: '#FFF', textColor: '#000' },
        ]
      }
    ]
  },
  {
    id: 'play-presion-trampa',
    title: 'High Pressing Trap in Wide Corridor',
    description: 'Coordinated high press forcing opposition build-up toward the touchline, creating an immediate numerical superiority and turnover.',
    category: 'High Press & Block',
    speed: 1,
    loop: true,
    steps: [
      {
        id: 'step-trap-1',
        stepNumber: 1,
        title: 'Step 1: Directing Opposition Build-up to Flank',
        description: 'Dejan Racic curves pressing run to cut off back-pass to central defender, guiding opponent RCB toward touchline.',
        tokens: [
          { id: 'hgufc-p-1', originalId: 'p-1', type: 'hgufc', number: 1, name: 'Zaiful Nizam', position: 'GK', role: 'GK', x: 50, y: 88, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-5', originalId: 'p-5', type: 'hgufc', number: 5, name: 'Anders Aplin', position: 'DEF', role: 'RCB', x: 60, y: 65, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-7', originalId: 'p-7', type: 'hgufc', number: 6, name: 'Kazuma Takayama', position: 'DEF', role: 'LCB', x: 40, y: 65, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-4', originalId: 'p-4', type: 'hgufc', number: 4, name: 'Nazrul Nazari', position: 'DEF', role: 'RB', x: 80, y: 55, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-6', originalId: 'p-6', type: 'hgufc', number: 3, name: 'Farhan Zulkifli', position: 'DEF', role: 'LB', x: 20, y: 55, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-14', originalId: 'p-14', type: 'hgufc', number: 8, name: 'Shahdan Sulaiman', position: 'MID', role: 'DM', x: 50, y: 46, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-15', originalId: 'p-15', type: 'hgufc', number: 10, name: 'Kristijan Krajcek', position: 'MID', role: 'RCM', x: 62, y: 38, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-17', originalId: 'p-17', type: 'hgufc', number: 14, name: 'Ismail Salihovic', position: 'MID', role: 'LCM', x: 38, y: 38, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-26', originalId: 'p-26', type: 'hgufc', number: 77, name: 'Gabriel Quak', position: 'FWD', role: 'RW', x: 74, y: 26, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-24', originalId: 'p-24', type: 'hgufc', number: 9, name: 'Dejan Racic', position: 'FWD', role: 'ST', x: 46, y: 22, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-28', originalId: 'p-28', type: 'hgufc', number: 21, name: 'Amir Zalani', position: 'FWD', role: 'LW', x: 26, y: 28, teamColor: '#EA580C', textColor: '#FFF' },
          // Rival
          { id: 'opp-lcs-1', originalId: 'lcs-1', type: 'opponent', number: 1, name: 'Izwan Mahbud', position: 'GK', role: 'GK', x: 50, y: 8, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-3', originalId: 'lcs-3', type: 'opponent', number: 5, name: 'Bailey Wright', position: 'DEF', role: 'RCB', x: 34, y: 16, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-4', originalId: 'lcs-4', type: 'opponent', number: 2, name: 'Toni Datkovic', position: 'DEF', role: 'LCB', x: 66, y: 16, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-2', originalId: 'lcs-2', type: 'opponent', number: 4, name: 'Lionel Tan', position: 'DEF', role: 'RB', x: 18, y: 24, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-5', originalId: 'lcs-5', type: 'opponent', number: 22, name: 'Chris van Huizen', position: 'DEF', role: 'LB', x: 82, y: 24, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-6', originalId: 'lcs-6', type: 'opponent', number: 6, name: 'Rui Pires', position: 'MID', role: 'DM', x: 50, y: 25, teamColor: '#002B49', textColor: '#FFF' },
          // Ball at Rival RCB
          { id: 'ball-1', type: 'ball', number: 0, name: 'Ball', position: 'BALL', role: 'Ball', x: 34, y: 16, teamColor: '#FFF', textColor: '#000' },
        ]
      },
      {
        id: 'step-trap-2',
        stepNumber: 2,
        title: 'Step 2: Swarming Trap & Passing Lane Denial',
        description: 'Amir Zalani locks the wide corridor while Salihovic jumps onto the pivot to intercept escape passes.',
        tokens: [
          { id: 'hgufc-p-1', originalId: 'p-1', type: 'hgufc', number: 1, name: 'Zaiful Nizam', position: 'GK', role: 'GK', x: 50, y: 88, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-5', originalId: 'p-5', type: 'hgufc', number: 5, name: 'Anders Aplin', position: 'DEF', role: 'RCB', x: 58, y: 60, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-7', originalId: 'p-7', type: 'hgufc', number: 6, name: 'Kazuma Takayama', position: 'DEF', role: 'LCB', x: 38, y: 55, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-4', originalId: 'p-4', type: 'hgufc', number: 4, name: 'Nazrul Nazari', position: 'DEF', role: 'RB', x: 75, y: 50, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-6', originalId: 'p-6', type: 'hgufc', number: 3, name: 'Farhan Zulkifli', position: 'DEF', role: 'LB', x: 22, y: 44, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-14', originalId: 'p-14', type: 'hgufc', number: 8, name: 'Shahdan Sulaiman', position: 'MID', role: 'DM', x: 46, y: 38, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-15', originalId: 'p-15', type: 'hgufc', number: 10, name: 'Kristijan Krajcek', position: 'MID', role: 'RCM', x: 56, y: 30, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-17', originalId: 'p-17', type: 'hgufc', number: 14, name: 'Ismail Salihovic', position: 'MID', role: 'LCM', x: 35, y: 24, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-26', originalId: 'p-26', type: 'hgufc', number: 77, name: 'Gabriel Quak', position: 'FWD', role: 'RW', x: 68, y: 20, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-24', originalId: 'p-24', type: 'hgufc', number: 9, name: 'Dejan Racic', position: 'FWD', role: 'ST', x: 32, y: 17, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-28', originalId: 'p-28', type: 'hgufc', number: 21, name: 'Amir Zalani', position: 'FWD', role: 'LW', x: 20, y: 22, teamColor: '#EA580C', textColor: '#FFF' },
          // Rival
          { id: 'opp-lcs-1', originalId: 'lcs-1', type: 'opponent', number: 1, name: 'Izwan Mahbud', position: 'GK', role: 'GK', x: 50, y: 8, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-3', originalId: 'lcs-3', type: 'opponent', number: 5, name: 'Bailey Wright', position: 'DEF', role: 'RCB', x: 26, y: 20, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-4', originalId: 'lcs-4', type: 'opponent', number: 2, name: 'Toni Datkovic', position: 'DEF', role: 'LCB', x: 66, y: 18, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-2', originalId: 'lcs-2', type: 'opponent', number: 4, name: 'Lionel Tan', position: 'DEF', role: 'RB', x: 14, y: 28, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-5', originalId: 'lcs-5', type: 'opponent', number: 22, name: 'Chris van Huizen', position: 'DEF', role: 'LB', x: 82, y: 24, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-6', originalId: 'lcs-6', type: 'opponent', number: 6, name: 'Rui Pires', position: 'MID', role: 'DM', x: 42, y: 26, teamColor: '#002B49', textColor: '#FFF' },
          // Ball trapped near touchline
          { id: 'ball-1', type: 'ball', number: 0, name: 'Ball', position: 'BALL', role: 'Ball', x: 23, y: 22, teamColor: '#FFF', textColor: '#000' },
        ]
      },
      {
        id: 'step-trap-3',
        stepNumber: 3,
        title: 'Step 3: High Turnover & Immediate Shot on Goal',
        description: 'Amir Zalani dispossesses opponent, squares rapidly to Dejan Racic for an immediate finish into the top corner.',
        tokens: [
          { id: 'hgufc-p-1', originalId: 'p-1', type: 'hgufc', number: 1, name: 'Zaiful Nizam', position: 'GK', role: 'GK', x: 50, y: 88, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-5', originalId: 'p-5', type: 'hgufc', number: 5, name: 'Anders Aplin', position: 'DEF', role: 'RCB', x: 58, y: 55, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-7', originalId: 'p-7', type: 'hgufc', number: 6, name: 'Kazuma Takayama', position: 'DEF', role: 'LCB', x: 38, y: 52, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-4', originalId: 'p-4', type: 'hgufc', number: 4, name: 'Nazrul Nazari', position: 'DEF', role: 'RB', x: 75, y: 45, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-6', originalId: 'p-6', type: 'hgufc', number: 3, name: 'Farhan Zulkifli', position: 'DEF', role: 'LB', x: 22, y: 38, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-14', originalId: 'p-14', type: 'hgufc', number: 8, name: 'Shahdan Sulaiman', position: 'MID', role: 'DM', x: 46, y: 34, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-15', originalId: 'p-15', type: 'hgufc', number: 10, name: 'Kristijan Krajcek', position: 'MID', role: 'RCM', x: 58, y: 24, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-17', originalId: 'p-17', type: 'hgufc', number: 14, name: 'Ismail Salihovic', position: 'MID', role: 'LCM', x: 36, y: 19, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-26', originalId: 'p-26', type: 'hgufc', number: 77, name: 'Gabriel Quak', position: 'FWD', role: 'RW', x: 62, y: 14, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-24', originalId: 'p-24', type: 'hgufc', number: 9, name: 'Dejan Racic', position: 'FWD', role: 'ST', x: 47, y: 13, teamColor: '#EA580C', textColor: '#FFF' },
          { id: 'hgufc-p-28', originalId: 'p-28', type: 'hgufc', number: 21, name: 'Amir Zalani', position: 'FWD', role: 'LW', x: 32, y: 16, teamColor: '#EA580C', textColor: '#FFF' },
          // Rival
          { id: 'opp-lcs-1', originalId: 'lcs-1', type: 'opponent', number: 1, name: 'Izwan Mahbud', position: 'GK', role: 'GK', x: 50, y: 8, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-3', originalId: 'lcs-3', type: 'opponent', number: 5, name: 'Bailey Wright', position: 'DEF', role: 'RCB', x: 32, y: 19, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-4', originalId: 'lcs-4', type: 'opponent', number: 2, name: 'Toni Datkovic', position: 'DEF', role: 'LCB', x: 60, y: 17, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-2', originalId: 'lcs-2', type: 'opponent', number: 4, name: 'Lionel Tan', position: 'DEF', role: 'RB', x: 18, y: 26, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-5', originalId: 'lcs-5', type: 'opponent', number: 22, name: 'Chris van Huizen', position: 'DEF', role: 'LB', x: 78, y: 22, teamColor: '#002B49', textColor: '#FFF' },
          { id: 'opp-lcs-6', originalId: 'lcs-6', type: 'opponent', number: 6, name: 'Rui Pires', position: 'MID', role: 'DM', x: 42, y: 24, teamColor: '#002B49', textColor: '#FFF' },
          // Ball at Dejan Racic shooting
          { id: 'ball-1', type: 'ball', number: 0, name: 'Ball', position: 'BALL', role: 'Ball', x: 48, y: 11, teamColor: '#FFF', textColor: '#000' },
        ]
      }
    ]
  }
];

