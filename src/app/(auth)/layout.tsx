"use client";

import MainSidebar from '@/@core/components/main-sidebar'
import withAuthPage from '@/@core/hoc/withAuthPage'
import React from 'react'

const AuthLayout = ({ children }: {children : React.ReactNode}) => {
  return (
    <main className='xadmin-page'>
        <MainSidebar />
        <section className='xadmin-section'>
            { children }
        </section>
    </main>
  )
}

export default withAuthPage(AuthLayout)
