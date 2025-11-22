import Link from 'next/link';
import React from 'react';

const LaporanTabPenjualanPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'fisik' ? 'active' : ''}`}>
          <Link href={`/laporan/penjualan-emas`}>Emas Fisik</Link>
        </li>
        <li className={`${activeTab === 'digital' ? 'active' : ''}`}>
          <Link href={`/laporan/penjualan-emas/digital`}>Emas Digital</Link>
        </li>
      </ul>
    </div>
  );
};

export default LaporanTabPenjualanPage;
