// src/lib/supabase.js
// ─────────────────────────────────────────────────────────────
// Replace the two values below with your own from:
// Supabase Dashboard → Settings → API
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth Helpers ──────────────────────────────────────────────
export const signUp = async ({ email, password, fullName }) => {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } }
  });
  return { data, error };
};

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// ── Profile Helpers ───────────────────────────────────────────
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const getTeamMembers = async (companyId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('company_id', companyId)
    .order('full_name');
  return { data, error };
};

// ── Company Helpers ───────────────────────────────────────────
export const getCompany = async (companyId) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();
  return { data, error };
};

export const updateCompany = async (companyId, updates) => {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)
    .select()
    .single();
  return { data, error };
};

export const createCompany = async ({ name, primaryColor = '#3b82f6' }) => {
  const { data, error } = await supabase
    .from('companies')
    .insert({ name, primary_color: primaryColor })
    .select()
    .single();
  return { data, error };
};

// ── Contact Helpers ───────────────────────────────────────────
export const getContacts = async (companyId, filters = {}) => {
  let query = supabase
    .from('contacts')
    .select('*, profiles(full_name, email)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (filters.stage) query = query.eq('stage', filters.stage);
  if (filters.ownerId) query = query.eq('owner_id', filters.ownerId);
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createContact = async (contactData) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contactData)
    .select()
    .single();
  return { data, error };
};

export const updateContact = async (contactId, updates) => {
  const { data, error } = await supabase
    .from('contacts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', contactId)
    .select()
    .single();
  return { data, error };
};

export const deleteContact = async (contactId) => {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId);
  return { error };
};

// ── Activity Helpers ──────────────────────────────────────────
export const getActivities = async (companyId, contactId = null) => {
  let query = supabase
    .from('activities')
    .select('*, profiles(full_name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (contactId) query = query.eq('contact_id', contactId);

  const { data, error } = await query;
  return { data, error };
};

export const logActivity = async (activityData) => {
  const { data, error } = await supabase
    .from('activities')
    .insert(activityData)
    .select()
    .single();
  return { data, error };
};
