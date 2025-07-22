export const formatterNumber = (val: number) => {
  if (!val) return 0;
  return `${val}`
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    .replace(/\.(?=\d{0,2}$)/g, ',');
};

export const formatDecimal = (num: number) => {
  const desimal = num.toString().split('.')[1];
  const digitDesimal = desimal ? desimal.length : 0;

  return num.toLocaleString('id-ID', {
    minimumFractionDigits: digitDesimal,
    maximumFractionDigits: digitDesimal,
  });
};
