import models, { sequelize } from '../models/index.js';
import { Op } from 'sequelize';

// Helper function to get donation statistics
const getSuccessfulDonationsStats = async () => {
  try {
    // Total successful donations
    const totalDonations = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      }
    });

    // This month's donations
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const thisMonthDonations = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true,
        donation_completed_at: {
          [Op.gte]: currentMonth
        }
      }
    });

    // Active donors count (unique donors who have successfully donated)
    const activeDonorsCount = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      distinct: true,
      col: 'donor_id'
    });

    // Blood type distribution (unique blood types that have been donated)
    const bloodTypeStats = await models.ConnectionRequest.findAll({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      include: [{
        model: models.BloodRequest,
        as: 'bloodRequest',
        attributes: []
      }],
      attributes: [
        [sequelize.col('bloodRequest.blood_type'), 'blood_type'],
        [sequelize.col('bloodRequest.rh_factor'), 'rh_factor'],
        [sequelize.fn('COUNT', sequelize.col('ConnectionRequest.id')), 'count']
      ],
      group: [sequelize.col('bloodRequest.blood_type'), sequelize.col('bloodRequest.rh_factor')],
      order: [[sequelize.fn('COUNT', sequelize.col('ConnectionRequest.id')), 'DESC']],
      raw: true
    });

    // Top donors (donors with most successful donations)
    const topDonors = await models.ConnectionRequest.findAll({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      include: [{
        model: models.User,
        as: 'donor',
        attributes: ['id', 'full_name', 'blood_type', 'email']
      }],
      attributes: [
        'donor_id',
        [sequelize.fn('COUNT', sequelize.col('donor_id')), 'donation_count']
      ],
      group: ['donor_id', 'donor.id', 'donor.full_name', 'donor.blood_type', 'donor.email'],
      order: [[sequelize.fn('COUNT', sequelize.col('donor_id')), 'DESC']],
      limit: 10
    });

    // Recent successful donations (last 5)
    const recentDonations = await models.ConnectionRequest.findAll({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      include: [
        {
          model: models.User,
          as: 'donor',
          attributes: ['id', 'full_name', 'blood_type']
        },
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          attributes: ['patient_name', 'blood_type', 'rh_factor', 'hospital_name']
        }
      ],
      order: [['donation_completed_at', 'DESC']],
      limit: 5
    });

    return {
      totalDonations,
      thisMonthDonations,
      activeDonorsCount,
      topDonors: topDonors.map(donor => ({
        ...donor.dataValues,
        donor: donor.donor
      })),
      bloodTypeStats: bloodTypeStats.map(stat => ({
        bloodType: `${stat.blood_type || 'Unknown'}${stat.rh_factor || ''}`,
        count: parseInt(stat.count)
      })),
      uniqueBloodTypesCount: bloodTypeStats.length,
      recentDonations
    };
  } catch (error) {
    console.error('Error calculating donation statistics:', error);
    return {
      totalDonations: 0,
      thisMonthDonations: 0,
      activeDonorsCount: 0,
      topDonors: [],
      bloodTypeStats: [],
      uniqueBloodTypesCount: 0,
      recentDonations: []
    };
  }
};

// Dashboard statistics endpoint for quick overview (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // Get the same statistics as the successful donations endpoint
    const stats = await getSuccessfulDonationsStats();

    res.json({
      success: true,
      data: {
        totalDonations: stats.totalDonations,
        thisMonthDonations: stats.thisMonthDonations,
        activeDonorsCount: stats.activeDonorsCount,
        uniqueBloodTypesCount: stats.uniqueBloodTypesCount,
        recentDonations: stats.recentDonations.slice(0, 3), // Just top 3 for dashboard
        topDonors: stats.topDonors.slice(0, 5) // Top 5 for dashboard
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch dashboard statistics'
    });
  }
};

// Helper function to get public homepage statistics
const getPublicHomeStats = async () => {
  try {
    console.log('🔍 Fetching public homepage statistics from database...');

    // Total registered users (all active users)
    const totalUsers = await models.User.count({
      where: {
        is_active: true
      }
    });
    console.log('👥 Total Users:', totalUsers);

    // Total registered donors (users who are active donors)
    const totalDonors = await models.User.count({
      where: {
        is_donor: true,
        is_active: true
      }
    });
    console.log('🩸 Total Donors:', totalDonors);

    // Total blood requests (all requests, not deleted)
    const totalRequests = await models.BloodRequest.count({
      where: {
        [Op.or]: [
          { deleted_at: null },
          { deleted_at: { [Op.is]: null } }
        ]
      }
    });
    console.log('📋 Total Requests:', totalRequests);

    // Total successful donations
    const totalDonations = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      }
    });
    console.log('✅ Total Successful Donations:', totalDonations);

    // Lives saved (each successful donation can potentially save up to 3 lives)
    const livesSaved = totalDonations * 3;

    // Current month statistics for percentage changes
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // This month's new donors
    const thisMonthDonors = await models.User.count({
      where: {
        is_donor: true,
        is_active: true,
        createdAt: {
          [Op.gte]: currentMonth
        }
      }
    });

    // Last month's new donors for comparison
    const lastMonthDonors = await models.User.count({
      where: {
        is_donor: true,
        is_active: true,
        createdAt: {
          [Op.gte]: lastMonth,
          [Op.lt]: currentMonth
        }
      }
    });

    // This month's new requests
    const thisMonthRequests = await models.BloodRequest.count({
      where: {
        deleted_at: null,
        createdAt: {
          [Op.gte]: currentMonth
        }
      }
    });

    // Last month's new requests for comparison
    const lastMonthRequests = await models.BloodRequest.count({
      where: {
        deleted_at: null,
        createdAt: {
          [Op.gte]: lastMonth,
          [Op.lt]: currentMonth
        }
      }
    });

    // This month's successful donations
    const thisMonthDonations = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true,
        donation_completed_at: {
          [Op.gte]: currentMonth
        }
      }
    });

    // Last month's successful donations for comparison
    const lastMonthDonations = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true,
        donation_completed_at: {
          [Op.gte]: lastMonth,
          [Op.lt]: currentMonth
        }
      }
    });

    // Calculate percentage changes
    const donorChange = lastMonthDonors > 0 ? Math.round(((thisMonthDonors - lastMonthDonors) / lastMonthDonors) * 100) : (thisMonthDonors > 0 ? 100 : 0);
    const requestChange = lastMonthRequests > 0 ? Math.round(((thisMonthRequests - lastMonthRequests) / lastMonthRequests) * 100) : (thisMonthRequests > 0 ? 100 : 0);
    const donationChange = lastMonthDonations > 0 ? Math.round(((thisMonthDonations - lastMonthDonations) / lastMonthDonations) * 100) : (thisMonthDonations > 0 ? 100 : 0);
    const livesChange = donationChange; // Lives saved follows donation trend

    // Blood type distribution for inventory display (all active donors)
    console.log('🩸 Fetching blood type inventory...');
    const bloodTypeInventory = await models.User.findAll({
      where: {
        is_donor: true,
        is_active: true,
        blood_type: {
          [Op.not]: null,
          [Op.ne]: ''
        }
      },
      attributes: [
        'blood_type',
        'rh_factor',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['blood_type', 'rh_factor'],
      order: [
        ['blood_type', 'ASC'], 
        [sequelize.literal("CASE WHEN rh_factor = '+' THEN 1 ELSE 2 END"), 'ASC']
      ],
      raw: true
    });

    console.log('📊 Raw blood type inventory from DB:', bloodTypeInventory);

    // Create a complete blood type inventory with all combinations
    const allBloodTypes = [
      { type: 'A', rhFactor: '+' },
      { type: 'A', rhFactor: '-' },
      { type: 'B', rhFactor: '+' },
      { type: 'B', rhFactor: '-' },
      { type: 'AB', rhFactor: '+' },
      { type: 'AB', rhFactor: '-' },
      { type: 'O', rhFactor: '+' },
      { type: 'O', rhFactor: '-' }
    ];

    // Create inventory map from database results
    const inventoryMap = {};
    bloodTypeInventory.forEach(item => {
      const key = `${item.blood_type}${item.rh_factor || '+'}`;
      inventoryMap[key] = {
        type: item.blood_type,
        rhFactor: item.rh_factor || '+',
        count: parseInt(item.count) || 0,
        isAvailable: parseInt(item.count) > 0
      };
    });

    // Build complete inventory with real data + zeros for missing types
    const bloodInventory = allBloodTypes.map(bloodType => {
      const key = `${bloodType.type}${bloodType.rhFactor}`;
      return inventoryMap[key] || {
        type: bloodType.type,
        rhFactor: bloodType.rhFactor,
        count: 0,
        isAvailable: false
      };
    });

    console.log('🎯 Final blood inventory:', bloodInventory);

    console.log('Public Stats Debug:', {
      totalUsers,
      totalDonors,
      totalRequests,
      totalDonations,
      livesSaved,
      bloodInventory: bloodInventory.length
    });

    return {
      totalUsers,
      totalDonors,
      totalRequests,
      totalDonations,
      livesSaved,
      changes: {
        donors: donorChange,
        requests: requestChange,
        donations: donationChange,
        lives: livesChange
      },
      bloodInventory
    };
  } catch (error) {
    console.error('Error calculating public homepage statistics:', error);
    return {
      totalUsers: 0,
      totalDonors: 0,
      totalRequests: 0,
      totalDonations: 0,
      livesSaved: 0,
      changes: {
        donors: 0,
        requests: 0,
        donations: 0,
        lives: 0
      },
      bloodInventory: []
    };
  }
};

// Public homepage statistics endpoint (no authentication required)
export const getPublicStats = async (req, res) => {
  try {
    console.log('🚀 Public stats endpoint called');
    console.log('🔧 Environment check in API:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
    console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
    console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
    
    // Use the same simple approach as admin stats - direct database queries
    console.log('📊 Fetching real stats from database...');
    
    // Total registered users (same as admin)
    const totalUsers = await models.User.count();
    console.log('👥 Total Users:', totalUsers);

    // Total active donors (same as admin)
    const activeDonors = await models.User.count({ 
      where: { 
        is_donor: true, 
        is_active: true 
      } 
    });
    console.log('🩸 Active Donors:', activeDonors);

    // Total blood requests
    const totalRequests = await models.BloodRequest.count({
      where: {
        [Op.or]: [
          { deleted_at: null },
          { deleted_at: { [Op.is]: null } }
        ]
      }
    });
    console.log('📋 Total Requests:', totalRequests);

    // Total successful donations 
    const totalDonations = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      }
    });
    console.log('✅ Total Donations:', totalDonations);

    // Lives saved calculation
    const livesSaved = totalDonations * 3;

    // Simple monthly changes (basic calculation)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const thisMonthDonors = await models.User.count({
      where: {
        is_donor: true,
        is_active: true,
        createdAt: { [Op.gte]: currentMonth }
      }
    });

    const thisMonthRequests = await models.BloodRequest.count({
      where: {
        deleted_at: null,
        createdAt: { [Op.gte]: currentMonth }
      }
    });

    const thisMonthDonations = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true,
        donation_completed_at: { [Op.gte]: currentMonth }
      }
    });

    // Blood inventory - try simpler approach first
    console.log('🩸 Fetching blood inventory from real donors...');
    
    // Get all donors and their blood types to see what we have
    const allDonorBloodTypes = await models.User.findAll({
      where: {
        is_donor: true,
        is_active: true
      },
      attributes: ['blood_type'],
      raw: true
    });
    
    console.log('🔍 All donor blood types:', allDonorBloodTypes.map(d => d.blood_type));
    
    // Filter only valid blood types and count them manually
    const validBloodTypes = allDonorBloodTypes.filter(donor => 
      donor.blood_type && 
      ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(donor.blood_type)
    );
    
    // Count manually
    const bloodTypeCounts = {};
    validBloodTypes.forEach(donor => {
      const type = donor.blood_type;
      bloodTypeCounts[type] = (bloodTypeCounts[type] || 0) + 1;
    });
    
    console.log('� Blood type counts:', bloodTypeCounts);

    // Create complete blood inventory from manual counts
    const allBloodTypes = [
      { type: 'A', rhFactor: '+' }, { type: 'A', rhFactor: '-' },
      { type: 'B', rhFactor: '+' }, { type: 'B', rhFactor: '-' },
      { type: 'AB', rhFactor: '+' }, { type: 'AB', rhFactor: '-' },
      { type: 'O', rhFactor: '+' }, { type: 'O', rhFactor: '-' }
    ];

    const bloodInventory = allBloodTypes.map(bloodType => {
      const key = `${bloodType.type}${bloodType.rhFactor}`;
      const count = bloodTypeCounts[key] || 0;
      
      return {
        type: bloodType.type,
        rhFactor: bloodType.rhFactor,
        count: count,
        isAvailable: count > 0
      };
    });

    console.log('🎯 Final blood inventory:', bloodInventory);

    // Prepare response with real data including blood inventory
    const responseData = {
      donors: activeDonors,  // Use activeDonors instead of totalDonors for consistency
      requests: totalRequests,
      donations: totalDonations,
      livesSaved: livesSaved,
      changes: {
        donors: thisMonthDonors,
        requests: thisMonthRequests,
        donations: thisMonthDonations,
        lives: thisMonthDonations * 3
      },
      bloodInventory: bloodInventory
    };

    console.log('✅ Sending REAL database data:', {
      donors: responseData.donors,
      requests: responseData.requests,
      donations: responseData.donations,
      livesSaved: responseData.livesSaved,
      bloodInventoryCount: responseData.bloodInventory.length
    });

    res.json({
      success: true,
      data: responseData,
      meta: {
        isRealData: true,
        message: 'Real data from database'
      }
    });

  } catch (error) {
    console.error('❌ Error fetching public stats:', error);
    
    // Only use demo data if there's a real database error
    res.json({
      success: true,
      data: {
        donors: 1568,
        requests: 427,
        donations: 312,
        livesSaved: 936,
        changes: {
          donors: 12,
          requests: 8,
          donations: 5,
          lives: 15
        },
        bloodInventory: [
          { type: 'A', rhFactor: '+', count: 125, isAvailable: true },
          { type: 'A', rhFactor: '-', count: 14, isAvailable: true },
          { type: 'B', rhFactor: '+', count: 87, isAvailable: true },
          { type: 'B', rhFactor: '-', count: 9, isAvailable: true },
          { type: 'AB', rhFactor: '+', count: 36, isAvailable: true },
          { type: 'AB', rhFactor: '-', count: 3, isAvailable: true },
          { type: 'O', rhFactor: '+', count: 156, isAvailable: true },
          { type: 'O', rhFactor: '-', count: 21, isAvailable: true },
        ]
      },
      meta: {
        isRealData: false,
        message: 'Demo data (database error occurred)'
      }
    });
  }
};
