const Alumni = require('../models/Alumni');
const { sendSuccess, sendError, sendCreated, sendNotFound } = require('../utils/responseHandler');
const { deleteFile } = require('../middleware/upload');
const logger = require('../utils/logger');

const defaultAlumni = [
  {
    name: 'Rahul K',
    pastRole: 'Former Campus Lead (2022-23)',
    graduationYear: '2023',
    currentCompany: 'Google',
    currentRole: 'Software Engineer',
    domain: 'Cloud & Systems',
    bio: 'Pioneered early µLearn community initiatives at GECI. Currently working on distributed systems at Google.',
    image: '',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    email: 'rahul.k@alumni.gecidukki.ac.in',
    order: 1
  },
  {
    name: 'Ananya S',
    pastRole: 'Former Technical Lead (2023-24)',
    graduationYear: '2024',
    currentCompany: 'Microsoft',
    currentRole: 'Frontend Engineer',
    domain: 'Web & UI/UX',
    bio: 'Passionate about accessible web applications and UI design systems. Built key projects for µLearn.',
    image: '',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    email: 'ananya.s@alumni.gecidukki.ac.in',
    order: 2
  },
  {
    name: 'Vaisakh M',
    pastRole: 'Former AI/ML IG Lead (2023-24)',
    graduationYear: '2024',
    currentCompany: 'TCS Innovation Labs',
    currentRole: 'AI Research Associate',
    domain: 'AI/ML & NLP',
    bio: 'Mentored over 100+ students in Artificial Intelligence and Machine Learning during college.',
    image: '',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    email: 'vaisakh.m@alumni.gecidukki.ac.in',
    order: 3
  },
  {
    name: 'Devika Nair',
    pastRole: 'Former Women In Tech Lead (2022-23)',
    graduationYear: '2023',
    currentCompany: 'Infosys',
    currentRole: 'Systems Engineer',
    domain: 'Cybersecurity',
    bio: 'Advocate for diversity in technology. Conducted security bootcamps and workshops.',
    image: '',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    email: 'devika.nair@alumni.gecidukki.ac.in',
    order: 4
  }
];

const alumniController = {
  // Get all active Alumni (optional year/role filter)
  getAllAlumni: async (req, res) => {
    try {
      const filter = { isActive: true };
      if (req.query.year) {
        filter.graduationYear = req.query.year;
      }
      const alumni = await Alumni.find(filter).sort({ order: 1, createdAt: 1 });
      return sendSuccess(res, 'Alumni members retrieved successfully', alumni);
    } catch (error) {
      logger.error('Get Alumni error', { error: error.message });
      return sendError(res, 500, 'Failed to fetch alumni members');
    }
  },

  // Get single Alumni member by ID
  getAlumniById: async (req, res) => {
    try {
      const member = await Alumni.findById(req.params.id);
      if (!member) {
        return sendNotFound(res, 'Alumni member not found');
      }
      return sendSuccess(res, 'Alumni member retrieved successfully', member);
    } catch (error) {
      logger.error('Get Alumni by ID error', { error: error.message });
      return sendError(res, 500, 'Failed to fetch alumni member');
    }
  },

  // Create new Alumni member (Admin)
  createAlumni: async (req, res) => {
    try {
      const { 
        name, 
        pastRole, 
        graduationYear, 
        currentCompany, 
        currentRole, 
        domain, 
        bio, 
        linkedin, 
        github, 
        email, 
        instagram, 
        order 
      } = req.body;

      let imagePath = '';
      if (req.file) {
        imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
      } else if (req.body.image) {
        imagePath = req.body.image;
      }

      const member = new Alumni({
        name,
        pastRole,
        graduationYear: graduationYear || '',
        currentCompany: currentCompany || '',
        currentRole: currentRole || '',
        domain: domain || '',
        bio: bio || '',
        image: imagePath,
        linkedin: linkedin || '',
        email: email || '',
        github: github || '',
        instagram: instagram || '',
        order: order ? parseInt(order, 10) : 0
      });

      await member.save();
      logger.info('Alumni member created', { alumniId: member._id, name: member.name });
      return sendCreated(res, 'Alumni member created successfully', member);
    } catch (error) {
      logger.error('Create Alumni error', { error: error.message });
      return sendError(res, 500, 'Failed to create alumni member');
    }
  },

  // Update Alumni member (Admin)
  updateAlumni: async (req, res) => {
    try {
      const member = await Alumni.findById(req.params.id);
      if (!member) {
        return sendNotFound(res, 'Alumni member not found');
      }

      const { 
        name, 
        pastRole, 
        graduationYear, 
        currentCompany, 
        currentRole, 
        domain, 
        bio, 
        linkedin, 
        github, 
        email, 
        instagram, 
        order, 
        isActive 
      } = req.body;

      if (req.file) {
        if (member.image && member.image.startsWith('/uploads/')) {
          deleteFile(member.image);
        }
        member.image = `/${req.file.path.replace(/\\/g, '/')}`;
      } else if (req.body.image !== undefined) {
        member.image = req.body.image;
      }

      if (name) member.name = name;
      if (pastRole) member.pastRole = pastRole;
      if (graduationYear !== undefined) member.graduationYear = graduationYear;
      if (currentCompany !== undefined) member.currentCompany = currentCompany;
      if (currentRole !== undefined) member.currentRole = currentRole;
      if (domain !== undefined) member.domain = domain;
      if (bio !== undefined) member.bio = bio;
      if (linkedin !== undefined) member.linkedin = linkedin;
      if (email !== undefined) member.email = email;
      if (github !== undefined) member.github = github;
      if (instagram !== undefined) member.instagram = instagram;
      if (order !== undefined) member.order = parseInt(order, 10);
      if (isActive !== undefined) member.isActive = Boolean(isActive);

      await member.save();
      logger.info('Alumni member updated', { alumniId: member._id });
      return sendSuccess(res, 'Alumni member updated successfully', member);
    } catch (error) {
      logger.error('Update Alumni error', { error: error.message });
      return sendError(res, 500, 'Failed to update alumni member');
    }
  },

  // Delete Alumni member (Admin)
  deleteAlumni: async (req, res) => {
    try {
      const member = await Alumni.findById(req.params.id);
      if (!member) {
        return sendNotFound(res, 'Alumni member not found');
      }

      if (member.image && member.image.startsWith('/uploads/')) {
        deleteFile(member.image);
      }

      await Alumni.findByIdAndDelete(req.params.id);
      logger.info('Alumni member deleted', { alumniId: req.params.id });
      return sendSuccess(res, 'Alumni member deleted successfully');
    } catch (error) {
      logger.error('Delete Alumni error', { error: error.message });
      return sendError(res, 500, 'Failed to delete alumni member');
    }
  },

  // Reorder Alumni members (Admin)
  reorderAlumni: async (req, res) => {
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
        await Alumni.bulkWrite(bulkOps);
      }

      logger.info('Alumni members reordered successfully', { count: orders.length });
      return sendSuccess(res, 'Alumni members reordered successfully');
    } catch (error) {
      logger.error('Reorder Alumni error', { error: error.message });
      return sendError(res, 500, 'Failed to reorder alumni members');
    }
  },

  // Auto-seed default alumni if collection is empty
  seedDefaultAlumni: async () => {
    try {
      const count = await Alumni.countDocuments();
      if (count === 0) {
        await Alumni.insertMany(defaultAlumni);
        logger.info('Default Alumni entries seeded into database');
      }
    } catch (error) {
      logger.error('Error seeding default Alumni entries', { error: error.message });
    }
  }
};

module.exports = alumniController;
