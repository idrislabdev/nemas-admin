"use client"
import { IGoldCertPrice } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios';
import { AxiosError } from 'axios';
import React, { useState } from 'react'
import { Message, useToaster } from 'rsuite';

const GoldCertPricePageForm = () => {
    const [required, setRequired] = useState<IGoldCertPrice>({} as IGoldCertPrice);
    const [certCode, setCertCode] = useState("");
    const [goldWeight, setGoldWeight] = useState("");
    const [certPrice, setCertPrice] = useState("");
    const toaster = useToaster();
    const message = (
        <Message showIcon type={'info'}>
          Data Gold Cert Price Has Benn Saved
        </Message>
    );
    const onSave = async () => {
        const body = {
            "cert_code": certCode,
            "gold_weight": parseInt(goldWeight.toString().replace(/\./g, '')),
            "cert_price": parseInt(certPrice.toString().replace(/\./g, '')),
        }
        setRequired({})
        try {
            await axiosInstance.post("/core/gold/cert_price/create", body);
            await toaster.push(message, { placement:'bottomEnd', duration: 5000 })
            clearForm();
        } catch (error) {
            const err = error as AxiosError
            if (err.response && err.response.data) {
                const data: IGoldCertPrice = err.response.data;
                setRequired(data)
            }
        }

    }
    const clearForm = () => {
        setCertCode("");
        setGoldWeight("");
        setCertPrice("");
    }
  return (
    <div className='form-input'>
        <div className='form-area'>
            <div className='input-area'>
                <label>Cert Code {required.cert_code && <span className='text-red-500 text-[10px]/[14px] italic'>({required.cert_code?.toString()})</span>}</label>
                <input 
                    value={certCode} 
                    onChange={e => setCertCode(e.target.value)} 
                    className={`base ${required.cert_code ? 'error' : ''}`} 
                />
            </div>
            <div className='input-area'>
                <label>Gold Weight {required.gold_weight && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_weight?.toString()})</span>}</label>
                <input 
                    value={goldWeight} 
                    onChange={e => setGoldWeight(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} 
                    className={`base ${required.gold_weight ? 'error' : ''}`}  
                />
            </div>
            <div className='input-area'>
                <label>Cert Price {required.cert_price && <span className='text-red-500 text-[10px]/[14px] italic'>({required.cert_price?.toString()})</span>}</label>
                <input 
                    value={certPrice} 
                    onChange={e => setCertPrice(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} 
                    className={`base ${required.cert_price ? 'error' : ''}`}  
                />
            </div>
        </div>
        <div className='form-button'>
            <button className='btn btn-outline-secondary'>Cancel</button>
            <button className='btn btn-primary' onClick={() => onSave()}>Save</button>
        </div>
    </div>
  )
}

export default GoldCertPricePageForm
