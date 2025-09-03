import Link from 'next/link';
import React from 'react';

const LaporanTabPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'stock' ? 'active' : ''}`}>
          <Link href={`/payment/bank`}>Data Stock</Link>
        </li>
      </ul>
    </div>
  );
};

export default LaporanTabPage;
