import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Grid, 
  Sparkles, 
  X, 
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Share2,
  Activity,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Palette,
  Shield,
  Edit2
} from 'lucide-react';
import { Player, Formation, OpponentTeam, OpponentPlayer } from '../types';

interface TacticalPitchProps {
  hgufcFormation: Formation;
  rivalFormation: Formation;
  opponent: OpponentTeam;
  players: Player[];
  activeView: 'both' | 'hgufc' | 'opponent';
  showZones: boolean;
  onUpdateView: (view: 'both' | 'hgufc' | 'opponent') => void;
  onToggleZones: () => void;
  onUpdatePlayerPosition: (playerId: string, x: number, y: number) => void;
  onAutoAssignStartingXI: () => void;
  onSelectPlayerForDetail: (player: Player) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onUpdateRivalPlayer?: (index: number, updated: Partial<OpponentPlayer>) => void;
  onOpenRivalCustomizer?: () => void;
}

interface TacticalArrow {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: 'pass' | 'run' | 'press';
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  hgufcFormation,
  rivalFormation,
  opponent,
  players,
  activeView,
  showZones,
  onUpdateView,
  onToggleZones,
  onUpdatePlayerPosition,
  onAutoAssignStartingXI,
  onSelectPlayerForDetail,
  isExpanded = false,
  onToggleExpand,
  onUpdateRivalPlayer,
  onOpenRivalCustomizer,
}) => {
  const pitchRef = useRef<HTMLDivElement>(null);
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  const [selectedBoardPlayerId, setSelectedBoardPlayerId] = useState<string | null>(null);
  const [selectedRivalIndex, setSelectedRivalIndex] = useState<number | null>(null);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const [activeDragCoords, setActiveDragCoords] = useState<{ x: number; y: number } | null>(null);

  // Resolution & Pitch Scale Zoom State: 100% (Normal), 110% (Large), 120% (Extra-Large)
  const [pitchZoom, setPitchZoom] = useState<number>(100);

  // ARROWS: Clean by default with zero arrows on load
  const [arrows, setArrows] = useState<TacticalArrow[]>([]);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowType, setArrowType] = useState<'pass' | 'run' | 'press'>('run');
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);

  // Overlays
  const [showPassingNetwork, setShowPassingNetwork] = useState(false);
  const [showControlRadius, setShowControlRadius] = useState(false);

  // Local state for dragging rival tokens
  const [rivalPositions, setRivalPositions] = useState<{ [index: number]: { x: number; y: number } }>({});
  const [draggingRivalIndex, setDraggingRivalIndex] = useState<number | null>(null);

  // When rival formation changes, reset rival tokens to formation mirror coordinates
  useEffect(() => {
    const posMap: { [index: number]: { x: number; y: number } } = {};
    rivalFormation.positions.forEach((pos, idx) => {
      const rivalY = 100 - pos.y;
      posMap[idx] = { x: pos.x, y: rivalY };
    });
    setRivalPositions(posMap);
  }, [rivalFormation]);

  // Pointer drag handling for HGUFC Players
  const handlePointerDown = (e: React.PointerEvent, playerId: string) => {
    if (isDrawingArrow) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingPlayerId(playerId);
    setSelectedBoardPlayerId(playerId);
    setSelectedRivalIndex(null);

    const player = players.find(p => p.id === playerId);
    if (player && player.pitchX !== undefined && player.pitchY !== undefined) {
      setActiveDragCoords({ x: player.pitchX, y: player.pitchY });
    }
  };

  const handleRivalPointerDown = (e: React.PointerEvent, index: number) => {
    if (isDrawingArrow) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingRivalIndex(index);
    setSelectedRivalIndex(index);
    setSelectedBoardPlayerId(null);
    const pos = rivalPositions[index];
    if (pos) {
      setActiveDragCoords(pos);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = Math.max(3, Math.min(97, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(3, Math.min(97, ((e.clientY - rect.top) / rect.height) * 100));
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);

    if (draggingPlayerId) {
      setActiveDragCoords({ x: roundedX, y: roundedY });
      onUpdatePlayerPosition(draggingPlayerId, roundedX, roundedY);
    } else if (draggingRivalIndex !== null) {
      setActiveDragCoords({ x: roundedX, y: roundedY });
      setRivalPositions(prev => ({
        ...prev,
        [draggingRivalIndex]: { x: roundedX, y: roundedY }
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingPlayerId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }
      setDraggingPlayerId(null);
      setActiveDragCoords(null);
    }
    if (draggingRivalIndex !== null) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }
      setDraggingRivalIndex(null);
      setActiveDragCoords(null);
    }
  };

  // Arrow drawing
  const handlePitchClick = (e: React.MouseEvent) => {
    if (!isDrawingArrow || !pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (!arrowStart) {
      setArrowStart({ x, y });
    } else {
      const newArrow: TacticalArrow = {
        id: `arrow-${Date.now()}`,
        startX: arrowStart.x,
        startY: arrowStart.y,
        endX: x,
        endY: y,
        type: arrowType
      };
      setArrows(prev => [...prev, newArrow]);
      setArrowStart(null);
    }
  };

  // Micro-adjustment for selected HGUFC player
  const handleNudgePlayer = (dx: number, dy: number) => {
    if (!selectedBoardPlayerId) return;
    const player = players.find(p => p.id === selectedBoardPlayerId);
    if (!player || player.pitchX === undefined || player.pitchY === undefined) return;
    const newX = Math.max(3, Math.min(97, player.pitchX + dx));
    const newY = Math.max(3, Math.min(97, player.pitchY + dy));
    onUpdatePlayerPosition(selectedBoardPlayerId, newX, newY);
  };

  // Micro-adjustment for selected rival player
  const handleNudgeRival = (dx: number, dy: number) => {
    if (selectedRivalIndex === null) return;
    const current = rivalPositions[selectedRivalIndex] || { 
      x: rivalFormation.positions[selectedRivalIndex]?.x || 50, 
      y: 100 - (rivalFormation.positions[selectedRivalIndex]?.y || 50) 
    };
    const newX = Math.max(3, Math.min(97, current.x + dx));
    const newY = Math.max(3, Math.min(97, current.y + dy));
    setRivalPositions(prev => ({
      ...prev,
      [selectedRivalIndex]: { x: newX, y: newY }
    }));
  };

  // Active starting XI on pitch
  const onPitchPlayers = players.filter(p => p.pitchX !== undefined && p.pitchY !== undefined);
  const selectedPlayer = players.find(p => p.id === selectedBoardPlayerId);

  // Selected Rival Player details
  const selectedRivalPlayer: OpponentPlayer | null = useMemo(() => {
    if (selectedRivalIndex === null) return null;
    if (opponent.players && opponent.players[selectedRivalIndex]) {
      return opponent.players[selectedRivalIndex];
    }
    const defaultPos = rivalFormation.positions[selectedRivalIndex];
    return {
      id: `rival-p-${selectedRivalIndex}`,
      name: `${opponent.shortName} Player #${selectedRivalIndex + 1}`,
      number: selectedRivalIndex + 1,
      position: defaultPos?.position || 'MID',
      role: defaultPos?.role || 'MID',
    };
  }, [selectedRivalIndex, opponent, rivalFormation]);

  // Generate passing network lines between neighboring outfield players
  const passingPairs = useMemo(() => {
    if (!showPassingNetwork || onPitchPlayers.length < 2) return [];
    const pairs: { p1: Player; p2: Player }[] = [];
    const outfield = onPitchPlayers.filter(p => p.position !== 'GK');
    
    for (let i = 0; i < outfield.length; i++) {
      for (let j = i + 1; j < outfield.length; j++) {
        const p1 = outfield[i];
        const p2 = outfield[j];
        if (p1.pitchX !== undefined && p1.pitchY !== undefined && p2.pitchX !== undefined && p2.pitchY !== undefined) {
          const dist = Math.hypot(p1.pitchX - p2.pitchX, p1.pitchY - p2.pitchY);
          if (dist < 36) {
            pairs.push({ p1, p2 });
          }
        }
      }
    }
    return pairs;
  }, [showPassingNetwork, onPitchPlayers]);

  const getZoneLabel = (x: number, y: number) => {
    let horizontal = 'Central Corridor';
    if (x < 20) horizontal = 'Left Flank';
    else if (x < 40) horizontal = 'Left Half-Space';
    else if (x > 80) horizontal = 'Right Flank';
    else if (x > 60) horizontal = 'Right Half-Space';

    let vertical = 'Middle Third';
    if (y < 33) vertical = 'Attacking Third';
    else if (y > 67) vertical = 'Defensive Third';

    return `${horizontal} • ${vertical}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/90 overflow-hidden flex flex-col h-full transition-all">
      
      {/* Modern Pitch Header & Comprehensive English Controls */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Tactical Mode Toggle (Clash / HGUFC / Opponent) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/90 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => onUpdateView('both')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'both' 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tactical Clash
            </button>
            <button
              type="button"
              onClick={() => onUpdateView('hgufc')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'hgufc' 
                  ? 'bg-orange-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HGUFC Shape
            </button>
            <button
              type="button"
              onClick={() => onUpdateView('opponent')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'opponent' 
                  ? 'bg-slate-800 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opponent.shortName} Shape
            </button>
          </div>

          {/* Half-Spaces & Zone 14 */}
          <button
            type="button"
            onClick={onToggleZones}
            className={`inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              showZones 
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            title="Toggle Tactical Half-Spaces & Zone 14 corridors"
          >
            <Grid className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            <span>Half-Spaces</span>
          </button>

          {/* Pass Network Toggle */}
          <button
            type="button"
            onClick={() => setShowPassingNetwork(!showPassingNetwork)}
            className={`inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              showPassingNetwork 
                ? 'bg-sky-100 text-sky-900 border-sky-300 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            title="Show dynamic passing combination channels"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
            <span className="hidden md:inline">Pass Network</span>
          </button>

          {/* Player Influence Radius */}
          <button
            type="button"
            onClick={() => setShowControlRadius(!showControlRadius)}
            className={`inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              showControlRadius 
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
            title="Show player spatial control & pressing radius"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            <span className="hidden md:inline">Control Radius</span>
          </button>

          {/* Customize Rival Button */}
          {onOpenRivalCustomizer && (
            <button
              type="button"
              onClick={onOpenRivalCustomizer}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
              title="Customize Rival Kit Color, Crest Logo & Players"
            >
              <span 
                className="w-3 h-3 rounded-full mr-1.5 border border-black/20" 
                style={{ backgroundColor: opponent.primaryColor }}
              />
              <Palette className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>Customize Rival</span>
            </button>
          )}
        </div>

        {/* Right: Board Scale Zoom, Drawing & Expand Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Pitch Scale Zoom Selector */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs items-center text-xs">
            <span className="px-2 text-[10px] font-black uppercase text-slate-400">Scale</span>
            <button
              type="button"
              onClick={() => setPitchZoom(100)}
              className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                pitchZoom === 100 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => setPitchZoom(110)}
              className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                pitchZoom === 110 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              110%
            </button>
            <button
              type="button"
              onClick={() => setPitchZoom(120)}
              className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                pitchZoom === 120 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              120%
            </button>
          </div>

          {/* Optional Arrow Drawing Tool */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => {
                setIsDrawingArrow(!isDrawingArrow);
                setArrowStart(null);
              }}
              className={`inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isDrawingArrow 
                  ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-orange-600" />
              {isDrawingArrow ? 'Drawing Run...' : 'Draw Run'}
            </button>

            {isDrawingArrow && (
              <select
                aria-label="Tactical Vector Type"
                value={arrowType}
                onChange={(e) => setArrowType(e.target.value as any)}
                className="text-xs bg-slate-50 border-l border-slate-200 px-2 py-0.5 font-medium text-slate-700"
              >
                <option value="run">Movement Run (Orange)</option>
                <option value="pass">Pass Vector (Yellow)</option>
                <option value="press">Pressing Trap (Red)</option>
              </select>
            )}

            {arrows.length > 0 && (
              <button
                type="button"
                onClick={() => setArrows([])}
                className="px-2 py-1.5 text-slate-400 hover:text-red-600 transition-colors"
                title="Clear all tactical arrows"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Auto-Fill Starting XI */}
          <button
            type="button"
            onClick={onAutoAssignStartingXI}
            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors shadow-2xs"
            title="Auto-place 11 players into chosen formation"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-orange-600" />
            <span className="hidden sm:inline">Auto-Fill XI</span>
          </button>

          {/* Enlarge / Full Screen Pitch Button */}
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                isExpanded 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isExpanded ? 'Restore standard board view' : 'Maximize tactical board to full width'}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                  <span>Standard View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
                  <span>Enlarge Board</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2D High-Resolution Responsive Stadium Canvas */}
      <div 
        className={`relative flex-1 bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 p-3 sm:p-6 lg:p-8 flex items-center justify-center select-none overflow-x-auto overflow-y-hidden transition-all duration-300 ${
          isExpanded 
            ? 'min-h-[760px] sm:min-h-[860px] lg:min-h-[960px] xl:min-h-[1040px]' 
            : 'min-h-[680px] sm:min-h-[780px] lg:min-h-[860px] xl:min-h-[920px]'
        }`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        
        {/* Pitch Container with True Football Aspect Ratio & Dynamic Zoom */}
        <div 
          ref={pitchRef}
          onClick={handlePitchClick}
          style={{
            transform: pitchZoom !== 100 ? `scale(${pitchZoom / 100})` : 'none',
            transformOrigin: 'center center',
            background: 'linear-gradient(to bottom, #15803d 0%, #166534 35%, #14532d 65%, #0f3d20 100%)',
          }}
          className={`relative w-full rounded-2xl shadow-2xl border-[6px] border-white/95 overflow-hidden cursor-crosshair transition-transform duration-200 ${
            isExpanded 
              ? 'max-w-[1080px] h-[720px] sm:h-[820px] lg:h-[920px] xl:h-[1000px]' 
              : 'max-w-[880px] 2xl:max-w-[960px] h-[640px] sm:h-[740px] lg:h-[820px] xl:h-[880px]'
          }`}
        >
          
          {/* Stadium Floodlight Illumination Radial Mask */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(74, 222, 128, 0.4) 0%, rgba(20, 83, 45, 0.1) 60%, rgba(15, 61, 32, 0.5) 100%)',
            }}
          />

          {/* 14 High-Fidelity Precision Mowed Lawn Bands */}
          <div className="absolute inset-0 flex flex-col pointer-events-none opacity-22">
            {Array.from({ length: 14 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-full flex-1 ${i % 2 === 0 ? 'bg-white/12' : 'bg-transparent'}`} 
              />
            ))}
          </div>

          {/* Touchline Pitch Meter Markers */}
          <div className="absolute left-1 inset-y-0 flex flex-col justify-between py-6 pointer-events-none opacity-40 text-[8px] font-black font-mono text-emerald-200">
            <span>0m</span>
            <span>16.5m</span>
            <span>35m</span>
            <span>52.5m (HALF)</span>
            <span>70m</span>
            <span>88.5m</span>
            <span>105m</span>
          </div>
          <div className="absolute right-1 inset-y-0 flex flex-col justify-between py-6 pointer-events-none opacity-40 text-[8px] font-black font-mono text-emerald-200 text-right">
            <span>0m</span>
            <span>16.5m</span>
            <span>35m</span>
            <span>52.5m</span>
            <span>70m</span>
            <span>88.5m</span>
            <span>105m</span>
          </div>

          {/* Tactical Zones Overlay */}
          {showZones && (
            <div className="absolute inset-0 pointer-events-none z-5 animate-in fade-in duration-200">
              <div className="absolute inset-0 grid grid-cols-5 h-full opacity-45">
                <div className="border-r border-dashed border-amber-300 bg-amber-500/5 flex items-start justify-center pt-3">
                  <span className="text-[10.5px] font-black tracking-widest text-amber-200 uppercase rotate-90 sm:rotate-0">Left Flank</span>
                </div>
                <div className="border-r border-dashed border-amber-300 bg-amber-500/15 flex items-start justify-center pt-3">
                  <span className="text-[10.5px] font-black tracking-widest text-amber-300 uppercase">Left Half-Space</span>
                </div>
                <div className="border-r border-dashed border-amber-300 bg-amber-500/5 flex items-start justify-center pt-3">
                  <span className="text-[10.5px] font-black tracking-widest text-amber-200 uppercase">Central Channel</span>
                </div>
                <div className="border-r border-dashed border-amber-300 bg-amber-500/15 flex items-start justify-center pt-3">
                  <span className="text-[10.5px] font-black tracking-widest text-amber-300 uppercase">Right Half-Space</span>
                </div>
                <div className="bg-amber-500/5 flex items-start justify-center pt-3">
                  <span className="text-[10.5px] font-black tracking-widest text-amber-200 uppercase rotate-90 sm:rotate-0">Right Flank</span>
                </div>
              </div>

              {/* Zone 14 Highlighting */}
              <div className="absolute left-[24%] top-[24%] w-[52%] h-[17%] border-2 border-dashed border-orange-400 bg-orange-500/20 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[11px] font-black text-orange-200 tracking-wider">ZONE 14 (RIVAL VULNERABILITY)</span>
              </div>
              <div className="absolute left-[24%] bottom-[24%] w-[52%] h-[17%] border-2 border-dashed border-orange-400 bg-orange-500/20 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[11px] font-black text-orange-200 tracking-wider">ZONE 14 (HGUFC ATTACK HUB)</span>
              </div>
            </div>
          )}

          {/* HIGH-RESOLUTION VECTOR PITCH MARKINGS */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="2.5" y="2.5" width="95" height="95" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
            <line x1="2.5" y1="50" x2="97.5" y2="50" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
            <circle cx="50" cy="50" r="10.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
            <circle cx="50" cy="50" r="0.95" fill="#ffffff" opacity="0.95" />

            {/* TOP GOAL AREA (Rival) */}
            <rect x="22" y="2.5" width="56" height="17.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
            <rect x="36" y="2.5" width="28" height="6.5" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
            <circle cx="50" cy="12.5" r="0.95" fill="#ffffff" opacity="0.95" />
            <path d="M 39.5 20 A 9.5 9.5 0 0 0 60.5 20" fill="none" stroke="#ffffff" strokeWidth="0.85" opacity="0.95" />
            <rect x="42" y="0.8" width="16" height="1.7" fill="#ffffff" opacity="0.6" stroke="#ffffff" strokeWidth="0.6" />

            {/* BOTTOM GOAL AREA (HGUFC) */}
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

            {/* Dynamic Passing Network Lines */}
            {showPassingNetwork && passingPairs.map((pair, idx) => (
              <line
                key={`pass-net-${idx}`}
                x1={pair.p1.pitchX}
                y1={pair.p1.pitchY}
                x2={pair.p2.pitchX}
                y2={pair.p2.pitchY}
                stroke="#38bdf8"
                strokeWidth="1.3"
                strokeDasharray="3 3"
                opacity="0.75"
              />
            ))}

            {/* Drawn Tactical Direction Arrows */}
            <defs>
              <marker id="arrow-run" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#f97316" />
              </marker>
              <marker id="arrow-pass" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#facc15" />
              </marker>
              <marker id="arrow-press" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
              </marker>
            </defs>

            {arrows.map(arr => {
              const strokeColor = arr.type === 'pass' ? '#facc15' : arr.type === 'press' ? '#ef4444' : '#f97316';
              const markerId = `arrow-${arr.type}`;
              const isDashed = arr.type === 'run' ? '4 2' : 'none';
              return (
                <line
                  key={arr.id}
                  x1={arr.startX}
                  y1={arr.startY}
                  x2={arr.endX}
                  y2={arr.endY}
                  stroke={strokeColor}
                  strokeWidth="2.0"
                  strokeDasharray={isDashed}
                  markerEnd={`url(#${markerId})`}
                  opacity="0.95"
                />
              );
            })}
          </svg>

          {/* Goal & Attack Orientation Banners */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md text-slate-100 text-[11px] font-black px-4 py-1 rounded-full z-15 tracking-wider border border-slate-700 shadow-xl flex items-center gap-2">
            {opponent.logoUrl ? (
              <img src={opponent.logoUrl} alt={opponent.name} className="w-3.5 h-3.5 object-cover rounded-full" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opponent.primaryColor || '#94a3b8' }} />
            )}
            <span>{opponent.name.toUpperCase()} (ATTACKING DOWN)</span>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-orange-600/95 backdrop-blur-md text-white text-[11px] font-black px-4 py-1 rounded-full z-15 tracking-wider border border-orange-400 shadow-xl flex items-center gap-1.5">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original" 
              alt="HGUFC Crest" 
              className="w-3.5 h-3.5 object-contain rounded-full bg-white/20 p-0.5" 
              onError={(e) => { (e.target as HTMLImageElement).src = '/hougang-united-logo.svg'; }}
            />
            <span>HOUGANG UNITED FC (ATTACKING UP)</span>
          </div>

          {/* OPPONENT TOKENS (INTERACTIVE & FULLY EDITABLE) */}
          {(activeView === 'both' || activeView === 'opponent') && rivalFormation.positions.map((pos, idx) => {
            const currentPos = rivalPositions[idx] || { x: pos.x, y: 100 - pos.y };
            const isDragging = draggingRivalIndex === idx;
            const isSelected = selectedRivalIndex === idx;
            const rivalPlayerData = opponent.players?.[idx];
            const rivalNumber = rivalPlayerData?.number ?? (idx + 1);
            const rivalName = rivalPlayerData?.name ?? `${opponent.shortName} #${idx + 1}`;
            const rivalRole = rivalPlayerData?.role ?? pos.role;

            return (
              <div
                key={`rival-${idx}`}
                onPointerDown={(e) => handleRivalPointerDown(e, idx)}
                onClick={() => {
                  setSelectedRivalIndex(idx);
                  setSelectedBoardPlayerId(null);
                }}
                style={{
                  left: `${currentPos.x}%`,
                  top: `${currentPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-20 cursor-grab active:cursor-grabbing transition-transform select-none ${
                  isDragging ? 'scale-125 z-40' : isSelected ? 'scale-120 z-35' : 'hover:scale-115'
                }`}
                title={`Rival: ${rivalName} (#${rivalNumber} - ${rivalRole})`}
              >
                {/* Control Radius Halo */}
                {showControlRadius && (
                  <div 
                    className="absolute inset-0 -m-4 rounded-full border border-slate-300/40 pointer-events-none animate-pulse"
                    style={{ backgroundColor: `${opponent.primaryColor}20` }}
                  />
                )}

                {/* Selected Rival Active Ring */}
                {isSelected && (
                  <div className="absolute inset-0 -m-1.5 rounded-full ring-4 ring-white animate-pulse pointer-events-none shadow-xl" />
                )}

                <div 
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-2xl border-2 border-white ring-2 ring-black/40"
                  style={{ backgroundColor: opponent.primaryColor || '#1e293b' }}
                >
                  <span className="text-xs sm:text-sm leading-none font-black">{rivalNumber}</span>
                  <span className="text-[7.5px] sm:text-[8px] font-black uppercase leading-none opacity-90">{rivalRole}</span>
                </div>
                <div className="mt-1 text-center">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-tight whitespace-nowrap shadow-md transition-colors ${
                    isSelected 
                      ? 'bg-white text-slate-900 border border-slate-400 ring-2 ring-slate-400/50' 
                      : 'bg-slate-900/90 text-slate-100 border border-white/10'
                  }`}>
                    {rivalName}
                  </span>
                </div>
              </div>
            );
          })}

          {/* HGUFC PLAYER TOKENS */}
          {(activeView === 'both' || activeView === 'hgufc') && onPitchPlayers.map((player) => {
            const isGK = player.position === 'GK';
            const isDragging = draggingPlayerId === player.id;
            const isSelected = selectedBoardPlayerId === player.id;

            return (
              <div
                key={player.id}
                onPointerDown={(e) => handlePointerDown(e, player.id)}
                onClick={() => {
                  setSelectedBoardPlayerId(player.id);
                  setSelectedRivalIndex(null);
                  onSelectPlayerForDetail(player);
                }}
                onMouseEnter={() => setHoveredPlayerId(player.id)}
                onMouseLeave={() => setHoveredPlayerId(null)}
                style={{
                  left: `${player.pitchX}%`,
                  top: `${player.pitchY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-25 cursor-grab active:cursor-grabbing group transition-transform select-none ${
                  isDragging ? 'scale-130 z-45' : isSelected ? 'scale-120 z-35' : 'hover:scale-115'
                }`}
              >
                {/* Control Radius Halo */}
                {showControlRadius && (
                  <div className={`absolute inset-0 -m-4 rounded-full pointer-events-none animate-pulse ${
                    isGK ? 'bg-amber-400/25 border border-amber-300/60' : 'bg-orange-500/25 border border-orange-400/60'
                  }`} />
                )}

                {/* Selected Active Glow Halo */}
                {isSelected && (
                  <div className="absolute inset-0 -m-1.5 rounded-full ring-4 ring-white animate-pulse pointer-events-none shadow-xl" />
                )}

                {/* Main Token Circle Badge */}
                <div 
                  className={`relative w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full flex flex-col items-center justify-center font-black shadow-2xl border-2 border-white transition-all ${
                    isGK 
                      ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 ring-2 ring-amber-300' 
                      : 'bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700 text-white ring-2 ring-orange-400'
                  }`}
                >
                  {isGK && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-slate-950 text-amber-300 rounded-full text-[8px] font-black flex items-center justify-center border-2 border-amber-300 shadow-sm">
                      GK
                    </span>
                  )}
                  <span className="text-xs sm:text-sm leading-none font-black">{player.number}</span>
                  <span className="text-[7.5px] sm:text-[8px] uppercase font-black tracking-tight leading-none opacity-95">
                    {player.roleLabel || player.position}
                  </span>
                </div>

                {/* Player Name Pill */}
                <div className="mt-1 text-center flex flex-col items-center">
                  <span className={`px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-black tracking-tight whitespace-nowrap shadow-lg transition-colors ${
                    isSelected 
                      ? 'bg-white text-slate-900 border border-orange-500 ring-2 ring-orange-500/50' 
                      : isGK 
                      ? 'bg-amber-950/95 text-amber-200 border border-amber-400/60' 
                      : 'bg-slate-950/95 text-orange-200 border border-orange-500/50'
                  }`}>
                    {player.name}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Real-time Drag Coordinate HUD */}
          {activeDragCoords && (
            <div className="absolute top-4 right-4 z-40 bg-slate-950/90 backdrop-blur-md text-white rounded-xl px-3 py-1.5 shadow-2xl border border-slate-700 text-xs font-mono flex items-center space-x-2 animate-in fade-in duration-100">
              <Crosshair className="w-3.5 h-3.5 text-orange-400 animate-spin" />
              <div>
                <span className="text-orange-400 font-bold">Pitch Pos:</span> X: {activeDragCoords.x}% • Y: {activeDragCoords.y}%
                <span className="text-slate-400 block text-[10px] font-sans font-medium">
                  {getZoneLabel(activeDragCoords.x, activeDragCoords.y)}
                </span>
              </div>
            </div>
          )}

          {/* RIVAL PLAYER EDITOR FLOATING BAR (Requirement 1: Independent Name and Number Editing) */}
          {selectedRivalIndex !== null && selectedRivalPlayer && !activeDragCoords && (
            <div className="absolute bottom-4 left-4 z-35 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-slate-300 text-slate-900 flex flex-wrap items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center space-x-2.5">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-xs border border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: opponent.primaryColor }}
                >
                  {selectedRivalPlayer.number}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 flex items-center gap-1">
                    <Edit2 className="w-3 h-3 text-slate-400" />
                    <span>Edit Rival Player #{selectedRivalIndex + 1}</span>
                  </span>
                  
                  {/* Inline editable Name & Dorsal */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={selectedRivalPlayer.number}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        onUpdateRivalPlayer?.(selectedRivalIndex, { number: val });
                      }}
                      className="w-12 text-xs font-black text-center px-1.5 py-1 border border-slate-300 rounded-md focus:border-orange-500 focus:outline-hidden bg-white"
                      title="Squad Number (Dorsal)"
                    />
                    <input
                      type="text"
                      value={selectedRivalPlayer.name}
                      onChange={(e) => {
                        onUpdateRivalPlayer?.(selectedRivalIndex, { name: e.target.value });
                      }}
                      placeholder="Player Name"
                      className="w-36 text-xs font-bold px-2 py-1 border border-slate-300 rounded-md focus:border-orange-500 focus:outline-hidden bg-white"
                      title="Player Full Name"
                    />
                  </div>
                </div>
              </div>

              {/* Nudge Buttons for Rival Player */}
              <div className="flex items-center space-x-0.5 bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleNudgeRival(-2, 0)}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 hover:text-slate-950"
                  title="Nudge Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeRival(2, 0)}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 hover:text-slate-950"
                  title="Nudge Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeRival(0, -2)}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 hover:text-slate-950"
                  title="Nudge Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeRival(0, 2)}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 hover:text-slate-950"
                  title="Nudge Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRivalIndex(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                title="Close Editor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Interactive Selected HGUFC Player Quick-Nudge Floating Bar */}
          {selectedPlayer && selectedPlayer.pitchX !== undefined && selectedPlayer.pitchY !== undefined && !activeDragCoords && (
            <div className="absolute bottom-4 right-4 z-35 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-slate-200 text-slate-900 flex items-center space-x-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                  selectedPlayer.position === 'GK' ? 'bg-amber-400 text-slate-950' : 'bg-orange-600 text-white'
                }`}>
                  {selectedPlayer.number}
                </div>
                <div>
                  <h5 className="font-black text-xs leading-tight text-slate-900">{selectedPlayer.name}</h5>
                  <p className="text-[10px] text-slate-500 font-bold">
                    {selectedPlayer.roleLabel || selectedPlayer.position} • Pos ({selectedPlayer.pitchX}%, {selectedPlayer.pitchY}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-0.5 bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleNudgePlayer(-2, 0)}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 hover:text-slate-950"
                  title="Nudge Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgePlayer(2, 0)}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 hover:text-slate-950"
                  title="Nudge Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgePlayer(0, -2)}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 hover:text-slate-950"
                  title="Nudge Forward (Attack)"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgePlayer(0, 2)}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 hover:text-slate-950"
                  title="Nudge Backward (Defend)"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBoardPlayerId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                title="Deselect Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Modern Pitch Footer: Tactical Shape Summary */}
      <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold text-slate-900">Tactical Matchup:</span>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg font-black border border-orange-200 shadow-2xs">
            HGUFC {hgufcFormation.name}
          </span>
          <span className="text-slate-400 font-black">VS</span>
          <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-lg font-black border border-slate-300 shadow-2xs">
            {opponent.shortName} {rivalFormation.name}
          </span>
        </div>

        <div className="text-slate-500 flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-white shadow-xs"></span>
            <span className="font-bold">GK (Distinct Style)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow-xs"></span>
            <span className="font-bold">HGUFC Outfield</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span 
              className="w-3 h-3 rounded-full border border-white shadow-xs"
              style={{ backgroundColor: opponent.primaryColor }}
            ></span>
            <span className="font-bold">{opponent.shortName} Outfield</span>
          </span>
        </div>
      </div>
    </div>
  );
};
