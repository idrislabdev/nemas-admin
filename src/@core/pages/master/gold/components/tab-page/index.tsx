import Link from 'next/link'
import React from 'react'

const GoldTabPage = (props: {activeTab:string}) => {
  const { activeTab } = props
  return (
    <div className='tab-default'>
        <ul>
            <li className={`${activeTab === 'gold' ? 'active' : ''}`}><Link href={`/master/gold`}>Data Emas</Link></li>
            <li className={`${activeTab === 'price' ? 'active' : ''}`}><Link href={`/master/gold/price`}>Harga Emas</Link></li>
            <li className={`${activeTab === 'cert_price' ? 'active' : ''}`}><Link href={`/master/gold/cert-price`}>Sertifikat Emas</Link></li>
            <li className={`${activeTab === 'price_config' ? 'active' : ''}`}><Link href={`/master/gold/price-config`}>Pengaturan Harga</Link></li>
        </ul>
    </div>
  )
}

export default GoldTabPage
