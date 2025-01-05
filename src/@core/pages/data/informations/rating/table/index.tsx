"use client"
import { IRating } from '@/@core/@types/interface';
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
moment.locale('id')

const InformationRatingPageTable = () => {
    const url = `/core/information/rating/`
    const [dataTable, setDataTable] = useState<Array<IRating>>([]);
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
    const columns: ColumnsType<IRating>  = [
        { title: 'No', width: 70, dataIndex: 'customer_service_id', key: 'customer_service_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Nama Informasi', dataIndex: 'information_rate_name', key: 'information_rate_name', width: 150},
        { title: 'Rate', dataIndex: 'rate', key: 'rate', width: 50},
        { title: 'Message', dataIndex: 'message', key: 'message'},
        { title: '', key: 'action', fixed: 'right', width:100,
          render: (_, record) =>
          (<div className='flex items-center gap-[5px] justify-center'>
            <Link href={`/data/informations/rating/${record.information_rate_id}`} className="btn-action"><Edit05 /></Link>
            <a className='btn-action' onClick={() => deleteData(record.information_rate_id)}><Trash01 /></a>

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
            message: 'Data Rating',
            description: "Data Rating Berhasil Dihapus",
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
        const dataToExport = rows.map((item: IRating, index:number) => ({
            'No' : index+1,
            'Nama Informasi': item.information_rate_name,
            'Rating': item.rate,
            'Message / Pesan': item.message,
            'Publish': item.publish,
        }),);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        const colA = 5;
        const colB = rows.reduce((w:number, r:IRating) => Math.max(w, r.information_rate_name ? r.information_rate_name.length : 10), 10);
        const colC = 10;
        const colD = rows.reduce((w:number, r:IRating) => Math.max(w, r.message ? r.message.length : 10), 10);

        worksheet["!cols"] = [ { wch: colA }, { wch: colB }, { wch: colC }, { wch: colD }, { wch: 20 }  ]; 

        XLSX.utils.book_append_sheet(workbook, worksheet, 'rating');
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `data_rating.xlsx`)
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
                <Link href={`/data/informations/rating/form`} className="btn btn-outline-neutral"><Plus />Add data</Link>
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
                rowKey="information_rate_id"
            
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

export default InformationRatingPageTable
