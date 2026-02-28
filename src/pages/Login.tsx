import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet-async";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  rememberMe: z.boolean().default(false).optional(),
});

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    setIsLoading(true);
    try {
      console.log("🔐 Starting login process for:", values.email);

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        console.error("❌ Authentication failed:", authError.message);
        throw authError;
      }

      if (!authData.user) {
        console.error("❌ No user data returned from authentication");
        throw new Error("Authentication failed - no user data");
      }

      console.log("✅ Authentication successful for user:", authData.user.id);

      // Fetch user profile to determine user type
      console.log("📋 Fetching user profile...");
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, full_name')
        .eq('id', authData.user.id)
        .single();

      // Log the raw profile data for debugging
      console.log("🔍 Raw profile data:", profile);
      console.log("❌ Profile error (if any):", profileError);

      if (profileError) {
        console.error("❌ Profile fetch failed:", profileError.message);
        // Default to user dashboard if profile fetch fails
        console.log("⚠️ Defaulting to user dashboard due to profile fetch failure");
        toast({
          variant: "destructive",
          title: "Profile fetch failed",
          description: "Could not retrieve your profile. Defaulting to user dashboard.",
        });
        navigate("/dashboard/user");
        return;
      }

      console.log("✅ Profile fetched successfully:", profile);
      console.log("👤 User type:", profile.user_type);

      // Redirect based on user type
      let redirectPath = "/dashboard/user"; // default

      switch (profile.user_type) {
        case 'admin':
          redirectPath = "/dashboard/admin";
          console.log("🔄 Redirecting to admin dashboard");
          break;
        case 'agent':
          redirectPath = "/dashboard/agent";
          console.log("🔄 Redirecting to agent dashboard");
          break;
        case 'user':
        default:
          redirectPath = "/dashboard/user";
          console.log("🔄 Redirecting to user dashboard");
          break;
      }

      toast({
        title: "Login successful!",
        description: `Welcome back, ${profile.full_name || values.email}!`,
      });

      console.log("🎯 Final redirect path:", redirectPath);
      navigate(redirectPath);

    } catch (error: any) {
      console.error("❌ Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Campus Comfort</title>
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {/* Left Side - Image with GD Logo Animation */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/auth/auth-bg.jpg')" }} />

          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />

          {/* Animated GD Logo */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative group mb-8">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110">
                <span className="text-white font-bold text-4xl">GD</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-white/10 animate-ping" />
              <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-transparent rounded-2xl blur-xl animate-pulse" />
            </div>

            <h1 className="text-4xl font-bold mb-4 text-center">
              Welcome to <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Campus Comfort</span>
            </h1>

            <p className="text-xl text-white/90 text-center max-w-md">
              Sign in to access your real estate management platform
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative min-h-screen lg:min-h-0">
          {/* Mobile background for small screens */}
          <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />

          <Card className={cn(
            "w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm relative overflow-hidden",
            "transform transition-all duration-700 hover:shadow-3xl lg:hover:-translate-y-2"
          )}>
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary animate-gradient-x" />

            <CardHeader className="space-y-4 pb-6 relative px-4 sm:px-6">
              {/* Mobile logo for small screens */}
              <div className="lg:hidden flex justify-center mb-6">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <span className="text-white font-bold text-lg sm:text-xl">GD</span>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping" />
                  </div>
                  <span className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Campus Comfort
                  </span>
                </Link>
              </div>

              <div className="text-center space-y-2">
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-muted-foreground px-2">
                  Enter your credentials to access your account
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium">Email address</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Your email address"
                              type="email"
                              className="h-10 sm:h-12 text-sm sm:text-base pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Your password"
                              type={showPassword ? "text" : "password"}
                              className="h-10 sm:h-12 text-sm sm:text-base pl-10 pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-10 sm:h-12 w-10 sm:w-12 p-0 hover:bg-primary/10 transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ?
                                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary transition-colors" /> :
                                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-primary transition-colors" />
                              }
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">Remember me</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-realty-600 hover:text-realty-800 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Button
                    type="submit"
                    className={cn(
                      "w-full h-10 sm:h-12 text-sm sm:text-base font-medium relative overflow-hidden transition-all duration-300",
                      "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                      "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                      "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    )}
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="pt-0 px-4 sm:px-6">
              <div className="text-center w-full pb-4 sm:pb-6">
                <p className="text-sm sm:text-base text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-realty-600 hover:text-realty-800 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Login;