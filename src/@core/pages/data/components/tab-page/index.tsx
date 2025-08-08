import Link from 'next/link';
import React from 'react';

const PenggunaTabPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'aplikasi' ? 'active' : ''}`}>
          <Link href={`/data/pengguna/aplikasi`}>Pengguna Aplikasi</Link>
        </li>
        <li className={`${activeTab === 'toko' ? 'active' : ''}`}>
          <Link href={`/data/pengguna/toko`}>Pengguna Toko</Link>
        </li>
      </ul>
    </div>
  );
};

export default PenggunaTabPage;
