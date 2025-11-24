import { supabase, TABLES } from '../lib/supabase';
import { format, startOfWeek, subDays } from 'date-fns';

/**
 * Get or create associate by badge ID or login
 */
export const getOrCreateAssociate = async (identifier) => {
  try {
    // Try to find by badge_id or login
    let { data, error } = await supabase
      .from(TABLES.ASSOCIATES)
      .select('*')
      .or(`badge_id.eq.${identifier},login.eq.${identifier}`)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Create a new associate
 */
export const createAssociate = async (badgeId, login, name) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ASSOCIATES)
      .insert([{ badge_id: badgeId, login, name }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Update associate name
 */
export const updateAssociateName = async (associateId, name) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ASSOCIATES)
      .update({ name })
      .eq('id', associateId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Start a CRET session
 */
export const startCretSession = async (associateId, createdBy) => {
  try {
    // Check if there's an active session (no end_time)
    const { data: existingSession } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .select('*')
      .eq('associate_id', associateId)
      .is('end_time', null)
      .single();

    if (existingSession) {
      return {
        data: null,
        error: { message: 'Associate already has an active CRET session' }
      };
    }

    const { data, error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .insert([{
        associate_id: associateId,
        created_by: createdBy,
        start_time: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * End a CRET session
 */
export const endCretSession = async (associateId) => {
  try {
    // Find the active session
    const { data: session, error: fetchError } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .select('*')
      .eq('associate_id', associateId)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !session) {
      return {
        data: null,
        error: { message: 'No active CRET session found for this associate' }
      };
    }

    // Update with end time
    const { data, error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .update({ end_time: new Date().toISOString() })
      .eq('id', session.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get total CRET hours for an associate in the past 7 days
 */
export const getCretHoursLastWeek = async (associateId) => {
  try {
    const sevenDaysAgo = subDays(new Date(), 7).toISOString();

    const { data, error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .select('hours_used')
      .eq('associate_id', associateId)
      .not('hours_used', 'is', null)
      .gte('start_time', sevenDaysAgo);

    if (error) throw error;

    const totalHours = data.reduce((sum, session) =>
      sum + (parseFloat(session.hours_used) || 0), 0
    );

    return { totalHours, sessions: data, error: null };
  } catch (error) {
    return { totalHours: 0, sessions: [], error };
  }
};

/**
 * Get all CRET sessions with associate info
 */
export const getAllCretSessions = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .select(`
        *,
        associate:associates (
          badge_id,
          login,
          name
        )
      `)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
};

/**
 * Get active (ongoing) CRET sessions
 */
export const getActiveCretSessions = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .select(`
        *,
        associate:associates (
          badge_id,
          login,
          name
        )
      `)
      .is('end_time', null)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
};

/**
 * Import associates from CSV data
 */
export const importAssociatesFromCSV = async (csvData) => {
  try {
    // csvData should be array of {badge_id, login, name}
    const { data, error } = await supabase
      .from(TABLES.ASSOCIATES)
      .upsert(csvData, { onConflict: 'badge_id' })
      .select();

    if (error) throw error;
    return { data, error: null, count: data.length };
  } catch (error) {
    return { data: [], error, count: 0 };
  }
};

/**
 * Format hours to readable string
 */
export const formatHours = (hours) => {
  if (!hours) return '0h 0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

/**
 * Calculate duration between two dates in hours
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end - start) / (1000 * 60 * 60); // Convert to hours
};

/**
 * Get day of week from date
 */
export const getDayOfWeek = (date) => {
  return format(new Date(date), 'EEEE');
};

/**
 * Override 5-hour warning for a session
 */
export const overrideWarning = async (sessionId, reason) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .update({
        override_warning: true,
        override_reason: reason
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Auto-close sessions older than 11 hours with 10 hours recorded
 * This checks for active sessions that haven't been closed and are >11 hours old
 */
export const autoCloseOldSessions = async () => {
  try {
    const elevenHoursAgo = new Date();
    elevenHoursAgo.setHours(elevenHoursAgo.getHours() - 11);

    // Find all active sessions older than 11 hours
    const { data: staleSessions, error: fetchError } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .select('*')
      .is('end_time', null)
      .lt('start_time', elevenHoursAgo.toISOString());

    if (fetchError) throw fetchError;

    if (!staleSessions || staleSessions.length === 0) {
      return { closedCount: 0, error: null };
    }

    // Close each stale session with 10 hours duration
    const updates = staleSessions.map(session => {
      const endTime = new Date(session.start_time);
      endTime.setHours(endTime.getHours() + 10); // Add exactly 10 hours

      return {
        id: session.id,
        end_time: endTime.toISOString()
      };
    });

    // Bulk update all stale sessions
    const { data, error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .upsert(updates)
      .select();

    if (error) throw error;

    return { closedCount: staleSessions.length, sessions: data, error: null };
  } catch (error) {
    return { closedCount: 0, sessions: [], error };
  }
};

/**
 * Edit a CRET session's start and end times
 */
export const editCretSession = async (sessionId, startTime, endTime) => {
  try {
    const updates = {
      start_time: startTime,
    };

    // Only update end_time if provided
    if (endTime) {
      updates.end_time = endTime;
    }

    const { data, error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .update(updates)
      .eq('id', sessionId)
      .select(`
        *,
        associate:associates (
          badge_id,
          login,
          name
        )
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Delete a CRET session
 */
export const deleteCretSession = async (sessionId) => {
  try {
    const { error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

/**
 * Check if associate has completed sessions today
 */
export const getCompletedSessionsToday = async (associateId) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .select('*')
      .eq('associate_id', associateId)
      .not('end_time', 'is', null)
      .gte('start_time', todayStart.toISOString());

    if (error) throw error;

    const totalHoursToday = data.reduce((sum, s) => sum + (parseFloat(s.hours_used) || 0), 0);

    return {
      sessions: data,
      count: data.length,
      totalHours: totalHoursToday,
      error: null
    };
  } catch (error) {
    return { sessions: [], count: 0, totalHours: 0, error };
  }
};

/**
 * Get all associates (for search/dropdown)
 */
export const getAllAssociates = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ASSOCIATES)
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
};

/**
 * Get all CRET sessions for a specific associate
 */
export const getAssociateCretHistory = async (associateId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.CRET_SESSIONS)
      .select(`
        *,
        associate:associates (
          badge_id,
          login,
          name
        )
      `)
      .eq('associate_id', associateId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
};
