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
  Target
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

interface SwotAnalysisProps {
  swot: SwotData;
  hgufcFormation: Formation;
  rivalFormation: Formation;
  opponent: OpponentTeam;
  insights: GeneratedInsight[];
  report: MultidimensionalReport;
  players?: Player[];
  onUpdateSwot: (updated: Partial<SwotData>) => void;
  onRegenerateInsights: () => void;
  onAddDirectiveToNotes: (directive: string) => void;
}

export const SwotAnalysis: React.FC<SwotAnalysisProps> = ({
  swot,
  hgufcFormation,
  rivalFormation,
  opponent,
  insights,
  report,
  players = [],
  onUpdateSwot,
  onRegenerateInsights,
  onAddDirectiveToNotes,
}) => {
  const [engineTab, setEngineTab] = useState<'phases' | 'directives'>('phases');
  const [filterType, setFilterType] = useState<'all' | 'opportunity' | 'threat'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedNoteId, setAddedNoteId] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1); // Default phase 1 open

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
                Integrated Triple-Synthetic Framework across the <strong className="text-orange-400">10 Mandatory Phases of Play</strong> synthesizing active players ({onPitchCount}/11 on pitch), footedness, and SWOT.
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
              <span>10 Mandatory Phases of Play</span>
              <span className="ml-1 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded-full font-bold">10</span>
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
            VIEW 1: 10 MANDATORY PHASES OF PLAY
            ===================================================================== */}
        {engineTab === 'phases' && (
          <div className="p-4 sm:p-5 space-y-4">
            
            {/* Quick Phase Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex-shrink-0">Jump to Phase:</span>
              {report.phases.map((phase) => (
                <button
                  key={phase.phaseKey}
                  type="button"
                  onClick={() => setExpandedPhase(expandedPhase === phase.phaseNumber ? null : phase.phaseNumber)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex-shrink-0 transition-colors ${
                    expandedPhase === phase.phaseNumber
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {phase.phaseNumber}. {phase.phaseName.replace(/^\d+\.\s*/, '')}
                </button>
              ))}
            </div>

            {/* List of 10 Phases */}
            <div className={`space-y-4 transition-opacity duration-200 ${isRecalculating ? 'opacity-40' : 'opacity-100'}`}>
              {report.phases.map((phase) => {
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
                              <strong>Recommendation:</strong> {phase.directTacticalRecommendation}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-400">
                        <span className="text-[11px] font-semibold hidden md:inline text-slate-500">
                          {isExpanded ? 'Collapse' : 'Expand Phase'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-orange-600" /> : <ChevronDown className="w-4 h-4" />}
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
              })}
            </div>

          </div>
        )}


        {/* =====================================================================
            VIEW 2: AUTOMATED OPPORTUNITIES & THREATS DIRECTIVES
            ===================================================================== */}
        {engineTab === 'directives' && (
          <div>
            {/* Filter Bar */}
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

              {/* Category Filter & Search */}
              <div className="flex items-center space-x-2 text-xs">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 rounded-md px-2.5 py-1 font-semibold focus:outline-hidden focus:border-orange-500"
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
                    placeholder="Search directives..."
                    className="pl-7 pr-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs focus:outline-hidden focus:border-orange-500 w-36 sm:w-48"
                  />
                </div>
              </div>
            </div>

            {/* Directives Cards List */}
            <div className={`p-4 space-y-3 transition-opacity duration-200 ${isRecalculating ? 'opacity-40' : 'opacity-100'}`}>
              {filteredInsights.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No tactical directives matching this filter. Click 'Recalculate Analysis' or enter observations in the DAFO text areas above.
                </div>
              ) : (
                filteredInsights.map((insight) => {
                  const isOpportunity = insight.type === 'opportunity';

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
                        <div className="flex sm:flex-col items-center space-x-2 sm:space-x-0 sm:space-y-2 flex-shrink-0 self-end sm:self-start">
                          <button
                            type="button"
                            onClick={() => handleAddDirective(insight.id, insight.actionableDirective)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-orange-600 rounded-md transition-colors shadow-xs"
                            title="Add this directive into match tactical notes"
                          >
                            {addedNoteId === insight.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                                <span>Added!</span>
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
                            onClick={() => handleCopy(insight.id, insight.actionableDirective)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-md transition-colors"
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

    </div>
  );
};
