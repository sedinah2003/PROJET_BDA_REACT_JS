import { ACTION_META } from '../utils.js'
export default function Badge({ action }) {
  const m = ACTION_META[action] || {}
  const cls = { ajout:'status-insert', modification:'status-update', suppression:'status-delete' }
  return <span className={`status-badge ${cls[action]||''}`}><span className="status-dot"/>{m.label}</span>
}