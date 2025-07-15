import mongoose, { Schema } from 'mongoose';

const scrapedDataSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    url: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'Untitled'
    },
    data: {
      type: Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Success'
    }
  },
  { timestamps: true }
);

export default mongoose.model('ScrapedData', scrapedDataSchema);
