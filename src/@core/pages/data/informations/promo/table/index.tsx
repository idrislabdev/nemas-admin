"use client"
import { IPromo } from '@/@core/@types/interface';
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
import Image from 'next/image';
moment.locale('id')

const InformationPromoPageTable = () => {
    const url = `/core/information/promo/`
    const [dataTable, setDataTable] = useState<Array<IPromo>>([]);
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
    const columns: ColumnsType<IPromo>  = [
        { title: 'No', width: 70, dataIndex: 'customer_service_id', key: 'customer_service_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Kode Promo', dataIndex: 'promo_code', key: 'promo_code', width:150},
        { title: 'Level User', dataIndex: 'leveling_user', key: 'leveling_user', width:150},
        { title: 'Nama Promo', dataIndex: 'promo_name', key: 'promo_name', width:150},
        { title: 'URL Promo', dataIndex: 'promo_url', key: 'promo_url', width:150},
        { title: 'Tanggal Mulai', dataIndex: 'promo_start_date', key: 'promo_start_date', width:150,
            render: (_, record) => (moment(record.promo_start_date).format("DD-MM-YYYY"))
        },
        { title: 'Tanggal Berakhir', dataIndex: 'promo_end_date', key: 'promo_end_date', width:150,
            render: (_, record) => (moment(record.promo_end_date).format("DD-MM-YYYY"))
        },
        { title: 'Tag Promo', dataIndex: 'promo_tag', key: 'promo_tag', width:150},
        { title: 'Promo Background', dataIndex: 'information_background', key: 'information_background', width: 200,
            render: (_, record) => 
            record.promo_url_background ? 
            <Image 
                src={record.promo_url_background} 
                alt='image background' 
                width={0} 
                height={0} 
                sizes='100%' 
                className='w-[120px] h-[60px] object-cover border border-gray-200 rounded-md' 
            /> : ''
        },
        { title: 'Promo Diskon', dataIndex: 'promo_diskon', key: 'promo_diskon', width:150 },
        { title: 'Promo Cashback', dataIndex: 'promo_cashback', key: 'promo_cashback', width:150 },
        { title: 'Merchant Cashback', dataIndex: 'merchant_cashback', key: 'merchant_cashback', width:200 },
        { title: 'Dibuat oleh', dataIndex: 'create_user', key: 'create_user', width:150},
        { title: 'Diupdate oleh', dataIndex: 'upd_user', key: 'upd_user', width:150},
        { title: '', key: 'action', fixed: 'right', width:100,
          render: (_, record, index) =>
          (<div className='flex items-center gap-[5px] justify-center' key={index}>
            <Link href={`/data/informations/promo/${record.promo_id}`} className="btn-action"><Edit05 /></Link>
            <a className='btn-action' onClick={() => deleteData(record.promo_id)}><Trash01 /></a>

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
            message: 'Data Pelayanan Pelanggan',
            description: "Data Pelayanan Pelanggan Berhasil Dihapus",
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
        const dataToExport = rows.map((item: IPromo, index:number) => ({
            'No' : index+1,
            'Kode Promo': item.promo_code,
            'Level User': item.promo_code,
            'Nama Promo': item.promo_name,
            'Url Promo': item.promo_url,
            'Tanggal Mulai': moment(item.promo_start_date).format("DD-MM-YYYY"),
            'Tanggal Berakhir': moment(item.promo_end_date).format("DD-MM-YYYY"),
            'Tag Promo': item.promo_tag,
            'Diskon': item.promo_diskon,
            'Promo Cashback': item.promo_cashback,
            'Merchant Cashback': item.merchant_cashback,
        }),);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        const colA = 5;
        const colB = rows.reduce((w:number, r:IPromo) => Math.max(w, r.promo_code ? r.promo_code.length : 10), 10);;
        const colC = rows.reduce((w:number, r:IPromo) => Math.max(w, r.leveling_user? r.leveling_user.length : 10), 10);
        const colD = rows.reduce((w:number, r:IPromo) => Math.max(w, r.promo_name ? r.promo_name.length : 10), 10);
        const colE = rows.reduce((w:number, r:IPromo) => Math.max(w, r.promo_url ? r.promo_url.length : 10), 10);
        const colF = 20;
        const colG = 20;
        const colH = rows.reduce((w:number, r:IPromo) => Math.max(w, r.promo_tag ? r.promo_tag.length : 10), 10);
        const colI = 20;
        const colJ = 20;

        worksheet["!cols"] = [ { wch: colA }, { wch: colB }, { wch: colC }, { wch: colD }, { wch: colD}, { wch: colE }, { wch: colF }, { wch: colG }, { wch: colH }, { wch: colI }, { wch: colJ }, { wch: 20 }  ]; 

        XLSX.utils.book_append_sheet(workbook, worksheet, 'promo');
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `data_promo.xlsx`)
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
                <Link href={`/data/informations/promo/form`} className="btn btn-outline-neutral"><Plus />Add data</Link>
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
                rowKey="promo_id"
            
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

export default InformationPromoPageTable
