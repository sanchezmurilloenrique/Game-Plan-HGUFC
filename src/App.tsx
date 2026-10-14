import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  INITIAL_PLAYERS, 
  INITIAL_FORMATIONS, 
  INITIAL_OPPONENTS, 
  INITIAL_SWOT, 
  INITIAL_TACTICAL_NOTES 
} from './data/initialData';
import { 
  Player, 
  Formation, 
  OpponentTeam, 
  MatchPlan, 
  SwotData, 
  TacticalNotes, 
  GeneratedInsight,
  OpponentPlayer,
  MultidimensionalReport,
  CampogramPlay
} from './types';
import { DEFAULT_CAMPOGRAM_PLAYS } from './data/campogramPresets';
import { 
  generateTacticalInsights, 
  generateMultidimensionalReport 
} from './services/tacticalEngine';
import { exportMatchPlanToPdf } from './services/pdfExport';
import { 
  persistAllData, 
  loadAllDataFromCloud, 
  subscribeToRemoteChanges, 
  checkAndIngestUrlSyncToken, 
  isSupabaseConfigured, 
  generateShareableSyncUrl 
} from './services/supabaseService';

import { Header } from './components/Header';
import { TacticalPitch } from './components/TacticalPitch';
import { SquadRoster } from './components/SquadRoster';
import { SwotAnalysis } from './components/SwotAnalysis';
import { TacticalInstructions } from './components/TacticalInstructions';
import { PlayerModal } from './components/PlayerModal';
import { FormationModal } from './components/FormationModal';
import { OpponentModal } from './components/OpponentModal';
import { RivalCustomizerModal } from './components/RivalCustomizerModal';
import { SupabaseSqlModal } from './components/SupabaseSqlModal';
import { PrintReportView } from './components/PrintReportView';
import { TacticalCampogramAnimator } from './components/TacticalCampogramAnimator';

import { 
  LayoutDashboard, 
  Play,
  Target, 
  BookOpen, 
  FileCheck, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Download,
  Printer
} from 'lucide-react';

const STORAGE_PLAYERS = 'hgufc_squad_v1';
const STORAGE_FORMATIONS = 'hgufc_formations_v1';
const STORAGE_OPPONENTS = 'hgufc_opponents_v1';
const STORAGE_MATCHPLAN = 'hgufc_matchplan_v1';

export default function App() {
  // 1. Core State
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLAYERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PLAYERS;
  });

  const [hgufcFormations, setHgufcFormations] = useState<Formation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FORMATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FORMATIONS;
  });

  const rivalFormations = INITIAL_FORMATIONS;

  const [opponents, setOpponents] = useState<OpponentTeam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_OPPONENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_OPPONENTS;
  });

  const [matchPlan, setMatchPlan] = useState<MatchPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MATCHPLAN);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Default half-spaces to unchecked as requested
        return {
          ...parsed,
          showPitchZones: false,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      matchTitle: 'Singapore Premier League Matchday',
      matchDate: new Date().toISOString().split('T')[0],
      venue: 'Jalan Besar Stadium',
      competition: 'Singapore Premier League (SPL)',
      selectedOpponentId: INITIAL_OPPONENTS[0].id,
      hgufcFormationId: 'form-433',
      rivalFormationId: 'form-433',
      tacticalNotes: INITIAL_TACTICAL_NOTES,
      swot: INITIAL_SWOT,
      showPitchZones: false,
      showOpponentTokens: true,
      activePitchTool: 'select',
    };
  });

  const [campogramPlays, setCampogramPlays] = useState<CampogramPlay[]>(() => {
    try {
      const saved = localStorage.getItem('hgufc_campogram_plays_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CAMPOGRAM_PLAYS;
  });

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'board' | 'campogram' | 'swot' | 'instructions' | 'preview'>('board');
  const [activePitchView, setActivePitchView] = useState<'both' | 'hgufc' | 'opponent'>('both');
  const [showPitchZones, setShowPitchZones] = useState<boolean>(false);
  const [isPitchExpanded, setIsPitchExpanded] = useState<boolean>(false);

  // Modals state
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [isFormationModalOpen, setIsFormationModalOpen] = useState(false);
  const [isOpponentModalOpen, setIsOpponentModalOpen] = useState(false);
  const [isRivalCustomizerOpen, setIsRivalCustomizerOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Cloud & Save State
  const [isSaving, setIsSaving] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() => isSupabaseConfigured());
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    const saved = localStorage.getItem('hgufc_last_saved');
    if (saved) {
      try {
        return new Date(saved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch {
        return '';
      }
    }
    return '';
  });

  // PDF Export state
  const [isExporting, setIsExporting] = useState(false);
  const [readyPdf, setReadyPdf] = useState<{ blobUrl: string; filename: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Show Toast
  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Multi-Device Cloud Synchronization Effect (Runs on Startup & Realtime)
  useEffect(() => {
    let isMounted = true;
    // 1. Ingest any sync token if opened from a shareable device sync link (?supa_sync=...)
    const fromUrl = checkAndIngestUrlSyncToken();
    const configured = isSupabaseConfigured();
    setIsCloudConnected(configured);

    if (fromUrl) {
      showToast('¡Enlace de sincronización detectado! Conectando a Supabase...', 'info');
    }

    // 2. If Supabase is configured, pull the latest game plan from the cloud
    if (configured) {
      setIsSyncingCloud(true);
      loadAllDataFromCloud()
        .then((res) => {
          if (!isMounted) return;
          if (res.success && res.data) {
            const cloud = res.data;
            if (cloud.players && cloud.players.length > 0) setPlayers(cloud.players);
            if (cloud.formations && cloud.formations.length > 0) setHgufcFormations(cloud.formations);
            if (cloud.opponents && cloud.opponents.length > 0) setOpponents(cloud.opponents);
            if (cloud.matchPlan) {
              setMatchPlan(prev => ({
                ...prev,
                ...cloud.matchPlan,
                showPitchZones: false, // maintain half-spaces default
              }));
            }
            if (cloud.campogramPlays && cloud.campogramPlays.length > 0) {
              setCampogramPlays(cloud.campogramPlays);
            }
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setLastSavedTime(time);
            showToast('Tactical plan & plays loaded and synced from cloud!', 'success');
          }
        })
        .catch((err) => {
          console.warn('Initial cloud sync notice:', err);
        })
        .finally(() => {
          if (isMounted) setIsSyncingCloud(false);
        });

      // 3. Realtime subscription: sync instantly if another device saves
      const unsubscribe = subscribeToRemoteChanges((remoteData) => {
        if (!isMounted) return;
        if (remoteData) {
          if (remoteData.players && remoteData.players.length > 0) setPlayers(remoteData.players);
          if (remoteData.formations && remoteData.formations.length > 0) setHgufcFormations(remoteData.formations);
          if (remoteData.opponents && remoteData.opponents.length > 0) setOpponents(remoteData.opponents);
          if (remoteData.matchPlan) {
            setMatchPlan(prev => ({
              ...prev,
              ...remoteData.matchPlan,
              showPitchZones: false,
            }));
          }
          if (remoteData.campogramPlays && remoteData.campogramPlays.length > 0) {
            setCampogramPlays(remoteData.campogramPlays);
          }
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSavedTime(time);
          showToast('Tactical plan updated in real time from another device', 'info');
        }
      });

      return () => {
        isMounted = false;
        if (unsubscribe) unsubscribe();
      };
    }
  }, [showToast]);

  // Save All Changes (Supabase + LocalStorage)
  const handleSaveAll = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await persistAllData({
        players,
        matchPlan,
        formations: hgufcFormations,
        opponents,
        campogramPlays,
      });
      setLastSavedTime(res.timestamp);
      setIsCloudConnected(isSupabaseConfigured());
      showToast(res.message, res.savedToSupabase ? 'success' : 'info');
    } catch (err: any) {
      showToast(`Error saving changes: ${err?.message || 'Check storage connection'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [players, matchPlan, hgufcFormations, opponents, campogramPlays, showToast]);

  // Copy shareable link for mobile / other devices
  const handleCopySyncLink = useCallback(() => {
    const link = generateShareableSyncUrl();
    if (link) {
      navigator.clipboard.writeText(link);
      showToast('¡Enlace de sincronización copiado! Ábrelo en tu móvil o tablet', 'success');
    } else {
      setIsSupabaseModalOpen(true);
      showToast('Configura Supabase para generar el enlace de sincronización', 'info');
    }
  }, [showToast]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PLAYERS, JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem(STORAGE_FORMATIONS, JSON.stringify(hgufcFormations));
  }, [hgufcFormations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_OPPONENTS, JSON.stringify(opponents));
  }, [opponents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_MATCHPLAN, JSON.stringify(matchPlan));
  }, [matchPlan]);

  // Active Formation and Opponent objects
  const currentHgufcFormation = useMemo(() => {
    return hgufcFormations.find(f => f.id === matchPlan.hgufcFormationId) || hgufcFormations[0];
  }, [hgufcFormations, matchPlan.hgufcFormationId]);

  const currentRivalFormation = useMemo(() => {
    return rivalFormations.find(f => f.id === matchPlan.rivalFormationId) || rivalFormations[0];
  }, [rivalFormations, matchPlan.rivalFormationId]);

  const currentOpponent = useMemo(() => {
    return opponents.find(o => o.id === matchPlan.selectedOpponentId) || opponents[0];
  }, [opponents, matchPlan.selectedOpponentId]);

  const [recalculateNonce, setRecalculateNonce] = useState(0);

  // Multidimensional Tactical Analysis (10 Phases of Play: Gemini + ChatGPT + Claude)
  const multidimensionalReport: MultidimensionalReport = useMemo(() => {
    return generateMultidimensionalReport(
      currentHgufcFormation,
      currentRivalFormation,
      currentOpponent,
      matchPlan.swot,
      players
    );
  }, [currentHgufcFormation, currentRivalFormation, currentOpponent, matchPlan.swot, players, recalculateNonce]);

  // Automated Threats & Opportunities Insights Engine
  const tacticalInsights: GeneratedInsight[] = useMemo(() => {
    return generateTacticalInsights(
      currentHgufcFormation,
      currentRivalFormation,
      currentOpponent,
      matchPlan.swot,
      players
    );
  }, [currentHgufcFormation, currentRivalFormation, currentOpponent, matchPlan.swot, players, recalculateNonce]);

  // Auto-Assign 11 Starting Players to Formation Positions
  const assignStartingXIToFormation = useCallback((formation: Formation) => {
    setPlayers(prevPlayers => {
      // Clear current pitch coords
      const unassigned: Player[] = prevPlayers.map(p => ({
        ...p,
        pitchX: undefined,
        pitchY: undefined,
        roleLabel: undefined,
      }));

      const newPlayers: Player[] = [...unassigned];

      // Step 1: Assign GK (1 spot)
      const gkPos = formation.positions.find(p => p.position === 'GK') || formation.positions[0];
      const availableGK = newPlayers.find(p => p.position === 'GK');
      if (availableGK) {
        availableGK.pitchX = gkPos.x;
        availableGK.pitchY = gkPos.y;
        availableGK.roleLabel = gkPos.role;
      }

      // Step 2: Assign remaining 10 outfield spots
      const outfieldFormationSlots = formation.positions.filter(p => p.position !== 'GK');
      
      outfieldFormationSlots.forEach(slot => {
        // Try matching position (DEF / MID / FWD)
        let candidate = newPlayers.find(p => p.position === slot.position && p.pitchX === undefined);
        // Fallback to any available outfield player
        if (!candidate) {
          candidate = newPlayers.find(p => p.position !== 'GK' && p.pitchX === undefined);
        }
        if (candidate) {
          candidate.pitchX = slot.x;
          candidate.pitchY = slot.y;
          candidate.roleLabel = slot.role;
        }
      });

      return newPlayers;
    });
    showToast(`Starting XI assigned to ${formation.name}`, 'success');
  }, [showToast]);

  // Initialize pitch positions on initial mount if none on pitch
  useEffect(() => {
    const hasAnyOnPitch = players.some(p => p.pitchX !== undefined && p.pitchY !== undefined);
    if (!hasAnyOnPitch && currentHgufcFormation) {
      assignStartingXIToFormation(currentHgufcFormation);
    }
  }, []);

  // When HGUFC formation changes, update coordinates of current on-pitch players
  const handleUpdateHgufcFormation = (formationId: string) => {
    const nextFormation = hgufcFormations.find(f => f.id === formationId);
    if (!nextFormation) return;

    setMatchPlan(prev => ({ ...prev, hgufcFormationId: formationId }));
    
    // Smoothly shift on-pitch players to the new positions
    setPlayers(prev => {
      const onPitch = prev.filter(p => p.pitchX !== undefined && p.pitchY !== undefined);
      if (onPitch.length === 0) return prev;

      const updated = prev.map(p => ({ ...p }));
      
      // Separate GK and outfields
      const gkPlayer = updated.find(p => p.position === 'GK' && p.pitchX !== undefined);
      const gkSlot = nextFormation.positions.find(slot => slot.position === 'GK');
      if (gkPlayer && gkSlot) {
        gkPlayer.pitchX = gkSlot.x;
        gkPlayer.pitchY = gkSlot.y;
        gkPlayer.roleLabel = gkSlot.role;
      }

      const outfieldPlayers = updated.filter(p => p.position !== 'GK' && p.pitchX !== undefined);
      const outfieldSlots = nextFormation.positions.filter(slot => slot.position !== 'GK');

      outfieldPlayers.forEach((p, idx) => {
        if (outfieldSlots[idx]) {
          p.pitchX = outfieldSlots[idx].x;
          p.pitchY = outfieldSlots[idx].y;
          p.roleLabel = outfieldSlots[idx].role;
        }
      });

      return updated;
    });

    showToast(`Formation shifted to ${nextFormation.name}`, 'info');
  };

  // Place single player on pitch
  const handlePlacePlayerOnPitch = (player: Player) => {
    // Find first vacant slot in current formation or place in center
    const onPitchCount = players.filter(p => p.pitchX !== undefined && p.pitchY !== undefined).length;
    if (onPitchCount >= 11) {
      showToast('Maximum 11 players on pitch. Bench a player first.', 'error');
      return;
    }

    setPlayers(prev => prev.map(p => {
      if (p.id === player.id) {
        const defaultSlot = currentHgufcFormation.positions[onPitchCount] || { x: 50, y: 50, role: player.position };
        return {
          ...p,
          pitchX: defaultSlot.x,
          pitchY: defaultSlot.y,
          roleLabel: defaultSlot.role,
        };
      }
      return p;
    }));
    showToast(`${player.name} deployed onto pitch`, 'success');
  };

  // Remove single player from pitch
  const handleRemovePlayerFromPitch = (playerId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, pitchX: undefined, pitchY: undefined, roleLabel: undefined };
      }
      return p;
    }));
  };

  // Drag position update
  const handleUpdatePlayerPosition = (playerId: string, x: number, y: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, pitchX: x, pitchY: y };
      }
      return p;
    }));
  };

  // CRUD Handlers
  const handleSavePlayer = (player: Player) => {
    setPlayers(prev => {
      const idx = prev.findIndex(p => p.id === player.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = player;
        return next;
      }
      return [player, ...prev];
    });
    showToast(`Player ${player.name} saved`, 'success');
  };

  const handleDeletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    showToast('Player deleted from squad', 'info');
  };

  const handleAddFormation = (formation: Formation) => {
    setHgufcFormations(prev => [...prev, formation]);
    setMatchPlan(prev => ({ ...prev, hgufcFormationId: formation.id }));
    showToast(`Custom formation ${formation.name} added`, 'success');
  };

  const handleDeleteFormation = (formationId: string) => {
    setHgufcFormations(prev => prev.filter(f => f.id !== formationId));
    if (matchPlan.hgufcFormationId === formationId) {
      setMatchPlan(prev => ({ ...prev, hgufcFormationId: 'form-433' }));
    }
    showToast('Formation deleted', 'info');
  };

  const handleAddOpponent = (opponent: OpponentTeam) => {
    setOpponents(prev => [...prev, opponent]);
    setMatchPlan(prev => ({ ...prev, selectedOpponentId: opponent.id }));
    showToast(`Opponent ${opponent.name} registered`, 'success');
  };

  const handleUpdateOpponent = (opponent: OpponentTeam) => {
    setOpponents(prev => prev.map(o => o.id === opponent.id ? opponent : o));
    showToast(`Opponent ${opponent.name} updated`, 'success');
  };

  const handleDeleteOpponent = (opponentId: string) => {
    setOpponents(prev => prev.filter(o => o.id !== opponentId));
    if (matchPlan.selectedOpponentId === opponentId) {
      setMatchPlan(prev => ({ ...prev, selectedOpponentId: INITIAL_OPPONENTS[0].id }));
    }
    showToast('Opponent removed', 'info');
  };

  // Customization of Rival Team (Color, Crest, Names, Dorsals)
  const handleUpdateOpponentColor = (color: string) => {
    setOpponents(prev => prev.map(o => o.id === matchPlan.selectedOpponentId ? { ...o, primaryColor: color } : o));
    showToast(`Rival kit color updated to ${color}`, 'info');
  };

  const handleUpdateRivalPlayer = (index: number, updated: Partial<OpponentPlayer>) => {
    setOpponents(prev => prev.map(opp => {
      if (opp.id === matchPlan.selectedOpponentId) {
        const defaultPositions = rivalFormations.find(f => f.id === matchPlan.rivalFormationId)?.positions || [];
        const playersList = opp.players && opp.players.length === 11 
          ? [...opp.players] 
          : Array.from({ length: 11 }, (_, i) => ({
              id: `rival-${opp.id}-${i}`,
              name: `${opp.shortName} Player #${i + 1}`,
              number: i + 1,
              position: defaultPositions[i]?.position || 'MID',
              role: defaultPositions[i]?.role || 'MID',
            }));
        if (playersList[index]) {
          playersList[index] = { ...playersList[index], ...updated };
        }
        return { ...opp, players: playersList };
      }
      return opp;
    }));
  };

  const handleSaveRivalOpponent = (updated: OpponentTeam) => {
    setOpponents(prev => prev.map(o => o.id === updated.id ? updated : o));
    showToast(`Customization saved for ${updated.name}`, 'success');
  };

  // Reset all data to initial defaults
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all players, formations, opponents, and match plans to initial defaults?')) {
      localStorage.removeItem(STORAGE_PLAYERS);
      localStorage.removeItem(STORAGE_FORMATIONS);
      localStorage.removeItem(STORAGE_OPPONENTS);
      localStorage.removeItem(STORAGE_MATCHPLAN);
      setPlayers(INITIAL_PLAYERS);
      setHgufcFormations(INITIAL_FORMATIONS);
      setOpponents(INITIAL_OPPONENTS);
      setMatchPlan({
        matchTitle: 'Singapore Premier League Matchday',
        matchDate: new Date().toISOString().split('T')[0],
        venue: 'Jalan Besar Stadium',
        competition: 'Singapore Premier League (SPL)',
        selectedOpponentId: INITIAL_OPPONENTS[0].id,
        hgufcFormationId: 'form-433',
        rivalFormationId: 'form-433',
        tacticalNotes: INITIAL_TACTICAL_NOTES,
        swot: INITIAL_SWOT,
        showPitchZones: true,
        showOpponentTokens: true,
        activePitchTool: 'select',
      });
      showToast('All tactical data reset to official defaults', 'success');
    }
  };

  // Add directive from SWOT engine into Tactical Instructions
  const handleAddDirectiveToNotes = (directive: string) => {
    const lower = directive.toLowerCase();
    let field: keyof TacticalNotes = 'inPossessionStructure';
    let fieldLabel = 'In-Possession Structure';

    if (lower.includes('build-up') || lower.includes('goal-kick') || lower.includes('salida') || lower.includes('circula')) {
      field = 'buildUpPhase';
      fieldLabel = 'Build-Up Phase';
    } else if (lower.includes('press') || lower.includes('presion') || lower.includes('hunting') || lower.includes('trigger') || lower.includes('bloque')) {
      field = 'pressingTriggers';
      fieldLabel = 'Pressing Triggers';
    } else if (lower.includes('transition') || lower.includes('transición') || lower.includes('counter') || lower.includes('contra') || lower.includes('gegenpress')) {
      field = 'outOfPossessionTransition';
      fieldLabel = 'Defensive Transition';
    } else if (lower.includes('rest defense') || lower.includes('rest-defense') || lower.includes('3+2') || lower.includes('3+1') || lower.includes('seguridad')) {
      field = 'restDefense';
      fieldLabel = 'Rest Defense';
    } else if (lower.includes('set piece') || lower.includes('corner') || lower.includes('falta') || lower.includes('aereo') || lower.includes('balón parado')) {
      field = 'setPieces';
      fieldLabel = 'Set Pieces';
    }

    setMatchPlan(prev => ({
      ...prev,
      tacticalNotes: {
        ...prev.tacticalNotes,
        [field]: prev.tacticalNotes[field] ? `${prev.tacticalNotes[field]}\n• ${directive}` : `• ${directive}`,
      }
    }));
    showToast(`Directive appended to ${fieldLabel} notes`, 'success');
  };

  // Load tactical instruction presets
  const handleLoadTacticalPreset = (presetName: string) => {
    if (presetName === 'possession') {
      setMatchPlan(prev => ({
        ...prev,
        tacticalNotes: {
          buildUpPhase: '2+3 build-up structure. Draw opponent forward pressing line before releasing diagonal switch to isolated weak-side winger.',
          inPossessionStructure: '3-2-4-1 positional play structure. Wingbacks hold maximum pitch width while dual #8s occupy left and right half-spaces.',
          outOfPossessionTransition: 'Immediate 5-second counter-press (Gegenpressing). Ball-near players condense space; holding pivot seals passing escape channel.',
          pressingTriggers: 'Trigger high block when opponent central defender receives ball with closed body shape or makes a backward pass.',
          restDefense: 'Strict 3+2 rest-defense structure (two central defenders + tucking opposite fullback + holding defensive midfielder).',
          setPieces: 'Inswinging delivery to the near-post for flick-on. Maintain 3-man cordon on the 18-yard box to win the second ball.'
        }
      }));
      showToast('Positional Play tactical game model loaded', 'success');
    } else if (presetName === 'gegenpress') {
      setMatchPlan(prev => ({
        ...prev,
        tacticalNotes: {
          buildUpPhase: 'Direct progressive verticality into striker chest; support runners swarm immediately to claim second ball in zone 14.',
          inPossessionStructure: 'Narrow 4-2-2-2 attacking formation to keep players within 10 meters of each other for rapid counter-pressing upon turnover.',
          outOfPossessionTransition: 'Hyper-aggressive counter-pressing trap. 4 players hunt ball carrier within 3 seconds of possession loss.',
          pressingTriggers: 'All-out forward sprint upon back-pass to opposing goalkeeper or bouncy ground pass to fullback.',
          restDefense: 'High defensive line holding halfway line with sweeper keeper stationed 25 meters off his goal-line.',
          setPieces: 'Direct crowded 6-yard box delivery with aggressive physical screens on the goalkeeper.'
        }
      }));
      showToast('Gegenpress tactical game model loaded', 'success');
    } else if (presetName === 'counter') {
      setMatchPlan(prev => ({
        ...prev,
        tacticalNotes: {
          buildUpPhase: 'Low-risk distribution. Direct channel balls targeted behind opponent high defensive line into space.',
          inPossessionStructure: 'Rapid 3-pass vertical counter-attack. Exploit central space vacated by opponent attacking midfielders.',
          outOfPossessionTransition: 'Immediate retreat into compact 5-4-1 low block inside our defensive third.',
          pressingTriggers: 'Mid-block line of confrontation at 40-meter mark. Trap opponent in wide touchline corridors.',
          restDefense: 'Deep defensive shield denying zone 14 shooting opportunities. Center-backs dominate aerial box defense.',
          setPieces: 'Defensive 8-man zonal box wall with 2 fast outlets positioned at the halfway circle for counter-breaks.'
        }
      }));
      showToast('Low Block Counter tactical game model loaded', 'success');
    }
  };

  // PDF Export execution
  const handleExportPdf = async () => {
    setIsExporting(true);
    showToast('Compiling executive tactical match dossier...', 'info');
    
    const filename = `GamePlan_HGUFC_vs_${currentOpponent.shortName}_${matchPlan.matchDate}.pdf`;
    const result = await exportMatchPlanToPdf('match-plan-pdf-document', filename, (status) => {
      setToastMessage({ text: status, type: 'info' });
    });

    setIsExporting(false);
    if (result.success && result.blobUrl) {
      setReadyPdf({ blobUrl: result.blobUrl, filename });
      showToast('Match plan PDF ready! Download started automatically.', 'success');
    } else {
      showToast(result.error || 'PDF compilation failed. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-200 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-800 text-white border border-emerald-700' 
            : toastMessage.type === 'error'
            ? 'bg-rose-800 text-white border border-rose-700'
            : 'bg-slate-900 text-white border border-slate-700'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <HelpCircle className="w-4 h-4 text-orange-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header Component */}
      <Header
        matchPlan={matchPlan}
        opponents={opponents}
        hgufcFormations={hgufcFormations}
        rivalFormations={rivalFormations}
        onUpdateMatchPlan={(partial) => {
          if (partial.hgufcFormationId && partial.hgufcFormationId !== matchPlan.hgufcFormationId) {
            handleUpdateHgufcFormation(partial.hgufcFormationId);
          } else {
            setMatchPlan(prev => ({ ...prev, ...partial }));
          }
        }}
        onOpenPlayerModal={() => {
          setPlayerToEdit(null);
          setIsPlayerModalOpen(true);
        }}
        onOpenFormationModal={() => setIsFormationModalOpen(true)}
        onOpenOpponentModal={() => setIsOpponentModalOpen(true)}
        onOpenSupabaseSql={() => setIsSupabaseModalOpen(true)}
        onOpenRivalCustomizer={() => setIsRivalCustomizerOpen(true)}
        onUpdateOpponentColor={handleUpdateOpponentColor}
        onExportPdf={handleExportPdf}
        onResetData={handleResetData}
        isExporting={isExporting}
        onSaveAll={handleSaveAll}
        isSaving={isSaving}
        lastSavedTime={lastSavedTime}
        isCloudConnected={isCloudConnected}
        isSyncingCloud={isSyncingCloud}
        onCopySyncLink={handleCopySyncLink}
      />

      {/* Primary Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6 overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`py-3 px-1 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'board'
                  ? 'border-orange-600 text-orange-600 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tactical Pitch & Board</span>
            </button>

            {/* Tactical Campogram & Animation Studio Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('campogram')}
              className={`py-3 px-1 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'campogram'
                  ? 'border-orange-600 text-orange-600 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Play className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>Tactical Campogram & Animations</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black animate-pulse">
                2D Interactive
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('swot')}
              className={`py-3 px-1 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'swot'
                  ? 'border-orange-600 text-orange-600 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>SWOT & Automated Intelligence</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-100 text-orange-800 font-black">
                {tacticalInsights.length} Directives
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('instructions')}
              className={`py-3 px-1 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'instructions'
                  ? 'border-orange-600 text-orange-600 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Tactical Game Model & Phases</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`py-3 px-1 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'border-orange-600 text-orange-600 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Match Dossier PDF Preview</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* TAB 1: TACTICAL PITCH & BOARD */}
        {activeTab === 'board' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* Tactical 2D Pitch - Enhanced Resolution & Screen Real Estate */}
            <div className={`${isPitchExpanded ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-8 2xl:col-span-9'} h-full transition-all duration-300`}>
              <TacticalPitch
                hgufcFormation={currentHgufcFormation}
                rivalFormation={currentRivalFormation}
                opponent={currentOpponent}
                players={players}
                activeView={activePitchView}
                showZones={showPitchZones}
                onUpdateView={setActivePitchView}
                onToggleZones={() => setShowPitchZones(!showPitchZones)}
                onUpdatePlayerPosition={handleUpdatePlayerPosition}
                onAutoAssignStartingXI={() => assignStartingXIToFormation(currentHgufcFormation)}
                onSelectPlayerForDetail={(p) => {
                  setPlayerToEdit(p);
                  setIsPlayerModalOpen(true);
                }}
                isExpanded={isPitchExpanded}
                onToggleExpand={() => setIsPitchExpanded(!isPitchExpanded)}
                onUpdateRivalPlayer={handleUpdateRivalPlayer}
                onOpenRivalCustomizer={() => setIsRivalCustomizerOpen(true)}
              />
            </div>

            {/* Squad Roster Bench & Starters */}
            <div className={`${isPitchExpanded ? 'lg:col-span-12 mt-4' : 'lg:col-span-4 xl:col-span-4 2xl:col-span-3'} h-full transition-all duration-300`}>
              <SquadRoster
                players={players}
                opponent={currentOpponent}
                onPlaceOnPitch={handlePlacePlayerOnPitch}
                onRemoveFromPitch={handleRemovePlayerFromPitch}
                onOpenAddPlayerModal={() => {
                  setPlayerToEdit(null);
                  setIsPlayerModalOpen(true);
                }}
                onSelectPlayerForDetail={(p) => {
                  setPlayerToEdit(p);
                  setIsPlayerModalOpen(true);
                }}
                onUpdateRivalPlayer={handleUpdateRivalPlayer}
                onOpenRivalCustomizer={() => setIsRivalCustomizerOpen(true)}
              />
            </div>

          </div>
        )}

        {/* TAB: TACTICAL CAMPOGRAM & ANIMATIONS */}
        {activeTab === 'campogram' && (
          <TacticalCampogramAnimator
            players={players}
            onUpdatePlayers={setPlayers}
            hgufcFormations={hgufcFormations}
            opponents={opponents}
            currentOpponent={currentOpponent}
            currentHgufcFormation={currentHgufcFormation}
            currentRivalFormation={currentRivalFormation}
            campogramPlays={campogramPlays}
            onUpdatePlays={(newPlays) => {
              setCampogramPlays(newPlays);
              try {
                localStorage.setItem('hgufc_campogram_plays_v1', JSON.stringify(newPlays));
              } catch (e) {
                console.error(e);
              }
            }}
            onSelectOpponent={(oppId) => {
              setMatchPlan(prev => ({ ...prev, selectedOpponentId: oppId }));
            }}
            onSaveAll={handleSaveAll}
            isSaving={isSaving}
          />
        )}

        {/* TAB 2: SWOT & AUTOMATED THREATS / OPPORTUNITIES */}
        {activeTab === 'swot' && (
          <SwotAnalysis
            swot={matchPlan.swot}
            hgufcFormation={currentHgufcFormation}
            rivalFormation={currentRivalFormation}
            opponent={currentOpponent}
            insights={tacticalInsights}
            report={multidimensionalReport}
            players={players}
            onUpdateSwot={(updated) => {
              setMatchPlan(prev => ({
                ...prev,
                swot: { ...prev.swot, ...updated },
              }));
            }}
            onRegenerateInsights={() => {
              setRecalculateNonce(n => n + 1);
              showToast('Tactical intelligence engine recalculated with current squad & DAFO', 'success');
            }}
            onAddDirectiveToNotes={handleAddDirectiveToNotes}
          />
        )}

        {/* TAB 3: TACTICAL INSTRUCTIONS */}
        {activeTab === 'instructions' && (
          <TacticalInstructions
            notes={matchPlan.tacticalNotes}
            onUpdateNotes={(updated) => {
              setMatchPlan(prev => ({
                ...prev,
                tacticalNotes: { ...prev.tacticalNotes, ...updated },
              }));
            }}
            onLoadPreset={handleLoadTacticalPreset}
          />
        )}

        {/* TAB 4: DOSSIER PREVIEW & PRINT VIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  Print-Ready Match Plan Dossier
                </h3>
                <p className="text-xs text-slate-500">
                  This snapshot will be compiled into the exported PDF match sheet.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>{isExporting ? 'Compiling PDF...' : 'Download Match Plan (PDF)'}</span>
              </button>
            </div>

            <div className="bg-slate-300/60 p-4 sm:p-6 rounded-xl overflow-x-auto flex justify-center">
              <div className="max-w-[800px] w-full flex flex-col items-center">
                <PrintReportView
                  id="match-plan-pdf-document-preview"
                  matchPlan={matchPlan}
                  hgufcFormation={currentHgufcFormation}
                  rivalFormation={currentRivalFormation}
                  opponent={currentOpponent}
                  players={players}
                  insights={tacticalInsights}
                  report={multidimensionalReport}
                />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* CAPTURE ELEMENT FOR PDF EXPORT */}
      <div 
        id="match-plan-pdf-document-wrapper"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '794px',
          zIndex: -9999,
          pointerEvents: 'none',
          backgroundColor: '#ffffff',
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        <PrintReportView
          id="match-plan-pdf-document"
          matchPlan={matchPlan}
          hgufcFormation={currentHgufcFormation}
          rivalFormation={currentRivalFormation}
          opponent={currentOpponent}
          players={players}
          insights={tacticalInsights}
          report={multidimensionalReport}
        />
      </div>

      {/* Interactive Direct PDF Download Card */}
      {readyPdf && (
        <aside 
          aria-label="PDF Ready Notification"
          className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-full bg-slate-900 text-white rounded-xl shadow-2xl border-2 border-orange-500 p-4 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow">
                PDF
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Match Dossier PDF Ready</span>
                </h4>
                <p className="text-[11px] text-slate-300 truncate mt-0.5" title={readyPdf.filename}>
                  {readyPdf.filename}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setReadyPdf(null)}
              className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <a
              href={readyPdf.blobUrl}
              download={readyPdf.filename}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:from-orange-700 active:to-amber-700 text-white font-extrabold text-xs rounded-lg text-center shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF File</span>
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Open browser print dialog to save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            If your browser blocked the automatic popup download, click <strong>Download PDF File</strong> above.
          </p>
        </aside>
      )}

      {/* Modals */}
      <PlayerModal
        isOpen={isPlayerModalOpen}
        playerToEdit={playerToEdit}
        onClose={() => {
          setIsPlayerModalOpen(false);
          setPlayerToEdit(null);
        }}
        onSavePlayer={handleSavePlayer}
        onDeletePlayer={handleDeletePlayer}
      />

      <FormationModal
        isOpen={isFormationModalOpen}
        formations={hgufcFormations}
        onClose={() => setIsFormationModalOpen(false)}
        onAddFormation={handleAddFormation}
        onDeleteFormation={handleDeleteFormation}
      />

      <OpponentModal
        isOpen={isOpponentModalOpen}
        opponents={opponents}
        onClose={() => setIsOpponentModalOpen(false)}
        onAddOpponent={handleAddOpponent}
        onUpdateOpponent={handleUpdateOpponent}
        onDeleteOpponent={handleDeleteOpponent}
      />

      <RivalCustomizerModal
        isOpen={isRivalCustomizerOpen}
        opponent={currentOpponent}
        onClose={() => setIsRivalCustomizerOpen(false)}
        onSaveOpponent={handleSaveRivalOpponent}
      />

      <SupabaseSqlModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        currentData={{
          players,
          matchPlan,
          formations: hgufcFormations,
          opponents,
        }}
        onDataImported={() => {
          setIsCloudConnected(isSupabaseConfigured());
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-[1720px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="font-bold text-slate-800">Hougang United FC</span>
            <span>• Official Singapore Premier League Match Preparation Suite</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Professional Tactical Engine • High Block & Rest Defense Analytics
          </div>
        </div>
      </footer>

    </div>
  );
}
