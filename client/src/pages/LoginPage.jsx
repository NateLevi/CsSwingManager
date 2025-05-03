import LoginBox from '../components/loginBox'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' 

const LoginPage = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard')
    }
  }, [user, loading, navigate])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <img src="/cslogo.png" alt="logo" className="h-20 w-100 -mb-50 rounded-xs" />
        <LoginBox />
      </div>
      <footer className="text-xs text-gray-500">© 2025 All rights reserved.</footer>
    </div>
    
  )
}

export default LoginPage