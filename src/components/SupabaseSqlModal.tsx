import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Database, ExternalLink, Terminal, ShieldCheck, Sparkles, Layers, Key, Link as LinkIcon, Cloud, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, getSupabaseClient } from '../services/supabaseService';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- GAME PLAN HGUFC - SUPABASE DATABASE SCHEMA
-- Club: Hougang United FC (Singapore Premier League)
-- Database Engine: PostgreSQL 15+ (Fully Compatible with Supabase)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE player_position_enum AS ENUM ('GK', 'DEF', 'MID', 'FWD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE foot_type_enum AS ENUM ('Right', 'Left', 'Both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE formation_category_enum AS ENUM ('4-at-back', '3-at-back', '5-at-back', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 4. TABLES DEFINITION
-- ==============================================================================

-- TABLE: club_profile (Hougang United FC Official Club Identity & Branding)
CREATE TABLE IF NOT EXISTS public.club_profile (
    id TEXT PRIMARY KEY DEFAULT 'club-hgufc',
    name VARCHAR(120) NOT NULL DEFAULT 'Hougang United Football Club',
    short_name VARCHAR(50) NOT NULL DEFAULT 'Hougang United FC',
    logo_url TEXT NOT NULL DEFAULT 'https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original',
    primary_color VARCHAR(20) NOT NULL DEFAULT '#EA580C',
    secondary_color VARCHAR(20) DEFAULT '#FFFFFF',
    stadium VARCHAR(120) DEFAULT 'Jalan Besar Stadium',
    league VARCHAR(100) DEFAULT 'Singapore Premier League (SPL)',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: players (HGUFC Squad Roster - 30 Players)
CREATE TABLE IF NOT EXISTS public.players (
    id TEXT PRIMARY KEY DEFAULT 'p-' || gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    number INTEGER NOT NULL CHECK (number >= 1 AND number <= 99),
    position player_position_enum NOT NULL,
    role_label VARCHAR(50),
    preferred_foot foot_type_enum DEFAULT 'Right',
    notes TEXT,
    pitch_x NUMERIC(5,2) CHECK (pitch_x >= 0 AND pitch_x <= 100),
    pitch_y NUMERIC(5,2) CHECK (pitch_y >= 0 AND pitch_y <= 100),
    is_starting BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: formations (Tactical Formations & Coordinate Blueprints)
CREATE TABLE IF NOT EXISTS public.formations (
    id TEXT PRIMARY KEY DEFAULT 'form-' || gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    category formation_category_enum NOT NULL DEFAULT 'custom',
    tactical_description TEXT,
    positions JSONB NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: opponents (Singapore Premier League Opponents & Custom Clubs)
CREATE TABLE IF NOT EXISTS public.opponents (
    id TEXT PRIMARY KEY DEFAULT 'opp-' || gen_random_uuid()::text,
    name VARCHAR(120) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    primary_color VARCHAR(20) NOT NULL DEFAULT '#1e293b',
    secondary_color VARCHAR(20) DEFAULT '#ffffff',
    logo_url TEXT,
    stadium VARCHAR(120) DEFAULT 'Jalan Besar Stadium',
    default_formation_id TEXT REFERENCES public.formations(id) ON DELETE SET NULL,
    tactical_style TEXT,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    key_players TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: opponent_players (Rival Team Players Lineups)
CREATE TABLE IF NOT EXISTS public.opponent_players (
    id TEXT PRIMARY KEY DEFAULT 'opp-p-' || gen_random_uuid()::text,
    opponent_id TEXT NOT NULL REFERENCES public.opponents(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    number INTEGER NOT NULL CHECK (number >= 1 AND number <= 99),
    position player_position_enum NOT NULL,
    role VARCHAR(50) NOT NULL,
    pitch_x NUMERIC(5,2) CHECK (pitch_x >= 0 AND pitch_x <= 100),
    pitch_y NUMERIC(5,2) CHECK (pitch_y >= 0 AND pitch_y <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: match_plans (Executive Match Dossiers & Game Model)
CREATE TABLE IF NOT EXISTS public.match_plans (
    id TEXT PRIMARY KEY DEFAULT 'plan-' || gen_random_uuid()::text,
    title VARCHAR(200) NOT NULL DEFAULT 'Singapore Premier League Matchday',
    match_date DATE NOT NULL DEFAULT CURRENT_DATE,
    venue VARCHAR(150) DEFAULT 'Jalan Besar Stadium',
    competition VARCHAR(150) DEFAULT 'Singapore Premier League (SPL)',
    selected_opponent_id TEXT REFERENCES public.opponents(id) ON DELETE SET NULL,
    hgufc_formation_id TEXT REFERENCES public.formations(id) ON DELETE SET NULL,
    rival_formation_id TEXT REFERENCES public.formations(id) ON DELETE SET NULL,
    show_pitch_zones BOOLEAN DEFAULT true,
    show_opponent_tokens BOOLEAN DEFAULT true,
    active_pitch_tool VARCHAR(30) DEFAULT 'select',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: swot_analyses (Qualitative SWOT Matrix & Intelligence Data)
CREATE TABLE IF NOT EXISTS public.swot_analyses (
    id TEXT PRIMARY KEY DEFAULT 'swot-' || gen_random_uuid()::text,
    match_plan_id TEXT NOT NULL UNIQUE REFERENCES public.match_plans(id) ON DELETE CASCADE,
    our_strengths TEXT,
    our_weaknesses TEXT,
    rival_strengths TEXT,
    rival_weaknesses TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: tactical_instructions (Game Model Directives by Phase)
CREATE TABLE IF NOT EXISTS public.tactical_instructions (
    id TEXT PRIMARY KEY DEFAULT 'inst-' || gen_random_uuid()::text,
    match_plan_id TEXT NOT NULL UNIQUE REFERENCES public.match_plans(id) ON DELETE CASCADE,
    build_up_phase TEXT,
    in_possession_structure TEXT,
    out_of_possession_transition TEXT,
    pressing_triggers TEXT,
    rest_defense TEXT,
    set_pieces TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_players_position ON public.players(position);
CREATE INDEX IF NOT EXISTS idx_players_number ON public.players(number);
CREATE INDEX IF NOT EXISTS idx_players_starting ON public.players(is_starting);
CREATE INDEX IF NOT EXISTS idx_opponent_players_opponent ON public.opponent_players(opponent_id);
CREATE INDEX IF NOT EXISTS idx_match_plans_date ON public.match_plans(match_date);
CREATE INDEX IF NOT EXISTS idx_match_plans_opponent ON public.match_plans(selected_opponent_id);
CREATE INDEX IF NOT EXISTS idx_swot_match_plan ON public.swot_analyses(match_plan_id);
CREATE INDEX IF NOT EXISTS idx_instructions_match_plan ON public.tactical_instructions(match_plan_id);

-- ==============================================================================
-- 6. TRIGGERS FOR AUTO-UPDATING updated_at
-- ==============================================================================
DROP TRIGGER IF EXISTS trg_players_updated_at ON public.players;
CREATE TRIGGER trg_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_formations_updated_at ON public.formations;
CREATE TRIGGER trg_formations_updated_at BEFORE UPDATE ON public.formations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_opponents_updated_at ON public.opponents;
CREATE TRIGGER trg_opponents_updated_at BEFORE UPDATE ON public.opponents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_opponent_players_updated_at ON public.opponent_players;
CREATE TRIGGER trg_opponent_players_updated_at BEFORE UPDATE ON public.opponent_players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_match_plans_updated_at ON public.match_plans;
CREATE TRIGGER trg_match_plans_updated_at BEFORE UPDATE ON public.match_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_swot_updated_at ON public.swot_analyses;
CREATE TRIGGER trg_swot_updated_at BEFORE UPDATE ON public.swot_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_instructions_updated_at ON public.tactical_instructions;
CREATE TRIGGER trg_instructions_updated_at BEFORE UPDATE ON public.tactical_instructions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_club_profile_updated_at ON public.club_profile;
CREATE TRIGGER trg_club_profile_updated_at BEFORE UPDATE ON public.club_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ==============================================================================
ALTER TABLE public.club_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opponents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opponent_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swot_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tactical_instructions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access to club_profile" ON public.club_profile;
CREATE POLICY "Public full access to club_profile" ON public.club_profile FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to players" ON public.players;
CREATE POLICY "Public full access to players" ON public.players FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to formations" ON public.formations;
CREATE POLICY "Public full access to formations" ON public.formations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to opponents" ON public.opponents;
CREATE POLICY "Public full access to opponents" ON public.opponents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to opponent_players" ON public.opponent_players;
CREATE POLICY "Public full access to opponent_players" ON public.opponent_players FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to match_plans" ON public.match_plans;
CREATE POLICY "Public full access to match_plans" ON public.match_plans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to swot_analyses" ON public.swot_analyses;
CREATE POLICY "Public full access to swot_analyses" ON public.swot_analyses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to tactical_instructions" ON public.tactical_instructions;
CREATE POLICY "Public full access to tactical_instructions" ON public.tactical_instructions FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. INITIAL SEED DATA
-- ==============================================================================
-- 8.1 HOUGANG UNITED FC OFFICIAL CLUB PROFILE SEED
INSERT INTO public.club_profile (id, name, short_name, logo_url, primary_color, secondary_color, stadium, league) VALUES
('club-hgufc', 'Hougang United Football Club', 'Hougang United FC', 'https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original', '#EA580C', '#FFFFFF', 'Jalan Besar Stadium', 'Singapore Premier League (SPL)')
ON CONFLICT (id) DO UPDATE SET
    logo_url = EXCLUDED.logo_url,
    updated_at = NOW();
`;

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'guide' | 'tables' | 'connect'>('sql');

  // Supabase Credentials State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
      setSupabaseUrl(config.url);
      setSupabaseKey(config.anonKey);
    }
  }, []);

  const handleSaveCredentials = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setSaveStatus('Please enter both Supabase URL and Anon Key');
      return;
    }
    saveSupabaseConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseKey.trim(),
    });
    setSaveStatus('Credentials saved successfully! You can now use the Save button to sync.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleClearCredentials = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setSaveStatus('Credentials cleared.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([SUPABASE_SQL_SCRIPT], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game_plan_hgufc_supabase.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4.5 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Supabase Database Schema & Tables
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  PostgreSQL 15+
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Complete relational tables, RLS policies, triggers, and SPL seed data for Game Plan HGUFC
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'sql'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SQL Script (schema.sql)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tables')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tables'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table Architecture (8 Tables)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Setup Guide (3 Steps)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('connect')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'connect'
                  ? 'bg-white text-emerald-600 shadow-xs border border-emerald-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cloud Connection & Sync
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                  <span className="text-emerald-700 font-extrabold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Copy SQL
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download .SQL
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeTab === 'sql' && (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-orange-600" />
                  Ready to paste into <strong>Supabase SQL Editor</strong>
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  File: /supabase/schema.sql
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-orange-500 selection:text-white">
                  <code>{SUPABASE_SQL_SCRIPT}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                    public.club_profile
                  </h4>
                  <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-mono font-bold">
                    Club Identity & Crest
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Stores Hougang United FC identity, official SVG crest logo URL, club colors, and home stadium.
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                  <div>• id (TEXT, PK, 'club-hgufc')</div>
                  <div>• name, short_name ('Hougang United FC')</div>
                  <div>• logo_url (Official Wikimedia SVG)</div>
                  <div>• primary_color (#EA580C), secondary_color (#FFFFFF)</div>
                  <div>• stadium, league ('SPL')</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    public.players
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                    30 HGUFC Players
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Stores all 30 squad members (3 GKs with specialized styling + 27 Outfielders).
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                  <div>• id (TEXT, PK)</div>
                  <div>• name, number, position (GK/DEF/MID/FWD)</div>
                  <div>• role_label, preferred_foot, notes</div>
                  <div>• pitch_x, pitch_y, is_starting</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    public.formations
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                    Tactical Setups
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Tactical formations (4-3-3, 4-2-3-1, 3-5-2, etc.) and coordinate presets.
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                  <div>• id (TEXT, PK)</div>
                  <div>• name, category, tactical_description</div>
                  <div>• positions (JSONB Array of 11 roles/coordinates)</div>
                  <div>• is_custom (BOOLEAN)</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    public.opponents
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                    SPL Rivals
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  All Singapore Premier League teams with custom colors, badges, and tactical traits.
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                  <div>• id (TEXT, PK), name, short_name</div>
                  <div>• primary_color, secondary_color, logo_url</div>
                  <div>• stadium, tactical_style, strengths[], weaknesses[]</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    public.opponent_players
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                    Rival Squad Lineups
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Customizable rival player rosters (Name, Shirt Number, Position, Tactical Role).
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                  <div>• id (TEXT, PK), opponent_id (FK cascade)</div>
                  <div>• name, number, position, role</div>
                  <div>• pitch_x, pitch_y coordinates</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    public.match_plans
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                    Match Dossiers
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Header details, fixture date, venue, opponent clash, and selected formations.
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                  <div>• id (TEXT, PK), title, match_date, venue</div>
                  <div>• selected_opponent_id, hgufc_formation_id, rival_formation_id</div>
                  <div>• show_pitch_zones, show_opponent_tokens</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    public.swot_analyses & instructions
                  </h4>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                    Tactical Intelligence
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  4-quadrant SWOT matrix & 6-phase coaching game model directives.
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                  <div>• our_strengths, our_weaknesses, rival_strengths, rival_weaknesses</div>
                  <div>• build_up_phase, in_possession_structure</div>
                  <div>• out_of_possession_transition, pressing_triggers, rest_defense</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Create or Open your Supabase Project
                    </h4>
                    <p className="text-xs text-slate-600 mb-2">
                      Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-orange-600 font-semibold underline inline-flex items-center gap-0.5">supabase.com/dashboard <ExternalLink className="w-3 h-3" /></a> and select or create your project.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Navigate to the SQL Editor
                    </h4>
                    <p className="text-xs text-slate-600 mb-2">
                      In the left sidebar of your Supabase project dashboard, click on <strong>SQL Editor</strong>, then click <strong>New Query</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Paste & Run the SQL Script
                    </h4>
                    <p className="text-xs text-slate-600 mb-2">
                      Click the <strong>Copy SQL</strong> button above, paste the code into the query editor, and click <strong>Run</strong> (or press Cmd/Ctrl + Enter).
                    </p>
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        All 7 tables, performance indexes, automatic timestamp triggers, RLS policies, and full initial seed data will be created instantly.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLOUD CONNECTION & SYNC */}
          {activeTab === 'connect' && (
            <div className="space-y-5 p-2">
              <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 p-5 rounded-2xl text-white border border-emerald-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Live Cloud Sync with Supabase
                    </h4>
                    <p className="text-xs text-slate-300">
                      Connect your Supabase project to automatically persist match plans, players, formations, and SWOT analyses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              {saveStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveStatus}</span>
                </div>
              )}

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Supabase Project URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Supabase Anon Public API Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys &gt; anon public
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save & Activate Supabase Sync
                  </button>
                  {supabaseUrl && (
                    <button
                      type="button"
                      onClick={handleClearCredentials}
                      className="inline-flex items-center px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Clear Credentials
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>How Saving Works in Game Plan HGUFC:</span>
                </div>
                <p>
                  • Clicking the <strong>Save</strong> button in the top navigation bar immediately updates both browser cache and your Supabase PostgreSQL database tables.
                </p>
                <p>
                  • All club assets including Hougang United FC&apos;s official crest SVG logo (<span className="font-mono text-[11px] text-slate-700">Wikimedia SVG</span>), match plans, starting lineups, opponent scouting, and 10-phase tactical intelligence are persisted.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Supabase Compatible (PostgreSQL 15+)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
