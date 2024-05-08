import React from 'react';
import { Link } from 'react-router-dom';
// import { Product } from './types';
import { Product } from '../types/types';

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <img src={product.image} alt={product.name} />
        <h3>{product.name}</h3>
        <p>Company: {product.company}</p>
        <p>Category: {product.category}</p>
        <p>Price: {product.price}</p>
        {/* TODO: Add more when problem resolve */}
      </Link>
    </div>
  );
};

export default ProductCard;
