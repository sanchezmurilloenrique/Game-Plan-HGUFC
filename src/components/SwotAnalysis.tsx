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
  SlidersHorizontal 
} from 'lucide-react';
import { SwotData, GeneratedInsight, Formation, OpponentTeam } from '../types';

interface SwotAnalysisProps {
  swot: SwotData;
  hgufcFormation: Formation;
  rivalFormation: Formation;
  opponent: OpponentTeam;
  insights: GeneratedInsight[];
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
  onUpdateSwot,
  onRegenerateInsights,
  onAddDirectiveToNotes,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'opportunity' | 'threat'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const opportunities = insights.filter(i => i.type === 'opportunity');
  const threats = insights.filter(i => i.type === 'threat');

  const displayedInsights = insights.filter(i => {
    if (filterType === 'all') return true;
    return i.type === filterType;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRecalculate = () => {
    setIsRecalculating(true);
    onRegenerateInsights();
    setTimeout(() => {
      setIsRecalculating(false);
    }, 450);
  };

  return (
    <div className="space-y-6">
      
      {/* 4-QUADRANT MANUAL SWOT MATRIX */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        
        {/* Card Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
              <span>Tactical SWOT Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter key qualitative observations for Hougang United FC and {opponent.name}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Clash:</span>
            <span className="font-bold text-orange-600">{hgufcFormation.name}</span>
            <span className="text-slate-400">vs</span>
            <span className="font-bold text-slate-700">{rivalFormation.name}</span>
          </div>
        </div>

        {/* 4 Quadrants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Top Left: Our Strengths (HGUFC) */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-50/50 via-white to-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center text-white text-[8px] font-black">S</span>
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
              placeholder="e.g. Rapid half-space progression through Shahdan Sulaiman; 2v1 flank overloads on right wing..."
              className="w-full text-xs font-medium text-slate-800 bg-white border border-orange-200 rounded-lg p-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-hidden resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Highlights your tactical strengths, technical combinations, and primary scoring avenues.
            </p>
          </div>

          {/* Top Right: Our Weaknesses (HGUFC) */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/50 via-white to-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-[8px] font-black">W</span>
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
              placeholder="e.g. Vulnerability to central counter-attacks when both fullbacks push high; second ball defensive aerial clearance..."
              className="w-full text-xs font-medium text-slate-800 bg-white border border-amber-200 rounded-lg p-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-hidden resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Internal vulnerabilities requiring tactical safeguards and rest-defense rules.
            </p>
          </div>

          {/* Bottom Left: Rival Strengths */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-gradient-to-br from-rose-50/40 via-white to-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-600 flex items-center justify-center text-white text-[8px] font-black">O</span>
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
              placeholder="e.g. Dangerous inverted wingers cutting into Zone 14; rapid transitions off opposition midfield giveaways..."
              className="w-full text-xs font-medium text-slate-800 bg-white border border-rose-200 rounded-lg p-2.5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-hidden resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Opponent danger points, key playmakers, and tactical transition patterns.
            </p>
          </div>

          {/* Bottom Right: Rival Weaknesses */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-gradient-to-br from-blue-50/40 via-white to-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-black">T</span>
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
              placeholder="e.g. Slow center-back turning acceleration; wingbacks leave massive space behind when overcommitted; defensive disorganization on set pieces..."
              className="w-full text-xs font-medium text-slate-800 bg-white border border-blue-200 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Flaws in rival system to exploit through specific passing routines and pressing triggers.
            </p>
          </div>

        </div>
      </div>


      {/* AUTOMATED OPPORTUNITIES & THREATS GENERATOR (Requirement 5) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        
        {/* Engine Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Lightbulb className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black tracking-wide text-white uppercase">
                  Automated Opportunities & Threats Engine
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-orange-500/30 text-orange-300 border border-orange-400/40 rounded-full">
                  Tactical AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Correlating <span className="text-orange-400 font-bold">{hgufcFormation.name}</span> vs <span className="text-slate-200 font-bold">{opponent.name} ({rivalFormation.name})</span> & SWOT Inputs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-slate-900 bg-orange-400 hover:bg-orange-300 active:bg-orange-500 rounded-lg transition-colors cursor-pointer disabled:opacity-75"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Analyzing...' : 'Recalculate Analysis'}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                filterType === 'all' 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Directives ({insights.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('opportunity')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                filterType === 'opportunity' 
                  ? 'bg-emerald-700 text-white' 
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-500" />
              <span>Opportunities ({opportunities.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('threat')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                filterType === 'threat' 
                  ? 'bg-rose-700 text-white' 
                  : 'text-rose-800 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span>Threats ({threats.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            Click <strong>Directive</strong> to copy or append directly to match day notes.
          </div>
        </div>

        {/* Insights Cards List */}
        <div className={`p-4 space-y-3 transition-opacity duration-200 ${isRecalculating ? 'opacity-40' : 'opacity-100'}`}>
          {displayedInsights.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No tactical insights matching this filter. Click 'Recalculate Analysis' to refresh.
            </div>
          ) : (
            displayedInsights.map((insight) => {
              const isOpportunity = insight.type === 'opportunity';

              return (
                <div
                  key={insight.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isOpportunity
                      ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/70 to-white hover:border-emerald-300'
                      : 'border-rose-200 bg-gradient-to-r from-rose-50/70 to-white hover:border-rose-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    
                    <div className="space-y-1 flex-1">
                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isOpportunity
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isOpportunity ? (
                            <Zap className="w-3 h-3 mr-1 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
                          )}
                          {isOpportunity ? 'Tactical Opportunity' : 'Defensive Threat'}
                        </span>

                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {insight.category}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {insight.description}
                      </p>

                      {/* Actionable Coaching Directive Box */}
                      <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 mt-0.5">
                              Actionable Directive
                            </span>
                            <p className="text-xs font-semibold text-slate-800 leading-normal">
                              {insight.actionableDirective}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopy(insight.id, insight.actionableDirective)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                              title="Copy directive"
                            >
                              {copiedId === insight.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onAddDirectiveToNotes(insight.actionableDirective)}
                              className="inline-flex items-center px-2 py-1 text-[10px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded border border-orange-200 transition-colors"
                              title="Append to Match Instructions"
                            >
                              <PlusCircle className="w-3 h-3 mr-1 text-orange-600" />
                              Add to Notes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
