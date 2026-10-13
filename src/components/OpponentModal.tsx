import React, { useState } from 'react';
import { X, Plus, Trash2, Shield, Edit3, Save } from 'lucide-react';
import { OpponentTeam } from '../types';

interface OpponentModalProps {
  isOpen: boolean;
  opponents: OpponentTeam[];
  onClose: () => void;
  onAddOpponent: (opponent: OpponentTeam) => void;
  onUpdateOpponent: (opponent: OpponentTeam) => void;
  onDeleteOpponent: (opponentId: string) => void;
}

export const OpponentModal: React.FC<OpponentModalProps> = ({
  isOpen,
  opponents,
  onClose,
  onAddOpponent,
  onUpdateOpponent,
  onDeleteOpponent,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [stadium, setStadium] = useState('Jalan Besar Stadium');
  const [tacticalStyle, setTacticalStyle] = useState('');
  const [keyPlayers, setKeyPlayers] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedKeyPlayers = keyPlayers
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    if (editingId) {
      const existing = opponents.find(o => o.id === editingId);
      if (existing) {
        onUpdateOpponent({
          ...existing,
          name: name.trim(),
          shortName: shortName.trim() || name.trim().slice(0, 10),
          primaryColor,
          logoUrl: logoUrl.trim() || undefined,
          stadium: stadium.trim(),
          tacticalStyle: tacticalStyle.trim(),
          keyPlayers: parsedKeyPlayers.length > 0 ? parsedKeyPlayers : existing.keyPlayers,
        });
      }
      setEditingId(null);
    } else {
      const newOpponent: OpponentTeam = {
        id: `opp-custom-${Date.now()}`,
        name: name.trim(),
        shortName: shortName.trim() || name.trim().slice(0, 10),
        primaryColor,
        secondaryColor: '#FFFFFF',
        logoUrl: logoUrl.trim() || undefined,
        stadium: stadium.trim() || 'Jalan Besar Stadium',
        defaultFormation: 'form-4231',
        tacticalStyle: tacticalStyle.trim() || 'Balanced tactical approach with direct counter-pressing tendencies.',
        strengths: ['Competitive physical duels in central midfield'],
        weaknesses: ['Vulnerable when pressured high in first phase build-up'],
        keyPlayers: parsedKeyPlayers.length > 0 ? parsedKeyPlayers : ['Star Forward', 'Key Playmaker'],
      };
      onAddOpponent(newOpponent);
    }

    // Reset form
    setName('');
    setShortName('');
    setTacticalStyle('');
    setKeyPlayers('');
    setLogoUrl('');
  };

  const startEdit = (opp: OpponentTeam) => {
    setEditingId(opp.id);
    setName(opp.name);
    setShortName(opp.shortName);
    setPrimaryColor(opp.primaryColor);
    setLogoUrl(opp.logoUrl || '');
    setStadium(opp.stadium);
    setTacticalStyle(opp.tacticalStyle);
    setKeyPlayers(opp.keyPlayers.join(', '));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Singapore Premier League Opponents Directory
              </h3>
              <p className="text-xs text-slate-500">
                Manage SPL rival club profiles, colorways, tactical styles, and key personnel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Add / Edit Form */}
          <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-900 flex items-center justify-between">
              <span>{editingId ? 'Edit Opponent Club' : 'Register New SPL / International Opponent'}</span>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setShortName('');
                    setTacticalStyle('');
                    setKeyPlayers('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Cancel Edit
                </button>
              )}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Club Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Albirex Niigata (S) or DPMM FC"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Tag / Mascot
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. White Swans"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Club Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-8 p-0.5 border border-slate-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Home Stadium
                </label>
                <input
                  type="text"
                  value={stadium}
                  onChange={(e) => setStadium(e.target.value)}
                  placeholder="e.g. Jurong East Stadium"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Club Crest / Badge Logo Image URL
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tactical Style & Game Model
              </label>
              <textarea
                rows={2}
                value={tacticalStyle}
                onChange={(e) => setTacticalStyle(e.target.value)}
                placeholder="e.g. Possession-based positional play with rapid counter-press upon ball loss..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:border-orange-500 focus:outline-hidden resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Key Danger Men (Comma separated)
              </label>
              <input
                type="text"
                value={keyPlayers}
                onChange={(e) => setKeyPlayers(e.target.value)}
                placeholder="e.g. Player A, Player B, Player C"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md shadow-xs transition-colors"
              >
                {editingId ? (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Save Opponent Changes
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Opponent Club
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Opponents List */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900 mb-2">
              Registered Teams ({opponents.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {opponents.map((opp) => (
                <div
                  key={opp.id}
                  className="p-3 bg-white border border-slate-200 rounded-lg flex items-start justify-between gap-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start space-x-2.5">
                    <span
                      className="w-4 h-4 rounded-full mt-0.5 border border-black/20 flex-shrink-0"
                      style={{ backgroundColor: opp.primaryColor }}
                    />
                    <div>
                      <h5 className="text-xs font-black text-slate-900 leading-tight">
                        {opp.name} ({opp.shortName})
                      </h5>
                      <p className="text-[10px] text-slate-500">{opp.stadium}</p>
                      <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">
                        {opp.tacticalStyle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(opp)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Edit opponent details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {opponents.length > 2 && (
                      <button
                        type="button"
                        onClick={() => onDeleteOpponent(opp.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete opponent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
