const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a property title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location/city'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Please specify property type'],
      enum: ['For Sale', 'For Rent'],
      default: 'For Sale',
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Sold'],
      default: 'Active',
    },
    bedrooms: {
      type: Number,
      required: [true, 'Please specify number of bedrooms'],
      min: [0, 'Bedrooms cannot be negative'],
      default: 1,
    },
    bathrooms: {
      type: Number,
      required: [true, 'Please specify number of bathrooms'],
      min: [0, 'Bathrooms cannot be negative'],
      default: 1,
    },
    area: {
      type: Number,
      required: [true, 'Please specify area in sq ft'],
      min: [10, 'Area must be at least 10 sq ft'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a property description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Property must be assigned to an agent'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Property', PropertySchema);
