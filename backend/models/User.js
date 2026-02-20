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
