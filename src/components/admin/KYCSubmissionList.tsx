import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface KYCSubmission {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone_number: string;
    institution_name: string;
    verification_status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'requires_update';
    risk_score: number;
    submitted_at: string;
    student_status: string;
}

interface KYCSubmissionListProps {
    onSelectSubmission: (submission: any) => void;
    selectedSubmissionId?: string | null;
}

export function KYCSubmissionList({ onSelectSubmission, selectedSubmissionId }: KYCSubmissionListProps) {
    const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState<KYCSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        fetchSubmissions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [submissions, searchQuery, statusFilter]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('student_kyc')
                .select('*')
                .order('submitted_at', { ascending: false });

            if (error) {
                console.error('Error fetching KYC submissions:', error);
                return;
            }

            setSubmissions(data || []);
        } catch (error) {
            console.error('Error fetching KYC submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...submissions];

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(sub => sub.verification_status === statusFilter);
        }

        // Apply search filter (student name or email)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(sub =>
                sub.full_name.toLowerCase().includes(query) ||
                sub.email.toLowerCase().includes(query)
            );
        }

        setFilteredSubmissions(filtered);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
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
        if (score <= 30) return "text-green-600";
        if (score <= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading submissions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="requires_update">Requires Update</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
                Showing {filteredSubmissions.length} of {submissions.length} submissions
            </div>

            {/* Table */}
            {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Submissions Found</h3>
                    <p className="text-muted-foreground">
                        {searchQuery || statusFilter !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "No KYC submissions have been received yet"}
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Institution</TableHead>
                                <TableHead>Submission Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Risk Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubmissions.map((submission) => (
                                <TableRow
                                    key={submission.id}
                                    onClick={() => onSelectSubmission(submission)}
                                    className={`cursor-pointer ${selectedSubmissionId === submission.id ? "bg-muted" : ""
                                        }`}
                                    data-state={selectedSubmissionId === submission.id ? "selected" : undefined}
                                >
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="" />
                                                <AvatarFallback>
                                                    {submission.full_name
                                                        .split(' ')
                                                        .map(n => n[0])
                                                        .join('')
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{submission.full_name}</div>
                                                <div className="text-sm text-muted-foreground">{submission.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{submission.institution_name}</div>
                                    </TableCell>
                                    <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(submission.verification_status)}>
                                            {submission.verification_status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-semibold ${getRiskScoreColor(submission.risk_score || 0)}`}>
                                            {submission.risk_score || 0}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
