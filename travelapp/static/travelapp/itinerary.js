import * as APIUtil from './api_util.js';

document.addEventListener("DOMContentLoaded", () => {

    let days = Array.from(document.getElementsByClassName('day-itinerary'));
    const tripId = days[0].dataset.tripid;
   
    getDayItineraries(tripId).then(itineraries => populateItineraries(days, itineraries));


})

const getDayItineraries = async tripId => {
    const result = await APIUtil.getDayItineraries(tripId);
    return result;
}

const populateItineraries = (days, itineraries) => {
    days.forEach(day => {
        let dayNumber = parseInt(day.id);
        let itinerarySection = document.getElementById(`${dayNumber}-section`);
        
        itinerarySection.innerHTML = itineraries[dayNumber];
        day.addEventListener('click', () => toggleItineraryShow(dayNumber))
    
    })
}

const toggleItineraryShow = id => {
    let section = document.getElementById(`${id}-section`)
    if (section.style.display === 'none') {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}