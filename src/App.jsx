import { useState } from 'react'
import PanelEmployes from './components/PanelEmployes'
import PanelAudit    from './components/PanelAudit'
import Toast         from './components/Toast'

const NAV = [
  { key:'employes', icon:'👥', label:'Employés',       badge: null },
  { key:'audit',    icon:'📋', label:"Journal d'Audit", badge: null },
  { key:'stats',    icon:'📊', label:'Statistiques',   badge: null },
  { key:'team',     icon:'👤', label:'Équipe',          badge: 3   },
  { key:'payment',  icon:'💳', label:'Paiement',        badge: null },
  { key:'schedule', icon:'📅', label:'Planning',        badge: null },
  { key:'settings', icon:'⚙️', label:'Paramètres',      badge: null },
]

export default function App() {
  const [tab, setTab]     = useState('employes')
  const [toast, setToast] = useState(null)
  const showToast = (msg, type) => setToast({ msg, type })
  const now = new Date()
  const hour = now.getHours()
  const greet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">E</div>
          <div className="logo-text">
            <div className="logo-title">EmpAudit</div>
            <div className="logo-sub">Gestion RH</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((n,i) => (
            <div key={n.key}>
              {i===2 && <div style={{ height:1, background:'#f3f4f6', margin:'8px 4px' }} />}
              <button className={`nav-item${tab===n.key?' active':''}`} onClick={()=>setTab(n.key)}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="support-btn">
            <span>🎧</span> Support
          </button>
          <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6, padding:'0 4px' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:11, color:'#9ca3af', fontFamily:"'JetBrains Mono',monospace" }}>Triggers actifs</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-content">
        {/* Topbar greeting */}
        <div className="topbar">
          <div className="topbar-greeting">
            <div className="greeting-title">{greet}, Admin 👋</div>
            <div className="greeting-sub">Gérez vos employés et consultez l'audit SQL en temps réel</div>
          </div>
          <div className="topbar-right">
            <div className="notif-btn">
              🔔 <div className="notif-dot" />
            </div>
            <div className="user-card">
              <div className="user-avatar">A</div>
              <span className="user-name">Administrateur</span>
              <span className="user-arrow">▾</span>
            </div>
          </div>
        </div>

        {/* Page */}
        <div className="page-area">
          {tab==='employes' && <PanelEmployes toast={showToast} />}
          {tab==='audit'    && <PanelAudit    toast={showToast} />}
          {!['employes','audit'].includes(tab) && (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#a5f3fc', fontSize:14, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>
              Section en cours de développement…
            </div>
          )}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  )
}