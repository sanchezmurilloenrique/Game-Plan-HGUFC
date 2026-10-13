import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldAlert, 
  ArrowRightLeft, 
  CheckCircle2, 
  Sparkles,
  Info,
  Shield,
  Palette,
  Edit3
} from 'lucide-react';
import { Player, PlayerPosition, OpponentTeam, OpponentPlayer } from '../types';

interface SquadRosterProps {
  players: Player[];
  opponent?: OpponentTeam;
  onPlaceOnPitch: (player: Player) => void;
  onRemoveFromPitch: (playerId: string) => void;
  onOpenAddPlayerModal: () => void;
  onSelectPlayerForDetail: (player: Player) => void;
  onUpdateRivalPlayer?: (index: number, updated: Partial<OpponentPlayer>) => void;
  onOpenRivalCustomizer?: () => void;
}

export const SquadRoster: React.FC<SquadRosterProps> = ({
  players,
  opponent,
  onPlaceOnPitch,
  onRemoveFromPitch,
  onOpenAddPlayerModal,
  onSelectPlayerForDetail,
  onUpdateRivalPlayer,
  onOpenRivalCustomizer,
}) => {
  const [rosterTeam, setRosterTeam] = useState<'hgufc' | 'rival'>('hgufc');
  const [activeTab, setActiveTab] = useState<'ALL' | PlayerPosition>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Count by position
  const gkCount = players.filter(p => p.position === 'GK').length;
  const defCount = players.filter(p => p.position === 'DEF').length;
  const midCount = players.filter(p => p.position === 'MID').length;
  const fwdCount = players.filter(p => p.position === 'FWD').length;
  const onPitchCount = players.filter(p => p.pitchX !== undefined && p.pitchY !== undefined).length;

  const filteredPlayers = players.filter(p => {
    const matchesTab = activeTab === 'ALL' || p.position === activeTab;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.number.toString().includes(searchQuery) ||
      (p.roleLabel && p.roleLabel.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const rivalPlayers = opponent?.players || [];
  const filteredRivalPlayers = rivalPlayers.filter(p => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           p.number.toString().includes(searchQuery) ||
           p.role.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/90 flex flex-col h-full overflow-hidden">
      
      {/* Top Team Switcher: HGUFC vs Rival Squad */}
      <div className="p-2 border-b border-slate-200 bg-slate-100 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setRosterTeam('hgufc')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            rosterTeam === 'hgufc'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-transparent'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>HGUFC Squad ({players.length})</span>
        </button>

        {opponent && (
          <button
            type="button"
            onClick={() => setRosterTeam('rival')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              rosterTeam === 'rival'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            <span 
              className="w-2.5 h-2.5 rounded-full border border-white/50" 
              style={{ backgroundColor: opponent.primaryColor }}
            />
            <span className="truncate">{opponent.shortName} Lineup (11)</span>
          </button>
        )}
      </div>

      {/* Roster Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs overflow-hidden p-0.5 ${
            rosterTeam === 'hgufc' ? 'bg-white border border-orange-400' : 'bg-slate-800'
          }`}
          style={rosterTeam === 'rival' && opponent?.primaryColor ? { backgroundColor: opponent.primaryColor } : {}}
          >
            {rosterTeam === 'hgufc' ? (
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original" 
                alt="HGUFC Crest" 
                className="w-6 h-6 object-contain" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/hougang-united-logo.svg'; }}
              />
            ) : opponent?.logoUrl ? (
              <img 
                src={opponent.logoUrl} 
                alt={opponent.name} 
                className="w-6 h-6 object-cover rounded-full" 
              />
            ) : (
              <Shield className="w-4 h-4" />
            )}
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
              <span>{rosterTeam === 'hgufc' ? 'Hougang United FC Roster' : `${opponent?.name} Lineup`}</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold">
              {rosterTeam === 'hgufc' ? (
                <>Pitch Starters: <span className="font-bold text-orange-600">{onPitchCount}/11</span> • Bench: {players.length - onPitchCount}</>
              ) : (
                <>Editable Starting XI • {opponent?.shortName} Squad</>
              )}
            </p>
          </div>
        </div>

        {rosterTeam === 'hgufc' ? (
          <button
            type="button"
            onClick={onOpenAddPlayerModal}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Player
          </button>
        ) : (
          onOpenRivalCustomizer && (
            <button
              type="button"
              onClick={onOpenRivalCustomizer}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-colors"
              title="Change Kit Color & Crest"
            >
              <Palette className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Customize Team
            </button>
          )
        )}
      </div>

      {/* Position Filter Tabs (When in HGUFC mode) */}
      {rosterTeam === 'hgufc' && (
        <div className="px-3 pt-2.5 pb-2 border-b border-slate-200 bg-white">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors whitespace-nowrap ${
                activeTab === 'ALL' 
                  ? 'bg-slate-900 text-white shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({players.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('GK')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'GK' 
                  ? 'bg-amber-500 text-slate-950 shadow-2xs font-extrabold' 
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <span>GK ({gkCount})</span>
              <span className="text-[9px] bg-amber-900 text-amber-100 px-1 rounded-full">Spec</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DEF')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors whitespace-nowrap ${
                activeTab === 'DEF' 
                  ? 'bg-orange-600 text-white shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              DEF ({defCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MID')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors whitespace-nowrap ${
                activeTab === 'MID' 
                  ? 'bg-orange-600 text-white shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              MID ({midCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FWD')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors whitespace-nowrap ${
                activeTab === 'FWD' 
                  ? 'bg-orange-600 text-white shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              FWD ({fwdCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by player name or squad #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 text-slate-900"
            />
          </div>
        </div>
      )}

      {/* Search Bar (When in Rival mode) */}
      {rosterTeam === 'rival' && (
        <div className="px-3 py-2 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${opponent?.shortName || 'rival'} players...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 text-slate-900"
            />
          </div>
        </div>
      )}

      {/* Roster List Body */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 max-h-[760px] 2xl:max-h-[860px]">
        {rosterTeam === 'hgufc' ? (
          /* HGUFC PLAYERS LIST */
          filteredPlayers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No players found matching your criteria.
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isGK = player.position === 'GK';
              const isOnPitch = player.pitchX !== undefined && player.pitchY !== undefined;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                    isOnPitch
                      ? 'border-orange-300 bg-orange-50/70 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div 
                    className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0"
                    onClick={() => onSelectPlayerForDetail(player)}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex flex-col items-center justify-center font-black flex-shrink-0 shadow-xs border-2 border-white ${
                        isGK
                          ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 ring-1 ring-amber-400'
                          : 'bg-gradient-to-b from-orange-500 to-orange-600 text-white ring-1 ring-orange-400'
                      }`}
                    >
                      <span className="text-[11px] leading-none">{player.number}</span>
                      <span className="text-[6.5px] uppercase font-bold leading-none opacity-90">
                        {isGK ? 'GK' : player.position}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {player.name}
                        </h4>
                        {isGK && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded">
                            GK
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate flex items-center gap-1.5">
                        <span>{player.roleLabel || player.position}</span>
                        {player.preferredFoot && (
                          <>
                            <span>•</span>
                            <span>Foot: {player.preferredFoot}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 ml-2">
                    {isOnPitch ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-orange-600" />
                          Pitch
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveFromPitch(player.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors text-xs"
                          title="Bench this player"
                        >
                          Bench
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPlaceOnPitch(player)}
                        className="px-2.5 py-1 text-xs font-bold text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-600 border border-orange-200 hover:border-orange-600 rounded-md transition-colors"
                        title="Place player on pitch"
                      >
                        Place
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* RIVAL EDITABLE PLAYERS LIST (Requirement 1: Edit Name & Dorsal) */
          filteredRivalPlayers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No rival players found.
            </div>
          ) : (
            filteredRivalPlayers.map((rivalP, idx) => {
              return (
                <div
                  key={rivalP.id || idx}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      Rival Slot #{idx + 1} • {rivalP.role}
                    </span>
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black"
                      style={{ backgroundColor: opponent?.primaryColor || '#1e293b' }}
                    >
                      {rivalP.number}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Editable Number (Dorsal) */}
                    <div className="w-14">
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Dorsal</label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={rivalP.number}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          onUpdateRivalPlayer?.(idx, { number: val });
                        }}
                        className="w-full text-xs font-black text-center py-1 px-1 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500"
                      />
                    </div>

                    {/* Editable Name */}
                    <div className="flex-1">
                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Player Name</label>
                      <input
                        type="text"
                        value={rivalP.name}
                        onChange={(e) => {
                          onUpdateRivalPlayer?.(idx, { name: e.target.value });
                        }}
                        className="w-full text-xs font-bold py-1 px-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 text-slate-900"
                        placeholder="Player Name"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* Roster Tip */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-start space-x-2">
        <Info className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
        <span>
          {rosterTeam === 'hgufc' ? (
            <>Click <strong>Place</strong> to deploy on pitch. Drag tokens on the pitch board to customize shape.</>
          ) : (
            <>Edit rival names and numbers independently. Click any token on the tactical pitch to select and micro-adjust.</>
          )}
        </span>
      </div>
    </div>
  );
};
