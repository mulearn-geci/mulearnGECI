const express = require('express');
const router = express.Router();
const HomepageConfig = require('../models/HomepageConfig');

// GET homepage customizer config (returns latest document with strict cache-busting)
router.get('/', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    let configs = await HomepageConfig.find({ key: 'main_config' }).sort({ updatedAt: -1 });
    let config = configs[0];
    if (!config) {
      config = new HomepageConfig({ key: 'main_config' });
      await config.save();
    }
    return res.json({ 
      success: true, 
      data: config 
    });
  } catch (err) {
    console.error('Error fetching homepage config:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch homepage configuration',
      error: err.message 
    });
  }
});

// POST / UPDATE homepage customizer config
router.post('/', async (req, res) => {
  try {
    const { cards, igs, execoms, about } = req.body;
    
    let configs = await HomepageConfig.find({ key: 'main_config' }).sort({ updatedAt: -1 });
    let config;
    if (configs.length > 0) {
      config = configs[0];
      if (configs.length > 1) {
        const duplicateIds = configs.slice(1).map(c => c._id);
        await HomepageConfig.deleteMany({ _id: { $in: duplicateIds } }).catch(() => {});
      }
    } else {
      config = new HomepageConfig({ key: 'main_config' });
    }

    if (cards !== undefined && Array.isArray(cards)) {
      config.cards = cards;
      config.markModified('cards');
    }
    if (igs !== undefined && Array.isArray(igs)) {
      config.igs = igs;
      config.markModified('igs');
    }
    if (execoms !== undefined && Array.isArray(execoms)) {
      config.execoms = execoms;
      config.markModified('execoms');
    }
    if (about !== undefined && about && typeof about === 'object') {
      config.about = { ...(config.about || {}), ...about };
      config.markModified('about');
    }
    config.updatedAt = new Date();

    await config.save();

    return res.json({ 
      success: true, 
      message: 'Homepage configuration saved successfully!', 
      data: config 
    });
  } catch (err) {
    console.error('Error saving homepage config:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to save homepage configuration',
      error: err.message 
    });
  }
});

module.exports = router;
