import Link from 'next/link';
import React from 'react';

const TransaksiTabPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'emas_fisik' ? 'active' : ''}`}>
          <Link href={`/transaksi/emas-fisik`}>Penjualan Produk Emas</Link>
        </li>
        <li className={`${activeTab === 'tarik_emas' ? 'active' : ''}`}>
          <Link href={`/transaksi/tarik-emas`}>Tarik Emas</Link>
        </li>
      </ul>
    </div>
  );
};

export default TransaksiTabPage;
