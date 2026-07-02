'use client'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

const preguntas = [
  {
    id: 'q1',
    texto: '¿Qué buscabas al momento de ponerte en contacto conmigo?',
    tipo: 'opciones' as const,
    opciones: ['Vender una propiedad', 'Comprar una propiedad', 'Alquilar', 'Otro'],
  },
  {
    id: 'q2',
    texto: '¿Cómo evalúas mi asesoramiento en general?',
    tipo: 'estrellas' as const,
  },
  {
    id: 'q3',
    texto: '¿Qué fue lo que más destacás del proceso?',
    tipo: 'texto' as const,
    placeholder: 'Contanos con tus palabras...',
  },
  {
    id: 'q4',
    texto: '¿Recomendarías mi servicio a un amigo?',
    tipo: 'opciones' as const,
    opciones: ['Sí, definitivamente', 'Probablemente sí', 'No estoy seguro/a', 'Probablemente no'],
  },
  {
    id: 'q5',
    texto: '¿Querés agregar algo que no te haya preguntado?',
    tipo: 'texto' as const,
    placeholder: 'Cualquier comentario es bienvenido...',
    opcional: true,
  },
  {
    id: 'q6',
    texto: '¿Puedo compartir tus comentarios en redes sociales?',
    tipo: 'opciones' as const,
    opciones: ['Sí, con gusto', 'Sí, pero de forma anónima', 'Prefiero que no'],
  },
]

function Estrellas({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-2 mt-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="text-4xl transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
        >
          <span className={(hover || valor) >= n ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
      {valor > 0 && (
        <span className="self-center ml-2 text-sm text-gray-500">
          {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][valor]}
        </span>
      )}
    </div>
  )
}

function EncuestaForm({ nombre }: { nombre: string }) {
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  function setRespuesta(id: string, valor: string) {
    setRespuestas(prev => ({ ...prev, [id]: valor }))
  }

  function validar() {
    for (const p of preguntas) {
      if (!p.opcional && !respuestas[p.id]) return false
    }
    return true
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) {
      setError('Por favor respondé todas las preguntas obligatorias.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      const res = await fetch('/api/encuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, respuestas }),
      })
      if (res.ok) {
        setEnviado(true)
      } else {
        const json = await res.json()
        setError(json.error || 'Error al enviar. Intentá de nuevo.')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Muchas gracias, {nombre}!</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Tu opinión es muy valiosa para mí. Me ayuda a mejorar y seguir brindando el mejor servicio posible.
        </p>
        <p className="text-gray-500 text-sm mt-4">— Deborah Piven</p>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="space-y-8">
      {preguntas.map((p, idx) => (
        <div key={p.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="font-semibold text-gray-800 mb-1">
            <span className="text-blue-600 mr-2">{idx + 1}.</span>
            {p.texto}
            {!p.opcional && <span className="text-red-400 ml-1">*</span>}
          </p>

          {p.tipo === 'opciones' && p.opciones && (
            <div className="space-y-2 mt-3">
              {p.opciones.map(op => (
                <label key={op} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={p.id}
                    value={op}
                    checked={respuestas[p.id] === op}
                    onChange={() => setRespuesta(p.id, op)}
                    className="w-4 h-4 text-blue-600 accent-blue-600"
                  />
                  <span className={`text-sm transition-colors ${respuestas[p.id] === op ? 'text-blue-700 font-medium' : 'text-gray-700 group-hover:text-gray-900'}`}>
                    {op}
                  </span>
                </label>
              ))}
            </div>
          )}

          {p.tipo === 'estrellas' && (
            <Estrellas
              valor={parseInt(respuestas[p.id] || '0')}
              onChange={v => setRespuesta(p.id, String(v))}
            />
          )}

          {p.tipo === 'texto' && (
            <textarea
              value={respuestas[p.id] || ''}
              onChange={e => setRespuesta(p.id, e.target.value)}
              placeholder={'placeholder' in p ? p.placeholder : ''}
              rows={3}
              className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          )}
        </div>
      ))}

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-4 rounded-2xl text-base transition-colors shadow-md"
      >
        {enviando ? 'Enviando...' : 'Enviar respuestas'}
      </button>
    </form>
  )
}

function EncuestaContent() {
  const params = useSearchParams()
  const nombre = params.get('nombre') || 'cliente'
  const nombreMostrado = nombre.charAt(0).toUpperCase() + nombre.slice(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-blue-600 font-medium text-sm uppercase tracking-wider mb-1">Deborah Piven Inmuebles</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hola, {nombreMostrado} 👋
          </h1>
          <p className="text-gray-600 text-base">
            Me gustaría conocer tu experiencia. Solo te llevará un par de minutos.
          </p>
        </div>
        <EncuestaForm nombre={nombreMostrado} />
        <p className="text-center text-xs text-gray-400 mt-8">
          Remax Uruguay · Deborah Piven · Tu información es confidencial
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-gray-400">Cargando...</div>
      </div>
    }>
      <EncuestaContent />
    </Suspense>
  )
}
