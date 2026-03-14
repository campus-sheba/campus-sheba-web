'use client';
import { useLocale } from 'next-intl';

// Custom hook to format numbers based on the current language
const useNumberFormatter = () => {
  const currentLanguage = useLocale();

  const convertToBanglaNumber = num => {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num
      .toString()
      .split('')
      .map(digit => banglaDigits[parseInt(digit)] || digit)
      .join('');
  };

  const formatNumber = num => {
    return currentLanguage === 'bn' ? convertToBanglaNumber(num) : num;
  };

  return formatNumber;
};

export default useNumberFormatter;
