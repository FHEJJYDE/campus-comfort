import { useState, useEffect } from "react";
import {
  UserCheck,
  UserX,
  CreditCard,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  Save,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { agentsApi, AgentApplication, AgentBankDetails } from "@/lib/api/agents";

export default function AdminAgentManagement() {
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending_approval" | "approved" | "rejected">("all");

  // Selected application for detail modal or reject modal
  const [selectedApp, setSelectedApp] = useState<AgentApplication | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Bank details state
  const [bankDetails, setBankDetails] = useState<AgentBankDetails>({
    bankName: "",
    accountNumber: "",
    accountName: "",
    registrationFee: 2000,
    instructions: ""
  });
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, bank] = await Promise.all([
        agentsApi.getAllApplications(),
        agentsApi.getBankDetails()
      ]);
      setApplications(apps);
      if (bank) setBankDetails(bank);
    } catch (err) {
      console.error("Error loading admin agent data:", err);
      toast.error("Could not load agent data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: AgentApplication) => {
    setProcessingId(app.id);
    try {
      await agentsApi.approveApplication(app.id, app.user_id);
      toast.success(`Agent ${app.full_name} approved successfully!`);
      // Update local state
      setApplications(prev =>
        prev.map(a => (a.id === app.id ? { ...a, status: 'approved', payment_status: 'verified' } : a))
      );
      if (selectedApp?.id === app.id) {
        setSelectedApp(prev => prev ? { ...prev, status: 'approved' } : null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to approve agent.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setProcessingId(selectedApp.id);
    try {
      await agentsApi.rejectApplication(selectedApp.id, rejectionReason);
      toast.success(`Application for ${selectedApp.full_name} marked as rejected.`);
      setApplications(prev =>
        prev.map(a => (a.id === selectedApp.id ? { ...a, status: 'rejected', rejection_reason: rejectionReason } : a))
      );
      setRejectModalOpen(false);
      setRejectionReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject application.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBank(true);
    try {
      await agentsApi.updateBankDetails(bankDetails);
      toast.success("Agent registration bank details updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update bank details.");
    } finally {
      setSavingBank(false);
    }
  };

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      app.full_name.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query) ||
      app.phone.toLowerCase().includes(query) ||
      app.campus_location.toLowerCase().includes(query) ||
      app.payment_reference?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const pendingCount = applications.filter(a => a.status === 'pending_approval').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const totalFeesCollected = approvedCount * (bankDetails.registrationFee || 2000);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-accent" />
            Agent Applications & Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Review agent onboarding applications, verify ₦2,000 fee payments, and manage company registration bank details.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Total Applicants</p>
              <p className="text-2xl font-bold">{applications.length}</p>
            </div>
            <div className="p-2.5 rounded-full bg-accent/10 text-accent">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={pendingCount > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Pending Approval</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
            </div>
            <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Active / Approved</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{approvedCount}</p>
            </div>
            <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Onboarding Fees</p>
              <p className="text-2xl font-bold text-foreground">₦{totalFeesCollected.toLocaleString()}</p>
            </div>
            <div className="p-2.5 rounded-full bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>Agent Applications</span>
            {pendingCount > 0 && (
              <Badge className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0 h-4 min-w-4">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bank-settings" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Registration Bank Details</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: APPLICATIONS LIST */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-lg">Applications Review</CardTitle>
                  <CardDescription className="text-xs">
                    Confirm ₦2,000 fee receipt and approve verified agents to grant dashboard access.
                  </CardDescription>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search name, phone, ref..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>

                  <div className="flex gap-1">
                    {(["all", "pending_approval", "approved", "rejected"] as const).map(status => (
                      <Button
                        key={status}
                        variant={statusFilter === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                        className={`text-xs h-9 ${statusFilter === status ? "bg-accent text-accent-foreground font-semibold" : ""}`}
                      >
                        {status === "all"
                          ? "All"
                          : status === "pending_approval"
                          ? "Pending"
                          : status === "approved"
                          ? "Approved"
                          : "Rejected"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Campus Territory</TableHead>
                      <TableHead>Fee & Reference</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApps.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                          {loading ? "Loading applications..." : "No agent applications match your filters."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApps.map(app => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="font-semibold text-sm text-foreground">{app.full_name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {app.phone}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {app.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-0.5 text-xs">
                              <span className="font-medium text-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-accent" />
                                {app.campus_location}
                              </span>
                              {app.institution && (
                                <span className="text-muted-foreground block truncate max-w-[180px]">
                                  {app.institution}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-0.5 text-xs">
                              <div className="font-bold text-foreground">
                                ₦{(app.payment_amount || 2000).toLocaleString()}
                              </div>
                              <span className="font-mono text-muted-foreground block truncate max-w-[150px]">
                                Ref: {app.payment_reference || "N/A"}
                              </span>
                              {app.payment_sender_name && (
                                <span className="text-[11px] text-muted-foreground block truncate">
                                  Sender: {app.payment_sender_name}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>

                          <TableCell>
                            {app.status === 'pending_approval' ? (
                              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px]">
                                Pending Review
                              </Badge>
                            ) : app.status === 'approved' ? (
                              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px]">
                                Approved
                              </Badge>
                            ) : (
                              <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[11px]">
                                Rejected
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setDetailModalOpen(true);
                                }}
                                className="h-8 px-2 text-xs"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Details
                              </Button>

                              {app.status === 'pending_approval' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(app)}
                                    disabled={processingId === app.id}
                                    className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                  >
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setRejectModalOpen(true);
                                    }}
                                    disabled={processingId === app.id}
                                    className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}

                              {app.status === 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(app)}
                                  disabled={processingId === app.id}
                                  className="h-8 px-2 text-xs text-emerald-600 hover:bg-emerald-50"
                                >
                                  Re-Approve
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: BANK SETTINGS */}
        <TabsContent value="bank-settings">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" />
                Agent Registration Bank Account
              </CardTitle>
              <CardDescription>
                Configure the company bank details displayed to prospective agents on the registration page for paying the ₦2,000 onboarding fee.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveBankDetails}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={bankDetails.bankName}
                      onChange={e => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                      placeholder="e.g. Moniepoint MFB, GTBank, Zenith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={e => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="e.g. 8032145678"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Name *</Label>
                    <Input
                      id="accountName"
                      value={bankDetails.accountName}
                      onChange={e => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                      placeholder="e.g. Campus Comfort Real Estate Ltd"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationFee">Registration Fee (₦) *</Label>
                    <Input
                      id="registrationFee"
                      type="number"
                      value={bankDetails.registrationFee}
                      onChange={e => setBankDetails(prev => ({ ...prev, registrationFee: Number(e.target.value) || 2000 }))}
                      placeholder="2000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Payment Narration & Instructions for Applicants</Label>
                  <Textarea
                    id="instructions"
                    value={bankDetails.instructions}
                    onChange={e => setBankDetails(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={3}
                    placeholder="Instructions on transfer narration, e.g. 'Use your full name as payment reference.'"
                  />
                </div>
              </CardContent>

              <CardFooter className="border-t border-border pt-4 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Saved changes reflect immediately on the agent registration flow.
                </span>
                <Button
                  type="submit"
                  disabled={savingBank}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {savingBank ? "Saving..." : "Save Bank Details"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agent Application Details</DialogTitle>
            <DialogDescription>
              Review complete application and payment data submitted by {selectedApp?.full_name}.
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 text-sm py-2">
              <div className="p-3 rounded-lg bg-muted/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-semibold text-foreground">{selectedApp.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone Number:</span>
                  <span className="font-semibold text-foreground">{selectedApp.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-semibold text-foreground">{selectedApp.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campus / City:</span>
                  <span className="font-semibold text-accent">{selectedApp.campus_location}</span>
                </div>
                {selectedApp.institution && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Institution:</span>
                    <span className="font-semibold text-foreground">{selectedApp.institution}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg border border-border space-y-2">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Payment Verification</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee Amount:</span>
                  <span className="font-bold text-foreground">₦{(selectedApp.payment_amount || 2000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Reference:</span>
                  <span className="font-mono text-foreground font-semibold">{selectedApp.payment_reference || "N/A"}</span>
                </div>
                {selectedApp.payment_sender_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sender Account:</span>
                    <span className="text-foreground">{selectedApp.payment_sender_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code of Conduct:</span>
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                    Agreed & Signed
                  </Badge>
                </div>
              </div>

              {selectedApp.rejection_reason && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                  <strong>Rejection Reason:</strong> {selectedApp.rejection_reason}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Close
            </Button>
            {selectedApp?.status === 'pending_approval' && (
              <Button
                onClick={() => {
                  if (selectedApp) handleApprove(selectedApp);
                  setDetailModalOpen(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                Approve Agent
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Agent Application</DialogTitle>
            <DialogDescription>
              Specify the reason why {selectedApp?.full_name}'s application is being rejected.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="rejectionReason">Reason for Rejection *</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. ₦2,000 payment not received, invalid payment reference, or invalid territory assignment."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processingId === selectedApp?.id}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
