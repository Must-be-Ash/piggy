import mongoose, { Document, Schema } from 'mongoose'

export interface IDonation extends Document {
  // Transaction details
  txHash: string
  chainId: number
  blockNumber?: number
  
  // Addresses
  fromAddress: string
  toAddress: string
  
  // Token information
  tokenAddress: string // '0x0' for native tokens
  tokenSymbol: string
  tokenDecimals: number
  
  // Amount
  amountRaw: string // Raw amount in wei/smallest unit
  amountFormatted: string // Human readable amount
  amountUsd?: number // USD value at time of donation
  
  // Metadata
  message?: string // Optional message from donor
  donorName?: string // Optional donor name
  isAnonymous: boolean
  
  // Status
  status: 'pending' | 'confirmed' | 'failed'
  confirmations: number
  
  // Timestamps
  transactionTimestamp: Date
  createdAt: Date
  updatedAt: Date
}

const DonationSchema = new Schema<IDonation>({
  // Transaction details
  txHash: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  chainId: {
    type: Number,
    required: true,
    index: true
  },
  blockNumber: {
    type: Number,
    index: true
  },
  
  // Addresses
  fromAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  toAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Token information
  tokenAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    default: '0x0' // Native token
  },
  tokenSymbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  tokenDecimals: {
    type: Number,
    required: true,
    default: 18
  },
  
  // Amount
  amountRaw: {
    type: String,
    required: true
  },
  amountFormatted: {
    type: String,
    required: true
  },
  amountUsd: {
    type: Number,
    min: 0
  },
  
  // Metadata
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  donorName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
    index: true
  },
  confirmations: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Timestamps
  transactionTimestamp: {
    type: Date,
    required: true,
    index: true
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

// Compound indexes for better query performance
DonationSchema.index({ toAddress: 1, createdAt: -1 }) // For recipient's donation history
DonationSchema.index({ fromAddress: 1, createdAt: -1 }) // For donor's donation history
DonationSchema.index({ chainId: 1, status: 1 }) // For network-specific queries
DonationSchema.index({ txHash: 1, chainId: 1 }) // For transaction lookups

// Prevent re-compilation during development
export default mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema) 