import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { debugLog } from './utils/debug';

// Remember to add your Supabase URL and Anon Key to your .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug environment variables
debugLog('Supabase Config', 'Environment Check', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  urlPrefix: supabaseUrl?.substring(0, 20),
  anonKeyPrefix: supabaseAnonKey?.substring(0, 10)
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    debugLog('Supabase', 'Connection Test Error', error);
  } else {
    debugLog('Supabase', 'Connection Test Success', {
      hasSession: !!data.session,
      user: data.session?.user?.email
    });
  }
});

// Add query debug listener
supabase.channel('custom-all-channel')
  .on('postgres_changes', { event: '*', schema: '*' }, (payload) => {
    debugLog('Supabase Query', 'Database Change', payload);
  })
  .subscribe();

// Add debug interceptor
const originalFrom = supabase.from.bind(supabase);

supabase.from = (table: string) => {
  const builder: any = originalFrom(table);

  // Helper function to wrap query methods for logging
  const wrapQueryMethod = <T extends (...args: any[]) => any>(
    methodName: string,
    originalMethod: T
  ): T => {
    return function(this: any, ...args: Parameters<T>): ReturnType<T> {
      const logDetails = {
        table,
        operation: methodName.toUpperCase(),
        // For insert/upsert, args[0] is the array of rows. For update, args[0] is the values.
        args: (methodName === 'insert' || methodName === 'update' || methodName === 'upsert') && args.length > 0 ? args[0] : args,
      };
      debugLog('Supabase Query', `Attempt - ${methodName.toUpperCase()} on ${table}`, logDetails);

      const query = originalMethod.apply(this, args) as ReturnType<T>;

      if (query && typeof query.then === 'function') {
        void (query as Promise<any>).then(
          (response: any) => { // onFulfilled
            if (response.error) {
              debugLog('Supabase Error', `${methodName.toUpperCase()} on ${table}`, { error: response.error, originalArgs: logDetails.args });
            } else {
              debugLog('Supabase Success', `${methodName.toUpperCase()} on ${table}`, {
                data: response.data,
                count: response.count,
                status: response.status,
                statusText: response.statusText,
                originalArgs: logDetails.args
              });
            }
          },
          (error: any) => { // onRejected
            debugLog('Supabase Exception', `${methodName.toUpperCase()} on ${table}`, { error, originalArgs: logDetails.args });
          }
        );
      }
      return query;
    } as T;
  };

  // Wrap select
  if (typeof builder.select === 'function') {
    const originalSelect = builder.select.bind(builder);
    builder.select = function(...args: any[]) { // Keep select simpler as its logging was already working
      debugLog('Supabase Query', `SELECT from ${table}`, { args });
      const query = originalSelect(...args);
      void query.then((response: any) => {
        if (response.error) {
          debugLog('Supabase Error', `SELECT from ${table}`, response.error);
        } else {
          debugLog('Supabase Success', `SELECT from ${table}`, {
            count: response.data?.length,
            first: response.data?.[0]
          });
        }
      });
      return query;
    };
  }

  // Wrap insert
  if (typeof builder.insert === 'function') {
    builder.insert = wrapQueryMethod('insert', builder.insert.bind(builder));
  }

  // Wrap update
  if (typeof builder.update === 'function') {
    builder.update = wrapQueryMethod('update', builder.update.bind(builder));
  }

  // Wrap delete
  if (typeof builder.delete === 'function') {
    builder.delete = wrapQueryMethod('delete', builder.delete.bind(builder));
  }

  // Wrap upsert
  if (typeof builder.upsert === 'function') {
    builder.upsert = wrapQueryMethod('upsert', builder.upsert.bind(builder));
  }

  return builder;
};
console.log('DEBUG: Supabase client initialized:', supabase ? 'Yes' : 'No'); 