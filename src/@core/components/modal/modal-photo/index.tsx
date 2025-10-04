import { X } from '@untitled-ui/icons-react'
import { Modal } from 'antd'
import Image from 'next/image'
import React, { Dispatch, SetStateAction } from 'react'

const ModalPhoto = (props: {
            isModalOpen:boolean, 
            setIsModalOpen:Dispatch<SetStateAction<boolean>>, 
            url:string, 
    }) => {
    const { isModalOpen, setIsModalOpen, url } = props

    return (
        <Modal 
            open={isModalOpen} 
            onCancel={() => setIsModalOpen(false)}  
            footer={null} 
            width={500}
            closeIcon={<div className='flex flex-col justify-center items-center bg-white w-[30px] h-[30px] rounded-[4px] border border-gray-200'><X /></div>} 
        >
            <div className='flex flex-col justify-center items-center'>
                <Image 
                    src={url} 
                    width={0} 
                    height={0} 
                    sizes='100%' 
                    alt='foto' 
                    className='w-[500px] h-[500px] object-cover' 
                />
            </div>
        </Modal>
  )
}

export default ModalPhoto