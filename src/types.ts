export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: string;
  name: string;
  number: number;
  position: PlayerPosition;
  isStarting?: boolean;
  pitchX?: number; // 0 - 100 percentage
  pitchY?: number; // 0 - 100 percentage
  roleLabel?: string; // e.g. "CB (L)", "Pivot", "Winger"
  preferredFoot?: 'Left' | 'Right' | 'Both';
  notes?: string;
}

export interface FormationPosition {
  role: string;
  position: PlayerPosition;
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
}

export interface Formation {
  id: string;
  name: string;
  category: '4-at-back' | '3-at-back' | '5-at-back' | 'custom';
  positions: FormationPosition[]; // 11 positions
  tacticalDescription?: string;
}

export interface OpponentPlayer {
  id: string;
  name: string;
  number: number;
  position: PlayerPosition;
  role: string;
  pitchX?: number;
  pitchY?: number;
}

export interface OpponentTeam {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  stadium: string;
  defaultFormation: string;
  tacticalStyle: string;
  strengths: string[];
  weaknesses: string[];
  keyPlayers: string[];
  logoUrl?: string;
  players?: OpponentPlayer[];
}

export interface SwotData {
  ourStrengths: string;
  ourWeaknesses: string;
  rivalStrengths: string;
  rivalWeaknesses: string;
}

export interface GeneratedInsight {
  id: string;
  type: 'opportunity' | 'threat';
  category: 'Spatial / Half-Spaces' | 'Numerical Overload' | 'Pressing Traps' | 'Defensive Transition' | 'Set Pieces' | 'Tactical Phase';
  title: string;
  description: string;
  actionableDirective: string;
}

export interface TacticalNotes {
  buildUpPhase: string;
  inPossessionStructure: string;
  outOfPossessionTransition: string;
  pressingTriggers: string;
  restDefense: string;
  setPieces: string;
}

export interface MatchPlan {
  matchTitle: string;
  matchDate: string;
  venue: string;
  competition: string;
  selectedOpponentId: string;
  hgufcFormationId: string;
  rivalFormationId: string;
  tacticalNotes: TacticalNotes;
  swot: SwotData;
  showPitchZones: boolean;
  showOpponentTokens: boolean;
  activePitchTool: 'select' | 'arrow' | 'zone';
}
