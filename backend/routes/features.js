const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Webinar = require('../models/Webinar');
const Resource = require('../models/Resource');
const { requireAuth } = require('../middleware/auth');
const { validateBody, isOneOf, isNonEmptyArray, isValidUrl, isFutureDate } = require('../utils/validate');

const verifyUser = requireAuth;
// Mentorship is an opt-in flag (isMentor) on any role, not a separate role value.
const isAdminOrMentor = (user) => user && (user.role === 'Admin' || user.isMentor === true);

const COMMITMENTS = ['Full-time', 'Part-time', 'Flexible'];
const AVAILABILITIES = ['Weekdays', 'Weekends', 'Evenings', 'Flexible'];
const WEBINAR_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const RESOURCE_TYPES = ['Guide', 'Template', 'Case Study', 'Video', 'Tool'];

// ========== MENTORSHIP ROUTES ==========

// GET /api/features/mentors - Get all mentors
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await User.find({ 
      isMentor: true, 
      status: 'Active' 
    }).select('-password -__v');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/features/become-mentor - User opts in as mentor
router.post(
  '/become-mentor',
  verifyUser,
  validateBody({
    mentorBio: { required: true, minLength: 20, message: 'Bio must be at least 20 characters' },
    expertise: { required: true, check: isNonEmptyArray, message: 'Select at least one area of expertise' },
    hourlyRate: { required: true, check: (v) => Number.isFinite(Number(v)) && Number(v) >= 0, message: 'Hourly rate must be a non-negative number' },
    mentorAvailability: { check: isOneOf(AVAILABILITIES), message: 'Please select a valid availability' },
  }),
  async (req, res) => {
  try {
    const { mentorBio, expertise, hourlyRate, mentorAvailability } = req.body;
    
    req.user.isMentor = true;
    req.user.mentorBio = mentorBio || '';
    req.user.expertise = expertise || [];
    req.user.hourlyRate = hourlyRate || 0;
    req.user.mentorAvailability = mentorAvailability || 'Flexible';
    
    await req.user.save();
    res.json({ message: 'You are now a mentor', user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  }
);

// POST /api/features/mentors/:id/book - Book a mentor session (opens chat)
router.post('/mentors/:id/book', verifyUser, async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id);
    if (!mentor || !mentor.isMentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    // Increment session count
    mentor.mentorSessions += 1;
    await mentor.save();
    
    res.json({ 
      message: 'Session booked successfully', 
      mentor: {
        id: mentor._id,
        name: mentor.name,
        role: mentor.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== CO-FOUNDER ROUTES ==========

// GET /api/features/cofounders - Get all users seeking co-founders
router.get('/cofounders', verifyUser, async (req, res) => {
  try {
    const { skills, industry, commitment } = req.query;
    
    let query = { 
      seekingCoFounder: true, 
      status: 'Active' 
    };
    
    if (industry) {
      query['professionalDetails.industry'] = industry;
    }
    if (commitment) {
      query.coFounderCommitment = commitment;
    }
    if (skills) {
      query.coFounderSkills = { $in: skills.split(',') };
    }
    
    const cofounders = await User.find(query).select('-password -__v');
    res.json(cofounders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/features/become-cofounder - User opts in seeking co-founder
router.post(
  '/become-cofounder',
  verifyUser,
  validateBody({
    coFounderBio: { required: true, minLength: 20, message: 'Bio must be at least 20 characters' },
    coFounderSkills: { required: true, check: isNonEmptyArray, message: 'Select at least one skill' },
    equityExpectation: { required: true },
    coFounderCommitment: { check: isOneOf(COMMITMENTS), message: 'Please select a valid commitment' },
  }),
  async (req, res) => {
  try {
    const { coFounderBio, coFounderSkills, equityExpectation, coFounderCommitment } = req.body;

    req.user.seekingCoFounder = true;
    req.user.coFounderBio = coFounderBio || '';
    req.user.coFounderSkills = coFounderSkills || [];
    req.user.equityExpectation = equityExpectation || '';
    req.user.coFounderCommitment = coFounderCommitment || 'Full-time';

    await req.user.save();
    res.json({ message: 'You are now listed as seeking a co-founder', user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  }
);

// GET /api/features/cofounder-skills - Get all unique co-founder skills
router.get('/cofounder-skills', verifyUser, async (req, res) => {
  try {
    const users = await User.find({ seekingCoFounder: true });
    const allSkills = users.flatMap(u => u.coFounderSkills || []);
    const uniqueSkills = [...new Set(allSkills)].sort();
    res.json(uniqueSkills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/features/cofounders/:id/connect - Send a connect request to a co-founder
router.post('/cofounders/:id/connect', verifyUser, async (req, res) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot connect with yourself' });
    }

    const target = await User.findById(req.params.id);
    if (!target || !target.seekingCoFounder) {
      return res.status(404).json({ message: 'Co-founder profile not found' });
    }

    const alreadySent = req.user.coFounderRequestsSent.some(
      (id) => id.toString() === target._id.toString()
    );
    if (!alreadySent) {
      req.user.coFounderRequestsSent.push(target._id);
      target.coFounderRequestsReceived.push(req.user._id);
      await req.user.save();
      await target.save();
    }

    res.json({ message: 'Connect request sent', sent: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/features/my-sent-cofounder-requests - IDs of co-founders the user already requested
router.get('/my-sent-cofounder-requests', verifyUser, async (req, res) => {
  try {
    res.json(req.user.coFounderRequestsSent.map((id) => id.toString()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== WEBINAR ROUTES ==========

// GET /api/features/webinars - Get all webinars
router.get('/webinars', async (req, res) => {
  try {
    const { category, level, status } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (status) query.status = status;
    
    const webinars = await Webinar.find(query)
      .populate('instructorId', 'name')
      .sort({ date: 1 });
    res.json(webinars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/features/webinars/:id - Get single webinar
router.get('/webinars/:id', async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id)
      .populate('instructorId', 'name')
      .populate('enrolledUsers', 'name');
    if (!webinar) {
      return res.status(404).json({ message: 'Webinar not found' });
    }
    res.json(webinar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/features/webinars - Create webinar (admin/mentor only)
router.post(
  '/webinars',
  verifyUser,
  validateBody({
    title: { required: true, minLength: 3, maxLength: 150 },
    instructor: { required: true },
    description: { required: true, minLength: 20, message: 'Description must be at least 20 characters' },
    category: { required: true, check: isOneOf(['Product', 'Fundraising', 'Marketing', 'Legal', 'Technology', 'Operations', 'Finance', 'Strategy']), message: 'Please select a valid category' },
    level: { check: isOneOf(WEBINAR_LEVELS), message: 'Please select a valid level' },
    duration: { required: true },
    date: { required: true, check: isFutureDate, message: 'Webinar date must be in the future' },
    maxParticipants: { check: (v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 10000, message: 'Maximum participants must be between 1 and 10000' },
  }),
  async (req, res) => {
  try {
    if (!isAdminOrMentor(req.user)) {
      return res.status(403).json({ message: 'Only admins or mentors can create webinars' });
    }
    const webinarData = {
      ...req.body,
      instructorId: req.user._id,
    };
    const webinar = new Webinar(webinarData);
    await webinar.save();
    res.status(201).json(webinar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  }
);

// POST /api/features/webinars/:id/enroll - Enroll in webinar
router.post('/webinars/:id/enroll', verifyUser, async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id);
    if (!webinar) {
      return res.status(404).json({ message: 'Webinar not found' });
    }
    
    // Check if already enrolled
    if (webinar.enrolledUsers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled' });
    }
    
    // Check capacity
    if (webinar.enrolledUsers.length >= webinar.maxParticipants) {
      return res.status(400).json({ message: 'Webinar is full' });
    }
    
    webinar.enrolledUsers.push(req.user._id);
    await webinar.save();
    
    // Add to user's enrolled webinars
    req.user.enrolledWebinars.push(webinar._id);
    await req.user.save();
    
    res.json({ message: 'Enrolled successfully', webinar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/features/webinars/:id/rate - Rate a webinar
router.post('/webinars/:id/rate', verifyUser, async (req, res) => {
  try {
    const { rating } = req.body;
    const webinar = await Webinar.findById(req.params.id);
    
    if (!webinar) {
      return res.status(404).json({ message: 'Webinar not found' });
    }
    
    // Calculate new average
    const newRatingCount = webinar.ratingCount + 1;
    const newRating = ((webinar.rating * webinar.ratingCount) + rating) / newRatingCount;
    
    webinar.rating = newRating;
    webinar.ratingCount = newRatingCount;
    await webinar.save();
    
    res.json({ message: 'Rating submitted', rating: newRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== RESOURCE LIBRARY ROUTES ==========

// GET /api/features/resources - Get all resources
router.get('/resources', async (req, res) => {
  try {
    const { type, category } = req.query;
    let query = { isPublished: true };
    
    if (type) query.type = type;
    if (category) query.category = category;
    
    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/features/resources/:id - Get single resource
router.get('/resources/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name');
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/features/resources - Create resource (admin only)
router.post(
  '/resources',
  verifyUser,
  validateBody({
    title: { required: true, minLength: 3, maxLength: 150 },
    description: { required: true, minLength: 10 },
    type: { required: true, check: isOneOf(RESOURCE_TYPES), message: 'Please select a valid type' },
    category: {
      required: true,
      check: isOneOf(['Strategy', 'Planning', 'Finance', 'Product', 'Sales', 'Fundraising', 'Growth', 'Legal', 'Operations', 'Research', 'Marketing', 'Technology']),
      message: 'Please select a valid category',
    },
    fileUrl: { required: true, check: isValidUrl, message: 'Please enter a valid file URL' },
  }),
  async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can create resources' });
    }
    const resourceData = {
      ...req.body,
      uploadedBy: req.user._id,
    };
    const resource = new Resource(resourceData);
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  }
);

// POST /api/features/resources/:id/download - Track download
router.post('/resources/:id/download', verifyUser, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    resource.downloads += 1;
    await resource.save();
    
    res.json({ message: 'Download tracked', downloads: resource.downloads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/features/resources/:id/save - Save resource to user
router.post('/resources/:id/save', verifyUser, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check if already saved
    const alreadySaved = req.user.savedResources.includes(resource._id);
    
    if (alreadySaved) {
      // Unsave
      req.user.savedResources = req.user.savedResources.filter(
        id => id.toString() !== resource._id.toString()
      );
      resource.savedBy = resource.savedBy.filter(
        id => id.toString() !== req.user._id.toString()
      );
      await req.user.save();
      await resource.save();
      res.json({ message: 'Resource unsaved', saved: false });
    } else {
      // Save
      req.user.savedResources.push(resource._id);
      resource.savedBy.push(req.user._id);
      await req.user.save();
      await resource.save();
      res.json({ message: 'Resource saved', saved: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/features/my-saved-resources - Get user's saved resources
router.get('/my-saved-resources', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedResources');
    res.json(user.savedResources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/features/my-enrolled-webinars - Get user's enrolled webinars
router.get('/my-enrolled-webinars', verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledWebinars');
    res.json(user.enrolledWebinars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
