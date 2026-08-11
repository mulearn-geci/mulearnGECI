const Leaderboard = require('../models/Leaderboard');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const logger = require('../utils/logger');

const SYNC_SECRET = process.env.LEADERBOARD_SYNC_SECRET || 'mulearn-geci-sync-secret-2026';

const leaderboardController = {
  // Get all Leaderboard records sorted by karma
  getAllLeaderboard: async (req, res) => {
    try {
      let members = await Leaderboard.find().sort({ karma: -1 });

      if (members.length === 0) {
        const initialMock = [
          { full_name: 'Albert George', muid: 'albertgeorge@mulearn', karma: 14850, rank: 1, level: 5, department: 'CSE', is_alumni: false, ig_count: 8, lc_count: 5 },
          { full_name: 'Rahul K', muid: 'rahulk@mulearn', karma: 12400, rank: 2, level: 5, department: 'CSE', is_alumni: true, ig_count: 6, lc_count: 4 },
          { full_name: 'Ananya S', muid: 'ananyas@mulearn', karma: 10950, rank: 3, level: 4, department: 'ECE', is_alumni: false, ig_count: 5, lc_count: 3 },
          { full_name: 'Vaisakh M', muid: 'vaisakhm@mulearn', karma: 9600, rank: 4, level: 4, department: 'EEE', is_alumni: false, ig_count: 7, lc_count: 2 },
          { full_name: 'Devika Nair', muid: 'devikanair@mulearn', karma: 8450, rank: 5, level: 4, department: 'CSE', is_alumni: false, ig_count: 4, lc_count: 3 }
        ];
        await Leaderboard.insertMany(initialMock).catch(() => {});
        members = await Leaderboard.find().sort({ karma: -1 });
      }

      // Add dynamic rank positioning & sanitize null fields
      const formattedMembers = members.map((m, index) => ({
        _id: m._id,
        full_name: m.full_name || 'Student',
        muid: m.muid || 'student@mulearn',
        karma: typeof m.karma === 'number' && !isNaN(m.karma) ? m.karma : 0,
        rank: index + 1,
        level: typeof m.level === 'number' && !isNaN(m.level) ? m.level : 1,
        join_date: m.join_date ? m.join_date : new Date(),
        last_karma_gained: typeof m.last_karma_gained === 'number' ? m.last_karma_gained : 0,
        graduation_year: m.graduation_year || '',
        department: m.department || 'CSE',
        is_alumni: Boolean(m.is_alumni),
        ig_count: typeof m.ig_count === 'number' ? m.ig_count : 0,
        lc_count: typeof m.lc_count === 'number' ? m.lc_count : 0,
        lastUpdated: m.lastUpdated || new Date()
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
        const nameVal = (s.full_name || s.FullName || s.name || s.Student || 'Student').toString().trim();
        const rawMuid = (s.muid || s.Muid || nameVal).toString().trim().toLowerCase();
        
        const parseNum = (val, fallback = 0) => {
          const parsed = parseInt(val, 10);
          return isNaN(parsed) ? fallback : parsed;
        };

        const karmaVal = parseNum(s.karma || s.Karma, 0);
        const levelVal = parseNum(s.level || s.Level, 1);
        const lastKarmaVal = parseNum(s.last_karma_gained || s.LastKarmaGained, 0);
        const igVal = parseNum(s.ig_count || s.IgCount, 0);
        const lcVal = parseNum(s.lc_count || s.LcCount, 0);
        const isAlumniVal = Boolean(s.is_alumni === true || s.is_alumni === 'true' || s.IsAlumni === true || s.IsAlumni === 'true');
        const deptVal = (s.department || s.Department || s.Department___Cluster || 'CSE').toString().trim().toUpperCase();

        return {
          updateOne: {
            filter: { muid: rawMuid },
            update: {
              $set: {
                full_name: nameVal,
                muid: rawMuid,
                karma: karmaVal,
                rank: parseNum(s.rank || s.Rank, index + 1),
                level: levelVal,
                join_date: s.join_date ? new Date(s.join_date) : new Date(),
                last_karma_gained: lastKarmaVal,
                graduation_year: String(s.graduation_year || s.GraduationYear || ''),
                department: deptVal,
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
