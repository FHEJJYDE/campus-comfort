import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";

// Pages - Lazy loaded for better performance
const Index = lazy(() => import("./pages/Index"));
const PropertyListings = lazy(() => import("./pages/PropertyListings"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const ListProperty = lazy(() => import("./pages/ListProperty"));
const ListPropertyProtected = lazy(() => import("./pages/ListPropertyProtected"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Navigation = lazy(() => import("./components/layout/Navigation"));
const Footer = lazy(() => import("./components/layout/Footer"));
// PWA Components
const PWAInstallPrompt = lazy(() => import("./components/PWAInstallPrompt"));


// Dashboard Pages
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const UserDashboard = lazy(() => import("./pages/dashboard/UserDashboard").then(module => ({ default: module.UserDashboard })));
const AgentDashboard = lazy(() => import("./pages/dashboard/AgentDashboard").then(module => ({ default: module.AgentDashboard })));

// Admin Pages
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTransactions = lazy(() => import("./pages/admin/AdminTransactions"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminSystem = lazy(() => import("./pages/admin/AdminSystem"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));

// Auth Pages
const Login = lazy(() => import("./pages/Login"));
const UserLogin = lazy(() => import("./pages/auth/UserLogin"));
const UserSignup = lazy(() => import("./pages/auth/UserSignup"));
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin"));
const AgentLogin = lazy(() => import("./pages/auth/AgentLogin"));
const BecomeAnAgent = lazy(() => import("./pages/auth/BecomeAnAgent"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Context Providers
import { AuthProvider, RequireAuth } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LoadingWrapper } from "./components/layout/LoadingWrapper";
import RouteWrapper from "./components/layout/RouteWrapper";

// PWA Components
const PWALayout = lazy(() => import("./components/layout/PWALayout").then(module => ({ default: module.PWALayout })));

// Loading component for Suspense
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-realty-gold"></div>
  </div>
);

const App = () => {
  // Create QueryClient instance inside the component
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  // Add debugging to see which routes are being matched
  const location = useLocation();
  console.log("Current location:", location.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LoadingWrapper initialLoading={true} loadingDelay={2500}>
          <AuthProvider>
            <ThemeProvider>
              <CurrencyProvider>
                <Suspense fallback={<LoadingComponent />}>
                  <PWALayout>
                    <Routes>
                      {/* Authentication routes with navigation but no footer */}
                      <Route path="/login" element={<RouteWrapper includeAuthNavigation={true} includeFooter={false}><Login /></RouteWrapper>} />
                      <Route path="/user-login" element={<RouteWrapper includeAuthNavigation={true} includeFooter={false}><UserLogin /></RouteWrapper>} />
                      <Route path="/user-signup" element={<RouteWrapper includeAuthNavigation={true} includeFooter={false}><UserSignup /></RouteWrapper>} />
                      <Route path="/signup" element={<RouteWrapper includeAuthNavigation={true} includeFooter={false}><UserSignup /></RouteWrapper>} />
                      <Route path="/admin-login" element={<RouteWrapper includeAuthNavigation={true} includeFooter={false}><AdminLogin /></RouteWrapper>} />
                      <Route path="/agent-login" element={<RouteWrapper includeAuthNavigation={true} includeFooter={false}><AgentLogin /></RouteWrapper>} />
                      <Route path="/forgot-password" element={<RouteWrapper includeAuthNavigation={true} includeFooter={false}><ForgotPassword /></RouteWrapper>} />
                      <Route path="/reset-password" element={<RouteWrapper includeAuthNavigation={true} includeFooter={false}><ResetPassword /></RouteWrapper>} />

                      {/* Dashboard routes without header/footer */}
                      <Route
                        path="/admin-dashboard/*"
                        element={
                          <RouteWrapper includeNavigation={false} includeFooter={false}>
                            <RequireAuth requiredUserType="admin">
                              <AdminDashboard />
                            </RequireAuth>
                          </RouteWrapper>
                        }
                      />
                      <Route
                        path="/agent-dashboard/*"
                        element={
                          <RouteWrapper includeNavigation={false} includeFooter={false}>
                            <RequireAuth requiredUserType="agent">
                              <AgentDashboard />
                            </RequireAuth>
                          </RouteWrapper>
                        }
                      />
                      <Route
                        path="/user-dashboard/*"
                        element={
                          <RouteWrapper includeNavigation={false} includeFooter={false}>
                            <RequireAuth requiredUserType="user">
                              <UserDashboard />
                            </RequireAuth>
                          </RouteWrapper>
                        }
                      />

                      {/* New dashboard routes matching sidebar structure */}
                      <Route
                        path="/dashboard/admin/*"
                        element={
                          <RouteWrapper includeNavigation={false} includeFooter={false}>
                            <RequireAuth requiredUserType="admin">
                              <AdminDashboard />
                            </RequireAuth>
                          </RouteWrapper>
                        }
                      />
                      <Route
                        path="/dashboard/agent/*"
                        element={
                          <RouteWrapper includeNavigation={false} includeFooter={false}>
                            <RequireAuth requiredUserType="agent">
                              <AgentDashboard />
                            </RequireAuth>
                          </RouteWrapper>
                        }
                      />
                      <Route
                        path="/dashboard/user/*"
                        element={
                          <RouteWrapper includeNavigation={false} includeFooter={false}>
                            <RequireAuth requiredUserType="user">
                              <UserDashboard />
                            </RequireAuth>
                          </RouteWrapper>
                        }
                      />

                      {/* Preview routes for dashboards (no authentication required */}
                      <Route path="/preview/dashboard/admin/*" element={<RouteWrapper includeNavigation={false} includeFooter={false}><AdminDashboard /></RouteWrapper>} />
                      <Route path="/preview/dashboard/agent/*" element={<RouteWrapper includeNavigation={false} includeFooter={false}><AgentDashboard /></RouteWrapper>} />
                      <Route path="/preview/dashboard/user/*" element={<RouteWrapper includeNavigation={false} includeFooter={false}><UserDashboard /></RouteWrapper>} />

                      {/* Public routes with header/footer */}
                      <Route path="/" element={<RouteWrapper><Index /></RouteWrapper>} />
                      <Route path="/become-an-agent" element={<RouteWrapper><BecomeAnAgent /></RouteWrapper>} />
                      <Route path="/agent-registration" element={<RouteWrapper><BecomeAnAgent /></RouteWrapper>} />
                      <Route path="/properties" element={<RouteWrapper><PropertyListings /></RouteWrapper>} />
                      <Route path="/properties/:id" element={<RouteWrapper><PropertyDetails /></RouteWrapper>} />
                      <Route path="/list-property" element={<RouteWrapper><ListProperty /></RouteWrapper>} />
                      <Route
                        path="/list-property-protected"
                        element={
                          <RouteWrapper>
                            <RequireAuth>
                              <ListPropertyProtected />
                            </RequireAuth>
                          </RouteWrapper>
                        }
                      />
                      <Route path="*" element={<RouteWrapper><NotFound /></RouteWrapper>} />
                    </Routes>
                  </PWALayout>
                </Suspense>
              </CurrencyProvider>
            </ThemeProvider>
          </AuthProvider>
        </LoadingWrapper>
        <PWAInstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;