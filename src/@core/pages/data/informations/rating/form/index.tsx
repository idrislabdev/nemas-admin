"use client"

import axiosInstance from '@/@core/utils/axios';
import Link from 'next/link';
import React, { useState } from 'react'
import { Message, useToaster } from 'rsuite';

const InformationRatingPageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/information/rating`
    const [informationRateName, setInformationRateName] = useState("");
    const [rate, setRate] = useState("");
    const [message, setMessage] = useState("");
    const [publish, setPublish] = useState(true);
    const toaster = useToaster();
    const [messageString, setMessageString] = useState("");
    const messageToast = (
        <Message showIcon type={'info'}>
          {messageString}
        </Message>
    );
    const onSave = async () => {
        const body = {
            "information_rate_name": informationRateName,
            "rate": parseFloat(rate.toString().replace('.', '').replace(',', '.')),
            "message": message,
            "publish": publish
        }
      
        if (paramsId == 'form') {
            await axiosInstance.post(`${url}/create/`, body);
            await setMessageString("Data Rating Has Ben Saved")
            await toaster.push(messageToast, { placement:'bottomEnd', duration: 5000 })
            clearForm();
        } else {
            await axiosInstance.patch(`${url}/${paramsId}`, body);
            await setMessageString("Data Rating Has Ben Update")
            await toaster.push(messageToast, { placement:'bottomEnd', duration: 5000 })
        }
    }

    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}`);
        const { data } = resp
        setInformationRateName(data.information_rate_name)
        setRate(data.rate.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
        setMessage(data.message)
    }

    const clearForm = () => {
        setInformationRateName("");
        setRate("");
        setMessage("");
    }

    useState(() => {
        if (paramsId != 'form')
            fetchData();
    })
    return (
        <div className='form-input'>
            <div className='form-area'>
                <div className='input-area'>
                    <label>Information Rate Name</label>
                    <input value={informationRateName} onChange={e => setInformationRateName(e.target.value)} className='base' />
                </div>
                <div className='input-area'>
                    <label>Rate</label>
                    <input value={rate} 
                        onChange={e => setRate(e.target.value
                        .replace(/(?<=\,,*)\,/g, '')
                        .replace(/(?<=\,\d\d).*/g, '')
                        .replace(/\B(?=(\d{3})+(?!\d))/g, '.'))} 
                        className='base' 
                    />
                </div>
                <div className='input-area'>
                    <label>Message</label>
                    <input value={message} onChange={e => setMessage(e.target.value)} className='base' />
                </div>
                <div className='input-area'>
                    <label>Publish</label>
                    <select defaultValue={publish ? 'publish' : 'not_publish'} onChange={e => setPublish(e.target.value == 'publish' ? true : false)}>
                        <option value={'publish'}>Publish</option>
                        <option value={'not_publish'}>Not Publish</option>
                    </select>
                </div>
            </div>
            <div className='form-button'>
                <Link href={`/ data/informations/rating`} className='btn btn-outline-secondary'>Cancel</Link>
                <button className='btn btn-primary' onClick={() => onSave()}>Simpan</button>
            </div>
        </div>
    )
}

export default InformationRatingPageForm
