import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { SystemAlerts } from "@/components/admin/SystemAlerts";
import { QuickActionsCard } from "@/components/admin/QuickActionsCard";
import { Building, Users, UserCheck, DollarSign, Eye, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import admin dashboard pages
import AdminAnalytics from "../admin/AdminAnalytics";
import AdminUsers from "../admin/AdminUsers";

import AdminProperties from "../admin/AdminProperties";
import AdminCreateListing from "../admin/AdminCreateListing";
import AdminEditListing from "../admin/AdminEditListing";
import AdminSettings from "../admin/AdminSettings";
import AdminTransactions from "../admin/AdminTransactions";
import AdminReports from "../admin/AdminReports";
// Removed AdminSystem import as it's not needed

// Import KYC Management component
import { AgentKYCManagement } from "@/components/admin/AgentKYCManagement";

// Import new feature components
import SecurityCompliance from "@/components/security/SecurityCompliance";
import PaymentManager from "@/components/payments/PaymentManager";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import AdminProfile from "../admin/AdminProfile";
import { LocationManagement } from "@/components/admin/LocationManagement";

interface Activity {
  id: string;
  type: "property" | "user" | "transaction" | "message";
  title: string;
  description: string;
  timestamp: Date;
  status?: "pending" | "completed" | "cancelled";
}

function AdminDashboardHome() {
  const [timeRange, setTimeRange] = useState('30d');
  const { stats, loading, error } = useDashboardStats(timeRange);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const getStat = (name: string) => {
    const stat = stats.find(s => s.stat_name === name);
    return {
      value: stat?.stat_value || '0',
      description: stat?.compare_text || 'No change from last month'
    };
  };

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setActivitiesLoading(true);

        // Fetch recent user registrations
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('id, email, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent properties
        const { data: recentProperties } = await supabase
          .from('properties')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent transactions
        const { data: recentTransactions } = await supabase
          .from('payment_transactions')
          .select('id, amount, created_at, status')
          .order('created_at', { ascending: false })
          .limit(3);

        // Combine and format activities
        const activities: Activity[] = [];

        // Add recent user registrations
        recentUsers?.forEach(user => {
          activities.push({
            id: user.id,
            type: "user",
            title: "New User Registration",
            description: `User ${user.email} joined the platform`,
            timestamp: new Date(user.created_at),
            status: "completed"
          });
        });

        // Add recent properties
        recentProperties?.forEach(property => {
          activities.push({
            id: property.id,
            type: "property",
            title: "New Property Listed",
            description: property.title || "Unnamed property",
            timestamp: new Date(property.created_at),
            status: "completed"
          });
        });

        // Add recent transactions
        recentTransactions?.forEach(transaction => {
          activities.push({
            id: transaction.id,
            type: "transaction",
            title: "Transaction Processed",
            description: `Amount: ₦${transaction.amount?.toLocaleString() || '0'}`,
            timestamp: new Date(transaction.created_at),
            status: transaction.status as "pending" | "completed" | "cancelled" || "completed"
          });
        });

        // Sort by timestamp and take the most recent 5
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecentActivities(activities.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setRecentActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={getStat('total_users').value}
          description={getStat('total_users').description}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Total Properties"
          value={getStat('total_properties').value}
          description={getStat('total_properties').description}
          icon={Building}
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={getStat('active_agents').value}
          description={getStat('active_agents').description}
          icon={UserCheck}
          loading={loading}
        />
        <StatCard
          title="Revenue"
          value={getStat('total_revenue').value}
          description={getStat('total_revenue').description}
          icon={DollarSign}
          loading={loading}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Properties"
          value={getStat('pending_properties').value}
          description="Properties awaiting approval"
          icon={Building}
          loading={loading}
        />
        <StatCard
          title="Total Transactions"
          value={getStat('total_transactions').value}
          description="Completed transactions"
          icon={DollarSign}
          loading={loading}
        />
        <StatCard
          title="Today's Views"
          value={getStat('today_views').value}
          description="Property views today"
          icon={Eye}
          loading={loading}
        />
        <StatCard
          title="Conversion Rate"
          value={getStat('conversion_rate').value}
          description="Inquiry to transaction rate"
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <AnalyticsCharts timeRange={timeRange} />
        </div>
        <div className="col-span-3">
          <RecentActivity activities={recentActivities} loading={activitiesLoading} />
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="grid gap-4 md:grid-cols-1">
        <QuickActionsCard />
      </div>

      <SystemAlerts />
    </div>
  );
}

export function AdminDashboard() {
  console.log("AdminDashboard rendering");
  return (
    <DashboardLayout userRole="admin">
      <Routes>
        <Route index element={<AdminDashboardHome />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="users" element={<AdminUsers />} />
        {/* Remove the agents route */}
        <Route path="properties" element={<AdminProperties />} />
        <Route path="properties/create" element={<AdminCreateListing />} />
        <Route path="properties/edit/:id" element={<AdminEditListing />} />
        <Route path="create-listing" element={<AdminCreateListing />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="reports" element={<AdminReports />} />
        {/* Removed system route as it's not needed */}
        <Route path="settings" element={<AdminSettings />} />

        {/* KYC Management Route */}
        <Route path="kyc" element={<AgentKYCManagement />} />

        {/* New Feature Routes */}
        <Route path="security" element={<SecurityCompliance />} />
        <Route path="payments" element={<PaymentManager />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="locations" element={<LocationManagement />} />
      </Routes>
    </DashboardLayout>
  );
}
