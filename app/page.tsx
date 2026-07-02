'use client'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Image from 'next/image'

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
    texto: '¿Recomendarías mi servicio a un amigo o familiar?',
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
  const etiquetas = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="text-5xl transition-all hover:scale-110 focus:outline-none"
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          >
            <span className={(hover || valor) >= n ? 'text-yellow-400' : 'text-gray-200'}>★</span>
          </button>
        ))}
      </div>
      <p className="text-sm font-medium text-gray-500 min-h-[20px]">
        {etiquetas[hover || valor] || ''}
      </p>
    </div>
  )
}

type Pregunta = typeof preguntas[number]

function PreguntaStep({
  pregunta,
  valor,
  onChange,
  onNext,
  onPrev,
  esUltima,
  paso,
  total,
  enviando,
  nombre,
}: {
  pregunta: Pregunta
  valor: string
  onChange: (v: string) => void
  onNext: () => void
  onPrev: () => void
  esUltima: boolean
  paso: number
  total: number
  enviando: boolean
  nombre: string
}) {
  const puedeAvanzar = 'opcional' in pregunta && pregunta.opcional ? true : !!valor

  return (
    <div className="flex flex-col min-h-0">
      {/* Progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Pregunta {paso} de {total}</span>
          <span>{Math.round((paso / total) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(paso / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Pregunta */}
      <div className="flex-1">
        <p className="text-lg font-semibold text-gray-800 mb-5 leading-snug">
          {pregunta.texto}
          {'opcional' in pregunta && pregunta.opcional && (
            <span className="ml-2 text-xs font-normal text-gray-400">(opcional)</span>
          )}
        </p>

        {'tipo' in pregunta && pregunta.tipo === 'opciones' && 'opciones' in pregunta && pregunta.opciones && (
          <div className="space-y-3">
            {pregunta.opciones.map(op => (
              <button
                key={op}
                type="button"
                onClick={() => onChange(op)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-sm font-medium transition-all ${
                  valor === op
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/40'
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        )}

        {'tipo' in pregunta && pregunta.tipo === 'estrellas' && (
          <Estrellas valor={parseInt(valor || '0')} onChange={v => onChange(String(v))} />
        )}

        {'tipo' in pregunta && pregunta.tipo === 'texto' && (
          <textarea
            value={valor}
            onChange={e => onChange(e.target.value)}
            placeholder={'placeholder' in pregunta ? pregunta.placeholder : ''}
            rows={4}
            autoFocus
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 resize-none transition-colors"
          />
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-6">
        {paso > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="px-5 py-3 rounded-2xl border-2 border-gray-200 text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            ← Atrás
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!puedeAvanzar || enviando}
          className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all ${
            puedeAvanzar && !enviando
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {enviando
            ? 'Enviando...'
            : esUltima
            ? `Enviar respuestas`
            : 'Siguiente →'}
        </button>
      </div>

      {!puedeAvanzar && pregunta.tipo !== 'texto' && (
        <p className="text-center text-xs text-gray-400 mt-3">Seleccioná una opción para continuar</p>
      )}
    </div>
  )
}

function EncuestaFlow({ nombre }: { nombre: string }) {
  const [paso, setPaso] = useState(0) // 0 = bienvenida
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const preguntaActual = preguntas[paso - 1]
  const esUltima = paso === preguntas.length

  function setRespuesta(id: string, valor: string) {
    setRespuestas(prev => ({ ...prev, [id]: valor }))
  }

  async function siguiente() {
    if (esUltima) {
      await enviar()
      return
    }
    setPaso(p => p + 1)
    setError('')
  }

  function anterior() {
    setPaso(p => Math.max(1, p - 1))
  }

  async function enviar() {
    setEnviando(true)
    setError('')
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

  // Pantalla de agradecimiento
  if (enviado) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          ¡Gracias, {nombre}!
        </h2>
        <p className="text-gray-500 leading-relaxed">
          Tu opinión es muy valiosa para mí.<br />
          Me ayuda a seguir mejorando y brindando<br />
          el mejor servicio posible.
        </p>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400 italic">— Deborah Piven</p>
          <p className="text-xs text-gray-300 mt-1">Remax Unico</p>
        </div>
      </div>
    )
  }

  // Pantalla de bienvenida
  if (paso === 0) {
    return (
      <div className="text-center">
        <div className="relative w-28 h-28 mx-auto mb-5">
          <Image
            src="/deborah.jpg"
            alt="Deborah Piven"
            fill
            className="rounded-full object-cover shadow-lg ring-4 ring-white"
            onError={() => {}}
          />
        </div>
        <p className="text-blue-600 font-medium text-xs uppercase tracking-widest mb-2">Deborah Piven Remax Unico</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {nombre !== 'Cliente' ? `Hola, ${nombre} 👋` : 'Hola! 👋'}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Fue un privilegio acompañarte en este proceso.<br />
          Si me regalás dos minutos para contarme tu experiencia, te lo voy a agradecer mucho.<br />
          <span className="text-gray-400">Tu opinión me ayuda a crecer y a ayudar a otros a elegir con confianza.</span>
        </p>
        <button
          onClick={() => setPaso(1)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-base transition-all shadow-md shadow-blue-200 active:scale-95"
        >
          Empezar encuesta →
        </button>
        <p className="text-xs text-gray-300 mt-4">Tu información es confidencial</p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
          {error}
        </div>
      )}
      <PreguntaStep
        pregunta={preguntaActual}
        valor={respuestas[preguntaActual.id] || ''}
        onChange={v => setRespuesta(preguntaActual.id, v)}
        onNext={siguiente}
        onPrev={anterior}
        esUltima={esUltima}
        paso={paso}
        total={preguntas.length}
        enviando={enviando}
        nombre={nombre}
      />
    </div>
  )
}

function EncuestaContent() {
  const params = useSearchParams()
  const nombreRaw = params.get('nombre') || 'cliente'
  const nombre = nombreRaw.charAt(0).toUpperCase() + nombreRaw.slice(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8">
          <EncuestaFlow nombre={nombre} />
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <Image src="/7.png" alt="Deborah Piven" width={80} height={80} className="object-contain opacity-80" />
          <Image src="/8.png" alt="Remax Unico" width={80} height={80} className="object-contain opacity-80" />
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-300 text-sm">Cargando...</div>
      </div>
    }>
      <EncuestaContent />
    </Suspense>
  )
}
