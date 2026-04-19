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
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const signupFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions."
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof signupFormSchema>) => {
    setIsLoading(true);
    try {
      // For now, we'll simulate a signup
      console.log("Signup submitted:", values);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Account created successfully!",
        description: "Welcome to Campus Comfort. You can now log in.",
      });

      // Redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "There was a problem creating your account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up | Campus Comfort</title>
      </Helmet>

      <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {/* Left Side - Image with GD Logo Animation */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/auth/auth-bg.jpg')" }} />

          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />

          {/* Animated Campus Comfort Logo */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative group mb-8">
              <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 p-10">
                <img
                  src="/campus-comfort-logo.png"
                  alt="Campus Comfort"
                  className="w-full h-auto brightness-0 invert"
                />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-white/10 animate-ping" />
              <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-transparent rounded-2xl blur-xl animate-pulse" />
            </div>

            <h1 className="text-4xl font-bold mb-4 text-center">
              Welcome to <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Campus Comfort</span>
            </h1>

            <p className="text-xl text-white/90 text-center max-w-md">
              Join thousands of professionals managing their real estate business with us
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
                <Link to="/" className="flex items-center group">
                  <img
                    src="/campus-comfort-logo.png"
                    alt="Campus Comfort"
                    className="h-14 sm:h-16 w-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </div>

              <div className="text-center space-y-2">
                <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Create an account
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-muted-foreground px-2">
                  Enter your information to create your Campus Comfort account
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Enter your full name"
                              className="h-10 sm:h-12 text-sm sm:text-base pl-9 sm:pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium">Email address</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Your email address"
                              type="email"
                              className="h-10 sm:h-12 text-sm sm:text-base pl-9 sm:pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Your phone number"
                              type="tel"
                              className="h-10 sm:h-12 text-sm sm:text-base pl-9 sm:pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Create a password"
                              type={showPassword ? "text" : "password"}
                              className="h-10 sm:h-12 text-sm sm:text-base pl-9 sm:pl-10 pr-10 sm:pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Confirm your password"
                              type={showConfirmPassword ? "text" : "password"}
                              className="h-10 sm:h-12 text-sm sm:text-base pl-9 sm:pl-10 pr-10 sm:pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-10 sm:h-12 w-10 sm:w-12 p-0 hover:bg-primary/10 transition-colors"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ?
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
                  <FormField
                    control={form.control}
                    name="agreeTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            I agree to the{" "}
                            <Link to="/terms" className="text-primary hover:text-primary/80 font-medium">
                              Terms and Conditions
                            </Link>{" "}
                            and{" "}
                            <Link to="/privacy" className="text-primary hover:text-primary/80 font-medium">
                              Privacy Policy
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className={cn(
                      "w-full h-10 sm:h-12 text-sm sm:text-base font-medium relative overflow-hidden transition-all duration-300 group",
                      "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                      "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                      "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    )}
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="pt-0 px-4 sm:px-6">
              <div className="text-center w-full pb-4 sm:pb-6">
                <p className="text-sm sm:text-base text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Log in
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

export default Signup;