import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = ({ products }) => {
  const { id } = useParams();
  const product = products.find((product) => product.id === parseInt(id));

  if (!product) {
    return <div className="not-found">Producto no encontrado.</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-content">
        <img className="product-image" src={product.image} alt={product.title} />
        <h2 className="product-title">{product.title}</h2>
        <p className="product-description">{product.description}</p>
        <p className="product-price">Precio: ${product.price}</p>
        <button className="add-to-cart-btn">Agregar al Carrito</button>
      </div>
    </div>
  );
};

export default ProductDetail;
