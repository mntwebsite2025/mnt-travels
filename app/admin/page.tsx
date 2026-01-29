"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  BarChart3, 
  Users, 
  Settings, 
  Plus, 
  MapPin, 
  Globe, 
  Mail, 
  Loader2, 
  Package,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  Star
} from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

interface DashboardMetrics {
  totalLeads: number;
  thisMonthLeads: number;
  thisWeekLeads: number;
  leadsGrowth: number;
  completedLeads: number;
  pendingLeads: number;
  completionRate: number;
  totalTestimonials: number;
  publishedTestimonials: number;
  totalPackages: number;
  activePackages: number;
  totalTariffs: number;
  activeTariffs: number;
  totalLocations: number;
  popularRoutes: number;
}

interface RecentLead {
  _id: string;
  fullName: string;
  email: string;
  service: string;
  status: string;
  priority: string;
  submittedAt: string;
}

interface DashboardData {
  metrics: DashboardMetrics;
  recentLeads: RecentLead[];
  analytics: {
    leadsByStatus: { status: string; count: number }[];
    leadsByService: { service: string; count: number }[];
  };
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);
      
      const response = await fetch('/api/admin/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        if (showRefreshToast) {
          toast({
            title: "Dashboard Updated",
            description: "Latest data has been loaded successfully.",
          });
        }
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
          <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
          <Button onClick={() => fetchDashboardData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { metrics, recentLeads } = dashboardData;

  const stats = [
    {
      title: "Total Leads",
      value: metrics.totalLeads.toString(),
      change: `${metrics.leadsGrowth >= 0 ? '+' : ''}${metrics.leadsGrowth}%`,
      trend: metrics.leadsGrowth >= 0 ? "up" : "down",
      icon: <Users className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: "All time"
    },
    {
      title: "This Month",
      value: metrics.thisMonthLeads.toString(),
      change: "New leads",
      trend: "up",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: "Current month"
    },
    {
      title: "Completed",
      value: metrics.completedLeads.toString(),
      change: `${metrics.completionRate}% rate`,
      trend: "up",
      icon: <CheckCircle className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: "Success rate"
    },
    {
      title: "Pending",
      value: metrics.pendingLeads.toString(),
      change: "In progress",
      trend: "neutral",
      icon: <Clock className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: "Awaiting action"
    },
    {
      title: "Testimonials",
      value: metrics.totalTestimonials.toString(),
      change: `${metrics.publishedTestimonials} published`,
      trend: "up",
      icon: <Star className="h-6 w-6" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      subtitle: "Customer reviews"
    },
    {
      title: "Active Packages",
      value: metrics.activePackages.toString(),
      change: `${metrics.totalPackages} total`,
      trend: "up",
      icon: <Package className="h-6 w-6" />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      subtitle: "Tour packages"
    },
  ];

  // Format date helper function
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(date);
  };
    

  const quickActions = [
    {
      title: "Add New Package",
      href: "/admin/packages",
      icon: <Package className="h-4 w-4" />,
      description: "Create new tour packages",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Manage Tariff",
      href: "/admin/tariff",
      icon: <Settings className="h-4 w-4" />,
      description: "Update service pricing",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "View Leads",
      href: "/admin/leads",
      icon: <Users className="h-4 w-4" />,
      description: "Manage customer inquiries",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Banner Manager",
      href: "/admin/banners",
      icon: <Globe className="h-4 w-4" />,
      description: "Manage homepage banners",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Contact Manager",
      href: "/admin/contact",
      icon: <MapPin className="h-4 w-4" />,
      description: "Update contact details",
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Profile Settings",
      href: "/admin/profile",
      icon: <Settings className="h-4 w-4" />,
      description: "Company profile settings",
      color: "from-teal-500 to-teal-600",
    },
  ]

  const handleActionClick = (title: string) => {
    setLoadingAction(title)
    // Simulate loading time
    setTimeout(() => {
      setLoadingAction(null)
    }, 800)
  }

  return (
    <div className=" -m-6 min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <motion.div
          className="bg-admin-gradient rounded-2xl p-8 text-white shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome to mnt Tours & Travels!</h1>
              <p className="text-blue-100 text-lg">Manage your travel services, packages, and customer inquiries.</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-blue-100">
                <span>📊 {metrics.totalLeads} Total Leads</span>
                <span>📦 {metrics.activePackages} Active Packages</span>
                <span>⭐ {metrics.publishedTestimonials} Reviews</span>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center gap-2">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <div className={stat.color}>{stat.icon}</div>
                    </div>
                    <Badge
                      variant="default"
                      className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Leads */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-admin-primary">
                    <Users className="h-5 w-5" />
                    Recent Leads
                  </CardTitle>
                  <Link href="/admin/leads">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-admin-primary hover:bg-blue-50 bg-transparent"
                      onClick={() => handleActionClick("View All Leads")}
                      disabled={loadingAction === "View All Leads"}
                    >
                      {loadingAction === "View All Leads" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentLeads.length > 0 ? recentLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      {/* Profile Avatar - Updated styling */}
                      <div className="w-10 h-10 min-w-[40px] bg-admin-gradient rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-white font-medium text-xs leading-none">
                          {lead.fullName
                            .split(" ")
                            .slice(0, 2) // Only take first two names
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>

                      {/* Lead Details - Added text truncation */}
                      <div className="flex-1 min-w-0"> {/* Added min-w-0 to enable text truncation */}
                        <p className="font-semibold text-gray-900 truncate">{lead.fullName}</p>
                        <p className="text-sm text-gray-600 truncate">{lead.service}</p>
                        <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                      </div>

                      {/* Status Badge - No changes needed */}
                      <div className="text-right flex-shrink-0">
                        <Badge
                          variant={lead.status === "new" ? "default" : "secondary"}
                          className={
                            lead.status === "new" 
                              ? "bg-blue-100 text-blue-800" 
                              : lead.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {lead.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{getTimeAgo(lead.submittedAt)}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent leads found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analytics Overview */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm h-full">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                <CardTitle className="flex items-center gap-2 text-admin-primary">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{metrics.totalLocations}</p>
                      <p className="text-sm text-gray-600">Total Locations</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{metrics.popularRoutes}</p>
                      <p className="text-sm text-gray-600">Popular Routes</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{metrics.totalTariffs}</p>
                      <p className="text-sm text-gray-600">Total Tariffs</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{metrics.activeTariffs}</p>
                      <p className="text-sm text-gray-600">Active Tariffs</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-green-600">{metrics.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${metrics.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-admin-primary">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle> 
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href={action.href}>
                        <Button
                          variant="outline"
                          className="h-24 w-full flex flex-col items-center justify-center space-y-2 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white relative overflow-hidden group"
                          onClick={() => handleActionClick(action.title)}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                          />
                          <div className="relative z-10 flex flex-col items-center space-y-2">
                          
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white`}>
                                {action.icon}
                              </div>
                            
                            <div className="text-center">
                              <span className="text-xs font-medium text-gray-900 block">{action.title}</span>
                              <span className="text-xs text-gray-500 block mt-1">{action.description}</span>
                            </div>
                          </div>
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

     
      </div>
    </div>
  )
}
