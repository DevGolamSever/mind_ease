// Supabase has been disabled as per user request.
// This file is kept to prevent import errors during the transition but does not export a valid client.

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ error: new Error("Supabase disabled") }),
    signUp: async () => ({ error: new Error("Supabase disabled") }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }),
    insert: async () => ({ error: new Error("Supabase disabled") }),
  })
};