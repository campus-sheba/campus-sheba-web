export const formatMobileNumber = mobile => {
  return mobile?.startsWith('+88') ? mobile : `+88${mobile}`;
};
