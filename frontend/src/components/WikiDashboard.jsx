import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Save, X, Clock, Trash2, FileText, LogOut } from 'lucide-react'
import { documentsAPI } from '../services/api'

const markdownToHtml = (md) => {
  if (!md) return ''
  return md.replace(/^### (.*$)/gim, '<h3>$1</h3>').replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>')
}

export default function WikiDashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [viewMode, setViewMode] = useState('view')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDocuments() }, [])

  const loadDocuments = async () => {
    try {
      const res = await documentsAPI.getAll()
      if (res.success) setDocuments(res.documents)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const loadDocument = async (id) => {
    try {
      const res = await documentsAPI.getOne(id)
      if (res.success) setSelectedDoc(res.document)
    } catch (e) { console.error(e) }
  }

  const createDocument = async () => {
    try {
      const res = await documentsAPI.create('New Document', '# New Document\n\nStart writing...')
      if (res.success) {
        await loadDocuments()
        setSelectedDoc(res.document)
        setEditTitle(res.document.title)
        setEditContent(res.document.content)
        setViewMode('edit')
      }
    } catch (e) { alert('Failed to create') }
  }

  const updateDocument = async () => {
    try {
      const res = await documentsAPI.update(selectedDoc._id, { title: editTitle, content: editContent })
      if (res.success) { await loadDocuments(); setSelectedDoc(res.document); setViewMode('view') }
    } catch (e) { alert('Failed to save') }
  }

  const deleteDocument = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await documentsAPI.delete(id)
      await loadDocuments()
      if (selectedDoc?._id === id) setSelectedDoc(null)
    } catch (e) { alert('Failed to delete') }
  }

  const restoreRevision = async (revId) => {
    if (!confirm('Restore this version?')) return
    try {
      const res = await documentsAPI.restore(selectedDoc._id, revId)
      if (res.success) { await loadDocuments(); setSelectedDoc(res.document); setShowHistory(false) }
    } catch (e) { alert('Failed to restore') }
  }

  const canEdit = (doc) => user.role === 'admin' || doc?.ownerEmail === user.email
  const canCreate = () => user.role !== 'viewer'
  const canDelete = (doc) => user.role === 'admin' || doc?.ownerEmail === user.email
  const filteredDocs = documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const roleBadge = { admin: 'bg-red-100 text-red-700', editor: 'bg-blue-100 text-blue-700', viewer: 'bg-gray-100 text-gray-700' }
  
  // Normalize document keys from backend (support both snake_case and camelCase)
  const normalizeDoc = (doc) => ({
    ...doc,
    ownerEmail: doc.ownerEmail || doc.owner_email,
    ownerName: doc.ownerName || doc.owner_name,
    updatedAt: doc.updatedAt || doc.updated_at,
    isPublic: doc.isPublic || doc.is_public,
    lastEditedBy: doc.lastEditedBy || doc.last_edited_by
  })
  
  const normalizedDocs = documents.map(normalizeDoc)

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-72 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold">Wiki company</h1>
            <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><LogOut size={18} /></button>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">{user.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${roleBadge[user.role]}`}>{user.role}</span>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          {canCreate() ? (
            <button onClick={createDocument} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm">
              <Plus size={16} /> New Document
            </button>
          ) : <p className="text-xs text-center text-gray-500 p-3 bg-gray-50 rounded-lg">Viewers cannot create</p>}
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {normalizedDocs.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).map(doc => (
            <div key={doc._id} onClick={() => { loadDocument(doc._id); setViewMode('view'); setShowHistory(false) }}
              className={`p-3 mb-2 rounded-lg cursor-pointer ${selectedDoc?._id === doc._id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}`}>
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-medium text-sm truncate">{doc.title}</h3>
                {canDelete(doc) && <Trash2 size={14} className="text-red-400 hover:text-red-600" onClick={e => { e.stopPropagation(); deleteDocument(doc._id) }} />}
              </div>
              <p className="text-xs text-gray-500">{new Date(doc.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedDoc ? (
          <>
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <div className="flex-1 mr-4">
                {viewMode === 'edit' ? (
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-xl font-bold border-b-2 border-blue-500 w-full outline-none" />
                ) : <h2 className="text-xl font-bold truncate">{selectedDoc.title}</h2>}
                <p className="text-xs text-gray-500 mt-1">By {selectedDoc.ownerName}</p>
              </div>
              <div className="flex gap-2">
                {viewMode === 'view' && canEdit(selectedDoc) && (
                  <>
                    <button onClick={() => { setEditTitle(selectedDoc.title); setEditContent(selectedDoc.content); setViewMode('edit') }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                    <button onClick={() => setShowHistory(!showHistory)} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${showHistory ? 'bg-blue-100 text-blue-700' : 'bg-gray-200'}`}>
                      <Clock size={14} /> History
                    </button>
                  </>
                )}
                {viewMode === 'edit' && (
                  <>
                    <button onClick={updateDocument} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2"><Save size={14} /> Save</button>
                    <button onClick={() => setViewMode('view')} className="px-3 py-2 bg-gray-200 rounded-lg text-sm flex items-center gap-2"><X size={14} /> Cancel</button>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                {viewMode === 'edit' ? (
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                    className="w-full h-full p-4 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none" />
                ) : <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedDoc.content) }} />}
              </div>
              {showHistory && selectedDoc.revisions && (
                <div className="w-80 border-l bg-white overflow-y-auto">
                  <div className="p-4 border-b bg-gray-50"><h3 className="font-semibold text-sm flex items-center gap-2"><Clock size={16} /> History</h3></div>
                  <div className="p-3">
                    {[...selectedDoc.revisions].reverse().map((rev, i) => (
                      <div key={rev._id} className="mb-3 pb-3 border-b last:border-0">
                        <p className="font-medium text-xs">{rev.changes} {i === 0 && <span className="text-green-600">(Current)</span>}</p>
                        <p className="text-xs text-gray-500">{rev.authorName} • {new Date(rev.createdAt).toLocaleString()}</p>
                        {i !== 0 && canEdit(selectedDoc) && (
                          <button onClick={() => restoreRevision(rev._id)} className="text-xs px-2 py-1 mt-1 bg-blue-100 text-blue-700 rounded">Restore</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center"><FileText size={48} className="mx-auto mb-4 opacity-50" /><p>Select a document</p></div>
          </div>
        )}
      </div>
    </div>
  )
}