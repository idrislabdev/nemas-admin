'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

interface ICertificate {
  id: string;
  gold_cert_code: string;
  gold_weight: number;
  include_stock: boolean;
  is_redeemed: boolean;
  gold_type: string;
  gold_brand: string;
  cert_brand: string;
  cert_code: string;
  cert_price: string;
  create_time: string;
  create_user: string;
  create_user_name: string;
  upd_time: string;
  upd_user: string;
  upd_user_name: string;
}

const SertifikatListPage = () => {
  const url = `/reports/gold-cert-detail/list`;

  const [dataTable, setDataTable] = useState<Array<ICertificate>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Default tanggal: 1 awal bulan - hari ini
  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const defaultEnd = dayjs().format('YYYY-MM-DD');

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart,
    end_date: defaultEnd,
    search: '',
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      search: debouncedSearch,
    }));
  }, [debouncedSearch]);

  const columns: ColumnsType<ICertificate> = [
    {
      title: 'Kode Sertifikat',
      dataIndex: 'gold_cert_code',
      key: 'gold_cert_code',
      width: 150,
    },
    {
      title: 'Brand Emas',
      dataIndex: 'gold_brand',
      key: 'gold_brand',
      width: 150,
    },
    {
      title: 'Jenis Emas',
      dataIndex: 'gold_type',
      key: 'gold_type',
      width: 150,
    },
    {
      title: 'Berat (Gram)',
      dataIndex: 'gold_weight',
      key: 'gold_weight',
      width: 120,
      render: (val) => `${formatDecimal(val)} Gram`,
    },
    {
      title: 'Brand Sertifikat',
      dataIndex: 'cert_brand',
      key: 'cert_brand',
      width: 150,
    },
    {
      title: 'Kode Sertifikat Barang',
      dataIndex: 'cert_code',
      key: 'cert_code',
      width: 150,
    },
    {
      title: 'Harga Sertifikat',
      dataIndex: 'cert_price',
      key: 'cert_price',
      width: 150,
      render: (val) => `Rp${formatDecimal(parseFloat(val || '0'))}`,
    },
    {
      title: 'Include Stock',
      dataIndex: 'include_stock',
      key: 'include_stock',
      width: 140,
      render: (val) => (val ? 'Ya' : 'Tidak'),
    },
    {
      title: 'Terpakai',
      dataIndex: 'is_redeemed',
      key: 'is_redeemed',
      width: 140,
      render: (val) => (val ? 'Sudah' : 'Belum'),
    },
    {
      title: 'Dibuat Oleh',
      dataIndex: 'create_user_name',
      key: 'create_user_name',
      width: 150,
    },
    {
      title: 'Waktu Dibuat',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
      render: (val) => moment(val).format('DD MMMM YYYY HH:mm'),
    },
    {
      title: 'Diupdate Oleh',
      dataIndex: 'upd_user_name',
      key: 'upd_user_name',
      width: 150,
    },
    {
      title: 'Waktu Update',
      dataIndex: 'upd_time',
      key: 'upd_time',
      width: 180,
      render: (val) => moment(val).format('DD MMMM YYYY HH:mm'),
    },
  ];

  // Fetch table data
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

  // Fetch all data for export
  const fetchAllData = async (url: string, params: any) => {
    let allRows: any[] = [];
    const limit = 100;

    const firstResp = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    allRows = [...firstResp.data.results];

    const totalCount = firstResp.data.count;
    const totalPages = Math.ceil(totalCount / limit);

    for (let i = 1; i < totalPages; i++) {
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset: i * limit },
      });
      allRows = allRows.concat(resp.data.results);
      await new Promise((r) => setTimeout(r, 200)); // anti ban
    }

    return allRows;
  };

  // EXPORT EXCEL
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const rows = await fetchAllData(url, params);

      if (!rows || rows.length === 0) return;

      const dataToExport = rows.map((item: ICertificate) => ({
        'Kode Sertifikat': item.gold_cert_code || '-',
        'Brand Emas': item.gold_brand || '-',
        'Jenis Emas': item.gold_type || '-',
        'Berat (Gram)': Number(item.gold_weight || 0),
        'Brand Sertifikat': item.cert_brand || '-',
        'Kode Sertifikat Barang': item.cert_code || '-',
        'Harga Sertifikat (Rp)': Number(item.cert_price || 0),
        'Include Stock': item.include_stock ? 'Ya' : 'Tidak',
        Terpakai: item.is_redeemed ? 'Sudah' : 'Belum',
        'Dibuat Oleh': item.create_user_name || '-',
        'Waktu Dibuat': moment(item.create_time).format('DD MMMM YYYY HH:mm'),
        'Diupdate Oleh': item.upd_user_name || '-',
        'Waktu Update': moment(item.upd_time).format('DD MMMM YYYY HH:mm'),
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Sertifikat Emas');

      // Header title
      worksheet.mergeCells('A1:L1');
      const title = worksheet.getCell('A1');
      title.value = 'LAPORAN SERTIFIKAT EMAS';
      title.font = { size: 14, bold: true };
      title.alignment = { horizontal: 'left' };

      // Periode
      if (params.start_date && params.end_date) {
        worksheet.mergeCells('A2:L2');
        const period = worksheet.getCell('A2');
        period.value = `Periode: ${dayjs(params.start_date).format(
          'DD-MM-YYYY'
        )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;
      }

      worksheet.addRow([]);

      // Table header
      const headerKeys = Object.keys(dataToExport[0]);
      const headerRow = worksheet.addRow(headerKeys);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEFEFEF' },
        };
      });

      // Table rows
      dataToExport.forEach((row) => {
        const rowValues = headerKeys.map((key) => row[key as keyof typeof row]);
        const newRow = worksheet.addRow(rowValues);

        newRow.eachCell((cell, colNumber) => {
          const header = headerKeys[colNumber - 1];
          const isNumeric =
            header.includes('(Rp)') || header.includes('(Gram)');

          cell.alignment = {
            vertical: 'middle',
            horizontal: isNumeric ? 'right' : 'left',
          };

          if (isNumeric && typeof cell.value === 'number') {
            cell.value = new Intl.NumberFormat('id-ID').format(cell.value);
          }

          // Tambahkan border untuk setiap cell data
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // Auto column width
      worksheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell?.({ includeEmpty: true }, (cell) => {
          const v = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, v.length);
        });
        col.width = Math.min(maxLength + 2, 40);
      });

      // Save file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `laporan_sertifikat_emas_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[dayjs(defaultStart), dayjs(defaultEnd)]}
          />

          <input
            type="text"
            placeholder="Cari..."
            className="pl-8 pr-2 py-1.5 text-sm border border-gray-300 rounded-md w-[200px] focus:outline-none focus:ring-1 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn !h-[40px] btn-primary" onClick={exportData}>
          <FileDownload02 /> Export Excel
        </button>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px] mt-3">
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
            current={params.offset / params.limit + 1}
            pageSize={params.limit}
            total={total}
            onChange={onChangePage}
            showSizeChanger={false}
          />
        </div>
      </div>

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh..."
      />
    </>
  );
};

export default SertifikatListPage;
