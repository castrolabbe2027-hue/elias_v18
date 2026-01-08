import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuración del Route Segment para App Router
export const maxDuration = 60; // Máximo tiempo de ejecución en segundos
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, questions, pageNumber, focusQuestionNums } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'La imagen es requerida' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ Clave de Gemini no configurada para análisis OMR');
      return NextResponse.json({ success: false, error: 'API key no configurada', fallback: true });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 1. LIMPIEZA CRÍTICA DEL BASE64
    // Si el string viene con "data:image/png;base64,..." hay que quitarlo.
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    // 2. CONSTRUCCIÓN DEL CONTEXTO (PREGUNTAS)
    const questionsContext = Array.isArray(questions) && questions.length > 0
      ? `ESTRUCTURA ESPERADA DE LA PRUEBA (Úsala como guía de ubicación):
         ${questions.map((q: any, i: number) => {
           if (q.type === 'tf') {
             return `P${i+1}: [Verdadero/Falso] - "${q.text?.substring(0, 50)}..."`
           } else if (q.type === 'mc') {
             const opts = (q.options || []).map((o: string, j: number) => `${String.fromCharCode(65+j)}) ${o?.substring(0, 15)}`).join(', ')
             return `P${i+1}: [Opción Múltiple: ${opts}] - "${q.text?.substring(0, 40)}..."`
           }
           return `P${i+1}: [Otro tipo]`
         }).join('\n         ')}`
      : 'Estructura genérica: Busca preguntas numeradas.';

    const focusNums: number[] = Array.isArray(focusQuestionNums)
      ? focusQuestionNums.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n) && n > 0)
      : [];
    const focusLine = focusNums.length > 0
      ? `\n\nMODO RE-CHEQUEO (FOCO): Analiza SOLO estas preguntas: ${focusNums.join(', ')}.\n- Ignora el resto del documento.\n- NO devuelvas preguntas fuera del foco.\n- Devuelve exactamente esas preguntas en "answers" (una entrada por cada número solicitado).\n`
      : '';

    const totalQuestions = Array.isArray(questions) ? questions.length : 0;

    // 3. PROMPT MEJORADO - ANTI-OMISIÓN
    const prompt = `
ROL: Auditor Forense de Exámenes Escolares (Visión Artificial OMR).

TAREA: Analizar la imagen y extraer TODAS las preguntas visibles.
⚠️ CRÍTICO: DEBES REPORTAR CADA PREGUNTA DEL 1 AL ${totalQuestions > 0 ? totalQuestions : 'ÚLTIMO NÚMERO VISIBLE'}.

${focusLine}

${questionsContext}

## 📋 PROTOCOLO DE DETECCIÓN SECUENCIAL:

### PASO 1: LOCALIZAR TODAS LAS PREGUNTAS
- Escanea el documento de arriba a abajo
- Identifica CADA pregunta numerada (1, 2, 3, 4, 5, ...)
- Cuenta el total de preguntas

### PASO 2: ANALIZAR CADA PREGUNTA INDIVIDUALMENTE
Para CADA pregunta del 1 al último número:
a) Localiza los paréntesis: V ( ) y F ( )
b) Mira DENTRO de cada paréntesis
c) ¿Hay una X, check o círculo? → ESA es la respuesta
d) ¿Ambos vacíos? → val = null

### PASO 3: CLASIFICAR LA MARCA
- "STRONG_X": X clara dentro del paréntesis → val = "V" o "F"
- "CHECK": Check/palomita ✓ → val = "V" o "F"
- "CIRCLE": Círculo alrededor → val = "V" o "F"
- "EMPTY": Sin marca → val = null

### REGLAS V/F:
- "V (X) F ( )" → val = "V"
- "V ( ) F (X)" → val = "F"
- "V ( ) F ( )" → val = null (SIN RESPUESTA)

### ⚠️ REGLA ANTI-OMISIÓN (MUY IMPORTANTE):
- Si hay ${totalQuestions > 0 ? totalQuestions : 'N'} preguntas, DEBES devolver ${totalQuestions > 0 ? totalQuestions : 'N'} entradas en "answers"
- EJEMPLO: Si pregunta 3 tiene "V (X)", DEBES incluir: {"q": 3, "evidence": "STRONG_X en V", "val": "V"}
- NUNCA omitas una pregunta aunque "parezca similar" a otras
- Si no ves marca clara en una pregunta → val = null (pero INCLÚYELA)

### DETECCIÓN DE ESTUDIANTE:
- Busca "Nombre:", "Estudiante:" seguido de texto
- Busca "RUT:" seguido de números

## FORMATO DE SALIDA (JSON PURO):
{
  "studentName": "Nombre detectado o null",
  "rut": "RUT detectado o null",
  "questionsFound": número_total_de_preguntas,
  "answers": [
    { "q": 1, "evidence": "STRONG_X en paréntesis de F", "val": "F" },
    { "q": 2, "evidence": "STRONG_X en paréntesis de V", "val": "V" },
    { "q": 3, "evidence": "STRONG_X en paréntesis de V", "val": "V" },
    { "q": 4, "evidence": "STRONG_X en paréntesis de F", "val": "F" },
    { "q": 5, "evidence": "EMPTY - paréntesis vacíos", "val": null },
    { "q": 6, "evidence": "STRONG_X en paréntesis de V", "val": "V" }
  ],
  "confidence": "High"
}

## ⚠️ CHECKLIST ANTES DE RESPONDER:
1. ¿Incluí TODAS las preguntas del 1 al ${totalQuestions > 0 ? totalQuestions : 'último'}? ✓
2. ¿Cada pregunta tiene su entrada en "answers"? ✓
3. ¿Las preguntas con marca tienen val = "V" o "F"? ✓
4. ¿Las preguntas sin marca tienen val = null? ✓

Devuelve SOLO JSON válido.
`;

    // 4. PREPARACIÓN MULTIMODAL
    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: 'image/jpeg',
      },
    };

    // 5. GENERACIÓN
    console.log(`[OMR] 🔍 Analizando página ${pageNumber || 'N/A'} con Gemini Vision...`);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log(`[OMR] 📝 Respuesta raw:`, text.substring(0, 500));

    // 6. PARSEO SEGURO
    try {
      const jsonString = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(jsonString);
      
      console.log(`[OMR] ✅ Página ${pageNumber}: ${analysis.questionsFound || 0} preguntas, ${analysis.answers?.filter((a: any) => a.val !== null).length || 0} respondidas`);
      
      return NextResponse.json({
        success: true,
        analysis,
        pageNumber
      });
    } catch (parseError: any) {
      console.error('[OMR] ❌ Error parseando JSON:', parseError.message);
      console.error('[OMR] Texto recibido:', text);
      return NextResponse.json({
        success: false,
        error: 'Error parseando respuesta de IA',
        rawResponse: text
      });
    }

  } catch (error: any) {
    console.error('[OMR] ❌ Error general:', error);
    return NextResponse.json(
      { success: false, error: error.message, fallback: true },
      { status: 500 }
    );
  }
}
