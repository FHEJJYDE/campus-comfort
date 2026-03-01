import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Location {
    id: string;
    name: string;
    state: string;
    country: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    display_order: number;
    property_count?: number;
    created_at: string;
}

export function useLocations() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('locations')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (fetchError) throw fetchError;

            setLocations(data || []);
        } catch (err: any) {
            console.error('Error fetching locations:', err);
            setError(err.message || 'Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    return { locations, loading, error, refetch: fetchLocations };
}
