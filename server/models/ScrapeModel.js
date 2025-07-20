import mongoose from 'mongoose';

const scrapeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    source: {
      type: String,           // e.g., input URL or prompt
      required: true
    },
    result: {
      type: String,           // final markdown returned by Gemini
      required: true
    },
    intro: {
      type: String,
      default: ''
    },
    analysis: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Scrape', scrapeSchema, 'scrapes');
