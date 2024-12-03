"use client"

import axiosInstance from '@/@core/utils/axios';
import Link from 'next/link';
import React, { useState } from 'react'
import { Message, useToaster } from 'rsuite';

const InformationCustomerServicePageForm = (props: {paramsId:string}) => {
    const { paramsId } = props
    const url = `/core/information/customer_service`
    const [informationName, setInformationName] = useState("");
    const [informationPhone, setInformationPhone] = useState("");
    const toaster = useToaster();
    const [messageString, setMessageString] = useState("");
    const message = (
        <Message showIcon type={'info'}>
          {messageString}
        </Message>
    );
    const onSave = async () => {
        const body = {
            "information_name": informationName,
            "information_phone": informationPhone,
        }
      
        if (paramsId == 'form') {
            await axiosInstance.post(`${url}/create`, body);
            await setMessageString("Data Information Has Ben Saved")
            await toaster.push(message, { placement:'bottomEnd', duration: 5000 })
            clearForm();
        } else {
            await axiosInstance.patch(`${url}/${paramsId}`, body);
            await setMessageString("Data Information Has Ben Update")
            await toaster.push(message, { placement:'bottomEnd', duration: 5000 })
        }
    }

    const fetchData = async () => {
        const resp = await axiosInstance.get(`${url}/${paramsId}`);
        const { data } = resp
        setInformationName(data.information_name)
        setInformationPhone(data.information_phone)
    }

    const clearForm = () => {
        setInformationName("");
        setInformationPhone("");
    }

    useState(() => {
        if (paramsId != 'form')
            fetchData();
    })

    return (
        <div className='form-input'>
            <div className='form-area'>
                <div className='input-area'>
                    <label>Information Name</label>
                    <input value={informationName} onChange={e => setInformationName(e.target.value)} className='base' />
                </div>
                <div className='input-area'>
                    <label>Information Phone</label>
                    <input value={informationPhone} onChange={e => setInformationPhone(e.target.value)} className='base' />
                </div>
            </div>
            <div className='form-button'>
                <Link href={`/ data/informations/customer-service`} className='btn btn-outline-secondary'>Cancel</Link>
                <button className='btn btn-primary' onClick={() => onSave()}>Save</button>
            </div>
        </div>
  )
}

export default InformationCustomerServicePageForm
