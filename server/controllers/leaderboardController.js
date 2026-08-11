const Leaderboard = require('../models/Leaderboard');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const logger = require('../utils/logger');

const SYNC_SECRET = process.env.LEADERBOARD_SYNC_SECRET || 'mulearn-geci-sync-secret-2026';

const leaderboardController = {
  // Get all Leaderboard records sorted by karma
  getAllLeaderboard: async (req, res) => {
    try {
      let members = await Leaderboard.find().sort({ karma: -1 });

      // Add dynamic rank positioning
      const formattedMembers = members.map((m, index) => ({
        _id: m._id,
        full_name: m.full_name,
        muid: m.muid,
        karma: m.karma,
        rank: index + 1,
        level: m.level,
        join_date: m.join_date,
        last_karma_gained: m.last_karma_gained,
        graduation_year: m.graduation_year,
        department: m.department || 'CSE',
        is_alumni: m.is_alumni,
        ig_count: m.ig_count,
        lc_count: m.lc_count,
        lastUpdated: m.lastUpdated
      }));

      return sendSuccess(res, 'Leaderboard data retrieved successfully', formattedMembers);
    } catch (error) {
      logger.error('Get Leaderboard error', { error: error.message });
      return sendError(res, 500, 'Failed to fetch leaderboard data');
    }
  },

  // Bulk sync CSV data from Automated Bot or CSV upload
  syncLeaderboard: async (req, res) => {
    try {
      const authHeaderSecret = req.header('x-sync-secret');
      const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'moderator');

      if (!isAdmin && authHeaderSecret !== SYNC_SECRET) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid sync authorization secret.'
        });
      }

      const { students } = req.body;

      if (!Array.isArray(students) || students.length === 0) {
        return sendError(res, 400, 'Invalid payload: students array is required');
      }

      const bulkOps = students.map((s, index) => {
        const karmaVal = parseInt(s.karma || s.Karma || 0, 10);
        const levelVal = parseInt(s.level || s.Level || 1, 10);
        const lastKarmaVal = parseInt(s.last_karma_gained || s.LastKarmaGained || 0, 10);
        const igVal = parseInt(s.ig_count || s.IgCount || 0, 10);
        const lcVal = parseInt(s.lc_count || s.LcCount || 0, 10);
        const isAlumniVal = Boolean(s.is_alumni === true || s.is_alumni === 'true' || s.IsAlumni === true || s.IsAlumni === 'true');

        return {
          updateOne: {
            filter: { muid: (s.muid || s.Muid || s.full_name).trim().toLowerCase() },
            update: {
              $set: {
                full_name: (s.full_name || s.FullName || s.name || 'Student').trim(),
                muid: (s.muid || s.Muid || s.full_name).trim().toLowerCase(),
                karma: karmaVal,
                rank: parseInt(s.rank || index + 1, 10),
                level: levelVal,
                join_date: s.join_date ? new Date(s.join_date) : new Date(),
                last_karma_gained: lastKarmaVal,
                graduation_year: String(s.graduation_year || s.GraduationYear || ''),
                department: (s.department || s.Department || 'CSE').trim().toUpperCase(),
                is_alumni: isAlumniVal,
                ig_count: igVal,
                lc_count: lcVal,
                lastUpdated: new Date()
              }
            },
            upsert: true
          }
        };
      });

      const result = await Leaderboard.bulkWrite(bulkOps);

      // Recalculate ranks across all records
      const allMembers = await Leaderboard.find().sort({ karma: -1 });
      for (let i = 0; i < allMembers.length; i++) {
        allMembers[i].rank = i + 1;
        await allMembers[i].save();
      }

      logger.info('Leaderboard synced successfully', { count: students.length });

      return sendSuccess(res, `Leaderboard synced successfully. Processed ${students.length} records.`, {
        matchedCount: result.matchedCount,
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
        totalRecords: allMembers.length,
        lastUpdated: new Date()
      });
    } catch (error) {
      logger.error('Sync Leaderboard error', { error: error.message });
      return sendError(res, 500, `Failed to sync leaderboard data: ${error.message}`);
    }
  }
};

module.exports = leaderboardController;
