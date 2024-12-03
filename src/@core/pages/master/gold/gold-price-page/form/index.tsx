"use client";

import { IGoldPrice } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios'
import { AxiosError } from 'axios';
import React, { useState } from 'react'
import { Message, useToaster } from 'rsuite';

const GoldPricePageForm = () => {
    const [required, setRequired] = useState<IGoldPrice>({} as IGoldPrice);
    const [goldPriceSource, setGoldPriceSource] = useState("");
    const [goldPriceWeight, setGoldPriceWeight] = useState("");
    const [goldPriceBase, setGoldPriceBase] = useState("");
    const [goldPriceSell, setGoldPriceSell] = useState("");
    const [goldPriceBuy, setGoldPriceBuy] = useState("");
    const toaster = useToaster();
    const message = (
        <Message showIcon type={'info'}>
          Data Gold Price Has Benn Saved
        </Message>
    );
    const onSave = async () => {
        const body = {
            "gold_price_source": goldPriceSource,
            "gold_price_weight": parseInt(goldPriceWeight.toString().replace(/\./g, '')),
            "gold_price_base": parseInt(goldPriceBase.toString().replace(/\./g, '')),
            "gold_price_sell": parseInt(goldPriceSell.toString().replace(/\./g, '')),
            "gold_price_buy": parseInt(goldPriceBuy.toString().replace(/\./g, ''))
        }
        setRequired({})
        try {
            await axiosInstance.post("/core/gold/price/create", body);
            await toaster.push(message, { placement:'bottomEnd', duration: 5000 })
            clearForm();
        } catch (error) {
            const err = error as AxiosError
            if (err.response && err.response.data) {
                const data: IGoldPrice = err.response.data;
                setRequired(data)
            }
        }
    }

    const clearForm = () => {
        setGoldPriceSource("");
        setGoldPriceWeight("");
        setGoldPriceBase("");
        setGoldPriceSell("");
        setGoldPriceBuy("");
    }

    return (
        <div className='form-input'>
            <div className='form-area'>
                <div className='input-area'>
                    <label>Gold Price Source {required.gold_price_source && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_source?.toString()})</span>}</label>
                    <input 
                        value={goldPriceSource} 
                        onChange={e => setGoldPriceSource(e.target.value)} 
                        className={`base ${required.gold_price_source ? 'error' : ''}`} 
                    />
                </div>
                <div className='input-area'>
                    <label>Gold Price Weight {required.gold_price_weight && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_weight?.toString()})</span>}</label>
                    <input 
                        value={goldPriceWeight} 
                        onChange={e => setGoldPriceWeight(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))}  
                        className={`base ${required.gold_price_weight ? 'error' : ''}`} 
                    />
                </div>
                <div className='input-area'>
                    <label>Gold Price Base {required.gold_price_base && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_base?.toString()})</span>}</label>
                    <input 
                        value={goldPriceBase} 
                        onChange={e => setGoldPriceBase(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))}  
                        className={`base ${required.gold_price_base ? 'error' : ''}`}  
                    />
                </div>
                <div className='input-area'>
                    <label>Gold Price Sell {required.gold_price_sell && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_sell?.toString()})</span>}</label>
                    <input 
                        value={goldPriceSell} 
                        onChange={e => setGoldPriceSell(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))}  
                        className={`base ${required.gold_price_sell ? 'error' : ''}`} 
                    />
                </div>
                <div className='input-area'>
                    <label>Gold Price Buy {required.gold_price_buy && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_buy?.toString()})</span>}</label>
                    <input 
                        value={goldPriceBuy} 
                        onChange={e => setGoldPriceBuy(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))}  
                        className={`base ${required.gold_price_buy ? 'error' : ''}`} 
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

export default GoldPricePageForm
