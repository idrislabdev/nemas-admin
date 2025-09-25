'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { IGoldLoan } from '@/@core/@types/interface'; // ✅ pakai IGoldLoan
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';
moment.locale('id');

const { RangePicker } = DatePicker;

const PinjamanEmasTablePage = () => {
  const url = `/reports/gold-loan/list`;
  const [dataTable, setDataTable] = useState<Array<IGoldLoan>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: '',
    end_date: '',
  });

  const columns: ColumnsType<IGoldLoan> = [
    {
      title: 'No. Pinjaman',
      dataIndex: 'loan_ref_number',
      key: 'loan_ref_number',
      width: 160,
      fixed: 'left',
    },
    {
      title: 'Tanggal Pinjaman',
      dataIndex: 'loan_date_time',
      key: 'loan_date_time',
      width: 180,
      render: (_, record) =>
        moment(record.loan_date_time).format('DD MMMM YYYY HH:mm'),
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 150,
    },
    {
      title: 'Berat Emas',
      dataIndex: 'loan_gold_wgt',
      key: 'loan_gold_wgt',
      width: 130,
      render: (_, record) =>
        record.loan_gold_wgt
          ? `${formatDecimal(record.loan_gold_wgt)} Gram`
          : '-',
    },
    {
      title: 'Harga Jual Emas',
      dataIndex: 'loan_gold_price_sell',
      key: 'loan_gold_price_sell',
      width: 180,
      render: (_, record) =>
        record.loan_gold_price_sell
          ? `Rp${formatDecimal(record.loan_gold_price_sell)}`
          : '-',
    },
    {
      title: 'Jumlah Pinjaman',
      dataIndex: 'loan_amt',
      key: 'loan_amt',
      width: 180,
      render: (_, record) =>
        record.loan_amt ? `Rp${formatDecimal(record.loan_amt)}` : '-',
    },
    {
      title: 'Biaya Admin',
      dataIndex: 'loan_cost_admin',
      key: 'loan_cost_admin',
      width: 150,
      render: (_, record) =>
        record.loan_cost_admin
          ? `Rp${formatDecimal(record.loan_cost_admin)}`
          : '-',
    },
    {
      title: 'Biaya Transfer',
      dataIndex: 'loan_cost_transfer',
      key: 'loan_cost_transfer',
      width: 150,
      render: (_, record) =>
        record.loan_cost_transfer
          ? `Rp${formatDecimal(record.loan_cost_transfer)}`
          : '-',
    },
    {
      title: 'Total Pinjaman',
      dataIndex: 'loan_total_amt',
      key: 'loan_total_amt',
      width: 180,
      render: (_, record) =>
        record.loan_total_amt
          ? `Rp${formatDecimal(record.loan_total_amt)}`
          : '-',
    },
    {
      title: 'Jumlah Transfer',
      dataIndex: 'loan_transfer_amount',
      key: 'loan_transfer_amount',
      width: 180,
      render: (_, record) =>
        record.loan_transfer_amount
          ? `Rp${formatDecimal(record.loan_transfer_amount)}`
          : '-',
    },
    {
      title: 'Tanggal Jatuh Tempo',
      dataIndex: 'loan_due_date',
      key: 'loan_due_date',
      width: 160,
      render: (_, record) =>
        record.loan_due_date
          ? moment(record.loan_due_date).format('DD MMMM YYYY')
          : '-',
    },
    {
      title: 'Status',
      dataIndex: 'loan_status_name',
      key: 'loan_status_name',
      width: 150,
      fixed: 'right',
    },
  ];

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams({
      ...params,
      offset: 0,
      limit: 10,
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

      const param = {
        format: 'json',
        offset: 0,
        limit: 10,
        start_date: params.start_date,
        end_date: params.end_date,
      };

      const rows = await fetchAllData(url, param);

      const dataToExport = rows.map((item: IGoldLoan) => ({
        'No. Pinjaman': item.loan_ref_number,
        'Tanggal Pinjaman': moment(item.loan_date_time).format(
          'DD MMMM YYYY HH:mm'
        ),
        User: item.user_name,
        'Berat Emas': `${formatDecimal(item.loan_gold_wgt)} Gram`,
        'Harga Jual Emas': `Rp${formatDecimal(item.loan_gold_price_sell)}`,
        'Jumlah Pinjaman': `Rp${formatDecimal(item.loan_amt)}`,
        'Biaya Admin': `Rp${formatDecimal(item.loan_cost_admin)}`,
        'Biaya Transfer': `Rp${formatDecimal(item.loan_cost_transfer)}`,
        'Total Pinjaman': `Rp${formatDecimal(item.loan_total_amt)}`,
        'Jumlah Transfer': `Rp${formatDecimal(item.loan_transfer_amount)}`,
        'Tanggal Jatuh Tempo': moment(item.loan_due_date).format(
          'DD MMMM YYYY'
        ),
        Status: item.loan_status_name,
        Catatan: item.loan_note,
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Pinjaman Emas');

      worksheet.mergeCells('A1:M1');
      worksheet.getCell('A1').value = 'LAPORAN PINJAMAN EMAS';
      worksheet.getCell('A1').alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      if (params.start_date && params.end_date) {
        worksheet.mergeCells('A2:M2');
        worksheet.getCell('A2').value = `Periode: ${dayjs(
          params.start_date
        ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
          'DD-MM-YYYY'
        )}`;
        worksheet.getCell('A2').alignment = { horizontal: 'center' };
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
        if (col != undefined) {
          let maxLength = 0;
          col.eachCell({ includeEmpty: true }, (cell: any) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength) maxLength = val.length;
          });
          col.width = maxLength + 2;
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_pinjaman_emas_${dayjs().format(
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
      <div className="flex items-center justify-between mb-4">
        <RangePicker
          size={'small'}
          className="w-[300px] h-[40px]"
          onChange={onRangeChange}
        />
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={exportData}
        >
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

export default PinjamanEmasTablePage;
