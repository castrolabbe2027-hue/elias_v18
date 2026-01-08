import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

type InputImage = { pageNum?: number; dataUrl: string }

function safeJsonParse(text: string): any {
  const clean = String(text)
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    return JSON.parse(clean)
  } catch {}

  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return JSON.parse(clean.slice(start, end + 1))
  }
  throw new Error('No se pudo parsear JSON desde la respuesta del modelo')
}

function getApiKey() {
  return (
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY
  )
}

function stripDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)
  if (m) return { mimeType: m[1], base64: m[2] }
  // fallback: asumir PNG
  return { mimeType: 'image/png', base64: dataUrl }
}

export async function POST(request: NextRequest) {
  try {
    const { images, questionsCount, title, topic, subjectName } = (await request.json()) as {
      images: InputImage[]
      questionsCount?: number
      title?: string
      topic?: string
      subjectName?: string
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ success: false, error: 'Se requieren imágenes' }, { status: 400 })
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key no configurada', fallback: true }, { status: 200 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const qCount = typeof questionsCount === 'number' && questionsCount > 0 ? questionsCount : 0
    const contextLine = [title, subjectName, topic].filter(Boolean).join(' | ')

    const prompt = `ROL: Auditor Forense de Exámenes Escolares (Visión Artificial OMR).

CONTEXTO DE LA PRUEBA: ${contextLine || 'N/D'}
PREGUNTAS ESPERADAS: ${qCount || 'Se detectará automáticamente'}

## TAREA PRINCIPAL:
Analiza VISUALMENTE cada página para detectar TODAS las preguntas visibles.
⚠️ CRÍTICO: DEBES REPORTAR CADA PREGUNTA INDIVIDUALMENTE, del 1 al ${qCount > 0 ? qCount : 'último número visible'}.
NO AGRUPES, NO OMITAS, NO SALTES ninguna pregunta.

## 📋 PROTOCOLO DE DETECCIÓN SECUENCIAL:

### PASO 1: ESCANEO VISUAL COMPLETO
- Localiza TODAS las preguntas numeradas en el documento
- Cuenta cuántas preguntas hay en total
- Identifica la ubicación de cada una (arriba, medio, abajo de la página)

### PASO 2: ANÁLISIS PREGUNTA POR PREGUNTA
Para CADA pregunta del 1 al último número:
a) Localiza los paréntesis de V ( ) y F ( )
b) Mira DENTRO de cada paréntesis
c) ¿Hay una X, check, círculo o relleno? → ESA es la respuesta
d) ¿Ambos paréntesis están vacíos? → detected = null

### PASO 3: CLASIFICACIÓN DE MARCAS:
- "STRONG_X": Una X clara y fuerte dentro del paréntesis → VÁLIDA
- "CHECK": Un check/palomita ✓ visible → VÁLIDA  
- "CIRCLE": Círculo alrededor de V o F → VÁLIDA
- "FILL": Paréntesis rellenado/sombreado → VÁLIDA
- "EMPTY": Espacio en blanco, sin tinta → detected = null
- "WEAK_MARK": Garabato pequeño o dudoso → detected = null

### REGLAS PARA V/F:
- "V (X) F ( )" → detected = "V"
- "V ( ) F (X)" → detected = "F"  
- "V ( ) F ( )" → detected = null (AMBOS VACÍOS)
- "V (X) F (X)" → detected = null (DOBLE MARCA = INVALIDADO)

### ⚠️ REGLA ANTI-OMISIÓN:
- Si la prueba tiene ${qCount > 0 ? qCount : 'N'} preguntas, DEBES devolver ${qCount > 0 ? qCount : 'N'} entradas en "answers"
- Si la pregunta 3 tiene "V (X)", DEBES incluirla: {"questionNum": 3, "detected": "V", ...}
- NUNCA omitas una pregunta porque "parece similar" a otras
- Cada pregunta es ÚNICA e INDEPENDIENTE

### DETECCIÓN DE ESTUDIANTE:
- Busca "Nombre:", "Estudiante:" en el encabezado
- Busca "RUT:" seguido de números

## FORMATO DE RESPUESTA (JSON PURO):

{
  "questionsFoundInDocument": número_total_de_preguntas_detectadas,
  "pages": [
    {
      "pageIndex": 0,
      "pageNum": 1,
      "student": {
        "name": "Nombre del estudiante o null",
        "rut": "RUT o null"
      },
      "answers": [
        {"questionNum": 1, "evidence": "STRONG_X en paréntesis de F", "detected": "F", "points": 5},
        {"questionNum": 2, "evidence": "STRONG_X en paréntesis de V", "detected": "V", "points": 5},
        {"questionNum": 3, "evidence": "STRONG_X en paréntesis de V", "detected": "V", "points": 5},
        {"questionNum": 4, "evidence": "STRONG_X en paréntesis de V", "detected": "V", "points": 5},
        {"questionNum": 5, "evidence": "STRONG_X en paréntesis de F", "detected": "F", "points": 5},
        {"questionNum": 6, "evidence": "EMPTY - paréntesis vacíos", "detected": null, "points": null}
      ]
    }
  ]
}

## ⚠️ CHECKLIST FINAL ANTES DE RESPONDER:
1. ¿Incluí TODAS las preguntas del 1 al último número? ✓
2. ¿Cada pregunta tiene su entrada en "answers"? ✓
3. ¿Las preguntas con marca tienen detected = "V" o "F"? ✓
4. ¿Las preguntas sin marca tienen detected = null? ✓
5. ¿El JSON es válido, sin texto adicional? ✓

Devuelve SOLO JSON válido, sin markdown ni explicaciones.
`

    const parts: any[] = [{ text: prompt }]
    for (const img of images) {
      const { mimeType, base64 } = stripDataUrl(img.dataUrl)
      parts.push({
        inlineData: {
          mimeType,
          data: base64,
        },
      })
    }

    const result = await model.generateContent(parts)
    const response = await result.response
    const text = response.text()

    try {
      const analysis = safeJsonParse(text)
      return NextResponse.json({ success: true, analysis, rawResponse: text })
    } catch (parseError) {
      console.error('Error parseando respuesta de Gemini (visión):', parseError)
      return NextResponse.json({ success: false, error: 'Error parseando respuesta de IA', rawResponse: text }, { status: 200 })
    }
  } catch (error: any) {
    console.error('Error en análisis OCR visión:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al analizar OCR', fallback: true },
      { status: 500 }
    )
  }
}
