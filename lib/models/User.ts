import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  address: string
  slug: string
  displayName?: string
  bio?: string
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  
  // Social links (optional)
  twitter?: string
  farcaster?: string
  github?: string
  website?: string
  
  // Settings
  preferredCurrency?: string
  minDonationAmount?: number
}

const UserSchema = new Schema<IUser>({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-z0-9-]+$/
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  avatar: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Social links
  twitter: {
    type: String,
    trim: true,
    maxlength: 100
  },
  farcaster: {
    type: String,
    trim: true,
    maxlength: 200
  },
  github: {
    type: String,
    trim: true,
    maxlength: 100
  },
  website: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Settings
  preferredCurrency: {
    type: String,
    default: 'ETH',
    trim: true
  },
  minDonationAmount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Indexes for better query performance (removed duplicates)
UserSchema.index({ createdAt: -1 })

// Prevent re-compilation during development
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema) 