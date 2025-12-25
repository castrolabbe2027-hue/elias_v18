import { NextRequest, NextResponse } from 'next/server';
import { bookPDFs } from '@/lib/books-data';

// Helper function to extract Google Drive file ID from various URL formats
function extractGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)\//,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Generate mock PDF content based on book, subject, and specific topic
function generateMockPDFContent(book: any, topic?: string): string {
  const { course, subject, title } = book;
  
  // Create topic-specific content if topic is provided
  if (topic) {
    const topicContent = generateTopicSpecificContent(subject, topic, course);
    return `
Contenido educativo de ${title}
Curso: ${course}
Materia: ${subject}

TEMA ESPECÍFICO: ${topic}

${topicContent}

El material está actualizado según los estándares curriculares vigentes para ${course}.
Los conceptos se presentan con ejemplos relevantes y contextualizados para ${topic}.
`;
  }
  
  // Fallback to general content if no topic provided
  const mockContent = `
Contenido educativo de ${title}
Curso: ${course}
Materia: ${subject}

Este libro contiene conceptos fundamentales y avanzados relacionados con ${subject} para estudiantes de ${course}.

Los temas principales incluyen:
- Conceptos básicos y definiciones importantes
- Ejemplos prácticos y casos de estudio
- Ejercicios y actividades de refuerzo
- Metodologías de aprendizaje específicas

El contenido está estructurado de manera progresiva, desde conceptos básicos hasta aplicaciones más complejas.
Los estudiantes pueden utilizar este material para reforzar su comprensión y prepararse para evaluaciones.

Cada capítulo incluye objetivos de aprendizaje claros y actividades de autoevaluación.
Se recomienda complementar el estudio con práctica adicional y discusión en grupo.

El material está actualizado según los estándares curriculares vigentes para ${course}.
Los conceptos se presentan con ejemplos relevantes y contextualizados.
`;

  return mockContent.trim();
}

// Generate topic-specific content based on subject and topic
function generateTopicSpecificContent(subject: string, topic: string, course: string): string {
  const topicNormalized = topic.toLowerCase();
  
  // Ciencias Naturales topics
  if (subject.toLowerCase().includes('ciencias naturales') || subject.toLowerCase().includes('biología')) {
    if (topicNormalized.includes('sistema respiratorio') || topicNormalized.includes('respiratorio')) {
      return `
SISTEMA RESPIRATORIO - Contenido Educativo

El sistema respiratorio es el conjunto de órganos responsables del intercambio gaseoso entre el organismo y el medio ambiente.

ÓRGANOS DEL SISTEMA RESPIRATORIO:
- Fosas nasales: Filtran, calientan y humedecen el aire que ingresa al cuerpo
- Faringe: Conducto compartido con el sistema digestivo que permite el paso del aire
- Laringe: Órgano que contiene las cuerdas vocales y permite la fonación
- Tráquea: Tubo cartilaginoso que conduce el aire hacia los bronquios
- Bronquios: Ramificaciones de la tráquea que ingresan a cada pulmón
- Bronquiolos: Conductos más pequeños dentro de los pulmones
- Alvéolos pulmonares: Pequeñas cavidades donde ocurre el intercambio gaseoso
- Pulmones: Órganos principales del sistema, ubicados en la cavidad torácica
- Diafragma: Músculo que permite los movimientos respiratorios

PROCESO DE RESPIRACIÓN:
La respiración consta de dos fases principales:
1. Inspiración: El diafragma se contrae y desciende, permitiendo la entrada de aire rico en oxígeno
2. Espiración: El diafragma se relaja y asciende, expulsando el aire rico en dióxido de carbono

INTERCAMBIO GASEOSO:
- Ocurre en los alvéolos pulmonares
- El oxígeno pasa de los alvéolos a la sangre a través de difusión
- El dióxido de carbono pasa de la sangre a los alvéolos para ser eliminado
- Este proceso es fundamental para la vida celular

CUIDADOS DEL SISTEMA RESPIRATORIO:
- Evitar ambientes con aire contaminado
- No fumar ni exponerse al humo del tabaco
- Realizar ejercicio físico regularmente
- Mantener una buena higiene respiratoria
- Ventilar adecuadamente los espacios cerrados

ENFERMEDADES COMUNES:
- Asma: Inflamación crónica de las vías respiratorias
- Bronquitis: Inflamación de los bronquios
- Neumonía: Infección de los pulmones
- Gripe: Infección viral del sistema respiratorio
`;
    }
    
    if (topicNormalized.includes('célula') || topicNormalized.includes('celular')) {
      return `
LA CÉLULA - Unidad Básica de la Vida

La célula es la unidad estructural y funcional de todos los seres vivos. Es la estructura más pequeña capaz de realizar todas las funciones vitales.

TIPOS DE CÉLULAS:
1. Células procariotas: No poseen núcleo definido (bacterias, arqueas)
2. Células eucariotas: Poseen núcleo definido (plantas, animales, hongos)

PARTES DE LA CÉLULA EUCARIOTA:
- Membrana celular: Controla el paso de sustancias hacia dentro y fuera de la célula
- Citoplasma: Medio gelatinoso donde se encuentran los organelos
- Núcleo: Contiene el material genético (ADN) y controla las funciones celulares
- Mitocondrias: Producen energía para la célula mediante respiración celular
- Ribosomas: Sintetizan proteínas siguiendo las instrucciones del ADN
- Retículo endoplasmático: Transporta sustancias dentro de la célula
- Aparato de Golgi: Empaqueta y distribuye proteínas

ORGANELOS EXCLUSIVOS DE CÉLULAS VEGETALES:
- Pared celular: Estructura rígida que brinda protección y soporte
- Cloroplastos: Realizan la fotosíntesis para producir alimento
- Vacuola central: Almacena agua, nutrientes y desechos

FUNCIONES CELULARES:
- Nutrición: Obtención y procesamiento de nutrientes
- Respiración celular: Obtención de energía a partir de nutrientes
- Reproducción: División celular (mitosis y meiosis)
- Excreción: Eliminación de sustancias de desecho
- Relación: Respuesta a estímulos del ambiente
`;
    }
    
    if (topicNormalized.includes('fotosíntesis') || topicNormalized.includes('fotosintesis')) {
      return `
LA FOTOSÍNTESIS - Proceso Vital de las Plantas

La fotosíntesis es el proceso mediante el cual las plantas, algas y algunas bacterias transforman la energía luminosa en energía química.

ECUACIÓN DE LA FOTOSÍNTESIS:
6CO₂ + 6H₂O + Luz solar → C₆H₁₂O₆ + 6O₂
(Dióxido de carbono + Agua + Energía → Glucosa + Oxígeno)

FASES DE LA FOTOSÍNTESIS:
1. Fase luminosa: Ocurre en los tilacoides del cloroplasto
   - Captura de energía solar por la clorofila
   - Ruptura de moléculas de agua (fotólisis)
   - Producción de ATP y NADPH

2. Fase oscura (Ciclo de Calvin): Ocurre en el estroma del cloroplasto
   - Fijación del CO₂
   - Síntesis de glucosa
   - No requiere luz directa pero necesita productos de la fase luminosa

ESTRUCTURAS INVOLUCRADAS:
- Cloroplastos: Organelos donde ocurre la fotosíntesis
- Clorofila: Pigmento verde que captura la luz
- Estomas: Poros en las hojas para intercambio de gases
- Tilacoides: Membranas donde ocurre la fase luminosa

IMPORTANCIA DE LA FOTOSÍNTESIS:
- Produce oxígeno que respiramos
- Es la base de las cadenas alimenticias
- Regula el CO₂ atmosférico
- Produce la materia orgánica del planeta
`;
    }
  }
  
  // Matemáticas topics
  if (subject.toLowerCase().includes('matemáticas') || subject.toLowerCase().includes('matemática')) {
    if (topicNormalized.includes('fracción') || topicNormalized.includes('fracciones')) {
      return `
LAS FRACCIONES - Conceptos y Operaciones

Una fracción representa una o más partes iguales de una unidad dividida en partes iguales.

COMPONENTES DE UNA FRACCIÓN:
- Numerador: Número superior, indica cuántas partes se toman
- Denominador: Número inferior, indica en cuántas partes se divide el todo
- Línea de fracción: Separa el numerador del denominador

TIPOS DE FRACCIONES:
1. Fracciones propias: El numerador es menor que el denominador (1/2, 3/4, 5/8)
2. Fracciones impropias: El numerador es mayor o igual al denominador (5/3, 7/2, 9/4)
3. Números mixtos: Combinan un entero y una fracción (2 1/3, 3 1/4)
4. Fracciones equivalentes: Representan la misma cantidad (1/2 = 2/4 = 3/6)

OPERACIONES CON FRACCIONES:
SUMA Y RESTA:
- Con igual denominador: Se suman/restan los numeradores
- Con diferente denominador: Primero se busca un denominador común

MULTIPLICACIÓN:
- Se multiplican numeradores entre sí
- Se multiplican denominadores entre sí
- Se simplifica si es posible

DIVISIÓN:
- Se multiplica por el recíproco (fracción invertida)
- Ejemplo: (2/3) ÷ (4/5) = (2/3) × (5/4) = 10/12 = 5/6

SIMPLIFICACIÓN:
- Dividir numerador y denominador por su MCD
- Una fracción está simplificada cuando no se puede reducir más
`;
    }
    
    if (topicNormalized.includes('ecuacion') || topicNormalized.includes('ecuaciones')) {
      return `
ECUACIONES - Fundamentos y Resolución

Una ecuación es una igualdad matemática que contiene una o más incógnitas.

ELEMENTOS DE UNA ECUACIÓN:
- Miembros: Las expresiones a cada lado del signo igual
- Términos: Cada sumando de la ecuación
- Incógnita: La variable que se debe encontrar (generalmente x, y, z)
- Coeficientes: Números que multiplican a las variables

TIPOS DE ECUACIONES:
1. Ecuaciones de primer grado: ax + b = 0
2. Ecuaciones de segundo grado: ax² + bx + c = 0
3. Sistemas de ecuaciones: Múltiples ecuaciones con múltiples incógnitas

PROPIEDADES DE LAS ECUACIONES:
- Se puede sumar/restar el mismo número a ambos miembros
- Se puede multiplicar/dividir ambos miembros por el mismo número (≠0)
- El objetivo es despejar la incógnita

PASOS PARA RESOLVER ECUACIONES DE PRIMER GRADO:
1. Eliminar paréntesis si los hay
2. Agrupar términos con variable a un lado
3. Agrupar términos independientes al otro lado
4. Simplificar ambos miembros
5. Despejar la variable

VERIFICACIÓN:
Siempre sustituir el valor encontrado en la ecuación original para comprobar
`;
    }
  }
  
  // Historia topics
  if (subject.toLowerCase().includes('historia') || subject.toLowerCase().includes('sociales')) {
    if (topicNormalized.includes('independencia') || topicNormalized.includes('emancipación')) {
      return `
LA INDEPENDENCIA DE CHILE - Proceso Histórico

El proceso de independencia de Chile fue el período histórico que llevó al país a separarse del dominio español.

ANTECEDENTES:
- Descontento criollo por restricciones comerciales
- Ideas ilustradas de libertad e igualdad
- Invasión napoleónica a España (1808)
- Formación de juntas de gobierno en América

ETAPAS DE LA INDEPENDENCIA:
1. PATRIA VIEJA (1810-1814)
- Primera Junta Nacional de Gobierno (18 de septiembre de 1810)
- Primer Congreso Nacional (1811)
- Gobierno de José Miguel Carrera
- Desastre de Rancagua (1814)

2. RECONQUISTA ESPAÑOLA (1814-1817)
- Restauración del dominio español
- Represión a los patriotas
- Exilio de patriotas a Argentina

3. PATRIA NUEVA (1817-1823)
- Cruce de los Andes por el Ejército Libertador
- Batalla de Chacabuco (12 de febrero de 1817)
- Proclamación de la Independencia (12 de febrero de 1818)
- Gobierno de Bernardo O'Higgins

PERSONAJES IMPORTANTES:
- Bernardo O'Higgins: Padre de la Patria
- José de San Martín: Libertador de Argentina, Chile y Perú
- José Miguel Carrera: Líder de la Patria Vieja
- Manuel Rodríguez: Guerrillero patriota
`;
    }
  }
  
  // Lenguaje topics
  if (subject.toLowerCase().includes('lenguaje') || subject.toLowerCase().includes('comunicación')) {
    if (topicNormalized.includes('sustantivo') || topicNormalized.includes('sustantivos')) {
      return `
EL SUSTANTIVO - Clases de Palabras

El sustantivo es la palabra que sirve para nombrar personas, animales, cosas, lugares, sentimientos o ideas.

CLASIFICACIÓN DE SUSTANTIVOS:

POR SU SIGNIFICADO:
- Sustantivos comunes: Nombran de forma general (perro, ciudad, libro)
- Sustantivos propios: Nombran de forma específica (Pedro, Chile, Andes)

POR SU EXTENSIÓN:
- Sustantivos individuales: Nombran un solo elemento (árbol, abeja)
- Sustantivos colectivos: Nombran un conjunto (bosque, enjambre)

POR SU NATURALEZA:
- Sustantivos concretos: Se perciben con los sentidos (mesa, flor, música)
- Sustantivos abstractos: No se perciben con los sentidos (amor, libertad, justicia)

GÉNERO DE LOS SUSTANTIVOS:
- Masculino: Generalmente terminan en -o (niño, perro, libro)
- Femenino: Generalmente terminan en -a (niña, perra, casa)
- Excepciones: el día, el mapa, la mano, la radio

NÚMERO DE LOS SUSTANTIVOS:
- Singular: Indica uno solo (gato, flor)
- Plural: Indica más de uno (gatos, flores)
- Formación del plural: +s después de vocal, +es después de consonante

FUNCIÓN EN LA ORACIÓN:
- Puede ser sujeto de la oración
- Puede ser complemento del verbo
- Puede ir acompañado de artículos y adjetivos
`;
    }
    
    if (topicNormalized.includes('verbo') || topicNormalized.includes('verbos')) {
      return `
EL VERBO - Núcleo del Predicado

El verbo es la palabra que expresa acción, estado o proceso. Es la palabra más importante del predicado.

ACCIDENTES DEL VERBO:
1. PERSONA: Primera (yo, nosotros), Segunda (tú, ustedes), Tercera (él, ellos)
2. NÚMERO: Singular y Plural
3. TIEMPO: Presente, Pasado, Futuro
4. MODO: Indicativo, Subjuntivo, Imperativo

TIEMPOS VERBALES SIMPLES:
- Presente: Indica acción actual (yo camino, tú estudias)
- Pretérito: Indica acción pasada (yo caminé, tú estudiaste)
- Futuro: Indica acción por venir (yo caminaré, tú estudiarás)

TIEMPOS VERBALES COMPUESTOS:
- Pretérito perfecto: He caminado, has estudiado
- Pretérito pluscuamperfecto: Había caminado
- Futuro perfecto: Habré caminado

CONJUGACIONES VERBALES:
- Primera conjugación: Verbos terminados en -AR (amar, cantar)
- Segunda conjugación: Verbos terminados en -ER (comer, beber)
- Tercera conjugación: Verbos terminados en -IR (vivir, partir)

VERBOS REGULARES E IRREGULARES:
- Regulares: Siguen el modelo de conjugación (amar, comer, vivir)
- Irregulares: Cambian su raíz o desinencia (ser, ir, tener, hacer)
`;
    }
  }
  
  // Fallback genérico pero informativo
  return `
CONTENIDO EDUCATIVO: ${topic.toUpperCase()}
Asignatura: ${subject}
Curso: ${course}

INTRODUCCIÓN:
Este tema es parte fundamental del currículo educativo y tiene como objetivo desarrollar competencias específicas en los estudiantes.

CONCEPTOS CLAVE:
- Definición y características principales del tema
- Elementos fundamentales que lo componen
- Relación con otros temas de la asignatura
- Aplicaciones prácticas en la vida cotidiana

OBJETIVOS DE APRENDIZAJE:
1. Comprender los conceptos básicos relacionados con ${topic}
2. Identificar los elementos principales del tema
3. Aplicar los conocimientos en situaciones prácticas
4. Relacionar el tema con otros contenidos de ${subject}

DESARROLLO DEL CONTENIDO:
El estudio de ${topic} requiere una comprensión progresiva de sus componentes. Los estudiantes deben ser capaces de identificar, analizar y aplicar estos conocimientos.

ACTIVIDADES SUGERIDAS:
- Lectura comprensiva del material
- Ejercicios prácticos
- Trabajo colaborativo
- Evaluación formativa

IMPORTANCIA:
El dominio de este tema permite a los estudiantes avanzar en su comprensión de ${subject} y desarrollar habilidades de pensamiento crítico.
`;
}

// Function to simulate PDF content extraction
async function simulatePDFContentExtraction(driveId: string, book: any, topic?: string): Promise<string> {
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock content based on the book information and topic
    const mockContent = generateMockPDFContent(book, topic);
    
    return `${mockContent}\n\n[Contenido extraído del PDF ID: ${driveId}]`;
    
  } catch (error) {
    console.error('Error simulating PDF content extraction:', error);
    return `Contenido de referencia para ${book.title}. El PDF está disponible pero no se pudo extraer el contenido completo. Materia: ${book.subject}, Curso: ${book.course}.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookTitle, subject, course, topic } = body || {};

    if (!bookTitle && !(subject && course)) {
      return NextResponse.json(
        { error: 'bookTitle or (subject + course) is required' },
        { status: 400 }
      );
    }

    // Resolve book by exact title, otherwise by subject+course, otherwise by best-effort matching
    const normalize = (s: string) => (s || '').trim().toLowerCase();

    let book = bookPDFs.find(b => normalize(b.title) === normalize(bookTitle || ''));
    let matchedBy: 'title' | 'subject-course' | 'subject' | 'fallback' | undefined;

    if (book) {
      matchedBy = 'title';
    } else if (subject && course) {
      book = bookPDFs.find(b => normalize(b.course) === normalize(course) && normalize(b.subject) === normalize(subject));
      if (!book) {
        // intentar por coincidencia parcial del subject dentro del curso
        book = bookPDFs.find(b => normalize(b.course) === normalize(course) && normalize(b.subject).includes(normalize(subject)));
      }
      if (book) matchedBy = 'subject-course';
    }

    // Si aún no se encuentra, intentar por subject solo (primer match)
    if (!book && subject) {
      book = bookPDFs.find(b => normalize(b.subject) === normalize(subject)) ||
             bookPDFs.find(b => normalize(b.subject).includes(normalize(subject!)));
      if (book) matchedBy = 'subject';
    }

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found', details: { bookTitle, subject, course } },
        { status: 404 }
      );
    }
    
    // Extract Google Drive file ID
    const driveId = book.driveId || extractGoogleDriveFileId(book.pdfUrl);
    
    if (!driveId) {
      return NextResponse.json(
        { error: 'Invalid PDF URL format' },
        { status: 400 }
      );
    }
    
    // Simulate PDF content extraction with topic-specific content
    const pdfContent = await simulatePDFContentExtraction(driveId, book, topic);
    
    return NextResponse.json({
      success: true,
      bookTitle: book.title,
      course: book.course,
      subject: book.subject,
      pdfContent: pdfContent,
      driveId: driveId,
      matchedBy,
      topicRequested: topic
    });
    
  } catch (error) {
    console.error('Error in extract-pdf-content API:', error);
    return NextResponse.json(
      { error: 'Failed to extract PDF content' },
      { status: 500 }
    );
  }
}
