import React, { useState } from 'react';
import { 
  ClipboardList, 
  Compass, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  Flag, 
  Check, 
  FileText,
  Sliders,
  Sparkles
} from 'lucide-react';
import { TacticalNotes } from '../types';

interface TacticalInstructionsProps {
  notes: TacticalNotes;
  onUpdateNotes: (updated: Partial<TacticalNotes>) => void;
  onLoadPreset: (presetName: string) => void;
}

export const TacticalInstructions: React.FC<TacticalInstructionsProps> = ({
  notes,
  onUpdateNotes,
  onLoadPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'possession' | 'transition' | 'defending' | 'setpieces'>('all');

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Tactical Instructions & Game Model Directives
            </h3>
            <p className="text-xs text-slate-500">
              Technical guidance across all game phases in professional coaching terminology
            </p>
          </div>
        </div>

        {/* Tactical Philosophy Presets */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-500 font-medium hidden md:inline">Presets:</span>
          <button
            type="button"
            onClick={() => onLoadPreset('possession')}
            className="px-2.5 py-1 font-semibold text-slate-700 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-md transition-colors"
            title="Load Dominant Positional Play & Half-Space Overloads"
          >
            Positional Play
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset('gegenpress')}
            className="px-2.5 py-1 font-semibold text-slate-700 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-md transition-colors"
            title="Load High Block & Aggressive Gegenpress"
          >
            Gegenpress
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset('counter')}
            className="px-2.5 py-1 font-semibold text-slate-700 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-md transition-colors"
            title="Load Resilient Low Block & Direct Counter-Attack"
          >
            Low Block Counter
          </button>
        </div>
      </div>

      {/* Grid of Tactical Phases */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Build-up Phase */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-orange-600" />
              <span>1. Build-Up Phase</span>
            </label>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Phase 1 & 2
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mb-2">
            Circulation from goalkeeper & backline against opponent first pressing line.
          </p>
          <textarea
            rows={4}
            value={notes.buildUpPhase}
            onChange={(e) => onUpdateNotes({ buildUpPhase: e.target.value })}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md p-2 focus:border-orange-500 focus:outline-hidden resize-y leading-relaxed"
          />
        </div>

        {/* 2. In-Possession Structure */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-600" />
              <span>2. In-Possession Structure</span>
            </label>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Attacking Third
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mb-2">
            Positional shape, half-space occupations, width, and penalty box arrivals.
          </p>
          <textarea
            rows={4}
            value={notes.inPossessionStructure}
            onChange={(e) => onUpdateNotes({ inPossessionStructure: e.target.value })}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md p-2 focus:border-orange-500 focus:outline-hidden resize-y leading-relaxed"
          />
        </div>

        {/* 3. Out-of-Possession Transition */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
              <span>3. Defensive Transition</span>
            </label>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Immediate 5s Rule
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mb-2">
            Reaction upon losing possession: aggressive Gegenpress vs immediate recovery sprint.
          </p>
          <textarea
            rows={4}
            value={notes.outOfPossessionTransition}
            onChange={(e) => onUpdateNotes({ outOfPossessionTransition: e.target.value })}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md p-2 focus:border-orange-500 focus:outline-hidden resize-y leading-relaxed"
          />
        </div>

        {/* 4. Pressing Triggers */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>4. Pressing Triggers</span>
            </label>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              High / Mid Block
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mb-2">
            Cues to trigger collective hunting: backward pass, closed body shape, bad touch.
          </p>
          <textarea
            rows={4}
            value={notes.pressingTriggers}
            onChange={(e) => onUpdateNotes({ pressingTriggers: e.target.value })}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md p-2 focus:border-orange-500 focus:outline-hidden resize-y leading-relaxed"
          />
        </div>

        {/* 5. Rest Defense */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>5. Rest Defense (Rule of 5)</span>
            </label>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Central Lockdown
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mb-2">
            Structure of remaining defenders & holding midfielders behind active ball progression.
          </p>
          <textarea
            rows={4}
            value={notes.restDefense}
            onChange={(e) => onUpdateNotes({ restDefense: e.target.value })}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md p-2 focus:border-orange-500 focus:outline-hidden resize-y leading-relaxed"
          />
        </div>

        {/* 6. Set Pieces */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-orange-600" />
              <span>6. Set Pieces & Dead Balls</span>
            </label>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Corners & Free Kicks
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mb-2">
            Offensive near-post flick-on routines, defensive hybrid marking, second ball fall zones.
          </p>
          <textarea
            rows={4}
            value={notes.setPieces}
            onChange={(e) => onUpdateNotes({ setPieces: e.target.value })}
            className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md p-2 focus:border-orange-500 focus:outline-hidden resize-y leading-relaxed"
          />
        </div>

      </div>

    </div>
  );
};
