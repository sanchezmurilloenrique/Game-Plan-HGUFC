-- ==============================================================================
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
-- Automatically update updated_at timestamp
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
    positions JSONB NOT NULL, -- Array of 11 positions [{ role: 'GK', position: 'GK', x: 50, y: 92 }, ...]
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
-- 5. INDEXES FOR HIGH QUERY PERFORMANCE
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

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ==============================================================================
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opponents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opponent_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swot_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tactical_instructions ENABLE ROW LEVEL SECURITY;

-- Allow public and authenticated clients full access for coaches collaboration
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
-- 8. INITIAL SEED DATA (FORMATIONS, 30 PLAYERS, OPPONENTS & TACTICAL SQUADS)
-- ==============================================================================

-- 8.1 FORMATIONS SEED
INSERT INTO public.formations (id, name, category, tactical_description, positions) VALUES
('form-433', '4-3-3 Attacking', '4-at-back', 'High wide wingers creating half-space isolation, balanced three-man midfield triangle, dual attacking #8s.', '[
  {"role": "GK", "position": "GK", "x": 50, "y": 92},
  {"role": "RB", "position": "DEF", "x": 86, "y": 76},
  {"role": "RCB", "position": "DEF", "x": 63, "y": 80},
  {"role": "LCB", "position": "DEF", "x": 37, "y": 80},
  {"role": "LB", "position": "DEF", "x": 14, "y": 76},
  {"role": "DM (6)", "position": "MID", "x": 50, "y": 65},
  {"role": "RCM (8)", "position": "MID", "x": 68, "y": 53},
  {"role": "LCM (8)", "position": "MID", "x": 32, "y": 53},
  {"role": "RW", "position": "FWD", "x": 82, "y": 32},
  {"role": "ST", "position": "FWD", "x": 50, "y": 24},
  {"role": "LW", "position": "FWD", "x": 18, "y": 32}
]'::jsonb),
('form-4231', '4-2-3-1 Balanced', '4-at-back', 'Double pivot rest-defense screen, central playmaker #10 between the lines, wide attacking wingers.', '[
  {"role": "GK", "position": "GK", "x": 50, "y": 92},
  {"role": "RB", "position": "DEF", "x": 85, "y": 77},
  {"role": "RCB", "position": "DEF", "x": 62, "y": 80},
  {"role": "LCB", "position": "DEF", "x": 38, "y": 80},
  {"role": "LB", "position": "DEF", "x": 15, "y": 77},
  {"role": "RDM", "position": "MID", "x": 62, "y": 64},
  {"role": "LDM", "position": "MID", "x": 38, "y": 64},
  {"role": "RAM", "position": "MID", "x": 80, "y": 44},
  {"role": "CAM", "position": "MID", "x": 50, "y": 42},
  {"role": "LAM", "position": "MID", "x": 20, "y": 44},
  {"role": "ST", "position": "FWD", "x": 50, "y": 25}
]'::jsonb),
('form-442-flat', '4-4-2 Flat', '4-at-back', 'Classic two banks of four, compact horizontal block, dual center-forward pressing unit.', '[
  {"role": "GK", "position": "GK", "x": 50, "y": 92},
  {"role": "RB", "position": "DEF", "x": 86, "y": 76},
  {"role": "RCB", "position": "DEF", "x": 62, "y": 80},
  {"role": "LCB", "position": "DEF", "x": 38, "y": 80},
  {"role": "LB", "position": "DEF", "x": 14, "y": 76},
  {"role": "RM", "position": "MID", "x": 86, "y": 55},
  {"role": "RCM", "position": "MID", "x": 62, "y": 57},
  {"role": "LCM", "position": "MID", "x": 38, "y": 57},
  {"role": "LM", "position": "MID", "x": 14, "y": 55},
  {"role": "RS", "position": "FWD", "x": 62, "y": 26},
  {"role": "LS", "position": "FWD", "x": 38, "y": 26}
]'::jsonb),
('form-442-diamond', '4-4-2 Diamond', '4-at-back', 'Narrow midfield diamond overload, dedicated #6 pivot and #10 playmaker, high attacking fullbacks.', '[
  {"role": "GK", "position": "GK", "x": 50, "y": 92},
  {"role": "RB", "position": "DEF", "x": 86, "y": 74},
  {"role": "RCB", "position": "DEF", "x": 62, "y": 80},
  {"role": "LCB", "position": "DEF", "x": 38, "y": 80},
  {"role": "LB", "position": "DEF", "x": 14, "y": 74},
  {"role": "CDM", "position": "MID", "x": 50, "y": 66},
  {"role": "RCM", "position": "MID", "x": 68, "y": 53},
  {"role": "LCM", "position": "MID", "x": 32, "y": 53},
  {"role": "CAM", "position": "MID", "x": 50, "y": 40},
  {"role": "RS", "position": "FWD", "x": 62, "y": 26},
  {"role": "LS", "position": "FWD", "x": 38, "y": 26}
]'::jsonb),
('form-352', '3-5-2 Fluid', '3-at-back', 'Three central defenders with attacking wingbacks, strong 3-man midfield axis, dual central strikers.', '[
  {"role": "GK", "position": "GK", "x": 50, "y": 92},
  {"role": "RCB", "position": "DEF", "x": 72, "y": 80},
  {"role": "CB", "position": "DEF", "x": 50, "y": 82},
  {"role": "LCB", "position": "DEF", "x": 28, "y": 80},
  {"role": "RWB", "position": "DEF", "x": 88, "y": 60},
  {"role": "LWB", "position": "DEF", "x": 12, "y": 60},
  {"role": "DM", "position": "MID", "x": 50, "y": 64},
  {"role": "RCM", "position": "MID", "x": 65, "y": 49},
  {"role": "LCM", "position": "MID", "x": 35, "y": 49},
  {"role": "RS", "position": "FWD", "x": 62, "y": 26},
  {"role": "LS", "position": "FWD", "x": 38, "y": 26}
]'::jsonb),
('form-343-flat', '3-4-3 Flat', '3-at-back', 'Aggressive front three with wide wing play, two central controllers and wide midfield support.', '[
  {"role": "GK", "position": "GK", "x": 50, "y": 92},
  {"role": "RCB", "position": "DEF", "x": 72, "y": 80},
  {"role": "CB", "position": "DEF", "x": 50, "y": 82},
  {"role": "LCB", "position": "DEF", "x": 28, "y": 80},
  {"role": "RM", "position": "MID", "x": 88, "y": 58},
  {"role": "RCM", "position": "MID", "x": 60, "y": 60},
  {"role": "LCM", "position": "MID", "x": 40, "y": 60},
  {"role": "LM", "position": "MID", "x": 12, "y": 58},
  {"role": "RW", "position": "FWD", "x": 80, "y": 30},
  {"role": "ST", "position": "FWD", "x": 50, "y": 24},
  {"role": "LW", "position": "FWD", "x": 20, "y": 30}
]'::jsonb),
('form-343-diamond', '3-4-3 Diamond', '3-at-back', '3-1-2-1-3 structure: Johan Cruyff style positional play, overloaded center and pure wide wingers.', '[
  {"role": "GK", "position": "GK", "x": 50, "y": 92},
  {"role": "RCB", "position": "DEF", "x": 72, "y": 80},
  {"role": "CB", "position": "DEF", "x": 50, "y": 82},
  {"role": "LCB", "position": "DEF", "x": 28, "y": 80},
  {"role": "CDM", "position": "MID", "x": 50, "y": 68},
  {"role": "RCM", "position": "MID", "x": 68, "y": 55},
  {"role": "LCM", "position": "MID", "x": 32, "y": 55},
  {"role": "CAM", "position": "MID", "x": 50, "y": 42},
  {"role": "RW", "position": "FWD", "x": 82, "y": 28},
  {"role": "ST", "position": "FWD", "x": 50, "y": 22},
  {"role": "LW", "position": "FWD", "x": 18, "y": 28}
]'::jsonb),
('form-532', '5-3-2 Resilient', '5-at-back', 'Low-block defensive rigidity, three CBs with wingbacks tucking into back-five, direct counter attacking outlets.', '[
  {"role": "GK", "position": "GK", "x": 50, "y": 92},
  {"role": "RWB", "position": "DEF", "x": 88, "y": 74},
  {"role": "RCB", "position": "DEF", "x": 68, "y": 82},
  {"role": "CB", "position": "DEF", "x": 50, "y": 84},
  {"role": "LCB", "position": "DEF", "x": 32, "y": 82},
  {"role": "LWB", "position": "DEF", "x": 12, "y": 74},
  {"role": "RCM", "position": "MID", "x": 66, "y": 56},
  {"role": "CM", "position": "MID", "x": 50, "y": 62},
  {"role": "LCM", "position": "MID", "x": 34, "y": 56},
  {"role": "RS", "position": "FWD", "x": 60, "y": 26},
  {"role": "LS", "position": "FWD", "x": 40, "y": 26}
]'::jsonb),
('form-541', '5-4-1 Fortress', '5-at-back', 'Impenetrable defensive low block, denial of central half-spaces, isolated lone forward holding play.', '[
  {"role": "GK", "position": "GK", "x": 50, "y": 92},
  {"role": "RWB", "position": "DEF", "x": 88, "y": 74},
  {"role": "RCB", "position": "DEF", "x": 68, "y": 82},
  {"role": "CB", "position": "DEF", "x": 50, "y": 84},
  {"role": "LCB", "position": "DEF", "x": 32, "y": 82},
  {"role": "LWB", "position": "DEF", "x": 12, "y": 74},
  {"role": "RM", "position": "MID", "x": 84, "y": 54},
  {"role": "RCM", "position": "MID", "x": 60, "y": 58},
  {"role": "LCM", "position": "MID", "x": 40, "y": 58},
  {"role": "LM", "position": "MID", "x": 16, "y": 54},
  {"role": "ST", "position": "FWD", "x": 50, "y": 26}
]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 8.2 HGUFC 30 PLAYERS SEED (3 Goalkeepers + 27 Outfielders)
INSERT INTO public.players (id, name, number, position, preferred_foot, notes, pitch_x, pitch_y, is_starting) VALUES
-- Goalkeepers (Distinct GK Category)
('p-1', 'Zaiful Nizam', 1, 'GK', 'Right', 'Experienced shot-stopper, vocal leader from deep', 50, 92, true),
('p-2', 'Aizil Yazid', 18, 'GK', 'Right', 'Agile shot-stopper, high reflex reactions', null, null, false),
('p-3', 'Kenji Rusydi', 25, 'GK', 'Left', 'Sweeper keeper, confident distributing with left foot', null, null, false),
-- Defenders
('p-4', 'Nazrul Nazari', 4, 'DEF', 'Right', 'Dynamic right fullback, rapid recovery pace, inverted support', 86, 76, true),
('p-5', 'Anders Aplin', 5, 'DEF', 'Right', 'Commanding center-back, aerial duel dominance', 63, 80, true),
('p-6', 'Farhan Zulkifli', 3, 'DEF', 'Left', 'Explosive left wingback, overlapping threat in final third', 14, 76, true),
('p-7', 'Kazuma Takayama', 6, 'DEF', 'Right', 'Composed ball-playing defender, line-breaking distribution', 37, 80, true),
('p-8', 'Ajay Robson', 12, 'DEF', 'Right', 'Strong stopper, aggressive 1v1 ground duel tackle rate', null, null, false),
('p-9', 'Jordan Vestering', 17, 'DEF', 'Left', 'Defensive left-back, disciplined rest-defense positioning', null, null, false),
('p-10', 'Harhys Stewart', 15, 'DEF', 'Right', 'Versatile defender / defensive anchor, tactical reading', null, null, false),
('p-11', 'Rayan Azmi', 22, 'DEF', 'Right', 'Youth academy graduate, athletic recovery speed', null, null, false),
('p-12', 'Danish Irfan', 27, 'DEF', 'Right', 'Stout central defender, dependable low-block aerial clearing', null, null, false),
('p-13', 'Umar Akhbar', 29, 'DEF', 'Right', 'Wide fullback cover, energetic up-and-down stamina', null, null, false),
-- Midfielders
('p-14', 'Shahdan Sulaiman', 8, 'MID', 'Right', 'Metronomic deep-lying playmaker, pinpoint diagonal switches', 50, 65, true),
('p-15', 'Kristijan Krajcek', 10, 'MID', 'Both', 'Creative playmaker, operates between lines & half-spaces', 68, 53, true),
('p-16', 'Zulfahmi Arifin', 7, 'MID', 'Left', 'Left-footed maestro, dead-ball specialist and set-piece threat', 32, 53, true),
('p-17', 'Ismail Salihovic', 14, 'MID', 'Right', 'Box-to-box engine, counter-press trigger leader', null, null, false),
('p-18', 'Hazzuwan Halim', 11, 'MID', 'Right', 'High work-rate inverted winger / wide midfielder', null, null, false),
('p-19', 'Justin Hui', 16, 'MID', 'Right', 'Tenacious pressing midfielder, high ball turnover rate', null, null, false),
('p-20', 'Nikesh Singh', 20, 'MID', 'Right', 'Central distributor, short-medium combination play', null, null, false),
('p-21', 'Nurisham Jupri', 24, 'MID', 'Right', 'Holding midfielder, screen in front of back-four', null, null, false),
('p-22', 'Farhan Azman', 26, 'MID', 'Left', 'Left-sided midfielder with sharp delivery into penalty box', null, null, false),
('p-23', 'Asraf Zahid', 28, 'MID', 'Right', 'Energetic transitional carrier, fast progressive ball carrying', null, null, false),
-- Forwards
('p-24', 'Dejan Racic', 9, 'FWD', 'Right', 'Lethal target striker, physical presence in the 18-yard box', 50, 24, true),
('p-25', 'Petar Sliskovic', 99, 'FWD', 'Right', 'Prolific finisher, clinical first-time shooter in the box', null, null, false),
('p-26', 'Gabriel Quak', 77, 'FWD', 'Left', 'Veteran winger, electric cut-inside shoot or cross specialist', 82, 32, true),
('p-27', 'Shahril Ishak', 19, 'FWD', 'Right', 'Tactical veteran forward, exceptional penalty box movement', null, null, false),
('p-28', 'Amir Zalani', 21, 'FWD', 'Right', 'Pacy wide forward, runs in behind opponent high defensive lines', 18, 32, true),
('p-29', 'Louka Vaissierre', 23, 'FWD', 'Left', 'Tricky dribbler, wins fouls in advanced attacking third', null, null, false),
('p-30', 'Sahil Suhaimi', 13, 'FWD', 'Right', 'Instinctive poacher, dangerous on second-ball rebounds', null, null, false)
ON CONFLICT (id) DO NOTHING;

-- 8.3 SPL OPPONENTS SEED (All Singapore Premier League Rivals)
INSERT INTO public.opponents (id, name, short_name, primary_color, secondary_color, logo_url, stadium, default_formation_id, tactical_style, strengths, weaknesses, key_players) VALUES
('opp-lcs', 'Lion City Sailors', 'Sailors', '#002B49', '#FFFFFF', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=128&auto=format&fit=crop&q=80', 'Bishan Stadium', 'form-433', 'High-possession positional dominance, inverted wingers attacking half-spaces, high defensive line with aggressive rest-defense counter-press.', ARRAY['High technical quality in central midfield distribution', 'Dangerous 1v1 wingers cutting into shooting zones'], ARRAY['Vulnerable space behind fullbacks during offensive transitions'], ARRAY['Bart Ramselaar', 'Shawal Anuar', 'Maxime Lestienne', 'Bailey Wright']),
('opp-tampines', 'Tampines Rovers', 'Stags', '#EAB308', '#1E293B', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=128&auto=format&fit=crop&q=80', 'Our Tampines Hub (OTH)', 'form-4231', 'Fluid combinations through thirds, intricate short passing triangles, overlapping fullbacks generating cutbacks.', ARRAY['Excellent passing rhythm and spatial awareness on artificial turf'], ARRAY['Center-backs struggle when isolated in foot races against pacy forwards'], ARRAY['Boris Kopitovic', 'Kyoga Nakamura', 'Faris Ramli', 'Milos Zlatkovic']),
('opp-geylang', 'Geylang International', 'Eagles', '#15803D', '#FFFFFF', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=128&auto=format&fit=crop&q=80', 'Jalan Besar Stadium', 'form-442-flat', 'High-intensity direct transitions, rapid ball circulation to wide channels, aggressive second ball contestation.', ARRAY['Devastating forward transitions off opposition midfield turnovers'], ARRAY['Spaces open up between midfield line and defense line when pressed high'], ARRAY['Tomoya Taniguchi', 'Vincent Bezecourt', 'Takahiro Tezuka']),
('opp-balestier', 'Balestier Khalsa', 'Tigers', '#DC2626', '#FFFFFF', 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=128&auto=format&fit=crop&q=80', 'Bishan Stadium', 'form-352', 'High octane direct football, early crosses targeted into penalty box, physical aerial presence.', ARRAY['Physically imposing attacking unit creating chaos in the box'], ARRAY['Back-three leaves severe half-space voids when wingbacks push high'], ARRAY['Kodai Tanaka', 'Alen Kozar', 'Madhu Mohana']),
('opp-jurong', 'Jurong FC', 'Cobras', '#2563EB', '#FFFFFF', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=128&auto=format&fit=crop&q=80', 'Jurong Stadium', 'form-532', 'Ultra-compact defensive low block, rigid 5-man backline, rapid vertical counter-attacks.', ARRAY['Dense central congestion denying zone 14 shooting opportunities'], ARRAY['Low possession share causes progressive stamina depletion in final 20 mins'], ARRAY['Hariss Harun', 'Iqbal Hussain', 'Delwinder Singh']),
('opp-tanjongpagar', 'Tanjong Pagar United', 'Jaguars', '#7C2D12', '#FFFFFF', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=128&auto=format&fit=crop&q=80', 'Jurong East Stadium', 'form-541', 'Pragmatic defensive resilience, heavy focus on physical challenges and set-piece executions.', ARRAY['Resolute defending deep inside the 18-yard box'], ARRAY['Struggles to retain possession under coordinated mid-pitch pressing'], ARRAY['Salif Cisse', 'Mirko Sugic', 'Faizal Roslan']),
('opp-younglions', 'Young Lions', 'Young Lions', '#DC2626', '#1E293B', 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=128&auto=format&fit=crop&q=80', 'Jalan Besar Stadium', 'form-433', 'High-energy pressing enthusiasm, enthusiastic build-up play from the back, young technical dynamism.', ARRAY['Fearless running and high physical intensity throughout the 90 minutes'], ARRAY['Prone to tactical game-management lapses under sustained pressure'], ARRAY['Kieran Teo', 'Kanwarpreet Singh', 'Fairuz Fazli'])
ON CONFLICT (id) DO NOTHING;

-- 8.4 RIVAL PLAYERS SEED (Lion City Sailors Starting 11)
INSERT INTO public.opponent_players (id, opponent_id, name, number, position, role) VALUES
('lcs-p-1', 'opp-lcs', 'Izwan Mahbud', 1, 'GK', 'GK'),
('lcs-p-2', 'opp-lcs', 'Lionel Tan', 4, 'DEF', 'RB'),
('lcs-p-3', 'opp-lcs', 'Bailey Wright', 5, 'DEF', 'RCB'),
('lcs-p-4', 'opp-lcs', 'Toni Datkovic', 2, 'DEF', 'LCB'),
('lcs-p-5', 'opp-lcs', 'Chris van Huizen', 22, 'DEF', 'LB'),
('lcs-p-6', 'opp-lcs', 'Rui Pires', 6, 'MID', 'DM'),
('lcs-p-7', 'opp-lcs', 'Hariss Harun', 14, 'MID', 'RCM'),
('lcs-p-8', 'opp-lcs', 'Bart Ramselaar', 10, 'MID', 'LCM'),
('lcs-p-9', 'opp-lcs', 'Maxime Lestienne', 17, 'FWD', 'RW'),
('lcs-p-10', 'opp-lcs', 'Lennart Thy', 9, 'FWD', 'ST'),
('lcs-p-11', 'opp-lcs', 'Shawal Anuar', 7, 'FWD', 'LW'),
-- Tampines Rovers Starting 11
('tam-p-1', 'opp-tampines', 'Syazwan Buhari', 24, 'GK', 'GK'),
('tam-p-2', 'opp-tampines', 'Irfan Najeeb', 8, 'DEF', 'RB'),
('tam-p-3', 'opp-tampines', 'Shuya Yamashita', 4, 'DEF', 'RCB'),
('tam-p-4', 'opp-tampines', 'Milos Zlatkovic', 5, 'DEF', 'LCB'),
('tam-p-5', 'opp-tampines', 'Glenn Kweh', 23, 'DEF', 'LB'),
('tam-p-6', 'opp-tampines', 'Kyoga Nakamura', 6, 'MID', 'RDM'),
('tam-p-7', 'opp-tampines', 'Shah Shahiran', 7, 'MID', 'LDM'),
('tam-p-8', 'opp-tampines', 'Joel Chew', 15, 'MID', 'CAM'),
('tam-p-9', 'opp-tampines', 'Taufik Suparno', 11, 'FWD', 'RAM'),
('tam-p-10', 'opp-tampines', 'Faris Ramli', 10, 'FWD', 'LAM'),
('tam-p-11', 'opp-tampines', 'Boris Kopitovic', 9, 'FWD', 'ST')
ON CONFLICT (id) DO NOTHING;

-- 8.5 SAMPLE MATCH PLAN SEED
INSERT INTO public.match_plans (id, title, match_date, venue, competition, selected_opponent_id, hgufc_formation_id, rival_formation_id) VALUES
('plan-hgufc-spl-1', 'HGUFC vs Lion City Sailors - SPL Matchday 1', CURRENT_DATE, 'Jalan Besar Stadium', 'Singapore Premier League (SPL)', 'opp-lcs', 'form-433', 'form-433')
ON CONFLICT (id) DO NOTHING;

-- 8.6 SAMPLE SWOT SEED
INSERT INTO public.swot_analyses (id, match_plan_id, our_strengths, our_weaknesses, rival_strengths, rival_weaknesses) VALUES
('swot-1', 'plan-hgufc-spl-1', 
 '• Highly fluid midfield rotation (Shahdan Sulaiman & Kristijan Krajcek) creating progressive half-space passing lanes.
• Fast wide wing play with Farhan Zulkifli & Gabriel Quak delivering pinpoint early crosses.
• Aggressive counter-pressing intensity immediately upon losing possession in the attacking third.',
 '• Rest-defense vulnerability when both fullbacks push beyond the halfway line simultaneously.
• Occasional spatial gap between double pivot and center-backs during fast opposition vertical transitions.
• Inconsistent conversion rate from secondary attacking phases (second balls around the 18-yard box).',
 '• Rapid transition via inverted wingers targeting the inside channels and half-spaces.
• Aerial prowess and second-ball contestation on offensive corner kicks.
• High-line pressing traps forcing hurried back-passes to our goalkeeper.',
 '• Center-backs lack recovery acceleration when turned facing their own goal.
• Disconnect between pressing front-three and retreating midfield bank leaves Zone 14 unattended.
• High defensive line leaves significant space behind for direct chipped through-balls.')
ON CONFLICT (id) DO NOTHING;

-- 8.7 SAMPLE TACTICAL INSTRUCTIONS SEED
INSERT INTO public.tactical_instructions (id, match_plan_id, build_up_phase, in_possession_structure, out_of_possession_transition, pressing_triggers, rest_defense, set_pieces) VALUES
('inst-1', 'plan-hgufc-spl-1',
 'Circulate through the back-three / deep pivot (2+1 build-up shape). Draw the opponent forward press before releasing diagonal switch to our isolated weak-side winger.',
 'Establish a 3-2-4-1 attacking structure. Wingbacks hold maximum pitch width to stretch opponent fullbacks, while our two attacking midfielders occupy the left and right half-spaces.',
 'Immediate 5-second counter-press (Gegenpressing). The nearest two players collapse on the ball carrier, while the holding midfielder seals the central passing escape route.',
 'Trigger high block pressing trap when opponent center-back receives ball with closed body shape or makes an inward square pass to their single defensive midfielder.',
 'Maintain a strict 3+2 rest-defense structure (both CBs + opposite fullback tucking inside + holding pivot) to eliminate central counter-attack pathways.',
 'Inswinging delivery targeting the near post flick-on for our trailing central defender. Form 3-man boundary outside the 18-yard box to win the second ball.')
ON CONFLICT (id) DO NOTHING;
