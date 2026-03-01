import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  BarChart3
} from "lucide-react";

export default function AdminAnalytics() {
  const { formatPrice } = useCurrency();

  const kpiData = [
    {
      title: "Platform Revenue",
      value: formatPrice(0),
      change: "+0%",
      positive: true,
      icon: DollarSign,
      description: "Total platform revenue"
    },
    {
      title: "User Growth Rate",
      value: "0%",
      change: "+0%",
      positive: true,
      icon: Users,
      description: "Month-over-month growth"
    },
    {
      title: "Property Listings",
      value: "0",
      change: "+0",
      positive: true,
      icon: Building2,
      description: "Total active listings"
    },
    {
      title: "Conversion Rate",
      value: "0%",
      change: "+0%",
      positive: true,
      icon: TrendingUp,
      description: "Visitor to lead conversion"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights into platform performance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="justify-start sm:justify-center">
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="justify-start sm:justify-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Date Range</span>
          </Button>
          <Button size="sm" className="justify-start sm:justify-center">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-xl sm:text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <Badge
                  variant={kpi.positive ? "default" : "destructive"}
                  className="text-xs px-1.5 py-0.5"
                >
                  {kpi.change}
                </Badge>
                <span className="text-muted-foreground hidden sm:inline">vs last month</span>
                <span className="text-muted-foreground sm:hidden">vs last</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnalyticsCharts />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Top Performing Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Building2 className="mx-auto h-8 w-8 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
              <p className="font-medium text-sm sm:text-base">No location data yet</p>
              <p className="text-xs sm:text-sm">
                Location performance will appear when properties are listed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Users className="mx-auto h-8 w-8 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
              <p className="font-medium text-sm sm:text-base">No agent data yet</p>
              <p className="text-xs sm:text-sm">
                Agent performance metrics will show when agents start selling
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}