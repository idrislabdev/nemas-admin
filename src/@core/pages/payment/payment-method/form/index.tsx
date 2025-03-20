"use client"

import { IPaymentMethod } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import Link from 'next/link';
import React, { useState } from 'react'
import { notification } from 'antd';
import ModalLoading from '@/@core/components/modal/modal-loading';

const PaymentMethodPageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/payment/method`
    const [paymentMethodName, setPaymentMethodName] = useState("");
    const [paymentMethodDescription, setPaymentMethodDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    
    const [required, setRequired] = useState<IPaymentMethod>({} as IPaymentMethod);
    const [api, contextHolder] = notification.useNotification();
    const [isModalLoading, setIsModalLoading] = useState(false)

    const onSave = async () => {
        const body = {
            "payment_method_name": paymentMethodName,
            "payment_method_description": paymentMethodDescription,
            "is_active": isActive
        }
        setRequired({})
        setIsModalLoading(true)
        try {
            let desc = "";
            if (paramsId == 'form') {
                desc = 'Data method Telah Disimpan'
                await axiosInstance.post(`${url}/create`, body);
                clearForm();
            } else {
                desc = 'Data method Telah Diupdate'
                await axiosInstance.patch(`${url}/${paramsId}/`, body);
            }
            setIsModalLoading(false)
            api.info({
                message: 'Data method',
                description: desc,
                placement:'bottomRight',
            });
        } catch (error) {
            setIsModalLoading(false)
            const err = error as AxiosError
            if (err.response && err.response.data) {
                const data: IPaymentMethod = err.response.data;
                setRequired(data)
            }
        }
        
    }
    
    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}/`);
        const { data } = resp
        setPaymentMethodName(data.payment_method_name)
        setPaymentMethodDescription(data.payment_method_description)
        setIsActive(data.is_active)
    }

    const clearForm = () => {
        setPaymentMethodName("")
        setPaymentMethodDescription("")
        setIsActive(true)
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
                    <div className='input-area'>
                        <label>
                            Nama Method {required.payment_method_name && <span className='text-red-500 text-[10px]/[14px] italic'>({required.payment_method_name?.toString()})</span>}
                        </label>
                        <input 
                            value={paymentMethodName} 
                            onChange={e => setPaymentMethodName(e.target.value)} 
                            className={`base ${required.payment_method_name ? 'error' : ''}`}  
                        />
                    </div>
                    <div className='input-area'>
                        <label>
                            Descripsi {required.payment_method_description && <span className='text-red-500 text-[10px]/[14px] italic'>({required.payment_method_description?.toString()})</span>}
                        </label>
                        <textarea value={paymentMethodDescription} onChange={e => setPaymentMethodDescription(e.target.value)} className='base' />
                    </div>
                    <div className='input-area'>
                        <label>Status Bank {required.is_active && <span className='text-red-500 text-[10px]/[14px] italic'>({required.is_active?.toString()})</span>}</label>
                        <select 
                            defaultValue={isActive ? 'active' : 'not_active'} 
                            onChange={e => setIsActive(e.target.value == 'active' ? true : false)}
                        >
                            <option value={`active`}>Aktif</option>
                            <option value={`not_active`}>Tidak Aktif</option>
                        </select>
                    </div>
                </div>
                <div className='form-button'>
                    <Link href={`/payment/payment-method`} className='btn btn-outline-secondary'>Cancel</Link>
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

export default PaymentMethodPageForm
