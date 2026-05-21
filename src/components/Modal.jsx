export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box anim-pop">
        <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#06b6d4,#0891b2)',borderRadius:'20px 20px 0 0' }} />
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22 }}>
          <h3 style={{ fontSize:17,fontWeight:800,color:'#111827' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'#f9fafb',border:'none',borderRadius:9,width:32,height:32,fontSize:17,color:'#9ca3af',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}