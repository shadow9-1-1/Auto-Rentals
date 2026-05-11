const { getBookingModel } = require("../models/BookingAnalytics");
const { getPaymentModel } = require("../models/PaymentAnalytics");
const { getUserModel } = require("../models/UserAnalytics");
const { getVehicleModel } = require("../models/VehicleAnalytics");

const buildDateRange = (from, to) => {
  const range = {};
  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) {
      range.$gte = fromDate;
    }
  }
  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      range.$lte = toDate;
    }
  }
  return range;
};

const parseList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getRevenueAnalytics = async (req, res, next) => {
  try {
    const Payment = await getPaymentModel();

    const match = {};
    const dateRange = buildDateRange(req.query.from, req.query.to);
    if (Object.keys(dateRange).length > 0) {
      match.createdAt = dateRange;
    }

    const statusList = parseList(req.query.status);
    match.status = { $in: statusList.length > 0 ? statusList : ["paid"] };

    if (req.query.currency) {
      match.currency = String(req.query.currency).trim().toUpperCase();
    }

    const groupFormat = req.query.groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

    const stats = await Payment.aggregate([
      { $match: match },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" },
                totalTransactions: { $sum: 1 },
                averageTransactionValue: { $avg: "$amount" }
              }
            }
          ],
          byCurrency: [
            {
              $group: {
                _id: "$currency",
                totalRevenue: { $sum: "$amount" },
                totalTransactions: { $sum: 1 }
              }
            },
            { $sort: { totalRevenue: -1 } }
          ],
          byStatus: [
            {
              $group: {
                _id: "$status",
                totalRevenue: { $sum: "$amount" },
                totalTransactions: { $sum: 1 }
              }
            },
            { $sort: { totalTransactions: -1 } }
          ],
          timeSeries: [
            {
              $group: {
                _id: {
                  $dateToString: { format: groupFormat, date: "$createdAt", timezone: "UTC" }
                },
                totalRevenue: { $sum: "$amount" },
                totalTransactions: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    const summary = (stats[0] && stats[0].summary && stats[0].summary[0]) || {
      totalRevenue: 0,
      totalTransactions: 0,
      averageTransactionValue: 0
    };

    res.status(200).json({
      summary,
      byCurrency: (stats[0] && stats[0].byCurrency) || [],
      byStatus: (stats[0] && stats[0].byStatus) || [],
      timeSeries: (stats[0] && stats[0].timeSeries) || []
    });
  } catch (error) {
    next(error);
  }
};

const getBookingAnalytics = async (req, res, next) => {
  try {
    const Booking = await getBookingModel();

    const match = {};
    const dateRange = buildDateRange(req.query.from, req.query.to);
    if (Object.keys(dateRange).length > 0) {
      match.createdAt = dateRange;
    }

    if (req.query.status) {
      match.status = String(req.query.status).trim();
    }

    const groupFormat = req.query.groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

    const stats = await Booking.aggregate([
      { $match: match },
      {
        $addFields: {
          durationDays: {
            $divide: [{ $subtract: ["$endDate", "$startDate"] }, 86400000]
          }
        }
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: "$pricing.totalAmount" },
                averageBookingValue: { $avg: "$pricing.totalAmount" },
                averageDurationDays: { $avg: "$durationDays" }
              }
            }
          ],
          statusBreakdown: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          timeSeries: [
            {
              $group: {
                _id: {
                  $dateToString: { format: groupFormat, date: "$createdAt", timezone: "UTC" }
                },
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: "$pricing.totalAmount" }
              }
            },
            { $sort: { _id: 1 } }
          ],
          recentBookings: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                renter: 1,
                vehicle: 1,
                status: 1,
                startDate: 1,
                endDate: 1,
                createdAt: 1,
                pricing: 1
              }
            }
          ]
        }
      }
    ]);

    const summary = (stats[0] && stats[0].summary && stats[0].summary[0]) || {
      totalBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      averageDurationDays: 0
    };

    res.status(200).json({
      summary,
      statusBreakdown: (stats[0] && stats[0].statusBreakdown) || [],
      timeSeries: (stats[0] && stats[0].timeSeries) || [],
      recentBookings: (stats[0] && stats[0].recentBookings) || []
    });
  } catch (error) {
    next(error);
  }
};

const getUserGrowthAnalytics = async (req, res, next) => {
  try {
    const User = await getUserModel();

    const match = {};
    const dateRange = buildDateRange(req.query.from, req.query.to);
    if (Object.keys(dateRange).length > 0) {
      match.createdAt = dateRange;
    }

    const groupFormat = req.query.groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

    const stats = await User.aggregate([
      { $match: match },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: {
                  $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                },
                inactiveUsers: {
                  $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] }
                }
              }
            }
          ],
          roleBreakdown: [
            { $unwind: "$roles" },
            {
              $group: {
                _id: "$roles",
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          growthSeries: [
            {
              $group: {
                _id: {
                  $dateToString: { format: groupFormat, date: "$createdAt", timezone: "UTC" }
                },
                newUsers: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    const summary = (stats[0] && stats[0].summary && stats[0].summary[0]) || {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0
    };

    res.status(200).json({
      summary,
      roleBreakdown: (stats[0] && stats[0].roleBreakdown) || [],
      growthSeries: (stats[0] && stats[0].growthSeries) || []
    });
  } catch (error) {
    next(error);
  }
};

const getVehicleUsageAnalytics = async (req, res, next) => {
  try {
    const Vehicle = await getVehicleModel();
    const Booking = await getBookingModel();

    const dateRange = buildDateRange(req.query.from, req.query.to);
    const bookingMatch = {};
    if (Object.keys(dateRange).length > 0) {
      bookingMatch.createdAt = dateRange;
    }

    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || "10", 10)));

    const [vehicleStats, bookingUsage] = await Promise.all([
      Vehicle.aggregate([
        {
          $facet: {
            totals: [{ $count: "total" }],
            statusBreakdown: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } }
            ],
            moderationBreakdown: [
              {
                $group: {
                  _id: { $ifNull: ["$moderation.status", "legacy"] },
                  count: { $sum: 1 }
                }
              },
              { $sort: { count: -1 } }
            ]
          }
        }
      ]),
      Booking.aggregate([
        { $match: bookingMatch },
        {
          $group: {
            _id: "$vehicle.vehicleId",
            totalBookings: { $sum: 1 },
            confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            totalRevenue: { $sum: "$pricing.totalAmount" }
          }
        },
        { $sort: { totalBookings: -1 } },
        { $limit: limit }
      ])
    ]);

    const totals =
      vehicleStats && vehicleStats[0] && vehicleStats[0].totals && vehicleStats[0].totals[0]
        ? vehicleStats[0].totals[0].total
        : 0;

    res.status(200).json({
      vehicleTotals: totals,
      statusBreakdown: (vehicleStats[0] && vehicleStats[0].statusBreakdown) || [],
      moderationBreakdown: (vehicleStats[0] && vehicleStats[0].moderationBreakdown) || [],
      topVehiclesByBookings: bookingUsage || []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRevenueAnalytics,
  getBookingAnalytics,
  getUserGrowthAnalytics,
  getVehicleUsageAnalytics
};
