import * as APIUtil from './api_util.js';

document.addEventListener("DOMContentLoaded", () => {
    // Get trip id so we can fetch the itineraries from the backend

    let days = Array.from(document.getElementsByClassName('day-itinerary'));
    const tripId = days[0].dataset.tripid;
   
    // Fetch itineraries and populate the page with those itineraries
    getDayItineraries(tripId).then(itineraries => populateItineraries(days, itineraries));
    
})

const getDayItineraries = async tripId => {
    const result = await APIUtil.getDayItineraries(tripId);
    return result;
}

// Populate sections with itinerary info and appropriate buttons
const populateItineraries = (days, itineraries) => {
    days.forEach(day => {
        let dayNumber = parseInt(day.id);
        let itinerarySection = document.getElementById(`${dayNumber}-section`);
        
        const itinerarySectionInfo = itineraries[dayNumber];
        day.addEventListener('click', () => toggleItineraryShow(dayNumber))

        // If user hasn't added an itinerary, render a create button, else render an edit button
        // We need the dayNumber to add a specific id to the button that we can later use in the click listener
        if (itinerarySectionInfo === undefined) {
            addCreateItineraryButton(itinerarySection, dayNumber);
        } else {
            itinerarySection.innerHTML = itinerarySectionInfo;
            addEditButton(itinerarySection, dayNumber);
        }
        
     
    
    })
}

const addEditButton = (itinerarySection, dayNumber) => {
    let editItineraryButton = document.createElement('button');
    editItineraryButton.className = 'btn btn-primary itinerary-button';
    editItineraryButton.innerHTML = 'Edit';
    editItineraryButton.style.display = 'none';
    editItineraryButton.id = `${dayNumber}-button`;

    editItineraryButton.addEventListener('click', () => toggleEdit(dayNumber))

    itinerarySection.after(editItineraryButton);
}

const addCreateItineraryButton = (itinerarySection, dayNumber) => {
    let createButton = document.createElement('button');
    createButton.className = 'btn btn-primary itinerary-button add-itinerary-button';
    createButton.innerHTML = 'Add Itinerary';
    createButton.style.display = 'none';
    createButton.id = `${dayNumber}-button`;

    createButton.addEventListener('click', () => {
        toggleAddItinerary(dayNumber);
        toggleCreateButtonText(dayNumber);
        toggleSubmitButton(dayNumber);
        activateSubmitButton(dayNumber);
    })

    itinerarySection.append(createButton);
}

const toggleAddItinerary = dayNumber => {
    let div = document.getElementById(`${dayNumber}-div`);
    let section = document.getElementById(`${dayNumber}-section`);
    if (document.querySelector('textarea')) {
        let textarea = document.querySelector('textarea');
        section.removeChild(textarea);
    } else {
        let textarea = document.createElement('textarea');
        textarea.className = 'add-itinerary-textarea';
        section.insertBefore(textarea, section.firstChild);
    }
}

const activateSubmitButton = (dayNumber) => {
    let submit = document.getElementById(`${dayNumber}-submit`);
    submit.addEventListener('click', async () => {
        let textarea = document.querySelector('textarea');
        // Check for value of textarea, if empty return error message,
        // else send to api function to create itinerary

        if (textarea.value === '') {
            let errorMessage = document.createElement('span');
            errorMessage.innerHTML = 'Please Enter Your Itinerary';
        } else {
            let days = Array.from(document.getElementsByClassName('day-itinerary'));
            const tripId = days[0].dataset.tripid;

            let data = {
                day_number: dayNumber,
                trip_id: tripId,
                itinerary: textarea.value
            }

            APIUtil.createDayItinerary(data).then(result => {
                if (result === 'Success') {
                    let itinerarySection = document.getElementById(`${dayNumber}-section`);
                    itinerarySection.innerHTML = textarea.value;
                    addEditButton(itinerarySection, dayNumber);
                    let button = document.getElementById(`${dayNumber}-button`);
                    button.style.display = 'block';
                }
            });

        }
    })
}

const toggleSubmitButton = dayNumber => {
    let submitButton = document.getElementById(`${dayNumber}-submit`);
    if (submitButton.style.display === 'none' || submitButton.style.display === '') {
        submitButton.style.display = 'block';
        
    } else {
        submitButton.style.display = 'none';
    }
}


const toggleEdit = dayNumber => {
    let itinerarySection = document.getElementById(`${dayNumber}-section`);
    let div = document.getElementById(`${dayNumber}-div`);

    if (document.querySelector('textarea')) {
        let textarea = document.querySelector('textarea')
        div.removeChild(textarea);
        itinerarySection.style.display = 'block';

    } else {
        let textArea = document.createElement('textarea');
        textArea.innerHTML = itinerarySection.innerHTML;
        textArea.className = 'edit-textarea'
        itinerarySection.style.display = 'none';
        div.insertBefore(textArea, div.firstChild);
    }
    toggleEditButtonText(dayNumber);
}

const toggleEditButtonText = dayNumber => {
    let button = document.getElementById(`${dayNumber}-button`);
    if (button.innerHTML === 'Edit') {
        button.innerHTML = 'Cancel';
    } else {
        button.innerHTML = 'Edit';
    }
}

const toggleCreateButtonText = dayNumber => {
    let button = document.getElementById(`${dayNumber}-button`);
    if (button.innerHTML === 'Add Itinerary') {
        button.innerHTML = 'Cancel';
    } else {
        button.innerHTML = 'Add Itinerary';
    }
}

const toggleItineraryShow = id => {
    let section = document.getElementById(`${id}-section`);
    let button = document.getElementById(`${id}-button`);
    if (section.style.display === '' || section.style.display === 'none') {
        section.style.display = 'block';
        button.style.display = 'block';
    } else {
        section.style.display = 'none';
        button.style.display = 'none';
    }
}