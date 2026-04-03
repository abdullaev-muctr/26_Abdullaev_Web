import { useState, useEffect } from 'react'
import type { EditField, FormStatus } from '../types'

interface EditModalProps {
  isOpen: boolean
  title: string
  fields: EditField[]
  onSave: (values: Record<string, string>) => Promise<void>
  onClose: () => void
}

export default function EditModal({ isOpen, title, fields, onSave, onClose }: EditModalProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<FormStatus | null>(null)

  useEffect(() => {
    if (isOpen && fields) {
      const initial: Record<string, string> = {}
      fields.forEach(f => { initial[f.name] = f.value || '' })
      setValues(initial)
      setStatus(null)
    }
  }, [isOpen, fields])

  if (!isOpen) return null

  function handleChange(name: string, val: string) {
    setValues(prev => ({ ...prev, [name]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const empty = Object.values(values).some(v => !v.trim())
    if (empty) {
      setStatus({ type: 'error', text: 'Заполните все поля.' })
      return
    }
    setStatus({ type: 'loading', text: 'Сохранение...' })
    try {
      await onSave(values)
      setStatus({ type: 'success', text: 'Сохранено!' })
      setTimeout(onClose, 800)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setStatus({ type: 'error', text: 'Ошибка: ' + message })
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="edit-fields">
            {fields.map(f => (
              <div key={f.name}>
                <label>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={values[f.name] ?? ''}
                    onChange={e => handleChange(f.name, e.target.value)}
                    placeholder={f.label}
                    required
                  />
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={values[f.name] ?? ''}
                    onChange={e => handleChange(f.name, e.target.value)}
                    placeholder={f.label}
                    required
                  />
                )}
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-save">
              Сохранить <span className="method-tag put">PUT</span>
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
          </div>
        </form>
        {status && (
          <div className="form-status">
            <span className={status.type}>
              {status.type === 'loading' && <span className="spinner" />}
              {status.text}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
