import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, AlertCircle, XCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KYCStatusDisplayProps {
    submission: any | null;
}

export function KYCStatusDisplay({ submission }: KYCStatusDisplayProps) {
    const navigate = useNavigate();

    const handleStartKYC = () => {
        navigate('/dashboard/user/kyc');
    };

    const handleUpdateKYC = () => {
        navigate('/dashboard/user/kyc');
    };
    // No submission state
    if (!submission) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Identity Verification</CardTitle>
                    <CardDescription>
                        Complete your KYC verification to access all platform features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Verification Required</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                            To ensure a safe and trusted community, we require all students to verify their identity.
                            This process takes about 5-10 minutes.
                        </p>
                        <Button onClick={handleStartKYC} size="lg">
                            Start Verification
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { verification_status, submitted_at, verified_at, rejection_reason, admin_notes } = submission;

    // Pending state
    if (verification_status === 'pending') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        Verification Pending
                    </CardTitle>
                    <CardDescription>
                        Your KYC submission is awaiting review
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                            Your verification documents have been submitted and are currently under review.
                            We'll notify you once the review is complete.
                        </AlertDescription>
                    </Alert>
                    <div className="text-sm text-muted-foreground">
                        <p>Submitted on: {new Date(submitted_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Under review state
    if (verification_status === 'under_review') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Under Review
                    </CardTitle>
                    <CardDescription>
                        Our team is currently reviewing your submission
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                            Your verification is being actively reviewed by our team.
                            This usually takes 1-2 business days. We'll notify you once complete.
                        </AlertDescription>
                    </Alert>
                    <div className="text-sm text-muted-foreground">
                        <p>Submitted on: {new Date(submitted_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Verified state
    if (verification_status === 'verified') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Verified
                    </CardTitle>
                    <CardDescription>
                        Your identity has been successfully verified
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                        </Badge>
                    </div>
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            Your identity has been verified. You now have full access to all platform features.
                        </AlertDescription>
                    </Alert>
                    {verified_at && (
                        <div className="text-sm text-muted-foreground">
                            <p>Verified on: {new Date(verified_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Rejected state
    if (verification_status === 'rejected') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        Verification Rejected
                    </CardTitle>
                    <CardDescription>
                        Your submission could not be verified
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                            Your verification was rejected. Please review the reason below and submit updated information.
                        </AlertDescription>
                    </Alert>
                    {rejection_reason && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                            <h4 className="text-sm font-semibold text-red-900 mb-2">Rejection Reason:</h4>
                            <p className="text-sm text-red-800">{rejection_reason}</p>
                        </div>
                    )}
                    <Button onClick={handleUpdateKYC} variant="default">
                        Update Submission
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Requires update state
    if (verification_status === 'requires_update') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        Update Required
                    </CardTitle>
                    <CardDescription>
                        Additional information is needed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="border-orange-200 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                            Our team has reviewed your submission and requires additional information or corrections.
                        </AlertDescription>
                    </Alert>
                    {admin_notes && (
                        <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                            <h4 className="text-sm font-semibold text-orange-900 mb-2">Admin Notes:</h4>
                            <p className="text-sm text-orange-800">{admin_notes}</p>
                        </div>
                    )}
                    <Button onClick={handleUpdateKYC} variant="default">
                        Update Submission
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Fallback for unknown status
    return (
        <Card>
            <CardHeader>
                <CardTitle>KYC Status</CardTitle>
                <CardDescription>
                    Current verification status: {verification_status}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Please contact support if you have questions about your verification status.
                </p>
            </CardContent>
        </Card>
    );
}
