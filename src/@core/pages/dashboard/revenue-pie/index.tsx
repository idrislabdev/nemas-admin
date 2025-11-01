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
      colors: ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9'],
    },
  ],
  credits: { enabled: false },
};

const RevenuePie = () => {
  const [chartOptions, setChartOptions] = useState(baseOptions);
  const [summary, setSummary] = useState({
    selisih_beli_emas: 0,
    selisih_jual_emas: 0,
    biaya_admin: 0,
    biaya_transfer: 0,
    biaya_bulanan: 0,
    total: 0,
  });

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(`/dashboard/revenue`);
    const { data } = resp;

    const total =
      data.selisih_beli_emas +
      data.selisih_jual_emas +
      data.biaya_admin +
      data.biaya_transfer +
      data.biaya_bulanan;

    if (!total) return;

    const arr = [
      {
        name: 'Selisih Beli Emas',
        y: parseFloat(((data.selisih_beli_emas / total) * 100).toFixed(2)),
      },
      {
        name: 'Selisih Jual Emas',
        y: parseFloat(((data.selisih_jual_emas / total) * 100).toFixed(2)),
      },
      {
        name: 'Biaya Admin',
        y: parseFloat(((data.biaya_admin / total) * 100).toFixed(2)),
      },
      {
        name: 'Biaya Transfer',
        y: parseFloat(((data.biaya_transfer / total) * 100).toFixed(2)),
      },
      {
        name: 'Biaya Bulanan',
        y: parseFloat(((data.biaya_bulanan / total) * 100).toFixed(2)),
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
      <h5 className="text-green-700 font-semibold mb-3">Total Pendapatan</h5>

      <div className="flex flex-row items-center justify-between">
        {/* Detail Kiri */}
        <div className="w-1/2 text-sm text-neutral-700 space-y-1">
          <p>
            Selisih Beli Emas:{' '}
            <span className="font-medium">
              {formatRupiah(summary.selisih_beli_emas)}
            </span>
          </p>
          <p>
            Selisih Jual Emas:{' '}
            <span className="font-medium">
              {formatRupiah(summary.selisih_jual_emas)}
            </span>
          </p>
          <p>
            Biaya Admin:{' '}
            <span className="font-medium">
              {formatRupiah(summary.biaya_admin)}
            </span>
          </p>
          <p>
            Biaya Transfer:{' '}
            <span className="font-medium">
              {formatRupiah(summary.biaya_transfer)}
            </span>
          </p>
          <p>
            Biaya Bulanan:{' '}
            <span className="font-medium">
              {formatRupiah(summary.biaya_bulanan)}
            </span>
          </p>
          <hr className="my-2 border-neutral-200" />
          <p className="font-semibold text-green-700">
            Total:{' '}
            <span className="font-bold">{formatRupiah(summary.total)}</span>
          </p>
        </div>

        {/* Chart Kanan */}
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

export default RevenuePie;
