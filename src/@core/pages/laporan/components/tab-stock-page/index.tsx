import Link from 'next/link';
import React from 'react';

const LaporanTabStockPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'stock_emas' ? 'active' : ''}`}>
          <Link href={`/laporan/stock`}>Stock Emas</Link>
        </li>
        <li className={`${activeTab === 'stock_sertifikat' ? 'active' : ''}`}>
          <Link href={`/laporan/stock/sertifikat`}>Stock Sertifikat</Link>
        </li>
      </ul>
    </div>
  );
};

export default LaporanTabStockPage;
