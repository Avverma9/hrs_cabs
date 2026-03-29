import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { BaseUrl } from '../../utils/baseUrl'

export const LOGIN_STORAGE_KEYS = {
  id: 'loggedUserId',
  email: 'loggedUserEmail',
  role: 'LoggedUserRole',
  token: 'loggedUserToken',
}

function getStoredUser() {
  const id = localStorage.getItem(LOGIN_STORAGE_KEYS.id)
  const email = localStorage.getItem(LOGIN_STORAGE_KEYS.email)
  const role = localStorage.getItem(LOGIN_STORAGE_KEYS.role)
  const token = localStorage.getItem(LOGIN_STORAGE_KEYS.token)

  if (!id && !email && !token) {
    return null
  }

  return {
    id: id || 'saved-user',
    email: email || '',
    role: role || 'user',
    token: token || '',
    name: email ? email.split('@')[0] : 'User',
  }
}

function normalizeAuthPayload(payload, fallbackEmail) {
  const source = payload?.user || payload?.data?.user || payload?.data || payload || {}

  return {
    id: source.id || source._id || source.userId || payload?.id || payload?.userId || payload?.loggedUserId || 'demo-user',
    email: source.email || payload?.email || payload?.loggedUserEmail || fallbackEmail || '',
    role: source.role || payload?.role || payload?.loggedUserRole || 'user',
    token: source.token || payload?.token || payload?.data?.token || payload?.rsToken || '',
    name:
      source.name ||
      source.fullName ||
      payload?.name ||
      payload?.loggedUserName ||
      (fallbackEmail ? fallbackEmail.split('@')[0] : 'User'),
  }
}

function clearAuthStorage() {
  Object.values(LOGIN_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}

export function setAuthStorage({ id, email, role, token }) {
  localStorage.setItem(LOGIN_STORAGE_KEYS.id, String(id || ''))
  localStorage.setItem(LOGIN_STORAGE_KEYS.email, email || '')
  localStorage.setItem(LOGIN_STORAGE_KEYS.role, role || 'user')
  localStorage.setItem(LOGIN_STORAGE_KEYS.token, token || '')
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BaseUrl}/login/dashboard/user`, credentials)
      const normalized = normalizeAuthPayload(response.data, credentials.email)
      if (normalized.role !== 'Ride') {
        return rejectWithValue('Access denied. Only users with the "Ride" role can log in to this dashboard.')
      }
      return normalized
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        return rejectWithValue('Network error. Please check your connection and try again.')
      }

      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStoredUser(),
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      clearAuthStorage()
      state.user = null
      state.error = null
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload

        setAuthStorage({
          id: action.payload.id,
          email: action.payload.email,
          role: action.payload.role,
          token: action.payload.token,
        })
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer