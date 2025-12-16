import Link from 'next/link';
import React from 'react';

const LaporanTabFeeTokoPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'summary' ? 'active' : ''}`}>
          <Link href={`/laporan/fee-toko`}>Summary</Link>
        </li>
        <li className={`${activeTab === 'detail' ? 'active' : ''}`}>
          <Link href={`/laporan/fee-toko/detail`}>Detail</Link>
        </li>
      </ul>
    </div>
  );
};

export default LaporanTabFeeTokoPage;
