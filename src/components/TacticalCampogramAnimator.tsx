import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Grid, 
  ArrowUpRight, 
  Repeat, 
  Info, 
  Settings2,
  Maximize2,
  Minimize2,
  Layers,
  Video,
  ArrowLeftRight,
  X,
  Film,
  Edit2,
  Check,
  RefreshCw
} from 'lucide-react';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { Player, Formation, OpponentTeam, CampogramPlay, CampogramStep, CampogramToken, PlayerPosition, OpponentPlayer } from '../types';
import { DEFAULT_CAMPOGRAM_PLAYS, buildTokensFromSquadAndOpponent } from '../data/campogramPresets';

interface TacticalCampogramAnimatorProps {
  players: Player[];
  onUpdatePlayers?: (players: Player[]) => void;
  hgufcFormations: Formation[];
  opponents: OpponentTeam[];
  currentOpponent: OpponentTeam;
  currentHgufcFormation: Formation;
  currentRivalFormation: Formation;
  campogramPlays?: CampogramPlay[];
  onUpdatePlays?: (plays: CampogramPlay[]) => void;
  onSelectOpponent?: (opponentId: string) => void;
  onSaveAll?: () => void;
  isSaving?: boolean;
}

const STORAGE_CAMPOGRAM_PLAYS = 'hgufc_campogram_plays_v1';

export const TacticalCampogramAnimator: React.FC<TacticalCampogramAnimatorProps> = ({
  players,
  onUpdatePlayers,
  hgufcFormations,
  opponents,
  currentOpponent,
  currentHgufcFormation,
  currentRivalFormation,
  campogramPlays: externalPlays,
  onUpdatePlays,
  onSelectOpponent,
  onSaveAll,
  isSaving = false,
}) => {
  // 1. Plays state (controlled from App or internal)
  const [internalPlays, setInternalPlays] = useState<CampogramPlay[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CAMPOGRAM_PLAYS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CAMPOGRAM_PLAYS;
  });

  const plays = externalPlays && externalPlays.length > 0 ? externalPlays : internalPlays;

  const updatePlaysList = useCallback((newPlays: CampogramPlay[]) => {
    setInternalPlays(newPlays);
    if (onUpdatePlays) {
      onUpdatePlays(newPlays);
    }
    try {
      localStorage.setItem(STORAGE_CAMPOGRAM_PLAYS, JSON.stringify(newPlays));
    } catch (e) {
      console.error(e);
    }
  }, [onUpdatePlays]);

  const [activePlayId, setActivePlayId] = useState<string>(() => {
    return plays[0]?.id || 'play-salida-433';
  });

  const currentPlay = useMemo(() => {
    return plays.find(p => p.id === activePlayId) || plays[0] || DEFAULT_CAMPOGRAM_PLAYS[0];
  }, [plays, activePlayId]);

  // 2. Playback state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 1.5x, 2x
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [animProgress, setAnimProgress] = useState<number>(0); // 0.0 to 1.0 between steps

  // 3. Field & Display settings
  const [activeViewFilter, setActiveViewFilter] = useState<'both' | 'hgufc' | 'opponent'>('both');
  const [labelMode, setLabelMode] = useState<'both' | 'number' | 'name'>('both');
  const [showMoveVectors, setShowMoveVectors] = useState<boolean>(true);
  const [showFieldZones, setShowFieldZones] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'hgufc' | 'rival' | 'ball' | 'notes'>('hgufc');

  // 4. Drag & Interaction state
  const pitchRef = useRef<HTMLDivElement>(null);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [activeOpponentId, setActiveOpponentId] = useState<string>(currentOpponent.id);

  // 5. In-place Play Title Editing
  const [isEditingPlayTitle, setIsEditingPlayTitle] = useState<boolean>(false);
  const [tempPlayTitle, setTempPlayTitle] = useState<string>(currentPlay.title);

  // Synchronize tempPlayTitle when active play changes
  useEffect(() => {
    setTempPlayTitle(currentPlay.title);
    setIsEditingPlayTitle(false);
  }, [currentPlay.id, currentPlay.title]);

  // 6. Player Swap Modal / Quick Swap state
  const [isSwapModalOpen, setIsSwapModalOpen] = useState<boolean>(false);
  const [tokenToSwap, setTokenToSwap] = useState<CampogramToken | null>(null);
  const [targetSwapPlayerId, setTargetSwapPlayerId] = useState<string>('');
  const [applySwapToAllPlays, setApplySwapToAllPlays] = useState<boolean>(true);

  // 7. Video Export state (.mp4)
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const selectedOpponent = useMemo(() => {
    return opponents.find(o => o.id === activeOpponentId) || currentOpponent;
  }, [opponents, activeOpponentId, currentOpponent]);

  // Keep step index within bounds
  useEffect(() => {
    if (currentStepIndex >= currentPlay.steps.length) {
      setCurrentStepIndex(Math.max(0, currentPlay.steps.length - 1));
    }
  }, [currentPlay.steps.length, currentStepIndex]);

  // 8. ANIMATION ENGINE (smooth 60fps interpolation)
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      setAnimProgress(0);
      return;
    }

    const stepDurationMs = 2000 / playbackSpeed;

    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;
      const progress = Math.min(1, elapsed / stepDurationMs);
      setAnimProgress(progress);

      if (progress >= 1) {
        lastTimeRef.current = timestamp;
        setCurrentStepIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= currentPlay.steps.length) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return prevIndex;
            }
          }
          return nextIndex;
        });
        setAnimProgress(0);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, isLooping, currentPlay.steps.length]);

  const currentStep = currentPlay.steps[currentStepIndex] || currentPlay.steps[0];
  const nextStep = isPlaying 
    ? currentPlay.steps[(currentStepIndex + 1) % currentPlay.steps.length] 
    : null;
  const prevStep = currentStepIndex > 0 ? currentPlay.steps[currentStepIndex - 1] : null;

  // Smooth interpolated tokens during playback
  const renderedTokens = useMemo(() => {
    if (!isPlaying || !nextStep) {
      return currentStep.tokens;
    }

    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easedProgress = ease(animProgress);

    return currentStep.tokens.map(token => {
      const targetToken = nextStep.tokens.find(t => t.id === token.id);
      if (!targetToken) return token;

      return {
        ...token,
        x: token.x + (targetToken.x - token.x) * easedProgress,
        y: token.y + (targetToken.y - token.y) * easedProgress,
      };
    });
  }, [isPlaying, nextStep, animProgress, currentStep.tokens]);

  const selectedToken = useMemo(() => {
    return renderedTokens.find(t => t.id === selectedTokenId) || null;
  }, [renderedTokens, selectedTokenId]);

  // 9. DRAG & DROP ON PITCH
  const handlePointerDown = (e: React.PointerEvent, tokenId: string) => {
    if (isPlaying) return;
    e.stopPropagation();
    setDraggingTokenId(tokenId);
    setSelectedTokenId(tokenId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTokenId || !pitchRef.current || isPlaying) return;

    const rect = pitchRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.round(Math.max(3, Math.min(97, rawX)) * 10) / 10;
    const clampedY = Math.round(Math.max(3, Math.min(97, rawY)) * 10) / 10;

    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return {
        ...p,
        steps: p.steps.map((st, sIdx) => {
          if (sIdx !== currentStepIndex) return st;
          return {
            ...st,
            tokens: st.tokens.map(tok => {
              if (tok.id !== draggingTokenId) return tok;
              return { ...tok, x: clampedX, y: clampedY };
            })
          };
        })
      };
    });

    updatePlaysList(updated);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingTokenId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setDraggingTokenId(null);
    }
  };

  // 10. EDITABLE PLAY TITLE & OPTIONS
  const handleSavePlayTitle = () => {
    const trimmed = tempPlayTitle.trim();
    if (!trimmed) return;

    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return { ...p, title: trimmed };
    });

    updatePlaysList(updated);
    setIsEditingPlayTitle(false);
  };

  const handleUpdatePlayCategory = (category: any) => {
    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return { ...p, category };
    });
    updatePlaysList(updated);
  };

  const handleUpdatePlayDescription = (description: string) => {
    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return { ...p, description };
    });
    updatePlaysList(updated);
  };

  // 11. STEP CONTROLS
  const handleUpdateStepTitle = (title: string) => {
    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return {
        ...p,
        steps: p.steps.map((st, idx) => {
          if (idx !== currentStepIndex) return st;
          return { ...st, title };
        })
      };
    });
    updatePlaysList(updated);
  };

  const handleUpdateStepDescription = (description: string) => {
    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return {
        ...p,
        steps: p.steps.map((st, idx) => {
          if (idx !== currentStepIndex) return st;
          return { ...st, description };
        })
      };
    });
    updatePlaysList(updated);
  };

  const handleAddStep = () => {
    const newStepNumber = currentPlay.steps.length + 1;
    const clonedTokens = currentStep.tokens.map(t => ({ ...t }));

    const newStep: CampogramStep = {
      id: `step-${Date.now()}`,
      stepNumber: newStepNumber,
      title: `Step ${newStepNumber}: Tactical Movement Phase`,
      description: 'Drag players and ball to their next positions to establish movement trajectories.',
      tokens: clonedTokens,
    };

    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return {
        ...p,
        steps: [...p.steps, newStep],
      };
    });

    updatePlaysList(updated);
    setCurrentStepIndex(currentPlay.steps.length);
    setIsPlaying(false);
  };

  const handleDeleteStep = (indexToDelete: number) => {
    if (currentPlay.steps.length <= 1) return;

    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      const remainingSteps = p.steps
        .filter((_, idx) => idx !== indexToDelete)
        .map((st, i) => ({ ...st, stepNumber: i + 1 }));
      return {
        ...p,
        steps: remainingSteps,
      };
    });

    updatePlaysList(updated);
    if (currentStepIndex >= indexToDelete && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
    setIsPlaying(false);
  };

  // 12. PLAYER SWAPPING & ROSTER CONSISTENCY ACROSS PLAYS
  const handleOpenSwapModal = (token: CampogramToken) => {
    setTokenToSwap(token);
    if (token.type === 'hgufc') {
      const otherHgufc = players.find(p => p.id !== token.originalId);
      setTargetSwapPlayerId(otherHgufc ? otherHgufc.id : '');
    } else if (token.type === 'opponent') {
      const oppPlayers = selectedOpponent.players || [];
      const otherOpp = oppPlayers.find(p => p.id !== token.originalId);
      setTargetSwapPlayerId(otherOpp ? otherOpp.id : '');
    }
    setIsSwapModalOpen(true);
  };

  const handleExecuteSwap = (syncAcrossAllPlays: boolean = true) => {
    if (!tokenToSwap || !targetSwapPlayerId) return;

    const isHgufc = tokenToSwap.type === 'hgufc';
    let targetName = '';
    let targetNumber = 0;
    let targetPosition: PlayerPosition = 'MID';
    let targetRole = '';

    if (isHgufc) {
      const targetP = players.find(p => p.id === targetSwapPlayerId);
      if (!targetP) return;
      targetName = targetP.name;
      targetNumber = targetP.number;
      targetPosition = targetP.position;
      targetRole = targetP.roleLabel || targetP.position;

      // Update main squad line-up in App state if a bench player was placed
      if (onUpdatePlayers) {
        const updatedSquad = players.map(p => {
          if (p.id === targetSwapPlayerId) {
            return { ...p, isStarting: true };
          }
          if (p.id === tokenToSwap.originalId) {
            return { ...p, isStarting: false };
          }
          return p;
        });
        onUpdatePlayers(updatedSquad);
      }
    } else {
      const targetOpp = (selectedOpponent.players || []).find(p => p.id === targetSwapPlayerId);
      if (!targetOpp) return;
      targetName = targetOpp.name;
      targetNumber = targetOpp.number;
      targetPosition = targetOpp.position;
      targetRole = targetOpp.role || targetOpp.position;
    }

    // Apply the swap to active play (and across all other plays if requested)
    const updated = plays.map(p => {
      // If not syncing across all plays, only touch currentPlay
      if (!syncAcrossAllPlays && p.id !== currentPlay.id) return p;

      return {
        ...p,
        steps: p.steps.map(st => {
          const existingTargetToken = st.tokens.find(t => t.originalId === targetSwapPlayerId && t.type === tokenToSwap.type);

          if (existingTargetToken) {
            // Swap both on-pitch tokens
            return {
              ...st,
              tokens: st.tokens.map(t => {
                if (t.id === tokenToSwap.id || t.originalId === tokenToSwap.originalId) {
                  return {
                    ...t,
                    originalId: targetSwapPlayerId,
                    name: targetName,
                    number: targetNumber,
                    position: targetPosition,
                    role: targetRole,
                  };
                }
                if (t.id === existingTargetToken.id || t.originalId === targetSwapPlayerId) {
                  return {
                    ...t,
                    originalId: tokenToSwap.originalId,
                    name: tokenToSwap.name,
                    number: tokenToSwap.number,
                    position: tokenToSwap.position,
                    role: tokenToSwap.role,
                  };
                }
                return t;
              })
            };
          } else {
            // Replace token with incoming bench player
            return {
              ...st,
              tokens: st.tokens.map(t => {
                if (t.id === tokenToSwap.id || t.originalId === tokenToSwap.originalId) {
                  return {
                    ...t,
                    originalId: targetSwapPlayerId,
                    name: targetName,
                    number: targetNumber,
                    position: targetPosition,
                    role: targetRole,
                  };
                }
                return t;
              })
            };
          }
        })
      };
    });

    updatePlaysList(updated);
    setIsSwapModalOpen(false);
    setTokenToSwap(null);
  };

  // Place player from bench onto field
  const handlePlacePlayerOnPitch = (player: Player) => {
    const existing = currentStep.tokens.find(t => t.originalId === player.id);
    if (existing) {
      setSelectedTokenId(existing.id);
      return;
    }

    const newToken: CampogramToken = {
      id: `hgufc-${player.id}-${Date.now()}`,
      type: 'hgufc',
      originalId: player.id,
      number: player.number,
      name: player.name,
      position: player.position,
      role: player.roleLabel || player.position,
      x: 50,
      y: 60,
      teamColor: '#EA580C',
      textColor: '#FFFFFF',
    };

    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return {
        ...p,
        steps: p.steps.map((st, idx) => {
          if (idx !== currentStepIndex) return st;
          return { ...st, tokens: [...st.tokens, newToken] };
        })
      };
    });

    updatePlaysList(updated);
    setSelectedTokenId(newToken.id);
  };

  const handleRemoveToken = (tokenId: string) => {
    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return {
        ...p,
        steps: p.steps.map((st, idx) => {
          if (idx !== currentStepIndex) return st;
          return {
            ...st,
            tokens: st.tokens.filter(t => t.id !== tokenId)
          };
        })
      };
    });

    updatePlaysList(updated);
    if (selectedTokenId === tokenId) setSelectedTokenId(null);
  };

  // 13. NEW PLAY & RESET FORMATION
  const handleCreateNewCustomPlay = () => {
    const initialTokens = buildTokensFromSquadAndOpponent(
      players,
      currentHgufcFormation,
      selectedOpponent,
      currentRivalFormation
    );

    const newPlay: CampogramPlay = {
      id: `play-custom-${Date.now()}`,
      title: `Tactical Play Routine #${plays.length + 1}`,
      description: 'Custom animated sequence with Hougang United FC and opponent match squads.',
      category: 'Custom Routine',
      speed: 1,
      loop: true,
      steps: [
        {
          id: `step-1-${Date.now()}`,
          stepNumber: 1,
          title: 'Step 1: Starting Tactical Shape',
          description: 'Initial positioning of all 22 players and ball.',
          tokens: initialTokens,
        }
      ]
    };

    const updated = [newPlay, ...plays];
    updatePlaysList(updated);
    setActivePlayId(newPlay.id);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleResetToFormations = () => {
    const resetTokens = buildTokensFromSquadAndOpponent(
      players,
      currentHgufcFormation,
      selectedOpponent,
      currentRivalFormation
    );

    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return {
        ...p,
        steps: p.steps.map((st, idx) => {
          if (idx !== currentStepIndex) return st;
          return { ...st, tokens: resetTokens };
        })
      };
    });

    updatePlaysList(updated);
  };

  // Ball placement helper
  const handleMoveBallTo = (spot: 'center' | 'gk' | 'rival_penalty' | 'corner') => {
    const coords = {
      center: { x: 50, y: 50 },
      gk: { x: 50, y: 90 },
      rival_penalty: { x: 50, y: 15 },
      corner: { x: 5, y: 95 },
    }[spot];

    const updated = plays.map(p => {
      if (p.id !== currentPlay.id) return p;
      return {
        ...p,
        steps: p.steps.map((st, idx) => {
          if (idx !== currentStepIndex) return st;
          return {
            ...st,
            tokens: st.tokens.map(tok => {
              if (tok.type !== 'ball') return tok;
              return { ...tok, x: coords.x, y: coords.y };
            })
          };
        })
      };
    });

    updatePlaysList(updated);
  };

  // 14. MP4 VIDEO EXPORT ENGINE
  const handleExportMp4Video = async () => {
    if (isExportingVideo) return;
    setIsExportingVideo(true);
    setExportProgress(0);
    setExportStatusText('Initializing MP4 Video Generator...');
    setIsPlaying(false);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Could not initialize Canvas 2D context');

      const renderPitchFrame = (tokensToRender: CampogramToken[], stepTitle: string, stepDesc: string, stepNum: number, totalSteps: number) => {
        // Frame Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 1280, 720);

        // Header Banner
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 1280, 75);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(0, 72, 1280, 3);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText(currentPlay.title, 30, 34);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px system-ui, sans-serif';
        ctx.fillText(`Hougang United FC vs ${selectedOpponent.name} • Step ${stepNum} of ${totalSteps}: ${stepTitle}`, 30, 58);

        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('HGUFC TACTICAL ANIMATOR • MP4', 1250, 44);
        ctx.textAlign = 'left';

        // Pitch Area
        const pitchLeft = 190;
        const pitchTop = 95;
        const pitchWidth = 900;
        const pitchHeight = 600;

        const turfGrad = ctx.createLinearGradient(0, pitchTop, 0, pitchTop + pitchHeight);
        turfGrad.addColorStop(0, '#15803d');
        turfGrad.addColorStop(0.35, '#166534');
        turfGrad.addColorStop(0.65, '#14532d');
        turfGrad.addColorStop(1, '#0f3d20');
        ctx.fillStyle = turfGrad;
        ctx.fillRect(pitchLeft, pitchTop, pitchWidth, pitchHeight);

        // Mowing bands
        const bands = 14;
        const bandH = pitchHeight / bands;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let b = 0; b < bands; b += 2) {
          ctx.fillRect(pitchLeft, pitchTop + b * bandH, pitchWidth, bandH);
        }

        // Field Lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(pitchLeft, pitchTop, pitchWidth, pitchHeight);

        const halfY = pitchTop + pitchHeight / 2;
        ctx.beginPath();
        ctx.moveTo(pitchLeft, halfY);
        ctx.lineTo(pitchLeft + pitchWidth, halfY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pitchLeft + pitchWidth / 2, halfY, 65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pitchLeft + pitchWidth / 2, halfY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Goal Areas
        ctx.strokeRect(pitchLeft + pitchWidth * 0.22, pitchTop, pitchWidth * 0.56, pitchHeight * 0.18);
        ctx.strokeRect(pitchLeft + pitchWidth * 0.36, pitchTop, pitchWidth * 0.28, pitchHeight * 0.07);
        ctx.beginPath();
        ctx.arc(pitchLeft + pitchWidth / 2, pitchTop + pitchHeight * 0.12, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeRect(pitchLeft + pitchWidth * 0.22, pitchTop + pitchHeight * 0.82, pitchWidth * 0.56, pitchHeight * 0.18);
        ctx.strokeRect(pitchLeft + pitchWidth * 0.36, pitchTop + pitchHeight * 0.93, pitchWidth * 0.28, pitchHeight * 0.07);
        ctx.beginPath();
        ctx.arc(pitchLeft + pitchWidth / 2, pitchTop + pitchHeight * 0.88, 4, 0, Math.PI * 2);
        ctx.fill();

        // Render Tokens
        tokensToRender.forEach(token => {
          if (activeViewFilter === 'hgufc' && token.type === 'opponent') return;
          if (activeViewFilter === 'opponent' && token.type === 'hgufc') return;

          const px = pitchLeft + (token.x / 100) * pitchWidth;
          const py = pitchTop + (token.y / 100) * pitchHeight;

          if (token.type === 'ball') {
            ctx.beginPath();
            ctx.arc(px, py, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#000000';
            ctx.stroke();
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            return;
          }

          const isHgufc = token.type === 'hgufc';
          const isGk = token.position === 'GK';
          const radius = 17;

          ctx.beginPath();
          ctx.arc(px + 2, py + 2, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fillStyle = isGk ? '#0284c7' : isHgufc ? '#ea580c' : (selectedOpponent.primaryColor || '#002b49');
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = isGk ? '#facc15' : '#ffffff';
          ctx.stroke();

          ctx.fillStyle = isHgufc ? '#ffffff' : (selectedOpponent.secondaryColor || '#ffffff');
          ctx.font = 'bold 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(token.number), px, py - (token.role ? 3 : 0));

          if (token.role) {
            ctx.font = 'bold 8px monospace';
            ctx.fillText(token.role, px, py + 8);
          }

          if (labelMode === 'both' || labelMode === 'name') {
            const surname = token.name.split(' ').slice(-1)[0];
            ctx.font = 'bold 10px system-ui, sans-serif';
            const textWidth = ctx.measureText(surname).width;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(px - textWidth / 2 - 4, py + radius + 3, textWidth + 8, 14);
            ctx.fillStyle = isHgufc ? '#fed7aa' : '#bae6fd';
            ctx.textBaseline = 'top';
            ctx.fillText(surname, px, py + radius + 4);
          }
        });
      };

      const totalSteps = currentPlay.steps.length;
      const framesPerStep = 45; // 1.5 seconds at 30 fps
      const pauseFrames = 25; // ~0.8s pause at each keyframe
      const totalFrames = totalSteps * (pauseFrames + framesPerStep);
      const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      // STRATEGY A: Check if VideoEncoder + mp4-muxer is available for genuine H.264 MP4
      const supportsVideoEncoder = typeof window !== 'undefined' && 'VideoEncoder' in window;

      if (supportsVideoEncoder) {
        setExportStatusText('Encoding H.264 MP4 bitstream...');
        const muxer = new Muxer({
          target: new ArrayBufferTarget(),
          video: {
            codec: 'avc',
            width: 1280,
            height: 720,
          },
          fastStart: 'in-memory',
        });

        const videoEncoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => console.error('VideoEncoder error:', e),
        });

        await videoEncoder.configure({
          codec: 'avc1.42001f', // H.264 Baseline
          width: 1280,
          height: 720,
          bitrate: 3_500_000,
        });

        let frameIndex = 0;
        const fps = 30;
        const frameDurationUs = (1_000_000 / fps);

        for (let s = 0; s < totalSteps; s++) {
          const stepA = currentPlay.steps[s];
          const stepB = currentPlay.steps[(s + 1) % totalSteps];

          // 1. Pause frames
          for (let p = 0; p < pauseFrames; p++) {
            renderPitchFrame(stepA.tokens, stepA.title, stepA.description || '', s + 1, totalSteps);
            const videoFrame = new VideoFrame(canvas, { timestamp: Math.round(frameIndex * frameDurationUs) });
            videoEncoder.encode(videoFrame, { keyFrame: frameIndex % 30 === 0 });
            videoFrame.close();
            frameIndex++;
            setExportProgress(Math.round((frameIndex / totalFrames) * 100));
            await new Promise(r => setTimeout(r, 10));
          }

          // 2. Interpolation frames
          if (totalSteps > 1) {
            for (let f = 0; f < framesPerStep; f++) {
              const t = f / framesPerStep;
              const eased = ease(t);

              const interpTokens: CampogramToken[] = stepA.tokens.map(tokA => {
                const tokB = stepB.tokens.find(tb => tb.id === tokA.id);
                if (!tokB) return tokA;
                return {
                  ...tokA,
                  x: tokA.x + (tokB.x - tokA.x) * eased,
                  y: tokA.y + (tokB.y - tokA.y) * eased,
                };
              });

              renderPitchFrame(interpTokens, `${stepA.title} ➔ ${stepB.title}`, '', s + 1, totalSteps);
              const videoFrame = new VideoFrame(canvas, { timestamp: Math.round(frameIndex * frameDurationUs) });
              videoEncoder.encode(videoFrame, { keyFrame: frameIndex % 30 === 0 });
              videoFrame.close();
              frameIndex++;
              setExportProgress(Math.round((frameIndex / totalFrames) * 100));
              await new Promise(r => setTimeout(r, 10));
            }
          }
        }

        setExportStatusText('Finalizing MP4 container...');
        await videoEncoder.flush();
        muxer.finalize();
        const { buffer } = muxer.target;
        const mp4Blob = new Blob([buffer], { type: 'video/mp4' });
        const mp4Url = URL.createObjectURL(mp4Blob);

        setExportedVideoUrl(mp4Url);

        // Auto trigger download as MP4
        const safeName = currentPlay.title.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const a = document.createElement('a');
        a.href = mp4Url;
        a.download = `tactical_play_${safeName}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setIsVideoModalOpen(true);
      } else {
        // STRATEGY B: Fallback to MediaRecorder configured with MP4 / WebM
        setExportStatusText('Recording MediaStream with MP4 container...');
        const stream = canvas.captureStream(30);
        let chosenMime = 'video/mp4';
        if (!MediaRecorder.isTypeSupported(chosenMime)) {
          chosenMime = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1') ? 'video/mp4;codecs=avc1' : 'video/webm';
        }

        const recorder = new MediaRecorder(stream, { mimeType: chosenMime });
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.start();

        let frameIndex = 0;
        for (let s = 0; s < totalSteps; s++) {
          const stepA = currentPlay.steps[s];
          const stepB = currentPlay.steps[(s + 1) % totalSteps];

          for (let p = 0; p < pauseFrames; p++) {
            renderPitchFrame(stepA.tokens, stepA.title, stepA.description || '', s + 1, totalSteps);
            frameIndex++;
            setExportProgress(Math.round((frameIndex / totalFrames) * 100));
            await new Promise(r => setTimeout(r, 20));
          }

          if (totalSteps > 1) {
            for (let f = 0; f < framesPerStep; f++) {
              const t = f / framesPerStep;
              const eased = ease(t);

              const interpTokens: CampogramToken[] = stepA.tokens.map(tokA => {
                const tokB = stepB.tokens.find(tb => tb.id === tokA.id);
                if (!tokB) return tokA;
                return {
                  ...tokA,
                  x: tokA.x + (tokB.x - tokA.x) * eased,
                  y: tokA.y + (tokB.y - tokA.y) * eased,
                };
              });

              renderPitchFrame(interpTokens, `${stepA.title} ➔ ${stepB.title}`, '', s + 1, totalSteps);
              frameIndex++;
              setExportProgress(Math.round((frameIndex / totalFrames) * 100));
              await new Promise(r => setTimeout(r, 20));
            }
          }
        }

        recorder.stop();
        await new Promise<void>((resolve) => {
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            setExportedVideoUrl(url);

            const safeName = currentPlay.title.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
            const a = document.createElement('a');
            a.href = url;
            a.download = `tactical_play_${safeName}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setIsVideoModalOpen(true);
            resolve();
          };
        });
      }

    } catch (err: any) {
      console.error('MP4 Video export error:', err);
      alert(`Could not export MP4 video: ${err?.message || 'Encoder error'}`);
    } finally {
      setIsExportingVideo(false);
      setExportProgress(0);
      setExportStatusText('');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* 1. TOP HEADER & PLAY SELECTOR BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Active Play Selector & In-Place Title Editor */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black shadow-md shadow-orange-600/20">
              <Layers className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                  2D Campogram
                </span>
                
                {/* Editable Category */}
                <select
                  value={currentPlay.category}
                  onChange={(e) => handleUpdatePlayCategory(e.target.value)}
                  className="text-xs text-slate-600 font-bold bg-slate-100 rounded-md px-2 py-0.5 border-0 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <option value="Build-Up Phase">Build-Up Phase</option>
                  <option value="Offensive Transition">Offensive Transition</option>
                  <option value="High Press & Block">High Press & Block</option>
                  <option value="Set Pieces">Set Pieces</option>
                  <option value="Custom Routine">Custom Routine</option>
                </select>

                <span className="text-xs text-slate-400 font-medium">
                  • {currentPlay.steps.length} {currentPlay.steps.length === 1 ? 'Step' : 'Steps'}
                </span>
              </div>
              
              {/* Play Selector + In-Place Title Editor */}
              <div className="flex items-center gap-2 mt-1">
                {isEditingPlayTitle ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tempPlayTitle}
                      onChange={(e) => setTempPlayTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePlayTitle();
                        if (e.key === 'Escape') setIsEditingPlayTitle(false);
                      }}
                      autoFocus
                      className="text-sm font-extrabold text-slate-900 border border-orange-400 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={handleSavePlayTitle}
                      className="p-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                      title="Save Play Name"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPlayTitle(false)}
                      className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={activePlayId}
                      onChange={(e) => {
                        setActivePlayId(e.target.value);
                        setCurrentStepIndex(0);
                        setIsPlaying(false);
                      }}
                      className="text-base font-extrabold text-slate-900 bg-transparent border-0 border-b border-dashed border-slate-300 focus:ring-0 focus:border-orange-500 p-0 cursor-pointer"
                    >
                      {plays.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setTempPlayTitle(currentPlay.title);
                        setIsEditingPlayTitle(true);
                      }}
                      className="p-1 text-slate-400 hover:text-orange-600 rounded"
                      title="Rename this play"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions, Rival Selector, MP4 Download & Cloud Save */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Rival Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <span className="text-slate-500 font-medium">Opponent:</span>
              <select
                value={activeOpponentId}
                onChange={(e) => {
                  setActiveOpponentId(e.target.value);
                  if (onSelectOpponent) onSelectOpponent(e.target.value);
                }}
                className="bg-transparent font-bold text-slate-800 border-0 p-0 focus:ring-0 text-xs cursor-pointer"
              >
                {opponents.map(opp => (
                  <option key={opp.id} value={opp.id}>
                    {opp.name} ({opp.shortName})
                  </option>
                ))}
              </select>
              <span 
                className="w-3 h-3 rounded-full border border-black/20" 
                style={{ backgroundColor: selectedOpponent.primaryColor }}
                title={`Color: ${selectedOpponent.primaryColor}`}
              />
            </div>

            {/* MP4 VIDEO DOWNLOAD BUTTON */}
            <button
              type="button"
              onClick={handleExportMp4Video}
              disabled={isExportingVideo}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-black rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors disabled:opacity-50"
              title="Download tactical animation video as MP4"
            >
              <Video className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
              <span>{isExportingVideo ? `Rendering MP4 (${exportProgress}%)...` : 'Download MP4 Video'}</span>
            </button>

            {/* New Play */}
            <button
              type="button"
              onClick={handleCreateNewCustomPlay}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
              title="Create a new animated sequence from scratch"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-orange-600" />
              <span>New Play</span>
            </button>

            {/* Reset to Formations */}
            <button
              type="button"
              onClick={handleResetToFormations}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors"
              title="Reset player tokens to current formation positions"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Reset Formation</span>
            </button>

            {/* SAVE CHANGES TO CLOUD & CROSS-DEVICE SYNC */}
            {onSaveAll && (
              <button
                type="button"
                onClick={onSaveAll}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-1.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                title="Save squad & play changes to Supabase cloud for all devices"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Video rendering live progress banner */}
        {isExportingVideo && (
          <div className="mt-3 bg-slate-900 text-white p-3.5 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Film className="w-5 h-5 text-orange-400 animate-spin" />
              <div>
                <p className="text-xs font-bold text-slate-200">
                  {exportStatusText}
                </p>
                <p className="text-[10px] text-slate-400">
                  Encoding 1280x720 HD H.264 MP4 with frame-by-frame interpolation...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div 
                  className="bg-orange-500 h-full transition-all duration-150" 
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-black text-orange-400">{exportProgress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. MAIN WORKSPACE: PITCH + TIMELINE + SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT / CENTER: PITCH + TIMELINE SCRUBBER */}
        <div className={`${isExpanded ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-8 2xl:col-span-9'} space-y-3`}>
          
          {/* PITCH TOOLBAR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
            
            {/* View filters */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setActiveViewFilter('both')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeViewFilter === 'both' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Both Teams
              </button>
              <button
                type="button"
                onClick={() => setActiveViewFilter('hgufc')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeViewFilter === 'hgufc' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HGUFC Only
              </button>
              <button
                type="button"
                onClick={() => setActiveViewFilter('opponent')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeViewFilter === 'opponent' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {selectedOpponent.shortName} Only
              </button>
            </div>

            {/* Display options */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Token labels toggle */}
              <button
                type="button"
                onClick={() => {
                  setLabelMode(prev => prev === 'both' ? 'number' : prev === 'number' ? 'name' : 'both');
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                title="Toggle token labels: Number + Name, Number only, or Name only"
              >
                Labels: <span className="text-orange-600 font-extrabold capitalize">{labelMode === 'both' ? 'Number + Name' : labelMode === 'number' ? 'Number Only' : 'Name Only'}</span>
              </button>

              {/* Trajectories */}
              <button
                type="button"
                onClick={() => setShowMoveVectors(!showMoveVectors)}
                className={`inline-flex items-center px-2.5 py-1.5 rounded-xl border font-bold transition-all ${
                  showMoveVectors
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Toggle dynamic movement trajectory arrows between keyframes"
              >
                <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-amber-600" />
                <span>Trajectories</span>
              </button>

              {/* Tactical Corridors */}
              <button
                type="button"
                onClick={() => setShowFieldZones(!showFieldZones)}
                className={`inline-flex items-center px-2.5 py-1.5 rounded-xl border font-bold transition-all ${
                  showFieldZones
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Toggle half-spaces and 5 tactical corridors"
              >
                <Grid className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span className="hidden sm:inline">Channels</span>
              </button>

              {/* Expand */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                title={isExpanded ? 'Collapse' : 'Expand full width'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

          </div>

          {/* INTERACTIVE PITCH SURFACE */}
          <div 
            className="w-full bg-slate-900 rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center shadow-xl select-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div
              ref={pitchRef}
              style={{
                background: 'linear-gradient(to bottom, #15803d 0%, #166534 35%, #14532d 65%, #0f3d20 100%)',
              }}
              className={`relative w-full rounded-2xl shadow-2xl border-[6px] border-white/95 overflow-hidden transition-all duration-300 ${
                isExpanded 
                  ? 'max-w-[1080px] h-[640px] sm:h-[760px] lg:h-[860px]' 
                  : 'max-w-[880px] 2xl:max-w-[940px] h-[580px] sm:h-[680px] lg:h-[760px]'
              }`}
            >
              {/* Lawn mowing bands */}
              <div className="absolute inset-0 flex flex-col pointer-events-none opacity-20">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-full flex-1 ${i % 2 === 0 ? 'bg-white/12' : 'bg-transparent'}`} 
                  />
                ))}
              </div>

              {/* Stadium lighting glow */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                  background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(74, 222, 128, 0.4) 0%, rgba(20, 83, 45, 0.1) 60%, rgba(15, 61, 32, 0.5) 100%)',
                }}
              />

              {/* Tactical Corridors */}
              {showFieldZones && (
                <div className="absolute inset-0 pointer-events-none z-5">
                  <div className="absolute inset-0 grid grid-cols-5 h-full opacity-35">
                    <div className="border-r border-dashed border-amber-300 bg-amber-500/5 flex items-start justify-center pt-2">
                      <span className="text-[10px] font-black tracking-widest text-amber-200 uppercase">Left Flank</span>
                    </div>
                    <div className="border-r border-dashed border-amber-300 bg-amber-500/15 flex items-start justify-center pt-2">
                      <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase">Left Half-Space</span>
                    </div>
                    <div className="border-r border-dashed border-amber-300 bg-amber-500/5 flex items-start justify-center pt-2">
                      <span className="text-[10px] font-black tracking-widest text-amber-200 uppercase">Center Channel</span>
                    </div>
                    <div className="border-r border-dashed border-amber-300 bg-amber-500/15 flex items-start justify-center pt-2">
                      <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase">Right Half-Space</span>
                    </div>
                    <div className="bg-amber-500/5 flex items-start justify-center pt-2">
                      <span className="text-[10px] font-black tracking-widest text-amber-200 uppercase">Right Flank</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SVG Markings */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="2.5" y="2.5" width="95" height="95" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <line x1="2.5" y1="50" x2="97.5" y2="50" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <circle cx="50" cy="50" r="10.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <circle cx="50" cy="50" r="0.95" fill="#ffffff" opacity="0.95" />

                {/* Top Goal Area (Opponent) */}
                <rect x="22" y="2.5" width="56" height="17.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <rect x="36" y="2.5" width="28" height="6.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <circle cx="50" cy="12.5" r="0.95" fill="#ffffff" opacity="0.95" />
                <path d="M 39.5 20 A 9.5 9.5 0 0 0 60.5 20" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <rect x="42" y="0.8" width="16" height="1.7" fill="#ffffff" opacity="0.6" stroke="#ffffff" strokeWidth="0.6" />

                {/* Bottom Goal Area (HGUFC) */}
                <rect x="22" y="80" width="56" height="17.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <rect x="36" y="91" width="28" height="6.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <circle cx="50" cy="87.5" r="0.95" fill="#ffffff" opacity="0.95" />
                <path d="M 39.5 80 A 9.5 9.5 0 0 1 60.5 80" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <rect x="42" y="97.5" width="16" height="1.7" fill="#ffffff" opacity="0.6" stroke="#ffffff" strokeWidth="0.6" />

                {/* Corner Arcs */}
                <path d="M 2.5 5.5 A 3 3 0 0 0 5.5 2.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <path d="M 97.5 5.5 A 3 3 0 0 1 94.5 2.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <path d="M 2.5 94.5 A 3 3 0 0 1 5.5 97.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
                <path d="M 97.5 94.5 A 3 3 0 0 0 94.5 97.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />

                {/* Arrow markers */}
                <defs>
                  <marker id="arrow-vector-hgufc" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#f97316" />
                  </marker>
                  <marker id="arrow-vector-rival" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#38bdf8" />
                  </marker>
                  <marker id="arrow-vector-ball" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#facc15" />
                  </marker>
                </defs>

                {/* Trajectory lines */}
                {showMoveVectors && prevStep && !isPlaying && (
                  <>
                    {currentStep.tokens.map(token => {
                      const prevToken = prevStep.tokens.find(pt => pt.id === token.id);
                      if (!prevToken) return null;

                      const dx = token.x - prevToken.x;
                      const dy = token.y - prevToken.y;
                      const dist = Math.sqrt(dx * dx + dy * dy);

                      if (dist < 2.5) return null;

                      const isBall = token.type === 'ball';
                      const isHgufc = token.type === 'hgufc';
                      const color = isBall ? '#facc15' : isHgufc ? '#f97316' : '#38bdf8';
                      const marker = isBall ? 'url(#arrow-vector-ball)' : isHgufc ? 'url(#arrow-vector-hgufc)' : 'url(#arrow-vector-rival)';

                      return (
                        <g key={`vector-${token.id}`}>
                          <circle 
                            cx={prevToken.x} 
                            cy={prevToken.y} 
                            r={isBall ? 1.5 : 2} 
                            fill={color} 
                            opacity="0.35" 
                          />
                          <line
                            x1={prevToken.x}
                            y1={prevToken.y}
                            x2={token.x}
                            y2={token.y}
                            stroke={color}
                            strokeWidth={isBall ? '1.8' : '1.4'}
                            strokeDasharray={isBall ? '2 2' : 'none'}
                            opacity="0.85"
                            markerEnd={marker}
                          />
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>

              {/* RENDER PLAYERS & BALL */}
              {renderedTokens.map(token => {
                if (activeViewFilter === 'hgufc' && token.type === 'opponent') return null;
                if (activeViewFilter === 'opponent' && token.type === 'hgufc') return null;

                const isSelected = selectedTokenId === token.id;
                const isDragging = draggingTokenId === token.id;
                const isBall = token.type === 'ball';
                const isHgufc = token.type === 'hgufc';

                if (isBall) {
                  return (
                    <div
                      key={token.id}
                      onPointerDown={(e) => handlePointerDown(e, token.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTokenId(token.id);
                      }}
                      style={{
                        left: `${token.x}%`,
                        top: `${token.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className={`absolute z-30 cursor-grab active:cursor-grabbing transition-transform ${
                        isDragging ? 'scale-125 z-40' : 'hover:scale-115'
                      }`}
                      title="Match Ball ⚽ - Drag anywhere"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-slate-900 border-2 border-slate-900 flex items-center justify-center text-sm shadow-xl drop-shadow-md">
                        ⚽
                      </div>
                      {isSelected && (
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-yellow-300 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                          Ball ⚽
                        </div>
                      )}
                    </div>
                  );
                }

                // Player Token
                const tokenBg = isHgufc ? '#EA580C' : (selectedOpponent.primaryColor || '#002B49');
                const tokenTextColor = isHgufc ? '#FFFFFF' : (selectedOpponent.secondaryColor || '#FFFFFF');
                const isGk = token.position === 'GK';

                return (
                  <div
                    key={token.id}
                    onPointerDown={(e) => handlePointerDown(e, token.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTokenId(token.id);
                    }}
                    style={{
                      left: `${token.x}%`,
                      top: `${token.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-20 cursor-grab active:cursor-grabbing transition-shadow ${
                      isDragging ? 'scale-115 z-40' : 'hover:scale-105'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center font-extrabold shadow-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-yellow-400 ring-4 ring-yellow-400/40 shadow-2xl' 
                          : isGk
                            ? 'border-yellow-300 ring-1 ring-yellow-400/30'
                            : 'border-white/90 shadow-md'
                      }`}
                      style={{
                        backgroundColor: isGk ? '#0284c7' : tokenBg,
                        color: tokenTextColor,
                      }}
                    >
                      <span className="text-[12px] sm:text-[13px] font-black leading-none drop-shadow">
                        {token.number}
                      </span>
                      {token.role && (
                        <span className="text-[8px] font-mono font-bold uppercase opacity-85 leading-none mt-0.5">
                          {token.role}
                        </span>
                      )}
                    </div>

                    {/* Name Pill Badge below token */}
                    {(labelMode === 'both' || labelMode === 'name') && (
                      <div 
                        className={`absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.2 rounded-full text-[9px] font-bold shadow-md pointer-events-none transition-all ${
                          isHgufc 
                            ? 'bg-slate-900/90 text-orange-200 border border-orange-500/30' 
                            : 'bg-slate-900/90 text-sky-200 border border-sky-500/30'
                        }`}
                      >
                        {token.name.split(' ').slice(-1)[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Instruction tooltip */}
            <div className="mt-3 flex items-center justify-between w-full max-w-[880px] text-xs text-slate-300 px-2">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Info className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>
                  {isPlaying 
                    ? 'Playing tactical animation. Pause anytime to adjust positions or swap players.'
                    : 'Click & drag tokens to position them. Click Swap on any player to substitute.'}
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentStep.tokens.length} Field Tokens
              </span>
            </div>
          </div>

          {/* 3. ANIMATION CONTROLS & TIMELINE BAR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            
            {/* Top row: Play/Pause/Scrub buttons + Speed + Loop */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                
                {/* Reset to Step 1 */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(0);
                    setAnimProgress(0);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                  title="Reset to Step 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Prev step */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(prev => Math.max(0, prev - 1));
                  }}
                  disabled={currentStepIndex === 0}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors disabled:opacity-40"
                  title="Previous Step"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* PLAY / PAUSE BUTTON */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all ${
                    isPlaying 
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-4 ring-amber-400/20' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white ring-4 ring-orange-600/20'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Animation</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play Animation</span>
                    </>
                  )}
                </button>

                {/* Next step */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(prev => Math.min(currentPlay.steps.length - 1, prev + 1));
                  }}
                  disabled={currentStepIndex === currentPlay.steps.length - 1}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors disabled:opacity-40"
                  title="Next Step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

              </div>

              {/* Speed & Loop toggles */}
              <div className="flex items-center gap-2 text-xs">
                
                {/* Speed selector */}
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 font-bold">
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 rounded-lg transition-colors ${
                        playbackSpeed === speed ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                {/* Loop toggle */}
                <button
                  type="button"
                  onClick={() => setIsLooping(!isLooping)}
                  className={`inline-flex items-center px-2.5 py-1.5 rounded-xl border font-bold transition-all ${
                    isLooping 
                      ? 'bg-orange-100 text-orange-900 border-orange-300' 
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                  title="Loop animation continuously"
                >
                  <Repeat className="w-3.5 h-3.5 mr-1" />
                  <span>Loop</span>
                </button>

              </div>

            </div>

            {/* Step badges timeline */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                  Keyframes:
                </span>

                {currentPlay.steps.map((st, idx) => {
                  const isActive = currentStepIndex === idx;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIndex(idx);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm ring-2 ring-orange-500'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-orange-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{st.title.split(':')[0] || `Step ${idx + 1}`}</span>
                    </button>
                  );
                })}

                {/* Button: Add Step */}
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl border border-dashed border-orange-400 text-orange-700 hover:bg-orange-50 text-xs font-bold transition-colors"
                  title="Add next step duplicating current positions"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>+ Add Step</span>
                </button>

                {/* Button: Delete current Step */}
                {currentPlay.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteStep(currentStepIndex)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-auto"
                    title="Delete this step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Current Step Description (Editable in text) */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <input
                  type="text"
                  value={currentStep.title}
                  onChange={(e) => handleUpdateStepTitle(e.target.value)}
                  placeholder="Step title (e.g., Step 1: Deep Goal-Kick Shape)"
                  className="font-extrabold text-xs text-slate-900 bg-transparent border-0 border-b border-dashed border-slate-300 p-0 focus:ring-0 w-full"
                />
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  Step {currentStepIndex + 1} of {currentPlay.steps.length}
                </span>
              </div>
              <input
                type="text"
                value={currentStep.description || ''}
                onChange={(e) => handleUpdateStepDescription(e.target.value)}
                placeholder="Tactical instructions and movement description for this phase..."
                className="mt-1 text-xs text-slate-600 bg-transparent border-0 border-b border-dashed border-slate-300 p-0 focus:ring-0 w-full"
              />
            </div>

          </div>

        </div>

        {/* RIGHT: SQUAD ROSTER, RIVAL SQUAD & QUICK ACTIONS DRAWER */}
        <div className={`${isExpanded ? 'lg:col-span-12 mt-4' : 'lg:col-span-4 xl:col-span-4 2xl:col-span-3'} space-y-4`}>
          
          {/* Selected Token Inspector Card */}
          {selectedToken && (
            <div className="bg-white rounded-2xl border-2 border-orange-500 shadow-md p-4 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white shadow"
                    style={{ backgroundColor: selectedToken.teamColor || '#EA580C' }}
                  >
                    {selectedToken.type === 'ball' ? '⚽' : selectedToken.number}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">
                      {selectedToken.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">
                      {selectedToken.type === 'hgufc' ? 'Hougang United FC' : selectedToken.type === 'opponent' ? selectedOpponent.name : 'Object'} • ({selectedToken.x}%, {selectedToken.y}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Swap Player Button */}
                  {selectedToken.type !== 'ball' && (
                    <button
                      type="button"
                      onClick={() => handleOpenSwapModal(selectedToken)}
                      className="inline-flex items-center px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-[10px] font-black transition-colors shadow-2xs"
                      title="Swap this player with another player from the squad"
                    >
                      <ArrowLeftRight className="w-3 h-3 mr-1" />
                      <span>Swap</span>
                    </button>
                  )}

                  {selectedToken.type !== 'ball' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveToken(selectedToken.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
                      title="Remove player from pitch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Nudge Controls */}
              <div className="mt-3 grid grid-cols-4 gap-1 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    const newY = Math.max(3, selectedToken.y - 3);
                    const updated = plays.map(p => p.id === currentPlay.id ? {
                      ...p,
                      steps: p.steps.map((st, i) => i === currentStepIndex ? {
                        ...st,
                        tokens: st.tokens.map(t => t.id === selectedToken.id ? { ...t, y: newY } : t)
                      } : st)
                    } : p);
                    updatePlaysList(updated);
                  }}
                  className="py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  ↑ Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newY = Math.min(97, selectedToken.y + 3);
                    const updated = plays.map(p => p.id === currentPlay.id ? {
                      ...p,
                      steps: p.steps.map((st, i) => i === currentStepIndex ? {
                        ...st,
                        tokens: st.tokens.map(t => t.id === selectedToken.id ? { ...t, y: newY } : t)
                      } : st)
                    } : p);
                    updatePlaysList(updated);
                  }}
                  className="py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  ↓ Down
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newX = Math.max(3, selectedToken.x - 3);
                    const updated = plays.map(p => p.id === currentPlay.id ? {
                      ...p,
                      steps: p.steps.map((st, i) => i === currentStepIndex ? {
                        ...st,
                        tokens: st.tokens.map(t => t.id === selectedToken.id ? { ...t, x: newX } : t)
                      } : st)
                    } : p);
                    updatePlaysList(updated);
                  }}
                  className="py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  ← Left
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newX = Math.min(97, selectedToken.x + 3);
                    const updated = plays.map(p => p.id === currentPlay.id ? {
                      ...p,
                      steps: p.steps.map((st, i) => i === currentStepIndex ? {
                        ...st,
                        tokens: st.tokens.map(t => t.id === selectedToken.id ? { ...t, x: newX } : t)
                      } : st)
                    } : p);
                    updatePlaysList(updated);
                  }}
                  className="py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  → Right
                </button>
              </div>
            </div>
          )}

          {/* SIDEBAR TABS: HGUFC Squad, Rival Squad, Ball & Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            <div className="grid grid-cols-4 border-b border-slate-200 text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => setActiveSidebarTab('hgufc')}
                className={`py-2.5 transition-colors ${
                  activeSidebarTab === 'hgufc' 
                    ? 'border-b-2 border-orange-600 text-orange-600 bg-orange-50/40 font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HGUFC
              </button>
              <button
                type="button"
                onClick={() => setActiveSidebarTab('rival')}
                className={`py-2.5 transition-colors ${
                  activeSidebarTab === 'rival' 
                    ? 'border-b-2 border-slate-900 text-slate-900 bg-slate-50 font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rival
              </button>
              <button
                type="button"
                onClick={() => setActiveSidebarTab('ball')}
                className={`py-2.5 transition-colors ${
                  activeSidebarTab === 'ball' 
                    ? 'border-b-2 border-yellow-500 text-yellow-700 bg-yellow-50/40 font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ball ⚽
              </button>
              <button
                type="button"
                onClick={() => setActiveSidebarTab('notes')}
                className={`py-2.5 transition-colors ${
                  activeSidebarTab === 'notes' 
                    ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/40 font-extrabold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Notes
              </button>
            </div>

            <div className="p-3 sm:p-4 max-h-[580px] overflow-y-auto">
              
              {/* TAB 1: HGUFC SQUAD LIST */}
              {activeSidebarTab === 'hgufc' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
                    <span>Hougang United Roster</span>
                    <span className="text-[10px]">{players.length} Players</span>
                  </div>

                  <p className="text-[10px] text-slate-400 mb-2">
                    Exact roster names. Click <strong>Swap</strong> to substitute any player across all play routines.
                  </p>

                  <div className="space-y-1.5">
                    {players.map(player => {
                      const onPitchToken = currentStep.tokens.find(t => t.originalId === player.id && t.type === 'hgufc');
                      const isOnPitch = !!onPitchToken;

                      return (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                            isOnPitch 
                              ? 'bg-orange-50/40 border-orange-200 text-slate-900' 
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-black text-[11px] flex items-center justify-center">
                              {player.number}
                            </span>
                            <div>
                              <div className="font-extrabold text-slate-900 text-[11px]">
                                {player.name}
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono">
                                {player.position} {player.roleLabel ? `• ${player.roleLabel}` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isOnPitch ? (
                              <>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black">
                                  Pitch
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenSwapModal(onPitchToken)}
                                  className="px-2 py-0.5 rounded-lg bg-orange-200 hover:bg-orange-300 text-orange-900 text-[10px] font-bold"
                                  title="Swap position with another player"
                                >
                                  Swap
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handlePlacePlayerOnPitch(player)}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                              >
                                + Place
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: RIVAL SQUAD LIST */}
              {activeSidebarTab === 'rival' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
                    <span className="flex items-center gap-1.5">
                      <span 
                        className="w-3 h-3 rounded-full border border-black/20" 
                        style={{ backgroundColor: selectedOpponent.primaryColor }}
                      />
                      <span>{selectedOpponent.name}</span>
                    </span>
                    <span className="text-[10px]">{selectedOpponent.players?.length || 11} Players</span>
                  </div>

                  <p className="text-[10px] text-slate-400 mb-2">
                    Rival squad roster. Click <strong>Swap</strong> to substitute rival player positions.
                  </p>

                  <div className="space-y-1.5">
                    {(selectedOpponent.players || []).map((oppPlayer, idx) => {
                      const onPitchToken = currentStep.tokens.find(t => t.originalId === oppPlayer.id && t.type === 'opponent');
                      const isOnPitch = !!onPitchToken;

                      return (
                        <div
                          key={oppPlayer.id || idx}
                          className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white text-xs hover:border-slate-300"
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-6 h-6 rounded-full font-black text-[11px] flex items-center justify-center text-white"
                              style={{ backgroundColor: selectedOpponent.primaryColor || '#002B49' }}
                            >
                              {oppPlayer.number || idx + 1}
                            </span>
                            <div>
                              <div className="font-extrabold text-slate-900 text-[11px]">
                                {oppPlayer.name}
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono">
                                {oppPlayer.position} • {oppPlayer.role}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {isOnPitch ? (
                              <>
                                <span className="text-[9px] text-slate-400 font-bold">On Field</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenSwapModal(onPitchToken)}
                                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                                  title="Swap rival player"
                                >
                                  Swap
                                </button>
                              </>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-mono">Bench</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: BALL ⚽ */}
              {activeSidebarTab === 'ball' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200 text-yellow-900">
                    <div className="font-extrabold mb-1 flex items-center gap-1.5">
                      <span>⚽ Ball Tracking</span>
                    </div>
                    <p className="text-[11px] text-yellow-800">
                      Drag the ball on the pitch to establish pass destinations for each keyframe. In animation playback, the ball glides smoothly along pass routes.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Quick Ball Placement:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMoveBallTo('center')}
                      className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 transition-colors"
                    >
                      📍 Center Spot (50%, 50%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveBallTo('gk')}
                      className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 transition-colors"
                    >
                      🧤 HGUFC Goalkeeper (Goal-kick)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveBallTo('rival_penalty')}
                      className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 transition-colors"
                    >
                      🎯 Opponent Penalty Spot (Finishing Box)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveBallTo('corner')}
                      className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 transition-colors"
                    >
                      🚩 Corner Arc Flag
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: PLAY NOTES (Editable in text) */}
              {activeSidebarTab === 'notes' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      Play Routine Name:
                    </label>
                    <input
                      type="text"
                      value={currentPlay.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const updated = plays.map(p => p.id === currentPlay.id ? { ...p, title: newTitle } : p);
                        updatePlaysList(updated);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-extrabold text-slate-900 text-xs focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      Tactical Category:
                    </label>
                    <select
                      value={currentPlay.category}
                      onChange={(e) => handleUpdatePlayCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 text-xs"
                    >
                      <option value="Build-Up Phase">Build-Up Phase</option>
                      <option value="Offensive Transition">Offensive Transition</option>
                      <option value="High Press & Block">High Press & Block</option>
                      <option value="Set Pieces">Set Pieces</option>
                      <option value="Custom Routine">Custom Routine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      Tactical Description & Instructions:
                    </label>
                    <textarea
                      rows={3}
                      value={currentPlay.description}
                      onChange={(e) => handleUpdatePlayDescription(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Explain tactical triggers, channels, and player responsibilities..."
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                    <span className="text-[10px]">Autosaved to device & sync-ready</span>
                    {onSaveAll && (
                      <button
                        type="button"
                        onClick={onSaveAll}
                        className="text-emerald-700 font-extrabold text-xs hover:underline flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Sync to Supabase Cloud</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* 4. PLAYER SWAP MODAL */}
      {isSwapModalOpen && tokenToSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-orange-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Swap / Substitute Player
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
              <span 
                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white"
                style={{ backgroundColor: tokenToSwap.teamColor || '#EA580C' }}
              >
                {tokenToSwap.number}
              </span>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Current Player on Pitch</p>
                <p className="text-xs font-black text-slate-900">{tokenToSwap.name} ({tokenToSwap.position})</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Swap with Player from {tokenToSwap.type === 'hgufc' ? 'Hougang United Roster' : selectedOpponent.name}:
              </label>
              
              <select
                value={targetSwapPlayerId}
                onChange={(e) => setTargetSwapPlayerId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-800 focus:ring-orange-500 focus:border-orange-500"
              >
                {tokenToSwap.type === 'hgufc' ? (
                  players.map(p => {
                    const isAlreadyOnPitch = currentStep.tokens.some(t => t.originalId === p.id);
                    return (
                      <option key={p.id} value={p.id} disabled={p.id === tokenToSwap.originalId}>
                        #{p.number} {p.name} ({p.position}) {isAlreadyOnPitch ? '— [On Pitch (Swap Position)]' : '— [Bench (Substitute In)]'}
                      </option>
                    );
                  })
                ) : (
                  (selectedOpponent.players || []).map(opp => {
                    const isAlreadyOnPitch = currentStep.tokens.some(t => t.originalId === opp.id);
                    return (
                      <option key={opp.id} value={opp.id} disabled={opp.id === tokenToSwap.originalId}>
                        #{opp.number} {opp.name} ({opp.position}) {isAlreadyOnPitch ? '— [On Pitch]' : '— [Rival Roster]'}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applySwapToAllPlays}
                  onChange={(e) => setApplySwapToAllPlays(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 mt-0.5"
                />
                <span className="font-semibold text-[11px]">
                  Apply this squad modification across all tactical play routines (preserves line-up when switching plays)
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(false)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteSwap(applySwapToAllPlays)}
                className="px-4 py-2 text-xs font-black rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
              >
                Confirm Player Swap
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. MP4 VIDEO READY DOWNLOAD MODAL */}
      {isVideoModalOpen && exportedVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-700 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-orange-400" />
                <h3 className="font-extrabold text-sm text-white">
                  Tactical MP4 Video Ready!
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
              <video 
                src={exportedVideoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400">
                1280x720 HD MP4 video with squad movements and tactical titles.
              </p>
              
              <div className="flex items-center gap-2">
                <a
                  href={exportedVideoUrl}
                  download={`tactical_play_${currentPlay.title.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.mp4`}
                  className="inline-flex items-center px-4 py-2 text-xs font-black rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-md transition-colors"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  <span>Download MP4 Again</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
