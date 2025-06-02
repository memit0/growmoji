export const DEBUG_ENABLED = true;

export const debugLog = (component: string, action: string, details: any) => {
  if (DEBUG_ENABLED) {
    // console.log(`[${component}] ${action}:`, details);
    if (details instanceof Error) {
      // console.log(`[${component}] Error stack:`, details.stack);
    }
  }
};

export const wrapSupabaseQuery = async <T>(
  operation: string,
  queryFn: () => Promise<{ data: T | null; error: any }>
) => {
  debugLog('Supabase', `Request - ${operation}`, {});
  try {
    const result = await queryFn();
    if (result.error) {
      debugLog('Supabase', `Error - ${operation}`, result.error);
    } else {
      debugLog('Supabase', `Success - ${operation}`, {
        data: Array.isArray(result.data) 
          ? { count: result.data.length, first: result.data[0] }
          : result.data
      });
    }
    return result;
  } catch (error) {
    debugLog('Supabase', `Exception - ${operation}`, error);
    throw error;
  }
};

export const supabaseDebug = {
  logRequest: (operation: string, params?: any) => {
    debugLog('Supabase', `Request - ${operation}`, params);
  },
  logResponse: (operation: string, data: any) => {
    debugLog('Supabase', `Response - ${operation}`, data);
  },
  logError: (operation: string, error: any) => {
    debugLog('Supabase', `Error - ${operation}`, error);
  }
}; 