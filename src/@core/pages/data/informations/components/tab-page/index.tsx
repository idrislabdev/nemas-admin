import Link from 'next/link'
import React from 'react'

const InformationsTabPage = (props: {activeTab:string}) => {
  const { activeTab } = props
  return (
    <div className='tab-default'>
        <ul>
            <li className={`${activeTab === 'customer_service' ? 'active' : ''}`}><Link href={`/data/informations/customer-service`}>Pelayanan Pelanggan</Link></li>
            <li className={`${activeTab === 'educational' ? 'active' : ''}`}><Link href={`/data/informations/educational`}>FaQ</Link></li>
            <li className={`${activeTab === 'promo' ? 'active' : ''}`}><Link href={`/data/informations/promo`}>Promo</Link></li>
            <li className={`${activeTab === 'gold_promo' ? 'active' : ''}`}><Link href={`/data/informations/gold-promo`}>Promo Emas</Link></li>
            <li className={`${activeTab === 'rating' ? 'active' : ''}`}><Link href={`/data/informations/rating`}>Rating</Link></li>
        </ul>
    </div>
  )
}

export default InformationsTabPage
