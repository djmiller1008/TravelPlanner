import * as APIUtil from './api_util.js';

// For converting country code to country name
const countryNames = new Intl.DisplayNames(
    ['en'], {type: 'region'}
);

// Initial offset for pagination of intersting places
let offset = 0;

// Define variables for latitude and longitude
let lat;
let lon;

// Keep radius at 1000 meters
const radius = 1000;

// Limit for interesting places search results
const pageLength = 8;

// Define variable for keeping track of how many interesting places are returned
// Using this variable for pagination
let count;

let interestingPlacesList;

document.addEventListener("DOMContentLoaded", () => {
    let submitButton = document.getElementById('discover-submit');
    
    // Check if we are on search page
    if (submitButton !== null) {
        submitButton.addEventListener('click', async () => {

        // Clear the div from previous searches
        document.getElementById('discover-search-result').innerHTML = "";
        document.getElementById('search-result-error').innerHTML = "";
        displayLoading();

        let queryString = document.getElementById('search-input').value;
        const result = await APIUtil.searchDestination(queryString);
        hideLoading();

        if (result.status === 'OK') {
            buildSearchDestinationListObject(result);
        } else {
            renderSearchError();
        }
        })
    } else {
        // We are on the destination info page
        displayDestinationData();

        // Add listeners for next and previous button pagination

        document.getElementById('next-button')
            .addEventListener('click', () => {
                offset += pageLength;
                displayInterestingPlacesList();
            });

        document.getElementById('previous-button')
            .addEventListener('click', () => {
                offset -= pageLength;
                displayInterestingPlacesList();
            })
    } 
})

const buildSearchDestinationListObject = data => {
    const countryName = countryNames.of(data.country);
    const destinationName = data.name;

    const a = document.createElement('a');
    a.className = 'list-group-item search-result';
    a.innerHTML = `${destinationName}, ${countryName}`;
    a.href = `discover/${destinationName}`;

    document.getElementById('discover-search-result').appendChild(a);
}

const displayLoading = () => {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.classList.add('display');   
}

const hideLoading = () => {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.classList.remove('display');
}

const displayDestinationData = async () => {
    displayLoading()
    const destinationName = document.getElementById('destination-name').innerHTML;
    const data = await APIUtil.searchDestination(destinationName);
    lat = data.lat;
    lon = data.lon;

    count = await APIUtil.getCountOfInterestingPlaces(lat, lon, radius, offset, pageLength);

    hideLoading();

    const dataSection = document.createElement('section');

    const country = countryNames.of(data.country);
    const population = data.population;
    const timezone = data.timezone;

    const dataUl = document.createElement('ul');
    dataUl.className = 'list-group';

    const countryLi = document.createElement('li');
    countryLi.innerHTML = `Country: ${country}`;

    const populationLi = document.createElement('li');
    populationLi.innerHTML = `Population: ${population}`;

    const timezoneLi = document.createElement('li');
    timezoneLi.innerHTML = `Timezone: ${timezone}`;

    dataUl.appendChild(countryLi);
    dataUl.appendChild(populationLi);
    dataUl.appendChild(timezoneLi);

    dataSection.appendChild(dataUl);

    document.getElementById('destination-container').appendChild(dataSection);

    displayInterestingPlacesList(count);
}

const displayInterestingPlacesList = async () => {
    // Clear out previous places if any 
    const interestingPlacesDiv = document.getElementById('interesting-places-list');
    interestingPlacesDiv.innerHTML = '';
    displayLoading();
    interestingPlacesList = await APIUtil.searchDestinationRadius(lat, lon, radius, offset, pageLength);
    hideLoading();

    interestingPlacesList.features.forEach(item => {
       
        if (item.properties.name !== '') {
            
            let li = createInterestingPlaceItem(item);
            interestingPlacesDiv.appendChild(li); 
        }
    });

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

const createInterestingPlaceItem = item => {
    let li = document.createElement('li');
    li.innerHTML = item.properties.name;

    li.addEventListener('click', async () => {
        let showDiv = document.getElementById('interesting-place-show');
        showDiv.innerHTML = '';

        const interestingPlaceInfo = await APIUtil.getInterestingPlaceInfo(item.properties.xid);
        console.log(interestingPlaceInfo)
        
        let h1 = document.createElement('h1');
        h1.innerHTML = interestingPlaceInfo.name;
        showDiv.appendChild(h1);

        let span = document.createElement('span');
      
        span.innerHTML = `Type: ${interestingPlaceInfo.kinds}`;
        showDiv.appendChild(span);

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

    })

    return li;
}

const renderSearchError = () => {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-danger search-result'
    li.innerHTML = 'No Destinations Found'

    document.getElementById('search-result-error').appendChild(li);
}
