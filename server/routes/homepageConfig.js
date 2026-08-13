const express = require('express');
const router = express.Router();
const HomepageConfig = require('../models/HomepageConfig');

// GET homepage customizer config (Atomic findOne with strict cache-busting and deduplication)
router.get('/', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // 1. Find all documents to detect and clean up ghost duplicates
    const allConfigs = await HomepageConfig.find({ key: 'main_config' });
    
    if (allConfigs.length > 1) {
      // Sort by updatedAt descending (newest first)
      allConfigs.sort((a, b) => b.updatedAt - a.updatedAt);
      const toDelete = allConfigs.slice(1).map(c => c._id);
      await HomepageConfig.deleteMany({ _id: { $in: toDelete } });
    }

    let config = allConfigs.length > 0 ? allConfigs[0] : null;
    
    if (!config) {
      config = await HomepageConfig.findOneAndUpdate(
        { key: 'main_config' },
        { $setOnInsert: { key: 'main_config', cards: [], igs: [], execoms: [], about: {}, updatedAt: new Date() } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
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

// POST / UPDATE homepage customizer config (Atomic findOneAndUpdate with upsert)
router.post('/', async (req, res) => {
  try {
    const { cards, igs, execoms, about } = req.body;
    
    const updateFields = {
      updatedAt: new Date()
    };

    if (cards !== undefined && Array.isArray(cards)) {
      updateFields.cards = cards;
    }
    if (igs !== undefined && Array.isArray(igs)) {
      updateFields.igs = igs;
    }
    if (execoms !== undefined && Array.isArray(execoms)) {
      updateFields.execoms = execoms;
    }
    if (about !== undefined && about && typeof about === 'object') {
      const allConfigs = await HomepageConfig.find({ key: 'main_config' });
      if (allConfigs.length > 1) {
        allConfigs.sort((a, b) => b.updatedAt - a.updatedAt);
        const toDelete = allConfigs.slice(1).map(c => c._id);
        await HomepageConfig.deleteMany({ _id: { $in: toDelete } });
      }
      const existing = allConfigs.length > 0 ? allConfigs[0] : null;
      const existingAbout = existing?.about || {};
      updateFields.about = { ...existingAbout, ...about };
    }

    const updatedConfig = await HomepageConfig.findOneAndUpdate(
      { key: 'main_config' },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ 
      success: true, 
      message: 'Homepage configuration saved successfully!', 
      data: updatedConfig 
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
