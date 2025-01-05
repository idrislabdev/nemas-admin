/* eslint-disable @typescript-eslint/no-explicit-any */

import { Trash01, UploadCloud01, UploadCloud02 } from '@untitled-ui/icons-react';
import Image from 'next/image';
import React, {  useEffect, useRef, useState } from 'react'

const UploadForm = (props: {
        index:number, 
        withFile:boolean, 
        label:string, 
        isOptional:boolean, 
        initFile?:File|null,
        initUrl?:string,
        height?:number
        onChange: (value:File | null) => void
    }) => {

    const { index, withFile, label, isOptional, initFile, initUrl, onChange, height } = props
    const [photoUrl, setPhotoUrl] = useState("")
    const [photo, setPhoto] = useState<File | null>(null)

    const inputFile = useRef<(HTMLInputElement)[]>([]);
    const removePhoto = () => {
        console.log(photo)
        setPhoto(null)
        setPhotoUrl("");
        const value = inputFile.current[index]?.value;
        if (value) {
            inputFile.current[index].value = ''
        }
    }

    const onChangePhoto = () => {
        const files = inputFile.current[index]?.files;
        if (files) {
            setPhotoUrl(URL.createObjectURL(files[0]))
            setPhoto(files[0])
            onChange(files[0])
        }
    }

    useEffect(() => {
        if (initFile == null) {
            onChange(null)
        }
    }, [initFile, onChange])

    useEffect(() => {
        console.log(initUrl)
        if (initUrl && initUrl !== '') {
            setPhotoUrl(initUrl)
        }
    }, [initUrl])

    return (
        <div className='flex flex-col gap-[16px]'>
            {label != "" &&
                <label className='text-gray-700 text-sm font-medium'>{label} {isOptional ? <span className='text-xs text-gray-400'>opsional</span> : <span className='text-xs text-brand-600'>*</span> }</label>
            }
            <div className='border border-gray-200 rounded-[4px] p-[16px] bg-white flex flex-col justify-center' style={{ height: height}}>
                {photoUrl == '' &&
                    <label className='flex flex-col justify-center items-center gap-[12px] cursor-pointer' htmlFor={`file-upload-${index}`}>
                        <label className='border border-gray-200 rounded-[8px] w-[40px] h-[40px] flex flex-col justify-center items-center'>
                            <span className='text-gray-600'><UploadCloud02 /></span>
                        </label>
                        <div className='flex flex-col justify-center items-center gap-[4px]'>
                            <h6 className='text-sm font-normal text-gray-600'><span className='text-brand-600 font-semibold'>Klik untuk mengunggah</span> atau tarik dan lepas</h6>
                            <p className='text-xs text-gray-600'>{withFile ? 'PDF, ' : ''} PNG atau JPG (max. 500 KB)</p>
                        </div>
                    </label>
                }
                {photoUrl != '' &&
                    <div className='flex items-center gap-[12px]'>
                        <Image 
                            src={photoUrl} 
                            width={0} 
                            height={0} 
                            alt='image' 
                            className='w-[96px] h-[96px] rounded-[12px] border border-gray-100 object-cover'
                        />
                        
                        <div className='flex flex-col gap-[12px]'>
                            <div className='flex flex-col gap-[4px]'>
                                <label className='text-sm text-brand-600'>file.jpg</label>
                                <span className='text-xs text-gray-600'>178 Kb</span>
                            </div>
                            <div className='flex items-center gap-[6px]'>
                                <label className='w-[28px] h-[28px] border border-gray-300 flex flex-col justify-center items-center rounded-[6px] text-gray-400 cursor-pointer' htmlFor={`file-upload-${index}`}>
                                    <span className='my-icon icon-xs'><UploadCloud01 /></span>
                                </label>
                                <button className='w-[28px] h-[28px] border border-gray-300 flex flex-col justify-center items-center rounded-[6px] text-gray-400' onClick={removePhoto}>
                                    <span className='my-icon icon-xs'><Trash01 /></span>
                                </button>
                            </div>
                        </div>
                    </div>
                }
                <input id={`file-upload-${index}`} ref={(el:any) => (inputFile.current[index] = el)} accept={`.jpg, .jpeg,.png${withFile ? ',.pdf' : ''}`} type="file" name="file" className='hidden' onChange={onChangePhoto}/>
            </div>
        </div>
    )
}

export default UploadForm