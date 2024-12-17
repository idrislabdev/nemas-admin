"use client";

import { IGoldPrice } from '@/@core/@types/interface';
import axiosInstance from '@/@core/utils/axios'
import { AxiosError } from 'axios';
import React, { useState } from 'react'
import { notification } from 'antd';

const GoldPricePageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/gold/price`
    const [required, setRequired] = useState<IGoldPrice>({} as IGoldPrice);
    const [goldPriceSource, setGoldPriceSource] = useState("");
    const [goldPriceWeight, setGoldPriceWeight] = useState("");
    const [goldPriceBase, setGoldPriceBase] = useState("");
    const [goldPriceSell, setGoldPriceSell] = useState("");
    const [goldPriceBuy, setGoldPriceBuy] = useState("");
    const [api, contextHolder] = notification.useNotification();

    const onSave = async () => {
        const body = {
            "gold_price_source": goldPriceSource,
            "gold_price_weight": parseFloat(goldPriceWeight.toString().replace('.', '').replace(',', '.')),
            "gold_price_base": parseFloat(goldPriceBase.toString().replace('.', '').replace(',', '.')),
            "gold_price_sell": parseFloat(goldPriceSell.toString().replace('.', '').replace(',', '.')),
            "gold_price_buy": parseFloat(goldPriceBuy.toString().replace('.', '').replace(',', '.'))
        }
        setRequired({})
        try {
            let desc = '';
            if (paramsId == 'form') {
                await axiosInstance.post(`${url}/create`, body);
                desc = 'Data Gold Price Telah Disimpan'
                clearForm();
            } else {
                await axiosInstance.patch(`${url}/${paramsId}/`, body);
                desc = 'Data Gold Price Telah Diupdate'
            }
            api.info({
                message: 'Data Gold Price',
                description: desc,
                placement:'bottomRight',
            });

        } catch (error) {
            const err = error as AxiosError
            if (err.response && err.response.data) {
                const data: IGoldPrice = err.response.data;
                setRequired(data)
            }
        }
    }

    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}/`);
        const { data } = resp
        setGoldPriceSource(data.gold_price_source);
        setGoldPriceWeight(data.gold_price_weight.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
        setGoldPriceBase(data.gold_price_base.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
        setGoldPriceSell(data.gold_price_sell.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
        setGoldPriceBuy(data.gold_price_buy.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
    }

    const clearForm = () => {
        setGoldPriceSource("");
        setGoldPriceWeight("");
        setGoldPriceBase("");
        setGoldPriceSell("");
        setGoldPriceBuy("");
    }

    useState(() => {
        if (paramsId != 'form')
            fetchData();
    })

    return (
        <div className='form-input'>
            {contextHolder}
            <div className='form-area'>
                <div className='input-area'>
                    <label>Asal Harga Emas {required.gold_price_source && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_source?.toString()})</span>}</label>
                    <input 
                        value={goldPriceSource} 
                        onChange={e => setGoldPriceSource(e.target.value)} 
                        className={`base ${required.gold_price_source ? 'error' : ''}`} 
                    />
                </div>
                <div className='input-area'>
                    <label>Satuan (gr) {required.gold_price_weight && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_weight?.toString()})</span>}</label>
                    <div className='group-input prepend'>
                        <span className='prepend !top-[5px]'>gr</span>
                        <input 
                            value={goldPriceWeight} 
                            onChange={e => setGoldPriceWeight(e.target.value
                                .replace(/(?!\,)\D/g, '')
                                .replace(/(?<=\,,*)\,/g, '')
                                .replace(/(?<=\,\d\d).*/g, '')
                                .replace(/\B(?=(\d{3})+(?!\d))/g, '.'))} 
                            className={`base ${required.gold_price_weight ? 'error' : ''}`} 
                        />
                    </div>
                </div>
                <div className='input-area'>
                    <label>Harga Dasar {required.gold_price_base && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_base?.toString()})</span>}</label>
                    <input 
                        value={goldPriceBase} 
                        onChange={e => setGoldPriceBase(e.target.value
                            .replace(/(?!\,)\D/g, '')
                            .replace(/(?<=\,,*)\,/g, '')
                            .replace(/(?<=\,\d\d).*/g, '')
                            .replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}  
                        className={`base ${required.gold_price_base ? 'error' : ''}`}  
                    />
                </div>
                <div className='input-area'>
                    <label>Harga Jual {required.gold_price_sell && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_sell?.toString()})</span>}</label>
                    <input 
                        value={goldPriceSell} 
                        onChange={e => setGoldPriceSell(e.target.value
                            .replace(/(?!\,)\D/g, '')
                            .replace(/(?<=\,,*)\,/g, '')
                            .replace(/(?<=\,\d\d).*/g, '')
                            .replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}  
                        className={`base ${required.gold_price_sell ? 'error' : ''}`} 
                    />
                </div>
                <div className='input-area'>
                    <label>Harga Beli {required.gold_price_buy && <span className='text-red-500 text-[10px]/[14px] italic'>({required.gold_price_buy?.toString()})</span>}</label>
                    <input 
                        value={goldPriceBuy} 
                        onChange={e => setGoldPriceBuy(e.target.value
                            .replace(/(?!\,)\D/g, '')
                            .replace(/(?<=\,,*)\,/g, '')
                            .replace(/(?<=\,\d\d).*/g, '')
                            .replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}  
                        className={`base ${required.gold_price_buy ? 'error' : ''}`} 
                    />
                </div>
            </div>
            <div className='form-button'>
                <button className='btn btn-primary' onClick={() => onSave()}>Simpan</button>
            </div>
        </div>
    )
}

export default GoldPricePageForm
