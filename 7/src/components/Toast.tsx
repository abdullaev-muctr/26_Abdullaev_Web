import { useState, useCallback } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

type AddToastFn = (message: string, type: 'success' | 'error' | 'info') => void

let addToastGlobal: AddToastFn | null = null

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  if (addToastGlobal) addToastGlobal(message, type)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  addToastGlobal = useCallback<AddToastFn>((message, type) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <div id="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
      ))}
    </div>
  )
}
