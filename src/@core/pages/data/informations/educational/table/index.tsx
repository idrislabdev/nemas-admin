"use client"
import { IEducational } from '@/@core/@types/interface';
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

const InformationEducataionalPageTable = () => {
    const url = `/core/information/educational/`
    const [dataTable, setDataTable] = useState<Array<IEducational>>([]);
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
    const columns: ColumnsType<IEducational>  = [
        { title: 'No', width: 70, dataIndex: 'educational_id', key: 'educational_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Nama', dataIndex: 'information_name', key: 'information_name', width: 200},
        { title: 'Catatan', dataIndex: 'information_notes', key: 'information_notes', width: 500},
        { title: 'Link / URL', dataIndex: 'information_url', key: 'information_url',
            render: (_, record) => <a href={record.information_url} target='_blank' className='block'>{record.information_url}</a>
        },
        { title: 'Gambar / Foto', dataIndex: 'information_background', key: 'information_background',
            render: (_, record) => 
            record.information_background ? 
            <Image 
                src={record.information_background} 
                alt='image background' 
                width={0} 
                height={0} 
                sizes='100%' 
                className='w-[120px] h-[60px] object-cover border border-gray-200 rounded-md' 
            /> : ''
        },
        { title: '', key: 'action', fixed: 'right', width:100,
          render: (_, record) =>
          (<div className='flex items-center gap-[5px] justify-center'>
            <Link href={`/data/informations/educational/${record.information_educational_id}`} className="btn-action"><Edit05 /></Link>
            <a className='btn-action' onClick={() => deleteData(record.information_educational_id)}><Trash01 /></a>

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
            message: 'Data Educational',
            description: "Data Educational Berhasil Dihapus",
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
        const dataToExport = rows.map((item: IEducational, index:number) => ({
            'No' : index+1,
            'Nama': item.information_name,
            'Catatan': item.information_notes,
        }),);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        const colA = 5;
        const colB = 10;
        const colC = rows.reduce((w:number, r:IEducational) => Math.max(w, r.information_name ? r.information_name.length : 10), 10);
        const colD = rows.reduce((w:number, r:IEducational) => Math.max(w, r.information_notes ? r.information_notes.length : 10), 10);

        worksheet["!cols"] = [ { wch: colA }, { wch: colB }, { wch: colC }, { wch: colD }, { wch: 20 }  ]; 

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Educational');
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `data_educational.xlsx`)
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
                <Link href={`/data/informations/educational/form`} className="btn btn-outline-neutral"><Plus />Add data</Link>
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
                rowKey="information_educational_id"
            
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

export default InformationEducataionalPageTable
