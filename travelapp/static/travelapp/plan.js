import * as APIUtil from './api_util.js'

document.addEventListener("DOMContentLoaded", () => {
    let createButton = document.getElementById('create-trip-button');
    createButton.addEventListener('click', async event => {
        event.preventDefault();
        const destination = document.querySelectorAll('input')[1].value;
        const result = await APIUtil.searchDestination(destination);
        if (result.partial_match === true) {
            alert('Destination must be a valid city, region, village, etc.');
            return;
        } else if (result.lat === undefined) {
            alert('Destination must be a valid city, region, village, etc.');
            return;
        } else {
            document.getElementsByName('lat')[0].value = result.lat;
            document.getElementsByName('lon')[0].value = result.lon; 
            document.getElementById('trip-form').submit()
        }
    })
})