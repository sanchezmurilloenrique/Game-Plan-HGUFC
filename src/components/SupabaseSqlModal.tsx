import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Database, 
  ExternalLink, 
  Terminal, 
  ShieldCheck, 
  Sparkles, 
  Key, 
  Link as LinkIcon, 
  Cloud, 
  CheckCircle2, 
  Save, 
  Share2, 
  Upload, 
  Smartphone, 
  Monitor, 
  Layers 
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  generateShareableSyncUrl 
} from '../services/supabaseService';
import { Player, Formation, OpponentTeam, MatchPlan } from '../types';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported?: () => void;
  currentData?: {
    players: Player[];
    matchPlan: MatchPlan;
    formations: Formation[];
    opponents: OpponentTeam[];
  };
}

export const SUPABASE_QUICK_SQL = `-- ==============================================================================
-- SCRIPT RÁPIDO: CREAR TABLA app_state PARA SINCRONIZACIÓN MULTIDISPOSITIVO
-- Pega este script en Supabase > SQL Editor > Run
-- ==============================================================================

-- 1. Crear tabla para almacenar y sincronizar el plan táctico
CREATE TABLE IF NOT EXISTS public.app_state (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar seguridad (RLS) y permitir lectura y escritura pública con la Anon Key
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access to app_state" ON public.app_state;
CREATE POLICY "Public full access to app_state" ON public.app_state FOR ALL USING (true) WITH CHECK (true);

-- 3. Habilitar sincronización en tiempo real (Realtime) entre dispositivos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'app_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_state;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
`;

export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- GAME PLAN HGUFC - SUPABASE DATABASE SCHEMA & MULTI-DEVICE SYNC (COMPLETO)
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

-- TABLE: app_state (Unified Realtime Cross-Device Game Plan Synchronization)
CREATE TABLE IF NOT EXISTS public.app_state (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    show_pitch_zones BOOLEAN DEFAULT false,
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

DROP TRIGGER IF EXISTS trg_app_state_updated_at ON public.app_state;
CREATE TRIGGER trg_app_state_updated_at BEFORE UPDATE ON public.app_state FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access to club_profile" ON public.club_profile;
CREATE POLICY "Public full access to club_profile" ON public.club_profile FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to app_state" ON public.app_state;
CREATE POLICY "Public full access to app_state" ON public.app_state FOR ALL USING (true) WITH CHECK (true);

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
INSERT INTO public.club_profile (id, name, short_name, logo_url, primary_color, secondary_color, stadium, league) VALUES
('club-hgufc', 'Hougang United Football Club', 'Hougang United FC', 'https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original', '#EA580C', '#FFFFFF', 'Jalan Besar Stadium', 'Singapore Premier League (SPL)')
ON CONFLICT (id) DO UPDATE SET
    logo_url = EXCLUDED.logo_url,
    updated_at = NOW();
`;

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ 
  isOpen, 
  onClose,
  onDataImported,
  currentData
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'devices' | 'sql' | 'guide'>('connect');
  const [selectedSqlOption, setSelectedSqlOption] = useState<'quick' | 'full'>('quick');

  // Supabase Credentials State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedSyncLink, setCopiedSyncLink] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
      setSupabaseUrl(config.url);
      setSupabaseKey(config.anonKey);
    }
  }, [isOpen]);

  const handleSaveCredentials = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setSaveStatus('Por favor ingresa tanto la URL de Supabase como la clave Anon Key.');
      return;
    }
    saveSupabaseConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseKey.trim(),
    });
    setSaveStatus('¡Credenciales guardadas y sincronización en la nube activada!');
    setTimeout(() => {
      setSaveStatus(null);
    }, 3500);
  };

  const handleClearCredentials = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setSaveStatus('Credenciales eliminadas. Los cambios ahora se guardarán solo en este navegador.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleCopySyncLink = () => {
    const link = generateShareableSyncUrl();
    if (link) {
      navigator.clipboard.writeText(link);
      setCopiedSyncLink(true);
      setTimeout(() => setCopiedSyncLink(false), 3000);
    } else {
      setSaveStatus('Primero guarda tu URL y clave de Supabase para generar el enlace.');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDownloadBackup = () => {
    if (!currentData) return;
    const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hgufc_game_plan_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.matchPlan || parsed.players) {
          if (parsed.players) localStorage.setItem('hgufc_squad_v1', JSON.stringify(parsed.players));
          if (parsed.formations) localStorage.setItem('hgufc_formations_v1', JSON.stringify(parsed.formations));
          if (parsed.opponents) localStorage.setItem('hgufc_opponents_v1', JSON.stringify(parsed.opponents));
          if (parsed.matchPlan) localStorage.setItem('hgufc_matchplan_v1', JSON.stringify(parsed.matchPlan));
          setSaveStatus('¡Archivo táctico restaurado con éxito!');
          if (onDataImported) onDataImported();
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        }
      } catch (err) {
        setSaveStatus('El archivo JSON seleccionado no tiene un formato válido.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const activeSql = selectedSqlOption === 'quick' ? SUPABASE_QUICK_SQL : SUPABASE_SQL_SCRIPT;

  const handleCopySql = () => {
    navigator.clipboard.writeText(activeSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([activeSql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedSqlOption === 'quick' ? 'crear_tabla_app_state.sql' : 'game_plan_hgufc_supabase.sql';
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
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Sincronización en la Nube y Base de Datos Supabase
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Multi-Dispositivo
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Guarda tus cambios una vez y velos en cualquier móvil, tablet o PC en tiempo real
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
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('connect')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'connect'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Conectar Supabase
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('devices')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'devices'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sincronizar Otro Dispositivo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'sql'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Script SQL (schema.sql)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Guía de Despliegue en Vercel
            </button>
          </div>

          <div className="flex items-center space-x-2 ml-4 shrink-0">
            {activeTab === 'sql' && (
              <>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                      <span className="text-emerald-700 font-extrabold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      Copiar SQL
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  .SQL
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {/* TAB 1: CLOUD CONNECTION */}
          {activeTab === 'connect' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-5 rounded-2xl text-white border border-emerald-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Conexión a Supabase para Sincronización en la Nube
                    </h4>
                    <p className="text-xs text-slate-300">
                      Al conectar tu proyecto Supabase, cada vez que pulses el botón <strong>Save</strong> tus cambios se guardan en la nube y se reflejan al instante en cualquier dispositivo.
                    </p>
                  </div>
                </div>
              </div>

              {saveStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveStatus}</span>
                </div>
              )}

              {/* Important: First time notice about tables */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="font-bold text-amber-950 text-sm flex items-center justify-between">
                      <span>¿No tienes ninguna tabla en Supabase todavía?</span>
                      <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-extrabold uppercase">
                        Paso 1
                      </span>
                    </div>
                    <p className="text-amber-800 leading-relaxed">
                      Es completamente normal: los proyectos recién creados en Supabase están vacíos. Para que tus tácticas se sincronicen entre dispositivos, solo debes crear la tabla <strong>app_state</strong> ejecutando nuestro script (toma menos de 10 segundos).
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('sql')}
                        className="inline-flex items-center px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-2xs transition-colors cursor-pointer text-xs"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copiar Script SQL para Supabase
                      </button>
                      <a
                        href="https://supabase.com/dashboard/project/qwvhxygahmjfqxoqvhvy/sql/new"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                      >
                        Abrir Supabase SQL Editor
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

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
                    Encuéntralo en tu Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
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
                    Encuéntralo en tu Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys &gt; anon public
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Guardar y Activar Sincronización Nube
                  </button>
                  {supabaseUrl && (
                    <button
                      type="button"
                      onClick={handleClearCredentials}
                      className="inline-flex items-center px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Desconectar
                    </button>
                  )}
                </div>
              </div>

              {/* Offline Backup Fallback */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-slate-500" />
                  Copia de Seguridad Offline (JSON)
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  También puedes exportar o importar tu informe táctico manualmente para transferirlo entre dispositivos sin internet:
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                    Descargar Plan Táctico (.json)
                  </button>
                  <label className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                    Restaurar desde (.json)
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CROSS-DEVICE SYNC GUIDE */}
          {activeTab === 'devices' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-slate-900 p-5 rounded-2xl text-white border border-orange-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      ¿Cómo ver los cambios en tu teléfono, tablet u otro ordenador?
                    </h4>
                    <p className="text-xs text-slate-300">
                      Tienes 2 formas sencillas para que tus cambios se vean independientemente del dispositivo utilizado:
                    </p>
                  </div>
                </div>
              </div>

              {/* Method 1: Instant Link */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">1</span>
                    Método 1: Enlace Rápido de Sincronización (1 Clic)
                  </h4>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    Recomendado para Móviles
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Copia este enlace y ábrelo en tu teléfono móvil o en el navegador de tu otro dispositivo. Al abrirse, conectará automáticamente la base de datos y cargará todo tu plan táctico:
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleCopySyncLink}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedSyncLink ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5" />
                        <span>¡Enlace copiado! Pégalo en tu otro dispositivo</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1.5" />
                        <span>Copiar Enlace de Sincronización para Otros Dispositivos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Method 2: Vercel Environment Variables */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">2</span>
                    Método 2: Sincronización 100% Automática y Permanente en Vercel
                  </h4>
                  <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold">
                    Definitivo
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Para que <strong>cualquier persona o dispositivo</strong> que abra la web en Vercel vea siempre los mismos cambios sin tener que hacer nada:
                </p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                  <div>1. Ve a tu proyecto en <strong>Vercel &gt; Settings &gt; Environment Variables</strong></div>
                  <div>2. Añade la variable: <strong>VITE_SUPABASE_URL</strong> con tu URL de Supabase</div>
                  <div>3. Añade la variable: <strong>VITE_SUPABASE_ANON_KEY</strong> con tu clave anon</div>
                  <div>4. Haz clic en <strong>Redeploy</strong> en Vercel</div>
                </div>
                <p className="text-xs text-slate-500">
                  Una vez hecho esto, la web desplegada en Vercel leerá directamente la base de datos en todos los dispositivos por defecto.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SQL SCRIPT */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              {/* Step by step guide banner */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-orange-400" />
                    Pasos para crear la tabla en Supabase (10 Segundos)
                  </h4>
                  <a
                    href="https://supabase.com/dashboard/project/qwvhxygahmjfqxoqvhvy/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Ir al SQL Editor de Supabase <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1 font-medium">
                  <li>Haz clic en el botón <strong>"Copiar SQL"</strong> de arriba a la derecha.</li>
                  <li>Ve a tu proyecto en Supabase y haz clic en <strong>SQL Editor</strong> (icono <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded">&gt;_</code> en la barra izquierda).</li>
                  <li>Haz clic en <strong>+ New query</strong>, pega el texto y pulsa el botón verde <strong>Run</strong>.</li>
                </ol>
              </div>

              {/* Script Type Selector */}
              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSqlOption('quick')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSqlOption === 'quick'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    1. Script Rápido (Recomendado - Solo app_state)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSqlOption('full')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSqlOption === 'full'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    2. Script Completo (Todas las tablas relacionales)
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  {selectedSqlOption === 'quick' ? 'Crea la tabla app_state y activa Realtime' : 'Esquema completo con tablas normalizadas'}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-orange-600" />
                  {selectedSqlOption === 'quick' ? 'Script Rápido: public.app_state' : 'Script Completo: schema.sql'}
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center px-3 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-2xs cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copiar este script
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
                <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[420px] leading-relaxed selection:bg-orange-500 selection:text-white">
                  <code>{activeSql}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: VERCEL GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Ejecutar el Script SQL en Supabase
                    </h4>
                    <p className="text-xs text-slate-600 mb-2">
                      En <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-orange-600 font-semibold underline inline-flex items-center gap-0.5">supabase.com/dashboard <ExternalLink className="w-3 h-3" /></a>, abre el <strong>SQL Editor</strong>, pega el contenido de la pestaña <strong>Script SQL</strong> y presiona <strong>Run</strong>. Esto creará la tabla <code className="bg-slate-100 px-1 py-0.5 rounded text-orange-600 font-mono">app_state</code> para la sincronización en tiempo real.
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
                      Conectar en la Aplicación o en Vercel
                    </h4>
                    <p className="text-xs text-slate-600 mb-2">
                      Introduce tu URL y clave en la pestaña <strong>Conectar Supabase</strong> y haz clic en Guardar. O mejor aún, añádelas como variables de entorno en Vercel (<code className="font-mono bg-slate-100 px-1">VITE_SUPABASE_URL</code> y <code className="font-mono bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code>).
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
                      Guardar y Colaborar en Tiempo Real
                    </h4>
                    <p className="text-xs text-slate-600 mb-2">
                      Al pulsar el botón <strong>Save</strong> en la cabecera, la aplicación guarda inmediatamente tanto en tu dispositivo como en Supabase. Si tienes la aplicación abierta en otro dispositivo, se actualizará automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Compatible con Supabase PostgreSQL 15+ y Vercel</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
