import { useState } from 'react'
export default function EmployeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial||{matricule:'',nom:'',salaire:''})
  const isEdit = !!initial
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
      <div><label className="field-label">Matricule</label><input className="input-field" value={form.matricule} disabled={isEdit} onChange={e=>set('matricule',e.target.value)} placeholder="EMP001" /></div>
      <div><label className="field-label">Nom complet</label><input className="input-field" value={form.nom} onChange={e=>set('nom',e.target.value)} placeholder="Jean Rakoto" /></div>
      <div><label className="field-label">Salaire (Ar)</label><input className="input-field" type="number" value={form.salaire} onChange={e=>set('salaire',e.target.value)} placeholder="2500000" /></div>
      <div style={{ display:'flex',gap:10,marginTop:6 }}>
        <button className="btn-secondary" onClick={onCancel} style={{ flex:1,justifyContent:'center' }}>Annuler</button>
        <button className="btn-primary"   onClick={()=>onSave(form)} style={{ flex:1,justifyContent:'center' }}>{isEdit?'💾 Enregistrer':'＋ Ajouter'}</button>
      </div>
    </div>
  )
}