const Execom = require('../models/Execom');
const { sendSuccess, sendError, sendCreated, sendNotFound } = require('../utils/responseHandler');
const { deleteFile, processUploadedFile } = require('../middleware/upload');
const logger = require('../utils/logger');

const defaultMembers = [
  {
    name: 'Prof. Rejin R',
    position: 'Campus Enabler',
    category: 'execom',
    bio: 'Supporting the community with vision and dedication to foster innovation and collaboration.',
    image: '/uploads/execom/rejin.jpg',
    linkedin: 'https://www.linkedin.com/in/rejin-rajan-779841113/',
    email: 'rejin@gecidukki.ac.in',
    github: 'https://github.com/rejinr89',
    order: 1
  },
  {
    name: 'Albert George',
    position: 'Campus Lead',
    category: 'execom',
    bio: 'Supporting strategic initiatives and driving technical excellence across all projects.',
    image: '/uploads/execom/albert.jpeg',
    linkedin: 'https://www.linkedin.com/in/albert-george-a40101231',
    email: 'albertkavil@gmail.com',
    github: 'https://github.com/albertgrge',
    order: 2
  },
  {
    name: 'Anandhu S Uthaman',
    position: 'Technical Lead',
    category: 'execom',
    bio: 'Leading the technical team and driving innovation in our projects.',
    image: '/uploads/execom/anandhu.jpg',
    linkedin: 'https://www.linkedin.com/in/anandhu-s-uthaman-a44bb3309',
    email: 'anandhuuthaman@gmail.com',
    github: 'https://github.com/AnandhusUthaman',
    order: 3
  },
  {
    name: 'Navya Mariam John',
    position: 'Women In Tech Lead',
    category: 'execom',
    bio: 'Empowering women in tech and fostering a supportive environment for their growth.',
    image: '/uploads/execom/navya.jpg',
    linkedin: 'https://www.linkedin.com/in/navya-mariam-john-72b905315',
    email: 'navyamariam16@gmail.com',
    github: 'https://github.com/NavyaMariamJohn',
    order: 4
  },
  {
    name: 'Nicholas Roy',
    position: 'Community Lead',
    category: 'execom',
    bio: 'Organizing engaging events and workshops to enhance learning experiences.',
    image: '/uploads/execom/nicholas.jpg',
    linkedin: 'https://www.linkedin.com/in/karthik-nair-0000000000',
    email: 'Rizzupnick@gmail.com',
    github: '#',
    order: 5
  },
  {
    name: 'Nidhin Gireesh',
    position: 'Community Lead 2',
    category: 'execom',
    bio: 'Organizing engaging events and workshops to enhance learning experiences.',
    image: '/uploads/execom/nidhin.jpg',
    linkedin: 'https://www.linkedin.com/in/nidhingireesh',
    email: 'nidhingireesh12345@gmail.com',
    github: 'https://github.com/NidhinGireesh',
    order: 6
  },
  {
    name: 'Shimna B',
    position: 'Creative Lead',
    category: 'execom',
    bio: 'Creating visual identity and ensuring consistent design across all platforms.',
    image: '/uploads/execom/shimna.jpg',
    linkedin: 'https://www.linkedin.com/in/shimna-b-b26a502aa',
    email: 'shimna1701@gmail.com',
    github: 'https://github.com/shim07',
    order: 7
  },
  {
    name: 'K S Mohammed Ihsaan',
    position: 'Interest Group Lead',
    category: 'execom',
    bio: 'Leading interest groups and fostering collaboration across diverse areas.',
    image: '/uploads/execom/ihsaan.jpg',
    linkedin: 'https://www.linkedin.com/in/ihsaanmoh',
    email: 'ihsaanmoh8@gmail.com',
    github: 'https://github.com/Ihsaan-Moh',
    order: 8
  },
  {
    name: 'Adithyan VS',
    position: 'Discord Lead',
    category: 'execom',
    bio: 'Managing the Discord server and fostering a vibrant community.',
    image: '/uploads/execom/adithyan.jpg',
    linkedin: '',
    email: 'adithyanvs107@gmail.com',
    github: 'https://github.com/Adithyan-101',
    order: 9
  },
  {
    name: 'Avani M U',
    position: 'Content Lead',
    category: 'execom',
    bio: 'Creating engaging content and managing social media presence.',
    image: '/uploads/execom/avani.jpg',
    linkedin: 'https://www.linkedin.com/in/avani-m-u-630882305',
    email: 'Avanimu2005@gmail.com',
    github: 'https://github.com/avani333',
    order: 10
  },
  {
    name: 'Jeevan Prakash',
    position: 'Media Lead',
    category: 'execom',
    bio: 'Creating engaging content and managing social media presence.',
    image: '/uploads/execom/jeevan.jpeg',
    linkedin: 'https://www.linkedin.com/in/jeevanpksh/',
    email: 'J3257p@gmail.com',
    github: 'https://github.com/jeev3257',
    order: 11
  }
];

const execomController = {
  // Get all active Execom members (optional category filter)
  getAllExecom: async (req, res) => {
    try {
      const filter = { isActive: true };
      if (req.query.category) {
        filter.category = req.query.category;
      }
      let members = await Execom.find(filter).sort({ order: 1, createdAt: 1 });
      if (members.length === 0) {
        await execomController.seedDefaultExecom();
        members = await Execom.find(filter).sort({ order: 1, createdAt: 1 });
      }
      return sendSuccess(res, 'Execom members retrieved successfully', members);
    } catch (error) {
      logger.error('Get Execom error', { error: error.message });
      return sendError(res, 500, 'Failed to fetch Execom members');
    }
  },

  // Get Execom member by ID
  getExecomById: async (req, res) => {
    try {
      const member = await Execom.findById(req.params.id);
      if (!member) {
        return sendNotFound(res, 'Execom member not found');
      }
      return sendSuccess(res, 'Execom member retrieved successfully', member);
    } catch (error) {
      logger.error('Get Execom by ID error', { error: error.message });
      return sendError(res, 500, 'Failed to fetch Execom member');
    }
  },

  // Create Execom member (Admin)
  createExecom: async (req, res) => {
    try {
      const { name, position, category, domain, phone, bio, linkedin, email, github, instagram, order } = req.body;

      let imagePath = '';
      if (req.file) {
        imagePath = processUploadedFile(req.file, 'execom');
      } else if (req.body.image) {
        imagePath = req.body.image;
      }

      const member = new Execom({
        name,
        position,
        category: category || 'execom',
        domain: domain || '',
        phone: phone || '',
        bio: bio || '',
        image: imagePath,
        linkedin: linkedin || '',
        email: email || '',
        github: github || '',
        instagram: instagram || '',
        order: order ? parseInt(order, 10) : 0
      });

      await member.save();
      logger.info('Execom member created', { memberId: member._id, name: member.name, category: member.category });
      return sendCreated(res, 'Execom member created successfully', member);
    } catch (error) {
      logger.error('Create Execom error', { error: error.message });
      return sendError(res, 500, 'Failed to create Execom member');
    }
  },

  // Update Execom member (Admin)
  updateExecom: async (req, res) => {
    try {
      const member = await Execom.findById(req.params.id);
      if (!member) {
        return sendNotFound(res, 'Execom member not found');
      }

      const { name, position, category, domain, phone, bio, linkedin, email, github, instagram, order, isActive } = req.body;

      if (req.file) {
        if (member.image) {
          deleteFile(member.image);
        }
        member.image = processUploadedFile(req.file, 'execom');
      } else if (req.body.image !== undefined) {
        member.image = req.body.image;
      }

      if (name) member.name = name;
      if (position) member.position = position;
      if (category) member.category = category;
      if (domain !== undefined) member.domain = domain;
      if (phone !== undefined) member.phone = phone;
      if (bio !== undefined) member.bio = bio;
      if (linkedin !== undefined) member.linkedin = linkedin;
      if (email !== undefined) member.email = email;
      if (github !== undefined) member.github = github;
      if (instagram !== undefined) member.instagram = instagram;
      if (order !== undefined) member.order = parseInt(order, 10);
      if (isActive !== undefined) member.isActive = Boolean(isActive);

      await member.save();
      logger.info('Execom member updated', { memberId: member._id });
      return sendSuccess(res, 'Execom member updated successfully', member);
    } catch (error) {
      logger.error('Update Execom error', { error: error.message });
      return sendError(res, 500, 'Failed to update Execom member');
    }
  },

  // Delete Execom member (Admin)
  deleteExecom: async (req, res) => {
    try {
      const member = await Execom.findById(req.params.id);
      if (!member) {
        return sendNotFound(res, 'Execom member not found');
      }

      if (member.image && member.image.startsWith('/uploads/') && !member.image.startsWith('/uploads/execom/')) {
        deleteFile(member.image);
      }

      await Execom.findByIdAndDelete(req.params.id);
      logger.info('Execom member deleted', { memberId: req.params.id });
      return sendSuccess(res, 'Execom member deleted successfully');
    } catch (error) {
      logger.error('Delete Execom error', { error: error.message });
      return sendError(res, 500, 'Failed to delete Execom member');
    }
  },

  // Reorder Execom members (Admin)
  reorderExecom: async (req, res) => {
    try {
      const { orders } = req.body; // Array of { id, order }
      if (!Array.isArray(orders)) {
        return sendError(res, 400, 'Orders array is required');
      }

      const bulkOps = orders.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { order: item.order } }
        }
      }));

      if (bulkOps.length > 0) {
        await Execom.bulkWrite(bulkOps);
      }

      logger.info('Execom members reordered successfully', { count: orders.length });
      return sendSuccess(res, 'Execom members reordered successfully');
    } catch (error) {
      logger.error('Reorder Execom error', { error: error.message });
      return sendError(res, 500, 'Failed to reorder Execom members');
    }
  },

  // Auto-seed default members & update empty images or categories in database
  seedDefaultExecom: async () => {
    try {
      const count = await Execom.countDocuments();
      if (count === 0) {
        await Execom.insertMany(defaultMembers);
        logger.info('Default Execom members seeded into database');
      } else {
        // Fix image paths missing /execom/ subfolder
        const allMembers = await Execom.find({});
        for (const m of allMembers) {
          if (m.image && m.image.startsWith('/uploads/') && !m.image.startsWith('/uploads/execom/')) {
            const filename = m.image.replace('/uploads/', '');
            m.image = `/uploads/execom/${filename}`;
            await m.save();
            logger.info(`Fixed image path for ${m.name} to ${m.image}`);
          }
        }
        
        // Ensure default members have category set
        for (const defaultMember of defaultMembers) {
          const existing = await Execom.findOne({ name: defaultMember.name });
          if (existing) {
            let updated = false;
            if (!existing.category) {
              existing.category = 'execom';
              updated = true;
            }
            if (!existing.image || existing.image.trim() === '') {
              existing.image = defaultMember.image;
              updated = true;
            }
            if (updated) {
              await existing.save();
            }
          }
        }

        // Ensure Nithin N domain is set to Game
        const nithin = await Execom.findOne({ name: 'Nithin N' });
        if (nithin && !nithin.domain) {
          nithin.domain = 'Game';
          await nithin.save();
        }
      }
    } catch (error) {
      logger.error('Error seeding default Execom members', { error: error.message });
    }
  }
};

module.exports = execomController;
