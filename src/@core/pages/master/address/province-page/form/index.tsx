import React from 'react'

const AddressProvincePageForm = () => {
  return (
    <div className='form-input'>
        <div className='form-area'>
            <div className='input-area'>
                <label>Province Name</label>
                <input className='base' />
            </div>
        </div>
        <div className='form-button'>
            <button className='btn btn-outline-secondary'>Cancel</button>
            <button className='btn'>Save</button>
        </div>
    </div>
  )
}

export default AddressProvincePageForm
