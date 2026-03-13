/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { IHistoryTransaction, IUser } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber, statusTransaksiLangMap } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { Pagination, Select, Space } from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const ProfileTransaction = (props: { id: string }) => {
  const { id } = props;
  const [histories, setHistories] = useState<IHistoryTransaction[]>(
    [] as IHistoryTransaction[]
  );
  const [total, setTotal] = useState(0);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    search: '',
  });

  const handleChange = (value: string[]) => {
    setCheckeds(value);
  };
  const [checkeds, setCheckeds] = useState<string[]>(['order_buy']);
  const options = [
    { label: 'Topup', value: 'topup' },
    { label: 'Beli Emas', value: 'gold_buy' },
    { label: 'Jual Emas', value: 'gold_sell' },
    { label: 'Tarik Saldo', value: 'disburst' },
    { label: 'Terima Emas', value: 'gold_transfer_receive' },
    { label: 'Produk Emas Fisik', value: 'order_buy' },
    { label: 'Tarik Emas', value: 'order_redeem' },
    { label: 'Transfer Emas', value: 'gold_transfer_send' },
    { label: 'Deposito', value: 'deposito' },
    { label: 'Gadai', value: 'loan' },
    { label: 'Bayar Gadai', value: 'loan_pay' },
  ];

  const fetchData = useCallback(async () => {
    let filterString = '';

    const allValues = options.map((o) => o.value);
    const isAllChecked =
      checkeds.length === allValues.length &&
      allValues.every((v) => checkeds.includes(v));

    if (isAllChecked) {
      filterString = '&export_all=true';
    } else {
      checkeds.forEach((item) => {
        filterString += `&transaction_type=${item}`;
      });
    }

    const resp = await axiosInstance.get(
      `/reports/gold-transactions/?user_id=${id}&fetch=${params.limit}&offset=${params.offset}${filterString}&order_by=transaction_date&order_direction=ASC`
    );
    setTotal(resp.data.count);
    setHistories(resp.data.results);
  }, [params, checkeds, id]);

  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  // --- FETCH ALL DATA (versi ExcelJS) ---
  const fetchAllData = async (filterString: string) => {
    let all: any[] = [];
    const limit = 200;

    const url = `/reports/gold-transactions/?user_id=${id}${filterString}&order_by=transaction_date&order_direction=ASC`;

    const first = await axiosInstance.get(url, {
      params: { fetch: limit, offset: 0 },
    });

    all = all.concat(first.data.results);
    const totalCount = first.data.count;
    const pages = Math.ceil(totalCount / limit);

    for (let i = 1; i < pages; i++) {
      const resp = await axiosInstance.get(url, {
        params: { fetch: limit, offset: i * limit },
      });

      all = all.concat(resp.data.results);

      // hindari limit API
      await new Promise((r) => setTimeout(r, 150));
    }

    return all;
  };

  // --- EXPORT DATA MENGGUNAKAN EXCELJS ---
  const exportData = async () => {
    const user: IUser = JSON.parse(localStorage.getItem('user') || '{}');

    let filterString = '&order_by=transaction_date&order_direction=ASC';

    const allValues = options.map((o) => o.value);
    const isAllChecked =
      checkeds.length === allValues.length &&
      allValues.every((v) => checkeds.includes(v));

    if (isAllChecked) {
      filterString += '&export_all=true';
    } else {
      checkeds.forEach((item) => {
        filterString += `&transaction_type=${item}`;
      });
    }

    const rows = await fetchAllData(filterString);

    if (!rows.length) return;

    // ===== MAPPING DATA =====
    const dataToExport = rows.map(
      (item: IHistoryTransaction, index: number) => ({
        No: index + 1,
        'Tipe Transaksi': statusTransaksiLangMap[item.transaction_type],
        'Tanggal Transaksi': moment(item.transaction_date).format(
          'DD MMMM YYYY'
        ),
        'No. Referensi': item.ref_number,
        Email: item.email,
        'Nominal Transaksi': 'Rp' + formatterNumber(parseInt(item.price)),
        'Berat Emas': item.weight ? item.weight + ' Gram' : '',
        Pengirim: item.user_from,
        Penerima: item.user_to,
        'Berat Emas (Diterima)': item.transfered_weight,
        ...(isAllChecked
          ? {
              'Saldo Emas': item.gold_balance,
              'Saldo Wallet': item.wallet_balance,
            }
          : {}),
      })
    );

    // ===== CREATE WORKBOOK =====
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('History Transaksi');

    const header = Object.keys(dataToExport[0]);
    const lastColumn = String.fromCharCode(64 + header.length);

    // ===== TITLE =====
    worksheet.mergeCells(`A1:${lastColumn}1`);
    worksheet.getCell('A1').value = 'LAPORAN HISTORY TRANSAKSI';
    worksheet.getCell('A1').font = { size: 14, bold: true };
    worksheet.getCell('A1').alignment = {
      horizontal: 'left',
      vertical: 'middle',
    };

    // ===== CREATED BY =====
    worksheet.mergeCells(`A2:${lastColumn}2`);
    worksheet.getCell('A2').value = `Dibuat oleh : ${user?.name || '-'}`;
    worksheet.getCell('A2').alignment = { horizontal: 'left' };

    // ===== EXPORT DATE =====
    worksheet.mergeCells(`A3:${lastColumn}3`);
    worksheet.getCell('A3').value = `Tanggal Export : ${moment().format(
      'DD-MM-YYYY HH:mm'
    )}`;
    worksheet.getCell('A3').alignment = { horizontal: 'left' };

    // ===== TOTAL DATA =====
    worksheet.mergeCells(`A4:${lastColumn}4`);
    worksheet.getCell('A4').value = `Total Data : ${rows.length}`;
    worksheet.getCell('A4').alignment = { horizontal: 'left' };

    worksheet.addRow([]);

    // ===== HEADER =====
    const headerRow = worksheet.addRow(header);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFEFEF' },
      };

      cell.border = {
        top: { style: 'medium' },
        left: { style: 'medium' },
        bottom: { style: 'medium' },
        right: { style: 'medium' },
      };
    });

    // ===== DATA ROW =====
    dataToExport.forEach((row: any) => {
      const newRow = worksheet.addRow(header.map((h: any) => row[h]));

      newRow.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };

        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // ===== FREEZE HEADER =====
    worksheet.views = [{ state: 'frozen', ySplit: 6 }];

    // ===== AUTO WIDTH =====
    worksheet.columns.forEach((col: any) => {
      let maxLength = 10;

      col.eachCell({ includeEmpty: true }, (cell: any) => {
        const val = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, val.length);
      });

      col.width = Math.min(maxLength + 2, 40);
    });

    // ===== DOWNLOAD =====
    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer]),
      `history_transaksi_${moment().format('YYYYMMDD_HHmmss')}.xlsx`
    );
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allValues = options.map((o) => o.value);
  const isAllChecked =
    checkeds.length === allValues.length &&
    allValues.every((v) => checkeds.includes(v));

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <label className="text-base">Filter Transaksi</label>
          <span>:</span>
          <Select
            mode="multiple"
            placeholder="Filter transaksi"
            defaultValue={checkeds}
            onChange={handleChange}
            options={options}
            optionRender={(option) => <Space>{option.data.label}</Space>}
            className={`select-base ${
              checkeds.length == 0 ? 'w-[180px]' : 'w-fit'
            }`}
          />
        </div>
        <button
          className="btn !h-[44px] btn-primary"
          onClick={() => exportData()}
        >
          <span>
            <FileDownload02 />
          </span>
          Download Transaksi
        </button>
      </div>
      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]">
        <table className="table-basic">
          <thead>
            <tr>
              <th>No</th>
              <th>Tipe Transaksi</th>
              <th>Tanggal Transaksi</th>
              <th>No. Referensi</th>
              <th>Email</th>
              <th>Nominal Transaksi</th>
              <th>Berat Emas</th>
              <th>Pengirim</th>
              <th>Penerima</th>
              <th>Berat Emas (Diterima)</th>
              {isAllChecked && (
                <>
                  <th>Saldo Emas</th>
                  <th>Saldo Wallet</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {histories.map((item, index: number) => (
              <tr key={index}>
                <td>{index + params.offset + 1}</td>
                <td>{statusTransaksiLangMap[item.transaction_type]}</td>
                <td>{moment(item.transaction_date).format('DD MMMM YYYY')}</td>
                <td>{item.ref_number}</td>
                <td>{item.email}</td>
                <td>Rp{formatterNumber(parseInt(item.price))}</td>
                <td>{item.weight + ' Gram'}</td>
                <td>{item.user_from}</td>
                <td>{item.user_to}</td>
                <td>{item.transfered_weight}</td>
                {isAllChecked && (
                  <>
                    <td>{item.gold_balance}</td>
                    <td>{item.wallet_balance}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end p-[12px]">
          <Pagination
            onChange={onChangePage}
            pageSize={params.limit}
            total={total}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileTransaction;
