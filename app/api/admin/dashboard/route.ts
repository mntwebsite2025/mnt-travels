import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import Lead from "@/config/utils/admin/lead/leadSchema";
import Testimonial from "@/config/utils/admin/testimonial/testimonialSchema";
import Package from "@/config/utils/admin/packages/packageSchema";
import Tariff from "@/config/utils/admin/tariff/tariffSchema";
import Location from "@/config/utils/admin/location/locationSchema";

// GET - Fetch dashboard statistics
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Parallel queries for better performance
    const [
      totalLeads,
      thisMonthLeads,
      lastMonthLeads,
      thisWeekLeads,
      completedLeads,
      pendingLeads,
      totalTestimonials,
      publishedTestimonials,
      totalPackages,
      activePackages,
      totalTariffs,
      activeTariffs,
      totalLocations,
      popularRoutes,
      recentLeads,
      leadsByStatus,
      leadsByService
    ] = await Promise.all([
      // Lead statistics
      Lead.countDocuments(),
      Lead.countDocuments({ submittedAt: { $gte: startOfMonth } }),
      Lead.countDocuments({ 
        submittedAt: { $gte: startOfLastMonth, $lt: startOfMonth } 
      }),
      Lead.countDocuments({ submittedAt: { $gte: startOfWeek } }),
      Lead.countDocuments({ status: "completed" }),
      Lead.countDocuments({ status: { $in: ["pending", "in-progress", "new"] } }),
      
      // Testimonial statistics
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ status: "published" }),
      
      // Package statistics
      Package.countDocuments({ isDeleted: false }),
      Package.countDocuments({ status: "active", isDeleted: false }),
      
      // Tariff statistics
      Tariff.countDocuments({ isDeleted: false }),
      Tariff.countDocuments({ status: "active", isDeleted: false }),
      
      // Location statistics
      Location.countDocuments({ isActive: true }),
      Location.countDocuments({ isActive: true, isPopularRoute: true }),
      
      // Recent leads (last 5)
      Lead.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .select('fullName email serviceType status priority submittedAt')
        .lean(),
      
      // Leads by status
      Lead.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Leads by service type
      Lead.aggregate([
        {
          $group: {
            _id: "$serviceType",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Calculate growth percentages
    const leadsGrowth = lastMonthLeads > 0 
      ? ((thisMonthLeads - lastMonthLeads) / lastMonthLeads * 100).toFixed(1)
      : thisMonthLeads > 0 ? "100" : "0";
    
    const completionRate = totalLeads > 0 
      ? ((completedLeads / totalLeads) * 100).toFixed(1)
      : "0";

    // Prepare dashboard data
    const dashboardData = {
      // Key metrics
      metrics: {
        totalLeads,
        thisMonthLeads,
        thisWeekLeads,
        leadsGrowth: parseFloat(leadsGrowth),
        completedLeads,
        pendingLeads,
        completionRate: parseFloat(completionRate),
        totalTestimonials,
        publishedTestimonials,
        totalPackages,
        activePackages,
        totalTariffs,
        activeTariffs,
        totalLocations,
        popularRoutes
      },
      
      // Recent activity
      recentLeads: recentLeads.map(lead => ({
        _id: lead._id,
        fullName: lead.fullName,
        email: lead.email,
        service: lead.serviceType,
        status: lead.status,
        priority: lead.priority,
        submittedAt: lead.submittedAt
      })),
      
      // Analytics data
      analytics: {
        leadsByStatus: leadsByStatus.map(item => ({
          status: item._id,
          count: item.count
        })),
        leadsByService: leadsByService.map(item => ({
          service: item._id,
          count: item.count
        }))
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}