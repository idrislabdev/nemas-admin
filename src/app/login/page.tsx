
import React from 'react'
import '@/styles/login.css'
import LoginForm from '@/@core/pages/login'

export default async function  XadminLoginPage() {
    return (
      <main className='login-page sm:mobile-responsive light-theme'>
        <LoginForm />
      </main>
    )
  }
  
  