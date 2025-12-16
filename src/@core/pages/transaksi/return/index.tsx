'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { IOrderReturn } from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import { CheckCircle, FileDownload02, Save02 } from '@untitled-ui/icons-react';
import { DatePicker, notification, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';
import ModalApprove from '@/@core/pages/transaksi/components/modal-approve';
import ModalUpdate from '@/@core/pages/transaksi/components/modal-update';

moment.locale('id');
const { RangePicker } = DatePicker;

const DaftarReturnEmasPage = () => {
  const url = `/orders/fix/order/return/list/`;

  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const defaultEnd = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<IOrderReturn[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [api, contextHolder] = notification.useNotification();

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart,
    end_date: defaultEnd,
    search: '',
  });

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setParams((p) => ({ ...p, offset: 0, search: debouncedSearch }));
  }, [debouncedSearch]);

  const columns: ColumnsType<IOrderReturn> = [
    { title: 'No Retur', dataIndex: 'return_number', width: 150 },
    { title: 'No Order', dataIndex: 'order_number', width: 150 },
    {
      title: 'Tanggal Retur',
      dataIndex: 'return_date',
      width: 150,
      render: (val) => moment(val).format('DD MMMM YYYY'),
    },
    {
      title: 'Tipe Retur',
      dataIndex: 'return_type',
      width: 120,
    },
    {
      title: 'Kode Sertifikat',
      dataIndex: 'gold_cert_code',
      width: 150,
    },
    {
      title: 'Berat Sertifikat',
      dataIndex: 'gold_cert_weight',
      width: 150,
      render: (val) => `${formatDecimal(Number(val || 0))} Gram`,
    },
    {
      title: 'No Transfer',
      dataIndex: 'gold_transfer_number',
      width: 150,
    },
    {
      title: 'Berat Transfer',
      dataIndex: 'gold_transfer_weight',
      width: 150,
      render: (val) => `${formatDecimal(Number(val || 0))} Gram`,
    },
    {
      title: 'Nominal Transfer',
      dataIndex: 'gold_transfer_amount',
      width: 170,
      render: (val) => (val ? `Rp${formatDecimal(Number(val))}` : '-'),
    },
    {
      title: 'Status Retur',
      dataIndex: 'return_status',
      width: 150,
      fixed: 'right',
    },
    {
      title: 'Aksi',
      dataIndex: 'action',
      width: 150,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center gap-[5px] justify-center">
          {record.return_status == 'PROCESS' && (
            <a
              className="btn btn-primary flex flex-row items-center gap-2 w-[100px]"
              onClick={() => {
                setSelectedId(record.order_return_id);
                setOpenModalApprove(true);
              }}
            >
              <CheckCircle />
              Approve
            </a>
          )}
          {record.return_status == 'APPROVED' && (
            <a
              className="btn btn-success flex flex-row items-center gap-2 w-[100px]"
              onClick={() => {
                setSelectedId(record.order_return_id);
                setOpenModalUpdate(true);
              }}
            >
              <Save02 />
              Update
            </a>
          )}
        </div>
      ),
    },
  ];

  const approveData = async () => {
    const body = {
      status: 'APPROVED',
      return_notes: 'APPROVED',
    };
    await axiosInstance.put(
      `orders/fix/order/return/${selectedId}/action/`,
      body
    );
    fetchData();
    setOpenModalApprove(false);
    api.info({
      message: 'Data Return',
      description: 'Data Return Telah Berhasil Diapprove',
      placement: 'bottomRight',
    });
  };

  const updateTransfer = async () => {
    const body = {
      gold_transfer: '',
      return_type: 'BY_GOLD',
    };
    await axiosInstance.put(
      `orders/fix/order/return/${selectedId}/update-transfer/`,
      body
    );
    fetchData();
    setOpenModalUpdate(false);
    api.info({
      message: 'Data Return',
      description: 'Data Return Telah Berhasil Diupdate',
      placement: 'bottomRight',
    });
  };

  const fetchData = useCallback(async () => {
    const resp = await axiosInstance.get(url, { params });
    setDataTable(resp.data.results);
    setTotal(resp.data.count);
  }, [params, url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onChangePage = (page: number) => {
    setParams({ ...params, offset: (page - 1) * params.limit });
  };

  const onRangeChange = (_: null | (Dayjs | null)[], dateStrings: string[]) => {
    setParams({
      ...params,
      offset: 0,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
    });
  };

  // fetch all for export
  const fetchAllData = async () => {
    let rows: IOrderReturn[] = [];
    const limit = 100;

    const first = await axiosInstance.get(url, {
      params: { ...params, limit, offset: 0 },
    });

    rows = first.data.results;
    const pages = Math.ceil(first.data.count / limit);

    for (let i = 1; i < pages; i++) {
      const r = await axiosInstance.get(url, {
        params: { ...params, limit, offset: i * limit },
      });
      rows = rows.concat(r.data.results);
    }

    return rows;
  };

  const exportData = async () => {
    try {
      setIsModalLoading(true);

      const rows = await fetchAllData();
      if (!rows.length) return;

      const data = rows.map((r) => ({
        'No Retur': r.return_number,
        'No Order': r.order_number,
        'Tanggal Retur': moment(r.return_date).format('DD-MM-YYYY'),
        'Tipe Retur': r.return_type,
        'Kode Sertifikat': r.gold_cert_code,
        'Berat Sertifikat (Gram)': Number(r.gold_cert_weight || 0),
        'No Transfer': r.gold_transfer_number,
        'Berat Transfer (Gram)': Number(r.gold_transfer_weight || 0),
        'Nominal Transfer (Rp)': Number(r.gold_transfer_amount || 0),
        'Status Retur': r.return_status,
      }));

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Laporan Retur Emas');

      ws.mergeCells('A1:J1');
      ws.getCell('A1').value = 'LAPORAN RETUR EMAS';
      ws.getCell('A1').font = { bold: true, size: 14 };

      ws.mergeCells('A2:J2');
      ws.getCell('A2').value = `Periode: ${dayjs(params.start_date).format(
        'DD-MM-YYYY'
      )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;

      ws.addRow([]);

      const headers = Object.keys(data[0]);
      ws.addRow(headers).eachCell((c) => {
        c.font = { bold: true };
        c.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      data.forEach((row) => {
        ws.addRow(headers.map((h) => (row as any)[h]));
      });

      ws.columns.forEach((c) => {
        let max = 10;
        c.eachCell?.({ includeEmpty: true }, (cell) => {
          max = Math.max(max, cell.value?.toString().length || 0);
        });
        c.width = max + 2;
      });

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `laporan_retur_emas_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="flex justify-between items-center gap-3">
        <div className="flex gap-2">
          <RangePicker
            size="small"
            className="w-[300px]"
            defaultValue={[dayjs(defaultStart), dayjs(defaultEnd)]}
            onChange={onRangeChange}
          />
          <input
            className="border rounded-md px-3 py-1.5 text-sm w-[200px]"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
          {/* <button className="btn btn-outline-primary">
            <Plus />
            Tambah Return
          </button> */}
        </div>
      </div>

      <div className="border rounded mt-3">
        <Table
          rowKey="order_return_id"
          columns={columns}
          dataSource={dataTable}
          pagination={false}
          scroll={{ x: 'max-content', y: 550 }}
          size="small"
        />
        <div className="flex justify-end p-3">
          <Pagination
            total={total}
            pageSize={params.limit}
            onChange={onChangePage}
            showSizeChanger={false}
          />
        </div>
      </div>

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
      <ModalApprove
        isModalOpen={openModalApprove}
        setIsModalOpen={setOpenModalApprove}
        content="Approve Data Ini?"
        onConfirm={approveData}
      />
      <ModalUpdate
        isModalOpen={openModalUpdate}
        setIsModalOpen={setOpenModalUpdate}
        content="Update Transfer Data Ini?"
        onConfirm={updateTransfer}
      />
    </>
  );
};

export default DaftarReturnEmasPage;
