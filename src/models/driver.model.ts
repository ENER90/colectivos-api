import mongoose, { Document, Schema } from "mongoose";

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  availableSeats: number;
  isActive: boolean;
  timestamp: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
      default: 4,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

driverSchema.index({ location: "2dsphere" });
driverSchema.index({ userId: 1 });
driverSchema.index({ isActive: 1, availableSeats: 1, timestamp: -1 });

export const Driver = mongoose.model<IDriver>("Driver", driverSchema);
