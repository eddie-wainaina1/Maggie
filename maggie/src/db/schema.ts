import "@/lib/loadEnv";
import mongoose from "mongoose";

export const connect = async () => {
  if (process.env.MONGO_URI) {
    return await mongoose.connect(process.env.MONGO_URI);
  } else {
    throw new Error("DB URI not found");
  }
};

export const ProductSchema = new mongoose.Schema({
  name: String,
  productId: String,
  description: String,
  price: Number,
  imageUrl: String,
  inStock: Number,
  tags: [String],
});
export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export const OrderSchema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  totalCost: Number,
  phoneNumber: String,
  email: String,
  customerName: String,
  location: {
    name: String,
    mapsData: String,
    description: String,
    pinUrl: String,
  },
  description: String,
  reference: [String],
  status: String,
  fulfilled: { type: Boolean, default: false },
  orderTime: { type: Date, default: () => new Date() },
  modifiedOn: { type: Date, default: () => new Date() },
});
OrderSchema.pre("save", function (next) {
  this.modifiedOn = new Date();
  next();
});
export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export const HistoryObjectSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, required: true },
  comments: [String],
});
export const OrderHistorySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  history: [HistoryObjectSchema],
});
export const OrderHistory =
  mongoose.models.OrderHistory ||
  mongoose.model("OrderHistory", OrderHistorySchema);
