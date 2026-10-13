import React from 'react';
import { MatchPlan, Player, Formation, OpponentTeam, GeneratedInsight } from '../types';

interface PrintReportViewProps {
  matchPlan: MatchPlan;
  hgufcFormation: Formation;
  rivalFormation: Formation;
  opponent: OpponentTeam;
  players: Player[];
  insights: GeneratedInsight[];
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  matchPlan,
  hgufcFormation,
  rivalFormation,
  opponent,
  players,
  insights,
}) => {
  const startingXI = players.filter(p => p.pitchX !== undefined && p.pitchY !== undefined);
  const bench = players.filter(p => p.pitchX === undefined || p.pitchY === undefined);

  const opportunities = insights.filter(i => i.type === 'opportunity').slice(0, 4);
  const threats = insights.filter(i => i.type === 'threat').slice(0, 4);

  return (
    <div 
      id="match-plan-pdf-document"
      className="bg-white text-slate-900 p-8 w-[840px] mx-auto text-xs leading-normal"
      style={{
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* ================= PAGE 1: MATCH HEADER & TACTICAL BOARD ================= */}
      <div className="border-b-4 border-orange-500 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original" 
              alt="Hougang United FC Logo" 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/hougang-united-logo.svg';
              }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold tracking-widest uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  Official Match Dossier
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Singapore Premier League
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 uppercase">
                Game Plan <span className="text-orange-600">HGUFC</span>
              </h1>
              <p className="text-xs text-slate-600 font-bold">
                Hougang United FC vs {opponent.name}
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-600 space-y-0.5">
            <p><span className="font-bold text-slate-900">Date:</span> {matchPlan.matchDate || 'Matchday'}</p>
            <p><span className="font-bold text-slate-900">Venue:</span> {opponent.stadium || 'Jalan Besar Stadium'}</p>
            <p><span className="font-bold text-slate-900">Tactical Clash:</span> {hgufcFormation.name} vs {rivalFormation.name}</p>
          </div>
        </div>
      </div>

      {/* TACTICAL PITCH SNAPSHOT & STARTING XI COLUMN */}
      <div className="grid grid-cols-12 gap-5 mb-6">
        
        {/* Tactical Pitch (Left 7 Cols) */}
        <div className="col-span-7 bg-emerald-900 rounded-lg p-2.5 border-2 border-emerald-950 shadow-sm">
          <div className="relative w-full h-[440px] rounded border-2 border-white/90 overflow-hidden"
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

              {/* Top goal */}
              <rect x="22" y="2" width="56" height="17" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
              <rect x="36" y="2" width="28" height="6" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
              <path d="M 40 19 A 9 9 0 0 0 60 19" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />

              {/* Bottom goal */}
              <rect x="22" y="81" width="56" height="17" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
              <rect x="36" y="92" width="28" height="6" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
              <path d="M 40 81 A 9 9 0 0 1 60 81" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
            </svg>

            {/* Labels */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded">
              {opponent.name.toUpperCase()} ({rivalFormation.name})
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded">
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
                  className="absolute z-15 flex flex-col items-center"
                >
                  <div 
                    className="w-6 h-6 rounded-full flex flex-col items-center justify-center font-black border border-white text-[8px] shadow text-white"
                    style={{ backgroundColor: opponent.primaryColor }}
                  >
                    <span>{rNumber}</span>
                  </div>
                  <span className="text-[7.5px] font-bold text-white bg-slate-900/90 px-1 rounded whitespace-nowrap mt-0.5">
                    {rName.split(' ').pop()}
                  </span>
                </div>
              );
            })}

            {/* Players on Pitch */}
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
                  <div className={`w-7 h-7 rounded-full flex flex-col items-center justify-center font-black border border-white text-[9px] shadow ${
                    isGK ? 'bg-amber-400 text-slate-950' : 'bg-orange-600 text-white'
                  }`}>
                    <span>{p.number}</span>
                  </div>
                  <span className="text-[8px] font-bold text-white bg-slate-900/90 px-1 rounded whitespace-nowrap mt-0.5">
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
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
              <h3 className="text-xs font-black uppercase text-slate-900">
                Starting XI ({hgufcFormation.name})
              </h3>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                {startingXI.length}/11 Selected
              </span>
            </div>

            <div className="space-y-1">
              {startingXI.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-0.5 text-[11px] border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${
                      p.position === 'GK' ? 'bg-amber-400 text-slate-950' : 'bg-orange-500 text-white'
                    }`}>
                      {p.number}
                    </span>
                    <span className="font-bold text-slate-800">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{p.roleLabel || p.position}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-200">
            <h4 className="text-[11px] font-black uppercase text-slate-700 mb-1">
              Substitutes & Tactical Options ({bench.length})
            </h4>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              {bench.map(b => `#${b.number} ${b.name} (${b.position})`).join(' • ')}
            </p>
          </div>
        </div>

      </div>

      {/* SWOT MATRIX (4-Quadrant Sports Card) */}
      <div className="mb-6 pt-4 border-t-2 border-slate-200">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-2 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
          <span>Tactical SWOT Matrix (HGUFC vs {opponent.name})</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Strengths */}
          <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-lg">
            <h4 className="text-[11px] font-black uppercase text-orange-950 mb-1">
              [S] Our Strengths (Hougang United FC)
            </h4>
            <p className="text-[10px] text-slate-700 whitespace-pre-line leading-relaxed">
              {matchPlan.swot.ourStrengths || 'None specified.'}
            </p>
          </div>

          {/* Weaknesses */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <h4 className="text-[11px] font-black uppercase text-amber-950 mb-1">
              [W] Our Weaknesses & Risks (HGUFC)
            </h4>
            <p className="text-[10px] text-slate-700 whitespace-pre-line leading-relaxed">
              {matchPlan.swot.ourWeaknesses || 'None specified.'}
            </p>
          </div>

          {/* Rival Strengths */}
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
            <h4 className="text-[11px] font-black uppercase text-rose-950 mb-1">
              [O] Rival Strengths ({opponent.name})
            </h4>
            <p className="text-[10px] text-slate-700 whitespace-pre-line leading-relaxed">
              {matchPlan.swot.rivalStrengths || 'None specified.'}
            </p>
          </div>

          {/* Rival Weaknesses */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
            <h4 className="text-[11px] font-black uppercase text-blue-950 mb-1">
              [T] Rival Weaknesses & Exploits
            </h4>
            <p className="text-[10px] text-slate-700 whitespace-pre-line leading-relaxed">
              {matchPlan.swot.rivalWeaknesses || 'None specified.'}
            </p>
          </div>
        </div>
      </div>

      {/* AUTOMATED OPPORTUNITIES & THREATS DIRECTIVES */}
      <div className="mb-6 pt-4 border-t-2 border-slate-200">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-2">
          Automated Tactical Directives & Clashing Dynamics
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Opportunities Column */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              High-Priority Tactical Opportunities
            </span>
            {opportunities.map((opp) => (
              <div key={opp.id} className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-[10.5px]">{opp.title}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{opp.category}</span>
                </div>
                <p className="text-[10px] text-slate-700 mt-1 leading-snug">{opp.description}</p>
                <p className="text-[10px] font-bold text-emerald-900 mt-1.5 bg-white p-1 rounded border border-emerald-200">
                  Directive: {opp.actionableDirective}
                </p>
              </div>
            ))}
          </div>

          {/* Threats Column */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
              Critical Defensive Threats
            </span>
            {threats.map((th) => (
              <div key={th.id} className="p-2.5 bg-rose-50/50 border border-rose-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-[10.5px]">{th.title}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{th.category}</span>
                </div>
                <p className="text-[10px] text-slate-700 mt-1 leading-snug">{th.description}</p>
                <p className="text-[10px] font-bold text-rose-900 mt-1.5 bg-white p-1 rounded border border-rose-200">
                  Safeguard: {th.actionableDirective}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TACTICAL PHASE INSTRUCTIONS */}
      <div className="pt-4 border-t-2 border-slate-200">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 mb-2">
          Tactical Phase Instructions & Coaching Directives
        </h3>

        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-black text-slate-900 block uppercase mb-1">1. Build-Up Phase</span>
            <p className="text-slate-700 leading-relaxed">{matchPlan.tacticalNotes.buildUpPhase}</p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-black text-slate-900 block uppercase mb-1">2. In-Possession Structure</span>
            <p className="text-slate-700 leading-relaxed">{matchPlan.tacticalNotes.inPossessionStructure}</p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-black text-slate-900 block uppercase mb-1">3. Defensive Transition</span>
            <p className="text-slate-700 leading-relaxed">{matchPlan.tacticalNotes.outOfPossessionTransition}</p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-black text-slate-900 block uppercase mb-1">4. Pressing Triggers</span>
            <p className="text-slate-700 leading-relaxed">{matchPlan.tacticalNotes.pressingTriggers}</p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-black text-slate-900 block uppercase mb-1">5. Rest Defense</span>
            <p className="text-slate-700 leading-relaxed">{matchPlan.tacticalNotes.restDefense}</p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="font-black text-slate-900 block uppercase mb-1">6. Set Pieces</span>
            <p className="text-slate-700 leading-relaxed">{matchPlan.tacticalNotes.setPieces}</p>
          </div>
        </div>
      </div>

      {/* Footer stamp */}
      <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
        <span>Confidential • Hougang United FC Coaching Staff</span>
        <span>Compiled via Game Plan HGUFC Analytics Engine</span>
      </div>
    </div>
  );
};
