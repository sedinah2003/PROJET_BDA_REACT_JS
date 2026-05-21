import { useState, useEffect, useCallback } from 'react'
import { getEmployes, addEmploye, updateEmploye, deleteEmploye } from '../api.js'
import { fmt } from '../utils.js'
import Modal from './Modal'
import EmployeForm from './EmployeForm'

const AV    = ['av-0','av-1','av-2','av-3','av-4','av-5']
const color = (nom) => AV[nom.charCodeAt(0)%AV.length]
const init  = (nom) => nom.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
const PAGE_SIZE = 5

export default function PanelEmployes({ toast }) {
  const [employes, setEmployes]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showAdd, setShowAdd]       = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await getEmployes()
    if (r.success) setEmployes(r.data)
    else toast('❌ Chargement échoué','error')
    setLoading(false)
  }, [])
  useEffect(()=>{load()},[load])

  const filtered   = employes.filter(e=>e.matricule.toLowerCase().includes(search.toLowerCase())||e.nom.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE))
  const paginated  = filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE)
  const total      = employes.length
  const salMoy     = total>0 ? Math.round(employes.reduce((s,e)=>s+parseFloat(e.salaire||0),0)/total) : 0

  async function handleAdd(form) {
    if (!form.matricule||!form.nom||!form.salaire) return toast('❌ Remplir tous les champs','error')
    const r = await addEmploye(form)
    if (r.success){toast('✅ Employé ajouté — trigger INSERT !','success');setShowAdd(false);load()}
    else toast('❌ '+r.error,'error')
  }
  async function handleEdit(form) {
    const r = await updateEmploye(form)
    if (r.success){toast('✅ Modifié — trigger UPDATE !','success');setEditTarget(null);load()}
    else toast('❌ '+r.error,'error')
  }
  async function handleDelete(matricule,nom) {
    if (!confirm(`Supprimer ${nom} ?`)) return
    const r = await deleteEmploye(matricule)
    if (r.success){toast('🗑 Supprimé — trigger DELETE !','success');load()}
    else toast('❌ '+r.error,'error')
  }

  return (
    <div className="anim-fade" style={{ display:'flex',flexDirection:'column',gap:16 }}>

      {/* Stat cards — style SAIDALX avec multi-colonnes */}
      <div className="stat-grid stagger">
        {/* Card 1 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon ic-cyan">👥</div>
            <span className="stat-card-period">Actuel ▾</span>
          </div>
          <div className="stat-cols">
            <div className="stat-col">
              <div className="sc-label">Total</div>
              <div className="sc-value">{total}</div>
            </div>
            <div className="stat-col">
              <div className="sc-label">Actifs</div>
              <div className="sc-value">{total}</div>
            </div>
          </div>
        </div>
        {/* Card 2 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon ic-green">💰</div>
            <span className="stat-card-period">Mensuel ▾</span>
          </div>
          <div className="stat-cols">
            <div className="stat-col">
              <div className="sc-label">Sal. Moyen</div>
              <div className="sc-value" style={{ fontSize:16 }}>{salMoy>0?salMoy.toLocaleString('fr-FR'):'—'}</div>
            </div>
            <div className="stat-col">
              <div className="sc-label">Masse</div>
              <div className="sc-value" style={{ fontSize:16 }}>{total>0?(employes.reduce((s,e)=>s+parseFloat(e.salaire||0),0)).toLocaleString('fr-FR'):'—'}</div>
            </div>
          </div>
        </div>
        {/* Card 3 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon ic-orange">⚡</div>
            <span className="stat-card-period">SQL ▾</span>
          </div>
          <div className="stat-cols">
            <div className="stat-col">
              <div className="sc-label">Triggers</div>
              <div className="sc-value sc-cyan">3</div>
            </div>
            <div className="stat-col">
              <div className="sc-label">Statut</div>
              <div className="sc-value" style={{ fontSize:13, color:'#10b981' }}>● Actifs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="card-header">
          <span className="card-title">Liste des Employés</span>
          <div style={{ display:'flex',gap:10,alignItems:'center' }}>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="🔎 Rechercher..."
              style={{ border:'1px solid #e5e7eb',borderRadius:10,padding:'7px 14px',fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",background:'#fafafa',color:'#374151',outline:'none',width:200,transition:'all 0.2s' }} />
            <button className="btn-add" onClick={()=>setShowAdd(true)}>＋ Ajouter</button>
          </div>
        </div>

        <table className="main-tbl">
          <colgroup>
            <col style={{ width:'16%' }}/><col style={{ width:'34%' }}/>
            <col style={{ width:'24%' }}/><col style={{ width:'26%' }}/>
          </colgroup>
          <thead><tr><th>Matricule</th><th>Nom complet</th><th>Salaire</th><th>Actions</th></tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={4} style={{ textAlign:'center',padding:'40px',color:'#d1d5db',fontSize:13 }}>Chargement…</td></tr>
              : paginated.length===0
                ? <tr><td colSpan={4} style={{ textAlign:'center',padding:'40px',color:'#d1d5db',fontSize:13 }}>Aucun employé trouvé</td></tr>
                : paginated.map(emp=>(
                  <tr key={emp.matricule}>
                    <td><span className="mat-chip">{emp.matricule}</span></td>
                    <td><div className="emp-cell"><div className={`emp-avatar ${color(emp.nom)}`}>{init(emp.nom)}</div><span style={{ fontWeight:600,color:'#111827' }}>{emp.nom}</span></div></td>
                    <td><span className="sal-chip">{fmt(emp.salaire)}</span></td>
                    <td><div style={{ display:'flex',gap:7 }}><button className="btn-sm-edit" onClick={()=>setEditTarget(emp)}>✎ Modifier</button><button className="btn-sm-del" onClick={()=>handleDelete(emp.matricule,emp.nom)}>✕ Supprimer</button></div></td>
                  </tr>
                ))
            }
          </tbody>
        </table>

        <div className="table-footer">
          <div className="footer-info">Affichage <select className="per-page-select"><option>{PAGE_SIZE}</option></select> sur {filtered.length}</div>
          <div className="pagination">
            <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
              <button key={n} className={`page-btn${n===page?' active':''}`} onClick={()=>setPage(n)}>{n}</button>
            ))}
            <button className="page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
          </div>
        </div>
      </div>

      {showAdd    && <Modal title="Ajouter un employé" onClose={()=>setShowAdd(false)}><EmployeForm onSave={handleAdd}  onCancel={()=>setShowAdd(false)} /></Modal>}
      {editTarget && <Modal title="Modifier l'employé" onClose={()=>setEditTarget(null)}><EmployeForm initial={editTarget} onSave={handleEdit} onCancel={()=>setEditTarget(null)} /></Modal>}
    </div>
  )
}