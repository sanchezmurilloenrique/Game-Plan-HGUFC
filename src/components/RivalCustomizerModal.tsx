import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Palette, 
  Image as ImageIcon, 
  Users, 
  Shield, 
  Check, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { OpponentTeam, OpponentPlayer, PlayerPosition } from '../types';

interface RivalCustomizerModalProps {
  isOpen: boolean;
  opponent: OpponentTeam;
  onClose: () => void;
  onSaveOpponent: (updated: OpponentTeam) => void;
}

export const RivalCustomizerModal: React.FC<RivalCustomizerModalProps> = ({
  isOpen,
  opponent,
  onClose,
  onSaveOpponent,
}) => {
  const [name, setName] = useState(opponent.name);
  const [shortName, setShortName] = useState(opponent.shortName);
  const [primaryColor, setPrimaryColor] = useState(opponent.primaryColor);
  const [logoUrl, setLogoUrl] = useState(opponent.logoUrl || '');
  const [players, setPlayers] = useState<OpponentPlayer[]>(opponent.players || []);
  const [logoPreviewError, setLogoPreviewError] = useState(false);

  useEffect(() => {
    if (opponent) {
      setName(opponent.name);
      setShortName(opponent.shortName);
      setPrimaryColor(opponent.primaryColor);
      setLogoUrl(opponent.logoUrl || '');
      setPlayers(opponent.players ? [...opponent.players] : []);
      setLogoPreviewError(false);
    }
  }, [opponent, isOpen]);

  if (!isOpen) return null;

  const handlePlayerChange = (index: number, field: keyof OpponentPlayer, value: any) => {
    setPlayers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: OpponentTeam = {
      ...opponent,
      name: name.trim() || opponent.name,
      shortName: shortName.trim() || opponent.shortName,
      primaryColor,
      logoUrl: logoUrl.trim() || undefined,
      players,
    };
    onSaveOpponent(updated);
    onClose();
  };

  // Sample quick color palettes
  const presetColors = [
    '#002B49', '#EAB308', '#15803D', '#DC2626', '#2563EB', '#7C2D12', 
    '#0F172A', '#9333EA', '#059669', '#D97706', '#E11D48', '#475569'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-md text-white font-black overflow-hidden bg-slate-800"
              style={{ backgroundColor: primaryColor }}
            >
              {logoUrl && !logoPreviewError ? (
                <img 
                  src={logoUrl} 
                  alt={name} 
                  className="w-full h-full object-cover"
                  onError={() => setLogoPreviewError(true)}
                />
              ) : (
                <Shield className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase">
                Customize Rival Team: {name}
              </h3>
              <p className="text-xs text-slate-500">
                Personalize club kit colors, crest logo, and player rosters
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Team Identity & Crest */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-orange-600" />
              <span>1. Team Identity & Crest Logo</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-orange-500 font-bold text-slate-900"
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
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-orange-500 font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Crest Logo URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Team Crest / Badge URL (Image Web Address)
              </label>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                  {logoUrl && !logoPreviewError ? (
                    <img 
                      src={logoUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={() => setLogoPreviewError(true)}
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    setLogoPreviewError(false);
                  }}
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Paste any valid PNG/SVG/JPG image URL to replace the rival club badge.
              </p>
            </div>
          </div>

          {/* Section 2: Color Picker (Kit & Tokens) */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-orange-600" />
              <span>2. Primary Kit & Token Color</span>
            </h4>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 p-1 border border-slate-300 rounded-lg cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-24 text-xs font-mono font-bold px-2 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden uppercase"
                />
              </div>

              {/* Quick Preset Swatches */}
              <div className="flex items-center space-x-1.5 flex-wrap">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setPrimaryColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      primaryColor === color ? 'border-orange-500 scale-120 shadow-md ring-2 ring-orange-300' : 'border-white hover:scale-110 shadow-xs'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Rival Player Roster (Edit Names & Numbers) */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-600" />
                <span>3. Rival Starting Lineup & Dorsals ({players.length} Players)</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-bold">
                Edit squad numbers and names independently
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {players.map((p, idx) => (
                <div 
                  key={p.id || idx}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">
                    #{idx + 1}
                  </span>

                  {/* Dorsal / Squad Number */}
                  <div className="w-16">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={p.number}
                      onChange={(e) => handlePlayerChange(idx, 'number', parseInt(e.target.value) || 1)}
                      className="w-full text-xs font-black text-center px-2 py-1.5 border border-slate-300 rounded-md focus:outline-hidden focus:border-orange-500 bg-slate-50"
                      title="Squad Number (Dorsal)"
                    />
                  </div>

                  {/* Player Name */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handlePlayerChange(idx, 'name', e.target.value)}
                      placeholder="Player Name"
                      className="w-full text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-md focus:outline-hidden focus:border-orange-500 text-slate-900"
                    />
                  </div>

                  {/* Role / Position */}
                  <div className="w-20">
                    <input
                      type="text"
                      value={p.role}
                      onChange={(e) => handlePlayerChange(idx, 'role', e.target.value)}
                      className="w-full text-xs font-bold text-center px-2 py-1.5 border border-slate-200 rounded-md bg-slate-50 text-slate-600 uppercase"
                      title="Tactical Role (e.g. GK, CB, DM, ST)"
                    />
                  </div>

                  {/* Mini Token Preview */}
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black border border-white shadow-xs flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {p.number}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Rival Customization
          </button>
        </div>

      </div>
    </div>
  );
};
