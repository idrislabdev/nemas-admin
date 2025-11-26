/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { IHistoryTransaction } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber, statusTransaksiLangMap } from '@/@core/utils/general';
import { FileDownload02 } from '@untitled-ui/icons-react';
import { DatePicker, Pagination, Select, Space } from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Link from 'next/link';
import { UndoOutlineIcon } from '@/@core/my-icons';
import dayjs, { Dayjs } from 'dayjs';
const { RangePicker } = DatePicker;

const HistoryUserDetailTable = (props: { id: string }) => {
  const { id } = props;

  // ------- DEFAULT DATE -------
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  const [histories, setHistories] = useState<IHistoryTransaction[]>([]);
  const [total, setTotal] = useState(0);

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 15,
    search: '',
    start_date: startOfMonth,
    end_date: today,
  });

  const [checkeds, setCheckeds] = useState<string[]>(['order_buy']);
  const options = [
    { label: 'Produk Emas Fisik', value: 'order_buy' },
    { label: 'Tarik Emas', value: 'order_redeem' },
    { label: 'Beli Emas', value: 'gold_buy' },
    { label: 'Jual', value: 'gold_sell' },
    { label: 'Transfer Emas', value: 'gold_transfer_send' },
    { label: 'Terima Emas', value: 'gold_transfer_receive' },
    { label: 'Tarik Saldo', value: 'disburst' },
    { label: 'Deposito', value: 'deposito' },
    { label: 'Gadai', value: 'loan' },
    { label: 'Bayar Gadai', value: 'loan_pay' },
    { label: 'Topup', value: 'topup' },
  ];

  const fetchData = useCallback(async () => {
    let filterString = '';

    const allValues = options.map((o) => o.value);
    const isAllChecked =
      checkeds.length === allValues.length &&
      allValues.every((v) => checkeds.includes(v));

    const filterDate = `&start_date=${params.start_date}&end_date=${params.end_date}`;

    if (isAllChecked || checkeds.length == 0) {
      filterString = '&export_all=true' + filterDate;
    } else {
      checkeds.forEach((item) => {
        filterString += `&transaction_type=${item}`;
      });
      filterString += filterDate;
    }

    const resp = await axiosInstance.get(
      `/reports/gold-transactions/?user_id=${id}&fetch=${params.limit}&offset=${params.offset}${filterString}`
    );

    setTotal(resp.data.count);
    setHistories(resp.data.results);
  }, [params, checkeds, id]);

  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      limit: 10,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    }));
  };

  // FETCH ALL (EXCEL)
  const fetchAllData = async (filterString: string) => {
    let all: any[] = [];
    const limit = 200;

    const url = `/reports/gold-transactions/?user_id=${id}${filterString}`;
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
      await new Promise((r) => setTimeout(r, 150));
    }

    return all;
  };

  // EXPORT EXCEL
  const exportData = async () => {
    let filterString = '';

    const allValues = options.map((o) => o.value);
    const isAllChecked =
      checkeds.length === allValues.length &&
      allValues.every((v) => checkeds.includes(v));
    const filterDate = `&start_date=${params.start_date}&end_date=${params.end_date}`;

    if (isAllChecked || checkeds.length == 0) {
      filterString = '&export_all=true' + filterDate;
    } else {
      checkeds.forEach((item) => {
        filterString += `&transaction_type=${item}`;
      });
      filterString += filterDate;
    }

    const rows = await fetchAllData(filterString);

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
        'Berat Emas': item.weight + ' Gram',
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('History Transaksi');

    worksheet.mergeCells('A1:J1');
    worksheet.getCell('A1').value = 'LAPORAN HISTORY TRANSAKSI';
    worksheet.getCell('A1').font = { size: 14, bold: true };
    worksheet.getCell('A1').alignment = {
      horizontal: 'left',
      vertical: 'middle',
    };

    let periodeText = '';

    if (!params.start_date || !params.end_date) {
      periodeText = 'semua periode tanggal';
    } else {
      periodeText = `Periode: ${moment(params.start_date).format(
        'DD MMMM YYYY'
      )} – ${moment(params.end_date).format('DD MMMM YYYY')}`;
    }

    worksheet.mergeCells('A2:J2');
    worksheet.getCell('A2').value = periodeText;
    worksheet.getCell('A2').alignment = { horizontal: 'left' };

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
    });

    dataToExport.forEach((row: any) => {
      const newRow = worksheet.addRow(header.map((h: any) => row[h]));
      newRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    worksheet.columns.forEach((col: any) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell: any) => {
        const val = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, val.length);
      });
      col.width = Math.min(Math.max(maxLength + 2, 10), 40);
    });

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
    (checkeds.length === allValues.length &&
      allValues.every((v) => checkeds.includes(v))) ||
    checkeds.length == 0;

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center gap-[8px]">
        <label className="text-base">Filter Transaksi</label>
        <span>:</span>
        <Select
          mode="multiple"
          placeholder="Filter transaksi"
          defaultValue={checkeds}
          onChange={setCheckeds}
          options={options}
          optionRender={(option) => <Space>{option.data.label}</Space>}
          className={`select-base ${
            checkeds.length == 0 ? 'w-[180px]' : 'w-fit'
          }`}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <RangePicker
            size="small"
            className="w-[300px] h-[40px]"
            onChange={onRangeChange}
            defaultValue={[dayjs(startOfMonth), dayjs(today)]}
          />

          <button className="btn !h-[40px] btn-primary" onClick={exportData}>
            <span>
              <FileDownload02 />
            </span>
            Download Transaksi
          </button>
        </div>

        <Link
          href={`/laporan/history-user`}
          className="btn btn-outline-neutral"
        >
          <UndoOutlineIcon /> Kembali
        </Link>
      </div>

      <div className="flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px] overflow-y-auto">
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
            {histories.map((item, index) => (
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

export default HistoryUserDetailTable;
