import Link from 'next/link'
import React from 'react'

const PaymentTabPage = (props: {activeTab:string}) => {
  const { activeTab } = props
  return (
    <div className='tab-default'>
        <ul>
            <li className={`${activeTab === 'bank' ? 'active' : ''}`}><Link href={`/payment/bank`}>Data Bank</Link></li>
            <li className={`${activeTab === 'payment_method' ? 'active' : ''}`}><Link href={`/payment/payment-method`}>Payment Method</Link></li>
        </ul>
    </div>
  )
}

export default PaymentTabPage
