"use client"
import { IBank } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react'
import { Pagination, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Edit05, FileDownload02, Plus, SearchSm, Trash01 } from '@untitled-ui/icons-react';
import Link from 'next/link';
import { notification } from 'antd';
import * as XLSX from "xlsx";
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
// import Image from 'next/image';
moment.locale('id')

const PaymentBankgPageTable = () => {
    const url = `/core/payment/bank/`
    const [dataTable, setDataTable] = useState<Array<IBank>>([]);
    const [total, setTotal] = useState(0);
    const [openModalConfirm, setOpenModalConfirm ] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
    const [isModalLoading, setIsModalLoading] = useState(false)
    const [params, setParams] = useState({
        format: 'json',
        offset: 0,
        limit: 10,
        type__icontains:"",
    });
    const [api, contextHolder] = notification.useNotification();
    const columns: ColumnsType<IBank>  = [
        { title: 'No', width: 70, dataIndex: 'bank_id', key: 'bank_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Nama Bank', dataIndex: 'bank_name', key: 'bank_name'},
        { title: 'Kode Bank', dataIndex: 'bank_code', key: 'bank_code', width: 150},
        // { title: 'Logo', dataIndex: 'bank_logo_url', key: 'bank_logo_url',
        //     render: (_, record) => 
        //     record.bank_logo_url && record.bank_logo_url != '-' && record.bank_logo_url != '' ? 
        //     <Image 
        //         src={record.bank_logo_url} 
        //         alt='image background' 
        //         width={0} 
        //         height={0} 
        //         sizes='100%' 
        //         className='w-[120px] h-[60px] object-cover border border-gray-200 rounded-md' 
        //     /> : ''
        // },
        { title: 'Kode Merchant', dataIndex: 'bank_merchant_code', key: 'bank_merchant_code'},
        { title: 'Status', dataIndex: 'bank_active', key: 'bank_active',
            render:(_, record) => record.bank_active ? 'Aktif' : 'Tidak Aktif'
        },
        { title: 'Dibuat Oleh', dataIndex: 'create_user', key: 'create_user', width: 150},
        { title: 'Tanggal Buat', dataIndex: 'create_time', key: 'create_time', width: 150,
            render: (_, record) => (
                moment(record.create_time).format("DD MMM YYYY, HH:mm")
            )
        },
        { title: 'Diupdate Oleh', dataIndex: 'upd_user', key: 'upd_user', width: 150},
        { title: 'Tanggal Update', dataIndex: 'upd_time', key: 'upd_time', width: 150,
            render: (_, record) => (
                moment(record.upd_time).format("DD MMM YYYY, HH:mm")
            )
        },
        { title: '', key: 'action', fixed: 'right', width:100,
          render: (_, record) =>
          (<div className='flex items-center gap-[5px] justify-center'>
            <Link href={`/payment/bank/${record.bank_id}`} className="btn-action"><Edit05 /></Link>
            <a className='btn-action' onClick={() => deleteData(record.bank_id)}><Trash01 /></a>

        </div>)
        },
    ];

    const fetchData = useCallback(async () => {
        const resp = await axiosInstance.get(url, { params });
        setDataTable(resp.data.results)
        setTotal(resp.data.count)
    },[params, url])

    const onChangePage = async (val:number) => {
        setParams({...params, offset:(val-1)*params.limit})
    }

    const handleFilter = (value:string) => {
        setParams({
           ...params,
           offset: 0,
           limit: 10,
           type__icontains: value,
        });
     };
     
     const deleteData = (id:number|undefined) => {
        if (id) {
            setSelectedId(id)
            setOpenModalConfirm(true)
        }
   
    }
    
    const confirmDelete = async () => {
        await axiosInstance.delete(`${url}${selectedId}/`);
        setOpenModalConfirm(false)
        setParams({
            ...params,
            offset: 0,
            limit: 10,
            type__icontains: "",
         });
        api.info({
            message: 'Data Bank',
            description: "Data Bank Berhasil Dihapus",
            placement:'bottomRight',
        });
    }

    
    const exportData = async () => {
        setIsModalLoading(true)
        const param = {
            format: 'json',
            offset: 0,
            limit: 50,
            type__icontains:"",
        }
        const resp = await axiosInstance.get(url, { params:param });
        const rows = resp.data.results;
        const dataToExport = rows.map((item: IBank, index:number) => ({
            'No' : index+1,
            'Nama Bank': item.bank_name,
            'Kode Bank': item.bank_code,
        }),);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        const colA = 5;
        const colB = 10;
        const colC = rows.reduce((w:number, r:IBank) => Math.max(w, r.bank_name ? r.bank_name.length : 10), 10);
        const colD = rows.reduce((w:number, r:IBank) => Math.max(w, r.bank_code ? r.bank_code.length : 10), 10);

        worksheet["!cols"] = [ { wch: colA }, { wch: colB }, { wch: colC }, { wch: colD }, { wch: 20 }  ]; 

        XLSX.utils.book_append_sheet(workbook, worksheet, 'faq');
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `data_faq.xlsx`)
        setIsModalLoading(false)
    }
    

    useEffect(() => {
        fetchData()
    }, [fetchData])
    return (
        <>
        {contextHolder}
        <div className='flex items-center justify-between'>
            <div className='group-input prepend-append'>
                <span className='append'><SearchSm /></span>
                <input 
                    type='text' 
                    className='color-1 base' 
                    placeholder='cari data'
                    onChange={debounce(
                        (event) => handleFilter(event.target.value),
                        1000
                    )}
                />
            </div>
            <div className='flex items-center gap-[4px]'>
                <button className='btn btn-primary' onClick={exportData}><FileDownload02 />Export Excel</button>
                <Link href={`/payment/bank/form`} className="btn btn-outline-neutral"><Plus />Add data</Link>
            </div>
        </div>
        <div className='flex flex-col border border-gray-200 rounded-tr-[8px] rounded-tl-[8px]'>
            <Table
                columns={columns}
                dataSource={dataTable}
                size='small'
                scroll={{ x: 'max-content', y: 550}}
                pagination={false}
                className='table-basic'
                rowKey="bank_id"
            
            />
            <div className='flex justify-end p-[12px]'>
                <Pagination 
                    onChange={onChangePage} 
                    pageSize={params.limit}  
                    total={total} 
                    showSizeChanger={false}
                />
            </div>
        </div>
        <ModalConfirm 
            isModalOpen={openModalConfirm} 
            setIsModalOpen={setOpenModalConfirm} 
            content='Hapus Data Ini?'
            onConfirm={confirmDelete}
        />
        <ModalLoading 
            isModalOpen={isModalLoading} 
            textInfo='Harap tunggu, data sedang diunduh' 
        />
   </>
  )
}

export default PaymentBankgPageTable
