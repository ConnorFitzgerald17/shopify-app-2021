const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  id: {
    type: Object,
    required: [true, "ID is required."],
  },
  shopName: {
    type: String,
    required: [true, "Shop name required."],
  },
  options: {
    type: Object,
  },
});

module.exports = mongoose.model("Products", ProductSchema);
