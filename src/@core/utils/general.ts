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

const provinceMap: Record<string, string> = {
  Aceh: 'Aceh',
  Bali: 'Bali',
  'Bangka Belitung Islands': 'Kepulauan Bangka Belitung',
  Banten: 'Banten',
  Bengkulu: 'Bengkulu',
  'Central Java': 'Jawa Tengah',
  'Central Kalimantan': 'Kalimantan Tengah',
  'Central Sulawesi': 'Sulawesi Tengah',
  'East Java': 'Jawa Timur',
  'East Kalimantan': 'Kalimantan Timur',
  'East Nusa Tenggara': 'Nusa Tenggara Timur',
  Gorontalo: 'Gorontalo',
  Jakarta: 'DKI Jakarta',
  Jambi: 'Jambi',
  Lampung: 'Lampung',
  Maluku: 'Maluku',
  'North Kalimantan': 'Kalimantan Utara',
  'North Maluku': 'Maluku Utara',
  'North Sulawesi': 'Sulawesi Utara',
  'North Sumatra': 'Sumatera Utara',
  Papua: 'Papua',
  Riau: 'Riau',
  'Riau Islands': 'Kepulauan Riau',
  'Southeast Sulawesi': 'Sulawesi Tenggara',
  'South Kalimantan': 'Kalimantan Selatan',
  'South Sulawesi': 'Sulawesi Selatan',
  'South Sumatra': 'Sumatera Selatan',
  'West Java': 'Jawa Barat',
  'West Kalimantan': 'Kalimantan Barat',
  'West Nusa Tenggara': 'Nusa Tenggara Barat',
  'West Papua': 'Papua Barat',
  'West Sulawesi': 'Sulawesi Barat',
  'West Sumatra': 'Sumatera Barat',
  Yogyakarta: 'DI Yogyakarta',
};

export const translateProvince = (stateEn: string) => {
  return provinceMap[stateEn] || stateEn;
};
