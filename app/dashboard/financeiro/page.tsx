'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export default function FinanceiroPage() {
  const [mensal, setMensal]         = useState<any[]>([])
  const [inadimplencia, setInad]    = useState<any[]>([])
  const [formas, setFormas]         = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  useEffect(() => {
    async function load() {
      const [m, i, f] = await Promise.all([
        supabase.from('vw_financeiro_mensal').select('*').limit(6),
        supabase.from('vw_inadimplencia').select('*').limit(10),
        supabase.from('vw_pagamentos_por_forma').select('*').limit(10),
      ])
      setMensal(m.data || [])
      setInad(i.data || [])
      setFormas(f.data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>

  const totalMes  = mensal[0]?.receita_recebida || 0
  const totalInad = inadimplencia.reduce((acc, i) => acc + Number(i.valor_pendente), 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Financeiro</h2>
        <p className="text-gray-500 text-sm mt-1">Visão geral das receitas e inadimplência</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="p-3 bg-green-500 rounded-xl"><TrendingUp className="w-6 h-6 text-white" /></div>
          <div>
            <p className="text-sm text-gray-500">Receita do Mês</p>
            <p className="text-xl font-bold text-gray-800">{fmt(totalMes)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="p-3 bg-red-500 rounded-xl"><AlertCircle className="w-6 h-6 text-white" /></div>
          <div>
            <p className="text-sm text-gray-500">Em Inadimplência</p>
            <p className="text-xl font-bold text-gray-800">{fmt(totalInad)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-xl"><DollarSign className="w-6 h-6 text-white" /></div>
          <div>
            <p className="text-sm text-gray-500">Títulos Vencidos</p>
            <p className="text-xl font-bold text-gray-800">{inadimplencia.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> Receita Mensal
          </h3>
          {mensal.length === 0 ? (
            <p className="text-gray-400 text-sm">Sem dados financeiros ainda.</p>
          ) : (
            <div className="space-y-3">
              {mensal.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{m.periodo}</p>
                    <p className="text-xs text-gray-400">{m.total_faturas} faturas · {m.total_pacientes_atendidos} pacientes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{fmt(m.receita_recebida)}</p>
                    <p className="text-xs text-gray-400">bruto: {fmt(m.receita_bruta)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" /> Inadimplência
          </h3>
          {inadimplencia.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-5 h-5" /> Sem títulos vencidos!
            </div>
          ) : (
            <div className="space-y-3">
              {inadimplencia.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{item.paciente}</p>
                    <p className="text-xs text-gray-400">Fatura {item.numero_fatura} · {item.dias_atraso} dias em atraso</p>
                  </div>
                  <p className="text-sm font-bold text-red-600">{fmt(item.valor_pendente)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
