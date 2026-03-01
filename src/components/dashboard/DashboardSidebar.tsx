import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
  Users,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Heart,
  Search,
  MessageSquare,
  Shield,
  UserCheck,
  Database,
  TrendingUp,
  Activity,
  Bell,
  CreditCard,
  CalendarCheck,
  UserPlus,
  Clock,
} from "lucide-react";

interface DashboardSidebarProps {
  userRole: "admin" | "agent" | "user";
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isMobile, setOpenMobile } = useSidebar();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50";

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getMenuItems = () => {
    const commonItems = [
      { title: "Dashboard", url: `/dashboard/${userRole}`, icon: Home },
      { title: "Properties", url: `/dashboard/${userRole}/properties`, icon: Building2 },
    ];

    switch (userRole) {
      case "admin":
        return [
          ...commonItems,
          { title: "Analytics", url: `/dashboard/admin/analytics`, icon: BarChart3 },
          { title: "Users", url: `/dashboard/admin/users`, icon: Users },
          { title: "KYC Management", url: `/dashboard/admin/kyc`, icon: UserCheck },
          { title: "Locations", url: `/dashboard/admin/locations`, icon: MapPin },
          { title: "Transactions", url: `/dashboard/admin/transactions`, icon: DollarSign },
          { title: "Reports", url: `/dashboard/admin/reports`, icon: FileText },
          { title: "Security", url: `/dashboard/admin/security`, icon: Shield },
          { title: "Payments", url: `/dashboard/admin/payments`, icon: CreditCard },
          { title: "Notifications", url: `/dashboard/admin/notifications`, icon: Bell },
          { title: "Settings", url: `/dashboard/admin/settings`, icon: Settings },
          { title: "Profile", url: `/dashboard/admin/profile`, icon: UserPlus }, // Added Profile link
        ];

      case "agent":
        return [
          ...commonItems,
          { title: "My Listings", url: `/dashboard/user/listings`, icon: Building2 },
          { title: "Saved Properties", url: `/dashboard/user/saved`, icon: Heart },
          { title: "Search Management", url: `/dashboard/user/searches`, icon: Search },
          { title: "Appointments", url: `/dashboard/user/appointments`, icon: Calendar },
          { title: "Messages", url: `/dashboard/user/messages`, icon: MessageSquare },
          { title: "Notifications", url: `/dashboard/user/notifications`, icon: Bell },
          { title: "Payments", url: `/dashboard/user/payments`, icon: CreditCard },
          { title: "Profile", url: `/dashboard/user/profile`, icon: Settings },
        ];

      case "user":
        return [
          ...commonItems,
          { title: "Saved Properties", url: `/dashboard/user/saved`, icon: Heart },
          { title: "Searches", url: `/dashboard/user/searches`, icon: Search },
          { title: "Appointments", url: `/dashboard/user/appointments`, icon: Calendar },
          { title: "Messages", url: `/dashboard/user/messages`, icon: MessageSquare },
          { title: "Notifications", url: `/dashboard/user/notifications`, icon: Bell },
          { title: "Payments", url: `/dashboard/user/payments`, icon: CreditCard },
          { title: "Profile", url: `/dashboard/user/profile`, icon: Settings },
        ];

      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar
      className="border-r bg-card"
      collapsible="icon"
    >
      <SidebarContent className="bg-card">
        <div className="p-4 border-b border-border/50">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-primary/90">
              <span className="text-primary-foreground font-bold text-sm">CC</span>
            </div>
            <div className="overflow-hidden">
              <h2 className="font-heading font-bold text-lg text-foreground transition-colors duration-200 group-hover:text-primary">Campus Comfort</h2>
              <p className="text-xs text-muted-foreground capitalize">{userRole} Portal</p>
            </div>
          </NavLink>
        </div>

        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 pb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        onClick={handleLinkClick}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                          ${active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent/10 hover:text-accent hover:shadow-sm hover:translate-x-0.5"
                          }
                        `}
                      >
                        <IconComponent className={`h-5 w-5 shrink-0 transition-transform duration-200 ${!active && "group-hover:scale-110"}`} />
                        <span className="font-medium text-sm truncate">
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}