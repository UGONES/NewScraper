import User from "../models/User.js";
import Scrape from "../models/ScrapedData.js"

export const getAdminSummary = async (_req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Get user IDs with role === 'user'
    const users = await User.find({ role: 'user' }).select('_id');
    const userIds = users.map(user => user._id);

    // Count only scrapes where userId is a regular user
    const totalScrapes = await Scrape.countDocuments({
      userId: { $in: userIds }
    });

    res.json({ totalUsers, totalScrapes });
  } catch (err) {
    next(err);
  }
};


export const getAllUsersSummaryAdmin = async (_req, res, next) => {
  try {
    const users = await User.find({}, "username email role"); // summary only
    res.json(users);
  } catch (err) {
    next(err);
  }
};
