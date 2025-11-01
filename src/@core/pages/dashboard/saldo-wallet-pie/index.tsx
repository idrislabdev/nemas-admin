/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '@/@core/utils/axios';

const baseOptions = {
  chart: {
    type: 'pie',
    height: 320, // ✅ tinggi chart diperlebar
    backgroundColor: 'transparent',
  },
  title: { text: '' },
  tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '{point.y:.1f}%',
        distance: 20,
        style: { fontSize: '12px', color: '#333' },
      },
      showInLegend: false,
    },
  },
  series: [
    {
      name: 'Persentase',
      colorByPoint: true,
      data: [],
      colors: ['#4CAF50', '#81C784', '#A5D6A7'],
    },
  ],
  credits: { enabled: false },
};

const SaldoWalletPie = () => {
  const [chartOptions, setChartOptions] = useState(baseOptions);
  const [summary, setSummary] = useState({
    topup: 0,
    disburst: 0,
    wallet: 0,
    total: 0,
  });

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(`/dashboard/wallet-topup-disburst`);
    const { data } = resp;

    const total = data.wallet + data.topup + data.disburst;
    if (!total) return;

    const arr = [
      {
        name: 'Topup Saldo',
        y: parseFloat(((data.topup / total) * 100).toFixed(2)),
      },
      {
        name: 'Tarik Saldo',
        y: parseFloat(((data.disburst / total) * 100).toFixed(2)),
      },
      {
        name: 'Saldo Wallet',
        y: parseFloat(((data.wallet / total) * 100).toFixed(2)),
      },
    ];

    const temp = JSON.parse(JSON.stringify(baseOptions));
    temp.series[0].data = arr;
    setChartOptions(temp);
    setSummary({ ...data, total });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatRupiah = (num: number) =>
    'Rp ' + num.toLocaleString('id-ID', { minimumFractionDigits: 0 });

  return (
    <div className="shadow-custom-1 bg-white rounded-[8px] p-[20px] flex flex-col">
      <h5 className="text-green-700 font-semibold mb-3">
        Topup, Tarik Saldo & Wallet
      </h5>

      <div className="flex flex-row items-center justify-between">
        {/* Chart */}
        <div className="w-1/2 flex justify-center">
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            containerProps={{ className: 'w-full h-[320px]' }} // ✅ container lebih tinggi
          />
        </div>

        {/* Detail */}
        <div className="w-1/2 text-sm text-neutral-700 space-y-1">
          <p>
            Topup Saldo:{' '}
            <span className="font-medium">{formatRupiah(summary.topup)}</span>
          </p>
          <p>
            Tarik Saldo:{' '}
            <span className="font-medium">
              {formatRupiah(summary.disburst)}
            </span>
          </p>
          <p>
            Saldo Wallet:{' '}
            <span className="font-medium">{formatRupiah(summary.wallet)}</span>
          </p>
          <hr className="my-2 border-neutral-200" />
          <p className="font-semibold text-green-700">
            Total:{' '}
            <span className="font-bold">{formatRupiah(summary.total)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaldoWalletPie;
