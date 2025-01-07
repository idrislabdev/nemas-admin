"use client"

import { IBank } from '@/@core/@types/interface';
// import UploadForm from '@/@core/components/forms/upload-form';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import Link from 'next/link';
import React, { useState } from 'react'
import { notification } from 'antd';
import ModalLoading from '@/@core/components/modal/modal-loading';

const PaymentBankPageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/payment/bank`
    const [bankName, setBankName] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [bankMerchantCode, setBankMerchantCode] = useState("");
    const [bankActive, setBankActive] = useState(true);
    // const [bankBackground, setBankBackground] = useState("");
    
    const [fileData, setFileData] = useState<File | null>(null)
    const [required, setRequired] = useState<IBank>({} as IBank);
    const [api, contextHolder] = notification.useNotification();
    const [isModalLoading, setIsModalLoading] = useState(false)

    const onSave = async () => {
        const body = {
            "bank_name": bankName,
            "bank_code": bankCode,
            "bank_logo_url": "-",
            "bank_merchant_code": bankMerchantCode,
            "bank_active": bankActive
            // "information_background": informationBackground,
        }
        setRequired({})
        setIsModalLoading(true)
        try {
            let desc = "";
            if (paramsId == 'form') {
                const resp = await axiosInstance.post(`${url}/create`, body);
                const { data } = resp
                if (fileData != null)
                    await uploadFile(data.bank_id)
                
                desc = 'Data bank Telah Disimpan'
                clearForm();
            } else {
                desc = 'Data bank Telah Diupdate'
                await axiosInstance.patch(`${url}/${paramsId}/`, body);
                if (fileData != null)
                    await uploadFile(paramsId)
            }
            setIsModalLoading(false)
            api.info({
                message: 'Data bank',
                description: desc,
                placement:'bottomRight',
            });
        } catch (error) {
            setIsModalLoading(false)
            const err = error as AxiosError
            if (err.response && err.response.data) {
                const data: IBank = err.response.data;
                setRequired(data)
            }
        }
        
    }

    const uploadFile = async(id:string) => {
        if (fileData != null) {
            const body = new FormData();
            body.append('file', fileData)
            await axiosInstance.post(`${url}/upload/${id}/`, body);
        }
    }
    
    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}/`);
        const { data } = resp
        setBankName(data.bank_name)
        setBankCode(data.bank_code)
        setBankMerchantCode(data.bank_merchant_code)
        setBankActive(data.bank_active)
    }

    const clearForm = () => {
        setBankName("")
        setBankCode("")
        setBankMerchantCode("")
        setBankActive(true)
        setFileData(null);
    }

    useState(() => {
        if (paramsId != 'form')
            fetchData();
    })
    return (
        <>
            {contextHolder}
            <div className='form-input'>
                <div className='form-area'>
                    {/* <div className='input-area'>
                        <label>Gambar / Background</label>
                        <UploadForm 
                            index={1}
                            withFile={false} 
                            label='' 
                            isOptional={true}  
                            initFile={fileData}
                            initUrl={informationBackground}
                            onChange={val => setFileData(val)} 
                        />
                    </div> */}
                    <div className='input-area'>
                        <label>
                            Nama Bank {required.bank_name && <span className='text-red-500 text-[10px]/[14px] italic'>({required.bank_name?.toString()})</span>}
                        </label>
                        <input 
                            value={bankName} 
                            onChange={e => setBankName(e.target.value)} 
                            className={`base ${required.bank_name ? 'error' : ''}`}  
                        />
                    </div>
                    <div className='input-area'>
                        <label>
                            Kode Bank {required.bank_code && <span className='text-red-500 text-[10px]/[14px] italic'>({required.bank_code?.toString()})</span>}
                        </label>
                        <input 
                            value={bankCode} 
                            onChange={e => setBankCode(e.target.value)} 
                            className={`base ${required.bank_code ? 'error' : ''}`}  
                        />
                    </div>
                    <div className='input-area'>
                        <label>
                            Kode Merchant {required.bank_merchant_code && <span className='text-red-500 text-[10px]/[14px] italic'>({required.bank_merchant_code?.toString()})</span>}
                        </label>
                        <input 
                            value={bankMerchantCode} 
                            onChange={e => setBankMerchantCode(e.target.value)} 
                            className={`base ${required.bank_merchant_code ? 'error' : ''}`}  
                        />
                    </div>
                    <div className='input-area'>
                        <label>Status Bank {required.bank_active && <span className='text-red-500 text-[10px]/[14px] italic'>({required.bank_active?.toString()})</span>}</label>
                        <select 
                            defaultValue={bankActive ? 'active' : 'not_active'} 
                            onChange={e => setBankActive(e.target.value == 'active' ? true : false)}
                        >
                            <option value={`active`}>Aktif</option>
                            <option value={`not_active`}>Tidak Aktif</option>
                        </select>
                    </div>
                </div>
                <div className='form-button'>
                    <Link href={`/payment/bank`} className='btn btn-outline-secondary'>Cancel</Link>
                    <button className='btn btn-primary' onClick={() => onSave()}>Simpan</button>
                </div>
            </div>
            <ModalLoading 
                isModalOpen={isModalLoading} 
                textInfo='Harap tunggu, data sedang diproses' 
            />
        </>
    )
}

export default PaymentBankPageForm
