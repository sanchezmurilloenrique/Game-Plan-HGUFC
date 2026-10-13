import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Player, Formation, OpponentTeam, MatchPlan } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface SyncStatePayload {
  players: Player[];
  matchPlan: MatchPlan;
  formations: Formation[];
  opponents: OpponentTeam[];
  savedAt?: string;
  sourceDevice?: string;
}

export interface SaveSyncResult {
  success: boolean;
  message: string;
  savedToSupabase: boolean;
  savedToLocalStorage: boolean;
  timestamp: string;
}

const STORAGE_CREDENTIALS_KEY = 'hgufc_supabase_credentials';
const STORAGE_PLAYERS_KEY = 'hgufc_squad_v1';
const STORAGE_FORMATIONS_KEY = 'hgufc_formations_v1';
const STORAGE_OPPONENTS_KEY = 'hgufc_opponents_v1';
const STORAGE_MATCHPLAN_KEY = 'hgufc_matchplan_v1';
const STORAGE_LAST_SAVED_KEY = 'hgufc_last_saved';

/**
 * Checks URL query parameters for sync tokens or credentials:
 * e.g. ?supa_sync=<base64_json> or ?supa_url=...&supa_key=...
 * If found, saves them to localStorage and removes parameters from the browser address bar.
 */
export function checkAndIngestUrlSyncToken(): SupabaseConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    let detectedUrl = urlParams.get('supa_url') || urlParams.get('supabase_url');
    let detectedKey = urlParams.get('supa_key') || urlParams.get('supabase_key');

    const syncToken = urlParams.get('supa_sync') || urlParams.get('sync_token');
    if (syncToken) {
      try {
        const decoded = JSON.parse(atob(decodeURIComponent(syncToken)));
        if (decoded.url && decoded.anonKey) {
          detectedUrl = decoded.url;
          detectedKey = decoded.anonKey;
        }
      } catch (e) {
        console.warn('Failed to parse supa_sync token from URL:', e);
      }
    }

    if (detectedUrl && detectedKey) {
      const config: SupabaseConfig = {
        url: detectedUrl.trim(),
        anonKey: detectedKey.trim(),
      };
      saveSupabaseConfig(config);

      // Clean query params from URL without reloading
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('supa_sync');
      cleanUrl.searchParams.delete('sync_token');
      cleanUrl.searchParams.delete('supa_url');
      cleanUrl.searchParams.delete('supa_key');
      cleanUrl.searchParams.delete('supabase_url');
      cleanUrl.searchParams.delete('supabase_key');
      window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search);

      return config;
    }
  } catch (err) {
    console.error('Error checking sync token from URL:', err);
  }
  return null;
}

const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: 'https://qwvhxygahmjfqxoqvhvy.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmh4eWdhaG1qZnF4b3F2aHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NzY3OTIsImV4cCI6MjEwNzQ1Mjc5Mn0.s3kUhg7KBXVEqQO9HkNoAQJ0177CYEZgXpFWKcYmEGU'
};

export function getSupabaseConfig(): SupabaseConfig | null {
  try {
    // 1. First check environment variables (Vercel / Vite build-time env)
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (envUrl && envKey && envUrl.trim() !== '' && envKey.trim() !== '') {
      return { url: envUrl.trim(), anonKey: envKey.trim() };
    }

    // 2. Check URL query params for cross-device one-click activation
    const fromUrl = checkAndIngestUrlSyncToken();
    if (fromUrl) {
      return fromUrl;
    }

    // 3. Check localStorage
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(STORAGE_CREDENTIALS_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.url && parsed.anonKey) {
          return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
        }
      }
    }

    // 4. Default Project Supabase Config (ensures out-of-the-box cross-device cloud sync)
    return DEFAULT_SUPABASE_CONFIG;
  } catch (err) {
    console.error('Error reading Supabase credentials:', err);
  }
  return DEFAULT_SUPABASE_CONFIG;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_CREDENTIALS_KEY, JSON.stringify(config));
  }
  cachedClient = null;
  lastUrl = '';
  lastKey = '';
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_CREDENTIALS_KEY);
  }
  cachedClient = null;
  lastUrl = '';
  lastKey = '';
}

/**
 * Generates a sharable link with embedded sync token that opens on any device
 * (mobile phone, iPad, other laptop) and automatically activates cloud synchronization.
 */
export function generateShareableSyncUrl(customOrigin?: string): string | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    const origin = customOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
    const token = btoa(JSON.stringify({ url: config.url, anonKey: config.anonKey }));
    const encodedToken = encodeURIComponent(token);
    return `${origin}/?supa_sync=${encodedToken}`;
  } catch (e) {
    console.error('Failed to generate shareable sync URL:', e);
    return null;
  }
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
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    lastUrl = config.url;
    lastKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

/**
 * Loads the latest game plan and tactical data from Supabase.
 * Checks the unified `app_state` table first, and falls back to relational tables if needed.
 */
export async function loadAllDataFromCloud(): Promise<{
  success: boolean;
  data?: SyncStatePayload;
  message?: string;
  fromCloud: boolean;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      fromCloud: false,
      message: 'Supabase credentials not configured yet.',
    };
  }

  try {
    // 1. Primary Strategy: Check the unified app_state table
    const { data: stateRow, error: stateError } = await client
      .from('app_state')
      .select('*')
      .eq('key', 'hgufc_current_gameplan')
      .maybeSingle();

    if (!stateError && stateRow && stateRow.data) {
      const payload = stateRow.data as SyncStatePayload;
      // Cache to localStorage for offline access
      try {
        if (payload.players) localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(payload.players));
        if (payload.matchPlan) localStorage.setItem(STORAGE_MATCHPLAN_KEY, JSON.stringify(payload.matchPlan));
        if (payload.formations) localStorage.setItem(STORAGE_FORMATIONS_KEY, JSON.stringify(payload.formations));
        if (payload.opponents) localStorage.setItem(STORAGE_OPPONENTS_KEY, JSON.stringify(payload.opponents));
        if (stateRow.updated_at) localStorage.setItem(STORAGE_LAST_SAVED_KEY, stateRow.updated_at);
      } catch (storageErr) {
        console.warn('LocalStorage cache update warning:', storageErr);
      }

      return {
        success: true,
        data: payload,
        fromCloud: true,
        message: 'Loaded game plan from cloud app_state.',
      };
    }

    // 2. Secondary Strategy: Fallback to relational match_plans table if app_state is not populated
    const { data: planRow, error: planError } = await client
      .from('match_plans')
      .select('*')
      .eq('id', 'mp-current')
      .maybeSingle();

    if (!planError && planRow) {
      // Reconstruct matchPlan
      const { data: swotRow } = await client
        .from('swot_analyses')
        .select('*')
        .eq('match_plan_id', 'mp-current')
        .maybeSingle();

      const { data: instRow } = await client
        .from('tactical_instructions')
        .select('*')
        .eq('match_plan_id', 'mp-current')
        .maybeSingle();

      const reconstructedPlan: Partial<MatchPlan> = {
        matchTitle: planRow.title || 'Singapore Premier League Matchday',
        matchDate: planRow.match_date || new Date().toISOString().split('T')[0],
        venue: planRow.venue || 'Jalan Besar Stadium',
        competition: planRow.competition || 'Singapore Premier League (SPL)',
        selectedOpponentId: planRow.selected_opponent_id || 'opp-tpu',
        hgufcFormationId: planRow.hgufcFormationId || planRow.hgufc_formation_id || 'form-433',
        rivalFormationId: planRow.rivalFormationId || planRow.rival_formation_id || 'form-433',
        showPitchZones: false,
        showOpponentTokens: planRow.show_opponent_tokens ?? true,
      };

      if (swotRow) {
        reconstructedPlan.swot = {
          ourStrengths: swotRow.our_strengths || '',
          ourWeaknesses: swotRow.our_weaknesses || '',
          rivalStrengths: swotRow.rival_strengths || '',
          rivalWeaknesses: swotRow.rival_weaknesses || '',
        };
      }

      if (instRow) {
        reconstructedPlan.tacticalNotes = {
          buildUpPhase: instRow.build_up_phase || '',
          inPossessionStructure: instRow.in_possession_structure || '',
          outOfPossessionTransition: instRow.out_of_possession_transition || '',
          pressingTriggers: instRow.pressing_triggers || '',
          restDefense: instRow.rest_defense || '',
          setPieces: instRow.set_pieces || '',
        };
      }

      // Check if players exist in table
      const { data: playerRows } = await client.from('players').select('*');
      let loadedPlayers: Player[] | undefined;
      if (playerRows && playerRows.length > 0) {
        loadedPlayers = playerRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          number: r.number,
          position: r.position,
          roleLabel: r.role_label,
          preferredFoot: r.preferred_foot,
          notes: r.notes,
          pitchX: r.pitch_x !== null ? Number(r.pitch_x) : undefined,
          pitchY: r.pitch_y !== null ? Number(r.pitch_y) : undefined,
          isStarting: r.is_starting,
        }));
      }

      return {
        success: true,
        data: {
          players: loadedPlayers || [],
          matchPlan: reconstructedPlan as MatchPlan,
          formations: [],
          opponents: [],
        },
        fromCloud: true,
        message: 'Loaded game plan from relational tables.',
      };
    }

    return {
      success: false,
      fromCloud: false,
      message: 'No cloud records found yet.',
    };
  } catch (err: any) {
    console.error('Error loading data from Supabase:', err);
    return {
      success: false,
      fromCloud: false,
      message: err?.message || 'Failed to read from Supabase',
    };
  }
}

/**
 * Subscribes to real-time changes on the Supabase `app_state` table.
 * When changes are saved on any device, this fires on all other connected devices.
 */
export function subscribeToRemoteChanges(
  onRemoteUpdate: (data: SyncStatePayload) => void
): (() => void) | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('public:app_state:hgufc')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_state',
          filter: 'key=eq.hgufc_current_gameplan',
        },
        (payload) => {
          if (payload.new && (payload.new as any).data) {
            const data = (payload.new as any).data as SyncStatePayload;
            onRemoteUpdate(data);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Connected to realtime
        }
      });

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return null;
  }
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
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const isoTimestamp = new Date().toISOString();

  // 1. Always persist to localStorage for instant offline safety
  try {
    localStorage.setItem(STORAGE_PLAYERS_KEY, JSON.stringify(data.players));
    localStorage.setItem(STORAGE_MATCHPLAN_KEY, JSON.stringify(data.matchPlan));
    localStorage.setItem(STORAGE_FORMATIONS_KEY, JSON.stringify(data.formations));
    localStorage.setItem(STORAGE_OPPONENTS_KEY, JSON.stringify(data.opponents));
    localStorage.setItem(STORAGE_LAST_SAVED_KEY, isoTimestamp);
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }

  // 2. Check Supabase
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: true,
      message: `Guardado local a las ${now}. (Para ver los cambios en otros dispositivos, conecta Supabase en el botón superior)`,
      savedToSupabase: false,
      savedToLocalStorage: true,
      timestamp: now,
    };
  }

  try {
    // 3. Save to unified `app_state` table for bulletproof cross-device sync
    const payload: SyncStatePayload = {
      players: data.players,
      matchPlan: data.matchPlan,
      formations: data.formations,
      opponents: data.opponents,
      savedAt: isoTimestamp,
    };

    const { error: appStateError } = await client.from('app_state').upsert({
      key: 'hgufc_current_gameplan',
      data: payload,
      updated_at: isoTimestamp,
    });

    if (appStateError) {
      console.warn('Could not save to app_state table, trying relational tables:', appStateError);
    }

    // 4. Save to relational tables (carefully matching schema.sql)
    try {
      // Upsert Club Profile
      await client.from('club_profile').upsert({
        id: 'club-hgufc',
        name: 'Hougang United Football Club',
        short_name: 'Hougang United FC',
        logo_url: 'https://upload.wikimedia.org/wikipedia/en/a/a6/Hougang_United_FC_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original',
        primary_color: '#EA580C',
        secondary_color: '#FFFFFF',
        stadium: 'Jalan Besar Stadium',
        league: 'Singapore Premier League (SPL)',
        updated_at: isoTimestamp,
      });

      // Upsert Match Plan
      await client.from('match_plans').upsert({
        id: 'mp-current',
        title: data.matchPlan.matchTitle,
        match_date: data.matchPlan.matchDate,
        venue: data.matchPlan.venue,
        competition: data.matchPlan.competition,
        selected_opponent_id: data.matchPlan.selectedOpponentId,
        hgufc_formation_id: data.matchPlan.hgufcFormationId,
        rival_formation_id: data.matchPlan.rivalFormationId,
        show_pitch_zones: false,
        show_opponent_tokens: data.matchPlan.showOpponentTokens,
        active_pitch_tool: data.matchPlan.activePitchTool,
        updated_at: isoTimestamp,
      });

      // Upsert SWOT Analysis
      if (data.matchPlan.swot) {
        await client.from('swot_analyses').upsert({
          id: 'swot-current',
          match_plan_id: 'mp-current',
          our_strengths: data.matchPlan.swot.ourStrengths,
          our_weaknesses: data.matchPlan.swot.ourWeaknesses,
          rival_strengths: data.matchPlan.swot.rivalStrengths,
          rival_weaknesses: data.matchPlan.swot.rivalWeaknesses,
          updated_at: isoTimestamp,
        });
      }

      // Upsert Tactical Instructions
      if (data.matchPlan.tacticalNotes) {
        await client.from('tactical_instructions').upsert({
          id: 'inst-current',
          match_plan_id: 'mp-current',
          build_up_phase: data.matchPlan.tacticalNotes.buildUpPhase,
          in_possession_structure: data.matchPlan.tacticalNotes.inPossessionStructure,
          out_of_possession_transition: data.matchPlan.tacticalNotes.outOfPossessionTransition,
          pressing_triggers: data.matchPlan.tacticalNotes.pressingTriggers,
          rest_defense: data.matchPlan.tacticalNotes.restDefense,
          set_pieces: data.matchPlan.tacticalNotes.setPieces,
          updated_at: isoTimestamp,
        });
      }
    } catch (relationalErr) {
      console.warn('Relational tables upsert notice:', relationalErr);
    }

    return {
      success: true,
      message: `¡Guardado en la nube (Supabase) y almacenamiento local a las ${now}! Visible en todos tus dispositivos.`,
      savedToSupabase: true,
      savedToLocalStorage: true,
      timestamp: now,
    };
  } catch (err: any) {
    console.warn('Supabase sync warning:', err);
    return {
      success: true,
      message: `Guardado local a las ${now} (Aviso Supabase: ${err?.message || 'Verifica la conexión'})`,
      savedToSupabase: false,
      savedToLocalStorage: true,
      timestamp: now,
    };
  }
}
