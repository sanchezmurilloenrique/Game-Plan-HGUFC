import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, UserCheck, Shield, Sparkles } from 'lucide-react';
import { Player, PlayerPosition } from '../types';

interface PlayerModalProps {
  isOpen: boolean;
  playerToEdit: Player | null;
  onClose: () => void;
  onSavePlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  isOpen,
  playerToEdit,
  onClose,
  onSavePlayer,
  onDeletePlayer,
}) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState<number>(10);
  const [position, setPosition] = useState<PlayerPosition>('MID');
  const [roleLabel, setRoleLabel] = useState('');
  const [preferredFoot, setPreferredFoot] = useState<'Left' | 'Right' | 'Both'>('Right');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (playerToEdit) {
      setName(playerToEdit.name);
      setNumber(playerToEdit.number);
      setPosition(playerToEdit.position);
      setRoleLabel(playerToEdit.roleLabel || '');
      setPreferredFoot(playerToEdit.preferredFoot || 'Right');
      setNotes(playerToEdit.notes || '');
    } else {
      setName('');
      setNumber(23);
      setPosition('MID');
      setRoleLabel('Central Midfielder');
      setPreferredFoot('Right');
      setNotes('');
    }
  }, [playerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Player = {
      id: playerToEdit ? playerToEdit.id : `p-${Date.now()}`,
      name: name.trim(),
      number: Number(number),
      position,
      roleLabel: roleLabel.trim() || undefined,
      preferredFoot,
      notes: notes.trim() || undefined,
      pitchX: playerToEdit?.pitchX,
      pitchY: playerToEdit?.pitchY,
    };

    onSavePlayer(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              position === 'GK' ? 'bg-amber-400 text-slate-950' : 'bg-orange-600 text-white'
            }`}>
              {number}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                {playerToEdit ? `Edit Player: ${playerToEdit.name}` : 'Add Squad Player'}
              </h3>
              <p className="text-xs text-slate-500">
                Manage Hougang United FC squad personnel profile
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Player Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shahdan Sulaiman"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            {/* Shirt Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shirt Number *
              </label>
              <input
                type="number"
                min={1}
                max={99}
                required
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:border-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Position & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Position Group *
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as PlayerPosition)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:border-orange-500 focus:outline-hidden bg-white"
              >
                <option value="GK">GK (Goalkeeper)</option>
                <option value="DEF">DEF (Defender)</option>
                <option value="MID">MID (Midfielder)</option>
                <option value="FWD">FWD (Forward)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role Label
              </label>
              <input
                type="text"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                placeholder="e.g. Deep-Lying #6, RW"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Strong Foot
              </label>
              <select
                value={preferredFoot}
                onChange={(e) => setPreferredFoot(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:border-orange-500 focus:outline-hidden bg-white"
              >
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both (Ambidextrous)</option>
              </select>
            </div>
          </div>

          {/* Player Tactical Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Coaching Notes & Key Attributes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Exceptional progressive carrier, defensive transition recovery speed, dead ball delivery specialist..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:border-orange-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {playerToEdit ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to remove ${playerToEdit.name} from the squad roster?`)) {
                    onDeletePlayer(playerToEdit.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete Player
              </button>
            ) : <div></div>}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {playerToEdit ? 'Save Changes' : 'Add Player to Squad'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
