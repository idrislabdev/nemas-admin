import { LoadingOutlined } from '@ant-design/icons'
import { Modal, Spin } from 'antd'
import React from 'react'

const ModalLoading = (props: {
        isModalOpen:boolean, 
        textInfo:string, 
    }) => {
    const { isModalOpen, textInfo } = props

    return (
        <Modal  
            keyboard={false} 
            maskClosable={false}  
            className='modal-confirm' 
            open={isModalOpen} 
            footer={null} width={380}
            closeIcon={false}
            centered
        >
            <div className='content-icon'>
                <Spin indicator={<LoadingOutlined spin />} size="large" />
            </div>
            <div className='content-text'>
                <p>{textInfo}</p>
            </div>
        </Modal>
    )
}

export default ModalLoading
