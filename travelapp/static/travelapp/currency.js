import * as APIUtil from './currency_api_util.js';

let exchangeRate;
let reverseExchangeRate;

document.addEventListener("DOMContentLoaded", async () => {
    const select1 = document.getElementById('currencies-1');
    const select2 = document.getElementById('currencies-2');
    const currencies = await APIUtil.getCurrencies();

    Object.keys(currencies).map(currencyCode => {
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        if (currencyCode === 'usd') {
           option1.selected = true;
        } else if (currencyCode === 'eur') {
            option2.selected = true;
        }
        option1.value = currencyCode;
        option1.innerHTML = currencies[currencyCode];
        option2.value = currencyCode;
        option2.innerHTML = currencies[currencyCode];
        select1.appendChild(option1);
        select2.appendChild(option2);
    })

    // Show initial currency conversion
    calculateExchange()

    select1.addEventListener('input', () => {
        calculateExchange();
    })

    select2.addEventListener('input', () => {
        calculateExchange();
    })

    const firstCurrencyInput = document.getElementById('currency-1-input');
    const secondCurrencyInput = document.getElementById('currency-2-input');
    
    firstCurrencyInput.addEventListener('input', () => {
        updateFirstCurrencyInput();
    })

    secondCurrencyInput.addEventListener('input', () => {
        updateSecondCurrencyInput();
    })
});

const updateFirstCurrencyInput = () => {
    const firstCurrencyInput = document.getElementById('currency-1-input');
    const firstCurrencyInputValue = parseInt(firstCurrencyInput.value);
    const secondCurrencyInput = document.getElementById('currency-2-input');

    if (firstCurrencyInputValue && exchangeRate) {
        secondCurrencyInput.value = (firstCurrencyInputValue * exchangeRate).toFixed(2);
    }  else if (!firstCurrencyInputValue) {
        secondCurrencyInput.value = '';
    }
}

const updateSecondCurrencyInput = () => {
    const firstCurrencyInput = document.getElementById('currency-1-input');
    const secondCurrencyInput = document.getElementById('currency-2-input');
    const secondCurrencyInputValue = parseInt(secondCurrencyInput.value);

    if (secondCurrencyInputValue && reverseExchangeRate) {
        firstCurrencyInput.value = (secondCurrencyInputValue * reverseExchangeRate).toFixed(2);
    } else if (!secondCurrencyInputValue) {
        firstCurrencyInput.value = '';
    }
}

const calculateExchange = async () => {
    if (canCalculateExchange()) {
        const firstCurrencySelect = document.getElementById('currencies-1');
        const secondCurrencySelect = document.getElementById('currencies-2');
        
        const firstCurrencyCode = firstCurrencySelect.value;
        const secondCurrencyCode = secondCurrencySelect.value;
        
        const firstCurrency = firstCurrencySelect[firstCurrencySelect.selectedIndex].innerHTML;
        const secondCurrency = secondCurrencySelect[secondCurrencySelect.selectedIndex].innerHTML;

        const exchangeObject = await APIUtil.getExchangeRate(firstCurrencyCode, secondCurrencyCode);
        exchangeRate = exchangeObject[secondCurrencyCode];

        const reverseExchangeObject = await APIUtil.getExchangeRate(secondCurrencyCode, firstCurrencyCode);
        reverseExchangeRate = reverseExchangeObject[firstCurrencyCode];

        displayCurrencyConversion(firstCurrency, secondCurrency);
        updateFirstCurrencyInput();
    }
}


const displayCurrencyConversion = (firstCurrency, secondCurrency) => {
    const firstCurrencySpan = document.getElementById('first-currency-span');
    const secondCurrencySpan = document.getElementById('second-currency-span');

    firstCurrencySpan.innerHTML = `1 ${firstCurrency} equals`;
    secondCurrencySpan.innerHTML = `${exchangeRate} ${secondCurrency}`;
}


const canCalculateExchange = () => {
    const firstCurrencySelect = document.getElementById('currencies-1');
    const secondCurrencySelect = document.getElementById('currencies-2');
    if (firstCurrencySelect.value.length === 0) {
        return false;
    } else if (secondCurrencySelect.value.length === 0) {
        return false;
    }
    return true;
}