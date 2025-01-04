import { createClientComponentClient, type SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export class SupabaseService {
    private static instance: SupabaseService;
    private client: SupabaseClient<Database>;

    private constructor() {
        this.client = createClientComponentClient<Database>();
    }

    public static getInstance(): SupabaseService {
        if (!SupabaseService.instance) {
            SupabaseService.instance = new SupabaseService();
        }
        return SupabaseService.instance;
    }

    getClient(): SupabaseClient<Database> {
        return this.client;
    }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance(); 