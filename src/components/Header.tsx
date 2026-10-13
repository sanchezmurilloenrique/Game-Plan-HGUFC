import React from 'react';
import { Download, Users, Shield, Layers, RefreshCw, Calendar, MapPin, Trophy, Database } from 'lucide-react';
import { MatchPlan, OpponentTeam, Formation } from '../types';

interface HeaderProps {
  matchPlan: MatchPlan;
  opponents: OpponentTeam[];
  hgufcFormations: Formation[];
  rivalFormations: Formation[];
  onUpdateMatchPlan: (partial: Partial<MatchPlan>) => void;
  onOpenPlayerModal: () => void;
  onOpenFormationModal: () => void;
  onOpenOpponentModal: () => void;
  onOpenSupabaseSql?: () => void;
  onExportPdf: () => void;
  onResetData: () => void;
  isExporting: boolean;
  onOpenRivalCustomizer?: () => void;
  onUpdateOpponentColor?: (color: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  matchPlan,
  opponents,
  hgufcFormations,
  rivalFormations,
  onUpdateMatchPlan,
  onOpenPlayerModal,
  onOpenFormationModal,
  onOpenOpponentModal,
  onOpenSupabaseSql,
  onExportPdf,
  onResetData,
  isExporting,
  onOpenRivalCustomizer,
  onUpdateOpponentColor,
}) => {
  const currentOpponent = opponents.find(o => o.id === matchPlan.selectedOpponentId) || opponents[0];
  const currentHgFormation = hgufcFormations.find(f => f.id === matchPlan.hgufcFormationId);
  const currentRivalFormation = rivalFormations.find(f => f.id === matchPlan.rivalFormationId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Emblem */}
          <div className="flex items-center space-x-3.5">
            <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-full p-1 border-2 border-orange-500 shadow-sm flex items-center justify-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original" 
                alt="Hougang United FC Logo" 
                className="w-10 h-10 object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/hougang-united-logo.svg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                  Game Plan <span className="text-orange-600">HGUFC</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-800 rounded-full uppercase tracking-wider">
                  SPL Pro
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>Hougang United Football Club</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                <span>Tactical Match Preparation & Analytics Suite</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* CRUD Modals Access */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={onOpenPlayerModal}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-white rounded-md transition-colors"
                title="Manage 30 Player Squad Roster"
              >
                <Users className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Roster
              </button>
              <button
                type="button"
                onClick={onOpenFormationModal}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-white rounded-md transition-colors"
                title="Manage Formations"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Formations
              </button>
              <button
                type="button"
                onClick={onOpenOpponentModal}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-white rounded-md transition-colors"
                title="Manage SPL Opponent Teams"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Opponents
              </button>
            </div>

            {/* Supabase Database SQL Modal */}
            {onOpenSupabaseSql && (
              <button
                type="button"
                onClick={onOpenSupabaseSql}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                title="View and Copy Supabase Database Schema & Tables SQL"
              >
                <Database className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                <span>Supabase SQL</span>
              </button>
            )}

            {/* Reset Defaults */}
            <button
              type="button"
              onClick={onResetData}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Reset Roster & Tactics to Defaults"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Prominent Export PDF Button */}
            <button
              type="button"
              onClick={onExportPdf}
              disabled={isExporting}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:from-orange-700 active:to-amber-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
            >
              <Download className={`w-4 h-4 mr-1.5 ${isExporting ? 'animate-bounce' : ''}`} />
              {isExporting ? 'Generating Dossier...' : 'Export Match Plan (PDF)'}
            </button>
          </div>
        </div>
      </div>

      {/* Match Fixture Sub-Header */}
      <div className="bg-slate-900 text-slate-100 border-t border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          
          {/* Match Clash Selectors */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            
            {/* HGUFC Side */}
            <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original" 
                alt="HGUFC Crest" 
                className="w-4 h-4 object-contain rounded-full" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/hougang-united-logo.svg'; }}
              />
              <span className="font-bold text-orange-400">HGUFC</span>
              <select
                aria-label="Hougang United FC Formation"
                value={matchPlan.hgufcFormationId}
                onChange={(e) => onUpdateMatchPlan({ hgufcFormationId: e.target.value })}
                className="bg-slate-900 text-white font-medium text-xs px-2 py-0.5 rounded border border-slate-700 focus:outline-hidden focus:border-orange-500"
              >
                {hgufcFormations.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <span className="text-slate-400 font-extrabold text-sm">VS</span>

            {/* Opponent Side */}
            <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              {/* Rival Crest Thumbnail or Color Indicator */}
              <div className="relative flex items-center">
                {currentOpponent?.logoUrl ? (
                  <img 
                    src={currentOpponent.logoUrl} 
                    alt={currentOpponent.name} 
                    className="w-4 h-4 object-cover rounded-full border border-white/40 mr-1" 
                  />
                ) : (
                  <span 
                    className="w-3 h-3 rounded-full mr-1 border border-white/50" 
                    style={{ backgroundColor: currentOpponent?.primaryColor || '#94A3B8' }}
                  />
                )}
                
                {/* HTML5 Color Picker to change rival kit color in 1 click */}
                {onUpdateOpponentColor && (
                  <input
                    type="color"
                    value={currentOpponent?.primaryColor || '#94A3B8'}
                    onChange={(e) => onUpdateOpponentColor(e.target.value)}
                    className="w-4 h-4 p-0 rounded cursor-pointer border border-slate-600 bg-transparent"
                    title="Change Rival Team Kit Color"
                  />
                )}
              </div>

              <select
                aria-label="Singapore Premier League Opponent"
                value={matchPlan.selectedOpponentId}
                onChange={(e) => onUpdateMatchPlan({ selectedOpponentId: e.target.value })}
                className="bg-slate-900 text-white font-bold text-xs px-2 py-0.5 rounded border border-slate-700 focus:outline-hidden focus:border-orange-500"
              >
                {opponents.map(opp => (
                  <option key={opp.id} value={opp.id}>{opp.name} ({opp.shortName})</option>
                ))}
              </select>

              <select
                aria-label="Opponent Formation"
                value={matchPlan.rivalFormationId}
                onChange={(e) => onUpdateMatchPlan({ rivalFormationId: e.target.value })}
                className="bg-slate-900 text-slate-300 font-medium text-xs px-2 py-0.5 rounded border border-slate-700 focus:outline-hidden focus:border-orange-500"
              >
                {rivalFormations.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>

              {/* Quick Customize Rival Modal Trigger */}
              {onOpenRivalCustomizer && (
                <button
                  type="button"
                  onClick={onOpenRivalCustomizer}
                  className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold rounded border border-slate-600 transition-colors"
                  title="Customize Rival Kit Color, Crest Logo, and Player Names"
                >
                  Edit Rival
                </button>
              )}
            </div>
          </div>

          {/* Match Context Details */}
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <div className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Singapore Premier League</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>{currentOpponent?.stadium || 'Jalan Besar Stadium'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={matchPlan.matchDate}
                onChange={(e) => onUpdateMatchPlan({ matchDate: e.target.value })}
                className="bg-transparent text-slate-300 font-medium cursor-pointer border-none focus:outline-hidden text-xs"
              />
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
