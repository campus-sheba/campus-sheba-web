export const priceMarkupWithConversion = (details = {}, value, country = {}) => {
  if (
    !!details?.productMarkupPricing?.id &&
    country?.id &&
    !!checkIsInternationalByCountry(country)
  )
    return (
      (+value * (+details?.productMarkupPricing?.markupPricePercentage / 100) + +value) /
      details?.rate?.rate
    )?.toFixed(2);
  else if (
    details?.rate?.rate &&
    !details?.productMarkupPricing?.id &&
    country?.id &&
    checkIsInternationalByCountry(country)
  ) {
    return (+value / details?.rate?.rate).toFixed(2);
  } else return Number(value ?? 0).toFixed(2);
};

export const priceMarkup = (details = {}, value) => {
  if (details?.productMarkupPricing?.id)
    return (
      +value * (+details?.productMarkupPricing?.markupPricePercentage / 100) +
      +value
    )?.toFixed(2);
  else return Number(value ?? 0).toFixed(2);
};

export const priceConversion = (details = {}, value, country) => {
  if (
    details?.rate?.rate &&
    details?.productMarkupPricing?.id &&
    country?.id &&
    checkIsInternationalByCountry(country)
  )
    return (+value / details?.rate?.rate)?.toFixed(2);
  else if (details?.rate?.rate && country?.id && checkIsInternationalByCountry(country)) {
    return (+value / details?.rate?.rate)?.toFixed(2);
  } else return Number(value ?? 0).toFixed(2);
};

export const markUpCurrency = (country = {}) => {
  if (checkIsInternationalByCountry(country)) return '$ ';
  else return '৳ ';
};

export const checkIsInternational = (details = {}) => {
  if (details?.productMarkupPricing?.id)
    return details?.rate?.baseCurrency?.toLowerCase() === 'usd';
  else return false;
};

export const checkIsInternationalByCountry = (details = {}) => {
  if (details?.id) return details?.iso2 != 'BD' ? true : false;
  else return false;
};

export const markUpCurrencyByCurrency = (currency = 'bdt') => {
  if (currency?.toLowerCase() === 'usd') return '$ ';
  else return '৳ ';
};

export const isInternationalByCurrency = (currency = 'bdt') => {
  if (currency?.toLowerCase() === 'usd') return true;
  else return false;
};

// export const dollarToTaka = (details = {}, value) => {
//     if (details?.productMarkupPricing?.id && details?.rate?.rate)
//         return ((+value * +details?.rate?.rate)?.toFixed(2))
//     else return +value?.toFixed(2)
// };

export const dollarToTaka = (details = {}, value) => {
  const numValue = Number(value) || 0;

  if (details?.productMarkupPricing?.id && details?.rate?.rate) {
    return (numValue * Number(details?.rate?.rate)).toFixed(2);
  } else {
    return numValue.toFixed(2);
  }
};
