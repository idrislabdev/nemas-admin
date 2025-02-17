"use client"
import { IUser } from '@/@core/@types/interface';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react'
import { Pagination, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Eye, FileDownload02,  SearchSm  } from '@untitled-ui/icons-react';
import ModalLoading from '@/@core/components/modal/modal-loading';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id')

const DataPenggunaPageTable = () => {
    // const url = `/core/information/rating/`
    const [dataTable, setDataTable] = useState<Array<IUser>>([]);
    const [total, setTotal] = useState(0);
    // const [selectedId, setSelectedId] = useState(0);
    const [isModalLoading, setIsModalLoading] = useState(false)
    const [params, setParams] = useState({
        format: 'json',
        offset: 0,
        limit: 10,
        type__icontains:"",
    });
    // const [api, contextHolder] = notification.useNotification();
    const columns: ColumnsType<IUser>  = [
        { title: 'No', width: 70, dataIndex: 'customer_service_id', key: 'customer_service_id', fixed: 'left', align: 'center',
            render: (_, record, index) =>  ( index+params.offset+1 )
        },
        { title: 'Nama', dataIndex: 'name', key: 'name', width: 150},
        { title: 'Username', dataIndex: 'user_name', key: 'username', width: 150},
        { title: 'Email', dataIndex: 'email', key: 'email', width: 150},
        { title: 'Phone Number', dataIndex: 'phone_number', key: 'phone_number', width: 150},
        { title: '', key: 'action', fixed: 'right', width:100,
          render: (_, record) =>
          (<div className='flex items-center gap-[5px] justify-center'>
            <a className='btn-action' onClick={() => console.log(record.id)}><Eye /></a>
        </div>)
        },
    ];

    const fetchData = useCallback(async () => {
        // const resp = await axiosInstance.get(url, { params });
        // setDataTable(resp.data.results)
        // setTotal(resp.data.count)
        const temp: IUser[] = [
            {id: '1', user_name: 'username1', name: 'Name 1', email: 'name1@gmail.com', phone_number: '08122847181872', password: 'xxxx'},
            {id: '2', user_name: 'username2', name: 'Name 2', email: 'name2@gmail.com', phone_number: '08122847181872', password: 'xxxx'},
            {id: '3', user_name: 'username3', name: 'Name 3', email: 'name3@gmail.com', phone_number: '08122847181872', password: 'xxxx'},
            {id: '4', user_name: 'username4', name: 'Name 4', email: 'name4@gmail.com', phone_number: '08122847181872', password: 'xxxx'},
            {id: '5', user_name: 'username5', name: 'Name 5', email: 'name5@gmail.com', phone_number: '08122847181872', password: 'xxxx'},
            {id: '6', user_name: 'username6', name: 'Name 6', email: 'name6@gmail.com', phone_number: '08122847181872', password: 'xxxx'},
        ]
        setDataTable(temp)
        setTotal(6)
    },[])

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
     
    

    
    const exportData = async () => {
        setIsModalLoading(true)
        //block code
        setIsModalLoading(false)
    }
    

    useEffect(() => {
        fetchData()
    }, [fetchData])
    return (
        <>
        {/* {contextHolder} */}
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
        <ModalLoading 
            isModalOpen={isModalLoading} 
            textInfo='Harap tunggu, data sedang diunduh' 
        />
   </>
  )
}

export default DataPenggunaPageTable
