import { useState } from "react";
import { KYCSubmissionList } from "@/components/admin/KYCSubmissionList";
import { KYCSubmissionDetail } from "@/components/admin/KYCSubmissionDetail";

export default function AdminStudentKYC() {
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

    const handleSelectSubmission = (submission: any) => {
        setSelectedSubmission(submission);
    };

    const handleActionComplete = () => {
        // Refresh the list by clearing selection and triggering re-fetch
        setSelectedSubmission(null);
        // Force a re-render by setting a temporary state
        setTimeout(() => {
            // The list component will re-fetch on mount
        }, 100);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Student KYC Management</h1>
                <p className="text-muted-foreground mt-2">
                    Review and manage student identity verification submissions
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel - Submission List */}
                <div className="lg:col-span-1">
                    <KYCSubmissionList
                        onSelectSubmission={handleSelectSubmission}
                        selectedSubmissionId={selectedSubmission?.id}
                    />
                </div>

                {/* Right Panel - Submission Detail */}
                <div className="lg:col-span-1">
                    <KYCSubmissionDetail
                        submission={selectedSubmission}
                        onActionComplete={handleActionComplete}
                    />
                </div>
            </div>
        </div>
    );
}
