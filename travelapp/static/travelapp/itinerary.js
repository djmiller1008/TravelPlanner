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
    getDayItineraries(tripId).then(itineraries => populateItineraries(days, itineraries, tripId));
    activateModal(tripId);

    // Add listeners to create landmark buttons
    activateCreateLandmarkButtons(tripId);



    // If the user clicks the modal, close the modal
    window.onclick = event => {
        let modal = document.getElementById('delete-trip-modal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});

const activateCreateLandmarkButtons = (tripId) => {
    let buttons = document.getElementsByClassName('btn btn-primary create-visit-landmark-button');
    Array.from(buttons).forEach(button => {
        button.addEventListener('click', async () => {
            const h1 = document.getElementById('interesting-place-h1');
            const dayNumber = parseInt(h1.parentElement.id[0]);
            const data = {
                name: h1.innerHTML,
                xid: h1.dataset.xid,
                day_number: h1.parentElement.id[0],
                trip_id: tripId
            }
            let result = await APIUtil.addSoloTripLandmark(data);

            // Landmark has been successfully added
           
            if (result === h1.innerHTML) {
                addLandmarksToVisit(tripId, dayNumber);
            }
        })
    })
}

const activatePagButtons = dayNumber => {
    document.getElementById(`${dayNumber}-next-button`)
    .addEventListener('click', () => {
        offset += pageLength;
        displayInterestingPlacesList(dayNumber);
    });

    document.getElementById(`${dayNumber}-previous-button`)
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
const populateItineraries = (days, itineraries, tripId) => {
    days.forEach(day => {
        let dayNumber = parseInt(day.id);
        let itinerarySection = document.getElementById(`${dayNumber}-section`);
        
        const itinerarySectionInfo = formatItinerary(dayNumber, itineraries[dayNumber]);
        
        day.addEventListener('click', () => {
            toggleItineraryShow(dayNumber);
        });

        
        // If user hasn't added an itinerary, render a create button
        // We need the dayNumber to add a specific id to the button that we can later use in the click listener
        if (itinerarySectionInfo === undefined) {
            addCreateItineraryButton(dayNumber);
        } else {
            itinerarySection.append(itinerarySectionInfo); 
            
        }
        addLandmarksToVisit(tripId, dayNumber);

        // Activate these buttons only once 

        // Activate add landmark button
        activateAddLandmarkButton(dayNumber);
         // Activate next and previous buttons
        activatePagButtons(dayNumber);
        // Activate clear landmarks button
        activateClearLandmarksButton(tripId, dayNumber);

         // Activate submit edit button
         let submitButton = document.getElementById(`${dayNumber}-submit-edit-button`);
         activateSubmitEditButton(dayNumber, submitButton);
 
         // Activate cancel edit button
         let cancelButton = document.getElementById(`${dayNumber}-cancel-edit-button`);
         cancelButton.addEventListener('click', () => toggleEdit(dayNumber));

         // Activate add budget button
         activateEnterBudgetButton(tripId, dayNumber);

         // Display budget if there is one, display an input if not
         let budget = itineraries[`budget_${dayNumber}`];
         displayBudget(dayNumber, budget);

    })
}

const activateEnterBudgetButton = (tripId, dayNumber) => {
    let budgetButton = document.getElementById(`${dayNumber}-add-budget-button`);
    budgetButton.addEventListener('click', async () => {
        let data = document.getElementById(`${dayNumber}-budget-input`).value;
        if (data.length === 0) {
            let span = document.createElement('span');
            span.innerHTML = 'Invalid Entry';
            span.className = 'itinerary-error';

            let div = document.getElementById(`${dayNumber}`);
            div.appendChild(span);

            setTimeout(() => {
                span.remove();
            }, 3000);
            
        } else {
            const response = await APIUtil.addDayBudget(tripId, dayNumber, data);
            if (response === 'Success') {
                toggleAddBudget(dayNumber);
            }
        }
        
    })
}

const displayBudget = (dayNumber, budget) => {
    if (budget > 0) {
        // User has entered a budget, display it and add a click listener to edit the budget
        let budgetSpan = document.getElementById(`${dayNumber}-budget-span`);
        budgetSpan.innerHTML = '$' + budget;
        budgetSpan.style.display = 'inline';

        budgetSpan.addEventListener('click', () => {
            toggleAddBudget(dayNumber);
        });
       
    }
}

const toggleAddBudget = dayNumber => {
    let budgetSpan = document.getElementById(`${dayNumber}-budget-span`);
    let budgetInput = document.getElementById(`${dayNumber}-budget-input`);
    let enterBudgetButton = document.getElementById(`${dayNumber}-add-budget-button`);
    if (budgetSpan.style.display === 'inline') {
        // budget is currently displayed, change to edit display
        budgetSpan.style.display = 'none';
        budgetInput.style.display = 'inline';
        budgetInput.value = budgetSpan.innerHTML.slice(1);

        enterBudgetButton.style.display = 'block';
    } else {
        // change back to normal display
        budgetSpan.innerHTML = '$' + budgetInput.value 
        budgetInput.style.display = 'none';
        budgetSpan.style.display = 'inline';

        enterBudgetButton.style.display = 'none';
    }
}

const activateClearLandmarksButton = (tripId, dayNumber) => {
    let clearLandmarksButton = document.getElementById(`${dayNumber}-clear-landmarks-button`);
    clearLandmarksButton.addEventListener('click', async () => {
        const response = await APIUtil.deleteSoloTripLandmarks(tripId, dayNumber);
        if (response === 'Success') {
            addLandmarksToVisit(tripId, dayNumber);
        } 
    }) 
}

const showClearLandmarksButton = dayNumber => {
    let clearLandmarksButton = document.getElementById(`${dayNumber}-clear-landmarks-button`);
    clearLandmarksButton.style.display = 'block';
}

const hideClearLandmarksButton = dayNumber => {
    let clearLandmarksButton = document.getElementById(`${dayNumber}-clear-landmarks-button`);
    clearLandmarksButton.style.display = 'none';
}

const addLandmarksToVisit = async (tripId, dayNumber) => {
    const landmarksToVisit = await APIUtil.getSoloTripLandmarks(tripId, dayNumber);
    let landmarksToVisitContent = document.getElementById(`${dayNumber}-landmarks-to-visit-content`);
    let ul = document.getElementById(`${dayNumber}-landmarks-to-visit-ul`);
    ul.innerHTML = '';
    if (Object.keys(landmarksToVisit).length > 0 && landmarksToVisit !== 'None') {
        Object.keys(landmarksToVisit).forEach(name => {
            let li = document.createElement('li');
            li.innerHTML = name;
            ul.appendChild(li);
        })
        landmarksToVisitContent.appendChild(ul);
        showClearLandmarksButton(dayNumber);
    } else {
        hideClearLandmarksButton(dayNumber);
    }
}

const formatItinerary = (dayNumber, itinerary) => {
    if (itinerary === undefined) return undefined;
    let div = document.getElementById(`${dayNumber}-itinerary-div`);
    if (div) {
        div.remove();
    }
    let formattedItinerary = document.createElement('div');
    formattedItinerary.addEventListener('click', () => toggleEdit(dayNumber))
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

const addCreateItineraryButton = (dayNumber) => {
    let createButtonsDiv = document.getElementById(`${dayNumber}-create-itinerary-buttons-div`);
    createButtonsDiv.style.display = 'flex';
    let createButton = document.getElementById(`${dayNumber}-add-itinerary-button`);
    createButton.style.display = 'block';
    createButton.addEventListener('click', () => {
        toggleAddItinerary(dayNumber);
        toggleCreateButtonText(dayNumber);
        toggleSubmitButton(dayNumber);
        activateSubmitButton(dayNumber);
    })
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
            toggleAddLandmarkButton(landmarkButton);
        }
        
    })
}

const toggleAddLandmarkButton = (landmarkButton) => {
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

    let nextButton = document.getElementById(`${dayNumber}-next-button`);
    let previousButton = document.getElementById(`${dayNumber}-previous-button`);
    nextButton.style.visibility = 'hidden';
    previousButton.style.visibility = 'hidden';
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
            const listItem = createInterestingPlaceItem(item, dayNumber);
            interestingPlacesDiv.insertBefore(listItem, interestingPlacesDiv.firstChild);
        }
    })

    let nextButton = document.getElementById(`${dayNumber}-next-button`);
    let previousButton = document.getElementById(`${dayNumber}-previous-button`);

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

const createInterestingPlaceItem = (item, dayNumber) => {
    let li = document.createElement('li');
    li.innerHTML = item.properties.name;
    li.className = 'list-group-item list-places';

    li.addEventListener('click', async () => {
        
        toggleInterestingPlaceInfoSection(dayNumber);
        let showDiv = document.getElementById(`${dayNumber}-interesting-place-show`);
        showDiv.innerHTML = '';
        displayInfoLoading();
        const interestingPlaceInfo = await APIUtil.getInterestingPlaceInfo(item.properties.xid);
        hideInfoLoading();
        let h1 = document.createElement('h1');
        h1.id = `interesting-place-h1`;
        h1.innerHTML = interestingPlaceInfo.name;
        h1.dataset.xid = interestingPlaceInfo.xid;
        showDiv.appendChild(h1);

        if (interestingPlaceInfo.preview) {
            let img = document.createElement('img');
            img.src = interestingPlaceInfo.preview.source;
            showDiv.appendChild(img);
        }

        // From opentripmap documentation, checks for possible descriptions 
        showDiv.innerHTML += interestingPlaceInfo.wikipedia_extracts
        ? interestingPlaceInfo.wikipedia_extracts.html
        : interestingPlaceInfo.info
        ? interestingPlaceInfo.info.descr
        : "No description";

        let section = document.getElementById(`${dayNumber}-interesting-place-section`);
        section.style.display = 'block';

    })
    return li;
}

export const displayInfoLoading = () => {
    const loadingDiv = document.getElementsByClassName('itinerary-landmark-info-loading')[0];
    loadingDiv.classList.add('display');   
}

export const hideInfoLoading = () => {
    const loadingDiv = document.getElementsByClassName('itinerary-landmark-info-loading')[0];
    loadingDiv.classList.remove('display');
}

const toggleInterestingPlaceInfoSection = dayNumber => {
    let section = document.getElementById(`${dayNumber}-interesting-place-section`);
    if (section.style.displaydisplay === 'none' !== section.style.display === '') {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}


const populateItineraryAfterCreation = (itinerarySection, dayNumber) => {
    // Hide create itinerary buttons
    let createItineraryButtonsDiv = document.getElementById(`${dayNumber}-create-itinerary-buttons-div`);
    createItineraryButtonsDiv.style.display = 'none';

    // Remove textarea from creation form
    let textarea = document.getElementById(`${dayNumber}-add-itinerary-textarea`)
    textarea.remove();
}

const formatDisplayAfterEdit = (dayNumber) => {
    // Remove textarea from edit form
    let textarea = document.getElementById(`${dayNumber}-edit-textarea`)
    textarea.remove();

    // Display itinerary
    let itinerarySection = document.getElementById(`${dayNumber}-section`);
    itinerarySection.style.display = 'block';

    // Hide edit buttons
    let editButtonsDiv = document.getElementById(`${dayNumber}-edit-buttons-div`);
    editButtonsDiv.style.display = 'none';
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
        // Hide edit area (user is already editing)
        let textarea = document.getElementById(`${dayNumber}-edit-textarea`)
        textarea.remove();
        
        itinerarySection.style.display = 'block';
        editButtonsDiv.style.display = 'none';

    } else {
        // Display edit area (user is not editing)

        // Create a textarea for editing
        let textarea = document.createElement('textarea');
        textarea.innerHTML = unformatItinerary(itineraryDiv.innerHTML);
        textarea.className = 'edit-textarea'
        textarea.id = `${dayNumber}-edit-textarea`;

        itinerarySection.style.display = 'none';
        div.insertBefore(textarea, div.firstChild);
        
        editButtonsDiv.style.display = 'flex';
    }
    
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

                formatDisplayAfterEdit(dayNumber);
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


const toggleCreateButtonText = dayNumber => {
    let button = document.getElementById(`${dayNumber}-add-itinerary-button`);
    if (button.innerHTML === 'Add Itinerary') {
        button.innerHTML = 'Cancel';
    } else {
        button.innerHTML = 'Add Itinerary';
    }
}

const toggleBudgetArea = dayNumber => {
    const budgetSection = document.getElementById(`${dayNumber}-budget-section`);
    if (budgetSection.style.display === 'flex') {
        budgetSection.style.display = 'none';
    } else {
        budgetSection.style.display = 'flex';
    }
}

const toggleItineraryShow = id => {
    const itineraryContentDiv = document.getElementById(`${id}-itinerary-content`);
    if (itineraryContentDiv.style.display === 'flex') {
        itineraryContentDiv.style.display = 'none';
    } else {
        itineraryContentDiv.style.display = 'flex';
    }
}