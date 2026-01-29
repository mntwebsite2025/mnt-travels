import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopularRoute: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

locationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);

export default Location;