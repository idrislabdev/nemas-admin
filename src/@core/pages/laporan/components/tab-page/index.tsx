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
      </ul>
    </div>
  );
};

export default LaporanTabPage;
