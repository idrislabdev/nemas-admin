import React from 'react'

const AddressSubDistrictPageForm = () => {
  return (
    <div className='form-input'>
        <div className='form-area'>
            <div className='input-area'>
                <label>Kelurahan Name</label>
                <input className='base' />
            </div>
        </div>
        <div className='form-button'>
            <button className='btn btn-outline-secondary'>Cancel</button>
            <button className='btn'>Simpan</button>
        </div>
    </div>
  )
}

export default AddressSubDistrictPageForm
