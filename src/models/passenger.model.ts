import mongoose, { Document, Schema } from "mongoose";

export interface IPassenger extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  isWaiting: boolean;
  timestamp: Date;
}

const passengerSchema = new Schema<IPassenger>(
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
    isWaiting: {
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

passengerSchema.index({ location: "2dsphere" });
passengerSchema.index({ userId: 1 });
passengerSchema.index({ isWaiting: 1, timestamp: -1 });

export const Passenger = mongoose.model<IPassenger>(
  "Passenger",
  passengerSchema
);
