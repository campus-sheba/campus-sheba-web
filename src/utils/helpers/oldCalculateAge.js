export const calculateAge = (dob, yearOnly = false) => {
  if (!dob) return '';
  const birthDate = new Date(dob);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let ageString = years ? `${years} ${years === 1 ? 'Year' : 'Years'}` : '';

  if (yearOnly) {
    return years;
  } else {
    return ageString?.length && ageString;
  }
};

export const calculateDOB = age => {
  if (!age) return;
  const currentDate = new Date();
  const birthYear = currentDate.getFullYear() - age;

  const birthDate = new Date(currentDate.setFullYear(birthYear));

  const year = birthDate.getFullYear();
  const month = ('0' + (birthDate.getMonth() + 1)).slice(-2);
  const day = ('0' + birthDate.getDate()).slice(-2);

  return `${year}-${month}-${day}`;
};
