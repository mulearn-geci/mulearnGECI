const mongoose = require('mongoose');

const AboutConfigSchema = new mongoose.Schema({
  key: { 
    type: String, 
    default: 'main_about_config', 
    unique: true 
  },
  hero: {
    badge: { type: String, default: 'WHO WE ARE' },
    title: { type: String, default: 'About µLearn' },
    description: { 
      type: String, 
      default: 'A vibrant community of students, learners, and innovators working together to create meaningful impact through technology and collaboration.' 
    }
  },
  mission: {
    title: { type: String, default: 'Our Mission' },
    description: { 
      type: String, 
      default: 'To empower students with practical skills, foster innovation, and create a supportive ecosystem where learners can collaborate, grow, and make meaningful contributions to technology and society.' 
    }
  },
  vision: {
    title: { type: String, default: 'Our Vision' },
    description: { 
      type: String, 
      default: 'To be the leading student community that bridges the gap between academic learning and industry requirements, creating future-ready professionals and innovators.' 
    }
  },
  image: { 
    type: String, 
    default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop' 
  },
  imageAlt: { 
    type: String, 
    default: 'Team collaboration' 
  },
  values: {
    type: [
      {
        id: { type: String },
        icon: { type: String, default: 'Target' },
        title: { type: String, required: true },
        description: { type: String, required: true }
      }
    ],
    default: [
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
    ]
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { strict: false });

module.exports = mongoose.model('AboutConfig', AboutConfigSchema);
