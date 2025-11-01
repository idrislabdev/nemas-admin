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
import { IGoldInvestmentSummary } from '@/@core/@types/interface';
moment.locale('id');

const { RangePicker } = DatePicker;

// 🔹 Interface baru sesuai permintaan

const GoldInvestmentUserTable = () => {
  const url = `/reports/gold-investment/summary-user`;

  // 🔹 default tanggal: awal bulan hingga hari ini
  const defaultStart = dayjs().startOf('month');
  const defaultEnd = dayjs();

  const [dataTable, setDataTable] = useState<Array<IGoldInvestmentSummary>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart.format('YYYY-MM-DD'),
    end_date: defaultEnd.format('YYYY-MM-DD'),
  });

  // 🔹 Kolom tabel disesuaikan dengan interface baru
  const columns: ColumnsType<IGoldInvestmentSummary> = [
    {
      title: 'Nomor Anggota',
      dataIndex: 'investor_member_number',
      key: 'investor_member_number',
      width: 160,
    },
    {
      title: 'Nama Investor',
      dataIndex: 'investor_name',
      key: 'investor_name',
      width: 180,
    },
    {
      title: 'Jumlah Transaksi',
      dataIndex: 'jumlah_transaksi',
      key: 'jumlah_transaksi',
      width: 150,
      render: (val) => formatDecimal(val),
    },
    {
      title: 'Total Berat Investasi (Gram)',
      dataIndex: 'total_invested_weight',
      key: 'total_invested_weight',
      width: 200,
      render: (val) => `${formatDecimal(val)} Gram`,
    },
    {
      title: 'Total Nominal Investasi (Rp)',
      dataIndex: 'total_invested_amount',
      key: 'total_invested_amount',
      width: 220,
      render: (val) => `Rp${formatDecimal(val)}`,
    },
    {
      title: 'Total Berat Return (Gram)',
      dataIndex: 'total_return_weight',
      key: 'total_return_weight',
      width: 200,
      render: (val) => `${formatDecimal(val)} Gram`,
    },
    {
      title: 'Total Berat Aktif (Gram)',
      dataIndex: 'total_active_weight',
      key: 'total_active_weight',
      width: 200,
      render: (val) => `${formatDecimal(val)} Gram`,
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

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const rows = await fetchAllData(url, params);

      const dataToExport = rows.map((item: IGoldInvestmentSummary) => ({
        'Nomor Anggota': item.investor_member_number,
        'Nama Investor': item.investor_name,
        'Jumlah Transaksi': formatDecimal(item.jumlah_transaksi),
        'Total Berat Investasi (Gram)': formatDecimal(
          item.total_invested_weight
        ),
        'Total Nominal Investasi (Rp)': `Rp${formatDecimal(
          item.total_invested_amount
        )}`,
        'Total Berat Return (Gram)': formatDecimal(item.total_return_weight),
        'Total Berat Aktif (Gram)': formatDecimal(item.total_active_weight),
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Investasi Emas');

      // 🔹 Judul
      worksheet.mergeCells('A1:G1');
      worksheet.getCell('A1').value = 'LAPORAN INVESTASI EMAS - PER INVESTOR';
      worksheet.getCell('A1').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      if (params.start_date && params.end_date) {
        worksheet.mergeCells('A2:G2');
        worksheet.getCell('A2').value = `Periode: ${dayjs(
          params.start_date
        ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
          'DD-MM-YYYY'
        )}`;
        worksheet.getCell('A2').alignment = { horizontal: 'left' };
      }

      worksheet.addRow([]);

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

      dataToExport.forEach((row: any) => {
        const rowValues = header.map((key) => row[key as keyof typeof row]);
        const newRow = worksheet.addRow(rowValues);
        newRow.eachCell((cell) => {
          cell.alignment = { vertical: 'middle' };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      worksheet.columns.forEach((col: any) => {
        if (col) {
          let maxLength = 0;
          col.eachCell({ includeEmpty: true }, (cell: any) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength) maxLength = val.length;
          });
          col.width = Math.min(maxLength + 2, 35);
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_investasi_emas_${dayjs().format(
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
      <div className="flex items-center justify-between">
        <RangePicker
          size="small"
          className="w-[300px] h-[40px]"
          onChange={onRangeChange}
          defaultValue={[defaultStart, defaultEnd]}
        />
        <button className="btn btn-primary" onClick={exportData}>
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
          rowKey="investor_id"
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

export default GoldInvestmentUserTable;
