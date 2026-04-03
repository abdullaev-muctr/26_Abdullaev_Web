import { useState } from 'react'
import { useStore } from '../store'
import { showToast } from './Toast'
import EditModal from './EditModal'
import type { FormStatus, ModalState } from '../types'

const API = 'https://dummyjson.com/users'

export default function UsersSection() {
  const { users, usersLoading, usersError, setUsers } = useStore()
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [job, setJob] = useState('')
  const [editModal, setEditModal] = useState<ModalState | null>(null)
  const [newIds, setNewIds] = useState<Set<number>>(new Set())
  const [updatedIds, setUpdatedIds] = useState<Set<number>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !job.trim()) {
      setFormStatus({ type: 'error', text: 'Заполните все поля.' })
      return
    }
    setSubmitting(true)
    setFormStatus({ type: 'loading', text: 'Отправка...' })
    try {
      const res = await fetch(API + '/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: name.trim(), company: { title: job.trim() } })
      })
      if (!res.ok) throw new Error('Ошибка ' + String(res.status))
      const data = await res.json()
      setUsers(prev => [{
        id: data.id,
        firstName: data.firstName || name.trim(),
        lastName: '',
        email: data.email || 'не указан',
        image: `https://dummyjson.com/icon/${data.firstName || name.trim()}/150`
      }, ...prev])
      setNewIds(prev => new Set([...prev, data.id]))
      setFormStatus({ type: 'success', text: `Пользователь #${data.id} создан!` })
      showToast('Пользователь создан (POST → 201)', 'success')
      setName('')
      setJob('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка'
      setFormStatus({ type: 'error', text: 'Ошибка: ' + msg })
      showToast('Ошибка создания пользователя', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(id: number, values: Record<string, string>) {
    const res = await fetch(API + '/' + String(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: values['firstName'], lastName: values['lastName'] })
    })
    if (!res.ok) throw new Error('Ошибка ' + String(res.status))
    const result = await res.json()
    setUsers(prev => prev.map(u => u.id === id ? { ...u, firstName: result.firstName, lastName: result.lastName } : u))
    setUpdatedIds(prev => new Set([...prev, id]))
    showToast(`Пользователь #${id} обновлён (PATCH → 200)`, 'success')
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить пользователя #' + String(id) + '?')) return
    try {
      const res = await fetch(API + '/' + String(id), { method: 'DELETE' })
      if (!res.ok) throw new Error('Ошибка ' + String(res.status))
      setDeletedIds(prev => new Set([...prev, id]))
      showToast(`Пользователь #${id} удалён (DELETE → 200)`, 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка'
      showToast('Ошибка: ' + msg, 'error')
    }
  }

  function getCardClass(id: number): string {
    let cls = 'item-card'
    if (deletedIds.has(id)) cls += ' deleted'
    if (newIds.has(id)) cls += ' new-item'
    if (updatedIds.has(id)) cls += ' updated-item'
    return cls
  }

  return (
    <>
      <div className="section-header">
        <h2>Пользователи</h2>
        <p className="api-badge">DummyJSON - <code>dummyjson.com/users</code></p>
      </div>

      <div className="form-card">
        <h3>Добавить пользователя <span className="method-tag post">POST</span></h3>
        <form onSubmit={handleCreate}>
          <input type="text" placeholder="Имя" value={name} onChange={e => setName(e.target.value)} required />
          <input type="text" placeholder="Должность" value={job} onChange={e => setJob(e.target.value)} required />
          <button type="submit" disabled={submitting}>Создать</button>
        </form>
        {formStatus && (
          <div className="form-status">
            <span className={formStatus.type}>
              {formStatus.type === 'loading' && <span className="spinner" />}
              {formStatus.text}
            </span>
          </div>
        )}
      </div>

      <h3>Все пользователи <span className="method-tag get">GET</span></h3>
      <div className="items-grid">
        {usersLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-card" />)}
        {usersError && <div className="placeholder-msg error">Не удалось загрузить пользователей: {usersError}</div>}
        {!usersLoading && !usersError && users.length === 0 && <div className="placeholder-msg">Пользователей пока нет.</div>}
        {users.map(user => (
          <div key={user.id} className={getCardClass(user.id)}>
            <div className="card-top">
              <img className="card-avatar" src={user.image} alt={user.firstName} />
              <div className="card-info">
                <span className="card-id">#{user.id}</span>
                <div className="card-title">{user.firstName} {user.lastName}</div>
                <div className="card-body">{user.email}</div>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn-edit" onClick={() => setEditModal({
                id: user.id,
                title: 'Редактировать пользователя #' + String(user.id),
                fields: [
                  { name: 'firstName', label: 'Имя', type: 'text', value: user.firstName },
                  { name: 'lastName', label: 'Фамилия', type: 'text', value: user.lastName || '' }
                ]
              })}>
                Изменить <span className="method-tag put">PATCH</span>
              </button>
              <button className="btn-delete" disabled={deletedIds.has(user.id)} onClick={() => handleDelete(user.id)}>
                Удалить <span className="method-tag delete">DEL</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {editModal && (
        <EditModal
          isOpen={!!editModal}
          title={editModal.title}
          fields={editModal.fields}
          onSave={values => handleEdit(editModal.id, values)}
          onClose={() => setEditModal(null)}
        />
      )}
    </>
  )
}
