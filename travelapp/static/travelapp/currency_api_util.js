const url = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json'

export const getCurrencies = async () => {
    const response = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json');
    const result = response.json();
    return result;
}

export const getExchangeRate = async (firstCurrencyCode, secondCurrencyCode) => {
    const response = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${firstCurrencyCode}/${secondCurrencyCode}.json`)
    const result = response.json();
    return result;
}