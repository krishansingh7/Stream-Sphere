import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './store/index'
import { queryClient } from './config/queryClient'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster
            position="bottom-left"
            toastOptions={{
              style: {
                background: '#212121',
                color: '#f1f1f1',
                border: '1px solid #3f3f3f',
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)
