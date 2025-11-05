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
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<string | number>(
    now.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [chartOptions, setChartOptions] = useState(baseOptions);
  const [summary, setSummary] = useState({
    selisih_beli_emas: 0,
    selisih_jual_emas: 0,
    biaya_admin: 0,
    biaya_transfer: 0,
    biaya_bulanan: 0,
    total: 0,
  });

  const getDateRange = (year: number, month: number) => {
    const start_date = new Date(year, month - 1, 1);
    let end_date: Date;

    const today = new Date();
    if (year === today.getFullYear() && month === today.getMonth() + 1) {
      end_date = today;
    } else {
      end_date = new Date(year, month, 0); // last day of that month
    }

    const formatDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

    return {
      start_date: formatDate(start_date),
      end_date: formatDate(end_date),
    };
  };

  const fetchData = useCallback(async () => {
    let params: Record<string, string> = {};

    // Jika bukan "All", maka kirimkan start_date & end_date
    if (selectedYear !== 'all') {
      const { start_date, end_date } = getDateRange(
        Number(selectedYear),
        selectedMonth
      );
      params = { start_date, end_date };
    }

    const resp = await axiosInstance.get(`/dashboard/revenue`, { params });
    const { data } = resp;

    const total =
      data.selisih_beli_emas +
      data.selisih_jual_emas +
      data.biaya_admin +
      data.biaya_transfer +
      data.biaya_bulanan;

    if (!total) {
      setSummary({
        selisih_beli_emas: 0,
        selisih_jual_emas: 0,
        biaya_admin: 0,
        biaya_transfer: 0,
        biaya_bulanan: 0,
        total: 0,
      });
      setChartOptions(baseOptions);
      return;
    }

    const arr = [
      {
        name: 'Selisih Beli Emas',
        y: parseFloat(((data.selisih_beli_emas / total) * 100).toFixed(1)),
      },
      {
        name: 'Selisih Jual Emas',
        y: parseFloat(((data.selisih_jual_emas / total) * 100).toFixed(1)),
      },
      {
        name: 'Biaya Admin',
        y: parseFloat(((data.biaya_admin / total) * 100).toFixed(1)),
      },
      {
        name: 'Biaya Transfer',
        y: parseFloat(((data.biaya_transfer / total) * 100).toFixed(1)),
      },
      {
        name: 'Biaya Bulanan',
        y: parseFloat(((data.biaya_bulanan / total) * 100).toFixed(1)),
      },
    ];

    const temp = JSON.parse(JSON.stringify(baseOptions));
    temp.series[0].data = arr;
    setChartOptions(temp);
    setSummary({ ...data, total });
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatRupiah = (num: number) =>
    'Rp ' + num.toLocaleString('id-ID', { minimumFractionDigits: 0 });

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const years = ['all', now.getFullYear() - 1, now.getFullYear()];

  return (
    <div className="shadow-custom-1 bg-white rounded-[8px] p-[20px] flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h5 className="text-green-700 font-semibold">Total Pendapatan</h5>

        {/* Filter Bulan & Tahun */}
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            disabled={selectedYear === 'all'}
            className={`border border-neutral-300 rounded-md px-2 h-9 text-sm ${
              selectedYear === 'all'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : ''
            }`}
          >
            {months.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-neutral-300 rounded-md px-2 h-9 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y === 'all' ? 'All' : y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between">
        {/* Detail Kiri */}
        <div className="w-1/2 text-sm text-neutral-700 space-y-1">
          <p>
            Selisih Beli Emas:{' '}
            <span className="font-medium">
              {formatRupiah(summary.selisih_beli_emas)}{' '}
              <span className="text-green-700 text-xs font-bold">
                (
                {parseFloat(
                  ((summary.selisih_beli_emas / summary.total) * 100).toFixed(1)
                )}
                %)
              </span>
            </span>
          </p>
          <p>
            Selisih Jual Emas:{' '}
            <span className="font-medium">
              {formatRupiah(summary.selisih_jual_emas)}{' '}
              <span className="text-green-700 text-xs font-bold">
                (
                {parseFloat(
                  ((summary.selisih_jual_emas / summary.total) * 100).toFixed(1)
                )}
                %)
              </span>
            </span>
          </p>
          <p>
            Biaya Admin:{' '}
            <span className="font-medium">
              {formatRupiah(summary.biaya_admin)}{' '}
              <span className="text-green-700 text-xs font-bold">
                (
                {parseFloat(
                  ((summary.biaya_admin / summary.total) * 100).toFixed(1)
                )}
                %)
              </span>
            </span>
          </p>
          <p>
            Biaya Transfer:{' '}
            <span className="font-medium">
              {formatRupiah(summary.biaya_transfer)}{' '}
              <span className="text-green-700 text-xs font-bold">
                (
                {parseFloat(
                  ((summary.biaya_transfer / summary.total) * 100).toFixed(1)
                )}
                %)
              </span>
            </span>
          </p>
          <p>
            Biaya Bulanan:{' '}
            <span className="font-medium">
              {formatRupiah(summary.biaya_bulanan)}{' '}
              <span className="text-green-700 text-xs font-bold">
                (
                {parseFloat(
                  ((summary.biaya_bulanan / summary.total) * 100).toFixed(1)
                )}
                %)
              </span>
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
