const express = require('express');
const router = express.Router();
const HomepageConfig = require('../models/HomepageConfig');

// GET homepage customizer config
router.get('/', async (req, res) => {
  try {
    let config = await HomepageConfig.findOne({ key: 'main_config' });
    if (!config) {
      config = new HomepageConfig({ key: 'main_config' });
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
    
    let config = await HomepageConfig.findOne({ key: 'main_config' });
    if (!config) {
      config = new HomepageConfig({ key: 'main_config' });
    }

    if (Array.isArray(cards)) {
      config.cards = cards;
      config.markModified('cards');
    }
    if (Array.isArray(igs)) {
      config.igs = igs;
      config.markModified('igs');
    }
    if (Array.isArray(execoms)) {
      config.execoms = execoms;
      config.markModified('execoms');
    }
    if (about && typeof about === 'object') {
      config.about = about;
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
