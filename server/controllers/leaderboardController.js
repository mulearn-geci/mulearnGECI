const Leaderboard = require('../models/Leaderboard');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const logger = require('../utils/logger');

const SYNC_SECRET = process.env.LEADERBOARD_SYNC_SECRET || 'mulearn-geci-sync-secret-2026';

// Helper to extract numbers from string values (e.g. "LVL5" -> 5, "Level 4" -> 4)
function extractNumber(val, fallback = 0) {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const matches = String(val).match(/\d+/);
  if (matches) return parseInt(matches[0], 10);
  return fallback;
}

// Helper to abbreviate department names cleanly or return '' if no department is specified
function getDeptAbbreviation(deptStr) {
  if (!deptStr || typeof deptStr !== 'string') return '';
  const str = deptStr.trim();
  const upper = str.toUpperCase();
  if (!str || str === '-' || upper === 'NONE' || upper === 'N/A' || upper === 'NULL' || upper === 'NO DEPARTMENT') {
    return '';
  }
  // Reject Level strings (e.g. "LVL3", "LVL5", "LEVEL 4") shifted from CSV columns
  if (upper.startsWith('LVL') || upper.startsWith('LEVEL') || /^LVL\d+/i.test(upper)) {
    return '';
  }

  if (upper.includes('ROBOTICS') || upper.includes('ARTIFICIAL INTELLIGENCE') || upper === 'RAI') return 'RAI';
  if (upper.includes('ELECTRICAL AND ELECTRONICS') || upper.includes('ELECTRICAL & ELECTRONICS') || upper === 'EEE' || upper.includes('ELECTRICAL')) return 'EEE';
  if (upper.includes('ELECTRONICS AND COMMUNICATION') || upper.includes('ELECTRONICS & COMMUNICATION') || upper === 'ECE' || upper.includes('ELECTRONICS')) return 'ECE';
  if (upper.includes('INFORMATION TECHNOLOGY') || upper === 'IT' || upper.includes('INFORMATION')) return 'IT';
  if (upper.includes('COMPUTER SCIENCE AND ENGINEERING') || upper.includes('COMPUTER SCIENCE & ENGINEERING') || upper.includes('COMPUTER SCIENCE') || upper === 'CSE' || upper.includes('COMPUTER')) return 'CSE';
  if (upper.includes('MECHANICAL ENGINEERING') || upper.includes('MECHANICAL') || upper === 'ME') return 'ME';
  
  if (['CSE', 'ECE', 'EEE', 'ME', 'RAI', 'IT'].includes(upper)) return upper;
  return '';
}

// Helper to compute exact Level based on LVL string or Karma points
function computeLevel(karma, rawLevel) {
  const parsedLevel = extractNumber(rawLevel, 0);
  if (parsedLevel > 0) return parsedLevel;

  const k = extractNumber(karma, 0);
  if (k >= 25000) return 7;
  if (k >= 15000) return 6;
  if (k >= 10000) return 5;
  if (k >= 5000) return 4;
  if (k >= 2500) return 3;
  if (k >= 1000) return 2;
  return 1;
}

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

      // Add dynamic rank positioning & sanitize department & level
      const formattedMembers = members.map((m, index) => {
        const karmaVal = extractNumber(m.karma, 0);
        const levelVal = computeLevel(karmaVal, m.level);
        const deptVal = getDeptAbbreviation(m.department);

        return {
          _id: m._id,
          full_name: m.full_name || 'Student',
          muid: m.muid || 'student@mulearn',
          karma: karmaVal,
          rank: index + 1,
          level: levelVal,
          join_date: m.join_date ? m.join_date : new Date(),
          last_karma_gained: extractNumber(m.last_karma_gained, 0),
          graduation_year: m.graduation_year || '',
          department: deptVal,
          is_alumni: Boolean(m.is_alumni),
          ig_count: extractNumber(m.ig_count, 0),
          lc_count: extractNumber(m.lc_count, 0),
          lastUpdated: m.lastUpdated || new Date()
        };
      });

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
        
        const karmaVal = extractNumber(s.karma || s.Karma, 0);
        const levelVal = computeLevel(karmaVal, s.level || s.Level);
        const lastKarmaVal = extractNumber(s.last_karma_gained || s.LastKarmaGained, 0);
        const igVal = extractNumber(s.ig_count || s.IgCount, 0);
        const lcVal = extractNumber(s.lc_count || s.LcCount, 0);
        const isAlumniVal = Boolean(s.is_alumni === true || s.is_alumni === 'true' || s.IsAlumni === true || s.IsAlumni === 'true');
        const deptVal = getDeptAbbreviation(s.department || s.Department || s.Department___Cluster);

        return {
          updateOne: {
            filter: { muid: rawMuid },
            update: {
              $set: {
                full_name: nameVal,
                muid: rawMuid,
                karma: karmaVal,
                rank: extractNumber(s.rank || s.Rank, index + 1),
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
        allMembers[i].level = computeLevel(allMembers[i].karma, allMembers[i].level);
        allMembers[i].department = getDeptAbbreviation(allMembers[i].department);
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
