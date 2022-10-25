import * as APIUtil from './api_util.js';

// For converting country code to country name
const countryNames = new Intl.DisplayNames(
    ['en'], {type: 'region'}
  );

document.addEventListener("DOMContentLoaded", () => {
    let submitButton = document.getElementById('discover-submit');
   
    submitButton.addEventListener('click', async () => {

        // Clear the div from previous searches
        document.getElementById('discover-search-result').innerHTML = "";
        document.getElementById('search-result-error').innerHTML = "";

        let queryString = document.getElementById('search-input').value;
        const result = await APIUtil.searchDestination(queryString);

        if (result.status === 'OK') {
            buildSearchDestinationListObject(result);
        } else {
            renderSearchError();
        }
    })
})

const buildSearchDestinationListObject = data => {
    const countryName = countryNames.of(data.country);
    console.log(data);
    const destinationName = data.name;

    const a = document.createElement('a');
    a.className = 'list-group-item search-result';
    a.innerHTML = `${destinationName}, ${countryName}`;
    a.href = `discover/${destinationName}`;

 

    document.getElementById('discover-search-result').appendChild(a);
}

const renderSearchError = () => {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-danger search-result'
    li.innerHTML = 'No Destinations Found'

    document.getElementById('search-result-error').appendChild(li);
}