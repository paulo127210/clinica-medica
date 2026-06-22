'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, AlertTriangle, CheckCircle, Plus, Trash2, X } from 'lucide-react'

interface Produto {
  id: number
  nome: string
  unidade: string
  estoque_atual: number
  estoque_minimo: number
  valor_venda: number
  categorias_estoque?: { nome: string }
}

interface Categoria {
  id: number
  nome: string
}

const FORM_VAZIO = {
  nome: '',
  categoria_id: '',
  unidade: 'UN',
  estoque_minimo: '0',
  estoque_atual: '0',
  valor_custo: '0',
  valor_venda: '0',
  codigo_barras: '',
}

export default function EstoquePage() {
  const [critico, setCritico]       = useState<any[]>([])
  const [produtos, setProdutos]     = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading]       = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm]             = useState(FORM_VAZIO)
  const [salvando, setSalvando]     = useState(false)
  const [excluindo, setExcluindo]   = useState<number | null>(null)
  const [erro, setErro]             = useState('')

  async function carregar() {
    const [c, p, cat] = await Promise.all([
      supabase.from('vw_estoque_critico').select('*'),
      supabase.from('produtos').select('*, categorias_estoque(nome)').eq('ativo', true).order('nome').limit(100),
      supabase.from('categorias_estoque').select('id, nome').order('nome'),
    ])
    setCritico(c.data || [])
    setProdutos(p.data || [])
    setCategorias(cat.data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function abrirModal() {
    setForm(FORM_VAZIO)
    setErro('')
    setModalAberto(true)
  }

  async function salvar() {
    if (!form.nome.trim()) { setErro('Informe o nome do produto.'); return }
    if (!form.categoria_id) { setErro('Selecione uma categoria.'); return }
    setSalvando(true)
    setErro('')
    const { error } = await supabase.from('produtos').insert({
      nome:           form.nome.trim(),
      categoria_id:   Number(form.categoria_id),
      unidade:        form.unidade || 'UN',
      estoque_minimo: Number(form.estoque_minimo) || 0,
      estoque_atual:  Number(form.estoque_atual)  || 0,
      valor_custo:    Number(form.valor_custo)    || 0,
      valor_venda:    Number(form.valor_venda)    || 0,
      codigo_barras:  form.codigo_barras.trim() || null,
      ativo:          true,
    })
    setSalvando(false)
    if (error) { setErro('Erro ao salvar: ' + error.message); return }
    setModalAberto(false)
    carregar()
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este produto do estoque?')) return
    setExcluindo(id)
    await supabase.from('produtos').update({ ativo: false }).eq('id', id)
    setExcluindo(null)
    carregar()
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Estoque</h2>
          <p className="text-gray-500 text-sm mt-1">{produtos.length} produtos cadastrados · {critico.length} em nível crítico</p>
        </div>
        <button onClick={abrirModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition shadow">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
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
                {['Produto','Categoria','Estoque Atual','Estoque Mín.','Vlr. Venda','Status',''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {produtos.map((p) => {
                const isCritico = p.estoque_atual <= p.estoque_minimo
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{p.nome}</td>
                    <td className="px-5 py-3 text-gray-500">{p.categorias_estoque?.nome}</td>
                    <td className="px-5 py-3 font-bold" style={{ color: isCritico ? '#dc2626' : '#16a34a' }}>{p.estoque_atual} {p.unidade}</td>
                    <td className="px-5 py-3 text-gray-500">{p.estoque_minimo}</td>
                    <td className="px-5 py-3 text-gray-700">{fmt(p.valor_venda)}</td>
                    <td className="px-5 py-3">
                      {isCritico
                        ? <span className="flex items-center gap-1 text-red-600 text-xs font-medium"><AlertTriangle className="w-3.5 h-3.5" />Crítico</span>
                        : <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" />Normal</span>
                      }
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => excluir(p.id)} disabled={excluindo === p.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-40">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {produtos.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">Nenhum produto cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal novo produto */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" /> Novo Produto
              </h3>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome *</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Nome do produto"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria *</label>
                  <select value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500 bg-white">
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unidade</label>
                  <input value={form.unidade} onChange={e => setForm(f => ({ ...f, unidade: e.target.value }))}
                    placeholder="UN"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estoque Atual</label>
                  <input type="number" min="0" value={form.estoque_atual} onChange={e => setForm(f => ({ ...f, estoque_atual: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estoque Mínimo</label>
                  <input type="number" min="0" value={form.estoque_minimo} onChange={e => setForm(f => ({ ...f, estoque_minimo: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor Custo (R$)</label>
                  <input type="number" min="0" step="0.01" value={form.valor_custo} onChange={e => setForm(f => ({ ...f, valor_custo: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor Venda (R$)</label>
                  <input type="number" min="0" step="0.01" value={form.valor_venda} onChange={e => setForm(f => ({ ...f, valor_venda: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Código de Barras</label>
                <input value={form.codigo_barras} onChange={e => setForm(f => ({ ...f, codigo_barras: e.target.value }))}
                  placeholder="Opcional"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500" />
              </div>

              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition">
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60">
                {salvando ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
