import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Building,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { agentsApi, AgentBankDetails } from "@/lib/api/agents";

const formSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().min(10, "Please provide a valid phone number (10+ digits)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  campusLocation: z.string().min(2, "Please select or enter your primary campus/city"),
  institution: z.string().min(2, "Institution or university affiliation is required"),
  address: z.string().min(5, "Residential address is required"),
  agreeCodeOfConduct: z.boolean().refine(val => val === true, "You must accept the Code of Conduct"),
  digitalSignature: z.string().min(3, "Please type your full legal name as your digital signature"),
  paymentReference: z.string().min(3, "Transfer reference or Transaction ID is required"),
  paymentSenderName: z.string().min(3, "Sender account name is required"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const CAMPUS_LOCATIONS = [
  "Akwa Ibom (AKSU / UniUyo)",
  "Ikot Akpaden (AKSU Main Campus)",
  "Obio Akpa (AKSU Campus)",
  "Enugu (UNN / UNEC / ESUT)",
  "Calabar (UNICAL / CRUTECH)",
  "Lagos (UNILAG / LASU)",
  "Abuja (UniAbuja / Baze / Nile)",
  "Anambra (UNIZIK / COOU)",
  "Other Campus / City"
];

export default function BecomeAnAgent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [bankDetails, setBankDetails] = useState<AgentBankDetails>({
    bankName: "Moniepoint MFB",
    accountNumber: "8032145678",
    accountName: "Campus Comfort Real Estate Ltd",
    registrationFee: 2000,
    instructions: "Transfer the ₦2,000 registration fee to the official account. Use your full name as payment narration/reference."
  });
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      campusLocation: "Akwa Ibom (AKSU / UniUyo)",
      institution: "AKWA IBOM STATE UNIVERSITY",
      address: "",
      agreeCodeOfConduct: false,
      digitalSignature: "",
      paymentReference: "",
      paymentSenderName: "",
    },
    mode: "onChange"
  });

  const values = watch();

  useEffect(() => {
    agentsApi.getBankDetails().then(details => {
      if (details) setBankDetails(details);
    });
  }, []);

  const handleCopyAccount = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bankDetails.accountNumber);
      setCopiedAccount(true);
      toast.success("Account number copied to clipboard!");
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger(["fullName", "email", "phone", "password", "confirmPassword", "campusLocation", "institution", "address"]);
      if (!isValid) {
        toast.error("Please complete all required fields accurately.");
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2) {
      const isValid = await trigger(["agreeCodeOfConduct", "digitalSignature"]);
      if (!isValid) {
        toast.error("You must accept the Code of Conduct and provide your digital signature.");
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Sign up user in Supabase auth (role: agent)
      let userId: string | undefined = undefined;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            first_name: data.fullName.split(" ")[0] || data.fullName,
            phone: data.phone,
            role: "agent",
            user_type: "agent",
            campus_location: data.campusLocation,
            institution: data.institution
          }
        }
      });

      if (signUpError && !signUpError.message.includes("already registered")) {
        console.warn("Auth signup error:", signUpError.message);
      } else if (signUpData?.user) {
        userId = signUpData.user.id;
      }

      // 2. Submit application record
      await agentsApi.submitApplication({
        user_id: userId,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        campus_location: data.campusLocation,
        institution: data.institution,
        code_of_conduct_agreed: data.agreeCodeOfConduct,
        payment_amount: bankDetails.registrationFee || 2000,
        payment_reference: data.paymentReference,
        payment_sender_name: data.paymentSenderName,
      });

      setSubmittedEmail(data.email);
      setCurrentStep(4);
      toast.success("Application and payment proof submitted successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Submission failed:", err);
      toast.error(err.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Become an Agent | Campus Comfort</title>
        <meta
          name="description"
          content="Join Campus Comfort as a verified accommodation agent. Earn ₦10,000 commission per student client."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 text-accent border border-accent/20 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Campus Comfort Agent Program
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Become a Verified Campus Agent
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              Partner with Campus Comfort Real Estate. Connect university students with vetted campus accommodation and earn a guaranteed <strong className="text-foreground">₦10,000 commission</strong> per successful client.
            </p>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-2xl mx-auto text-center">
            {[
              { num: 1, label: "Profile" },
              { num: 2, label: "Code of Conduct" },
              { num: 3, label: "Registration Fee" },
              { num: 4, label: "Approval" }
            ].map(step => (
              <div key={step.num} className="space-y-1.5">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep >= step.num ? "bg-accent" : "bg-muted"
                  }`}
                />
                <span
                  className={`text-xs font-medium block truncate ${
                    currentStep === step.num
                      ? "text-accent font-semibold"
                      : currentStep > step.num
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* STEP 1: Personal & Campus Information */}
            {currentStep === 1 && (
              <Card className="border-border shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="h-5 w-5 text-accent" />
                    Step 1: Agent & Campus Profile
                  </CardTitle>
                  <CardDescription>
                    Provide your legal contact information and university jurisdiction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Legal Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="e.g. Chukwuma Obi"
                        {...register("fullName")}
                        className={errors.fullName ? "border-destructive" : ""}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-destructive">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="agent@example.com"
                        {...register("email")}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (WhatsApp Active) *</Label>
                      <Input
                        id="phone"
                        placeholder="e.g. 08012345678"
                        {...register("phone")}
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="campusLocation">Assigned Campus / Territory *</Label>
                      <select
                        id="campusLocation"
                        {...register("campusLocation")}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        {CAMPUS_LOCATIONS.map(loc => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                      {errors.campusLocation && (
                        <p className="text-xs text-destructive">{errors.campusLocation.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="institution">Higher Institution / University *</Label>
                      <Input
                        id="institution"
                        placeholder="e.g. AKWA IBOM STATE UNIVERSITY"
                        {...register("institution")}
                        className={errors.institution ? "border-destructive" : ""}
                      />
                      {errors.institution && (
                        <p className="text-xs text-destructive">{errors.institution.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Current Residential Address *</Label>
                      <Input
                        id="address"
                        placeholder="e.g. 15 University Market Road, Nsukka"
                        {...register("address")}
                        className={errors.address ? "border-destructive" : ""}
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive">{errors.address.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                    <div className="space-y-2">
                      <Label htmlFor="password">Create Account Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 6 characters"
                        {...register("password")}
                        className={errors.password ? "border-destructive" : ""}
                      />
                      {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        {...register("confirmPassword")}
                        className={errors.confirmPassword ? "border-destructive" : ""}
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-border pt-4">
                  <div className="text-xs text-muted-foreground">
                    Already registered? <Link to="/agent-login" className="text-accent underline font-medium">Agent Login</Link>
                  </div>
                  <Button type="button" onClick={handleNextStep} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-2">
                    Next: Code of Conduct
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 2: Code of Conduct Agreement */}
            {currentStep === 2 && (
              <Card className="border-border shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                    Step 2: Staff & Agent Code of Conduct
                  </CardTitle>
                  <CardDescription>
                    Please review company operational rules before proceeding with registration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-muted/60 border border-border/80 text-sm space-y-4 max-h-80 overflow-y-auto leading-relaxed">
                    <div className="font-bold text-foreground text-center border-b border-border pb-2 uppercase tracking-wide">
                      Campus Comfort Real Estate — Official Agent Agreement
                    </div>
                    <p className="text-muted-foreground text-xs italic">
                      This document sets out the rules that every field agent and staff member of Campus Comfort must strictly follow. All clients and payments belong to the company.
                    </p>

                    <div className="space-y-3 text-xs md:text-sm text-foreground">
                      <div className="p-2.5 rounded-lg bg-background border border-border/60">
                        <span className="font-semibold text-accent block mb-1">1. Company Ownership of Clients & Monies</span>
                        All clients and all payments belong strictly to Campus Comfort. Any attempt to hide a client, divert a client for personal gain, or collect money off-record will lead to immediate dismissal and recovery.
                      </div>

                      <div className="p-2.5 rounded-lg bg-background border border-border/60">
                        <span className="font-semibold text-accent block mb-1">2. ₦10,000 Commission Policy</span>
                        A commission of <strong>₦10,000 per successful client</strong> is paid only after confirmation that the agreed rent/deposit is verified in the company account.
                      </div>

                      <div className="p-2.5 rounded-lg bg-background border border-border/60">
                        <span className="font-semibold text-accent block mb-1">3. Mandatory Daily Reporting</span>
                        Every agent is required to submit a daily activity report every day by 6:30 PM detailing people approached, successful clients, amounts paid, and campus location.
                      </div>

                      <div className="p-2.5 rounded-lg bg-background border border-border/60">
                        <span className="font-semibold text-accent block mb-1">4. Prohibited Private Communications</span>
                        Agents are not allowed to keep client phone numbers privately or continue private transactions after the initial meeting. All official communication and follow-up must go through company channels.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-start space-x-3 p-3.5 rounded-lg border border-accent/30 bg-accent/5">
                      <Checkbox
                        id="agreeCodeOfConduct"
                        checked={values.agreeCodeOfConduct}
                        onCheckedChange={(checked) => setValue("agreeCodeOfConduct", checked === true)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="agreeCodeOfConduct" className="text-sm font-medium leading-normal cursor-pointer">
                        I, <strong>{values.fullName || "the applicant"}</strong>, hereby solemnly agree to all the terms, policies, and rules of the Campus Comfort Staff Code of Conduct.
                      </Label>
                    </div>
                    {errors.agreeCodeOfConduct && (
                      <p className="text-xs text-destructive">{errors.agreeCodeOfConduct.message}</p>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="digitalSignature">Digital Signature (Type your Full Legal Name) *</Label>
                      <Input
                        id="digitalSignature"
                        placeholder="Type full legal name to sign"
                        {...register("digitalSignature")}
                        className={errors.digitalSignature ? "border-destructive font-serif" : "font-serif"}
                      />
                      {errors.digitalSignature && (
                        <p className="text-xs text-destructive">{errors.digitalSignature.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-border pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button type="button" onClick={handleNextStep} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-2">
                    Next: Registration Fee
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 3: Registration Fee & Payment Proof */}
            {currentStep === 3 && (
              <Card className="border-border shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-accent" />
                    Step 3: Registration Fee & Verification
                  </CardTitle>
                  <CardDescription>
                    Pay the ₦2,000 onboarding fee to the official Campus Comfort bank account to initiate administrative approval.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bank Details Display Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/95 to-primary text-primary-foreground shadow-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-semibold">
                          Official Campus Comfort Bank Account
                        </span>
                        <h3 className="text-2xl font-bold text-accent mt-0.5">
                          ₦{(bankDetails.registrationFee || 2000).toLocaleString()}
                        </h3>
                      </div>
                      <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                        One-Time Onboarding Fee
                      </Badge>
                    </div>

                    <Separator className="bg-primary-foreground/20" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-primary-foreground/70 text-xs block">Bank Name</span>
                        <span className="font-semibold text-base">{bankDetails.bankName}</span>
                      </div>
                      <div>
                        <span className="text-primary-foreground/70 text-xs block">Account Name</span>
                        <span className="font-semibold text-base">{bankDetails.accountName}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/15 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-primary-foreground/70 block">Account Number</span>
                        <span className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-accent">
                          {bankDetails.accountNumber}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCopyAccount}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold flex items-center gap-1.5"
                      >
                        {copiedAccount ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>{copiedAccount ? "Copied" : "Copy"}</span>
                      </Button>
                    </div>

                    <p className="text-xs text-primary-foreground/80 leading-relaxed bg-black/20 p-2.5 rounded-lg">
                      💡 <strong>Narration Notice:</strong> {bankDetails.instructions || "Please use your Full Name as your transfer narration or reference so our admin can reconcile and approve your account quickly."}
                    </p>
                  </div>

                  {/* Payment Proof Fields */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      Payment Confirmation Details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentSenderName">Sender Account Name *</Label>
                        <Input
                          id="paymentSenderName"
                          placeholder="Name on bank account used to transfer"
                          {...register("paymentSenderName")}
                          className={errors.paymentSenderName ? "border-destructive" : ""}
                        />
                        {errors.paymentSenderName && (
                          <p className="text-xs text-destructive">{errors.paymentSenderName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentReference">Transaction Reference / Session ID *</Label>
                        <Input
                          id="paymentReference"
                          placeholder="e.g. 090267231849104812"
                          {...register("paymentReference")}
                          className={errors.paymentReference ? "border-destructive" : ""}
                        />
                        {errors.paymentReference && (
                          <p className="text-xs text-destructive">{errors.paymentReference.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-border pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        Complete & Submit Application
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 4: Application Submitted & Pending Approval */}
            {currentStep === 4 && (
              <Card className="border-border shadow-md text-center py-6">
                <CardHeader className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-accent/20 text-accent mx-auto flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-accent animate-bounce" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    Application Submitted Successfully!
                  </CardTitle>
                  <CardDescription className="max-w-md mx-auto text-sm">
                    Thank you, <strong className="text-foreground">{values.fullName}</strong>. Your registration for the <strong className="text-foreground">{values.campusLocation}</strong> territory has been received.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 max-w-md mx-auto text-left">
                  <div className="p-4 rounded-xl bg-muted/60 border border-border/80 space-y-2 text-sm">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Status</span>
                      <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                        Pending Admin Approval
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Fee Paid</span>
                      <span className="font-semibold text-foreground">₦{(bankDetails.registrationFee || 2000).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Payment Reference</span>
                      <span className="font-mono text-foreground">{values.paymentReference}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Registered Email</span>
                      <span className="text-foreground font-medium">{submittedEmail || values.email}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-2 bg-accent/5 border border-accent/20 p-3.5 rounded-lg">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      What happens next?
                    </div>
                    <p>
                      1. The Campus Comfort admin will verify your ₦2,000 payment and territory assignment.
                    </p>
                    <p>
                      2. Once approved, your agent credentials will activate immediately and you will receive full access to the <strong>Agent Dashboard</strong>.
                    </p>
                    <p>
                      3. You can check your approval status at any time by signing in to the Agent Portal.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 border-t border-border pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    Return to Homepage
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate("/agent-login")}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  >
                    Go to Agent Login & Status Check
                  </Button>
                </CardFooter>
              </Card>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
