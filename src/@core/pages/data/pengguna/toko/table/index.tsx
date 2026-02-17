'use client';
import { IPenggunaAplikasi } from '@/@core/@types/interface';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { Eye, FileDownload02, SearchSm } from '@untitled-ui/icons-react';
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
import axiosInstance from '@/@core/utils/axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

import Link from 'next/link';

moment.locale('id');

const DataPenggunaTokoPageTable = () => {
  const url = `/users/admin`;

  const [dataTable, setDataTable] = useState<Array<IPenggunaAplikasi>>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [goldPriceBase, setGoldPriceBase] = useState<number>(0);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    search: '',
    role__name__icontains: 'Toko',
  });

  // ================= FETCH GOLD PRICE =================
  const fetchGoldPrice = useCallback(async () => {
    try {
      const resp = await axiosInstance.get('/core/gold/price/active');
      setGoldPriceBase(resp.data.gold_price_base || 0);
    } catch (error) {
      console.error('Failed fetch gold price', error);
    }
  }, []);

  // ================= FETCH USERS =================
  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, { params });
      setDataTable(resp.data.results);
      setTotal(resp.data.count);
    } catch (error) {
      console.error(error);
    }
  }, [params, url]);

  useEffect(() => {
    fetchGoldPrice();
  }, [fetchGoldPrice]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= FORMATTERS =================
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatGramWithValue = (weight: number) => {
    const value = weight * goldPriceBase;

    return `${weight.toLocaleString('id-ID', {
      maximumFractionDigits: 4,
    })} gr (${formatCurrency(value)})`;
  };

  // ================= TABLE COLUMNS =================
  const columns: ColumnsType<IPenggunaAplikasi> = [
    {
      title: 'No',
      width: 70,
      fixed: 'left',
      align: 'center',
      render: (_, __, index) => index + params.offset + 1,
    },
    { title: 'Nama', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'Username', dataIndex: 'user_name', key: 'username', width: 150 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    {
      title: 'Alamat',
      key: 'alamat',
      width: 200,
      render: (_, record) =>
        record.address?.address ? record.address.address : '-',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      key: 'phone_number',
      width: 150,
    },
    {
      title: 'Saldo Wallet',
      key: 'wallet_balance',
      width: 180,
      render: (_, record) => {
        const wallet = record.props?.wallet?.balance || 0;
        return formatCurrency(wallet);
      },
    },
    {
      title: 'Saldo Tabungan',
      key: 'gold_stock_value',
      width: 220,
      render: (_, record) => {
        const weight = record.props?.gold_stock?.weight || 0;
        return formatGramWithValue(weight);
      },
    },
    {
      title: 'Saldo Deposito',
      key: 'invest_gold_wgt',
      width: 220,
      render: (_, record) => {
        const weight = record.props?.invest_gold_wgt || 0;
        return formatGramWithValue(weight);
      },
    },
    {
      title: 'Emas Digadaikan',
      key: 'loan_gold_value',
      width: 220,
      render: (_, record) => {
        const loanWeight = record.props?.loan_wgt || 0;
        return formatGramWithValue(loanWeight);
      },
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          <Link
            className="btn-action"
            href={`/data/pengguna/aplikasi/${record.id}`}
          >
            <Eye />
          </Link>
        </div>
      ),
    },
  ];

  // ================= PAGINATION =================
  const onChangePage = (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  // ================= SEARCH =================
  const handleFilter = (value: string) => {
    setParams({
      ...params,
      offset: 0,
      limit: 10,
      search: value,
    });
  };

  // ================= FETCH ALL DATA =================
  const fetchAllData = async () => {
    let rows: IPenggunaAplikasi[] = [];
    const limit = 100;

    const first = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    rows = rows.concat(first.data.results);
    const totalPages = Math.ceil(first.data.count / limit);

    for (let i = 1; i < totalPages; i++) {
      const resp = await axiosInstance.get(url, {
        params: { ...params, limit, offset: i * limit },
      });
      rows = rows.concat(resp.data.results);
    }

    return rows;
  };

  // ================= EXPORT EXCEL =================
  const exportData = async () => {
    try {
      setIsModalLoading(true);

      // ===== GET GOLD PRICE =====
      const goldResp = await axiosInstance.get('/core/gold/price/active');
      const activeGoldPrice = goldResp.data.gold_price_base || 0;

      // ===== FETCH ALL DATA =====
      const rows = await fetchAllData();

      if (!rows.length) return;

      // ===== FORMATTER =====
      const formatCurrency = (value: number) =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(value);

      const formatGramWithValue = (weight: number) => {
        const value = weight * activeGoldPrice;

        return `${weight.toLocaleString('id-ID', {
          maximumFractionDigits: 4,
        })} gr (${formatCurrency(value)})`;
      };

      // ===== MAPPING DATA =====
      const data = rows.map((r, index) => {
        const wallet = r.props?.wallet?.balance || 0;
        const goldWeight = r.props?.gold_stock?.weight || 0;
        const loanWeight = r.props?.loan_wgt || 0;
        const investGoldWeight = r.props?.invest_gold_wgt || 0;

        return {
          No: index + 1,
          Nama: r.name || '',
          Username: r.user_name || '',
          Email: r.email || '',
          Alamat: r.address?.address || '',
          'Phone Number': r.phone_number || '',
          'Saldo Wallet (Rp)': wallet,
          'Saldo Tabungan': formatGramWithValue(goldWeight),
          'Saldo Deposito': formatGramWithValue(investGoldWeight),
          'Emas Digadaikan': formatGramWithValue(loanWeight),
        };
      });

      // ===== CREATE WORKBOOK =====
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Data Pengguna Toko');

      // ===== BORDER HELPER =====
      const applyBorder = (
        cell: ExcelJS.Cell,
        type: 'thin' | 'medium' = 'thin'
      ) => {
        cell.border = {
          top: { style: type },
          left: { style: type },
          bottom: { style: type },
          right: { style: type },
        };
      };

      // ===== TITLE =====
      ws.mergeCells('A1:J1');
      ws.getCell('A1').value = 'LAPORAN DATA PENGGUNA TOKO';
      ws.getCell('A1').font = { bold: true, size: 14 };
      ws.getCell('A1').alignment = { horizontal: 'center' };

      ws.addRow([]);

      // ===== HEADER =====
      const headers = Object.keys(data[0]);
      const headerRow = ws.addRow(headers);

      headers.forEach((_, index) => {
        const cell = headerRow.getCell(index + 1);

        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEFEFEF' },
        };

        applyBorder(cell, 'medium');
      });

      // ===== DATA ROWS =====
      data.forEach((row) => {
        const r = ws.addRow(headers.map((h) => row[h as keyof typeof row]));

        headers.forEach((header, colIndex) => {
          const cell = r.getCell(colIndex + 1);

          const isCurrency = header.includes('(Rp)');

          cell.alignment = {
            vertical: 'middle',
            horizontal: isCurrency ? 'right' : 'left',
          };

          applyBorder(cell);
        });
      });

      // ===== FREEZE HEADER =====
      ws.views = [{ state: 'frozen', ySplit: 3 }];

      // ===== AUTO WIDTH (TERMASUK CELL KOSONG) =====
      ws.columns.forEach((column) => {
        if (!column) return;

        let maxLength = 10;

        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const value = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, value.length);
        });

        column.width = Math.min(maxLength + 2, 50);
      });

      // ===== EXPORT FILE =====
      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `data_pengguna_toko_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="group-input prepend-append">
          <span className="append">
            <SearchSm />
          </span>
          <input
            type="text"
            className="color-1 base"
            placeholder="cari data"
            onChange={debounce(
              (event) => handleFilter(event.target.value),
              1000
            )}
          />
        </div>

        <div className="flex items-center gap-[4px]">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
        </div>
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

export default DataPenggunaTokoPageTable;
