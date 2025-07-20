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

// Dashboard statistics endpoint for quick overview
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
