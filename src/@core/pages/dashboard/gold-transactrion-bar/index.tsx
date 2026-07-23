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
        'Jual Emas',
        'Beli Emas',
        'Emas Produk',
        'Tarik Emas',
        'Deposito',
        'Gadai',
        'Transfer Member',
      ];

      const values = [
        data.jual_emas,
        data.beli_emas,
        data.emas_produk,
        data.tarik_emas,
        data.deposito,
        data.gadai,
        data.transfer_member,
      ];

      const options = {
        chart: {
          type: 'column',
          height: 340,
          backgroundColor: 'transparent',
          spacingTop: 10,
          spacingBottom: 10,
        },

        title: {
          text: '',
        },

        xAxis: {
          categories,

          lineWidth: 0,

          tickLength: 0,

          gridLineWidth: 1,

          gridLineColor: '#EEF4FB',

          labels: {
            style: {
              color: '#64748B',
              fontSize: '12px',
              fontWeight: '500',
            },
          },
        },

        yAxis: {
          min: 0,

          title: {
            text: '',
          },

          gridLineColor: '#EEF4FB',

          labels: {
            style: {
              color: '#64748B',
              fontSize: '11px',
            },
          },
        },

        tooltip: {
          useHTML: true,
          backgroundColor: '#FFFFFF',
          borderColor: '#0057B7',
          borderRadius: 12,
          shadow: false,
          formatter: function (this: Highcharts.Point) {
            return `
        <div style="padding:4px 6px">
            <div style="font-size:12px;color:#64748B">
                ${this.category}
            </div>

            <div style="margin-top:6px;font-size:15px">
                <b>${Number(this.y).toFixed(2)} Gram</b>
            </div>
        </div>
      `;
          },
        },

        plotOptions: {
          column: {
            borderRadius: 8,

            borderWidth: 0,

            pointPadding: 0.12,

            groupPadding: 0.08,

            colorByPoint: false,

            states: {
              hover: {
                brightness: -0.08,
              },
            },

            dataLabels: {
              enabled: true,

              formatter: function (this: Highcharts.Point) {
                return `${Number(this.y).toFixed(2)} g`;
              },

              style: {
                color: '#0057B7',
                fontSize: '11px',
                fontWeight: '600',
                textOutline: 'none',
              },
            },
          },
        },

        series: [
          {
            type: 'column',

            name: 'Transaksi',

            data: values,

            color: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1,
              },

              stops: [
                [0, '#4DA3FF'],
                [1, '#0057B7'],
              ],
            },
          },
        ],

        legend: {
          enabled: false,
        },

        credits: {
          enabled: false,
        },
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
        <h5 className="text-primary font-semibold">Transaksi Emas (gram)</h5>

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
