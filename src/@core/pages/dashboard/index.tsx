'use client';

import CostPie from '@/@core/pages/dashboard/cost-pie';
import GoldTransactionBar from '@/@core/pages/dashboard/gold-transactrion-bar';
import PergerakanEmas from '@/@core/pages/dashboard/pergerakan-emas';
import RevenuePie from '@/@core/pages/dashboard/revenue-pie';
import SaldoWalletPie from '@/@core/pages/dashboard/saldo-wallet-pie';
import StatusDeliveryInvoice from '@/@core/pages/dashboard/status-delivery-invoice';
import StatusWalletFailed from '@/@core/pages/dashboard/status-wallet-failed';
import SummaryCards from '@/@core/pages/dashboard/summary-cards';
import React from 'react';

const DashboardPage = () => {
  return (
    <div className="flex flex-col space-y-2 pb-2">
      <SummaryCards />
      <PergerakanEmas />
      <div className="flex items-center gap-2">
        <div className="w-1/2">
          <GoldTransactionBar />
        </div>
        <div className="w-1/2">
          <SaldoWalletPie />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1/2">
          <CostPie />
        </div>
        <div className="w-1/2">
          <RevenuePie />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1/2">
          <StatusDeliveryInvoice />
        </div>
        <div className="w-1/2">
          <StatusWalletFailed />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
