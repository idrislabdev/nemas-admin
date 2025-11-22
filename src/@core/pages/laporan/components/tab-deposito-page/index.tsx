import Link from 'next/link';
import React from 'react';

const LaporanTabDepositoPage = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'gold_investment' ? 'active' : ''}`}>
          <Link href={`/laporan/deposito`}>Deposito</Link>
        </li>
        <li className={`${activeTab === 'deposito_user' ? 'active' : ''}`}>
          <Link href={`/laporan/deposito/user`}>Deposito Per user</Link>
        </li>
      </ul>
    </div>
  );
};

export default LaporanTabDepositoPage;
