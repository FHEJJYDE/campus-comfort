import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  PhoneCall,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { agentsApi, AgentApplication } from "@/lib/api/agents";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AgentLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingApplication, setPendingApplication] = useState<AgentApplication | null>(null);
  const [rejectedApplication, setRejectedApplication] = useState<AgentApplication | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    setPendingApplication(null);
    setRejectedApplication(null);

    try {
      // 1. Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        // If signin fails, also check if there is a pending application submitted under this email
        const appStatus = await agentsApi.getApplicationStatus(values.email);
        if (appStatus && appStatus.status === 'pending_approval') {
          setPendingApplication(appStatus);
          setIsLoading(false);
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Unable to authenticate user.");
      }

      const userId = authData.user.id;

      // 2. Check profile user_type
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, status, full_name')
        .eq('id', userId)
        .maybeSingle();

      // 3. Check application status in agent_applications
      const appStatus = await agentsApi.getApplicationStatus(values.email, userId);

      // If user profile is already an approved agent
      if (profile?.user_type === 'agent' || profile?.user_type === 'admin') {
        toast.success(`Welcome back, ${profile.full_name || 'Agent'}!`);
        navigate("/dashboard/agent");
        return;
      }

      // If application is pending
      if (appStatus?.status === 'pending_approval') {
        setPendingApplication(appStatus);
        toast.info("Your agent application is currently under admin review.");
        return;
      }

      // If application was rejected
      if (appStatus?.status === 'rejected') {
        setRejectedApplication(appStatus);
        toast.error("Your agent application was not approved.");
        return;
      }

      // If approved in application table, sync profile & proceed
      if (appStatus?.status === 'approved') {
        await supabase
          .from('profiles')
          .update({ user_type: 'agent', status: 'active' })
          .eq('id', userId);

        toast.success("Welcome to your Agent Dashboard!");
        navigate("/dashboard/agent");
        return;
      }

      // Fallback: If no application found, prompt to register
      toast.warning("No agent record found for this account. Please complete agent registration.");
      navigate("/become-an-agent");

    } catch (err: any) {
      console.error("Agent login error:", err);
      toast.error(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatusAgain = async () => {
    if (!pendingApplication) return;
    setIsLoading(true);
    try {
      const refreshed = await agentsApi.getApplicationStatus(pendingApplication.email, pendingApplication.user_id);
      if (refreshed?.status === 'approved') {
        toast.success("Congratulations! Your application has been approved!");
        navigate("/dashboard/agent");
      } else {
        toast.info("Application is still pending admin review. Please check back shortly.");
      }
    } catch {
      toast.error("Could not refresh status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Agent Portal Login | Campus Comfort</title>
        <meta name="description" content="Official login portal for verified Campus Comfort real estate agents." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <img
                src="/campus-comfort-logo.png"
                alt="Campus Comfort"
                className="h-12 w-auto mx-auto dark:brightness-0 dark:invert"
              />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold uppercase tracking-wider">
              <UserCheck className="h-3.5 w-3.5" />
              Agent Access Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Agent Sign In
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in to manage your accommodation clients, submit daily reports, and view commissions.
            </p>
          </div>

          {/* Pending Approval Alert Modal Card */}
          {pendingApplication && (
            <Card className="border-amber-500/50 bg-amber-50/80 dark:bg-amber-950/20 shadow-lg animate-in fade-in-50">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Clock className="h-5 w-5 animate-spin" />
                  <CardTitle className="text-lg">Application Under Review</CardTitle>
                </div>
                <CardDescription className="text-xs text-foreground/80">
                  Your agent application and ₦2,000 registration fee are currently being processed by the Campus Comfort admin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-background border border-border/80 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applicant Name:</span>
                    <span className="font-semibold">{pendingApplication.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campus Territory:</span>
                    <span className="font-semibold">{pendingApplication.campus_location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Reference:</span>
                    <span className="font-mono">{pendingApplication.payment_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Review Status:</span>
                    <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                      Pending Admin Approval
                    </Badge>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  As soon as the administration reconciles your payment, your account will be activated and you will gain direct access to the Agent Dashboard.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-0">
                <Button
                  onClick={checkStatusAgain}
                  disabled={isLoading}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh Approval Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPendingApplication(null)}
                  className="w-full text-xs"
                >
                  Try Another Account
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Rejected Application Card */}
          {rejectedApplication && (
            <Card className="border-destructive/50 bg-destructive/5 shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle className="text-lg">Application Not Approved</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Your application could not be verified at this time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {rejectedApplication.rejection_reason && (
                  <div className="p-3 rounded-lg bg-background border border-destructive/30 text-destructive">
                    <strong>Reason:</strong> {rejectedApplication.rejection_reason}
                  </div>
                )}
                <p className="text-muted-foreground">
                  If you believe this is an error or need assistance with your ₦2,000 payment reconciliation, please reach out to Campus Comfort support.
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link to="/become-an-agent" className="w-full">
                  <Button className="w-full bg-accent text-accent-foreground font-semibold">
                    Re-apply as Agent
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}

          {/* Login Form */}
          {!pendingApplication && !rejectedApplication && (
            <Card className="border-border shadow-md">
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Agent Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="agent@example.com"
                        className={`pl-9 ${errors.email ? "border-destructive" : ""}`}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-accent hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`pl-9 pr-9 ${errors.password ? "border-destructive" : ""}`}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold mt-2"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Verifying Agent Account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In to Agent Portal
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </CardContent>

                <CardFooter className="flex flex-col space-y-3 border-t border-border pt-4 pb-6 text-center text-xs text-muted-foreground">
                  <p>
                    Not registered as an agent yet?{" "}
                    <Link
                      to="/become-an-agent"
                      className="text-accent font-semibold hover:underline"
                    >
                      Become an Agent
                    </Link>
                  </p>
                  <p className="text-[11px]">
                    Need urgent assistance? Contact Campus Comfort support:{" "}
                    <a href="tel:+2347085101983" className="underline font-medium text-foreground">
                      (+234) 708 510 1983
                    </a>
                  </p>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
