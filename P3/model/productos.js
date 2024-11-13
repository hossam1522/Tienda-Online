import mongoose from "mongoose";
 
const ProductosSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]/.test(v);
      },
      message: props => `${props.value} debe comenzar con una letra mayúscula!`
    }
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