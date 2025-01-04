import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export class SupabaseAdminService {
    private static instance: SupabaseAdminService;
    private client: SupabaseClient<Database>;

    private constructor() {
        if (typeof window !== 'undefined') {
            throw new Error('SupabaseAdminService can only be instantiated on the server side');
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            throw new Error('Missing Supabase environment variables');
        }

        this.client = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }

    public static getInstance(): SupabaseAdminService {
        if (!SupabaseAdminService.instance) {
            SupabaseAdminService.instance = new SupabaseAdminService();
        }
        return SupabaseAdminService.instance;
    }

    getClient(): SupabaseClient<Database> {
        return this.client;
    }
}

// Export singleton instance
export const supabaseAdminService = SupabaseAdminService.getInstance(); 