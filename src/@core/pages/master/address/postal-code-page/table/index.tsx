"use client"
import { IAddressPostalCode } from '@/@core/@types/interface';
import { SearchIcon } from '@/@core/my-icons'
import axiosInstance from '@/@core/utils/axios';
import debounce from 'debounce';
import React, { useCallback, useEffect, useState } from 'react'
import { Pagination } from 'rsuite';

const AddressPostalCodePageTable = () => {
    const url = `/core/address/postal_code/`
    const [dataTable, setDataTable] = useState<Array<IAddressPostalCode>>([]);
    const [total, setTotal] = useState(0);
    const [activePage, setActivePage] = React.useState(1);
    const [params, setParams] = useState({
        offset: 0,
        limit: 10,
        post_code__icontains:"",
     });

    const fetchData = useCallback(async () => {
        const resp = await axiosInstance.get(url, { params });
        setDataTable(resp.data.results)
        setTotal(resp.data.count)
    },[params, url])

    const onChangePage = async (val:number) => {
        setActivePage(val)
        setParams({...params, offset:(val-1)*params.limit})
    }

    const handleFilter = (value:string) => {
        setParams({
           ...params,
           offset: 0,
           limit: 10,
           post_code__icontains: value,
        });
     };
    
    useEffect(() => {
        fetchData()
    }, [fetchData])
    return (
       <>
            <div className='group-input prepend-append'>
                <span className='append'><SearchIcon /></span>
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
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Province Name</th>
                        <th>City Name</th>
                        <th>District Name</th>
                        <th>Subdistrict Name</th>
                        <th>Postal Code</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        dataTable.map((item:IAddressPostalCode, index:number) => (
                            <tr key={index}>
                                <td>{index+1}</td>
                                <td>{item.province_name}</td>
                                <td>{item.city_name}</td>
                                <td>{item.district_name}</td>
                                <td>{item.subdistrict_name}</td>
                                <td>{item.post_code}</td>
                                {/* <td className='text-center'>
                                    <div className='flex items-center gap-[5px] justify-center'>
                                        <a className='btn-action'><TrashOutlineIcon /></a>
                                        <a className='btn-action'><PencilOutlineIcon /></a>
                                    </div>
                                </td> */}
                            </tr>
                    ))

                    }
                </tbody>
            </table>
            <div className='flex justify-end'>
                <Pagination
                    prev={true}
                    next={true}
                    first={true}
                    last={true}
                    total={total} 
                    limit={params.limit} 
                    activePage={activePage} 
                    maxButtons={5}
                    onChangePage={e => onChangePage(e)} 
                />
            </div>
       </>
  )
}

export default AddressPostalCodePageTable
