import * as APIUtil from './api_util.js';
import * as MAINUtil from './main.js';

// Keep radius at 1000 meters
const radius = 1000;

// Limit for interesting places search results
const pageLength = 8;

// Define variables for latitude and longitude
let lat;
let lon;

// Initial offset for pagination of intersting places
let offset = 0;

// Define variable for keeping track of how many interesting places are returned
// Using this variable for pagination
let count;

document.addEventListener("DOMContentLoaded", () => {
    // Get trip id so we can fetch the itineraries from the backend

    let days = Array.from(document.getElementsByClassName('day-itinerary'));
    const tripId = days[0].dataset.tripid;
   
    // Fetch itineraries and populate the page with those itineraries
    getDayItineraries(tripId).then(itineraries => populateItineraries(days, itineraries));
    activateModal(tripId);

    // If the user clicks the modal, close the modal
    window.onclick = event => {
        let modal = document.getElementById('delete-trip-modal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Add listeners for next and previous button pagination

    

})

const activatePagButtons = dayNumber => {
    document.getElementById('next-button')
    .addEventListener('click', () => {
        offset += pageLength;
        displayInterestingPlacesList(dayNumber);
    });

    document.getElementById('previous-button')
        .addEventListener('click', () => {
            offset -= pageLength;
            displayInterestingPlacesList(dayNumber);
        })
}


const activateModal = tripId => {
    let deleteModalButton = document.getElementById('delete-trip-modal-button');
    let modal = document.getElementById('delete-trip-modal');
    deleteModalButton.addEventListener('click', () => {
        if (modal.style.display === 'none' || modal.style.display == '') {
            modal.style.display = 'block';
        }
    });

    let closeModal = document.getElementById('close-modal');
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    let notDeleteButton = document.getElementById('not-delete');
    notDeleteButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    let yesDeleteButton = document.getElementById('yes-delete');
    yesDeleteButton.addEventListener('click', async () => {
        const result = await APIUtil.deleteSoloTrip(tripId);
        if (result === 'Success') {

            // Redirect to trips page 
            location.href = '/trips'
        }
    })
}



const getDayItineraries = async tripId => {
    const result = await APIUtil.getDayItineraries(tripId);
    return result;
}

// Populate sections with itinerary info and appropriate buttons
const populateItineraries = (days, itineraries) => {
    days.forEach(day => {
        let dayNumber = parseInt(day.id);
        let itinerarySection = document.getElementById(`${dayNumber}-section`);
        
        const itinerarySectionInfo = formatItinerary(dayNumber, itineraries[dayNumber]);
        
        day.addEventListener('click', () => toggleItineraryShow(dayNumber))

        // If user hasn't added an itinerary, render a create button, else render an edit button
        // We need the dayNumber to add a specific id to the button that we can later use in the click listener
        if (itinerarySectionInfo === undefined) {
            addCreateItineraryButton(itinerarySection, dayNumber);
        } else {
            itinerarySection.append(itinerarySectionInfo); 
            addEditButton(itinerarySection, dayNumber);
        }
        
     
    
    })
}

const formatItinerary = (dayNumber, itinerary) => {
    if (itinerary === undefined) return undefined;
    let div = document.getElementById(`${dayNumber}-itinerary-div`);
    if (div) {
        div.remove();
    }
    let formattedItinerary = document.createElement('div');
    formattedItinerary.id = `${dayNumber}-itinerary-div`;
  
    itinerary.split('\n').map(fragment => {
        if (fragment === '') {
            let br = document.createElement('br');
            formattedItinerary.appendChild(br);
        } else {
            let p = document.createElement('p');
            p.innerHTML = fragment;
            formattedItinerary.appendChild(p);
        }
     
    });
    return formattedItinerary;
}

const addEditButton = (itinerarySection, dayNumber) => {
    let editButtonsDiv = document.getElementById(`${dayNumber}-edit-buttons-div`);
    let editItineraryButton = document.createElement('button');
    editItineraryButton.className = 'btn btn-primary edit-itinerary-button';
    editItineraryButton.innerHTML = 'Edit';
    editItineraryButton.style.display = 'none';
    editItineraryButton.id = `${dayNumber}-edit-button`;

    editItineraryButton.addEventListener('click', () => toggleEdit(dayNumber))

    editButtonsDiv.appendChild(editItineraryButton);
}

const addCreateItineraryButton = (itinerarySection, dayNumber) => {
    let createButton = document.createElement('button');
    createButton.className = 'btn btn-primary itinerary-button add-itinerary-button';
    createButton.innerHTML = 'Add Itinerary';
    createButton.style.display = 'none';
    createButton.id = `${dayNumber}-add-button`;

    createButton.addEventListener('click', () => {
        toggleAddItinerary(dayNumber);
        toggleCreateButtonText(dayNumber);
        toggleSubmitButton(dayNumber);
        activateSubmitButton(dayNumber);
    })
    let div = document.getElementById(`${dayNumber}-edit-buttons-div`);
    div.insertBefore(createButton, div.firstChild);
}

const toggleAddItinerary = dayNumber => {
    let section = document.getElementById(`${dayNumber}-section`);
    if (document.getElementById(`${dayNumber}-add-itinerary-textarea`)) {
        let textarea = document.getElementById(`${dayNumber}-add-itinerary-textarea`);
        section.removeChild(textarea);
    } else {
        let textarea = document.createElement('textarea');
        textarea.className = 'add-itinerary-textarea';
        textarea.id = `${dayNumber}-add-itinerary-textarea`;
        section.insertBefore(textarea, section.firstChild);
    }
}

const activateSubmitButton = (dayNumber) => {
    let submit = document.getElementById(`${dayNumber}-submit`);
    submit.addEventListener('click', async () => {
        let textarea = document.getElementById(`${dayNumber}-add-itinerary-textarea`);
        // Check for value of textarea, if empty return error message,
        // else send to api function to create itinerary

        if (textarea.value.replace(/\n/g, '') === '') {
            let errorMessage = document.createElement('span');
            errorMessage.innerHTML = 'Please Enter Your Itinerary';

            let div = document.getElementById(`${dayNumber}`);
            div.appendChild(errorMessage);

            setTimeout(() => {
                errorMessage.remove();
            }, 3000);

        } else {
            let days = Array.from(document.getElementsByClassName('day-itinerary'));
            const tripId = days[0].dataset.tripid;

            let data = {
                day_number: dayNumber,
                trip_id: tripId,
                itinerary: textarea.value
            }

            APIUtil.createDayItinerary(data).then(result => {
                
                let itinerarySection = document.getElementById(`${dayNumber}-section`);
                let formattedItinerary = formatItinerary(dayNumber, result);
                itinerarySection.appendChild(formattedItinerary);

                populateItineraryAfterCreation(itinerarySection, dayNumber);
                toggleLandmarkSection(dayNumber);
                
            })
    

        }
    })
}

const toggleLandmarkSection = dayNumber => {
    let itineraryDiv = document.getElementById(`${dayNumber}-itinerary-div`);
    if (itineraryDiv) {
        let div = document.getElementById(`${dayNumber}-landmark-area-div`);
        if (div.style.display === 'flex') {
            div.style.display = 'none';
        } else {
            div.style.display = 'flex';
            activateAddLandmarkButton(dayNumber);
            // Activate next and previous buttons
            activatePagButtons(dayNumber);
        }
    }
}

const toggleLandmarkContentArea = dayNumber => {
    let landmarkContentDiv = document.getElementById(`${dayNumber}-landmark-area-content`);
    if (landmarkContentDiv.style.display === 'none' || landmarkContentDiv.style.display === '') {
        landmarkContentDiv.style.display = 'flex';
    } else {
        landmarkContentDiv.style.display = 'none';

    }
}

const activateAddLandmarkButton = async dayNumber => {
    let landmarkButton = document.getElementById(`${dayNumber}-add-landmark-button`);
    let dataDiv = document.getElementById(`${dayNumber}`);
    lat = dataDiv.dataset.lat; 
    lon = dataDiv.dataset.lon;
    count = await APIUtil.getCountOfInterestingPlaces(lat, lon, radius, offset, pageLength);
   
    landmarkButton.addEventListener('click', async () => {
        if (document.getElementById(`${dayNumber}-interesting-places-list`).querySelector('li') === null) {
            toggleAddLandmarkButton(landmarkButton, dayNumber);
            toggleLandmarkContentArea(dayNumber);
            await displayInterestingPlacesList(dayNumber);
            
        } else {
            cancelAddLandmark(dayNumber);
            toggleAddLandmarkButton(landmarkButton, dayNumber);
        }
        
    })
}

const toggleAddLandmarkButton = (landmarkButton, dayNumber) => {
    if (landmarkButton.innerHTML === 'Add Landmark') {
        landmarkButton.className = 'btn btn-danger add-landmark-button';
        landmarkButton.innerHTML = 'Cancel';
    } else {
        landmarkButton.className = 'btn btn-primary add-landmark-button'
        landmarkButton.innerHTML = 'Add Landmark';
    }
}

const cancelAddLandmark = dayNumber => {
    let interestingPlacesDiv = document.getElementById(`${dayNumber}-interesting-places-list`);
    interestingPlacesDiv.querySelectorAll('li').forEach(li => li.remove());
    toggleLandmarkContentArea(dayNumber);
}

const displayInterestingPlacesList = async dayNumber => {
    // Clear out previous places if any 
    const interestingPlacesDiv = document.getElementById(`${dayNumber}-interesting-places-list`);
    
    interestingPlacesDiv.querySelectorAll('li').forEach(li => li.remove());


    MAINUtil.displayLoading();
    const result = await APIUtil.searchDestinationRadius(lat, lon, radius, offset, pageLength);
    MAINUtil.hideLoading();
    
    result.features.forEach(item => {
        if (item.properties.name !== '') {
            const listItem = MAINUtil.createInterestingPlaceItem(item);
            
            interestingPlacesDiv.insertBefore(listItem, interestingPlacesDiv.firstChild);
            
        }
    })

    let nextButton = document.getElementById('next-button');
    let previousButton = document.getElementById('previous-button');

    if (count > offset + pageLength) {
    
        nextButton.style.visibility = 'visible';
    } else {
        nextButton.style.visibility = 'hidden';
    }

    if (offset !== 0) {
        previousButton.style.visibility = 'visible';
    } else {
        previousButton.style.visibility = 'hidden';
    }

}


const populateItineraryAfterCreation = (itinerarySection, dayNumber) => {

    // Remove submit button 
    let submitButton = document.getElementById(`${dayNumber}-submit`);
    submitButton.remove();

    // Remove add button
    let addButton = document.getElementById(`${dayNumber}-add-button`);
    addButton.remove();

    // Add edit button and display it
    addEditButton(itinerarySection, dayNumber);
    let button = document.getElementById(`${dayNumber}-edit-button`);
    button.style.display = 'block';

    // Remove textarea from creation form
    let textarea = document.getElementById(`${dayNumber}-add-itinerary-textarea`)
    textarea.remove();
}

const populateItineraryAfterEdit = (itinerarySection, dayNumber) => {
    // Remove textarea from edit form
    let textarea = document.getElementById(`${dayNumber}-edit-textarea`)
    textarea.remove();


    // Remove submit edit button 
    let button = document.getElementById(`${dayNumber}-submit-edit-button`)
    button.remove();

    toggleEditButtonText(dayNumber);
    toggleItineraryShow(dayNumber);

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
    let itineraryDiv = document.getElementById(`${dayNumber}-itinerary-div`)
    let editButtonsDiv = document.getElementById(`${dayNumber}-edit-buttons-div`);

    if (document.getElementById(`${dayNumber}-edit-textarea`)) {
        let textarea = document.getElementById(`${dayNumber}-edit-textarea`)
        textarea.remove();

        let submitButton = document.getElementById(`${dayNumber}-submit-edit-button`);
        submitButton.remove();
        
        itinerarySection.style.display = 'block';

    } else {
        let textarea = document.createElement('textarea');
        let submitButton = document.createElement('button');
        submitButton.id = `${dayNumber}-submit-edit-button`;
        submitButton.className = 'btn btn-primary submit-edit-button';
        submitButton.innerHTML = 'Enter';
        activateSubmitEditButton(dayNumber, submitButton);
        textarea.innerHTML = unformatItinerary(itineraryDiv.innerHTML);
        textarea.className = 'edit-textarea'
        textarea.id = `${dayNumber}-edit-textarea`;
        itinerarySection.style.display = 'none';
        div.insertBefore(textarea, div.firstChild);
        editButtonsDiv.appendChild(submitButton);
    }
    toggleEditButtonText(dayNumber);
}

const activateSubmitEditButton = (dayNumber, button) => {

    button.addEventListener('click', () => {
        let textarea = document.querySelector('textarea');
       
        if (textarea.value.replace(/\n/g, '') === '') {

            let errorMessage = document.createElement('span');
            errorMessage.className = 'itinerary-error';
            errorMessage.innerHTML = 'Itinerary Cannot Be Blank';

            let div = document.getElementById(`${dayNumber}`);
            div.appendChild(errorMessage);

            setTimeout(() => {
                errorMessage.remove()
            }, 3000);

        } else {
            let days = Array.from(document.getElementsByClassName('day-itinerary'));
            const tripId = days[0].dataset.tripid;

            let data = {
                day_number: dayNumber,
                trip_id: tripId,
                itinerary: textarea.value
            }

            APIUtil.editDayItinerary(data).then(result => {
                let itinerarySection = document.getElementById(`${dayNumber}-section`);
                let formattedItinerary = formatItinerary(dayNumber, result);
                itinerarySection.appendChild(formattedItinerary);

                populateItineraryAfterEdit(itinerarySection, dayNumber);
            })

        }
    })
}

const unformatItinerary = itinerary => {
    
    // Replace every pair of p tags and every br tag with a newline
    itinerary = itinerary.replaceAll('<p>', '');
    itinerary = itinerary.replaceAll('<br>', '\n');
    itinerary = itinerary.replaceAll('</p>', '\n');
    
    
    return itinerary;
}

const toggleEditButtonText = dayNumber => {
    let button = document.getElementById(`${dayNumber}-edit-button`);
    if (button.innerHTML === 'Edit') {
        button.innerHTML = 'Cancel';
    } else {
        button.innerHTML = 'Edit';
    }
}

const toggleCreateButtonText = dayNumber => {
    let button = document.getElementById(`${dayNumber}-add-button`);
    if (button.innerHTML === 'Add Itinerary') {
        button.innerHTML = 'Cancel';
    } else {
        button.innerHTML = 'Add Itinerary';
    }
}

const toggleItineraryShow = id => {
    let button;
    let textarea = document.getElementById(`${id}-edit-textarea`);
    if (textarea) {
        if (textarea.style.display !== 'none') {
            textarea.style.display = 'none';
            button = document.getElementById(`${id}-edit-button`);
            button.style.display = 'none';
            let submitButton = document.getElementById(`${id}-submit-edit-button`);
            submitButton.style.display = 'none';
        } else {
            textarea.style.display = 'block';
            button = document.getElementById(`${id}-edit-button`);
            button.style.display = 'block';
            let submitButton = document.getElementById(`${id}-submit-edit-button`);
            submitButton.style.display = 'block';
        
        }
    } else {
        let section = document.getElementById(`${id}-section`);
        let editButton = document.getElementById(`${id}-edit-button`);
        if (editButton) {
            button = editButton;
        } else {
            button = document.getElementById(`${id}-add-button`);
        }
        
        if (section.style.display === '' || section.style.display === 'none') {
            section.style.display = 'block';
            button.style.display = 'block';
            
        } else {
            section.style.display = 'none';
            button.style.display = 'none';
        }
    }
    toggleLandmarkSection(id);
    
}