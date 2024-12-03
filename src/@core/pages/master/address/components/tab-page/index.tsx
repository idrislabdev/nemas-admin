import Link from 'next/link'
import React from 'react'

const AddressTabPage = (props: {activeTab:string}) => {
  const { activeTab } = props
  return (
    <div className='tab-default'>
        <ul>
            <li className={`${activeTab === 'province' ? 'active' : ''}`}><Link href={`/master/address/province`}>Province</Link></li>
            <li className={`${activeTab === 'city' ? 'active' : ''}`}><Link href={`/master/address/city`}>City</Link></li>
            <li className={`${activeTab === 'district' ? 'active' : ''}`}><Link href={`/master/address/district`}>District</Link></li>
            <li className={`${activeTab === 'sub_district' ? 'active' : ''}`}><Link href={`/master/address/sub-district`}>Sub District</Link></li>
            <li className={`${activeTab === 'postal_code' ? 'active' : ''}`}><Link href={`/master/address/postal-code`}>Postal Code</Link></li>
        </ul>
    </div>
  )
}

export default AddressTabPage
