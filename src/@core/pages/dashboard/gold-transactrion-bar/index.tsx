/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '@/@core/utils/axios';

const GoldTransactionBar = () => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<string | number>(
    now.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [chartOptions, setChartOptions] = useState<any>(null);

  const getDateRange = (year: number, month: number) => {
    const start_date = new Date(year, month - 1, 1);
    let end_date: Date;

    const today = new Date();
    if (year === today.getFullYear() && month === today.getMonth() + 1) {
      end_date = today;
    } else {
      end_date = new Date(year, month, 0);
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
    try {
      let params: Record<string, string> = {};

      if (selectedYear !== 'all') {
        const { start_date, end_date } = getDateRange(
          Number(selectedYear),
          selectedMonth
        );
        params = { start_date, end_date };
      }

      const resp = await axiosInstance.get('/dashboard/transaction-summary', {
        params,
      });
      const data = resp.data;

      const categories = [
        'Emas Digital',
        'Emas Produk',
        'Tarik Emas',
        'Deposito',
        'Gadai',
        'Transfer Member',
      ];

      const values = [
        data.emas_digital,
        data.emas_produk,
        data.tarik_emas,
        data.deposito,
        data.gadai,
        data.transfer_member,
      ];

      const options = {
        chart: {
          type: 'column',
          height: 320,
          backgroundColor: 'transparent',
        },
        title: { text: '' },
        xAxis: {
          categories,
          labels: {
            style: {
              color: '#2E7D32',
              fontSize: '12px',
              fontWeight: '500',
            },
          },
        },
        yAxis: {
          min: 0,
          title: { text: '' },
          labels: {
            style: {
              color: '#2E7D32',
              fontSize: '11px',
            },
          },
          gridLineColor: '#E0E0E0',
        },
        tooltip: {
          pointFormat: '<b>{point.y:,.2f} gram</b>',
        },
        plotOptions: {
          column: {
            borderRadius: 5,
            dataLabels: {
              enabled: true,
              formatter: function (this: Highcharts.Point): string {
                const value =
                  typeof this.y === 'number' ? this.y.toFixed(2) : '0.00';
                return `${value}g`;
              },
              style: {
                color: '#1B5E20',
                fontSize: '11px',
                fontWeight: '600',
                textOutline: 'none',
              },
            },
          },
        },
        series: [
          {
            name: 'Transaksi Emas',
            data: values,
            color: '#81C784',
          },
        ],
        legend: { enabled: false },
        credits: { enabled: false },
      };

      setChartOptions(options);
    } catch (err) {
      console.error(err);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <h5 className="text-green-700 font-semibold">Transaksi Emas (gram)</h5>

        {/* === Filter Bulan & Tahun === */}
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

      {chartOptions && (
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          containerProps={{ className: 'w-full h-[320px]' }}
        />
      )}
    </div>
  );
};

export default GoldTransactionBar;
