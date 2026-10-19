import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Flame, 
  ShieldCheck, 
  RefreshCw, 
  Lightbulb, 
  Copy, 
  Check, 
  ArrowRight, 
  PlusCircle, 
  Compass,
  Cpu,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Target,
  Edit2,
  Trash2,
  Plus,
  RotateCcw,
  Save,
  X
} from 'lucide-react';
import { 
  SwotData, 
  GeneratedInsight, 
  Formation, 
  OpponentTeam, 
  MultidimensionalReport,
  Player,
  TacticalPhaseAnalysis
} from '../types';
import { PhaseModal } from './PhaseModal';

interface SwotAnalysisProps {
  swot: SwotData;
  hgufcFormation: Formation;
  rivalFormation: Formation;
  opponent: OpponentTeam;
  insights: GeneratedInsight[];
  report: MultidimensionalReport;
  players?: Player[];
  phasesSectionTitle?: string;
  onUpdatePhasesSectionTitle?: (title: string) => void;
  onUpdatePhase?: (updated: TacticalPhaseAnalysis) => void;
  onDeletePhase?: (phaseKey: string) => void;
  onAddPhase?: (newPhase: TacticalPhaseAnalysis) => void;
  onResetPhases?: () => void;
  onUpdateSwot: (updated: Partial<SwotData>) => void;
  onRegenerateInsights: () => void;
  onAddDirectiveToNotes: (directive: string) => void;
  onUpdateDirective?: (updated: GeneratedInsight) => void;
  onDeleteDirective?: (id: string) => void;
  onAddDirective?: (newDirective: GeneratedInsight) => void;
  onResetDirectives?: () => void;
}

export const SwotAnalysis: React.FC<SwotAnalysisProps> = ({
  swot,
  hgufcFormation,
  rivalFormation,
  opponent,
  insights,
  report,
  players = [],
  phasesSectionTitle,
  onUpdatePhasesSectionTitle,
  onUpdatePhase,
  onDeletePhase,
  onAddPhase,
  onResetPhases,
  onUpdateSwot,
  onRegenerateInsights,
  onAddDirectiveToNotes,
  onUpdateDirective,
  onDeleteDirective,
  onAddDirective,
  onResetDirectives,
}) => {
  const [engineTab, setEngineTab] = useState<'phases' | 'directives'>('phases');
  const [filterType, setFilterType] = useState<'all' | 'opportunity' | 'threat'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedNoteId, setAddedNoteId] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1); // Default phase 1 open

  // Phase modal & Title editing state
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [phaseToEdit, setPhaseToEdit] = useState<TacticalPhaseAnalysis | null>(null);
  const [isEditingPhasesTitle, setIsEditingPhasesTitle] = useState(false);
  const [tempPhasesTitle, setTempPhasesTitle] = useState(phasesSectionTitle || 'Tactical Phases of Play');

  // Directive editing and adding state
  const [editingDirectiveId, setEditingDirectiveId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    actionableDirective: string;
    category: GeneratedInsight['category'];
    type: 'opportunity' | 'threat';
  }>({
    title: '',
    description: '',
    actionableDirective: '',
    category: 'Tactical Phase',
    type: 'opportunity',
  });

  const [isAddingDirective, setIsAddingDirective] = useState(false);
  const [newForm, setNewForm] = useState<{
    title: string;
    description: string;
    actionableDirective: string;
    category: GeneratedInsight['category'];
    type: 'opportunity' | 'threat';
  }>({
    title: '',
    description: '',
    actionableDirective: '',
    category: 'Spatial / Half-Spaces',
    type: 'opportunity',
  });

  const opportunities = insights.filter(i => i.type === 'opportunity');
  const threats = insights.filter(i => i.type === 'threat');

  const filteredInsights = insights.filter(i => {
    const matchesType = filterType === 'all' || i.type === filterType;
    const matchesCat = categoryFilter === 'all' || i.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.actionableDirective.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCat && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddDirective = (id: string, directive: string) => {
    onAddDirectiveToNotes(directive);
    setAddedNoteId(id);
    setTimeout(() => setAddedNoteId(null), 2500);
  };

  const handleRecalculate = () => {
    setIsRecalculating(true);
    onRegenerateInsights();
    setTimeout(() => {
      setIsRecalculating(false);
    }, 600);
  };

  // Count active players with custom profiles
  const onPitchCount = players.filter(p => p.pitchX !== undefined && p.pitchY !== undefined).length;

  return (
    <div className="space-y-6">
      
      {/* 4-QUADRANT MANUAL SWOT / DAFO MATRIX */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        
        {/* Card Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                <span>Tactical SWOT Matrix (DAFO)</span>
              </h3>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                Live Dynamic Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter key qualitative observations for Hougang United FC and {opponent.name}. All inputs automatically recalculate the AI Engine below.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Clash:</span>
            <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">{hgufcFormation.name}</span>
            <span className="text-slate-400 font-bold">vs</span>
            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{rivalFormation.name}</span>
          </div>
        </div>

        {/* 4 Quadrants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Top Left: Our Strengths (HGUFC) */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-50/50 via-white to-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[9px] font-black">S</span>
                <label className="text-xs font-black tracking-wide text-orange-950 uppercase">
                  Our Strengths (Hougang United FC)
                </label>
              </div>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                In-Possession Edge
              </span>
            </div>
            <textarea
              rows={4}
              value={swot.ourStrengths}
              onChange={(e) => onUpdateSwot({ ourStrengths: e.target.value })}
              placeholder="e.g. Rapid half-space progression through playmaker; 2v1 flank overloads on right wing; high counter-press intensity..."
              className="w-full text-xs font-medium text-slate-800 bg-white border border-orange-200 rounded-lg p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-hidden resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Your core tactical weapons, combinations, and scoring patterns to maximize.
            </p>
          </div>

          {/* Top Right: Our Weaknesses (HGUFC) */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/50 via-white to-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-[9px] font-black">W</span>
                <label className="text-xs font-black tracking-wide text-amber-950 uppercase">
                  Our Weaknesses (Hougang United FC)
                </label>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Rest Defense Risks
              </span>
            </div>
            <textarea
              rows={4}
              value={swot.ourWeaknesses}
              onChange={(e) => onUpdateSwot({ ourWeaknesses: e.target.value })}
              placeholder="e.g. Space conceded behind fullbacks when overlapping; central turnovers during build-up; second ball aerial clearances..."
              className="w-full text-xs font-medium text-slate-800 bg-white border border-amber-200 rounded-lg p-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-hidden resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Squad vulnerabilities requiring tactical safeguards, covering rules, and rest defense.
            </p>
          </div>

          {/* Bottom Left: Rival Strengths */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-gradient-to-br from-rose-50/40 via-white to-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 flex items-center justify-center text-white text-[9px] font-black">O</span>
                <label className="text-xs font-black tracking-wide text-rose-950 uppercase">
                  Rival Strengths ({opponent.name})
                </label>
              </div>
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                Primary Threats
              </span>
            </div>
            <textarea
              rows={4}
              value={swot.rivalStrengths}
              onChange={(e) => onUpdateSwot({ rivalStrengths: e.target.value })}
              placeholder="e.g. Dangerous inverted winger cutting into Zone 14; rapid 3-man counter-attacks; aerial target man on set-pieces..."
              className="w-full text-xs font-medium text-slate-800 bg-white border border-rose-200 rounded-lg p-2.5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-hidden resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Opponent danger points, key playmakers, and transitions to neutralize.
            </p>
          </div>

          {/* Bottom Right: Rival Weaknesses */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-gradient-to-br from-blue-50/40 via-white to-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-black">T</span>
                <label className="text-xs font-black tracking-wide text-blue-950 uppercase">
                  Rival Weaknesses ({opponent.name})
                </label>
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                Exploitable Gaps
              </span>
            </div>
            <textarea
              rows={4}
              value={swot.rivalWeaknesses}
              onChange={(e) => onUpdateSwot({ rivalWeaknesses: e.target.value })}
              placeholder="e.g. Slow turning acceleration by central defenders; wingbacks leave massive space behind; panic under high press..."
              className="w-full text-xs font-medium text-slate-800 bg-white border border-blue-200 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Flaws in rival system to exploit through specific passing routines and pressing traps.
            </p>
          </div>

        </div>
      </div>


      {/* =========================================================================
          TRIPLE-SYNTHETIC TACTICAL AI ENGINE & 10 PHASES OF PLAY
          (GEMINI + CHATGPT + CLAUDE FRAMEWORK)
          ========================================================================= */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        
        {/* Engine Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black tracking-wide text-white uppercase">
                  Tactical AI Engine: Multidimensional Analyst
                </h3>
                <span className="px-2.5 py-0.5 text-[10px] font-black bg-orange-500/30 text-orange-300 border border-orange-400/50 rounded-full tracking-wide">
                  Gemini + ChatGPT + Claude
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Integrated Triple-Synthetic Framework across <strong className="text-orange-400">{phasesSectionTitle || 'Tactical Phases of Play'}</strong> synthesizing active players ({onPitchCount}/11 on pitch), footedness, and SWOT.
              </p>
            </div>
          </div>

          {/* Engine Controls */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="inline-flex items-center px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-300 hover:to-amber-300 active:from-orange-500 active:to-amber-500 rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-75"
              title="Recalculate analysis using current player names, footedness, formations, and DAFO inputs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Recalculating...' : 'Recalculate Analysis'}
            </button>
          </div>
        </div>

        {/* Engine Perspectives Sub-Bar */}
        <div className="px-4 py-3 bg-slate-800 border-b border-slate-700/80 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0"></span>
            <div>
              <span className="font-bold text-white block">1. GEMINI Perspective</span>
              <span className="text-[10px] text-slate-400">Geometry, Channels, Inter-line Spaces</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <div>
              <span className="font-bold text-white block">2. CHATGPT Perspective</span>
              <span className="text-[10px] text-slate-400">Profiles, Footedness, Inverted Roles</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0"></span>
            <div>
              <span className="font-bold text-white block">3. CLAUDE Perspective</span>
              <span className="text-[10px] text-slate-400">Systemic & Operational SWOT Matrix</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-4 pt-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setEngineTab('phases')}
              className={`px-3.5 py-2 font-black text-xs rounded-t-lg border-t border-x transition-colors flex items-center gap-1.5 ${
                engineTab === 'phases'
                  ? 'bg-white border-slate-200 text-orange-600 border-b-2 border-b-white -mb-[1px]'
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{phasesSectionTitle || 'Tactical Phases of Play'}</span>
              <span className="ml-1 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded-full font-bold">{report.phases.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setEngineTab('directives')}
              className={`px-3.5 py-2 font-black text-xs rounded-t-lg border-t border-x transition-colors flex items-center gap-1.5 ${
                engineTab === 'directives'
                  ? 'bg-white border-slate-200 text-orange-600 border-b-2 border-b-white -mb-[1px]'
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Automated Directives (Opportunities & Threats)</span>
              <span className="ml-1 text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">{insights.length}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 pb-2">
            Updated: <strong className="text-slate-700">{report.timestamp}</strong>
          </div>
        </div>


        {/* =====================================================================
            VIEW 1: TACTICAL PHASES OF PLAY (CUSTOMIZABLE, EDITABLE, DELETABLE)
            ===================================================================== */}
        {engineTab === 'phases' && (
          <div className="p-4 sm:p-5 space-y-4">
            
            {/* Title Customizer & Phase Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2.5">
                {isEditingPhasesTitle ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tempPhasesTitle}
                      onChange={(e) => setTempPhasesTitle(e.target.value)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-slate-50 border border-orange-500 rounded-lg focus:outline-hidden focus:bg-white"
                      placeholder="e.g. Tactical Phases of Play"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onUpdatePhasesSectionTitle?.(tempPhasesTitle.trim() || 'Tactical Phases of Play');
                        setIsEditingPhasesTitle(false);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md cursor-pointer"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempPhasesTitle(phasesSectionTitle || 'Tactical Phases of Play');
                        setIsEditingPhasesTitle(false);
                      }}
                      className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-600"></div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      {phasesSectionTitle || 'Tactical Phases of Play'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setTempPhasesTitle(phasesSectionTitle || 'Tactical Phases of Play');
                        setIsEditingPhasesTitle(true);
                      }}
                      className="p-1 text-slate-400 hover:text-orange-600 rounded transition-colors cursor-pointer"
                      title="Editar título del informe"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                  {report.phases.length} {report.phases.length === 1 ? 'Fase' : 'Fases'}
                </span>
              </div>

              {/* Action Buttons: Añadir Fase + Restablecer */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setPhaseToEdit(null);
                    setIsPhaseModalOpen(true);
                  }}
                  className="inline-flex items-center px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg shadow-xs transition-all cursor-pointer"
                  title="Añadir nueva fase táctica al informe"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Añadir Fase</span>
                </button>

                {onResetPhases && (
                  <button
                    type="button"
                    onClick={onResetPhases}
                    className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    title="Restablecer fases a los valores por defecto del motor"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Restablecer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Phase Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex-shrink-0">Ir a Fase:</span>
              {report.phases.map((phase) => (
                <button
                  key={phase.phaseKey}
                  type="button"
                  onClick={() => setExpandedPhase(expandedPhase === phase.phaseNumber ? null : phase.phaseNumber)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex-shrink-0 transition-colors cursor-pointer ${
                    expandedPhase === phase.phaseNumber
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {phase.phaseNumber}. {phase.phaseName.replace(/^\d+\.\s*/, '')}
                </button>
              ))}
            </div>

            {/* List of Phases with Edit & Delete Controls */}
            <div className={`space-y-4 transition-opacity duration-200 ${isRecalculating ? 'opacity-40' : 'opacity-100'}`}>
              {report.phases.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm font-bold text-slate-500">No hay fases en el informe actualmente.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPhaseToEdit(null);
                      setIsPhaseModalOpen(true);
                    }}
                    className="mt-3 inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-orange-600 rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span>Añadir Primera Fase</span>
                  </button>
                </div>
              ) : (
                report.phases.map((phase) => {
                  const isExpanded = expandedPhase === phase.phaseNumber;

                  return (
                    <div 
                      key={phase.phaseKey}
                      className={`rounded-xl border transition-all ${
                        isExpanded 
                          ? 'border-orange-300 bg-white shadow-sm ring-1 ring-orange-200/50' 
                          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {/* Phase Header Accordion Trigger */}
                      <div 
                        onClick={() => setExpandedPhase(isExpanded ? null : phase.phaseNumber)}
                        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                            isExpanded ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {phase.phaseNumber}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-black text-slate-900 tracking-wide">
                                {phase.phaseName}
                              </h4>
                              <span className="text-[11px] text-slate-500 hidden sm:inline">
                                — {phase.subtitle}
                              </span>
                            </div>
                            {!isExpanded && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                <strong>Recomendación:</strong> {phase.directTacticalRecommendation}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Botón Editar */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhaseToEdit(phase);
                              setIsPhaseModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50 bg-white border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Editar fase del informe"
                          >
                            <Edit2 className="w-3 h-3 text-orange-600" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>

                          {/* Botón Borrar */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`¿Seguro que deseas eliminar la fase "${phase.phaseName}" del informe?`)) {
                                onDeletePhase?.(phase.phaseKey);
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-red-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Borrar fase del informe"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Borrar</span>
                          </button>

                          <div className="text-slate-400 pl-1">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-orange-600" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                    {/* Expanded Content with 3 Perspectives */}
                    {isExpanded && (
                      <div className="px-4 pb-5 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                        
                        {/* 3 PERSPECTIVE CARDS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-2">
                          
                          {/* 1. GEMINI PERSPECTIVE: Geometry, Space & Structure */}
                          <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-blue-200/60 pb-1.5">
                              <span className="text-xs font-black text-blue-950 flex items-center gap-1.5 uppercase">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                Gemini Perspective
                              </span>
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
                                Geometry & Space
                              </span>
                            </div>

                            <div className="text-xs space-y-2 text-slate-700 leading-relaxed">
                              <div>
                                <strong className="text-blue-900 block text-[11px] uppercase tracking-wider">Channel & Line Heights:</strong>
                                <span>{phase.geminiPerspective.channelOccupation}</span>
                              </div>
                              <div>
                                <strong className="text-blue-900 block text-[11px] uppercase tracking-wider">Line Compactness:</strong>
                                <span>{phase.geminiPerspective.lineHeightsAndCompactness}</span>
                              </div>
                              <div>
                                <strong className="text-blue-900 block text-[11px] uppercase tracking-wider">Superiority Dynamics:</strong>
                                <span>{phase.geminiPerspective.superiorities}</span>
                              </div>
                            </div>
                          </div>

                          {/* 2. CHATGPT PERSPECTIVE: Profiles, Roles & Individual Behaviors */}
                          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase">
                                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                ChatGPT Perspective
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                                Profiles & Footedness
                              </span>
                            </div>

                            <div className="text-xs space-y-2 text-slate-700 leading-relaxed">
                              <div>
                                <strong className="text-emerald-900 block text-[11px] uppercase tracking-wider">Player Profiling & Traits:</strong>
                                <span>{phase.chatGptPerspective.playerProfiles}</span>
                              </div>
                              <div>
                                <strong className="text-emerald-900 block text-[11px] uppercase tracking-wider">Required Behaviors:</strong>
                                <span>{phase.chatGptPerspective.requiredBehaviors}</span>
                              </div>
                            </div>
                          </div>

                          {/* 3. CLAUDE PERSPECTIVE: Operational SWOT Matrix */}
                          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5 uppercase">
                                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                                Claude Perspective
                              </span>
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
                                Operational SWOT
                              </span>
                            </div>

                            <div className="text-xs space-y-1.5 text-slate-700 leading-relaxed">
                              <div>
                                <strong className="text-orange-700 text-[11px]">Strength (Own):</strong>{' '}
                                <span>{phase.claudePerspective.strength}</span>
                              </div>
                              <div>
                                <strong className="text-amber-800 text-[11px]">Weakness (Own):</strong>{' '}
                                <span>{phase.claudePerspective.weakness}</span>
                              </div>
                              <div>
                                <strong className="text-emerald-700 text-[11px]">Opportunity:</strong>{' '}
                                <span>{phase.claudePerspective.opportunity}</span>
                              </div>
                              <div>
                                <strong className="text-rose-700 text-[11px]">Threat:</strong>{' '}
                                <span>{phase.claudePerspective.threat}</span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* DIRECT TACTICAL RECOMMENDATION */}
                        <div className="p-3.5 rounded-lg border border-orange-300 bg-gradient-to-r from-orange-50 via-amber-50/40 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-orange-900 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-orange-600" />
                              Direct Tactical Recommendation:
                            </span>
                            <p className="text-xs font-bold text-slate-900 leading-relaxed">
                              {phase.directTacticalRecommendation}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAddDirective(`phase-${phase.phaseNumber}`, phase.directTacticalRecommendation)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md shadow-xs transition-colors"
                            >
                              {addedNoteId === `phase-${phase.phaseNumber}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 mr-1 text-white" />
                                  <span>Added to Plan!</span>
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                                  <span>Add to Notes</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(`phase-${phase.phaseNumber}`, `[${phase.phaseName}]\n${phase.directTacticalRecommendation}`)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-md transition-colors"
                              title="Copy directive text"
                            >
                              {copiedId === `phase-${phase.phaseNumber}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              }))}
            </div>

          </div>
        )}


        {/* =====================================================================
            VIEW 2: AUTOMATED OPPORTUNITIES & THREATS DIRECTIVES
            ===================================================================== */}
        {engineTab === 'directives' && (
          <div>
            {/* Filter Bar & Controls */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              
              {/* Type Filter Buttons */}
              <div className="flex items-center space-x-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${
                    filterType === 'all' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({insights.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('opportunity')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                    filterType === 'opportunity' 
                      ? 'bg-emerald-700 text-white shadow-xs' 
                      : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  <Zap className="w-3 h-3 text-emerald-500" />
                  <span>Opportunities ({opportunities.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('threat')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                    filterType === 'threat' 
                      ? 'bg-rose-700 text-white shadow-xs' 
                      : 'text-rose-800 bg-rose-50 hover:bg-rose-100'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                  <span>Threats ({threats.length})</span>
                </button>
              </div>

              {/* Action Buttons: Add Custom & Reset */}
              <div className="flex items-center space-x-2 text-xs">
                {onAddDirective && (
                  <button
                    type="button"
                    onClick={() => setIsAddingDirective(!isAddingDirective)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Add a custom tactical directive to this match plan"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingDirective ? 'Cancel' : 'Add Directive'}</span>
                  </button>
                )}
                {onResetDirectives && (
                  <button
                    type="button"
                    onClick={onResetDirectives}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reset to automated AI Engine directives for this match"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset Defaults</span>
                  </button>
                )}

                {/* Category Filter & Search */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 rounded-md px-2 py-1 font-semibold focus:outline-hidden focus:border-orange-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Spatial / Half-Spaces">Spatial / Half-Spaces</option>
                  <option value="Numerical Overload">Numerical Overload</option>
                  <option value="Pressing Traps">Pressing Traps</option>
                  <option value="Defensive Transition">Defensive Transition</option>
                  <option value="Set Pieces">Set Pieces</option>
                  <option value="Tactical Phase">Tactical Phase</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-md text-xs focus:outline-hidden focus:border-orange-500 w-28 sm:w-36"
                  />
                </div>
              </div>
            </div>

            {/* Inline Add Directive Form */}
            {isAddingDirective && onAddDirective && (
              <div className="p-4 bg-emerald-50/70 border-b border-emerald-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Create New Tactical Directive</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingDirective(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Type</label>
                    <select
                      value={newForm.type}
                      onChange={(e) => setNewForm({ ...newForm, type: e.target.value as 'opportunity' | 'threat' })}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold"
                    >
                      <option value="opportunity">Opportunity (Green)</option>
                      <option value="threat">Threat / Safeguard (Red)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Category</label>
                    <select
                      value={newForm.category}
                      onChange={(e) => setNewForm({ ...newForm, category: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold"
                    >
                      <option value="Spatial / Half-Spaces">Spatial / Half-Spaces</option>
                      <option value="Numerical Overload">Numerical Overload</option>
                      <option value="Pressing Traps">Pressing Traps</option>
                      <option value="Defensive Transition">Defensive Transition</option>
                      <option value="Set Pieces">Set Pieces</option>
                      <option value="Tactical Phase">Tactical Phase</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Directive Title</label>
                    <input
                      type="text"
                      value={newForm.title}
                      onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                      placeholder="e.g. Overload Zone 14 against Rival Pivot"
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Observation Description</label>
                  <textarea
                    rows={2}
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    placeholder="Describe tactical context and structural vulnerability..."
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Actionable Coaching Instruction</label>
                  <input
                    type="text"
                    value={newForm.actionableDirective}
                    onChange={(e) => setNewForm({ ...newForm, actionableDirective: e.target.value })}
                    placeholder="Explicit instructions for starting lineup..."
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingDirective(false)}
                    className="px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!newForm.title.trim()}
                    onClick={() => {
                      if (!newForm.title.trim()) return;
                      onAddDirective({
                        id: `custom-dir-${Date.now()}`,
                        type: newForm.type,
                        category: newForm.category,
                        title: newForm.title.trim(),
                        description: newForm.description.trim() || newForm.title.trim(),
                        actionableDirective: newForm.actionableDirective.trim() || newForm.title.trim(),
                      });
                      setIsAddingDirective(false);
                      setNewForm({
                        title: '',
                        description: '',
                        actionableDirective: '',
                        category: 'Spatial / Half-Spaces',
                        type: 'opportunity',
                      });
                    }}
                    className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded disabled:opacity-50"
                  >
                    Save Directive
                  </button>
                </div>
              </div>
            )}

            {/* Directives Cards List */}
            <div className={`p-4 space-y-3 transition-opacity duration-200 ${isRecalculating ? 'opacity-40' : 'opacity-100'}`}>
              {filteredInsights.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No tactical directives matching this filter. Click '+ Add Directive' or 'Reset Defaults' to restore automated directives.
                </div>
              ) : (
                filteredInsights.map((insight) => {
                  const isOpportunity = insight.type === 'opportunity';
                  const isEditing = editingDirectiveId === insight.id;

                  if (isEditing) {
                    return (
                      <div
                        key={insight.id}
                        className="p-4 rounded-xl border-2 border-orange-400 bg-white shadow-md space-y-3 animate-in fade-in duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-orange-600 flex items-center gap-1.5">
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Tactical Directive</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{insight.id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Type</label>
                            <select
                              value={editForm.type}
                              onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'opportunity' | 'threat' })}
                              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-semibold"
                            >
                              <option value="opportunity">Opportunity (Green)</option>
                              <option value="threat">Threat / Safeguard (Red)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Category</label>
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-semibold"
                            >
                              <option value="Spatial / Half-Spaces">Spatial / Half-Spaces</option>
                              <option value="Numerical Overload">Numerical Overload</option>
                              <option value="Pressing Traps">Pressing Traps</option>
                              <option value="Defensive Transition">Defensive Transition</option>
                              <option value="Set Pieces">Set Pieces</option>
                              <option value="Tactical Phase">Tactical Phase</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Title</label>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Description</label>
                          <textarea
                            rows={2}
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Actionable Coaching Instruction</label>
                          <input
                            type="text"
                            value={editForm.actionableDirective}
                            onChange={(e) => setEditForm({ ...editForm, actionableDirective: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-semibold"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingDirectiveId(null)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!editForm.title.trim()) return;
                              onUpdateDirective?.({
                                ...insight,
                                type: editForm.type,
                                category: editForm.category,
                                title: editForm.title.trim(),
                                description: editForm.description.trim(),
                                actionableDirective: editForm.actionableDirective.trim(),
                              });
                              setEditingDirectiveId(null);
                            }}
                            className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={insight.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isOpportunity
                          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/60 to-white hover:border-emerald-300'
                          : 'border-rose-200 bg-gradient-to-r from-rose-50/60 to-white hover:border-rose-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              isOpportunity ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {insight.type}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {insight.category}
                            </span>
                            {insight.phaseRef && (
                              <span className="text-[10px] font-bold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded">
                                Phase: {insight.phaseRef}
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-black text-slate-900">
                            {insight.title}
                          </h4>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {insight.description}
                          </p>

                          {/* Actionable Directive Box */}
                          <div className="mt-2 p-2.5 rounded-lg bg-white/90 border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-start gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span>{insight.actionableDirective}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col items-center space-x-1.5 sm:space-x-0 sm:space-y-1.5 flex-shrink-0 self-end sm:self-start">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDirectiveId(insight.id);
                              setEditForm({
                                title: insight.title,
                                description: insight.description,
                                actionableDirective: insight.actionableDirective,
                                category: insight.category,
                                type: insight.type,
                              });
                            }}
                            className="p-1.5 text-slate-600 hover:text-orange-600 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Edit this directive"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteDirective && (
                            <button
                              type="button"
                              onClick={() => onDeleteDirective(insight.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                              title="Delete directive and remove from report"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAddDirective(insight.id, insight.actionableDirective)}
                            className="inline-flex items-center px-2 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-orange-600 rounded-md transition-colors shadow-xs"
                            title="Add this directive into match tactical notes"
                          >
                            {addedNoteId === insight.id ? (
                              <>
                                <Check className="w-3 h-3 mr-1 text-emerald-400" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <PlusCircle className="w-3 h-3 mr-1" />
                                <span>To Notes</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(insight.id, insight.actionableDirective)}
                            className="p-1 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-md transition-colors"
                            title="Copy directive text"
                          >
                            {copiedId === insight.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* TACTICAL PHASE EDIT/ADD MODAL */}
      <PhaseModal
        isOpen={isPhaseModalOpen}
        phaseToEdit={phaseToEdit}
        nextPhaseNumber={report.phases.length + 1}
        onClose={() => {
          setIsPhaseModalOpen(false);
          setPhaseToEdit(null);
        }}
        onSavePhase={(savedPhase) => {
          if (phaseToEdit) {
            onUpdatePhase?.(savedPhase);
          } else {
            onAddPhase?.(savedPhase);
          }
        }}
        onDeletePhase={onDeletePhase}
      />
    </div>
  );
};
