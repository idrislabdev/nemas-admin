/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '@/@core/utils/axios';

const baseOptions = {
  chart: {
    type: 'pie',
    height: 320,
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
      colors: ['#4CAF50', '#A5D6A7'],
    },
  ],
  credits: { enabled: false },
};

const CostPie = () => {
  const [chartOptions, setChartOptions] = useState(baseOptions);
  const [summary, setSummary] = useState({
    fee_toko: 0,
    fee_third_party: 0,
    total: 0,
  });

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(`/dashboard/cost`);
    const { data } = resp;

    const total = data.fee_toko + data.fee_third_party;
    if (!total) return;

    const arr = [
      {
        name: 'Cost Fee Toko',
        y: parseFloat(((data.fee_toko / total) * 100).toFixed(2)),
      },
      {
        name: 'Cost Pihak Ketiga',
        y: parseFloat(((data.fee_third_party / total) * 100).toFixed(2)),
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
      <h5 className="text-green-700 font-semibold mb-3">Total Cost</h5>

      <div className="flex flex-row items-center justify-between">
        {/* Detail */}
        <div className="w-1/2 text-sm text-neutral-700 space-y-1">
          <p>
            Cost Fee Toko:{' '}
            <span className="font-medium">
              {formatRupiah(summary.fee_toko)}
            </span>
          </p>
          <p>
            Cost Pihak Ketiga:{' '}
            <span className="font-medium">
              {formatRupiah(summary.fee_third_party)}
            </span>
          </p>
          <hr className="my-2 border-neutral-200" />
          <p className="font-semibold text-green-700">
            Total Cost:{' '}
            <span className="font-bold">{formatRupiah(summary.total)}</span>
          </p>
        </div>

        {/* Chart */}
        <div className="w-1/2 flex justify-center">
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            containerProps={{ className: 'w-full h-[320px]' }}
          />
        </div>
      </div>
    </div>
  );
};

export default CostPie;
