export const fmt = (n) =>
  n == null ? '—' : Number(n).toLocaleString('fr-FR') + ' Ar'

export const fmtDate = (d) =>
  new Date(d).toLocaleString('fr-FR')

export const ACTION_META = {
  ajout:        { label: 'Ajout',        badgeCls: 'bg-emerald-100 text-emerald-800', dotCls: 'bg-emerald-500' },
  modification: { label: 'Modification', badgeCls: 'bg-blue-100 text-blue-800',      dotCls: 'bg-blue-500'    },
  suppression:  { label: 'Suppression',  badgeCls: 'bg-red-100 text-red-800',        dotCls: 'bg-red-500'     },
}