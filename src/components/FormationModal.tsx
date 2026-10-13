import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, Check, Shield } from 'lucide-react';
import { Formation, FormationPosition } from '../types';

interface FormationModalProps {
  isOpen: boolean;
  formations: Formation[];
  onClose: () => void;
  onAddFormation: (formation: Formation) => void;
  onDeleteFormation: (formationId: string) => void;
}

export const FormationModal: React.FC<FormationModalProps> = ({
  isOpen,
  formations,
  onClose,
  onAddFormation,
  onDeleteFormation,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'4-at-back' | '3-at-back' | '5-at-back' | 'custom'>('custom');
  const [tacticalDescription, setTacticalDescription] = useState('');
  const [baseFormationId, setBaseFormationId] = useState(formations[0]?.id || '');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const templateFormation = formations.find(f => f.id === baseFormationId) || formations[0];
    const clonedPositions: FormationPosition[] = JSON.parse(JSON.stringify(templateFormation.positions));

    const newFormation: Formation = {
      id: `form-custom-${Date.now()}`,
      name: name.trim(),
      category,
      tacticalDescription: tacticalDescription.trim() || 'Custom tactical blueprint developed for Hougang United FC match model.',
      positions: clonedPositions,
    };

    onAddFormation(newFormation);
    setName('');
    setTacticalDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Formation Master Manager
              </h3>
              <p className="text-xs text-slate-500">
                Manage tactical shapes, positional templates, and custom setups
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
          
          {/* Create New Custom Formation */}
          <form onSubmit={handleCreate} className="p-4 bg-orange-50/60 rounded-xl border border-orange-200 space-y-3">
            <h4 className="text-xs font-black uppercase text-orange-950 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-orange-600" />
              <span>Create New Tactical Formation</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Formation Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 4-1-4-1 Asymmetrical"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Base Template Blueprint
                </label>
                <select
                  value={baseFormationId}
                  onChange={(e) => setBaseFormationId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:border-orange-500 focus:outline-hidden"
                >
                  {formations.map(f => (
                    <option key={f.id} value={f.id}>Copy shape from: {f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tactical Description & In-Possession Dynamics
              </label>
              <textarea
                rows={2}
                value={tacticalDescription}
                onChange={(e) => setTacticalDescription(e.target.value)}
                placeholder="e.g. Asymmetrical overload on the left flank with inverted right fullback stepping into midfield double-pivot..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:border-orange-500 focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Custom Formation
              </button>
            </div>
          </form>

          {/* Formations Registry */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-900 mb-2 flex items-center justify-between">
              <span>Current Formations ({formations.length})</span>
            </h4>

            <div className="space-y-2">
              {formations.map((f) => {
                const isCustom = f.id.startsWith('form-custom-');

                return (
                  <div
                    key={f.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-slate-900">{f.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded">
                          {f.category}
                        </span>
                        {isCustom && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-orange-100 text-orange-800 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                      {f.tacticalDescription && (
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {f.tacticalDescription}
                        </p>
                      )}
                    </div>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteFormation(f.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete custom formation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
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
