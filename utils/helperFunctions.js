const airportsList = require("../utils/airportsList");

const airports = airportsList.airports;

function getCity(code) {
    for (const airport of airports) {
        if (code === airport.IATA_code ) return airport.city_name;  
    }
}

function sorting(details, sortby) {
    if (sortby === "price") {
        details.sort((a, b) => a.price - b.price);
    } 
    else if (sortby === "duration") {
        details.sort((a, b) => {
            // Convert duration string to minutes for comparison
            const getDurationInMinutes = (durationStr) => {
                if (!durationStr) return 0;
                const match = durationStr.match(/(\d+)h\s*(\d+)?m?/);
                if (match) {
                    const hours = parseInt(match[1]) || 0;
                    const minutes = parseInt(match[2]) || 0;
                    return hours * 60 + minutes;
                }
                return 0;
            };
            
            const aMinutes = getDurationInMinutes(a.duration);
            const bMinutes = getDurationInMinutes(b.duration);
            return aMinutes - bMinutes;
        });
    } 
    else if (sortby === "ao") {
        details.sort((a, b) => {
            let fa = a.airline.toLowerCase(),
                fb = b.airline.toLowerCase();
            if (fa < fb) {
                return -1;
            }
            if (fa > fb) {
                return 1;
            }
            return 0;
        });
    }
    return details
}

module.exports = { getCity, sorting };