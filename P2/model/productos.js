import mongoose from "mongoose";
 
//const ProductosSchema = new mongoose.Schema({
//"id": {
//    "type": "Number",
//    "unique": true
//  },
//  // ...
//})

const ProductosSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String
  },
  precio: {
    type: Number,
    required: true
  },
  imagen: {
    type: String
  },
  categoria: {
    type: String
  }
});

const Productos = mongoose.model("productos", ProductosSchema);
export default Productos