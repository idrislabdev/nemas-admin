import Link from 'next/link';
import React from 'react';

const SystemConfigTab = (props: { activeTab: string }) => {
  const { activeTab } = props;
  return (
    <div className="tab-default">
      <ul>
        <li className={`${activeTab === 'failed_attempts' ? 'active' : ''}`}>
          <Link href={`/pengaturan/failed-attempts`}>Percobaan Login</Link>
        </li>
      </ul>
    </div>
  );
};

export default SystemConfigTab;
