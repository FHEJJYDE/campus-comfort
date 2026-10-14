import { useMemo } from "react";
import {
  Home,
  User,
  Users,
  Building,
  Settings,
  BarChart3,
  DollarSign,
  MessageSquare,
  Heart,
  ShoppingBag,
  SearchCheck,
  Bell,
  History,
  Calendar,
  Activity,
  FileText,
  PieChart,
  Scale,
  Gem,
  LifeBuoy,
  Wrench,
  Mail,
  BellRing,
  Receipt,
  Wallet,
  CreditCard,
  Landmark,
  Building2
} from "lucide-react";

// Remove the custom IconProps interface since we're using Lucide icons directly
type NavItemWithPath = {
  title: string;
  path: string;
  icon: React.ComponentType<any>; // Use any to avoid type conflicts with Lucide icons
};

type NavItemWithSubItems = {
  title: string;
  icon: React.ComponentType<any>; // Use any to avoid type conflicts with Lucide icons
  subItems: { title: string; path: string }[];
};

export type NavItem = NavItemWithPath | NavItemWithSubItems;

export const useNavItems = (userType: "admin" | "agent" | "user"): NavItem[] => {
  const navItems = useMemo(() => {
    const commonItems: NavItem[] = [
      { title: "Dashboard", path: `/${userType}-dashboard`, icon: Home },
      { title: "Profile", path: `/${userType}-dashboard/profile`, icon: User },
      { title: "Settings", path: `/${userType}-dashboard/settings`, icon: Settings },
    ];

    if (userType === "admin") {
      return [
        ...commonItems,
        // Analytics is now integrated into the main dashboard overview
        {
          title: "Financial Management",
          icon: DollarSign,
          subItems: [
            { title: "Financial Overview", path: "/dashboard/admin/financial" },
            { title: "Sales Reports", path: "/dashboard/admin/sales" },
            { title: "Payment Processing", path: "/dashboard/admin/payments" },
          ]
        },
        {
          title: "Payment Setup",
          icon: CreditCard,
          subItems: [
            { title: "Payment Methods", path: "/dashboard/admin/payment-methods" },
          ]
        },
        { title: "Legal & Compliance", path: "/dashboard/admin/legal", icon: Scale },
        {
          title: "User Management",
          icon: Users,
          subItems: [
            { title: "Users", path: "/dashboard/admin/users" },
            { title: "Agent Applications", path: "/dashboard/admin/agents" },
          ]
        },
        {
          title: "Properties",
          path: "/dashboard/admin/properties",
          icon: Building
        },
        {
          title: "Reports",
          path: "/dashboard/admin/reports",
          icon: FileText
        },
        {
          title: "Notifications",
          path: "/dashboard/admin/notifications",
          icon: BellRing
        },
        {
          title: "System Config",
          icon: Wrench,
          subItems: [
            { title: "Email Templates", path: "/dashboard/admin/email-templates" },
            { title: "Platform Settings", path: "/dashboard/admin/platform-settings" },
            { title: "Maintenance", path: "/dashboard/admin/maintenance" },
          ]
        },
        {
          title: "Support Center",
          icon: LifeBuoy,
          subItems: [
            { title: "Support Tickets", path: "/dashboard/admin/support-tickets" },
            { title: "Knowledge Base", path: "/dashboard/admin/knowledge-base" },
            { title: "Team Chat", path: "/dashboard/admin/team-chat" },
          ]
        },
      ];
    }

    if (userType === "agent") {
      return [
        { title: "Dashboard", path: "/dashboard/agent", icon: Home },
        { title: "Daily Reports", path: "/dashboard/agent/daily-reports", icon: FileText },
        { title: "My Clients", path: "/dashboard/agent/clients", icon: Users },
        { title: "Properties", path: "/dashboard/agent/properties", icon: Building },
        { title: "Create Listing", path: "/dashboard/agent/create-listing", icon: Building2 },
        { title: "Code of Conduct", path: "/dashboard/agent/code-of-conduct", icon: Scale },
        { title: "Profile", path: "/dashboard/agent/profile", icon: User },
      ];
    }

    return [
      ...commonItems,
      { title: "Favorites", path: "/dashboard/user/favorites", icon: Heart },
      { title: "Messages", path: "/dashboard/user/messages", icon: MessageSquare },
      {
        title: "Properties",
        path: "/dashboard/user/properties", // Direct path to properties
        icon: Building,
      },
      {
        title: "Property Tools",
        icon: SearchCheck,
        subItems: [
          { title: "Search Management", path: "/dashboard/user/searches" },
          { title: "Property Alerts", path: "/dashboard/user/property-alerts" },
          { title: "Viewing History", path: "/dashboard/user/viewing-history" },
        ]
      },
      { title: "Purchases", path: "/dashboard/user/purchases", icon: ShoppingBag },
    ];
  }, [userType]);

  return navItems;
};