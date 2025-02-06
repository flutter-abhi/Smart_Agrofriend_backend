const axios = require('axios');

const getLatLon = async (village, taluka, district, state) => {
    const address = `${village}, ${taluka}, ${district}, ${state}, India`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1`;

    try {
        const response = await axios.get(url);
        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        } else {
            console.error("❌ No results found for address:", address);

            // Try a more general search, e.g., just village and state
            const fallbackAddress = `${taluka},${district}, ${state}, India`;
            const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddress)}&addressdetails=1`;

            const fallbackResponse = await axios.get(fallbackUrl);
            if (fallbackResponse.data.length > 0) {
                const { lat, lon } = fallbackResponse.data[0];
                return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
            } else {

                ///last option
                // Try a more general search, e.g., just village and state
                const fallbackAddress = `${district}, ${state}, India`;
                const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddress)}&addressdetails=1`;

                const fallbackResponse = await axios.get(fallbackUrl);
                if (fallbackResponse.data.length > 0) {
                    const { lat, lon } = fallbackResponse.data[0];
                    return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
                } else {
                    return null;

                }
            }
        }
    } catch (error) {
        console.error("❌ Error fetching location:", error.message);
        return null;
    }
};

module.exports = { getLatLon };
