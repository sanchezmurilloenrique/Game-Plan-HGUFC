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

export interface ClubProfile {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logoUrl: string;
  localLogoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  stadium: string;
  league: string;
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
  phaseRef?: string;
}

export interface TacticalPhaseAnalysis {
  phaseKey: string;
  phaseNumber: number;
  phaseName: string;
  subtitle: string;
  geminiPerspective: {
    channelOccupation: string;
    lineHeightsAndCompactness: string;
    superiorities: string;
  };
  chatGptPerspective: {
    playerProfiles: string;
    requiredBehaviors: string;
  };
  claudePerspective: {
    strength: string;
    weakness: string;
    opportunity: string;
    threat: string;
  };
  directTacticalRecommendation: string;
}

export interface MultidimensionalReport {
  timestamp: string;
  engine: string;
  summary: string;
  phases: TacticalPhaseAnalysis[];
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

export interface CampogramToken {
  id: string; // e.g. "hgufc-p-1" or "opp-0" or "ball"
  type: 'hgufc' | 'opponent' | 'ball';
  originalId?: string;
  number: number;
  name: string;
  position: PlayerPosition | 'BALL';
  role?: string;
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
  teamColor?: string;
  textColor?: string;
}

export interface CampogramStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  tokens: CampogramToken[];
}

export interface CampogramPlay {
  id: string;
  title: string;
  description: string;
  category: 'Build-Up Phase' | 'Offensive Transition' | 'High Press & Block' | 'Set Pieces' | 'Custom Routine' | 'Salida de Balón' | 'Transición Ofensiva' | 'Presión y Bloque' | 'Balón Parado' | 'Personalizada';
  steps: CampogramStep[];
  speed?: number; // 0.5, 1, 1.5, 2
  loop?: boolean;
}

