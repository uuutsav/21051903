const express = require('express');
const axios = require('axios');
const MemoryCache = require('memory-cache');
var cors = require('cors')

const app = express();
const port = 5000;
app.use(cors())


// URL and authorization token, needs to be changed, not working
const baseURL = 'http://20.244.56.144/test';
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE1MTQ5OTQ4LCJpYXQiOjE3MTUxNDk2NDgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjY3YTYxNDQxLWI2ZWItNDRkZC05ZGRjLWY2ZmY5ODU3NGJiMCIsInN1YiI6InV0c2F2LndpbGwud29ya0BnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjY3YTYxNDQxLWI2ZWItNDRkZC05ZGRjLWY2ZmY5ODU3NGJiMCIsImNsaWVudFNlY3JldCI6ImJSeUJ6R0haa1ByVGJDUGQiLCJvd25lck5hbWUiOiJLdW1hciBVdHNhdiIsIm93bmVyRW1haWwiOiJ1dHNhdi53aWxsLndvcmtAZ21haWwuY29tIiwicm9sbE5vIjoiMjEwNTE5MDMifQ.fVxlGrr9YInSGmpWz3nUuxKu9ixfujJc-7jRjE7dQ5g';

// Stores the product data
const cache = new MemoryCache.Cache();

// Fn to call the API and store the data
async function fetchAndStoreData() {
  const companies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
  const categories = ['Phone', 'Computer', 'TV', 'Earphone', 'Tablet', 'Charger', 'Mouse', 'Keypad', 'Bluetooth', 'Pendrive', 'Remote', 'Speaker', 'Headset', 'Laptop', 'PC'];

  for (const company of companies) {
    for (const category of categories) {
      try {
        const url = `${baseURL}/companies/${company}/categories/${category}/products`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            top: 100,
            minPrice: 0,
            maxPrice: Infinity,
          },
        });

        const data = response.data;
        cache.put(`${category}-${company}`, data);
      } catch (error) {
        console.error(`Error fetching data for ${company}, ${category}:`, error.message);
        console.log(`Feeding random data: `)
          const data = {
            "productName": `${category} 0`,
            "price": 0,
            "rating": 0.0,
            "discount": 0,
            "availability": "yes",
            "company": `${company} 0`
          }
          cache.put(`${category}-${company}`, data);
          // categoryProducts.push(...data);

      }
    }
  }
}

// Call the fetchAndStoreData function on server start
fetchAndStoreData();

// Helper function to sort products
function sortProducts(products, sortBy, order) {
  const sortOrder = order === 'asc' ? 1 : -1;

  switch (sortBy) {
    case 'rating':
      return products.sort((a, b) => (a.rating - b.rating) * sortOrder);
    case 'price':
      return products.sort((a, b) => (a.price - b.price) * sortOrder);
    case 'company':
      return products.sort((a, b) => a.companyName.localeCompare(b.companyName) * sortOrder);
    case 'discount':
      return products.sort((a, b) => (a.discount - b.discount) * sortOrder);
    default:
      return products;
  }
}

// Route to retrieve the top 'n' products within a category
app.get('/categories/:categoryName/products', async (req, res) => {
  const categoryName = req.params.categoryName;
  const n = parseInt(req.query.n, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const sortBy = req.query.sortBy || '';
  const order = req.query.order || 'asc';

  // Fetch data from the API if not cached
  const cacheKey = `${categoryName}-all`;
  let categoryProducts = cache.get(cacheKey);

  if (!categoryProducts) {
    const companies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
    categoryProducts = [];

    for (const company of companies) {
      const companyKey = `${categoryName}-${company}`;
      const companyProducts = cache.get(companyKey);

      if (companyProducts) {
        categoryProducts.push(...companyProducts);
      } else {
        try {
          const url = `${baseURL}/companies/${company}/categories/${categoryName}/products`;
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            params: {
              top: 100,
              minPrice: 0,
              maxPrice: Infinity,
            },
          });

          const data = response.data;
          cache.put(companyKey, data);
          categoryProducts.push(...data);
        } catch (error) {
          console.error(`Error fetching data for ${company}, ${categoryName}:`, error.message);
          console.log(`Feeding random data: `)
          const data = [{
            "productName": `${categoryName} 0`,
            "price": 0,
            "rating": 0.0,
            "discount": 0,
            "availability": "yes",
            "company": `${company} 0`
          },
          {
            "productName": `${categoryName} 0`,
            "price": 0,
            "rating": 0.0,
            "discount": 0,
            "availability": "yes",
            "company": `${company} 0`
          },
        ]
          cache.put(companyKey, data);
          categoryProducts.push(...data);

        }
      }
    }

    cache.put(cacheKey, categoryProducts);
  }

  const sortedProducts = sortProducts(categoryProducts, sortBy, order);
  const totalProducts = sortedProducts.length;
  const maxPage = Math.ceil(totalProducts / n);

  if (page < 1 || page > maxPage) {
    return res.status(400).json({ error: `Invalid page number: ${page} max : ${maxPage}` });
  }

  const startIndex = (page - 1) * n;
  const endIndex = startIndex + n;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    currentPage: page,
    totalPages: maxPage,
    totalProducts,
  });
});

// Route to retrieve details of a specific product
app.get('/categories/:categoryName/products/:productId', (req, res) => {
  const categoryName = req.params.categoryName;
  const productId = req.params.productId;

  const cacheKey = `${categoryName}-all`;
  const categoryProducts = cache.get(cacheKey);

  if (categoryProducts) {
    const product = categoryProducts.find((p) => p.id === productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: `Product with ID ${productId} not found` });
    }
  } else {
    res.status(404).json({ error: `No products found for category ${categoryName}` });
  }
});

// Catch-all route for 404 Not Found
app.use((req, res) => {
  res.status(404).send('Not found');
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});