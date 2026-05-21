// =============================================
// api.js — Toutes les requêtes vers api.php
// Modifiez BASE si votre dossier a un autre nom
// =============================================

const BASE = 'http://localhost/PROJET_BDA_REACT_JS/api.php'

async function request(action, method = 'GET', body = null, extra = '') {
  const url = `${BASE}?action=${action}${extra}`
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  try {
    const res = await fetch(url, opts)
    return await res.json()
  } catch (err) {
    return { success: false, error: 'Erreur réseau : ' + err.message }
  }
}

// --- Employés ---
export const getEmployes   = ()      => request('employes')
export const addEmploye    = (data)  => request('employes', 'POST', data)
export const updateEmploye = (data)  => request('employes', 'PUT', data)
export const deleteEmploye = (mat)   => request('employes', 'DELETE', null, `&matricule=${encodeURIComponent(mat)}`)

// --- Audit ---
export const getAudit = (filter = 'all') => request('audit', 'GET', null, `&filter=${filter}`)
export const getStats = ()               => request('stats')

// --- Export CSV ---
export const exportURL = 'http://localhost/PROJET_BDA_REACT_JS/api.php?action=export'