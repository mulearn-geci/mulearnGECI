const mongoose = require('mongoose');

const HomepageConfigSchema = new mongoose.Schema({
  key: { 
    type: String, 
    default: 'main_config', 
    unique: true 
  },
  cards: { 
    type: [mongoose.Schema.Types.Mixed], 
    default: [] 
  },
  igs: { 
    type: [mongoose.Schema.Types.Mixed], 
    default: [] 
  },
  execoms: { 
    type: [mongoose.Schema.Types.Mixed], 
    default: [] 
  },
  about: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { strict: false });

module.exports = mongoose.model('HomepageConfig', HomepageConfigSchema);
