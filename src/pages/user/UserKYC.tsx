import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StudentKYCForm } from "@/components/kyc/StudentKYCForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function UserKYC() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [existingSubmission, setExistingSubmission] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchExistingSubmission();
        }
    }, [user]);

    const fetchExistingSubmission = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('student_kyc')
                .select('*')
                .eq('user_id', user!.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 is "no rows returned" - not an error in this case
                console.error('Error fetching KYC submission:', error);
                toast.error('Failed to load KYC submission');
                return;
            }

            setExistingSubmission(data);
        } catch (error) {
            console.error('Error fetching KYC submission:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitSuccess = () => {
        toast.success('KYC submission successful!');
        navigate('/dashboard/user');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Identity Verification</h1>
                <p className="text-muted-foreground mt-2">
                    {existingSubmission
                        ? 'Update your identity verification information'
                        : 'Complete your identity verification to access all features'}
                </p>
            </div>

            <StudentKYCForm
                existingSubmission={existingSubmission}
                onSubmitSuccess={handleSubmitSuccess}
            />
        </div>
    );
}
