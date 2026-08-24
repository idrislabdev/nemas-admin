/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, Pagination, Table, message } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { FileDownload02 } from '@untitled-ui/icons-react';
import axiosInstance from '@/@core/utils/axios';
import ModalLoading from '@/@core/components/modal/modal-loading';
import { formatDecimal } from '@/@core/utils/general';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/id';
import { IUser } from '@/@core/@types/interface';

dayjs.locale('id');

const { RangePicker } = DatePicker;

/* ================= INTERFACE ================= */

export interface IGoldRedeemReport {
  order_timestamp: string;
  order_number: string;
  name: string;
  gold_type: string;
  gold_brand: string;
  cert_code: string;
  weight: number;
  gold_price: number;
  cert_price: number;
  order_price: number;
  order_payment_method_name: string;
  order_payment_va_bank: string;
  order_payment_number: string;
  order_gold_payment_status: string;
  tracking_number: string;
  delivery_pickup_date: string;
  tracking_courier_name: string;
  delivery_status: string;
}

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

/* ================= COMPONENT ================= */

const TarikEmasListTable = () => {
  const url = '/reports/gold-redeem/list';

  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

  const today = dayjs().format('YYYY-MM-DD');

  /* ================= STATE ================= */

  const [dataTable, setDataTable] = useState<IGoldRedeemReport[]>([]);

  const [total, setTotal] = useState(0);

  const [isModalLoading, setIsModalLoading] = useState(false);

  const [rangeValue, setRangeValue] = useState<[Dayjs, Dayjs]>([
    dayjs(startOfMonth),
    dayjs(today),
  ]);

  const [searchText, setSearchText] = useState('');

  /* ================= PARAMS ================= */

  const [params, setParams] = useState({
    format: 'json',
    offset: 0,
    limit: 10,
    start_date: startOfMonth,
    end_date: today,
    order_by: 'order_price',
    order_direction: 'DESC',
    search: '',
    order_gold_payment_status: '',
  });

  /* ================= FETCH ================= */

  const fetchData = useCallback(async () => {
    try {
      const resp = await axiosInstance.get(url, {
        params,
      });

      setDataTable(resp.data?.results || []);

      setTotal(resp.data?.count || 0);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= SEARCH DEBOUNCE ================= */

  useEffect(() => {
    const t = setTimeout(() => {
      setParams((prev) => {
        if (prev.search === searchText) {
          return prev;
        }

        return {
          ...prev,
          search: searchText,
          offset: 0,
        };
      });
    }, 500);

    return () => clearTimeout(t);
  }, [searchText]);

  /* ================= DATE FILTER ================= */

  const onRangeChange = (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    if (!dates || !dates[0] || !dates[1]) {
      return;
    }

    setRangeValue([dates[0], dates[1]]);

    setParams((prev) => ({
      ...prev,
      start_date: dateStrings[0],
      end_date: dateStrings[1],
      offset: 0,
    }));
  };

  /* ================= STATUS FILTER ================= */

  const onPaymentStatusChange = (status: string) => {
    setParams((prev) => ({
      ...prev,
      order_gold_payment_status: status,
      offset: 0,
    }));
  };

  /* ================= PAGINATION ================= */

  const onChangePage = (page: number) => {
    setParams((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }));
  };

  /* ================= SORTING ================= */

  const handleTableChange = (
    _: TablePaginationConfig,
    __: any,
    sorter: any
  ) => {
    if (Array.isArray(sorter)) {
      return;
    }

    if (sorter.order) {
      setParams((prev) => ({
        ...prev,
        order_by: sorter.field,
        order_direction: sorter.order === 'ascend' ? 'ASC' : 'DESC',
        offset: 0,
      }));
    }
  };

  /* ================= EXPORT EXCEL ================= */

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

      const resp = await axiosInstance.get(url, {
        params: {
          ...params,
          offset: 0,
          limit: 1000,
        },
      });

      const rows = (resp.data?.results || []) as IGoldRedeemReport[];

      if (!rows.length) {
        message.warning('Tidak ada data untuk diexport');
        return;
      }

      /* ================= MAP DATA ================= */

      const dataToExport = rows.map((r) => ({
        'Tanggal Order':
          r.order_timestamp && dayjs(r.order_timestamp).isValid()
            ? dayjs(r.order_timestamp).format('DD MMMM YYYY HH:mm')
            : '-',

        'No Order': r.order_number || '-',

        Nama: r.name || '-',

        'Jenis Emas': r.gold_type || '-',

        Brand: r.gold_brand || '-',

        'Kode Sertifikat': r.cert_code || '-',

        'Berat (gr)': Number(r.weight) || 0,

        'Harga Emas (Rp)': Number(r.gold_price) || 0,

        'Harga Sertifikat (Rp)': Number(r.cert_price) || 0,

        'Total Order (Rp)': Number(r.order_price) || 0,

        'Metode Pembayaran': r.order_payment_method_name || '-',

        'No Pembayaran': r.order_payment_number || '-',

        'Status Pembayaran': r.order_gold_payment_status || '-',

        Kurir: r.tracking_courier_name || '-',

        'No Resi': r.tracking_number || '-',

        'Status Pengiriman': r.delivery_status || '-',
      }));

      type ExportRow = (typeof dataToExport)[number];

      /* ================= WORKBOOK ================= */

      const workbook = new ExcelJS.Workbook();

      workbook.creator = user?.name || 'System';

      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Laporan Tarik Emas Detail');

      const totalColumns = Object.keys(dataToExport[0]).length;

      const lastColumnLetter = getExcelColumnLabel(totalColumns);

      /* ================= TITLE & METADATA ================= */

      const formattedStartDate =
        params.start_date && dayjs(params.start_date).isValid()
          ? dayjs(params.start_date).format('DD MMMM YYYY')
          : '-';

      const formattedEndDate =
        params.end_date && dayjs(params.end_date).isValid()
          ? dayjs(params.end_date).format('DD MMMM YYYY')
          : '-';

      const statusText = params.order_gold_payment_status || 'Semua Status';

      const metadata = [
        {
          cell: 'A1',
          val: 'LAPORAN TARIK EMAS DETAIL',
          bold: true,
          size: 14,
        },
        {
          cell: 'A2',
          val: `Dibuat oleh : ${user?.name || '-'}`,
        },
        {
          cell: 'A3',
          val: `Tanggal Export : ${dayjs().format('DD MMMM YYYY HH:mm')}`,
        },
        {
          cell: 'A4',
          val: `Total Data : ${rows.length}`,
        },
        {
          cell: 'A5',
          val: `Periode: ${formattedStartDate} s/d ${formattedEndDate}`,
        },
        {
          cell: 'A6',
          val: `Status Pembayaran : ${statusText}`,
        },
      ];

      metadata.forEach((m, idx) => {
        const rowNum = idx + 1;

        worksheet.mergeCells(`A${rowNum}:${lastColumnLetter}${rowNum}`);

        const cell = worksheet.getCell(m.cell);

        cell.value = m.val;

        cell.font = {
          name: 'Calibri',
          bold: !!m.bold,
          size: m.size || 11,
          color: {
            argb: 'FF1E293B',
          },
        };

        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle',
        };
      });

      worksheet.addRow([]);

      /* ================= HEADER ================= */

      const headerKeys = Object.keys(dataToExport[0]) as (keyof ExportRow)[];

      const headerRow = worksheet.addRow(headerKeys);

      const headerRowIndex = 8;

      headerRow.height = 26;

      headerRow.eachCell((cell) => {
        cell.font = {
          name: 'Calibri',
          bold: true,
          color: {
            argb: 'FFFFFFFF',
          },
          size: 11,
        };

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };

        cell.border = {
          top: {
            style: 'thin',
            color: {
              argb: 'FFCBD5E1',
            },
          },
          left: {
            style: 'thin',
            color: {
              argb: 'FFCBD5E1',
            },
          },
          bottom: {
            style: 'medium',
            color: {
              argb: 'FF004397',
            },
          },
          right: {
            style: 'thin',
            color: {
              argb: 'FFCBD5E1',
            },
          },
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: 'FF0057B7',
          },
        };
      });

      /* ================= DATA ROWS ================= */

      const dataStartRow = headerRowIndex + 1;

      dataToExport.forEach((row, idx) => {
        const rowValues = headerKeys.map((key) => row[key]);

        const newRow = worksheet.addRow(rowValues);

        newRow.height = 20;

        const rowBgColor = idx % 2 === 1 ? 'FFF8FBFF' : 'FFFFFFFF';

        for (let colIndex = 1; colIndex <= totalColumns; colIndex++) {
          const cell = newRow.getCell(colIndex);

          const header = headerKeys[colIndex - 1];

          const isNumeric = header.includes('(Rp)') || header.includes('(gr)');

          cell.font = {
            name: 'Calibri',
            size: 10,
            color: {
              argb: 'FF334155',
            },
          };

          cell.alignment = {
            horizontal: isNumeric ? 'right' : 'left',
            vertical: 'middle',
          };

          if (isNumeric && typeof cell.value === 'number') {
            cell.numFmt = header.includes('(gr)') ? '#,##0.00' : '#,##0';
          }

          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
              argb: rowBgColor,
            },
          };

          cell.border = {
            top: {
              style: 'thin',
              color: {
                argb: 'FFE2E8F0',
              },
            },
            left: {
              style: 'thin',
              color: {
                argb: 'FFE2E8F0',
              },
            },
            bottom: {
              style: 'thin',
              color: {
                argb: 'FFE2E8F0',
              },
            },
            right: {
              style: 'thin',
              color: {
                argb: 'FFE2E8F0',
              },
            },
          };
        }
      });

      const dataEndRow = dataStartRow + dataToExport.length - 1;

      /* ================= TOTAL ROW ================= */

      type NumericExportKey =
        | 'Berat (gr)'
        | 'Harga Emas (Rp)'
        | 'Harga Sertifikat (Rp)'
        | 'Total Order (Rp)';

      const totalFields: NumericExportKey[] = [
        'Berat (gr)',
        'Harga Emas (Rp)',
        'Harga Sertifikat (Rp)',
        'Total Order (Rp)',
      ];

      const totalRowValues = headerKeys.map((key, colIdx) => {
        if (key === 'Tanggal Order') {
          return 'TOTAL';
        }

        if (totalFields.includes(key as NumericExportKey)) {
          const colLetter = getExcelColumnLabel(colIdx + 1);

          return {
            formula: `SUM(${colLetter}${dataStartRow}:${colLetter}${dataEndRow})`,
          };
        }

        return '';
      });

      const totalRow = worksheet.addRow(totalRowValues);

      totalRow.height = 22;

      for (let colIndex = 1; colIndex <= totalColumns; colIndex++) {
        const cell = totalRow.getCell(colIndex);

        const header = headerKeys[colIndex - 1];

        const isNumeric = totalFields.includes(header as NumericExportKey);

        cell.font = {
          name: 'Calibri',
          bold: true,
          color: {
            argb: 'FF1E293B',
          },
          size: 11,
        };

        cell.alignment = {
          horizontal: isNumeric ? 'right' : 'left',
          vertical: 'middle',
        };

        if (isNumeric) {
          cell.numFmt = header.includes('(gr)') ? '#,##0.00' : '#,##0';
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: 'FFFFF59D',
          },
        };

        cell.border = {
          top: {
            style: 'thin',
            color: {
              argb: 'FF94A3B8',
            },
          },
          left: {
            style: 'thin',
            color: {
              argb: 'FF94A3B8',
            },
          },
          bottom: {
            style: 'double',
            color: {
              argb: 'FF475569',
            },
          },
          right: {
            style: 'thin',
            color: {
              argb: 'FF94A3B8',
            },
          },
        };
      }

      /* ================= AUTOFILTER & FREEZE ================= */

      worksheet.autoFilter = `A${headerRowIndex}:${lastColumnLetter}${dataEndRow}`;

      worksheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: headerRowIndex,
        },
      ];

      /* ================= AUTO WIDTH ================= */

      worksheet.columns.forEach((col) => {
        let maxLen = 0;

        col.eachCell?.(
          {
            includeEmpty: true,
          },
          (cell, rowNumber) => {
            if (rowNumber < headerRowIndex) {
              return;
            }

            let strVal = '';

            if (
              cell.value &&
              typeof cell.value === 'object' &&
              'formula' in cell.value
            ) {
              strVal = '123,456,789.00';
            } else if (cell.value != null) {
              strVal = cell.value.toString();
            }

            maxLen = Math.max(maxLen, strVal.length);
          }
        );

        col.width = Math.max(maxLen + 4, 14);
      });

      /* ================= SAVE FILE ================= */

      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `laporan_tarik_emas_detail_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`
      );
    } catch (err) {
      console.error('Export failed:', err);

      message.error('Gagal mengunduh laporan Excel');
    } finally {
      setIsModalLoading(false);
    }
  };

  /* ================= COLUMNS ================= */

  const columns: ColumnsType<IGoldRedeemReport> = useMemo(
    () => [
      {
        title: 'Tanggal Order',
        dataIndex: 'order_timestamp',
        render: (v) => (v ? dayjs(v).format('DD MMM YYYY HH:mm') : '-'),
        width: 180,
      },

      {
        title: 'No Order',
        dataIndex: 'order_number',
      },

      {
        title: 'Nama',
        dataIndex: 'name',
      },

      {
        title: 'Jenis Emas',
        dataIndex: 'gold_type',
      },

      {
        title: 'Brand',
        dataIndex: 'gold_brand',
      },

      {
        title: 'Kode Sertifikat',
        dataIndex: 'cert_code',
      },

      {
        title: 'Berat (gr)',
        dataIndex: 'weight',
        align: 'right',
        render: formatDecimal,
      },

      {
        title: 'Harga Emas',
        dataIndex: 'gold_price',
        align: 'right',
        render: (v) => `Rp${formatDecimal(v)}`,
      },

      {
        title: 'Harga Sertifikat',
        dataIndex: 'cert_price',
        align: 'right',
        render: (v) => `Rp${formatDecimal(v)}`,
      },

      {
        title: 'Total Order',
        dataIndex: 'order_price',
        align: 'right',
        render: (v) => `Rp${formatDecimal(v)}`,
      },

      {
        title: 'Metode Bayar',
        dataIndex: 'order_payment_method_name',
      },

      {
        title: 'Status Pembayaran',
        dataIndex: 'order_gold_payment_status',
        align: 'center',
      },

      {
        title: 'Kurir',
        dataIndex: 'tracking_courier_name',
      },

      {
        title: 'No Resi',
        dataIndex: 'tracking_number',
      },

      {
        title: 'Status Pengiriman',
        dataIndex: 'delivery_status',
      },
    ],
    []
  );

  /* ================= RENDER ================= */

  return (
    <>
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* DATE */}
          <RangePicker
            size="small"
            className="w-[320px] h-[40px]"
            value={rangeValue}
            onChange={onRangeChange}
          />

          {/* PAYMENT STATUS */}
          <select
            value={params.order_gold_payment_status}
            onChange={(e) => onPaymentStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 h-[40px] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Semua Status</option>

            <option value="CANCELLED">CANCELLED</option>

            <option value="ISSUED">ISSUED</option>

            <option value="PAID">PAID</option>

            <option value="PENDING">PENDING</option>
          </select>

          {/* SEARCH */}
          <input
            placeholder="Cari data..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border rounded px-3 h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* EXPORT */}
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={exportData}
          disabled={isModalLoading}
        >
          <FileDownload02 />

          {isModalLoading ? 'Mengunduh...' : 'Export Excel'}
        </button>
      </div>

      {/* ================= TABLE ================= */}

      <div className="border border-gray-200 rounded-tr-[8px] rounded-tl-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={dataTable}
            pagination={false}
            onChange={handleTableChange}
            rowKey="order_number"
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
      </div>

      <ModalLoading
        isModalOpen={isModalLoading}
        textInfo="Harap tunggu, data sedang diunduh"
      />
    </>
  );
};

export default TarikEmasListTable;
