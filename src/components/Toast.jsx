import { useEffect } from 'react'
export default function Toast({ msg, type, onClose }) {
  useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t)},[onClose])
  return <div className={`toast toast-${type}`}><span>{type==='success'?'✅':'❌'}</span><span>{msg}</span></div>
}