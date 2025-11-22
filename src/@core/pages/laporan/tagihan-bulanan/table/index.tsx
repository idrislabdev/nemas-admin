'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FileDownload02 } from '@untitled-ui/icons-react';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';
import { debounce } from 'lodash';

// ❗ Ganti dengan interface milikmu
import { ITagihanBulanan } from '@/@core/@types/interface';

moment.locale('id');

const { RangePicker } = DatePicker;

const TagihanBulananTablePage = () => {
  const url = `/reports/gold-monthly-cost/list`;

  // default tanggal: awal bulan hingga hari ini
  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();

  const [dataTable, setDataTable] = useState<Array<ITagihanBulanan>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
    search: '',
  });

  const [searchText, setSearchText] = useState('');

  // === Columns ===
  const columns: ColumnsType<ITagihanBulanan> = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 160,
    },
    {
      title: 'Nama User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 180,
    },
    {
      title: 'Nomor HP',
      dataIndex: 'user_phone_number',
      key: 'user_phone_number',
      width: 160,
    },
    {
      title: 'Tanggal Tagihan',
      dataIndex: 'monthly_cost_issue_date',
      key: 'monthly_cost_issue_date',
      width: 160,
      render: (val) => dayjs(val).format('DD-MM-YYYY'),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (val) => formatDecimal(val),
    },
    {
      title: 'Biaya Bulanan',
      dataIndex: 'monthly_cost',
      key: 'monthly_cost',
      width: 150,
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Berat Emas (Gram)',
      dataIndex: 'gold_weight',
      key: 'gold_weight',
      width: 150,
      render: (val) => `${formatDecimal(val)} Gram`,
    },
    {
      title: 'Total Tagihan (Rp)',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 180,
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Diskon (Rp)',
      dataIndex: 'discount',
      key: 'discount',
      width: 150,
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Status',
      dataIndex: 'is_paid',
      key: 'is_paid',
      width: 120,
      render: (val) => (val ? 'Lunas' : 'Belum Lunas'),
    },
    {
      title: 'Periode',
      dataIndex: 'current_period',
      key: 'current_period',
      width: 150,
    },
  ];

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams({
      ...params,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

  // Debounce search
  const handleSearch = useCallback(
    debounce((val: string) => {
      setParams((prev) => ({ ...prev, offset: 0, search: val }));
    }, 500),
    []
  );

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, handleSearch]);

  // === Fetch all for Excel ===
  const fetchAllData = async (url: string, params: any) => {
    let allRows: any[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    allRows = allRows.concat(firstResp.data.results);
    const totalCount = firstResp.data.count;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const offset = i * limit;
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset },
      });
      allRows = allRows.concat(resp.data.results);
      await new Promise((r) => setTimeout(r, 200));
    }

    return allRows;
  };

  // === Export Excel ===
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const rows = await fetchAllData(url, params);

      const dataToExport = rows.map((item: ITagihanBulanan) => ({
        'Order Number': item.order_number,
        'Nama User': item.user_name,
        'Nomor HP': item.user_phone_number,
        'Tanggal Tagihan': dayjs(item.monthly_cost_issue_date).format(
          'DD-MM-YYYY'
        ),
        Level: item.level,
        'Biaya Bulanan (Rp)': item.monthly_cost ?? 0,
        'Berat (Gram)': item.gold_weight ?? 0,
        'Total Tagihan (Rp)': item.total_cost ?? 0,
        'Diskon (Rp)': item.discount ?? 0,
        Status: item.is_paid ? 'Lunas' : 'Belum Lunas',
        Periode: item.current_period,
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Tagihan Bulanan');

      worksheet.mergeCells('A1:K1');
      worksheet.getCell('A1').value = 'LAPORAN TAGIHAN BULANAN EMAS';
      worksheet.getCell('A1').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      if (params.start_date && params.end_date) {
        worksheet.mergeCells('A2:K2');
        worksheet.getCell('A2').value = `Periode: ${dayjs(
          params.start_date
        ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
          'DD-MM-YYYY'
        )}`;
        worksheet.getCell('A2').alignment = { horizontal: 'left' };
      }

      worksheet.addRow([]);

      // === Header ===
      const header = Object.keys(dataToExport[0]);
      const headerRow = worksheet.addRow(header);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE5E5E5' },
        };
      });

      // === Data rows ===
      dataToExport.forEach((row: any) => {
        const rowValues = header.map((key) => row[key] ?? '-');
        const newRow = worksheet.addRow(rowValues);

        newRow.eachCell((cell, colNumber) => {
          const headerName = header[colNumber - 1];

          if (
            headerName.toLowerCase().includes('rp') ||
            headerName.toLowerCase().includes('berat')
          ) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else {
            cell.alignment = { vertical: 'middle' };
          }

          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // === TOTAL ===
      const total_biaya = rows.reduce((s, x) => s + (x.monthly_cost ?? 0), 0);
      const total_berat = rows.reduce((s, x) => s + (x.gold_weight ?? 0), 0);
      const total_tagihan = rows.reduce((s, x) => s + (x.total_cost ?? 0), 0);
      const total_diskon = rows.reduce((s, x) => s + (x.discount ?? 0), 0);

      const totalRow = worksheet.addRow([
        'TOTAL',
        '',
        '',
        '',
        '',
        formatDecimal(total_biaya),
        formatDecimal(total_berat),
        formatDecimal(total_tagihan),
        formatDecimal(total_diskon),
        '',
        '',
      ]);

      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      });

      // === Auto width ===
      worksheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, val.length);
        });
        col.width = Math.min(maxLength + 2, 40);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `tagihan_bulanan_${dayjs().format(
        'YYYYMMDD_HHmmss'
      )}.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[defaultStart, defaultEnd]}
          />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 h-[40px] w-[250px] text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <button className="btn !h-[40px] btn-primary" onClick={exportData}>
          <FileDownload02 />
          Export Excel
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <Table
          columns={columns}
          dataSource={dataTable}
          size="small"
          scroll={{ x: 'max-content', y: 550 }}
          pagination={false}
          className="table-basic"
          rowKey="id"
        />

        <div className="flex justify-end p-[12px]">
          <Pagination
            onChange={onChangePage}
            pageSize={params.limit}
            total={total}
            showSizeChanger={false}
          />
        </div>
      </div>

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default TagihanBulananTablePage;
