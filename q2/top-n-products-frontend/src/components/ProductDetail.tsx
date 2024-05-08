import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Product } from '../types/types';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    axios.get<Product>(`http://your-backend-url/categories/all/products/${productId}`)
      .then(response => {
        setProduct(response.data);
      })
      .catch(error => {
        console.error('Error fetching product details:', error);
      });
  }, [productId]);

  return (
    <div className="product-detail-container">
      {product && (
        <div>
          <h2>{product.name}</h2>
          <p>Company: {product.company}</p>
          <p>Category: {product.category}</p>
          <p>Price: {product.price}</p>
          <p>Rating: {product.rating}</p>
          <p>Discount: {product.discount}</p>
          <p>Availability: {product.availability}</p>
          {/* TODO: Add more when problem resolve */}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
