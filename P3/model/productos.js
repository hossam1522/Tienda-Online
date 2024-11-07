import mongoose from "mongoose";
 
const ProductosSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String
  },
  image: {
    type: String
  }
});

const Productos = mongoose.model("productos", ProductosSchema);
export default Productos