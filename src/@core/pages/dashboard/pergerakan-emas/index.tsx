import ChartSpline from '@/@core/pages/dashboard/components/chart-spline';
import axiosInstance from '@/@core/utils/axios';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import 'moment/locale/id';

moment.locale('id');
const PergerakanEmas = () => {
  const [dataChart, setDataChart] = useState<{
    categories: string[];
    data: number[];
  }>({} as { categories: []; data: [] });

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(`/reports/gold-chart/monthly`);
    const data = resp.data;
    const categories: string[] = [];
    const dataVal: number[] = [];
    data.forEach(
      (item: { hour: string; gold_price_buy: number; day: string }) => {
        categories.push(moment(item.day).format('DD MMM'));
        dataVal.push(item.gold_price_buy);
      }
    );
    setDataChart({ categories: categories, data: dataVal });
  }, []);

  useEffect(() => {
    fetchData();
  });

  return (
    <div className="shadow-custom-1 rounded-md p-4 flex flex-col gap-4">
      <h5 className="text-xl leading-5 text-green-700 font-semibold">
        Pergerakan Harga Emas (1 Bulan Terakhir)
      </h5>
      <ChartSpline dataChart={dataChart} />
    </div>
  );
};

export default PergerakanEmas;
