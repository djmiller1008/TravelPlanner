import { apiKey } from "./keys.js";


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

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

export const getCountOfInterestingPlaces = async (lat, lon, radius, offset, pageLength) => {
    const response = await fetch(`https://api.opentripmap.com/0.1/en/places/radius?apikey=${apiKey}&limit=${pageLength}&radius=${radius}&lon=${lon}&lat=${lat}&offset=${offset}&format=count`);
    const result = await response.json();
    return result.count;
}

export const getInterestingPlaceInfo = async xid => {
    const response = await fetch(`https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${apiKey}`);
    const result = await response.json();
    return result;
}

export const getDayItineraries = async trip_id => {
    const response = await fetch(`/solo_day_itineraries/${trip_id}`);
    const result = await response.json();
    return result;
}

export const createDayItinerary = async data => {
    const response = await fetch('/add_solo_day_itinerary', {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return result;
}

