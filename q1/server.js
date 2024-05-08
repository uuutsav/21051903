const express = require('express');
const axios = require('axios');

const app = express();
const port = 5000;


// Define the base URL and authorization token
const baseURL = 'http://20.244.56.144/test';
const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE1MTQ5OTQ4LCJpYXQiOjE3MTUxNDk2NDgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjY3YTYxNDQxLWI2ZWItNDRkZC05ZGRjLWY2ZmY5ODU3NGJiMCIsInN1YiI6InV0c2F2LndpbGwud29ya0BnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjY3YTYxNDQxLWI2ZWItNDRkZC05ZGRjLWY2ZmY5ODU3NGJiMCIsImNsaWVudFNlY3JldCI6ImJSeUJ6R0haa1ByVGJDUGQiLCJvd25lck5hbWUiOiJLdW1hciBVdHNhdiIsIm93bmVyRW1haWwiOiJ1dHNhdi53aWxsLndvcmtAZ21haWwuY29tIiwicm9sbE5vIjoiMjEwNTE5MDMifQ.fVxlGrr9YInSGmpWz3nUuxKu9ixfujJc-7jRjE7dQ5g';


// Fn to Call the API and store all the data locally
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
                if (!products.has(category)) {
                    products.set(category, []);
                }
                products.get(category).push(...data.map((product, index) => ({
                    id: `${category}-${index}`,
                    ...product,
                })));
            } catch (error) {
                console.error(`Error fetching data for ${company}, ${category}:`, error.message);
            }
        }
    }
}
fetchAndStoreData();


// Route to retrieve the top 'n' products within a category
app.get('/categories/:categoryName/products', (req, res) => {
    const categoryName = req.params.categoryName;
    const n = parseInt(req.query.top, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;

    if (!products.has(categoryName)) {
        return res.status(404).json({ error: `Category '${categoryName}' not found` });
    }

    const categoryProducts = products.get(categoryName);
    const totalProducts = categoryProducts.length;
    const maxPage = Math.ceil(totalProducts / n);

    if (page < 1 || page > maxPage) {
        return res.status(400).json({ error: `Invalid page number: ${page}` });
    }

    const startIndex = (page - 1) * n;
    const endIndex = startIndex + n;
    const paginatedProducts = categoryProducts.slice(startIndex, endIndex);

    res.json({
        products: paginatedProducts,
        currentPage: page,
        totalPages: maxPage,
        totalProducts,
    });
});










/*
// fn to call the test API
async function callAPI(companyName, categoryName, options) {
    try {
        const url = `${baseURL}/companies/${companyName}/categories/${categoryName}/products`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            params: options,
        });

        return response.data;
    } catch (error) {
        throw new Error(`Error: ${error.message}`);
    }
}
*/

// Route for the API
app.get('/api', async (req, res) => {
    const companyName = req.query.companyName;
    const categoryName = req.query.categoryName;
    const options = {
        top: req.query.top || 10,
        minPrice: req.query.minPrice || 0,
        maxPrice: req.query.maxPrice || Infinity,
    };

    try {
        const data = await callAPI(companyName, categoryName, options);
        res.json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// To Catch-all route that are misspelled
app.use((req, res) => {
    res.status(404).send('Default page for misspelled url - 404 Not found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});