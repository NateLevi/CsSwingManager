import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

const LoginBox = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (err) {
      let customMessage = ''
      switch(err.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          customMessage = 'The email or password is incorrect.'
          break
        case 'auth/user-not-found':
          customMessage = 'No user found with that email address.'
          break
        default:
          customMessage = 'An unexpected error occurred. Please try again.'
      }
      setError(customMessage)
      console.error('Login failed:', err.message)
    }
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="border border-gray-300 p-8 shadow-lg w-96 h-64">
        <form onSubmit={handleSubmit} className="text-[14px] mb-2 text-gray-500">
          <label>Email</label>
          <input 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-black rounded-sm p-1 mt-2 mb-2 w-full"      
          />
          <label>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-black rounded-sm p-1 mt-2 w-full"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="bg-black text-white rounded-sm p-1 w-full mt-5 hover:bg-gray-800 cursor-pointer">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginBox
