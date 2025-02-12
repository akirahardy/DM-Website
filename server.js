const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


console.log("🚀 Starting the server...");

const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors());

app.get('/api/properties', async (req, res) => {
    const apiKey = '31877e379e3044838a7635a43f2d9140'; // RentCast API Key
    const url = `https://api.rentcast.io/v1/listings/sale?city=Jacksonville&state=FL&status=Active&limit=5`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': apiKey,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('❌ Error fetching RentCast data:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
