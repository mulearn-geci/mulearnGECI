const mongoose = require('mongoose');

const HomepageConfigSchema = new mongoose.Schema({
  key: { 
    type: String, 
    default: 'main_config', 
    unique: true 
  },
  cards: { 
    type: Array, 
    default: [] 
  },
  igs: { 
    type: Array, 
    default: [] 
  },
  execoms: { 
    type: Array, 
    default: [] 
  },
  about: {
    type: Object,
    default: {}
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('HomepageConfig', HomepageConfigSchema);
