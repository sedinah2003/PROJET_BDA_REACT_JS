export default function StatCard({ label, value, color, icon, sub }) {
  return <div className="stat-card anim-slide"><p style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',color:'#9ca3af',marginBottom:8 }}>{label}</p><p style={{ fontSize:36,fontWeight:800,color:'#111827' }}>{value??'—'}</p></div>
}