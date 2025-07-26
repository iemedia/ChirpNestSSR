import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { GiPartyPopper } from 'react-icons/gi'
import { MdPersonAddAlt1, MdAlternateEmail } from 'react-icons/md'
import { HiOutlineMail, HiLockClosed } from 'react-icons/hi'
import toast, { Toaster } from 'react-hot-toast'

export default function CustomAuth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) window.location.href = '/'
    }
    checkSession()
  }, [])

  const validateUsername = async (name: string) => {
    const regex = /^[a-zA-Z0-9_]{3,15}$/
    if (!regex.test(name)) {
      return 'Username must be 3–15 characters and only use letters, numbers, or underscores.'
    }

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', name)
      .maybeSingle()

    if (data) return 'Username is already taken.'
    if (error) return 'Error checking username.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const loadingToastId = toast.loading(mode === 'login' ? 'Logging in...' : 'Signing up...')

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        toast.dismiss(loadingToastId)
        setError('Passwords do not match.')
        setLoading(false)
        return
      }

      const usernameError = await validateUsername(username)
      if (usernameError) {
        toast.dismiss(loadingToastId)
        setError(usernameError)
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      })

      if (error) {
        toast.dismiss(loadingToastId)
        toast.error(error.message)
        setError(error.message)
      } else {
        toast.dismiss(loadingToastId)
        toast.success('Signed up successfully! Please check your email to confirm.')
      }
    }

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.dismiss(loadingToastId)
        toast.error(error.message)
        setError(error.message)
      } else {
        toast.dismiss(loadingToastId)
        toast.success('Logged in successfully!')
      }
    }

    setLoading(false)
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Left: Branding */}
      <div className="w-1/2 bg-gradient-to-br from-purple-600 to-black text-white flex flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute -top-12 rotate-6 opacity-30">
          <img
            src="/bird-flying.gif"
            alt=""
            loading="lazy"
            className="w-64 bird-animate"
          />
        </div>
        <h1 className="text-5xl font-extrabold mb-4 z-10">ChirpNest 🐦</h1>
        <p className="text-lg text-center max-w-sm z-10">
          Connect, share, and fly with your thoughts in a colorful nest of ideas.
        </p>
      </div>

      {/* Right: Auth Form */}
      <div className="w-1/2 bg-white flex items-center justify-center p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6" id="main-content">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold flex justify-center items-center gap-2">
              {mode === 'login' ? (
                <>
                  <GiPartyPopper className="text-pink-400 text-2xl" />
                  Welcome back
                </>
              ) : (
                <>
                  <MdPersonAddAlt1 className="text-green-500 text-2xl" />
                  Create an account
                </>
              )}
            </h2>
            <p className="text-textSecondary mt-2">
              {mode === 'login' ? 'Sign in to your account' : 'Join the nest'}
            </p>
          </div>

          <div role="status" aria-live="polite">
            <Toaster position="top-center" />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {mode === 'signup' && (
            <div className="relative">
              <MdAlternateEmail className="absolute left-3 top-3.5 text-pink-400" />
              <input
                type="text"
                placeholder="Username"
                aria-label="Username"
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-3.5 text-blue-400" />
            <input
              type="email"
              placeholder="Email"
              aria-label="Email address"
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <HiLockClosed className="absolute left-3 top-3.5 text-purple-500" />
            <input
              type="password"
              placeholder="Password"
              aria-label="Password"
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'signup' && (
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-3.5 text-purple-500" />
              <input
                type="password"
                placeholder="Confirm Password"
                aria-label="Confirm password"
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105"
          >
            {loading
              ? mode === 'login' ? 'Logging in...' : 'Signing up...'
              : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>

          <div className="flex items-center justify-between">
            <span className="border-t border-gray-300 w-1/5 lg:w-1/4"></span>
            <span className="text-xs text-center text-textSecondary uppercase">or</span>
            <span className="border-t border-gray-300 w-1/5 lg:w-1/4"></span>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="cursor-pointer flex-1 border border-gray-300 px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition text-gray-800"
            >
              <FcGoogle size={20} /> Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              className="cursor-pointer flex-1 border border-gray-300 px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition text-gray-800"
            >
              <FaGithub size={20} /> GitHub
            </button>
          </div>

          <p className="text-sm text-center text-gray-600">
            {mode === 'login' ? (
              <>
                Don’t have an account?{' '}
                <button
                  type="button"
                  className="text-indigo-600 hover:underline cursor-pointer"
                  onClick={() => setMode('signup')}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-indigo-600 hover:underline cursor-pointer"
                  onClick={() => setMode('login')}
                >
                  Login
                </button>
              </>
            )}
          </p>
        </form>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .bird-animate {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
