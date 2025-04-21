import Link from 'next/link'
import React from 'react'

const DeliveryTabPage = (props: {activeTab:string}) => {
  const { activeTab } = props
  return (
    <div className='tab-default'>
        <ul>
            <li className={`${activeTab === 'partner' ? 'active' : ''}`}><Link href={`/delivery/partner`}>Data Partner</Link></li>
            {/* <li className={`${activeTab === 'payment_method' ? 'active' : ''}`}><Link href={`/payment/payment-method`}>Data Method</Link></li> */}
        </ul>
    </div>
  )
}

export default DeliveryTabPage
