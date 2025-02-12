const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

console.log("🚀 Starting the server...");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());

// ✅ API Keys
const RENTCAST_API_KEY = '31877e379e3044838a7635a43f2d9140';  // RentCast API Key
const GOOGLE_API_KEY = 'AIzaSyBVCVXNvLFT3SBXNRqSw9a5fFawvDjwNTY';  // Replace with your existing Google API Key
const SEARCH_ENGINE_ID = '1354f5e8b097e4bdc';  // Replace with your Google Custom Search Engine ID

// ✅ Function to fetch property images using Google Custom Search API
async function getPropertyImage(address) {
    const query = encodeURIComponent(address + " house for sale");
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${SEARCH_ENGINE_ID}&searchType=image&num=1&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].link;  // First image result
        }
    } catch (error) {
        console.error("❌ Error fetching image:", error);
    }

    return "https://via.placeholder.com/400x200?text=No+Image+Available"; // Default image if no result
}

// ✅ Fetch properties from RentCast & attach images
app.get('/api/properties', async (req, res) => {
    const url = `https://api.rentcast.io/v1/listings/sale?city=Jacksonville&state=FL&status=Active&limit=5`;

    try {
        console.log("📡 Fetching RentCast data...");
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': RENTCAST_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        let properties = await response.json();

        // 🔄 Fetch images for each property
        for (let property of properties) {
            property.image_url = await getPropertyImage(property.formattedAddress);
        }

        res.json(properties);
    } catch (error) {
        console.error("❌ Error fetching property data:", error);
        res.status(500).json({ error: "Failed to fetch properties" });
    }
});

// ✅ Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
