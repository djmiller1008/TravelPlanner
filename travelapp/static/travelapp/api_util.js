import { apiKey } from "./keys.js";


//Fetches a single destination based on the users search query
export const searchDestination = async query => {
    const response = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?apikey=${apiKey}&name=${query}`);
    const result = await response.json();
    return result;
}

export const searchDestinationRadius = async (lat, lon, radius, offset, pageLength) => {
    const response = await fetch(`https://api.opentripmap.com/0.1/en/places/radius?apikey=${apiKey}&limit=${pageLength}&radius=${radius}&lon=${lon}&lat=${lat}&offset=${offset}`);
    const result = await response.json();
    return result;
}

export const getCountOfInterestingPlaces = async(lat, lon, radius, offset, pageLength) => {
    const response = await fetch(`https://api.opentripmap.com/0.1/en/places/radius?apikey=${apiKey}&limit=${pageLength}&radius=${radius}&lon=${lon}&lat=${lat}&offset=${offset}&format=count`);
    const result = await response.json();
    return result.count;
}