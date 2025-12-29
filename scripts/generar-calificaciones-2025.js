/**
 * Script para generar archivo CSV de calificaciones 2025
 * 
 * Especificaciones:
 * - Para todos los estudiantes del archivo users-consolidated-2025-CORREGIDO_v3.1.csv
 * - Calificaciones de 0 a 100
 * - 10 actividades por semestre (20 total por estudiante por asignatura)
 * - 1er semestre: marzo a junio
 * - 2do semestre: julio a diciembre
 * - Tipos: Tarea, Evaluación, Prueba
 * - Entre 70-80% aprobados (nota >= 60)
 */

const fs = require('fs');
const path = require('path');

// Configuración
const YEAR = 2025;
const ACTIVITIES_PER_SEMESTER = 10;
const APPROVAL_RATE_MIN = 0.70;
const APPROVAL_RATE_MAX = 0.80;
const PASSING_GRADE = 60;

// Rangos de fechas por semestre
const SEMESTER_1 = {
  start: new Date(2025, 2, 1),  // Marzo 1
  end: new Date(2025, 5, 30)    // Junio 30
};

const SEMESTER_2 = {
  start: new Date(2025, 6, 1),   // Julio 1
  end: new Date(2025, 11, 20)    // Diciembre 20
};

// Tipos de actividades con distribución
const ACTIVITY_TYPES = [
  { type: 'Tarea', count: 4 },      // 4 tareas por semestre
  { type: 'Evaluación', count: 3 }, // 3 evaluaciones por semestre
  { type: 'Prueba', count: 3 }      // 3 pruebas por semestre
];

// Asignaturas por nivel
const SUBJECTS_BASICA = [
  'Lenguaje y Comunicación',
  'Matemáticas',
  'Ciencias Naturales',
  'Historia y Geografía'
];

const SUBJECTS_MEDIA = [
  'Lenguaje y Comunicación',
  'Matemáticas',
  'Ciencias Naturales',
  'Historia y Geografía',
  'Inglés',
  'Física',
  'Química'
];

// Temas por asignatura
const TOPICS = {
  'Lenguaje y Comunicación': [
    'Comprensión Lectora', 'Redacción', 'Gramática', 'Ortografía', 
    'Vocabulario', 'Géneros Literarios', 'Análisis Textual', 'Comunicación Oral'
  ],
  'Matemáticas': [
    'Álgebra', 'Geometría', 'Números', 'Fracciones', 'Ecuaciones',
    'Funciones', 'Estadística', 'Probabilidad', 'Trigonometría', 'Porcentajes'
  ],
  'Ciencias Naturales': [
    'Seres Vivos', 'Ecosistemas', 'Cuerpo Humano', 'Materia y Energía',
    'Ciclos Naturales', 'Medio Ambiente', 'Célula', 'Reproducción'
  ],
  'Historia y Geografía': [
    'Historia de Chile', 'Geografía Nacional', 'Pueblos Originarios', 'Derechos Ciudadanos',
    'Instituciones', 'Democracia', 'Economía', 'Cultura'
  ],
  'Inglés': [
    'Grammar', 'Vocabulary', 'Reading Comprehension', 'Writing',
    'Listening', 'Speaking', 'Verb Tenses', 'Idioms'
  ],
  'Física': [
    'Mecánica', 'Ondas', 'Electricidad', 'Magnetismo',
    'Termodinámica', 'Óptica', 'Cinemática', 'Dinámica'
  ],
  'Química': [
    'Tabla Periódica', 'Enlaces Químicos', 'Reacciones', 'Estequiometría',
    'Soluciones', 'Ácidos y Bases', 'Gases', 'Química Orgánica'
  ]
};

// Función para generar fecha aleatoria dentro de un rango
function randomDate(start, end) {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  const date = new Date(randomTime);
  // Evitar fines de semana
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

// Función para formatear fecha como YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Función para generar nota con distribución que logre 70-80% aprobados
function generateGrade(isApproved) {
  if (isApproved) {
    // Nota aprobatoria: 60-100 con distribución normal centrada en 75
    const base = 60;
    const range = 40;
    // Distribución que favorece notas medias-altas
    const r = Math.random();
    const skewed = Math.pow(r, 0.7); // Sesgo hacia notas más altas
    return Math.round(base + skewed * range);
  } else {
    // Nota reprobatoria: 0-59 con distribución
    const r = Math.random();
    // Algunas muy bajas, mayoría entre 40-59
    if (r < 0.2) {
      return Math.round(Math.random() * 30); // 0-30
    } else {
      return Math.round(30 + Math.random() * 29); // 30-59
    }
  }
}

// Función para seleccionar tema aleatorio
function randomTopic(subject) {
  const topics = TOPICS[subject] || ['General'];
  return topics[Math.floor(Math.random() * topics.length)];
}

// Función para determinar si un curso es de Media
function isMedia(course) {
  return course.toLowerCase().includes('medio');
}

// Función principal
async function generateGrades() {
  console.log('📚 Generando calificaciones 2025...\n');
  
  // Leer archivo de usuarios
  const usersPath = path.join(__dirname, '../public/test-data/users-consolidated-2025-CORREGIDO_v3.1.csv');
  const usersContent = fs.readFileSync(usersPath, 'utf-8');
  const lines = usersContent.trim().split('\n');
  const header = lines[0].split(',');
  
  // Encontrar índices de columnas
  const roleIdx = header.indexOf('role');
  const nameIdx = header.indexOf('name');
  const rutIdx = header.indexOf('rut');
  const courseIdx = header.indexOf('course');
  const sectionIdx = header.indexOf('section');
  
  // Filtrar solo estudiantes
  const students = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols[roleIdx] === 'student') {
      students.push({
        name: cols[nameIdx],
        rut: cols[rutIdx],
        course: cols[courseIdx],
        section: cols[sectionIdx]
      });
    }
  }
  
  console.log(`✅ ${students.length} estudiantes encontrados`);
  
  // Generar calificaciones
  const grades = [];
  const targetApprovalRate = APPROVAL_RATE_MIN + Math.random() * (APPROVAL_RATE_MAX - APPROVAL_RATE_MIN);
  console.log(`🎯 Tasa de aprobación objetivo: ${(targetApprovalRate * 100).toFixed(1)}%`);
  
  let totalGrades = 0;
  let approvedGrades = 0;
  
  for (const student of students) {
    const subjects = isMedia(student.course) ? SUBJECTS_MEDIA : SUBJECTS_BASICA;
    
    for (const subject of subjects) {
      // Semestre 1
      let activityNum = 0;
      for (const actType of ACTIVITY_TYPES) {
        for (let j = 0; j < actType.count; j++) {
          activityNum++;
          const isApproved = Math.random() < targetApprovalRate;
          const grade = generateGrade(isApproved);
          const date = randomDate(SEMESTER_1.start, SEMESTER_1.end);
          const topic = randomTopic(subject);
          
          grades.push({
            fecha: formatDate(date),
            curso: student.course,
            seccion: student.section,
            nombre: student.name,
            rut: student.rut,
            asignatura: subject,
            tipo: actType.type,
            actividad: `${actType.type} ${activityNum} - S1`,
            tema: topic,
            nota: grade
          });
          
          totalGrades++;
          if (grade >= PASSING_GRADE) approvedGrades++;
        }
      }
      
      // Semestre 2
      activityNum = 0;
      for (const actType of ACTIVITY_TYPES) {
        for (let j = 0; j < actType.count; j++) {
          activityNum++;
          const isApproved = Math.random() < targetApprovalRate;
          const grade = generateGrade(isApproved);
          const date = randomDate(SEMESTER_2.start, SEMESTER_2.end);
          const topic = randomTopic(subject);
          
          grades.push({
            fecha: formatDate(date),
            curso: student.course,
            seccion: student.section,
            nombre: student.name,
            rut: student.rut,
            asignatura: subject,
            tipo: actType.type,
            actividad: `${actType.type} ${activityNum} - S2`,
            tema: topic,
            nota: grade
          });
          
          totalGrades++;
          if (grade >= PASSING_GRADE) approvedGrades++;
        }
      }
    }
  }
  
  // Ordenar por fecha
  grades.sort((a, b) => a.fecha.localeCompare(b.fecha));
  
  // Generar CSV
  const csvHeader = 'fecha,curso,seccion,nombre,rut,asignatura,tipo,actividad,tema,nota';
  const csvLines = grades.map(g => 
    `${g.fecha},${g.curso},${g.seccion},${g.nombre},${g.rut},${g.asignatura},${g.tipo},${g.actividad},${g.tema},${g.nota}`
  );
  
  const csvContent = [csvHeader, ...csvLines].join('\n');
  
  // Guardar archivo
  const outputPath = path.join(__dirname, '../public/test-data/calificaciones-completo-2025.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  
  // Estadísticas finales
  const actualApprovalRate = (approvedGrades / totalGrades) * 100;
  
  console.log('\n📊 Estadísticas:');
  console.log(`   Total de calificaciones: ${totalGrades.toLocaleString()}`);
  console.log(`   Calificaciones aprobadas: ${approvedGrades.toLocaleString()}`);
  console.log(`   Tasa de aprobación real: ${actualApprovalRate.toFixed(1)}%`);
  console.log(`   Estudiantes: ${students.length}`);
  console.log(`   Asignaturas (Básica): ${SUBJECTS_BASICA.length}`);
  console.log(`   Asignaturas (Media): ${SUBJECTS_MEDIA.length}`);
  console.log(`   Actividades por asignatura: ${ACTIVITIES_PER_SEMESTER * 2} (10 por semestre)`);
  
  console.log(`\n✅ Archivo generado: ${outputPath}`);
  console.log(`   Tamaño: ${(csvContent.length / 1024 / 1024).toFixed(2)} MB`);
}

generateGrades().catch(console.error);
