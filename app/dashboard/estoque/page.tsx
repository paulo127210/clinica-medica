'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, AlertTriangle, CheckCircle } from 'lucide-react'

export default function EstoquePage() {
  const [critico, setCritico]   = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const [c, p] = await Promise.all([
        supabase.from('vw_estoque_critico').select('*'),
        supabase.from('produtos').select('*, categorias_estoque(nome)').eq('ativo', true).order('nome').limit(50),
      ])
      setCritico(c.data || [])
      setProdutos(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Estoque</h2>
        <p className="text-gray-500 text-sm mt-1">{produtos.length} produtos cadastrados · {critico.length} em nível crítico</p>
      </div>

      {critico.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" /> Produtos em Estoque Crítico
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {critico.map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-red-100 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.nome}</p>
                  <p className="text-xs text-gray-400">{item.categoria} · {item.fornecedor || 'Sem fornecedor'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{item.estoque_atual} {item.unidade}</p>
                  <p className="text-xs text-gray-400">mín: {item.estoque_minimo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Produto','Categoria','Estoque Atual','Estoque Mín.','Vlr. Venda','Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {produtos.map((p: any, i) => {
                const critico = p.estoque_atual <= p.estoque_minimo
                return (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{p.nome}</td>
                    <td className="px-5 py-3 text-gray-500">{p.categorias_estoque?.nome}</td>
                    <td className="px-5 py-3 font-bold" style={{ color: critico ? '#dc2626' : '#16a34a' }}>{p.estoque_atual} {p.unidade}</td>
                    <td className="px-5 py-3 text-gray-500">{p.estoque_minimo}</td>
                    <td className="px-5 py-3 text-gray-700">{fmt(p.valor_venda)}</td>
                    <td className="px-5 py-3">
                      {critico
                        ? <span className="flex items-center gap-1 text-red-600 text-xs font-medium"><AlertTriangle className="w-3.5 h-3.5" />Crítico</span>
                        : <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" />Normal</span>
                      }
                    </td>
                  </tr>
                )
              })}
              {produtos.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Nenhum produto cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
