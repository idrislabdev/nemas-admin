'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ITagihanBulanan } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker, Pagination, Select, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import 'moment/locale/id';

moment.locale('id');

const { RangePicker } = DatePicker;

const TagihanBulananTablePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const url = `/reports/gold-monthly-cost/list`;

  // ============================
  // Ambil Query URL
  // ============================

  const queryStart = searchParams.get('start_date');
  const queryEnd = searchParams.get('end_date');
  const queryStatus = searchParams.get('is_paid');
  const queryPage = Number(searchParams.get('page') || 1);

  const defaultStart = queryStart ? dayjs(queryStart) : null;
  const defaultEnd = queryEnd ? dayjs(queryEnd) : null;

  const [statusPaid, setStatusPaid] = useState<any>(
    queryStatus === null ? null : queryStatus === 'true'
  );

  const [params, setParams] = useState<any>({
    offset: (queryPage - 1) * 10,
    limit: 10,
    start_date: queryStart || null,
    end_date: queryEnd || null,
    is_paid: queryStatus === null ? null : queryStatus === 'true',
    search: '',
  });

  const [dataTable, setDataTable] = useState<Array<ITagihanBulanan>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // ============================
  // Helper update query string
  // ============================

  const updateQueryString = (obj: Record<string, any>) => {
    const q = new URLSearchParams(searchParams.toString());

    Object.entries(obj).forEach(([key, val]) => {
      if (val === '' || val === null || val === undefined) {
        q.delete(key);
      } else {
        q.set(key, String(val));
      }
    });

    router.replace(`?${q.toString()}`);
  };

  // ============================
  // Fetch Data
  // ============================

  const fetchData = useCallback(async () => {
    const filteredParams = { ...params };

    if (filteredParams.is_paid === null) delete filteredParams.is_paid;
    if (!filteredParams.start_date) delete filteredParams.start_date;
    if (!filteredParams.end_date) delete filteredParams.end_date;

    const resp = await axiosInstance.get(url, {
      params: filteredParams,
    });

    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================
  // Pagination
  // ============================

  const onChangePage = (page: number) => {
    setParams((prev: any) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));

    updateQueryString({ page });
  };

  // ============================
  // Filter Date
  // ============================

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    const [start, end] = dateStrings;

    setParams((prev: any) => ({
      ...prev,
      start_date: start,
      end_date: end,
      offset: 0,
    }));

    updateQueryString({
      start_date: start,
      end_date: end,
      page: 1,
    });
  };

  // ============================
  // Filter Status
  // ============================

  const handleStatusChange = (val: any) => {
    setStatusPaid(val);

    setParams((prev: any) => ({
      ...prev,
      is_paid: val,
      offset: 0,
    }));

    updateQueryString({
      is_paid: val,
      page: 1,
    });
  };

  // ============================
  // Table Columns
  // ============================

  const columns: ColumnsType<ITagihanBulanan> = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      width: 160,
    },
    {
      title: 'Nama User',
      dataIndex: 'user_name',
      width: 180,
    },
    {
      title: 'Nomor HP',
      dataIndex: 'user_phone_number',
      width: 160,
    },
    {
      title: 'Tanggal Tagihan',
      dataIndex: 'monthly_cost_issue_date',
      width: 160,
      render: (val) => (val ? moment(val).format('DD MMM YYYY') : '-'),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      width: 120,
      render: (val) => formatDecimal(val),
    },
    {
      title: 'Biaya Bulanan',
      dataIndex: 'monthly_cost',
      width: 150,
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Berat Emas',
      dataIndex: 'gold_weight',
      width: 150,
      render: (val) => `${formatDecimal(val)} Gram`,
    },
    {
      title: 'Total Tagihan',
      dataIndex: 'total_cost',
      width: 180,
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Diskon',
      dataIndex: 'discount',
      width: 150,
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Status',
      dataIndex: 'is_paid',
      width: 120,
      render: (val) => (val ? 'Lunas' : 'Belum Lunas'),
    },
    {
      title: 'Periode',
      dataIndex: 'current_period',
      width: 150,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* DATE FILTER */}
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            onChange={onRangeChange}
            value={
              params.start_date && params.end_date
                ? [dayjs(params.start_date), dayjs(params.end_date)]
                : null
            }
          />

          {/* STATUS FILTER */}
          <Select
            allowClear
            size="large"
            className="w-[180px]"
            placeholder="Status"
            value={statusPaid ?? undefined}
            onChange={handleStatusChange}
            options={[
              { value: true, label: 'Lunas' },
              { value: false, label: 'Belum Lunas' },
            ]}
          />
        </div>

        <button className="btn !h-[40px] btn-primary">
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-lg mt-3">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          rowKey="id"
        />

        <div className="flex justify-end p-[12px]">
          <Pagination
            current={params.offset / params.limit + 1}
            pageSize={params.limit}
            total={total}
            onChange={onChangePage}
            showSizeChanger={false}
          />
        </div>
      </div>

      <ModalLoading isModalOpen={isModalLoading} textInfo="Harap tunggu..." />
    </>
  );
};

export default TagihanBulananTablePage;
