/* eslint-disable @typescript-eslint/no-explicit-any */

import { IReportGoldDigital } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const { RangePicker } = DatePicker;

const StockEmasDigitalTable = () => {
  const url = `/reports/gold-stock/digital`;
  const [dataTable, setDataTable] = useState<Array<IReportGoldDigital>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // 🗓️ Default: tanggal 1 bulan aktif sampai hari ini
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
  });

  // 🧱 Kolom tabel (useMemo supaya tidak re-render terus)
  const columns = useMemo<ColumnsType<IReportGoldDigital>>(
    () => [
      {
        title: 'Tanggal',
        dataIndex: 'date',
        key: 'date',
        render: (_, record) => moment(record.date).format('DD-MM-YYYY'),
      },
      {
        title: 'Tipe',
        dataIndex: 'transaction_type_name',
        key: 'transaction_type_name',
      },
      {
        title: 'Update User',
        dataIndex: 'user_name',
        key: 'user_name',
      },
      {
        title: 'Update Time',
        dataIndex: 'date',
        key: 'date',
        render: (_, record) => moment(record.date).format('HH:mm'),
      },
      {
        title: 'Debet',
        dataIndex: 'debet',
        key: 'debet',
        render: (_, record) => (
          <>
            {record.weight_debet !== null
              ? `${formatDecimal(parseFloat(record.weight_debet))} Gram`
              : '-'}
          </>
        ),
      },
      {
        title: 'Credit',
        dataIndex: 'credit',
        key: 'credit',
        render: (_, record) => (
          <>
            {record.weight_credit !== null
              ? `${formatDecimal(parseFloat(record.weight_credit))} Gram`
              : '-'}
          </>
        ),
      },
      {
        title: 'Saldo Akhir',
        dataIndex: 'weight',
        key: 'weight',
        render: (_, record) =>
          record.weight != null
            ? `${formatDecimal(parseFloat(record.weight))} Gram`
            : '-',
      },
    ],
    []
  );

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (err) {
      console.error('Fetch failed:', err);
      setDataTable([]);
      setTotal(0);
    }
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

  // 🔹 Ambil semua data untuk export
  const fetchAllData = async (url: string, params: any) => {
    const limit = 100;
    const firstResp = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    const totalCount = firstResp.data.count;
    const totalPages = Math.ceil(totalCount / limit);
    const allRows = [...firstResp.data.results];

    const requests = [];
    for (let i = 1; i < totalPages; i++) {
      requests.push(
        axiosInstance.get(url, {
          params: { ...params, limit, offset: i * limit },
        })
      );
    }

    const responses = await Promise.all(requests);
    responses.forEach((r) => allRows.push(...r.data.results));

    return allRows;
  };

  // 🧾 Export ke Excel
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

      const dataToExport = rows.map((item: IReportGoldDigital) => ({
        Tanggal: dayjs(item.date).format('DD-MM-YYYY'),
        Tipe: item.transaction_type_name,
        'Update User': item.user_name,
        'Update Time': dayjs(item.date).format('HH:mm'),
        Debit:
          item.weight_debet !== null
            ? `${formatDecimal(parseFloat(item.weight_debet))} Gram`
            : '-',
        Credit:
          item.weight_credit !== null
            ? `${formatDecimal(parseFloat(item.weight_credit))} Gram`
            : '-',
        'Saldo Akhir': `${formatDecimal(parseFloat(item.weight))} Gram`,
      }));

      // 🔹 Buat workbook baru
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Stock Emas Digital');

      // 🔹 Judul (rata kiri)
      worksheet.mergeCells('A1:F1');
      worksheet.getCell('A1').value = 'LAPORAN EMAS STOCK DIGITAL';
      worksheet.getCell('A1').alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      worksheet.getCell('A1').font = { size: 14, bold: true };

      if (params.start_date && params.end_date) {
        worksheet.mergeCells('A2:F2');
        worksheet.getCell('A2').value = `Periode: ${dayjs(
          params.start_date
        ).format('DD-MM-YYYY')} s/d ${dayjs(params.end_date).format(
          'DD-MM-YYYY'
        )}`;
        worksheet.getCell('A2').alignment = { horizontal: 'left' };
      }

      worksheet.addRow([]); // baris kosong

      // 🔹 Header kolom
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

      // 🔹 Data rows
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

      // 🔹 Atur lebar kolom fit (tapi tidak terlalu lebar)
      worksheet.columns.forEach((col: any) => {
        if (col) {
          let maxLength = 0;
          col.eachCell({ includeEmpty: true }, (cell: any) => {
            const val = cell.value ? cell.value.toString() : '';
            if (val.length > maxLength) maxLength = val.length;
          });
          // Batasi antara 10 - 30 karakter
          col.width = Math.min(Math.max(maxLength + 2, 10), 30);
        }
      });

      // 🔹 Simpan file
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `laporan_stock_emas_digital_${dayjs().format(
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
          defaultValue={[dayjs(startOfMonth), dayjs(today)]}
        />
        <button
          className="btn btn-primary"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />
          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
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

export default StockEmasDigitalTable;
