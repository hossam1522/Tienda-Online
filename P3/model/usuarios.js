import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  id: {
    type: Number,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    }
  },
  address: {
    city: String,
    street: String,
    number: Number,
    zipcode: String,
    geolocation: {
      lat: String,
      long: String
    }
  },
  phone: String
});

const User = mongoose.model("usuarios", UserSchema);
export default User;
