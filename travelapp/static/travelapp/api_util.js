import { apiKey } from "./keys.js";


//Fetches a single destination based on the users search query
export const searchDestination = async query => {
    const response = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?apikey=${apiKey}&name=${query}`)
    const result = await response.json();
    return result;
}

