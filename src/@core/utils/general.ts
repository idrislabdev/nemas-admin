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

export const statusTransaksiLangMap: Record<string, string> = {
  order_buy: 'Produk Emas Fisik',
  order_redeem: 'Tarik Emas',
  gold_buy: 'Beli Emas',
  gold_sell: 'Jual',
  gold_transfer_send: 'Transfer Emas',
  gold_transfer_receive: 'Terima Emas',
  disburst: 'Tarik Saldo',
};
