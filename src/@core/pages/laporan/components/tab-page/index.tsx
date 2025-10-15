import Link from 'next/link';
import React from 'react';

const LaporanTabPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'stock' ? 'active' : ''}`}>
          <Link href={`/laporan/stock`}>Data Stock</Link>
        </li>
        <li className={`${activeTab === 'gold_investment' ? 'active' : ''}`}>
          <Link href={`/laporan/investasi-emas`}>Investasi Emas</Link>
        </li>
        <li className={`${activeTab === 'sales_order' ? 'active' : ''}`}>
          <Link href={`/laporan/penjualan-emas-fisik`}>
            Penjualan Emas Fisik
          </Link>
        </li>
        <li className={`${activeTab === 'gold_loan' ? 'active' : ''}`}>
          <Link href={`/laporan/pinjaman-emas`}>Pinjaman Emas</Link>
        </li>
        <li className={`${activeTab === 'wallet_topup' ? 'active' : ''}`}>
          <Link href={`/laporan/wallet-topup`}>TopUp Saldo</Link>
        </li>
      </ul>
    </div>
  );
};

export default LaporanTabPage;
