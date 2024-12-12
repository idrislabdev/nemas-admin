import Link from 'next/link'
import React from 'react'

const AddressTabPage = (props: {activeTab:string}) => {
  const { activeTab } = props
  return (
    <div className='tab-default'>
        <ul>
            <li className={`${activeTab === 'province' ? 'active' : ''}`}><Link href={`/master/address/province`}>Provinsi</Link></li>
            <li className={`${activeTab === 'city' ? 'active' : ''}`}><Link href={`/master/address/city`}>Kota</Link></li>
            <li className={`${activeTab === 'district' ? 'active' : ''}`}><Link href={`/master/address/district`}>Kecamatan</Link></li>
            <li className={`${activeTab === 'sub_district' ? 'active' : ''}`}><Link href={`/master/address/sub-district`}>Kelurahan</Link></li>
            <li className={`${activeTab === 'postal_code' ? 'active' : ''}`}><Link href={`/master/address/postal-code`}>Kode Pos</Link></li>
        </ul>
    </div>
  )
}

export default AddressTabPage
