import mongoose from "mongoose";

const PlatformSettingsSchema = new mongoose.Schema(
  {
    docueeUsdRate: {
      type: Number,
      required: true,
      default: 1500, // ₦ per $1
    },
  },
  { timestamps: true }
);

export default mongoose.models.PlatformSettings ||
  mongoose.model("PlatformSettings", PlatformSettingsSchema);
