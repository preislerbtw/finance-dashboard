// valores trafegam em centavos; aqui
// convertemos só para exibir
export const brl = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const brlShort = (centavos: number) => {
  const reais = centavos / 100
  return reais >= 1000 ? `${(reais / 1000).toFixed(1).replace('.0', '')}k` : String(Math.round(reais))
}