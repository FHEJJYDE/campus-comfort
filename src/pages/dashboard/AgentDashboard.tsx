import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  DollarSign,
  FileText,
  Clock,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  MapPin,
  ShieldCheck,
  Send,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { agentsApi, AgentDailyReport, DailyReportClientRecord } from "@/lib/api/agents";

// Import existing CreateListing for agent
import CreateListing from "../agent/CreateListing";

function AgentOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<AgentDailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadAgentData();
  }, [user]);

  const loadAgentData = async () => {
    setLoading(true);
    try {
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        setProfile(prof);

        const rep = await agentsApi.getDailyReports(user.id);
        setReports(rep);
      }
    } catch (err) {
      console.error("Error loading agent overview:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute total clients & commissions
  const totalClients = reports.reduce((sum, r) => sum + (r.successful_clients_count || 0), 0);
  const totalCommission = totalClients * 10000;
  const totalPeopleApproached = reports.reduce((sum, r) => sum + (r.people_approached || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Verified Campus Agent
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome, {profile?.full_name || user?.user_metadata?.full_name || "Agent"}!
          </h1>
          <p className="text-xs md:text-sm text-primary-foreground/80 max-w-xl">
            Campus Territory: <strong>{user?.user_metadata?.campus_location || "Campus Comfort Partner"}</strong> • Earn ₦10,000 for every student placed in verified housing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/dashboard/agent/daily-reports">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Submit Daily Report
            </Button>
          </Link>
          <Link to="/dashboard/agent/create-listing">
            <Button variant="outline" className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 border-primary-foreground/20 flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              List Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Commission Earned</p>
              <p className="text-2xl font-bold text-accent">₦{totalCommission.toLocaleString()}</p>
              <span className="text-[11px] text-muted-foreground">₦10,000 / successful client</span>
            </div>
            <div className="p-3 rounded-full bg-accent/15 text-accent">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Successful Clients</p>
              <p className="text-2xl font-bold">{totalClients}</p>
              <span className="text-[11px] text-muted-foreground">Reported across sessions</span>
            </div>
            <div className="p-3 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Students Approached</p>
              <p className="text-2xl font-bold">{totalPeopleApproached}</p>
              <span className="text-[11px] text-muted-foreground">Outreach efforts</span>
            </div>
            <div className="p-3 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Phone className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Daily Reports Filed</p>
              <p className="text-2xl font-bold">{reports.length}</p>
              <span className="text-[11px] text-muted-foreground">Compulsory by 6:30 PM</span>
            </div>
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Important Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Daily Reports</CardTitle>
              <CardDescription className="text-xs">Your submitted daily work logs</CardDescription>
            </div>
            <Link to="/dashboard/agent/daily-reports">
              <Button variant="ghost" size="sm" className="text-xs text-accent">
                View All Reports →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {reports.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                No daily reports submitted yet. Submit your report today by 6:30 PM!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Campus Area</TableHead>
                      <TableHead>Approached</TableHead>
                      <TableHead>Successful</TableHead>
                      <TableHead>Money Collected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.slice(0, 5).map(rep => (
                      <TableRow key={rep.id}>
                        <TableCell className="font-medium text-xs">
                          {new Date(rep.report_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs">{rep.campus_area}</TableCell>
                        <TableCell className="text-xs">{rep.people_approached}</TableCell>
                        <TableCell className="text-xs">
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                            {rep.successful_clients_count} clients
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          ₦{(rep.total_money_collected || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operational Reminders & Code of Conduct Card */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Company Field Guidelines
            </CardTitle>
            <CardDescription className="text-xs">
              Reminders from the Staff Code of Conduct
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs leading-relaxed">
            <div className="p-3 rounded-lg bg-muted/60 border border-border/80">
              <span className="font-semibold text-accent block mb-0.5">💰 ₦10,000 Commission</span>
              Paid after verification that client payment is confirmed in the company account.
            </div>

            <div className="p-3 rounded-lg bg-muted/60 border border-border/80">
              <span className="font-semibold text-accent block mb-0.5">⏰ Daily Report Deadline</span>
              Submit your report by 6:30 PM every evening without fail.
            </div>

            <div className="p-3 rounded-lg bg-muted/60 border border-border/80">
              <span className="font-semibold text-accent block mb-0.5">🚫 Zero Private Follow-Ups</span>
              All clients belong to Campus Comfort. Keep all transactions strictly on-record.
            </div>

            <Link to="/dashboard/agent/code-of-conduct" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Review Full Code of Conduct
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Daily Report Submission Page (Matching Campus Comfort Daily Report Template)
function AgentDailyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<AgentDailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [campusArea, setCampusArea] = useState(user?.user_metadata?.campus_location || "Enugu");
  const [peopleApproached, setPeopleApproached] = useState(0);
  const [successfulClientsCount, setSuccessfulClientsCount] = useState(0);
  const [totalMoneyCollected, setTotalMoneyCollected] = useState(0);
  const [notes, setNotes] = useState("");

  // Client records array
  const [clientRecords, setClientRecords] = useState<DailyReportClientRecord[]>([
    { name: "", phone: "", amount: 0, location: "" }
  ]);

  useEffect(() => {
    if (user) {
      agentsApi.getDailyReports(user.id).then(rep => {
        setReports(rep);
        setLoading(false);
      });
    }
  }, [user]);

  const addClientRow = () => {
    setClientRecords(prev => [...prev, { name: "", phone: "", amount: 0, location: "" }]);
  };

  const removeClientRow = (index: number) => {
    setClientRecords(prev => prev.filter((_, i) => i !== index));
  };

  const updateClientRow = (index: number, field: keyof DailyReportClientRecord, value: any) => {
    setClientRecords(prev =>
      prev.map((rec, i) => (i === index ? { ...rec, [field]: value } : rec))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      // Filter out blank client rows
      const validClients = clientRecords.filter(c => c.name.trim() !== "");

      const submitted = await agentsApi.submitDailyReport({
        agent_id: user.id,
        agent_name: user.user_metadata?.full_name || user.email || "Agent",
        phone: user.user_metadata?.phone || "",
        campus_area: campusArea,
        report_date: reportDate,
        people_approached: Number(peopleApproached) || 0,
        successful_clients_count: validClients.length || Number(successfulClientsCount) || 0,
        total_money_collected: Number(totalMoneyCollected) || 0,
        client_records: validClients,
        notes: notes
      });

      toast.success("Daily Report submitted successfully!");
      setReports(prev => [submitted, ...prev]);

      // Reset form
      setNotes("");
      setPeopleApproached(0);
      setSuccessfulClientsCount(0);
      setTotalMoneyCollected(0);
      setClientRecords([{ name: "", phone: "", amount: 0, location: "" }]);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit daily report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-accent" />
          Agent Daily Report Submission
        </h1>
        <p className="text-sm text-muted-foreground">
          Official Campus Comfort Daily Report. Submit your report to the administration every evening by 6:30 PM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Form */}
        <Card className="lg:col-span-2 border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Submit Today's Field Report</CardTitle>
            <CardDescription className="text-xs">
              Fill in your outreach results and any successful student client payments.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportDate">Report Date</Label>
                  <Input
                    id="reportDate"
                    type="date"
                    value={reportDate}
                    onChange={e => setReportDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campusArea">Campus / Territory Area</Label>
                  <Input
                    id="campusArea"
                    value={campusArea}
                    onChange={e => setCampusArea(e.target.value)}
                    placeholder="e.g. UNN Nsukka / UNEC Enugu"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peopleApproached">Number of People Approached</Label>
                  <Input
                    id="peopleApproached"
                    type="number"
                    value={peopleApproached}
                    onChange={e => setPeopleApproached(Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="successfulClientsCount">Successful Clients Count</Label>
                  <Input
                    id="successfulClientsCount"
                    type="number"
                    value={successfulClientsCount}
                    onChange={e => setSuccessfulClientsCount(Number(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalMoneyCollected">Total Money Collected (₦)</Label>
                  <Input
                    id="totalMoneyCollected"
                    type="number"
                    value={totalMoneyCollected}
                    onChange={e => setTotalMoneyCollected(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              {/* Client Records List */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">List of Successful Clients</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addClientRow}
                    className="text-xs flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Client
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {clientRecords.map((client, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border/80 bg-muted/40 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center text-xs"
                    >
                      <Input
                        placeholder="Client Full Name"
                        value={client.name}
                        onChange={e => updateClientRow(idx, "name", e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="Phone Number"
                        value={client.phone}
                        onChange={e => updateClientRow(idx, "phone", e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="Amount (₦)"
                        type="number"
                        value={client.amount || ""}
                        onChange={e => updateClientRow(idx, "amount", Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          placeholder="Location / Area"
                          value={client.location}
                          onChange={e => updateClientRow(idx, "location", e.target.value)}
                          className="h-8 text-xs"
                        />
                        {clientRecords.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeClientRow(idx)}
                            className="h-8 w-8 text-destructive shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Problems / Observations / Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Report any challenges, landlord updates, or notes for the administration."
                  rows={3}
                />
              </div>
            </CardContent>

            <CardFooter className="border-t border-border pt-4 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Submission goes directly to Campus Comfort admin records.
              </span>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Daily Report"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Previous Reports List */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">History ({reports.length})</CardTitle>
            <CardDescription className="text-xs">Your past daily reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto text-xs p-4">
            {reports.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No previous reports found.</p>
            ) : (
              reports.map(rep => (
                <div key={rep.id} className="p-3 rounded-xl border border-border/70 bg-muted/30 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">
                      {new Date(rep.report_date).toLocaleDateString()}
                    </span>
                    <Badge className="bg-accent/15 text-accent border-accent/20 text-[10px]">
                      {rep.campus_area}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Approached: {rep.people_approached}</span>
                    <span>Clients: {rep.successful_clients_count}</span>
                    <span className="font-semibold text-foreground">
                      ₦{(rep.total_money_collected || 0).toLocaleString()}
                    </span>
                  </div>
                  {rep.notes && (
                    <p className="text-muted-foreground italic text-[11px] truncate">
                      "{rep.notes}"
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Code of Conduct Reference
function AgentCodeOfConduct() {
  return (
    <Card className="max-w-3xl mx-auto border-border shadow-md">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 rounded-full bg-accent/15 text-accent mx-auto flex items-center justify-center mb-2">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">Campus Comfort Staff & Agent Code of Conduct</CardTitle>
        <CardDescription className="text-xs">
          Permanent reference copy of company policies and guidelines.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed">
        <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/20 text-xs">
          <strong>Core Rule:</strong> All clients and all payments belong strictly to Campus Comfort. Violation of company rules leads to immediate dismissal and recovery of any funds involved.
        </div>

        <div className="space-y-3 text-xs md:text-sm">
          <div className="p-3 rounded-lg border border-border">
            <h4 className="font-semibold text-accent mb-1">1. Ownership of Clients & Monies</h4>
            <p className="text-muted-foreground">
              Every staff member must report every interested client and every payment to the administration the same day with: full name, phone number, preferred location, amount paid, and clear proof of payment.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border">
            <h4 className="font-semibold text-accent mb-1">2. ₦10,000 Client Commission</h4>
            <p className="text-muted-foreground">
              Commission of <strong>₦10,000 per successful client</strong> is paid promptly once the company confirms that the agreed rent/deposit is verified in the company account.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border">
            <h4 className="font-semibold text-accent mb-1">3. Ban on Private Client Numbers</h4>
            <p className="text-muted-foreground">
              Agents are strictly prohibited from retaining client phone numbers privately or engaging in private business after the first meeting. All follow-ups must be channeled through the company.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border">
            <h4 className="font-semibold text-accent mb-1">4. Compulsory Daily Reporting</h4>
            <p className="text-muted-foreground">
              Daily reports are mandatory every day by 6:30 PM. Failure to file daily reports will result in withholding of commission for that period.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Clients Tracker Subpage
function AgentClientsTracker() {
  const { user } = useAuth();
  const [reports, setReports] = useState<AgentDailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      agentsApi.getDailyReports(user.id).then(rep => {
        setReports(rep);
        setLoading(false);
      });
    }
  }, [user]);

  // Flatten client records from daily reports
  const allClients = reports.flatMap(rep =>
    (rep.client_records || []).map(client => ({
      ...client,
      reportDate: rep.report_date,
      campusArea: rep.campus_area
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            My Accommodation Clients
          </h1>
          <p className="text-sm text-muted-foreground">
            Records of student clients you have introduced to Campus Comfort.
          </p>
        </div>
        <Badge className="bg-accent/20 text-accent border-accent/30 font-semibold px-3 py-1">
          {allClients.length} Total Clients
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Campus Area</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Commission Due</TableHead>
                  <TableHead>Date Reported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      No client records found. Submit client details in your Daily Reports!
                    </TableCell>
                  </TableRow>
                ) : (
                  allClients.map((client, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-sm">{client.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{client.phone || "N/A"}</TableCell>
                      <TableCell className="text-xs">{client.location || client.campusArea}</TableCell>
                      <TableCell className="text-xs font-medium">₦{(client.amount || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-bold text-accent">₦10,000</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(client.reportDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AgentDashboard() {
  return (
    <DashboardLayout userRole="agent">
      <Routes>
        <Route index element={<AgentOverview />} />
        <Route path="daily-reports" element={<AgentDailyReports />} />
        <Route path="clients" element={<AgentClientsTracker />} />
        <Route path="create-listing" element={<CreateListing />} />
        <Route path="properties" element={<CreateListing />} />
        <Route path="code-of-conduct" element={<AgentCodeOfConduct />} />
        <Route path="*" element={<AgentOverview />} />
      </Routes>
    </DashboardLayout>
  );
}
