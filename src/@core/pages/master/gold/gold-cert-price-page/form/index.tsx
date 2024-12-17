"use client"
import { IGoldCertPrice } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import React, { useState } from 'react'
import { notification } from 'antd';

const GoldCertPricePageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/gold/cert_price`
    const [required, setRequired] = useState<IGoldCertPrice>({} as IGoldCertPrice);
    const [certCode, setCertCode] = useState("");
    const [goldWeight, setGoldWeight] = useState("");
    const [certPrice, setCertPrice] = useState("");
    const [api, contextHolder] = notification.useNotification();

    const onSave = async () => {
        const body = {
            "cert_code": certCode,
            "gold_weight": parseInt(goldWeight.toString().replace('.', '').replace(',', '.')),
            "cert_price": parseFloat(certPrice.toString().replace('.', '').replace(',', '.')),
        }
        setRequired({})
        try {
            let desc = '';
            if (paramsId == 'form') {
                await axiosInstance.post(`${url}/create`, body);
                desc = 'Data Gold Cert Price Telah Disimpan'
                clearForm();
            } else {
                await axiosInstance.patch(`${url}/${paramsId}/`, body);
                desc = 'Data Gold Cert Price Telah Diupdate'
            }
            clearForm();
            api.info({
                message: 'Data Gold Cert Price',
                description: desc,
                placement:'bottomRight',
            });
        } catch (error) {
            const err = error as AxiosError
            if (err.response && err.response.data) {
                const data: IGoldCertPrice = err.response.data;
                setRequired(data)
            }
        }
    }

    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}/`);
        const { data } = resp
        setCertCode(data.cert_code);
        setGoldWeight(data.gold_weight.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
        setCertPrice(data.cert_price.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
    }
    
    useState(() => {
        if (paramsId != 'form')
            fetchData();
    })

    const clearForm = () => {
        setCertCode("");
        setGoldWeight("");
        setCertPrice("");
    }
  return (
    <div className='form-input'>
        {contextHolder}
        <div className='form-area'>
            <div className='input-area'>
                <label>Kode Sertifikat {required.cert_code && <span className='text-red-500 text-[10px]/[14px] italic'>({required.cert_code?.toString()})</span>}</label>
                <input 
                    value={certCode} 
                    onChange={e => setCertCode(e.target.value)} 
                    className={`base ${required.cert_code ? 'error' : ''}`} 
                />
            </div>
            <div className='input-area'>
                <label>Satuan (gr) {required.gold_weight && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_weight?.toString()})</span>}</label>
                <div className='group-input prepend'>
                    <span className='prepend !top-[5px]'>gr</span>
                    <input 
                        value={goldWeight} 
                        onChange={e => setGoldWeight(e.target.value
                            .replace(/(?<=\,,*)\,/g, '')
                            .replace(/(?<=\,\d\d).*/g, '')
                            .replace(/\B(?=(\d{3})+(?!\d))/g, '.'))} 
                        className={`base ${required.gold_weight ? 'error' : ''}`} 
                    />
                </div>
            </div>
            <div className='input-area'>
                <label>Harga Sertifikat {required.cert_price && <span className='text-red-500 text-[10px]/[14px] italic'>({required.cert_price?.toString()})</span>}</label>
                <input 
                    value={certPrice} 
                    onChange={e => setCertPrice(e.target.value.replace(/(?!\,)\D/g, '')
                        .replace(/(?<=\,,*)\,/g, '')
                        .replace(/(?<=\,\d\d).*/g, '')
                        .replace(/\B(?=(\d{3})+(?!\d))/g, '.'))} 
                    className={`base ${required.cert_price ? 'error' : ''}`}  
                />
            </div>
        </div>
        <div className='form-button'>
            <button className='btn btn-outline-secondary'>Cancel</button>
            <button className='btn btn-primary' onClick={() => onSave()}>Simpan</button>
        </div>
    </div>
  )
}

export default GoldCertPricePageForm
