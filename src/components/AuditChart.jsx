import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { useState } from 'react'

const COLORS = {
  ajout:        '#10b981',
  modification: '#06b6d4',
  suppression:  '#ef4444',
}

// Tooltip personnalisé
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'10px 14px', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', fontSize:12, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <p style={{ fontWeight:700, color:'#111827', marginBottom:6 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:p.fill||p.color, display:'inline-block' }} />
          <span style={{ color:'#6b7280' }}>{p.name} :</span>
          <span style={{ fontWeight:700, color:'#111827' }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AuditChart({ logs, stats }) {
  const [chartType, setChartType] = useState('bar')

  if (!logs || logs.length === 0) return null

  // ── Données par jour (7 derniers jours) ──
  const byDay = {}
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' })
    byDay[key] = { date: key, Ajouts: 0, Modifications: 0, Suppressions: 0 }
  }

  logs.forEach(l => {
    const d = new Date(l.date_maj)
    const key = d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' })
    if (!byDay[key]) return
    if (l.type_action === 'ajout')        byDay[key].Ajouts++
    if (l.type_action === 'modification') byDay[key].Modifications++
    if (l.type_action === 'suppression')  byDay[key].Suppressions++
  })

  const barData = Object.values(byDay)

  // ── Données donut ──
  const pieData = [
    { name: 'Insertions',    value: stats?.insertions    ?? 0, color: '#10b981' },
    { name: 'Modifications', value: stats?.modifications ?? 0, color: '#06b6d4' },
    { name: 'Suppressions',  value: stats?.suppressions  ?? 0, color: '#ef4444' },
  ].filter(d => d.value > 0)

  // ── Données ligne (cumul par jour) ──
  let cumul = 0
  const lineData = barData.map(d => {
    cumul += d.Ajouts + d.Modifications + d.Suppressions
    return { date: d.date, Total: cumul }
  })

  const tabs = [
    { key:'bar',  label:'📊 Barres' },
    { key:'pie',  label:'🍩 Donut' },
    { key:'line', label:'📈 Tendance' },
  ]

  return (
    <div style={{ background:'#fff', borderRadius:16, border:'1px solid #f3f4f6', boxShadow:'0 1px 6px rgba(0,0,0,0.05)', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 12px', borderBottom:'1px solid #f9fafb' }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:'#111827' }}>Statistiques des opérations</div>
          <div style={{ fontSize:11, color:'#9ca3af', marginTop:2, fontFamily:"'JetBrains Mono',monospace" }}>7 derniers jours — INSERT / UPDATE / DELETE</div>
        </div>
        {/* Type selector */}
        <div style={{ display:'flex', gap:4, background:'#f9fafb', padding:4, borderRadius:10, border:'1px solid #f3f4f6' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setChartType(t.key)}
              style={{ padding:'5px 12px', borderRadius:8, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, transition:'all 0.15s', fontFamily:"'Plus Jakarta Sans',sans-serif",
                background: chartType===t.key ? '#fff' : 'transparent',
                color:      chartType===t.key ? '#0891b2' : '#9ca3af',
                boxShadow:  chartType===t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ padding:'20px 20px 16px' }}>

        {/* ── BAR CHART ── */}
        {chartType==='bar' && (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={14} barGap={3}
              margin={{ top:4, right:10, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#9ca3af', fontFamily:"'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#9ca3af', fontFamily:"'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:'#f0fdfe' }} />
              <Legend wrapperStyle={{ fontSize:12, fontFamily:"'Plus Jakarta Sans',sans-serif", paddingTop:12 }} />
              <Bar dataKey="Ajouts"        fill="#10b981" radius={[6,6,0,0]} />
              <Bar dataKey="Modifications" fill="#06b6d4" radius={[6,6,0,0]} />
              <Bar dataKey="Suppressions"  fill="#ef4444" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* ── PIE / DONUT ── */}
        {chartType==='pie' && (
          <div style={{ display:'flex', alignItems:'center', gap:32 }}>
            <ResponsiveContainer width="55%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Légende donut */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {pieData.map(d => {
                const total = pieData.reduce((s,i)=>s+i.value,0)
                const pct = total > 0 ? Math.round(d.value/total*100) : 0
                return (
                  <div key={d.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', background:d.color, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#111827' }}>{d.name}</div>
                      <div style={{ fontSize:11, color:'#9ca3af' }}>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:d.color }}>{d.value}</span>
                        <span style={{ marginLeft:6 }}>({pct}%)</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div style={{ borderTop:'1px solid #f3f4f6', paddingTop:10, marginTop:4 }}>
                <div style={{ fontSize:11, color:'#9ca3af' }}>Total opérations</div>
                <div style={{ fontSize:22, fontWeight:800, color:'#111827', fontFamily:"'JetBrains Mono',monospace" }}>
                  {pieData.reduce((s,d)=>s+d.value,0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LINE CHART ── */}
        {chartType==='line' && (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData} margin={{ top:4, right:10, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#9ca3af', fontFamily:"'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#9ca3af', fontFamily:"'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke:'#a5f3fc', strokeWidth:1 }} />
              <Legend wrapperStyle={{ fontSize:12, fontFamily:"'Plus Jakarta Sans',sans-serif", paddingTop:12 }} />
              <Line type="monotone" dataKey="Total" stroke="#06b6d4" strokeWidth={3}
                dot={{ r:5, fill:'#06b6d4', stroke:'#fff', strokeWidth:2 }}
                activeDot={{ r:7, fill:'#0891b2' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}