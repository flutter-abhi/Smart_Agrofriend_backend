const axios = require('axios');
const getLatLon = async (village, taluka, district, state) => {
    const address = `${village}, ${taluka}, ${district}, ${state}, India`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
        const response = await axios.get(url);
        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        } else {
            console.error("❌ No results found for address:", address);
            return null;
        }
    } catch (error) {
        console.error("❌ Error fetching location:", error.message);
        return null;
    }
};

module.exports = { getLatLon };
