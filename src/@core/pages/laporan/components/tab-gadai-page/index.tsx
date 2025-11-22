import Link from 'next/link';
import React from 'react';

const LaporanTabGadaiPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'gadai' ? 'active' : ''}`}>
          <Link href={`/laporan/gadai-emas`}>Gadai Emas</Link>
        </li>
        <li className={`${activeTab === 'rekap' ? 'active' : ''}`}>
          <Link href={`/laporan/gadai-emas/rekap`}>
            Rekapitulasi Gadai Aktif
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default LaporanTabGadaiPage;
