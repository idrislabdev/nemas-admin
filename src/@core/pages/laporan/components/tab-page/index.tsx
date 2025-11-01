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
          <Link href={`/laporan/deposito`}>Deposito</Link>
        </li>
        <li className={`${activeTab === 'deposito_user' ? 'active' : ''}`}>
          <Link href={`/laporan/deposito-user`}>Deposito Per user</Link>
        </li>
        <li className={`${activeTab === 'sales_order' ? 'active' : ''}`}>
          <Link href={`/laporan/penjualan-emas-fisik`}>
            Penjualan Emas Fisik
          </Link>
        </li>
        <li className={`${activeTab === 'gold_loan' ? 'active' : ''}`}>
          <Link href={`/laporan/pinjaman-emas`}>Pinjaman Emas</Link>
        </li>
        <li className={`${activeTab === 'wallet' ? 'active' : ''}`}>
          <Link href={`/laporan/wallet`}>Wallet / Saldo</Link>
        </li>
        <li className={`${activeTab === 'gold_buy_digital' ? 'active' : ''}`}>
          <Link href={`/laporan/pembelian-emas-digital`}>
            Pembelian Emas Digital
          </Link>
        </li>
        <li className={`${activeTab === 'gold_sell_digital' ? 'active' : ''}`}>
          <Link href={`/laporan/penjualan-emas-digital`}>
            Penjualan Emas Digital
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default LaporanTabPage;
