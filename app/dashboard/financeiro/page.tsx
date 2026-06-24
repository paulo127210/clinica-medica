'use client'
import { useEffect, useState, useCallback } from 'react'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Calendar, BarChart2, FileText, RefreshCw } from 'lucide-react'

type Periodo = 'hora' | 'dia' | 'semana' | 'mes' | 'ano'

const fmt  = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtN = (v: number) => new Intl.NumberFormat('pt-BR').format(v || 0)

function dataLocal(d: Date) {
  return d.toISOString().slice(0, 10)
}

function inicioFim(periodo: Periodo, ref: string): { de: string; ate: string } {
  const d = new Date(ref + 'T00:00:00')
  if (periodo === 'hora') {
    return { de: ref + 'T00:00:00', ate: ref + 'T23:59:59' }
  }
  if (periodo === 'dia') {
    return { de: ref + 'T00:00:00', ate: ref + 'T23:59:59' }
  }
  if (periodo === 'semana') {
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1
    const seg = new Date(d); seg.setDate(d.getDate() - dow)
    const sex = new Date(seg); sex.setDate(seg.getDate() + 6)
    return { de: dataLocal(seg) + 'T00:00:00', ate: dataLocal(sex) + 'T23:59:59' }
  }
  if (periodo === 'mes') {
    const ano = d.getFullYear(), mes = d.getMonth()
    const fim = new Date(ano, mes + 1, 0)
    return { de: `${ano}-${String(mes+1).padStart(2,'0')}-01T00:00:00`, ate: dataLocal(fim) + 'T23:59:59' }
  }
  // ano
  const ano = d.getFullYear()
  return { de: `${ano}-01-01T00:00:00`, ate: `${ano}-12-31T23:59:59` }
}

interface LinhaFatura {
  id: number
  numero: string
  status: string
  valor_bruto: number
  valor_pago: number
  vencimento: string
  paciente?: string
  data_consulta?: string
}

interface ResumoForma {
  forma: string
  total: number
  qtd: number
}

export default function FinanceiroPage() {
  const hoje = dataLocal(new Date())
  const [periodo, setPeriodo]   = useState<Periodo>('mes')
  const [refData, setRefData]   = useState(hoje)
  const [loading, setLoading]   = useState(true)
  const [faturas, setFaturas]   = useState<LinhaFatura[]>([])
  const [formas,  setFormas]    = useState<ResumoForma[]>([])
  const [gerandoPDF, setGerandoPDF] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const { de, ate } = inicioFim(periodo, refData)

      // Busca faturas no período (via data_hora da consulta)
      const [resFat, resPag] = await Promise.all([
        fetch(`/api/dados?tabela=faturas&select=id,numero,status,valor_bruto,valor_pago,vencimento,paciente_id,consulta_id&order=id&asc=false&limit=500`).then(r => r.json()),
        fetch(`/api/dados?tabela=pagamentos&select=id,fatura_id,forma_pagamento_id,valor,data_pagamento&order=id&asc=false&limit=500`).then(r => r.json()),
      ])

      // Busca consultas no período para cruzar com faturas
      const resC = await fetch(`/api/dados?tabela=consultas&select=id,data_hora,paciente_id&gte=data_hora%3D${encodeURIComponent(de)}&lte=data_hora%3D${encodeURIComponent(ate)}&order=data_hora&limit=500`).then(r => r.json())

      const consultaIds = new Set((resC.data || []).map((c: any) => c.id))
      const consultaMap: Record<number, string> = {}
      ;(resC.data || []).forEach((c: any) => { consultaMap[c.id] = c.data_hora })

      // Busca pacientes para nomes
      const resP = await fetch(`/api/dados?tabela=pacientes&select=id,nome&limit=500`).then(r => r.json())
      const pacMap: Record<number, string> = {}
      ;(resP.data || []).forEach((p: any) => { pacMap[p.id] = p.nome })

      const faturasFiltradas: LinhaFatura[] = (resFat.data || [])
        .filter((f: any) => consultaIds.has(f.consulta_id))
        .map((f: any) => ({
          id: f.id,
          numero: f.numero,
          status: f.status,
          valor_bruto: Number(f.valor_bruto),
          valor_pago: Number(f.valor_pago),
          vencimento: f.vencimento,
          paciente: pacMap[f.paciente_id] || 'Paciente',
          data_consulta: consultaMap[f.consulta_id],
        }))

      setFaturas(faturasFiltradas)

      // Formas de pagamento no período
      const formaNames: Record<number, string> = {1:'Dinheiro',2:'Débito',3:'Crédito',4:'PIX',5:'Convênio'}
      const fatIds = new Set(faturasFiltradas.map(f => f.id))
      const pagsNoPeriodo = (resPag.data || []).filter((p: any) => fatIds.has(p.fatura_id))
      const formaMap: Record<string, {total: number; qtd: number}> = {}
      pagsNoPeriodo.forEach((p: any) => {
        const nome = formaNames[p.forma_pagamento_id] || 'Outro'
        if(!formaMap[nome]) formaMap[nome] = {total:0, qtd:0}
        formaMap[nome].total += Number(p.valor)
        formaMap[nome].qtd  += 1
      })
      setFormas(Object.entries(formaMap).map(([forma, v]) => ({forma, ...v})).sort((a,b) => b.total - a.total))
    } finally {
      setLoading(false)
    }
  }, [periodo, refData])

  useEffect(() => { carregar() }, [carregar])

  // Agrupamento por hora/dia para gráfico de barras
  function agrupar() {
    if (periodo === 'hora') {
      const map: Record<string, number> = {}
      for (let h = 0; h < 24; h++) map[String(h).padStart(2,'0')+'h'] = 0
      faturas.filter(f => f.status==='PAGA').forEach(f => {
        const h = f.data_consulta ? new Date(f.data_consulta).getHours() : 0
        const k = String(h).padStart(2,'0')+'h'
        map[k] = (map[k] || 0) + f.valor_pago
      })
      return Object.entries(map).map(([label, valor]) => ({label, valor}))
    }
    if (periodo === 'semana') {
      const dias = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
      const map: Record<string, number> = {}
      dias.forEach(d => map[d] = 0)
      faturas.filter(f => f.status==='PAGA').forEach(f => {
        const dow = f.data_consulta ? new Date(f.data_consulta).getDay() : 0
        const idx = dow === 0 ? 6 : dow - 1
        map[dias[idx]] = (map[dias[idx]] || 0) + f.valor_pago
      })
      return dias.map(label => ({label, valor: map[label]}))
    }
    if (periodo === 'mes' || periodo === 'dia') {
      const map: Record<string, number> = {}
      faturas.filter(f => f.status==='PAGA').forEach(f => {
        const label = f.data_consulta ? f.data_consulta.slice(5,10) : '??'
        map[label] = (map[label] || 0) + f.valor_pago
      })
      return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0])).map(([label, valor]) => ({label, valor}))
    }
    // ano - por mês
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const map: Record<string, number> = {}
    meses.forEach(m => map[m] = 0)
    faturas.filter(f => f.status==='PAGA').forEach(f => {
      const m = f.data_consulta ? new Date(f.data_consulta).getMonth() : 0
      map[meses[m]] = (map[meses[m]] || 0) + f.valor_pago
    })
    return meses.map(label => ({label, valor: map[label]}))
  }

  const totalRecebido  = faturas.filter(f => f.status==='PAGA').reduce((a,f) => a+f.valor_pago, 0)
  const totalPendente  = faturas.filter(f => f.status==='PENDENTE').reduce((a,f) => a+f.valor_bruto, 0)
  const qtdPagas       = faturas.filter(f => f.status==='PAGA').length
  const qtdPendentes   = faturas.filter(f => f.status==='PENDENTE').length
  const grupos         = agrupar()
  const maxGrupo       = Math.max(...grupos.map(g => g.valor), 1)

  const periodos: {key: Periodo; label: string; icon: any}[] = [
    {key:'hora',   label:'Hora a Hora', icon:Clock},
    {key:'dia',    label:'Diário',      icon:Calendar},
    {key:'semana', label:'Semanal',     icon:BarChart2},
    {key:'mes',    label:'Mensal',      icon:TrendingUp},
    {key:'ano',    label:'Anual',       icon:FileText},
  ]

  function labelPeriodo() {
    const { de, ate } = inicioFim(periodo, refData)
    const fmt = (s: string) => s.slice(0,10).split('-').reverse().join('/')
    if (periodo === 'dia' || periodo === 'hora') return fmt(de)
    return `${fmt(de)} a ${fmt(ate.slice(0,10))}`
  }

  function navegar(dir: number) {
    const d = new Date(refData + 'T12:00:00')
    if (periodo === 'hora' || periodo === 'dia') d.setDate(d.getDate() + dir)
    else if (periodo === 'semana') d.setDate(d.getDate() + dir * 7)
    else if (periodo === 'mes')    d.setMonth(d.getMonth() + dir)
    else                            d.setFullYear(d.getFullYear() + dir)
    setRefData(dataLocal(d))
  }

  function imprimirRelatorio() {
    setGerandoPDF(true)
    setTimeout(() => {
      window.print()
      setGerandoPDF(false)
    }, 300)
  }

  return (
    <div className="p-8 print:p-4">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Relatório Financeiro</h2>
          <p className="text-gray-500 text-sm mt-1">Receitas, pagamentos e inadimplência</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button onClick={carregar} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
          <button onClick={imprimirRelatorio} disabled={gerandoPDF}
            className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-60">
            <FileText className="w-4 h-4" /> {gerandoPDF ? 'Gerando...' : 'Imprimir / PDF'}
          </button>
        </div>
      </div>

      {/* Seletor de período */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 print:hidden">
        <div className="flex flex-wrap gap-2 mb-4">
          {periodos.map(p => {
            const Icon = p.icon
            return (
              <button key={p.key} onClick={() => setPeriodo(p.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  periodo === p.key
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                <Icon className="w-4 h-4" /> {p.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navegar(-1)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition">← Anterior</button>
          <span className="text-sm font-semibold text-gray-700 min-w-[180px] text-center">{labelPeriodo()}</span>
          <button onClick={() => navegar(1)}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition">Próximo →</button>
          <button onClick={() => setRefData(hoje)}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition">Hoje</button>
          <input type="date" value={refData} onChange={e => setRefData(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : (
        <>
          {/* Cards resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow">
              <div className="flex items-center gap-2 mb-2 opacity-80"><TrendingUp className="w-5 h-5" /><span className="text-xs font-medium uppercase tracking-wide">Receita Recebida</span></div>
              <p className="text-2xl font-extrabold">{fmt(totalRecebido)}</p>
              <p className="text-xs opacity-80 mt-1">{qtdPagas} fatura{qtdPagas!==1?'s':''} paga{qtdPagas!==1?'s':''}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow">
              <div className="flex items-center gap-2 mb-2 opacity-80"><AlertCircle className="w-5 h-5" /><span className="text-xs font-medium uppercase tracking-wide">A Receber</span></div>
              <p className="text-2xl font-extrabold">{fmt(totalPendente)}</p>
              <p className="text-xs opacity-80 mt-1">{qtdPendentes} fatura{qtdPendentes!==1?'s':''} pendente{qtdPendentes!==1?'s':''}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow">
              <div className="flex items-center gap-2 mb-2 opacity-80"><DollarSign className="w-5 h-5" /><span className="text-xs font-medium uppercase tracking-wide">Total Consultas</span></div>
              <p className="text-2xl font-extrabold">{fmtN(faturas.length)}</p>
              <p className="text-xs opacity-80 mt-1">Bruto: {fmt(faturas.reduce((a,f)=>a+f.valor_bruto,0))}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow">
              <div className="flex items-center gap-2 mb-2 opacity-80"><CheckCircle className="w-5 h-5" /><span className="text-xs font-medium uppercase tracking-wide">Taxa Recebimento</span></div>
              <p className="text-2xl font-extrabold">
                {faturas.length > 0 ? Math.round((qtdPagas / faturas.length) * 100) : 0}%
              </p>
              <p className="text-xs opacity-80 mt-1">{qtdPagas} de {faturas.length} pagas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Gráfico de barras */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-500" />
                Receita por {periodo === 'hora' ? 'Horário' : periodo === 'dia' ? 'Dia' : periodo === 'semana' ? 'Dia da Semana' : periodo === 'mes' ? 'Data' : 'Mês'}
              </h3>
              {grupos.length === 0 || grupos.every(g => g.valor === 0) ? (
                <p className="text-gray-400 text-sm py-8 text-center">Sem receitas no período selecionado.</p>
              ) : (
                <div className="space-y-2">
                  {grupos.filter(g => g.valor > 0 || periodo !== 'hora').map((g, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-12 text-right shrink-0">{g.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${Math.max((g.valor / maxGrupo) * 100, g.valor > 0 ? 2 : 0)}%` }}>
                          {g.valor > 0 && <span className="text-white text-xs font-bold">{fmt(g.valor)}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formas de pagamento */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" /> Por Forma de Pagamento
              </h3>
              {formas.length === 0 ? (
                <p className="text-gray-400 text-sm">Sem pagamentos no período.</p>
              ) : (
                <div className="space-y-3">
                  {formas.map((f, i) => {
                    const cores = ['bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500','bg-pink-500']
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{f.forma}</span>
                          <span className="text-sm font-bold text-gray-800">{fmt(f.total)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full ${cores[i % cores.length]}`}
                              style={{ width: `${(f.total / (formas[0]?.total || 1)) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{f.qtd}x</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tabela de faturas */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" /> Detalhamento das Faturas
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">{faturas.length}</span>
              </h3>
            </div>
            {faturas.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">Nenhuma fatura no período selecionado.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Nº Fatura','Paciente','Data Consulta','Valor','Status','Recebido'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {faturas.slice(0,100).map(f => (
                      <tr key={f.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3 font-mono text-xs text-gray-600">{f.numero}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">{f.paciente}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {f.data_consulta ? new Date(f.data_consulta).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '-'}
                        </td>
                        <td className="px-5 py-3 text-gray-700">{fmt(f.valor_bruto)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            f.status === 'PAGA'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {f.status === 'PAGA' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {f.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-bold" style={{color: f.status==='PAGA' ? '#16a34a' : '#9ca3af'}}>
                          {f.status === 'PAGA' ? fmt(f.valor_pago) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-100">
                    <tr>
                      <td colSpan={3} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total do período</td>
                      <td className="px-5 py-3 font-bold text-gray-800">{fmt(faturas.reduce((a,f)=>a+f.valor_bruto,0))}</td>
                      <td className="px-5 py-3 text-xs text-gray-500">{qtdPagas} pagas / {qtdPendentes} pendentes</td>
                      <td className="px-5 py-3 font-bold text-green-600">{fmt(totalRecebido)}</td>
                    </tr>
                  </tfoot>
                </table>
                {faturas.length > 100 && (
                  <p className="text-center text-xs text-gray-400 py-3">Exibindo primeiras 100 de {faturas.length} faturas</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
