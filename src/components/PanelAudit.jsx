import { useState, useEffect, useCallback } from 'react'
import { getAudit, getStats, exportURL } from '../api.js'
import { fmt, fmtDate } from '../utils.js'
import Badge from './Badge'
import AuditChart from './AuditChart.jsx'

const FILTERS = [{key:'all',label:'Tout'},{key:'ajout',label:'＋ Ajouts'},{key:'modification',label:'✎ Modifs'},{key:'suppression',label:'✕ Supprs'}]
const PAGE_SIZE = 5

export default function PanelAudit({ toast }) {
  const [logs, setLogs]       = useState([])
  const [stats, setStats]     = useState(null)
  const [filter, setFilter]   = useState('all')
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)

  const load = useCallback(async () => {
    setLoading(true);setPage(1)
    const [rL,rS] = await Promise.all([getAudit(filter),getStats()])
    if(rL.success)setLogs(rL.data)
    if(rS.success)setStats(rS.data)
    setLoading(false)
  },[filter])
  useEffect(()=>{load()},[load])

  const totalPages = Math.max(1,Math.ceil(logs.length/PAGE_SIZE))
  const paginated  = logs.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE)
  const AV = ['av-0','av-1','av-2','av-3','av-4','av-5']
  const td = { padding:'12px 16px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:0 }

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:16 }} className="anim-fade">

      {/* Stat cards */}
      <div className="stat-grid stagger">
        {[
          {label:'Total opérations',value:stats?.total,        label2:'Toutes',value2:'—',  icon:'∑',  bg:'ic-cyan'},
          {label:'Insertions',      value:stats?.insertions,   label2:'INSERT', value2:'AUTO',icon:'＋', bg:'ic-green'},
          {label:'Modifications',   value:stats?.modifications,label2:'UPDATE', value2:'AUTO',icon:'✎', bg:'ic-blue'},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className="stat-card-header">
              <div className={`stat-card-icon ${s.bg}`}><span style={{ fontSize:18,fontFamily:"'JetBrains Mono',monospace",fontWeight:700 }}>{s.icon}</span></div>
              <span className="stat-card-period">SQL ▾</span>
            </div>
            <div className="stat-cols">
              <div className="stat-col"><div className="sc-label">{s.label}</div><div className="sc-value sc-cyan">{s.value??'—'}</div></div>
              <div className="stat-col"><div className="sc-label">{s.label2}</div><div className="sc-value" style={{ fontSize:13,color:'#9ca3af' }}>{s.value2}</div></div>
            </div>
          </div>
        ))}
      </div>

      {/* ── GRAPHIQUE ── */}
      {!loading && logs.length > 0 && (
        <AuditChart logs={logs} stats={stats} />
      )}

      {/* Table */}
      <div className="table-card">
        <div className="card-header">
          <span className="card-title">Journal d'Audit SQL</span>
          <div style={{ display:'flex',gap:7,alignItems:'center' }}>
            {FILTERS.map(f=>(
              <button key={f.key} className={`filter-btn${filter===f.key?' active':''}`} onClick={()=>setFilter(f.key)}>{f.label}</button>
            ))}
            <a href={exportURL} target="_blank" rel="noreferrer" style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'6px 13px',border:'1px solid #e5e7eb',borderRadius:9,background:'#fafafa',color:'#9ca3af',fontSize:12,fontWeight:600,textDecoration:'none',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>⬇ CSV</a>
          </div>
        </div>

        <table className="main-tbl">
          <colgroup>
            <col style={{ width:'4%' }}/><col style={{ width:'11%' }}/><col style={{ width:'15%' }}/>
            <col style={{ width:'10%' }}/><col style={{ width:'18%' }}/><col style={{ width:'14%' }}/>
            <col style={{ width:'14%' }}/><col style={{ width:'14%' }}/>
          </colgroup>
          <thead><tr>{['#','Action','Date','Matricule','Nom','Sal. Ancien','Sal. Nouveau','User'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} style={{ textAlign:'center',padding:'40px',color:'#d1d5db',fontSize:13 }}>Chargement…</td></tr>
              : paginated.length===0
                ? <tr><td colSpan={8} style={{ textAlign:'center',padding:'40px',color:'#d1d5db',fontSize:13 }}>Aucune opération enregistrée</td></tr>
                : paginated.map(l=>(
                  <tr key={l.id}>
                    <td style={{ ...td,color:'#d1d5db',fontFamily:"'JetBrains Mono',monospace",fontSize:11 }}>{l.id}</td>
                    <td style={{ ...td }}><Badge action={l.type_action}/></td>
                    <td style={{ ...td,color:'#9ca3af',fontFamily:"'JetBrains Mono',monospace",fontSize:11 }}>{fmtDate(l.date_maj)}</td>
                    <td style={{ ...td }}><span className="mat-chip">{l.matricule||'—'}</span></td>
                    <td style={{ ...td }}>
                      {l.nom?(<div className="emp-cell"><div className={`emp-avatar ${AV[l.nom.charCodeAt(0)%6]}`} style={{ width:28,height:28,fontSize:11 }}>{l.nom.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div><span style={{ fontWeight:600,color:'#111827',fontSize:13 }}>{l.nom}</span></div>):'—'}
                    </td>
                    <td style={{ ...td,color:'#9ca3af',fontFamily:"'JetBrains Mono',monospace",fontSize:12 }}>{fmt(l.salaire_ancien)}</td>
                    <td style={{ ...td }}><span className="sal-chip">{fmt(l.salaire_nouv)}</span></td>
                    <td style={{ ...td,color:'#b0b7d4',fontFamily:"'JetBrains Mono',monospace",fontSize:11 }}>{l.user}</td>
                  </tr>
                ))
            }
          </tbody>
          {!loading&&logs.length>0&&(
            <tfoot>
              <tr>
                <td colSpan={2} style={{ padding:'11px 16px',fontSize:10.5,fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#0891b2',fontFamily:"'JetBrains Mono',monospace" }}>Résumé</td>
                <td style={{ padding:'11px 10px' }}><span className="sum-badge sum-insert">＋ {stats?.insertions??0}</span></td>
                <td style={{ padding:'11px 10px' }}><span className="sum-badge sum-update">✎ {stats?.modifications??0}</span></td>
                <td colSpan={4} style={{ padding:'11px 10px' }}><span className="sum-badge sum-delete">✕ {stats?.suppressions??0}</span></td>
              </tr>
            </tfoot>
          )}
        </table>

        <div className="table-footer">
          <div className="footer-info">Affichage <select className="per-page-select"><option>{PAGE_SIZE}</option></select> sur {logs.length}</div>
          <div className="pagination">
            <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(n=>(
              <button key={n} className={`page-btn${n===page?' active':''}`} onClick={()=>setPage(n)}>{n}</button>
            ))}
            {totalPages>5&&<><span style={{ color:'#d1d5db',fontSize:13 }}>…</span><button className="page-btn" onClick={()=>setPage(totalPages)}>{totalPages}</button></>}
            <button className="page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
          </div>
        </div>
      </div>
    </div>
  )
}