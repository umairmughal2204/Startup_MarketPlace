const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Entrepreneur', 'Supplier', 'Investor', 'Admin'],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended'],
      default: 'Active',
    },
    phone: {
      type: String,
      default: '',
    },
    profileVisibility: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Public',
    },
    professionalDetails: {
      // Entrepreneur fields
      companyName: String,
      industry: String,
      businessStage: String,
      foundedYear: String,
      
      // Supplier fields
      businessName: String,
      businessType: String,
      productsServices: String,
      yearsInBusiness: String,
      
      // Investor fields
      investmentFirm: String,
      investmentRange: String,
      focusAreas: String,
      investmentStage: String,
    },
    notificationPreferences: {
      orderUpdates: { type: Boolean, default: true },
      investorFeedback: { type: Boolean, default: true },
      newMessages: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
    // Mentor profile fields
    isMentor: {
      type: Boolean,
      default: false,
    },
    mentorBio: {
      type: String,
      default: '',
    },
    expertise: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    mentorAvailability: {
      type: String,
      default: 'Flexible',
    },
    mentorRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    mentorSessions: {
      type: Number,
      default: 0,
    },
    // Co-founder profile fields
    seekingCoFounder: {
      type: Boolean,
      default: false,
    },
    coFounderBio: {
      type: String,
      default: '',
    },
    coFounderSkills: {
      type: [String],
      default: [],
    },
    equityExpectation: {
      type: String,
      default: '',
    },
    coFounderCommitment: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Flexible'],
      default: 'Full-time',
    },
    // Resource tracking
    savedResources: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Resource',
      default: [],
    },
    enrolledWebinars: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Webinar',
      default: [],
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
