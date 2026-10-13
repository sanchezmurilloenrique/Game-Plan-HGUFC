import React from 'react';
import { 
  MatchPlan, 
  Player, 
  Formation, 
  OpponentTeam, 
  GeneratedInsight, 
  MultidimensionalReport, 
  TacticalPhaseAnalysis 
} from '../types';

interface PrintReportViewProps {
  id?: string;
  matchPlan: MatchPlan;
  hgufcFormation: Formation;
  rivalFormation: Formation;
  opponent: OpponentTeam;
  players: Player[];
  insights: GeneratedInsight[];
  report?: MultidimensionalReport;
}

// Inline HGUFC Crest Emblem Component (Vector-based, zero network delay, no CORS/taint)
const HgufcBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const isSm = size === 'sm';
  return (
    <div 
      className={`${
        isSm ? 'w-10 h-10' : 'w-14 h-14'
      } rounded-xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-700 flex flex-col items-center justify-center text-white shadow-sm border border-orange-400 p-1 flex-shrink-0`}
    >
      <span className={`${isSm ? 'text-[7.5px]' : 'text-[9.5px]'} font-black tracking-tighter leading-none`}>
        HGFC
      </span>
      <svg 
        className={`${isSm ? 'w-4 h-4 my-0.2' : 'w-6 h-6 my-0.5'} text-white`} 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm0 2.18l6 3v4.82c0 4.54-3.14 8.78-6 9.87-2.86-1.09-6-5.33-6-9.87V7.18l6-3z" />
        <path d="M12 6.5l2.2 4.5h-4.4l2.2-4.5zm0 6.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" />
      </svg>
      <span className={`${isSm ? 'text-[5.5px]' : 'text-[6.5px]'} font-extrabold uppercase tracking-widest leading-none text-orange-200`}>
        CHEETAHS
      </span>
    </div>
  );
};

// Running Page Header for pages 2+
const SubPageHeader: React.FC<{
  sectionTitle: string;
  subtitle: string;
  pageNum: number;
  totalPages: number;
  opponent: OpponentTeam;
  matchPlan: MatchPlan;
}> = ({ sectionTitle, subtitle, pageNum, totalPages, opponent, matchPlan }) => (
  <div className="border-b-2 border-orange-500 pb-2.5 mb-3 flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <HgufcBadge size="sm" />
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
            HGUFC vs {opponent.shortName || opponent.name}
          </span>
          <span className="text-[9px] text-slate-500 font-bold">
            {matchPlan.competition || 'Singapore Premier League'} • {matchPlan.matchDate || 'Matchday'}
          </span>
        </div>
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-tight mt-0.5">
          {sectionTitle}
        </h2>
        <p className="text-[9px] text-slate-500 font-semibold">
          {subtitle}
        </p>
      </div>
    </div>
    <div className="text-right">
      <span className="inline-block bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-2xs">
        Page {pageNum} of {totalPages}
      </span>
      <p className="text-[8px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
        Tactical Dossier
      </p>
    </div>
  </div>
);

// Standard Page Footer for every page
const PageFooter: React.FC<{
  pageNum: number;
  totalPages: number;
  opponent: OpponentTeam;
}> = ({ pageNum, totalPages, opponent }) => (
  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[8.5px] text-slate-500 font-bold uppercase tracking-wider mt-auto">
    <div className="flex items-center space-x-2">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
      <span>Confidential • Hougang United FC Coaching Staff</span>
      <span className="text-slate-300">|</span>
      <span>vs {opponent.name}</span>
    </div>
    <div className="flex items-center space-x-2">
      <span>Game Plan HGUFC Analytics Engine</span>
      <span className="bg-slate-100 text-slate-800 font-black px-1.5 py-0.5 rounded border border-slate-200">
        Page {pageNum} of {totalPages}
      </span>
    </div>
  </div>
);

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  id = 'match-plan-pdf-document',
  matchPlan,
  hgufcFormation,
  rivalFormation,
  opponent,
  players,
  insights,
  report,
}) => {
  const startingXI = players.filter(p => p.pitchX !== undefined && p.pitchY !== undefined);
  const bench = players.filter(p => p.pitchX === undefined || p.pitchY === undefined);

  const opportunities = insights.filter(i => i.type === 'opportunity');
  const threats = insights.filter(i => i.type === 'threat');

  // Split the phases of play into clean chunks of 3 phases per page
  const phases = report?.phases || [];
  const phasesPerChunk = 3;
  const phaseChunks: TacticalPhaseAnalysis[][] = [];
  for (let i = 0; i < phases.length; i += phasesPerChunk) {
    phaseChunks.push(phases.slice(i, i + phasesPerChunk));
  }

  // Total pages: Page 1 (Overview) + Page 2 (SWOT & Directives) + Phase chunks
  const totalPages = 2 + (phaseChunks.length > 0 ? phaseChunks.length : 0);

  return (
    <div 
      id={id}
      className="space-y-6 print:space-y-0"
      style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#0f172a',
        backgroundColor: '#ffffff',
      }}
    >
      {/* =========================================================================
          PAGE 1: MATCH HEADER & TACTICAL BOARD + STARTING LINEUP
          ========================================================================= */}
      <div 
        className="pdf-page bg-white text-slate-900 mx-auto box-border"
        style={{
          width: '794px',
          minHeight: '1122px',
          height: '1122px',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pageBreakAfter: 'always',
          breakAfter: 'page',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          boxSizing: 'border-box',
          position: 'relative',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Top Header */}
        <div>
          <div className="border-b-4 border-orange-500 pb-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <HgufcBadge size="md" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      Official Match Dossier
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {matchPlan.competition || 'Singapore Premier League'}
                    </span>
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5 uppercase">
                    Game Plan <span className="text-orange-600">HGUFC</span> vs {opponent.name}
                  </h1>
                  <p className="text-[11px] text-slate-600 font-bold">
                    Tactical Clash: <span className="text-orange-600 font-black">{hgufcFormation.name}</span> vs <span className="text-slate-900 font-black">{rivalFormation.name}</span>
                  </p>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-600 space-y-0.5">
                <p><span className="font-bold text-slate-900">Date:</span> {matchPlan.matchDate || 'Matchday'}</p>
                <p><span className="font-bold text-slate-900">Venue:</span> {opponent.stadium || 'Jalan Besar Stadium'}</p>
                <p><span className="font-bold text-slate-900">Tactical Clash:</span> {hgufcFormation.name} vs {rivalFormation.name}</p>
                <span className="inline-block mt-1 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded">
                  Page 1 of {totalPages}
                </span>
              </div>
            </div>
          </div>

          {/* TACTICAL PITCH SNAPSHOT & STARTING XI COLUMN */}
          <div className="grid grid-cols-12 gap-4 mb-3">
            
            {/* Tactical Pitch (Left 7 Cols) */}
            <div className="col-span-7 bg-emerald-900 rounded-lg p-2 border-2 border-emerald-950 shadow-xs">
              <div 
                className="relative w-full h-[430px] rounded border-2 border-white/90 overflow-hidden"
                style={{
                  background: 'linear-gradient(to bottom, #15803d 0%, #166534 100%)',
                }}
              >
                {/* Lawn stripes */}
                <div className="absolute inset-0 flex flex-col pointer-events-none opacity-20">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`w-full flex-1 ${i % 2 === 0 ? 'bg-white/10' : 'bg-transparent'}`} />
                  ))}
                </div>

                {/* Pitch Markings SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect x="2" y="2" width="96" height="96" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                  <line x1="2" y1="50" x2="98" y2="50" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                  <circle cx="50" cy="50" r="10" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                  <circle cx="50" cy="50" r="0.8" fill="#ffffff" opacity="0.9" />

                  {/* Top goal (Rival) */}
                  <rect x="22" y="2" width="56" height="17" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                  <rect x="36" y="2" width="28" height="6" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                  <path d="M 40 19 A 9 9 0 0 0 60 19" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />

                  {/* Bottom goal (HGUFC) */}
                  <rect x="22" y="81" width="56" height="17" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                  <rect x="36" y="92" width="28" height="6" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                  <path d="M 40 81 A 9 9 0 0 1 60 81" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                </svg>

                {/* Team Badges on Pitch */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[8.5px] font-bold px-2 py-0.5 rounded shadow">
                  {opponent.name.toUpperCase()} ({rivalFormation.name})
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[8.5px] font-black px-2 py-0.5 rounded shadow">
                  HOUGANG UNITED FC ({hgufcFormation.name})
                </div>

                {/* Rival Players on Pitch */}
                {rivalFormation.positions.map((pos, idx) => {
                  const rivalP = opponent.players?.[idx];
                  const rNumber = rivalP?.number ?? (idx + 1);
                  const rName = rivalP?.name ?? `#${idx + 1}`;
                  const rivalY = 100 - pos.y;
                  return (
                    <div
                      key={`print-rival-${idx}`}
                      style={{
                        left: `${pos.x}%`,
                        top: `${rivalY}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute z-10 flex flex-col items-center"
                    >
                      <div 
                        className="w-5.5 h-5.5 rounded-full flex flex-col items-center justify-center font-black border border-white text-[7.5px] shadow text-white"
                        style={{ backgroundColor: opponent.primaryColor || '#dc2626' }}
                      >
                        <span>{rNumber}</span>
                      </div>
                      <span className="text-[7px] font-bold text-white bg-slate-900/90 px-1 rounded whitespace-nowrap mt-0.5 shadow-xs">
                        {rName.split(' ').pop()}
                      </span>
                    </div>
                  );
                })}

                {/* HGUFC Starting XI on Pitch */}
                {startingXI.map((p) => {
                  const isGK = p.position === 'GK';
                  return (
                    <div
                      key={p.id}
                      style={{
                        left: `${p.pitchX}%`,
                        top: `${p.pitchY}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute z-20 flex flex-col items-center"
                    >
                      <div className={`w-6 h-6 rounded-full flex flex-col items-center justify-center font-black border border-white text-[8.5px] shadow ${
                        isGK ? 'bg-amber-400 text-slate-950' : 'bg-orange-600 text-white'
                      }`}>
                        <span>{p.number}</span>
                      </div>
                      <span className="text-[7.5px] font-bold text-white bg-slate-900/90 px-1 rounded whitespace-nowrap mt-0.5 shadow-xs">
                        {p.name.split(' ').pop()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Starting Lineup & Bench (Right 5 Cols) */}
            <div className="col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 mb-1.5">
                  <h3 className="text-[11px] font-black uppercase text-slate-900">
                    Starting XI ({hgufcFormation.name})
                  </h3>
                  <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                    {startingXI.length}/11 Assigned
                  </span>
                </div>

                <div className="space-y-0.5">
                  {startingXI.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-0.5 text-[10px] border-b border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-4 h-4 rounded text-[8.5px] font-black flex items-center justify-center ${
                          p.position === 'GK' ? 'bg-amber-400 text-slate-950' : 'bg-orange-500 text-white'
                        }`}>
                          {p.number}
                        </span>
                        <span className="font-bold text-slate-800">{p.name}</span>
                        {p.preferredFoot && (
                          <span className="text-[8px] font-semibold text-slate-400">({p.preferredFoot[0]})</span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{p.roleLabel || p.position}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-200">
                <h4 className="text-[10px] font-black uppercase text-slate-700 mb-0.5">
                  Substitutes & Tactical Options ({bench.length})
                </h4>
                <p className="text-[9px] text-slate-600 leading-snug">
                  {bench.map(b => `#${b.number} ${b.name} (${b.position})`).join(' • ') || 'None assigned.'}
                </p>
              </div>
            </div>

          </div>

          {/* Tactical Matchup & Strategic Balance Banner */}
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-[9.5px]">
            <div className="flex-1 border-r border-slate-200 pr-3">
              <span className="font-black text-slate-900 uppercase block text-[9px] text-orange-600">
                Key Matchup Dynamic
              </span>
              <p className="text-slate-700 font-medium leading-tight mt-0.5">
                Hougang United FC deploys in a structured <strong>{hgufcFormation.name}</strong> against {opponent.name}&apos;s <strong>{rivalFormation.name}</strong>. Aim for numerical superiorities in half-spaces and controlled rest defense.
              </p>
            </div>
            <div className="w-48 text-[9px] text-slate-600 space-y-0.5">
              <p><strong className="text-slate-800">Pitch Tooling:</strong> {matchPlan.showPitchZones ? 'Zones & Half-Spaces Active' : 'Standard View'}</p>
              <p><strong className="text-slate-800">Opposition Scout:</strong> {opponent.tacticalStyle || 'Organized Structure'}</p>
            </div>
          </div>
        </div>

        {/* Page 1 Footer */}
        <PageFooter pageNum={1} totalPages={totalPages} opponent={opponent} />
      </div>

      {/* =========================================================================
          PAGE 2: SWOT MATRIX (DAFO) & COACHING PHASE INSTRUCTIONS
          ========================================================================= */}
      <div 
        className="pdf-page bg-white text-slate-900 mx-auto box-border"
        style={{
          width: '794px',
          minHeight: '1122px',
          height: '1122px',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pageBreakAfter: 'always',
          breakAfter: 'page',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          boxSizing: 'border-box',
          position: 'relative',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div>
          {/* Running Page Header */}
          <SubPageHeader 
            sectionTitle="Part 2: Tactical SWOT Matrix & Strategic Coaching Directives"
            subtitle="DAFO Assessment, Automated Dynamics & 6-Phase Coaching Playbook"
            pageNum={2}
            totalPages={totalPages}
            opponent={opponent}
            matchPlan={matchPlan}
          />

          {/* 1. SWOT MATRIX (4-Quadrant Sports Card) */}
          <div className="mb-3">
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-600"></span>
              <span>Tactical SWOT Matrix (DAFO: HGUFC vs {opponent.name})</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Strengths */}
              <div className="p-2 bg-orange-50/70 border border-orange-200 rounded-lg">
                <h4 className="text-[10px] font-black uppercase text-orange-950 mb-0.5">
                  [S] Our Strengths (Hougang United FC)
                </h4>
                <p className="text-[9px] text-slate-700 whitespace-pre-line leading-relaxed">
                  {matchPlan.swot.ourStrengths || 'High tactical cohesion, fluid positional rotations, and rapid vertical transition speed.'}
                </p>
              </div>

              {/* Weaknesses */}
              <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg">
                <h4 className="text-[10px] font-black uppercase text-amber-950 mb-0.5">
                  [W] Our Weaknesses & Risks (HGUFC)
                </h4>
                <p className="text-[9px] text-slate-700 whitespace-pre-line leading-relaxed">
                  {matchPlan.swot.ourWeaknesses || 'Vulnerability to wide diagonal counter-attacks when fullbacks advance high.'}
                </p>
              </div>

              {/* Rival Strengths */}
              <div className="p-2 bg-rose-50/70 border border-rose-200 rounded-lg">
                <h4 className="text-[10px] font-black uppercase text-rose-950 mb-0.5">
                  [O] Rival Strengths ({opponent.name})
                </h4>
                <p className="text-[9px] text-slate-700 whitespace-pre-line leading-relaxed">
                  {matchPlan.swot.rivalStrengths || 'Direct aerial dominance and disciplined second-ball recovery.'}
                </p>
              </div>

              {/* Rival Weaknesses */}
              <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-lg">
                <h4 className="text-[10px] font-black uppercase text-blue-950 mb-0.5">
                  [T] Rival Weaknesses & Exploits
                </h4>
                <p className="text-[9px] text-slate-700 whitespace-pre-line leading-relaxed">
                  {matchPlan.swot.rivalWeaknesses || 'Slow defensive recovery in wide channels when pressed with intensity.'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. AUTOMATED OPPORTUNITIES & THREATS DIRECTIVES */}
          <div className="mb-3 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Automated Tactical Directives & Clashing Dynamics</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Opportunities Column */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Tactical Opportunities
                </span>
                {opportunities.slice(0, 3).map((opp) => (
                  <div key={opp.id} className="p-2 bg-emerald-50/50 border border-emerald-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-[9.5px]">{opp.title}</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase">{opp.category}</span>
                    </div>
                    <p className="text-[9px] text-slate-700 mt-0.5 leading-tight">{opp.description}</p>
                    <p className="text-[9px] font-bold text-emerald-900 mt-1 bg-white p-1 rounded border border-emerald-200">
                      Directive: {opp.actionableDirective}
                    </p>
                  </div>
                ))}
              </div>

              {/* Threats Column */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                  Defensive Threats & Safeguards
                </span>
                {threats.slice(0, 3).map((th) => (
                  <div key={th.id} className="p-2 bg-rose-50/50 border border-rose-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-[9.5px]">{th.title}</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase">{th.category}</span>
                    </div>
                    <p className="text-[9px] text-slate-700 mt-0.5 leading-tight">{th.description}</p>
                    <p className="text-[9px] font-bold text-rose-900 mt-1 bg-white p-1 rounded border border-rose-200">
                      Safeguard: {th.actionableDirective}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. TACTICAL PHASE INSTRUCTIONS */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Tactical Phase Instructions & Coaching Directives</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-black text-slate-900 block uppercase mb-0.5">1. Build-Up Phase</span>
                <p className="text-slate-700 leading-snug">{matchPlan.tacticalNotes.buildUpPhase || 'Clean 3+2 progression from the back.'}</p>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-black text-slate-900 block uppercase mb-0.5">2. In-Possession Structure</span>
                <p className="text-slate-700 leading-snug">{matchPlan.tacticalNotes.inPossessionStructure || '3-2-5 or 2-3-5 spacing with width maintained.'}</p>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-black text-slate-900 block uppercase mb-0.5">3. Defensive Transition</span>
                <p className="text-slate-700 leading-snug">{matchPlan.tacticalNotes.outOfPossessionTransition || 'Immediate 5-second counter-press; if broken, drop into mid-block.'}</p>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-black text-slate-900 block uppercase mb-0.5">4. Pressing Triggers</span>
                <p className="text-slate-700 leading-snug">{matchPlan.tacticalNotes.pressingTriggers || 'Trigger press on backward pass or poor touch into wide channel.'}</p>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-black text-slate-900 block uppercase mb-0.5">5. Rest Defense</span>
                <p className="text-slate-700 leading-snug">{matchPlan.tacticalNotes.restDefense || 'Lock 3+1 rest defense structure covering center circle.'}</p>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="font-black text-slate-900 block uppercase mb-0.5">6. Set Pieces</span>
                <p className="text-slate-700 leading-snug">{matchPlan.tacticalNotes.setPieces || 'Inswinging corners targeted to near post flick with far post runner.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <PageFooter pageNum={2} totalPages={totalPages} opponent={opponent} />
      </div>

      {/* =========================================================================
          PAGES 3+: TRIPLE-SYNTHETIC TACTICAL INTELLIGENCE (10 PHASES OF PLAY)
          Each chunk of phases rendered on its own dedicated A4 page with clean headers
          ========================================================================= */}
      {phaseChunks.map((chunk, chunkIdx) => {
        const pageNum = 3 + chunkIdx;
        const isLastPage = pageNum === totalPages;
        const firstPhase = chunk[0];
        const lastPhase = chunk[chunk.length - 1];

        return (
          <div 
            key={`pdf-phase-page-${chunkIdx}`}
            className="pdf-page bg-white text-slate-900 mx-auto box-border"
            style={{
              width: '794px',
              minHeight: '1122px',
              height: '1122px',
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              pageBreakAfter: isLastPage ? 'avoid' : 'always',
              breakAfter: isLastPage ? 'avoid' : 'page',
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              boxSizing: 'border-box',
              position: 'relative',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
            }}
          >
            <div>
              {/* Running Page Header */}
              <SubPageHeader 
                sectionTitle={`Part 3: 10 Phases of Play — Phases ${firstPhase.phaseNumber} to ${lastPhase.phaseNumber}`}
                subtitle="Triple-Synthetic Framework: Gemini (Geometry) • ChatGPT (Profiles) • Claude (Operational SWOT)"
                pageNum={pageNum}
                totalPages={totalPages}
                opponent={opponent}
                matchPlan={matchPlan}
              />

              {/* Phase Cards */}
              <div className="space-y-3">
                {chunk.map((phase) => (
                  <div 
                    key={phase.phaseKey}
                    className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200 shadow-2xs break-inside-avoid"
                  >
                    {/* Phase Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded bg-orange-600 text-white font-black text-[9px] flex items-center justify-center">
                          {phase.phaseNumber}
                        </span>
                        <h3 className="text-[11px] font-black uppercase text-slate-900">
                          {phase.phaseName}
                        </h3>
                        <span className="text-[9px] text-slate-500 italic">
                          — {phase.subtitle}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                        Phase {phase.phaseNumber} of 10
                      </span>
                    </div>

                    {/* 3 Perspectives Grid */}
                    <div className="grid grid-cols-3 gap-2 text-[8.5px] leading-snug mb-1.5">
                      
                      {/* 1. Gemini */}
                      <div className="p-1.5 bg-blue-50/60 border border-blue-200 rounded">
                        <span className="font-black text-blue-900 block uppercase border-b border-blue-200/60 pb-0.5 mb-0.5">
                          1. Gemini (Geometry)
                        </span>
                        <p className="mb-0.5"><strong className="text-blue-950">Channels:</strong> {phase.geminiPerspective.channelOccupation}</p>
                        <p className="mb-0.5"><strong className="text-blue-950">Lines:</strong> {phase.geminiPerspective.lineHeightsAndCompactness}</p>
                        <p><strong className="text-blue-950">Superiority:</strong> {phase.geminiPerspective.superiorities}</p>
                      </div>

                      {/* 2. ChatGPT */}
                      <div className="p-1.5 bg-emerald-50/60 border border-emerald-200 rounded">
                        <span className="font-black text-emerald-900 block uppercase border-b border-emerald-200/60 pb-0.5 mb-0.5">
                          2. ChatGPT (Profiles)
                        </span>
                        <p className="mb-0.5"><strong className="text-emerald-950">Traits:</strong> {phase.chatGptPerspective.playerProfiles}</p>
                        <p><strong className="text-emerald-950">Behaviors:</strong> {phase.chatGptPerspective.requiredBehaviors}</p>
                      </div>

                      {/* 3. Claude */}
                      <div className="p-1.5 bg-amber-50/60 border border-amber-200 rounded">
                        <span className="font-black text-amber-900 block uppercase border-b border-amber-200/60 pb-0.5 mb-0.5">
                          3. Claude (SWOT)
                        </span>
                        <p><strong className="text-orange-800">[S]</strong> {phase.claudePerspective.strength}</p>
                        <p><strong className="text-amber-800">[W]</strong> {phase.claudePerspective.weakness}</p>
                        <p><strong className="text-emerald-800">[O]</strong> {phase.claudePerspective.opportunity}</p>
                        <p><strong className="text-rose-800">[T]</strong> {phase.claudePerspective.threat}</p>
                      </div>

                    </div>

                    {/* Direct Tactical Recommendation */}
                    <div className="p-1.5 bg-white rounded border border-orange-200 flex items-start space-x-1.5">
                      <span className="font-black text-orange-600 text-[9px] uppercase flex-shrink-0">
                        Directive:
                      </span>
                      <span className="font-bold text-slate-800 text-[8.5px]">
                        {phase.directTacticalRecommendation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* On the final page, add In-Game Contingencies & Coaching Sign-off Stamp */}
              {isLastPage && (
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-3 gap-2 mb-2 text-[8.5px]">
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                      <span className="font-black text-slate-900 block uppercase text-[8px] text-emerald-700">Early Lead Protocol</span>
                      <p className="text-slate-600 mt-0.5">Shift to compact 5-4-1 or 4-4-2 mid-block; exploit transition spaces behind pressing fullbacks.</p>
                    </div>
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                      <span className="font-black text-slate-900 block uppercase text-[8px] text-amber-700">Trailing at 70&apos; Protocol</span>
                      <p className="text-slate-600 mt-0.5">Overload box with 2 strikers, advance fullbacks to touchlines, apply intense 5-second counter-press.</p>
                    </div>
                    <div className="p-1.5 bg-slate-50 border border-slate-200 rounded">
                      <span className="font-black text-slate-900 block uppercase text-[8px] text-rose-700">Red Card Protocol</span>
                      <p className="text-slate-600 mt-0.5">Form 4-4-1 compact defensive shell; concede outer flanks while locking central half-spaces.</p>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-100/80 rounded border border-slate-300 flex items-center justify-between text-[8.5px]">
                    <div className="space-y-0.5">
                      <span className="font-black text-slate-900 uppercase block text-[8px]">
                        Official Coaching Verification & Sign-Off
                      </span>
                      <p className="text-slate-600">
                        Validated by Hougang United FC Coaching Staff & Tactical Analytics Department.
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-center">
                      <div>
                        <div className="w-20 border-b border-slate-400 pb-1 text-[7.5px] font-bold text-slate-700 italic">
                          F. Ariffin
                        </div>
                        <span className="text-[7px] text-slate-500 uppercase font-semibold">Head Coach</span>
                      </div>
                      <div>
                        <div className="w-20 border-b border-slate-400 pb-1 text-[7.5px] font-bold text-slate-700 italic">
                          Analyst Team
                        </div>
                        <span className="text-[7px] text-slate-500 uppercase font-semibold">Performance Analyst</span>
                      </div>
                      <div className="px-2 py-1 bg-orange-600 text-white font-black text-[7.5px] rounded uppercase tracking-wider">
                        VALIDATED
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sub-page Footer */}
            <PageFooter pageNum={pageNum} totalPages={totalPages} opponent={opponent} />
          </div>
        );
      })}
    </div>
  );
};
