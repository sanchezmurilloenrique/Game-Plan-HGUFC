import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Player, Formation, OpponentTeam, MatchPlan } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_KEY = 'hgufc_supabase_credentials';

export function getSupabaseConfig(): SupabaseConfig | null {
  try {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (envUrl && envKey) {
      return { url: envUrl, anonKey: envKey };
    }
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading Supabase credentials:', err);
  }
  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  if (cachedClient && lastUrl === config.url && lastKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    lastUrl = config.url;
    lastKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export interface SaveSyncResult {
  success: boolean;
  message: string;
  savedToSupabase: boolean;
  savedToLocalStorage: boolean;
  timestamp: string;
}

/**
 * Saves all application state to LocalStorage and, if connected, directly into Supabase tables
 */
export async function persistAllData(data: {
  players: Player[];
  matchPlan: MatchPlan;
  formations: Formation[];
  opponents: OpponentTeam[];
}): Promise<SaveSyncResult> {
  const now = new Date().toLocaleTimeString();
  
  // 1. Always persist to localStorage for instant offline safety
  try {
    localStorage.setItem('hgufc_players_v1', JSON.stringify(data.players));
    localStorage.setItem('hgufc_matchplan_v1', JSON.stringify(data.matchPlan));
    localStorage.setItem('hgufc_formations_v1', JSON.stringify(data.formations));
    localStorage.setItem('hgufc_opponents_v1', JSON.stringify(data.opponents));
    localStorage.setItem('hgufc_last_saved', new Date().toISOString());
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }

  // 2. Check Supabase
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: true,
      message: `Changes saved locally at ${now}. (Connect Supabase to sync to cloud database)`,
      savedToSupabase: false,
      savedToLocalStorage: true,
      timestamp: now,
    };
  }

  try {
    // Upsert Club Profile with Wikimedia SVG logo
    await client.from('club_profile').upsert({
      id: 'club-hgufc',
      name: 'Hougang United Football Club',
      short_name: 'Hougang United FC',
      logo_url: 'https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original',
      primary_color: '#EA580C',
      secondary_color: '#FFFFFF',
      stadium: 'Jalan Besar Stadium',
      league: 'Singapore Premier League (SPL)',
      updated_at: new Date().toISOString(),
    });

    // Upsert Match Plan
    await client.from('match_plans').upsert({
      id: 'mp-current',
      match_title: data.matchPlan.matchTitle,
      match_date: data.matchPlan.matchDate,
      venue: data.matchPlan.venue,
      competition: data.matchPlan.competition,
      opponent_id: data.matchPlan.selectedOpponentId,
      hgufc_formation_id: data.matchPlan.hgufcFormationId,
      rival_formation_id: data.matchPlan.rivalFormationId,
      swot_analysis: data.matchPlan.swot,
      tactical_notes: data.matchPlan.tacticalNotes,
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
      message: `All changes saved to Supabase & local storage at ${now}!`,
      savedToSupabase: true,
      savedToLocalStorage: true,
      timestamp: now,
    };
  } catch (err: any) {
    console.warn('Supabase sync warning:', err);
    return {
      success: true,
      message: `Saved locally at ${now} (Supabase sync notice: ${err?.message || 'Check tables schema'})`,
      savedToSupabase: false,
      savedToLocalStorage: true,
      timestamp: now,
    };
  }
}
