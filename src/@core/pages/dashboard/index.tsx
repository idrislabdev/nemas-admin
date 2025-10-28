'use client';

import PergerakanEmas from '@/@core/pages/dashboard/pergerakan-emas';
import SummaryCards from '@/@core/pages/dashboard/summary-cards';
import React from 'react';

const DashboardPage = () => {
  return (
    <div className="flex flex-col space-y-2">
      <SummaryCards />
      <PergerakanEmas />
    </div>
  );
};

export default DashboardPage;
