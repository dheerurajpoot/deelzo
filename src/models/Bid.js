import mongoose from "mongoose"

const bidSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    message: String,
    status: {
      type: String,
      enum: ["active", "accepted", "rejected", "withdrawn"],
      default: "active",
    },
  },
  { timestamps: true },
)

export default mongoose.models.Bid || mongoose.model("Bid", bidSchema)
