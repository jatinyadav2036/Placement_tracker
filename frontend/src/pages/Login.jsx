import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, Chrome, ArrowRight, Lock, Mail, User, Building } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { signInWithGoogle, resetPassword } from '../services/auth'
import useAuthStore from '../hooks/useAuth'

// Animated background particles
const Particle = ({ style }) => (
  <div className="particle" style={style} />
)

const particles = Array.from({ length: 30 }, (_, i) => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 6}s`,
  animationDuration: `${4 + Math.random() * 4}s`,
  opacity: Math.random() * 0.7 + 0.1,
  width: `${Math.random() * 3 + 1}px`,
  height: `${Math.random() * 3 + 1}px`,
}))

function PasswordStrength({ password }) {
  const getStrength = () => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const strength = getStrength()
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-gray-700'}`} />
        ))}
      </div>
      <p className={`text-xs ${strength <= 1 ? 'text-red-400' : strength <= 2 ? 'text-yellow-400' : strength <= 3 ? 'text-blue-400' : 'text-green-400'}`}>
        {labels[strength]}
      </p>
    </div>
  )
}

export default function Login() {
  const [mode, setMode] = useState('login') // login | register | forgot
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const password = watch('password', '')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let res
      if (mode === 'login') {
        res = await authAPI.login({ email: data.email, password: data.password })
      } else if (mode === 'register') {
        res = await authAPI.register({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          college: data.college,
        })
      } else {
        await resetPassword(data.email)
        toast.success('Password reset email sent!')
        setMode('login')
        setLoading(false)
        return
      }
      setAuth(res.data.user, res.data.access_token)
      toast.success(`Welcome ${mode === 'login' ? 'back' : ''}! 🚀`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { idToken } = await signInWithGoogle()
      const res = await authAPI.firebaseLogin(idToken)
      setAuth(res.data.user, res.data.access_token)
      toast.success('Signed in with Google! 🚀')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Google sign-in failed. Please check Firebase config.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-gray-950 to-cyan-900/20 animate-gradient-shift" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float-delay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="grid-bg absolute inset-0" />
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 mb-4 shadow-neon-blue">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold gradient-text">Success Tracker</h1>
          
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          {/* Mode tabs */}
          {mode !== 'forgot' && (
            <div className="flex bg-gray-900/60 rounded-xl p-1 mb-6">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                    mode === m
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'register' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'register' ? -20 : 20 }}
              transition={{ duration: 0.25 }}
            >
              {mode === 'forgot' && (
                <div className="mb-4">
                  <h2 className="font-display text-xl font-bold text-white mb-1">Reset Password</h2>
                  <p className="text-gray-400 text-sm">Enter your email to receive a reset link</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <div>
                      <label className="label">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                        <input
                          {...register('full_name', { required: 'Name is required' })}
                          className="input-field pl-10"
                          placeholder="First Last Name"
                        />
                      </div>
                      {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
                    </div>
                    <div>
                      <label className="label">College / University</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                        <input
                          {...register('college')}
                          className="input-field pl-10"
                          placeholder="J.C Bose Ust,IIT Delhi ..."
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                      })}
                      className="input-field pl-10"
                      placeholder="Please enter your email"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label className="label">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Minimum 8 characters' }
                        })}
                        className="input-field pl-10 pr-10"
                        placeholder="Please enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                    {mode === 'register' && <PasswordStrength password={password} />}
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setMode('forgot')} className="text-brand-400 text-xs hover:text-brand-300">
                      Forgot password?
                    </button>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* {mode !== 'forgot' && (
                <>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-gray-600 text-xs">or continue with</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <motion.button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <Chrome className="w-4 h-4 text-red-400" />
                    Continue with Google
                  </motion.button>
                </>
              )} */}

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="mt-4 text-gray-400 text-sm hover:text-white transition-colors"
                >
                  ← Back to Sign In
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-gray-600 text-xs mt-6">
          This project was developed by Rahul and Jatin
        </p>
      </div>
    </div>
  )
}
