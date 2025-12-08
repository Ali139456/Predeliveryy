import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inspection from '@/models/Inspection';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(['admin', 'manager'])(request);
    await connectDB();

    const [
      totalInspections,
      completedInspections,
      draftInspections,
      totalUsers,
      activeUsers,
      recentInspections,
    ] = await Promise.all([
      Inspection.countDocuments(),
      Inspection.countDocuments({ status: 'completed' }),
      Inspection.countDocuments({ status: 'draft' }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Inspection.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('inspectionNumber inspectorName status createdAt'),
    ]);

    // Get inspections by status
    const inspectionsByStatus = {
      completed: completedInspections,
      draft: draftInspections,
    };

    // Get inspections by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyInspections = await Inspection.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        inspections: {
          total: totalInspections,
          completed: completedInspections,
          draft: draftInspections,
          byStatus: inspectionsByStatus,
          monthly: monthlyInspections,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
        },
        recent: recentInspections,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

