import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Heart, Eye, MessageSquare, Calendar, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchUserDashboardStats,
  fetchUserRecentActivities,
  fetchUserProperties,
  fetchUserSavedProperties
} from "@/utils/supabaseData";
import { toast } from "sonner";

// Import user dashboard pages
import UserProperties from "../user/UserProperties";
import UserMessages from "../user/UserMessages";
import UserAppointments from "../user/UserAppointments";
import UserSaved from "../user/UserSaved";
import UserProfile from "../user/UserProfile";
import UserKYC from "../user/UserKYC";

// Import new feature components
import NotificationCenter from "@/components/notifications/NotificationCenter";
import UnifiedSearchHistory from "@/components/searches/UnifiedSearchHistory";
import PaymentManager from "@/components/payments/PaymentManager";
import UnifiedMessaging from "@/components/messages/UnifiedMessaging";

// Import KYC components
import { KYCStatusDisplay } from "@/components/kyc/KYCStatusDisplay";

function UserDashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [kycSubmission, setKycSubmission] = useState<any | null>(null);
  const [kycLoading, setKycLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      fetchKYCSubmission();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [statsData, activitiesData, savedPropertiesData] = await Promise.all([
        fetchUserDashboardStats(user!.id),
        fetchUserRecentActivities(user!.id),
        fetchUserSavedProperties(user!.id)
      ]);

      setStats(statsData);
      setRecentActivities(activitiesData);
      setSavedProperties(savedPropertiesData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      toast.error("Failed to load dashboard data: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchKYCSubmission = async () => {
    try {
      setKycLoading(true);
      const { data, error } = await supabase
        .from('student_kyc')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - not an error in this case
        console.error('Error fetching KYC submission:', error);
        return;
      }

      setKycSubmission(data);
    } catch (error) {
      console.error('Error fetching KYC submission:', error);
    } finally {
      setKycLoading(false);
    }
  };

  const getStat = (name: string) => {
    const stat = stats?.find(s => s.stat_name === name);
    return {
      value: stat?.stat_value || '0',
      description: stat?.compare_text || 'No data available'
    };
  };

  if (!user) {
    return <div>Please log in to view your dashboard</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {user.email?.split('@')[0] || 'User'}</h1>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Saved Properties"
          value={getStat('user_saved_properties').value}
          description={getStat('user_saved_properties').description}
          icon={Heart}
          loading={loading}
        />
        <StatCard
          title="Listed Properties"
          value={getStat('user_listed_properties').value}
          description={getStat('user_listed_properties').description}
          icon={Home}
          loading={loading}
        />
        <StatCard
          title="Property Views"
          value={getStat('user_property_views').value}
          description={getStat('user_property_views').description}
          icon={Eye}
          loading={loading}
        />
        <StatCard
          title="Inquiries Sent"
          value={getStat('user_inquiries_sent').value}
          description={getStat('user_inquiries_sent').description}
          icon={MessageSquare}
          loading={loading}
        />
        <StatCard
          title="Scheduled Tours"
          value={getStat('user_scheduled_tours').value}
          description={getStat('user_scheduled_tours').description}
          icon={Calendar}
          loading={loading}
        />
      </div>

      {/* KYC Status Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Identity Verification Status</h3>
        {kycLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <KYCStatusDisplay submission={kycSubmission} />
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Saved Properties</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading saved properties...</div>
              ) : savedProperties.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  You haven't saved any properties yet. Start browsing to find your perfect home!
                </div>
              ) : (
                <div className="space-y-3">
                  {savedProperties.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      {item.property?.images?.[0] ? (
                        <img
                          src={item.property.images[0]}
                          alt={item.property.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Heart className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.property?.title || 'Untitled Property'}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved on {new Date(item.added_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <RecentActivity activities={recentActivities} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export function UserDashboard() {
  return (
    <DashboardLayout userRole="user">
      <Routes>
        <Route index element={<UserDashboardHome />} />
        <Route path="properties" element={<UserProperties />} />
        <Route path="messages" element={<UnifiedMessaging />} />
        <Route path="appointments" element={<UserAppointments />} />
        <Route path="saved" element={<UserSaved />} />
        {/* Removed history route since it's included in the searches page */}
        <Route path="searches" element={<UnifiedSearchHistory />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="payments" element={<PaymentManager />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="kyc" element={<UserKYC />} />
      </Routes>
    </DashboardLayout>
  );
}
