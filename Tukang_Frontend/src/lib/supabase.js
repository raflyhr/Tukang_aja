import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance = null;

const isValidUrl = (url) => {
  try {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  } catch (e) {
    return false;
  }
};

if (isValidUrl(supabaseUrl) && supabaseKey && !supabaseKey.includes('YOUR_SUPABASE')) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

if (!supabaseInstance) {
  console.warn("Supabase client is running in fallback/offline mode because VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not configured or invalid.");
  
  // Create a safe mock object to prevent crash when chat page subscribes
  const dummyChannel = {
    on: () => dummyChannel,
    subscribe: () => dummyChannel,
    unsubscribe: () => Promise.resolve(),
    track: () => Promise.resolve(),
    send: () => Promise.resolve(),
  };

  supabaseInstance = {
    channel: () => dummyChannel,
    removeChannel: () => Promise.resolve(),
    removeAllChannels: () => Promise.resolve(),
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    }),
  };
}

export const supabase = supabaseInstance;

