// vlores trafegam em centavos; aqui convertemos só para exibir
export const brl = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const brlShort = (centavos: number) => {
  const reais = centavos / 100
  return reais >= 1000 ? `${(reais / 1000).toFixed(1).replace('.0', '')}k` : String(Math.round(reais))
}

// "15,90" ou "1.250,50" ou "15.90" -> centavos (NaN se inválido)
export function toCentavos(input: string) {
  const s = input.trim()
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  const n = Number(normalized)
  return Number.isFinite(n) ? Math.round(n * 100) : NaN
}

export const fromCentavos = (centavos: number) => (centavos / 100).toFixed(2).replace('.', ',')

const pad = (n: number) => String(n).padStart(2, '0')

// datas no fuso local (toISOString usaria UTC e poderia errar o dia/mês à noite)
export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const currentMonth = () => today().slice(0, 7)

// 2026-11-08 -> 08/11/2026
export const formatDate = (iso: string) => iso.split('-').reverse().join('/')