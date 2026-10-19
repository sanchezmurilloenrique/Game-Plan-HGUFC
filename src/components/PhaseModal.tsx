import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, Compass, Sparkles, Layers, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { TacticalPhaseAnalysis } from '../types';

interface PhaseModalProps {
  isOpen: boolean;
  phaseToEdit: TacticalPhaseAnalysis | null;
  nextPhaseNumber: number;
  onClose: () => void;
  onSavePhase: (phase: TacticalPhaseAnalysis) => void;
  onDeletePhase?: (phaseKey: string) => void;
}

export const PhaseModal: React.FC<PhaseModalProps> = ({
  isOpen,
  phaseToEdit,
  nextPhaseNumber,
  onClose,
  onSavePhase,
  onDeletePhase,
}) => {
  const [phaseName, setPhaseName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [directTacticalRecommendation, setDirectTacticalRecommendation] = useState('');

  // Gemini Perspective
  const [channelOccupation, setChannelOccupation] = useState('');
  const [lineHeightsAndCompactness, setLineHeightsAndCompactness] = useState('');
  const [superiorities, setSuperiorities] = useState('');

  // ChatGPT Perspective
  const [playerProfiles, setPlayerProfiles] = useState('');
  const [requiredBehaviors, setRequiredBehaviors] = useState('');

  // Claude Perspective
  const [strength, setStrength] = useState('');
  const [weakness, setWeakness] = useState('');
  const [opportunity, setOpportunity] = useState('');
  const [threat, setThreat] = useState('');

  const [activeTab, setActiveTab] = useState<'general' | 'gemini' | 'chatgpt' | 'claude'>('general');

  useEffect(() => {
    if (phaseToEdit) {
      setPhaseName(phaseToEdit.phaseName || '');
      setSubtitle(phaseToEdit.subtitle || '');
      setDirectTacticalRecommendation(phaseToEdit.directTacticalRecommendation || '');

      setChannelOccupation(phaseToEdit.geminiPerspective?.channelOccupation || '');
      setLineHeightsAndCompactness(phaseToEdit.geminiPerspective?.lineHeightsAndCompactness || '');
      setSuperiorities(phaseToEdit.geminiPerspective?.superiorities || '');

      setPlayerProfiles(phaseToEdit.chatGptPerspective?.playerProfiles || '');
      setRequiredBehaviors(phaseToEdit.chatGptPerspective?.requiredBehaviors || '');

      setStrength(phaseToEdit.claudePerspective?.strength || '');
      setWeakness(phaseToEdit.claudePerspective?.weakness || '');
      setOpportunity(phaseToEdit.claudePerspective?.opportunity || '');
      setThreat(phaseToEdit.claudePerspective?.threat || '');
    } else {
      setPhaseName(`${nextPhaseNumber}. Custom Tactical Phase`);
      setSubtitle('Custom tactical setup and phase execution');
      setDirectTacticalRecommendation('Execute coordinated tactical movements according to the game model directives.');

      setChannelOccupation('Maintain spatial saturation across all 5 tactical channels with balanced rest-defense.');
      setLineHeightsAndCompactness('Compact unit spacing maintained at 25-30 meters between forward line and defensive line.');
      setSuperiorities('Numerical and positional superiority established around the active ball carrier.');

      setPlayerProfiles('Players maintain open-body orientation and optimal footedness angles for rapid circulation.');
      setRequiredBehaviors('Immediate aggressive support angles and decisive decision-making upon phase trigger.');

      setStrength('High technical composure and structured spatial occupation.');
      setWeakness('Potential transition space exposed if rest-defense fails to track runners.');
      setOpportunity('Fast vertical release behind the rival backline.');
      setThreat('Rival direct counter-punches into vacant lateral channels.');
    }
    setActiveTab('general');
  }, [phaseToEdit, isOpen, nextPhaseNumber]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseName.trim()) return;

    const phaseKey = phaseToEdit ? phaseToEdit.phaseKey : `phase-${Date.now()}`;
    const phaseNumber = phaseToEdit ? phaseToEdit.phaseNumber : nextPhaseNumber;

    const savedPhase: TacticalPhaseAnalysis = {
      phaseKey,
      phaseNumber,
      phaseName: phaseName.trim(),
      subtitle: subtitle.trim(),
      directTacticalRecommendation: directTacticalRecommendation.trim(),
      geminiPerspective: {
        channelOccupation: channelOccupation.trim(),
        lineHeightsAndCompactness: lineHeightsAndCompactness.trim(),
        superiorities: superiorities.trim(),
      },
      chatGptPerspective: {
        playerProfiles: playerProfiles.trim(),
        requiredBehaviors: requiredBehaviors.trim(),
      },
      claudePerspective: {
        strength: strength.trim(),
        weakness: weakness.trim(),
        opportunity: opportunity.trim(),
        threat: threat.trim(),
      },
    };

    onSavePhase(savedPhase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide">
                {phaseToEdit ? `Edit Phase: ${phaseToEdit.phaseName}` : `Add New Tactical Phase (#${nextPhaseNumber})`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Customize title, recommendation, and triple-synthetic tactical intelligence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Perspective Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>General & Directives</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'gemini'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Gemini (Geometry)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chatgpt')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'chatgpt'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>ChatGPT (Profiles)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('claude')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'claude'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            <span>Claude (SWOT)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block font-black text-slate-700 uppercase text-[11px] mb-1">
                  Phase Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={phaseName}
                  onChange={(e) => setPhaseName(e.target.value)}
                  placeholder="e.g. 1. Goal-kick or Attacking Throw-Ins"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-hidden focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase text-[11px] mb-1">
                  Phase Subtitle / Purpose
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Restart and build-up structure from defensive third"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase text-[11px] mb-1">
                  Direct Tactical Recommendation (Coach Instruction) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={directTacticalRecommendation}
                  onChange={(e) => setDirectTacticalRecommendation(e.target.value)}
                  placeholder="Key tactical instruction given to the squad during match preparation..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 leading-relaxed focus:outline-hidden focus:border-orange-500 focus:bg-white font-medium"
                />
              </div>
            </div>
          )}

          {/* TAB 2: GEMINI PERSPECTIVE */}
          {activeTab === 'gemini' && (
            <div className="space-y-4 animate-in fade-in duration-150 bg-blue-50/30 p-3.5 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="font-black text-blue-950 uppercase text-[11px]">Gemini Perspective: Geometry, Space & Structure</span>
              </div>

              <div>
                <label className="block font-bold text-blue-900 text-[11px] mb-1 uppercase">
                  Channel Occupation & Line Heights
                </label>
                <textarea
                  rows={3}
                  value={channelOccupation}
                  onChange={(e) => setChannelOccupation(e.target.value)}
                  placeholder="Spatial channel positioning (flanks, half-spaces, central corridor)..."
                  className="w-full bg-white border border-blue-200 rounded-lg p-2.5 text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-blue-900 text-[11px] mb-1 uppercase">
                  Line Compactness & Depth
                </label>
                <textarea
                  rows={2}
                  value={lineHeightsAndCompactness}
                  onChange={(e) => setLineHeightsAndCompactness(e.target.value)}
                  placeholder="Distances between defensive, midfield, and forward lines..."
                  className="w-full bg-white border border-blue-200 rounded-lg p-2.5 text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-blue-900 text-[11px] mb-1 uppercase">
                  Superiority Dynamics (Numerical, Positional, Qualitative)
                </label>
                <textarea
                  rows={2}
                  value={superiorities}
                  onChange={(e) => setSuperiorities(e.target.value)}
                  placeholder="Overloads, 3v2 or 2v1 advantages created..."
                  className="w-full bg-white border border-blue-200 rounded-lg p-2.5 text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: CHATGPT PERSPECTIVE */}
          {activeTab === 'chatgpt' && (
            <div className="space-y-4 animate-in fade-in duration-150 bg-emerald-50/30 p-3.5 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 border-b border-emerald-200 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="font-black text-emerald-950 uppercase text-[11px]">ChatGPT Perspective: Profiles, Footedness & Individual Behaviors</span>
              </div>

              <div>
                <label className="block font-bold text-emerald-900 text-[11px] mb-1 uppercase">
                  Player Profiling & Footedness Traits
                </label>
                <textarea
                  rows={3}
                  value={playerProfiles}
                  onChange={(e) => setPlayerProfiles(e.target.value)}
                  placeholder="Footedness traits, body orientation, technical profiles of individual players in this phase..."
                  className="w-full bg-white border border-emerald-200 rounded-lg p-2.5 text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-emerald-900 text-[11px] mb-1 uppercase">
                  Required Tactical Behaviors
                </label>
                <textarea
                  rows={3}
                  value={requiredBehaviors}
                  onChange={(e) => setRequiredBehaviors(e.target.value)}
                  placeholder="Specific individual movements (dummy runs, check-in, underlaps, body feints)..."
                  className="w-full bg-white border border-emerald-200 rounded-lg p-2.5 text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: CLAUDE PERSPECTIVE */}
          {activeTab === 'claude' && (
            <div className="space-y-3 animate-in fade-in duration-150 bg-amber-50/30 p-3.5 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <span className="font-black text-amber-950 uppercase text-[11px]">Claude Perspective: Operational SWOT Analysis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-orange-900 text-[10px] mb-1 uppercase">
                    Own Strength
                  </label>
                  <textarea
                    rows={2}
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    placeholder="Key advantage in this phase..."
                    className="w-full bg-white border border-amber-200 rounded-lg p-2 text-slate-900 focus:outline-hidden focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-rose-900 text-[10px] mb-1 uppercase">
                    Own Weakness
                  </label>
                  <textarea
                    rows={2}
                    value={weakness}
                    onChange={(e) => setWeakness(e.target.value)}
                    placeholder="Risk or vulnerability..."
                    className="w-full bg-white border border-amber-200 rounded-lg p-2 text-slate-900 focus:outline-hidden focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-900 text-[10px] mb-1 uppercase">
                    Rival Opportunity (Exploit)
                  </label>
                  <textarea
                    rows={2}
                    value={opportunity}
                    onChange={(e) => setOpportunity(e.target.value)}
                    placeholder="Rival flaw to exploit..."
                    className="w-full bg-white border border-amber-200 rounded-lg p-2 text-slate-900 focus:outline-hidden focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-red-900 text-[10px] mb-1 uppercase">
                    Rival Threat (Neutralize)
                  </label>
                  <textarea
                    rows={2}
                    value={threat}
                    onChange={(e) => setThreat(e.target.value)}
                    placeholder="Danger posed by rival..."
                    className="w-full bg-white border border-amber-200 rounded-lg p-2 text-slate-900 focus:outline-hidden focus:border-amber-500 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-2">
            <div>
              {phaseToEdit && onDeletePhase && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${phaseToEdit.phaseName}" from the report?`)) {
                      onDeletePhase(phaseToEdit.phaseKey);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Phase</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:from-orange-700 active:to-amber-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{phaseToEdit ? 'Save Changes' : 'Add Phase'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
