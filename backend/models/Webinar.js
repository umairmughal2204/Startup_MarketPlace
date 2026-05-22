const mongoose = require('mongoose');

const webinarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      enum: ['Product', 'Fundraising', 'Marketing', 'Legal', 'Technology', 'Operations', 'Finance', 'Strategy'],
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    duration: {
      type: String,
      default: '60 min',
    },
    date: {
      type: Date,
      required: true,
    },
    meetingUrl: {
      type: String,
      default: '',
    },
    isRecorded: {
      type: Boolean,
      default: false,
    },
    recordingUrl: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    enrolledUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    maxParticipants: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Live', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Webinar', webinarSchema);
