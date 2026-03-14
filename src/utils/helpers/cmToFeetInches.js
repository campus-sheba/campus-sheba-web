export function cmToFeetInches(cm) {
  const totalInches = cm / 2.54; // 1 inch = 2.54 cm
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet} ft ${inches} in`;
}

export function convertHeightCMToFeetInch(heightInCm) {
  const inches = heightInCm / 2.54;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return { feet, inches: remainingInches };
}
