import { useState, useEffect } from 'react'

const API_BASE = 'https://hono-sample-api.bashi-sample-api.workers.dev'

interface Item {
  id: number
  name: string
  description: string
  createdAt: string
}

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`)
      if (!res.ok) throw new Error('Failed to fetch items')
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const addItem = async () => {
    if (!name.trim()) return
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      if (!res.ok) throw new Error('Failed to add item')
      setName('')
      setDescription('')
      await fetchItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error adding item')
    }
  }

  const deleteItem = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete item')
      await fetchItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error deleting item')
    }
  }

  const startEdit = (item: Item) => {
    setEditing(item.id)
    setEditName(item.name)
    setEditDescription(item.description)
  }

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDescription }),
      })
      if (!res.ok) throw new Error('Failed to update item')
      setEditing(null)
      await fetchItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error updating item')
    }
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditName('')
    setEditDescription('')
  }

  return (
    <div className="container">
      <h1>Hono Sample API - Frontend</h1>
      <p className="api-info">
        API: <code>{API_BASE}</code>
      </p>

      {error && (
        <div className="error" onClick={() => setError('')}>
          {error}
        </div>
      )}

      <section className="add-section">
        <h2>Add New Item</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button onClick={addItem}>Add</button>
        </div>
      </section>

      <section className="list-section">
        <h2>Items</h2>
        {loading ? (
          <p className="loading">Loading...</p>
        ) : items.length === 0 ? (
          <p className="empty">No items found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    {editing === item.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td>
                    {editing === item.id ? (
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    ) : (
                      item.description || '-'
                    )}
                  </td>
                  <td className="actions">
                    {editing === item.id ? (
                      <>
                        <button className="btn-save" onClick={() => saveEdit(item.id)}>
                          Save
                        </button>
                        <button className="btn-cancel" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-edit" onClick={() => startEdit(item)}>
                          Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteItem(item.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default App