"use client"
import { IGold } from '@/@core/@types/interface';
import ModalConfirm from '@/@core/components/modal/modal-confirm';
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react'
import { Pagination, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Edit05, SearchSm, Trash01 } from '@untitled-ui/icons-react';
import Link from 'next/link';
import { notification } from 'antd';

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
    
    useEffect(() => {
        fetchData()
    }, [fetchData])

    return (
       <>
            {contextHolder}
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
