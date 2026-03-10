/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
/* eslint-disable prefer-spread */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '@/@core/utils/axios';
import moment from 'moment';
import 'moment/locale/id';
import { Select } from 'antd';

moment.locale('id');

const PergerakanEmas = () => {
  const [dataChart, setDataChart] = useState<{
    categories: string[];
    data: number[];
  }>({
    categories: [],
    data: [],
  });
  const [options, setOptions] = useState<any>({});
  const [type, setType] = useState('buy');
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  // Fetch data chart
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(`/reports/gold-chart/monthly`);
      const data = resp.data;

      const categories: string[] = [];
      const dataVal: number[] = [];

      data.forEach(
        (item: {
          day: string;
          gold_price_buy: number;
          gold_price_sell: number;
        }) => {
          categories.push(moment(item.day).format('DD MMM'));
          if (type == 'buy') {
            dataVal.push(item.gold_price_buy);
          } else {
            dataVal.push(item.gold_price_sell);
          }
        }
      );

      setDataChart({ categories, data: dataVal });
    } catch (error) {
      console.error('Failed to fetch gold chart data:', error);
    }
  }, [type]);

  // Setup chart options
  const updateChart = useCallback(() => {
    if (!dataChart?.categories?.length) return;

    const temp = {
      chart: {
        type: 'areaspline',
        backgroundColor: 'transparent',
        height: 360,
      },
      title: {
        text: '',
      },
      colors: ['#008236'],
      xAxis: {
        categories: dataChart.categories,
        crosshair: { width: 1, color: '#0A0A07' },
        labels: { step: 2, style: { fontSize: '12px' } },
        gridLineWidth: 1,
        gridLineColor: '#bbbbbb',
        gridLineDashStyle: 'dash',
        lineWidth: 0,
      },
      yAxis: {
        title: { text: null },
        labels: { enabled: true },
        visible: true,
        min: Math.min(...dataChart.data),
      },
      legend: { enabled: false },
      credits: { enabled: false },
      plotOptions: {
        series: {
          marker: false,
          fillColor: {
            linearGradient: [0, 0, 0, 300],
            stops: [
              [0, Highcharts.color('#008236').setOpacity(1).get('rgba')],
              [1, Highcharts.color('#00a63e').setOpacity(0.3).get('rgba')],
            ],
          },
        },
      },
      series: [
        {
          name: 'Harga',
          data: dataChart.data,
          color: '#008236',
          lineWidth: 1.5,
          fillColor: {
            linearGradient: [0, 0, 0, 250],
            stops: [
              [0, Highcharts.color('#008236').setOpacity(1).get('rgba')],
              [1, Highcharts.color('#00a63e').setOpacity(0.3).get('rgba')],
            ],
          },
        },
      ],
    };

    setOptions(temp);
  }, [dataChart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    updateChart();
  }, [updateChart]);

  useEffect(() => {
    const handleResize = () => {
      Highcharts.charts.forEach((chart) => chart?.redraw());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="shadow-custom-1 bg-white rounded-md p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h5 className="text-green-700 font-semibold mb-3">
          Pergerakan Harga {type == 'buy' ? 'Beli' : 'Jual'} Emas (1 Bulan
          Terakhir)
        </h5>
        <Select
          allowClear
          size="large"
          className="w-[180px]"
          placeholder="Status"
          value={type}
          onChange={setType}
          options={[
            { value: 'buy', label: 'Beli' },
            { value: 'sell', label: 'Jual' },
          ]}
        />
      </div>

      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        containerProps={{ className: 'w-full h-full' }}
        ref={chartRef}
      />
    </div>
  );
};

export default PergerakanEmas;
