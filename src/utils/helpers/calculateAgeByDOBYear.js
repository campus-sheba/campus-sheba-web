export const calculateAgeByDOBYear = (dob, yearOnly = false) => {
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let ageString = years ? `${years}` : '';

  if (yearOnly) {
    return years;
  } else {
    return ageString?.length && ageString;
  }
};
