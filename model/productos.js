import mongoose from "mongoose";
 
const ProductosSchema = new mongoose.Schema({
  _id:{
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
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
  },
  rating: {
    rate: {
      type: Number,
      required: true,
      min: 0, // Valor mínimo
      max: 5  // Valor máximo
    },
    count: {
      type: Number,
      required: true,
      default: 0 // Valor por defecto
    }
  }
});

const Productos = mongoose.model("productos", ProductosSchema);
export default Productos