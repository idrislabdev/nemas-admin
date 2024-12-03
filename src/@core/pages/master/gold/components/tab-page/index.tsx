import Link from 'next/link'
import React from 'react'

const GoldTabPage = (props: {activeTab:string}) => {
  const { activeTab } = props
  return (
    <div className='tab-default'>
        <ul>
            <li className={`${activeTab === 'gold' ? 'active' : ''}`}><Link href={`/master/gold`}>Gold</Link></li>
            <li className={`${activeTab === 'price' ? 'active' : ''}`}><Link href={`/master/gold/price`}>Price</Link></li>
            <li className={`${activeTab === 'cert_price' ? 'active' : ''}`}><Link href={`/master/gold/cert-price`}>Cert Price</Link></li>
            <li className={`${activeTab === 'price_config' ? 'active' : ''}`}><Link href={`/master/gold/price-config`}>Price Config</Link></li>
        </ul>
    </div>
  )
}

export default GoldTabPage
