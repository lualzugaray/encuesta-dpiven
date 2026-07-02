import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import nodemailer from 'nodemailer'

const PREGUNTAS: Record<string, string> = {
  q1: '¿Qué buscabas al contactarte?',
  q2: 'Evaluación del asesoramiento (estrellas)',
  q3: '¿Qué destacás del proceso?',
  q4: '¿Recomendarías el servicio?',
  q5: '¿Algo más que agregar?',
  q6: '¿Podemos compartir en redes?',
}

async function guardarEnSheets(nombre: string, respuestas: Record<string, string>) {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  const sheetId = process.env.GOOGLE_SHEET_ID!

  const ahora = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })

  const fila = [
    ahora,
    nombre,
    respuestas.q1 || '',
    respuestas.q2 ? `${respuestas.q2} ⭐` : '',
    respuestas.q3 || '',
    respuestas.q4 || '',
    respuestas.q5 || '',
    respuestas.q6 || '',
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Encuestas!A:H',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [fila] },
  })
}

async function enviarEmail(nombre: string, respuestas: Record<string, string>) {
  const transporte = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
  })

  const filas = Object.entries(PREGUNTAS)
    .map(([id, pregunta]) => {
      const resp = respuestas[id]
      if (!resp) return ''
      const valorMostrado = id === 'q2' ? `${'⭐'.repeat(parseInt(resp))} (${resp}/5)` : resp
      return `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #e4e4e7;color:#52525b;font-size:13px;width:40%;">${pregunta}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e4e4e7;color:#18181b;font-size:13px;font-weight:500;">${valorMostrado}</td>
        </tr>`
    })
    .filter(Boolean)
    .join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f5;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#2563eb;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600;">Nueva encuesta recibida</h1>
      <p style="color:#bfdbfe;margin:4px 0 0;font-size:14px;">Deborah Piven Remax Unico</p>
    </div>
    <div style="padding:24px 32px;">
      <p style="color:#18181b;font-size:16px;margin:0 0 20px;">
        <strong style="color:#2563eb;">${nombre}</strong> completó la encuesta de satisfacción.
      </p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;">
        ${filas}
      </table>
    </div>
    <div style="padding:16px 32px 24px;border-top:1px solid #e4e4e7;">
      <p style="color:#71717a;font-size:12px;margin:0;">
        Recibido el ${new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })}
      </p>
    </div>
  </div>
</body>
</html>`

  const destinatarios = (process.env.DEBORAH_EMAIL || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)

  await transporte.sendMail({
    from: `"Encuesta Piven" <${process.env.GMAIL_USER}>`,
    to: destinatarios,
    subject: `Nueva encuesta de ${nombre}`,
    html,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, respuestas } = await req.json()

    if (!nombre || !respuestas) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const promesas: Promise<void>[] = []

    if (process.env.GOOGLE_SHEET_ID) {
      promesas.push(guardarEnSheets(nombre, respuestas))
    }

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      promesas.push(enviarEmail(nombre, respuestas))
    }

    await Promise.all(promesas)

    return NextResponse.json({ ok: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error en encuesta:', msg)
    return NextResponse.json({ error: 'Error al procesar la encuesta' }, { status: 500 })
  }
}
