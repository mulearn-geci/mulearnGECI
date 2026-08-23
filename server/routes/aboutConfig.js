const express = require('express');
const router = express.Router();
const AboutConfig = require('../models/AboutConfig');

// GET about page config (Atomic findOne with cache-busting and deduplication)
router.get('/', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // 1. Find all documents to detect and clean up ghost duplicates
    const allConfigs = await AboutConfig.find({ key: 'main_about_config' });
    
    if (allConfigs.length > 1) {
      allConfigs.sort((a, b) => b.updatedAt - a.updatedAt);
      const toDelete = allConfigs.slice(1).map(c => c._id);
      await AboutConfig.deleteMany({ _id: { $in: toDelete } });
    }

    let config = allConfigs.length > 0 ? allConfigs[0] : null;
    
    if (!config) {
      config = await AboutConfig.findOneAndUpdate(
        { key: 'main_about_config' },
        { 
          $setOnInsert: { 
            key: 'main_about_config', 
            hero: {
              badge: 'WHO WE ARE',
              title: 'About µLearn',
              description: 'A vibrant community of students, learners, and innovators working together to create meaningful impact through technology and collaboration.'
            },
            mission: {
              title: 'Our Mission',
              description: 'To empower students with practical skills, foster innovation, and create a supportive ecosystem where learners can collaborate, grow, and make meaningful contributions to technology and society.'
            },
            vision: {
              title: 'Our Vision',
              description: 'To be the leading student community that bridges the gap between academic learning and industry requirements, creating future-ready professionals and innovators.'
            },
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
            imageAlt: 'Team collaboration',
            values: [
              {
                id: '1',
                icon: 'Target',
                title: 'Innovation',
                description: 'We foster creativity and encourage innovative thinking to solve real-world problems.'
              },
              {
                id: '2',
                icon: 'Users',
                title: 'Collaboration',
                description: 'We believe in the power of teamwork and collective intelligence to achieve greater outcomes.'
              },
              {
                id: '3',
                icon: 'Heart',
                title: 'Inclusivity',
                description: 'We create an environment where everyone feels welcome and valued, regardless of their background.'
              },
              {
                id: '4',
                icon: 'Award',
                title: 'Excellence',
                description: 'We strive for the highest standards in everything we do and celebrate achievements.'
              }
            ],
            updatedAt: new Date() 
          } 
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

    return res.json({ 
      success: true, 
      data: config 
    });
  } catch (err) {
    console.error('Error fetching about config:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch about configuration',
      error: err.message 
    });
  }
});

// POST / UPDATE about page config (Atomic findOneAndUpdate with upsert)
router.post('/', async (req, res) => {
  try {
    const { hero, mission, vision, image, imageAlt, values } = req.body;
    
    const updateFields = {
      updatedAt: new Date()
    };

    if (hero !== undefined && typeof hero === 'object') {
      updateFields.hero = hero;
    }
    if (mission !== undefined && typeof mission === 'object') {
      updateFields.mission = mission;
    }
    if (vision !== undefined && typeof vision === 'object') {
      updateFields.vision = vision;
    }
    if (image !== undefined && typeof image === 'string') {
      updateFields.image = image;
    }
    if (imageAlt !== undefined && typeof imageAlt === 'string') {
      updateFields.imageAlt = imageAlt;
    }
    if (values !== undefined && Array.isArray(values)) {
      updateFields.values = values;
    }

    const updatedConfig = await AboutConfig.findOneAndUpdate(
      { key: 'main_about_config' },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ 
      success: true, 
      message: 'About page configuration saved successfully!', 
      data: updatedConfig 
    });
  } catch (err) {
    console.error('Error saving about config:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to save about configuration',
      error: err.message 
    });
  }
});

module.exports = router;
