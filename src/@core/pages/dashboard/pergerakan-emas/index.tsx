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

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get('/reports/gold-chart/monthly');

      const categories: string[] = [];
      const dataVal: number[] = [];

      resp.data.forEach(
        (item: {
          day: string;
          gold_price_buy: number;
          gold_price_sell: number;
        }) => {
          categories.push(moment(item.day).format('DD MMM'));

          dataVal.push(
            type === 'buy' ? item.gold_price_buy : item.gold_price_sell
          );
        }
      );

      setDataChart({
        categories,
        data: dataVal,
      });
    } catch (err) {
      console.error(err);
    }
  }, [type]);

  const updateChart = useCallback(() => {
    if (!dataChart.categories.length) return;

    setOptions({
      chart: {
        type: 'areaspline',
        backgroundColor: 'transparent',
        height: 360,
        animation: true,
        spacingTop: 10,
        spacingBottom: 0,
      },

      title: {
        text: '',
      },

      credits: {
        enabled: false,
      },

      legend: {
        enabled: false,
      },

      colors: ['#0057B7'],

      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: '#FFF',
        borderColor: '#0057B7',
        borderRadius: 12,
        shadow: false,
        formatter: function () {
          return `
            <div style="padding:4px 6px">
                <div style="font-size:12px;color:#64748B">
                    ${this.x}
                </div>

                <div style="margin-top:6px;font-size:15px">
                    Harga :
                    <b>Rp ${Highcharts.numberFormat(
                      Number(this.y),
                      0,
                      ',',
                      '.'
                    )}</b>
                </div>
            </div>
          `;
        },
      },

      xAxis: {
        categories: dataChart.categories,

        tickLength: 0,

        lineWidth: 0,

        gridLineWidth: 1,

        gridLineDashStyle: 'Dash',

        gridLineColor: '#EEF4FB',

        crosshair: {
          width: 2,
          color: '#BFD8FB',
          dashStyle: 'ShortDot',
        },

        labels: {
          step: 2,
          style: {
            color: '#64748B',
            fontSize: '12px',
          },
        },
      },

      yAxis: {
        title: {
          text: null,
        },

        min: Math.min(...dataChart.data),

        gridLineColor: '#EEF4FB',

        labels: {
          style: {
            color: '#64748B',
            fontSize: '12px',
          },
        },
      },

      plotOptions: {
        series: {
          animation: {
            duration: 800,
          },

          lineWidth: 3,

          shadow: {
            color: 'rgba(0,87,183,.15)',
            width: 10,
            offsetX: 0,
            offsetY: 6,
          },

          marker: {
            enabled: false,

            states: {
              hover: {
                enabled: true,
                radius: 5,
                fillColor: '#0057B7',
                lineWidth: 3,
                lineColor: '#FFFFFF',
              },
            },
          },

          states: {
            hover: {
              lineWidth: 3,
            },
          },

          fillColor: {
            linearGradient: [0, 0, 0, 320],

            stops: [
              [0, Highcharts.color('#64B5FF').setOpacity(0.65).get('rgba')],

              [0.5, Highcharts.color('#A7D4FF').setOpacity(0.25).get('rgba')],

              [1, Highcharts.color('#FFFFFF').setOpacity(0).get('rgba')],
            ],
          },
        },
      },

      series: [
        {
          type: 'areaspline',
          name: 'Harga',

          color: '#0057B7',

          data: dataChart.data,
        },
      ],
    });
  }, [dataChart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    updateChart();
  }, [updateChart]);

  useEffect(() => {
    const handleResize = () => {
      Highcharts.charts.forEach((chart) => chart?.reflow());
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="rounded-xl border border-[#D9E7FB] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h5 className="text-lg font-semibold text-primary">
          Pergerakan Harga {type === 'buy' ? 'Beli' : 'Jual'} Emas (1 Bulan
          Terakhir)
        </h5>

        <Select
          size="large"
          className="w-[180px]"
          value={type}
          onChange={setType}
          options={[
            {
              value: 'buy',
              label: 'Beli',
            },
            {
              value: 'sell',
              label: 'Jual',
            },
          ]}
        />
      </div>

      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartRef}
      />
    </div>
  );
};

export default PergerakanEmas;
