'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  IOrderGoldDetail,
  IOrderGoldItem,
  IOrderReturn,
  IPenggunaAplikasi,
  IUser,
} from '@/@core/@types/interface';
import ModalLoading from '@/@core/components/modal/modal-loading';
import axiosInstance from '@/@core/utils/axios';
import { formatDecimal } from '@/@core/utils/general';
import {
  CheckCircle,
  FileDownload02,
  Plus,
  Save02,
  X,
} from '@untitled-ui/icons-react';
import { DatePicker, notification, Pagination, Select, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import 'moment/locale/id';
import ModalUpdate from '@/@core/pages/transaksi/components/modal-update';
import ModalOrderItem from '@/@core/components/modal/modal-order-item';
import ModalReturn from '@/@core/components/modal/modal-return';
import ModalApprove from '@/@core/pages/transaksi/components/modal-approve';
import ModalReject from '@/@core/pages/transaksi/components/modal-reject';
import { PrinterFilled } from '@ant-design/icons';
import ModalReturnPrint from '@/@core/pages/transaksi/return/modal-return';

moment.locale('id');
const { RangePicker } = DatePicker;

/* ================= HELPER EXCEL ================= */
const getExcelColumnLabel = (colIndex: number): string => {
  let label = '';
  let index = colIndex;
  while (index > 0) {
    const remainder = (index - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    index = Math.floor((index - 1) / 26);
  }
  return label;
};

const DaftarReturnEmasPage = () => {
  const url = `/orders/fix/order/return/list/`;

  const defaultStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const defaultEnd = dayjs().format('YYYY-MM-DD');

  const [dataTable, setDataTable] = useState<IOrderReturn[]>([]);
  const [selectedData, setSelectedData] = useState<IOrderReturn>(
    {} as IOrderReturn
  );
  const [total, setTotal] = useState(0);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isModalLoadingReturn, setIsModalLoadingReturn] = useState(false);
  const [isModalItem, setIsModalItem] = useState(false);
  const [openModalReturn, setOpenModalReturn] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const [openModalReject, setOpenModalReject] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedItem, setSelectedItem] = useState<IOrderGoldDetail>(
    {} as IOrderGoldDetail
  );
  const [goldCertDetailPrice, setGoldCertDetailPrice] = useState('');
  const [orderGoldId, setOrderGoldId] = useState('');

  const [api, contextHolder] = notification.useNotification();

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: defaultStart,
    end_date: defaultEnd,
    search: '',
    return_status: '',
  });

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setParams((p) => ({ ...p, offset: 0, search: debouncedSearch }));
  }, [debouncedSearch]);

  const handleStatusFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      offset: 0,
      return_status: value || '',
    }));
  };

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
            <div className="flex items-center gap-2">
              <a
                className="btn bg-red-500 hover:text-white text-white flex flex-row items-center gap-2 w-[100px]"
                onClick={() => {
                  setSelectedId(record.order_return_id);
                  setOpenModalReject(true);
                }}
              >
                <X />
                Tolak
              </a>
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
            </div>
          )}
          {record.return_status == 'APPROVED' &&
            record.gold_transfer_number == null && (
              <a
                className="btn btn-success flex flex-row items-center gap-2 w-[100px]"
                onClick={() => {
                  setSelectedData(record);
                  setOpenModalUpdate(true);
                }}
              >
                <Save02 />
                Update
              </a>
            )}

          <a
            className="btn btn-outline-primary flex flex-row items-center gap-2 w-[120px]"
            onClick={() => {
              setSelectedData(record);
              setOpenModalPrint(true);
            }}
          >
            <PrinterFilled />
            Print Out
          </a>
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
    setOpenModalUpdate(false);
    setIsModalLoadingReturn(true);
    const respUser = await axiosInstance.get(
      `/users/admin/${selectedData.order_user_id}`
    );

    const user: IPenggunaAplikasi = respUser.data.user;
    const payload = {
      phone_number: user.phone_number,
      transfer_member_gold_weight: selectedData.gold_cert_weight,
      transfer_ref_number: `RETURN_${selectedData.order_number}`,
      transfer_member_notes: `RETURN_${selectedData.order_number}`,
      transfer_member_service_option: '',
    };
    const resp = await axiosInstance.post(
      `gold-transaction/gold-transfer/create`,
      payload
    );
    const { data } = resp;
    const body = {
      gold_transfer: data.gold_transfer_id,
      return_type: 'BY_GOLD',
    };
    await axiosInstance.put(
      `orders/fix/order/return/${selectedData.order_return_id}/update-transfer/`,
      body
    );
    fetchData();
    setIsModalLoadingReturn(false);
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

      let user: IUser | null = null;
      try {
        const storedUser = localStorage.getItem('user');
        user = storedUser ? JSON.parse(storedUser) : null;
      } catch (e) {
        console.warn('Failed to parse user from localStorage', e);
      }

      const rows = await fetchAllData();
      if (!rows.length) {
        api.warning({
          message: 'Export Excel',
          description: 'Tidak ada data untuk diexport',
          placement: 'bottomRight',
        });
        return;
      }

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

      const totalColumns = Object.keys(data[0]).length;
      const lastColumnLetter = getExcelColumnLabel(totalColumns);

      /* ================= TITLE & METADATA ================= */
      const metadata = [
        { cell: 'A1', val: 'LAPORAN RETUR EMAS', bold: true, size: 14 },
        { cell: 'A2', val: `Dibuat oleh : ${user?.name || '-'}` },
        {
          cell: 'A3',
          val: `Tanggal Export : ${dayjs().format('DD MMMM YYYY HH:mm')}`,
        },
        { cell: 'A4', val: `Total Data : ${rows.length}` },
      ];

      let periodeText = 'Semua Periode';
      if (params.start_date && params.end_date) {
        periodeText = `${dayjs(params.start_date).format(
          'DD-MM-YYYY'
        )} s/d ${dayjs(params.end_date).format('DD-MM-YYYY')}`;
      }
      metadata.push({ cell: 'A5', val: `Periode : ${periodeText}` });

      metadata.forEach((m, idx) => {
        const rowNum = idx + 1;
        ws.mergeCells(`A${rowNum}:${lastColumnLetter}${rowNum}`);
        const c = ws.getCell(m.cell);
        c.value = m.val;
        c.font = {
          name: 'Calibri',
          bold: !!m.bold,
          size: m.size || 11,
          color: { argb: 'FF1E293B' },
        };
        c.alignment = { horizontal: 'left', vertical: 'middle' };
      });

      ws.addRow([]); // Row 6 blank

      /* ================= HEADER ================= */
      const headers = Object.keys(data[0]);
      const headerRow = ws.addRow(headers);
      const headerRowIndex = 7;
      headerRow.height = 26;

      headerRow.eachCell((c) => {
        c.font = {
          name: 'Calibri',
          bold: true,
          color: { argb: 'FFFFFFFF' },
          size: 11,
        };
        c.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
        c.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'medium', color: { argb: 'FF004397' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };
        c.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0057B7' },
        };
      });

      /* ================= DATA ================= */
      data.forEach((row, idx) => {
        const values = headers.map((h) => (row as any)[h]);
        const newRow = ws.addRow(values);
        newRow.height = 20;

        const isEven = idx % 2 === 1;
        const rowBgColor = isEven ? 'FFF8FBFF' : 'FFFFFFFF';

        for (let colNumber = 1; colNumber <= totalColumns; colNumber++) {
          const cell = newRow.getCell(colNumber);
          const isNumeric = [6, 8, 9].includes(colNumber);
          const isCenter = [3, 4, 10].includes(colNumber);

          cell.font = {
            name: 'Calibri',
            size: 10,
            color: { argb: 'FF334155' },
          };

          cell.alignment = {
            horizontal: isNumeric ? 'right' : isCenter ? 'center' : 'left',
            vertical: 'middle',
          };

          // Format angka
          if (typeof cell.value === 'number') {
            if (colNumber === 9) {
              cell.value = `Rp${formatDecimal(cell.value)}`;
            } else {
              cell.value = formatDecimal(cell.value);
            }
          }

          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowBgColor },
          };

          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          };
        }
      });

      /* ================= TOTAL ================= */
      const totalBeratSertifikat = rows.reduce(
        (acc, cur) => acc + Number(cur.gold_cert_weight || 0),
        0
      );

      const totalBeratTransfer = rows.reduce(
        (acc, cur) => acc + Number(cur.gold_transfer_weight || 0),
        0
      );

      const totalNominalTransfer = rows.reduce(
        (acc, cur) => acc + Number(cur.gold_transfer_amount || 0),
        0
      );

      const totalRow = ws.addRow([
        'TOTAL',
        '',
        '',
        '',
        '',
        formatDecimal(totalBeratSertifikat),
        '',
        formatDecimal(totalBeratTransfer),
        `Rp${formatDecimal(totalNominalTransfer)}`,
        '',
      ]);

      totalRow.height = 22;

      totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const isNumeric = [6, 8, 9].includes(colNumber);

        cell.font = {
          name: 'Calibri',
          bold: true,
          size: 10,
          color: { argb: 'FF1E293B' },
        };
        cell.alignment = {
          horizontal: isNumeric ? 'right' : 'left',
          vertical: 'middle',
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFCE29F' },
        };
      });

      const dataEndRow = headerRowIndex + data.length;

      /* ================= AUTOFILTER & FREEZE ================= */
      ws.autoFilter = `A${headerRowIndex}:${lastColumnLetter}${dataEndRow}`;
      ws.views = [{ state: 'frozen', xSplit: 0, ySplit: headerRowIndex }];

      /* ================= AUTO WIDTH ================= */
      ws.columns.forEach((c) => {
        if (!c) return;
        let max = 10;
        c.eachCell?.({ includeEmpty: true }, (cell, rowNumber) => {
          if (rowNumber < headerRowIndex) return;
          max = Math.max(max, cell.value?.toString().length || 0);
        });
        c.width = Math.min(max + 4, 35);
      });

      /* ================= EXPORT ================= */
      const buffer = await wb.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `laporan_retur_emas_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } finally {
      setIsModalLoading(false);
    }
  };

  const selectItem = async (item: IOrderGoldItem) => {
    const respDetail = await axiosInstance.get(
      `/reports/gold-sales-order/${item.order_gold_id}/detail`
    );
    const { data } = respDetail;
    const details: IOrderGoldDetail[] = data.order_gold_details;
    const obj: IOrderGoldDetail | undefined = details.find(
      (x) => (x.order_gold_detail_id = item.order_gold_detail_id)
    );
    if (obj) {
      setSelectedItem(obj);
      setGoldCertDetailPrice(obj.delivery_details.gold_cert_detail_price);
    }

    setOrderNumber(item.order_number);
    setOrderGoldId(item.order_gold_id);

    setIsModalItem(false);
    setOpenModalReturn(true);
  };

  return (
    <>
      {contextHolder}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            defaultValue={[dayjs(defaultStart), dayjs(defaultEnd)]}
            onChange={onRangeChange}
          />
          <input
            className="border rounded-md px-3 py-1.5 text-sm w-[200px] h-[40px]"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            placeholder="Filter Status"
            className="w-[160px] h-[40px]"
            allowClear
            onChange={handleStatusFilter}
            options={[
              { value: 'APPROVED', label: 'APPROVED' },
              { value: 'PROCESS', label: 'PROCESS' },
              { value: 'REJECTED', label: 'REJECTED' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-primary" onClick={exportData}>
            <FileDownload02 />
            Export Excel
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => setIsModalItem(true)}
          >
            <Plus />
            Tambah Return
          </button>
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
      <ModalReject
        isModalOpen={openModalReject}
        setIsModalOpen={setOpenModalReject}
        selectedId={selectedId}
        setRefresData={() => fetchData()}
      />
      <ModalUpdate
        isModalOpen={openModalUpdate}
        setIsModalOpen={setOpenModalUpdate}
        content="Update Transfer Data Ini?"
        onConfirm={updateTransfer}
      />
      <ModalLoading
        isModalOpen={isModalLoadingReturn}
        textInfo="Harap tunggu, data sedang diproses"
      />
      <ModalOrderItem
        isModalOpen={isModalItem}
        setIsModalOpen={setIsModalItem}
        onConfirm={(item) => {
          selectItem(item);
        }}
      />
      {openModalReturn && (
        <ModalReturn
          isModalOpen={openModalReturn}
          setIsModalOpen={setOpenModalReturn}
          orderGoldId={orderGoldId}
          goldCertDetailPrice={goldCertDetailPrice}
          orderNumber={orderNumber}
          item={selectedItem}
          setRefresData={() => fetchData()}
        />
      )}
      {openModalPrint && (
        <ModalReturnPrint
          setIsModalOpen={setOpenModalPrint}
          isModalOpen={openModalPrint}
          returnId={selectedData.order_return_id}
        />
      )}
    </>
  );
};

export default DaftarReturnEmasPage;
