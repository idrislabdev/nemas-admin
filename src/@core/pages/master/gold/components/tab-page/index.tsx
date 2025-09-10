import Link from 'next/link';
import React from 'react';

const GoldTabPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'stock_movement' ? 'active' : ''}`}>
          <Link href={`/master/gold/stock-movement`}>Data Stock</Link>
        </li>
        <li className={`${activeTab === 'gold' ? 'active' : ''}`}>
          <Link href={`/master/gold`}>Data Emas</Link>
        </li>
        <li className={`${activeTab === 'price' ? 'active' : ''}`}>
          <Link href={`/master/gold/price`}>Harga Emas</Link>
        </li>
        <li className={`${activeTab === 'cert' ? 'active' : ''}`}>
          <Link href={`/master/gold/cert`}>Sertifikat</Link>
        </li>
        <li className={`${activeTab === 'cert_price_detail' ? 'active' : ''}`}>
          <Link href={`/master/gold/cert-price-detail`}>Sertifikat Detail</Link>
        </li>
      </ul>
    </div>
  );
};

export default GoldTabPage;
