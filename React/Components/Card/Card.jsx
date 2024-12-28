import React from "react";
import { Link } from "react-router-dom";

const Card = ({ product }) => {
  return (
    <div id="card">
      <img src={product.image} alt="product" />
      <h2>{product.title}</h2>
      <p>{product.description.substring(0, 50)}</p>
      <Link to={`/product/${product.id}`}>
        <button>Buy now</button>
      </Link>
    </div>
  );
};

export default Card;