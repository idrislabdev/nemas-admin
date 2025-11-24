import Link from 'next/link';
import React from 'react';

const LaporanTab3rdPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'list' ? 'active' : ''}`}>
          <Link href={`/laporan/vendor-3rd`}>Vendor 3rd Party</Link>
        </li>
        <li className={`${activeTab === 'summary' ? 'active' : ''}`}>
          <Link href={`/laporan/vendor-3rd/summary`}>Summary</Link>
        </li>
      </ul>
    </div>
  );
};

export default LaporanTab3rdPage;
