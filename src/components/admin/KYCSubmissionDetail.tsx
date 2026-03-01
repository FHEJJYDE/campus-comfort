import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    FileText,
    User,
    GraduationCap,
    Users,
    Shield,
    ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KYCSubmissionDetailProps {
    submission: any | null;
    onActionComplete: () => void;
}

export function KYCSubmissionDetail({ submission, onActionComplete }: KYCSubmissionDetailProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_update' | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [showActionDialog, setShowActionDialog] = useState(false);

    if (!submission) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Submission Selected</h3>
                <p className="text-sm text-muted-foreground">
                    Select a KYC submission from the list to view details
                </p>
            </div>
        );
    }

    const handleOpenActionDialog = (type: 'approve' | 'reject' | 'request_update') => {
        setActionType(type);
        setAdminNotes("");
        setRejectionReason("");
        setShowActionDialog(true);
    };

    const handleCloseActionDialog = () => {
        setShowActionDialog(false);
        setActionType(null);
        setAdminNotes("");
        setRejectionReason("");
    };

    const handleApprove = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to perform this action",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase
                .from('student_kyc')
                .update({
                    verification_status: 'verified',
                    verified_at: new Date().toISOString(),
                    reviewed_by: user.id,
                    reviewed_at: new Date().toISOString(),
                    admin_notes: adminNotes || null,
                })
                .eq('id', submission.id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "KYC submission has been approved",
            });

            handleCloseActionDialog();
            onActionComplete();
        } catch (error: any) {
            console.error('Error approving submission:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to approve submission",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to perform this action",
                variant: "destructive"
            });
            return;
        }

        if (!rejectionReason.trim()) {
            toast({
                title: "Validation Error",
                description: "Please provide a rejection reason",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase
                .from('student_kyc')
                .update({
                    verification_status: 'rejected',
                    rejection_reason: rejectionReason,
                    reviewed_by: user.id,
                    reviewed_at: new Date().toISOString(),
                    admin_notes: adminNotes || null,
                })
                .eq('id', submission.id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "KYC submission has been rejected",
            });

            handleCloseActionDialog();
            onActionComplete();
        } catch (error: any) {
            console.error('Error rejecting submission:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to reject submission",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRequestUpdate = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to perform this action",
                variant: "destructive"
            });
            return;
        }

        if (!adminNotes.trim()) {
            toast({
                title: "Validation Error",
                description: "Please provide notes explaining what needs to be updated",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase
                .from('student_kyc')
                .update({
                    verification_status: 'requires_update',
                    admin_notes: adminNotes,
                    reviewed_by: user.id,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', submission.id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Update request has been sent to the student",
            });

            handleCloseActionDialog();
            onActionComplete();
        } catch (error: any) {
            console.error('Error requesting update:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to request update",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAction = () => {
        if (actionType === 'approve') {
            handleApprove();
        } else if (actionType === 'reject') {
            handleReject();
        } else if (actionType === 'request_update') {
            handleRequestUpdate();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "verified":
                return "bg-green-500 text-white";
            case "pending":
                return "bg-yellow-500 text-white";
            case "under_review":
                return "bg-blue-500 text-white";
            case "rejected":
                return "bg-red-500 text-white";
            case "requires_update":
                return "bg-orange-500 text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    const getRiskScoreColor = (score: number) => {
        if (score <= 30) return "text-green-600 bg-green-50 border-green-200";
        if (score <= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getRiskLevel = (score: number) => {
        if (score <= 30) return "Low Risk";
        if (score <= 60) return "Medium Risk";
        return "High Risk";
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openDocument = (url: string | null) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const documents = [
        { label: "ID Document", url: submission.id_document_url, required: true },
        { label: "Student ID Card", url: submission.student_id_card_url, required: false },
        { label: "Admission Letter", url: submission.admission_letter_url, required: false },
        { label: "School ID Card", url: submission.school_id_card_url, required: false },
        { label: "Current Semester Receipt", url: submission.current_semester_receipt_url, required: false },
    ];

    return (
        <div className="space-y-6">
            {/* Header with Status and Risk Score */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl">{submission.full_name}</CardTitle>
                            <CardDescription>{submission.email}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(submission.verification_status)}>
                                {submission.verification_status.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Risk Assessment */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Risk Assessment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className={`flex items-center justify-between p-4 rounded-lg border ${getRiskScoreColor(submission.risk_score || 0)}`}>
                            <div>
                                <p className="text-sm font-medium">Risk Score</p>
                                <p className="text-2xl font-bold">{submission.risk_score || 0}/100</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">{getRiskLevel(submission.risk_score || 0)}</p>
                            </div>
                        </div>
                        {submission.risk_flags && submission.risk_flags.length > 0 && (
                            <div className="space-y-2">
                                <Label>Risk Flags:</Label>
                                <div className="flex flex-wrap gap-2">
                                    {submission.risk_flags.map((flag: string, index: number) => (
                                        <Badge key={index} variant="outline" className="text-orange-600 border-orange-300">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {flag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Full Name</Label>
                            <p className="font-medium">{submission.full_name}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Date of Birth</Label>
                            <p className="font-medium">{submission.date_of_birth || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Gender</Label>
                            <p className="font-medium capitalize">{submission.gender || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Phone Number</Label>
                            <p className="font-medium">{submission.phone_number}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="font-medium">{submission.email}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">State of Origin</Label>
                            <p className="font-medium">{submission.state_of_origin || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">LGA of Origin</Label>
                            <p className="font-medium">{submission.lga_of_origin || "N/A"}</p>
                        </div>
                        <div className="md:col-span-2">
                            <Label className="text-muted-foreground">Current Address</Label>
                            <p className="font-medium">{submission.current_address || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">ID Type</Label>
                            <p className="font-medium capitalize">{submission.id_type?.replace('_', ' ') || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">ID Number</Label>
                            <p className="font-medium">{submission.id_number || "N/A"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Student Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Student Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Student Status</Label>
                            <p className="font-medium capitalize">{submission.student_status?.replace('_', ' ') || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Institution Name</Label>
                            <p className="font-medium">{submission.institution_name || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Institution State</Label>
                            <p className="font-medium">{submission.institution_state || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Student ID Number</Label>
                            <p className="font-medium">{submission.student_id_number || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Matriculation Number</Label>
                            <p className="font-medium">{submission.matriculation_number || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Admission Year</Label>
                            <p className="font-medium">{submission.admission_year || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Expected Graduation</Label>
                            <p className="font-medium">{submission.expected_graduation_year || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Course of Study</Label>
                            <p className="font-medium">{submission.course_of_study || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Level of Study</Label>
                            <p className="font-medium">{submission.level_of_study ? `${submission.level_of_study} Level` : "N/A"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Guardian Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Guardian Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Guardian Name</Label>
                            <p className="font-medium">{submission.guardian_name || "Not provided"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Guardian Phone</Label>
                            <p className="font-medium">{submission.guardian_phone || "Not provided"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Relationship</Label>
                            <p className="font-medium capitalize">{submission.guardian_relationship || "Not provided"}</p>
                        </div>
                        <div className="md:col-span-2">
                            <Label className="text-muted-foreground">Guardian Address</Label>
                            <p className="font-medium">{submission.guardian_address || "Not provided"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">
                                            {doc.label}
                                            {doc.required && <span className="text-red-500 ml-1">*</span>}
                                        </p>
                                        {doc.url ? (
                                            <p className="text-sm text-green-600">Uploaded</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                                        )}
                                    </div>
                                </div>
                                {doc.url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openDocument(doc.url)}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Review History */}
            {(submission.reviewed_at || submission.rejection_reason || submission.admin_notes) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Review History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {submission.reviewed_at && (
                            <div>
                                <Label className="text-muted-foreground">Last Reviewed</Label>
                                <p className="font-medium">{formatDate(submission.reviewed_at)}</p>
                            </div>
                        )}
                        {submission.verified_at && (
                            <div>
                                <Label className="text-muted-foreground">Verified At</Label>
                                <p className="font-medium">{formatDate(submission.verified_at)}</p>
                            </div>
                        )}
                        {submission.rejection_reason && (
                            <div>
                                <Label className="text-muted-foreground">Rejection Reason</Label>
                                <p className="font-medium text-red-600">{submission.rejection_reason}</p>
                            </div>
                        )}
                        {submission.admin_notes && (
                            <div>
                                <Label className="text-muted-foreground">Admin Notes</Label>
                                <p className="font-medium">{submission.admin_notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Submission Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Submission Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Submitted At</Label>
                            <p className="font-medium">{formatDate(submission.submitted_at)}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Last Updated</Label>
                            <p className="font-medium">{formatDate(submission.updated_at)}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Submission Source</Label>
                            <p className="font-medium capitalize">{submission.submission_source?.replace('_', ' ') || "N/A"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            {submission.verification_status !== 'verified' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Actions</CardTitle>
                        <CardDescription>
                            Review the submission and take appropriate action
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => handleOpenActionDialog('approve')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                onClick={() => handleOpenActionDialog('reject')}
                                variant="destructive"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                onClick={() => handleOpenActionDialog('request_update')}
                                variant="outline"
                            >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Request Update
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Dialog */}
            <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' && 'Approve KYC Submission'}
                            {actionType === 'reject' && 'Reject KYC Submission'}
                            {actionType === 'request_update' && 'Request Update'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'approve' && 'This will mark the submission as verified and grant the student full access.'}
                            {actionType === 'reject' && 'This will reject the submission. Please provide a reason for rejection.'}
                            {actionType === 'request_update' && 'This will request the student to update their submission. Please provide specific instructions.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {actionType === 'reject' && (
                            <div className="space-y-2">
                                <Label htmlFor="rejection_reason">
                                    Rejection Reason <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="rejection_reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this submission is being rejected..."
                                    rows={4}
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="admin_notes">
                                Admin Notes {actionType === 'request_update' && <span className="text-red-500">*</span>}
                            </Label>
                            <Textarea
                                id="admin_notes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder={
                                    actionType === 'approve'
                                        ? "Optional notes about this approval..."
                                        : actionType === 'reject'
                                            ? "Additional notes (optional)..."
                                            : "Explain what needs to be updated..."
                                }
                                rows={4}
                                required={actionType === 'request_update'}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseActionDialog}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAction}
                            disabled={loading}
                            className={
                                actionType === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : actionType === 'reject'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : ''
                            }
                        >
                            {loading ? 'Processing...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
