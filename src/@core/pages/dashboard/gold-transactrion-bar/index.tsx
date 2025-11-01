/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '@/@core/utils/axios';

const GoldTransactionBar = () => {
  const [chartOptions, setChartOptions] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get('/dashboard/transaction-summary');
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
        series: [
          {
            name: 'Transaksi Emas',
            data: values,
            color: '#81C784',
            borderRadius: 5,
          },
        ],
        legend: { enabled: false },
        credits: { enabled: false },
      };

      setChartOptions(options);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="shadow-custom-1 bg-white rounded-[8px] p-[20px]">
      <h5 className="text-green-700 font-semibold mb-3">
        Transaksi Emas (gram)
      </h5>

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
