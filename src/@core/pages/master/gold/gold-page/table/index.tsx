"use client"
import { IGold } from '@/@core/@types/interface';
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

const GoldPageTable = () => {
    const url = `/core/gold/`
    const [dataTable, setDataTable] = useState<Array<IGold>>([]);
    const [total, setTotal] = useState(0);
    const [openModalConfirm, setOpenModalConfirm ] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
    
    const [params, setParams] = useState({
        format: 'json',
        offset: 0,
        limit: 10,
        type__icontains:"",
    });
    const [api, contextHolder] = notification.useNotification();
    const columns: ColumnsType<IGold>  = [
        { title: 'No', width: 70, dataIndex: 'gold_id', key: 'gold_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Gold Weight', dataIndex: 'gold_weight', key: 'gold_weight', width: 100, fixed: 'left'},
        { title: 'Type', dataIndex: 'type', key: 'type', fixed: 'left'},
        { title: 'Brand', dataIndex: 'brand', key: 'brand', fixed: 'left'},
        { title: 'Certificate Number', dataIndex: 'certificate_number', key: 'certificate_number', fixed: 'left'},
        { title: 'Created By', dataIndex: 'create_user', key: 'create_user', fixed: 'left'},
        { title: 'Updated By', dataIndex: 'upd_user', key: 'upd_user', fixed: 'left'},
        { title: '', key: 'action', fixed: 'right', 
          render: (_, record) =>
          (<div className='flex items-center gap-[5px] justify-center'>
            <a className='btn-action' onClick={() => deleteData(record.gold_id)}><Trash01 /></a>
            <Link href={`/master/gold/${record.gold_id}`} className="btn-action"><Edit05 /></Link>
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
            message: 'Data Gold',
            description: "Data Gold Berhasil Dihapus",
            placement:'bottomRight',
        });
    }

    
    const exportData = async () => {
        const param = {
            format: 'json',
            offset: 0,
            limit: 1000,
            type__icontains:"",
        }
        const resp = await axiosInstance.get(url, { params:param });
        const rows = resp.data.results;
        const dataToExport = rows.map((item: IGold, index:number) => ({
            'No' : index+1,
            'Gold Weight': item. gold_weight,
            'Type': item.type,
            'Brand': item.brand,
            'Certificate Number': item.certificate_number,
        }),);
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        const colA = 5;
        const colB = 10;
        const colC = rows.reduce((w:number, r:IGold) => Math.max(w, r.type ? r.type.length : 10), 10);
        const colD = rows.reduce((w:number, r:IGold) => Math.max(w, r.brand ? r.brand.length : 10), 10);

        worksheet["!cols"] = [ { wch: colA }, { wch: colB }, { wch: colC }, { wch: colD }, { wch: 20 }  ]; 

        XLSX.utils.book_append_sheet(workbook, worksheet, 'gold');
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `data_gold.xlsx`)
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
                        placeholder='search data'
                        onChange={debounce(
                            (event) => handleFilter(event.target.value),
                            1000
                        )}
                    />
                </div>
                <div className='flex items-center gap-[4px]'>
                    <button className='btn btn-primary' onClick={exportData}><FileDownload02 />Export Excel</button>
                    <Link href={`/master/gold/form`} className="btn btn-outline-neutral"><Plus />Add data</Link>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={dataTable}
                size='small'
                scroll={{ x: 'max-content', y: 570 }}
                pagination={false}
                className='table-basic'
                rowKey="gold_id"
               
            />
            <div className='flex justify-end'>
                <Pagination 
                    onChange={onChangePage} 
                    pageSize={params.limit}  
                    total={total} 
                    showSizeChanger={false}
                />
            </div>
            <ModalConfirm 
                isModalOpen={openModalConfirm} 
                setIsModalOpen={setOpenModalConfirm} 
                content='Hapus Data Ini?'
                onConfirm={confirmDelete}
            />
       </>
  )
}

export default GoldPageTable
