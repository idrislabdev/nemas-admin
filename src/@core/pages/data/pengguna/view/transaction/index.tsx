'use client';

import { IHistoryTransaction } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { formatterNumber, statusTransaksiLangMap } from '@/@core/utils/general';
import { Download01, FileDownload02 } from '@untitled-ui/icons-react';
import { Pagination, Select, Space } from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

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
    { label: 'Produk Emas Fisik', value: 'order_buy' },
    { label: 'Tarik Emas', value: 'order_redeem' },
    { label: 'Beli Emas', value: 'gold_buy' },
    { label: 'Jual', value: 'gold_sell' },
    { label: 'Transfer Emas', value: 'gold_transfer_send' },
    { label: 'Terima Emas', value: 'gold_transfer_receive' },
    { label: 'Tarik Saldo', value: 'disburst' },
  ];

  const fetchData = useCallback(async () => {
    let filterString = '';
    checkeds.forEach((item) => {
      filterString = filterString + `&transaction_type=${item}`;
    });
    const resp = await axiosInstance.get(
      `/reports/gold-transactions/?user_id=${id}&fetch=${params.limit}&offset=${params.offset}${filterString}`
    );
    setTotal(resp.data.count);
    setHistories(resp.data.results);
  }, [params, checkeds, id]);

  const onChangePage = async (val: number) => {
    setParams({ ...params, offset: (val - 1) * params.limit });
  };

  const exportData = async () => {
    // setIsModalLoading(true)
    let filterString = '';
    checkeds.forEach((item) => {
      filterString = filterString + `&transaction_type=${item}`;
    });
    const resp = await axiosInstance.get(
      `/reports/gold-transactions/?user_id=${id}&fetch=500&offset=${params.offset}${filterString}`
    );
    const rows = resp.data.results;
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
        Penerima: item.user_to,
        Pengirim: item.user_from,
        'Berat Emas (Diterima)': item.transfered_weight,
      })
    );
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
    const colA = 5;
    const colB = 20;
    const colC = 20;
    const colD = 20;
    const colE = 20;
    const colF = 20;
    const colG = 20;
    const colH = 20;
    const colI = 20;
    const colJ = 20;

    worksheet['!cols'] = [
      { wch: colA },
      { wch: colB },
      { wch: colC },
      { wch: colD },
      { wch: colE },
      { wch: colF },
      { wch: colG },
      { wch: colH },
      { wch: colI },
      { wch: colJ },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'History Transaksi');
    // Save the workbook as an Excel file
    XLSX.writeFile(workbook, `history_transaksi.xlsx`);
    // setIsModalLoading(false)
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
            className="w-fit select-base"
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
              <th>Penerima</th>
              <th>Pengirim</th>
              <th>Berat Emas (Diterima)</th>
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
                <td>{item.user_to}</td>
                <td>{item.user_from}</td>
                <td>{item.transfered_weight}</td>
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
