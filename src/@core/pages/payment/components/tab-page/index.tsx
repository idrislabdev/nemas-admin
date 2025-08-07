import Link from 'next/link';
import React from 'react';

const PengaturanTabpage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'admin' ? 'active' : ''}`}>
          <Link href={`/pengaturan/admin`}>Data Admin</Link>
        </li>
      </ul>
    </div>
  );
};

export default PengaturanTabpage;
