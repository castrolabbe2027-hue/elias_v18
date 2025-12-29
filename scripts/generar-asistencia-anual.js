/**
 * Script para generar archivo CSV de asistencia anual
 * 
 * Especificaciones:
 * - Para todos los estudiantes del archivo users-consolidated-2025-CORREGIDO_v3.1.csv
 * - Asistencia entre 80% y 90%
 * - Desde marzo a diciembre (días hábiles)
 * - Status: present o absent
 */

const fs = require('fs');
const path = require('path');

// Configuración
const ATTENDANCE_RATE_MIN = 0.80;
const ATTENDANCE_RATE_MAX = 0.90;

// Función para obtener días hábiles (lunes a viernes) de un mes
function getSchoolDays(year, month) {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    // Solo lunes (1) a viernes (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      days.push(date);
    }
  }
  return days;
}

// Función para formatear fecha como YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Función principal
async function generateAttendance(year) {
  console.log(`\n📅 Generando asistencia ${year}...\n`);
  
  // Leer archivo de usuarios
  const usersPath = path.join(__dirname, '../public/test-data/users-consolidated-2025-CORREGIDO_v3.1.csv');
  const usersContent = fs.readFileSync(usersPath, 'utf-8');
  const lines = usersContent.trim().split('\n');
  const header = lines[0].split(',');
  
  // Encontrar índices de columnas
  const roleIdx = header.indexOf('role');
  const nameIdx = header.indexOf('name');
  const rutIdx = header.indexOf('rut');
  const usernameIdx = header.indexOf('username');
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
        username: cols[usernameIdx],
        course: cols[courseIdx],
        section: cols[sectionIdx]
      });
    }
  }
  
  console.log(`✅ ${students.length} estudiantes encontrados`);
  
  // Obtener todos los días hábiles del año escolar (marzo a diciembre)
  const schoolDays = [];
  for (let month = 2; month <= 11; month++) { // Marzo (2) a Diciembre (11)
    schoolDays.push(...getSchoolDays(year, month));
  }
  
  console.log(`📆 ${schoolDays.length} días hábiles (marzo-diciembre)`);
  
  // Generar asistencia
  const attendance = [];
  let totalRecords = 0;
  let presentCount = 0;
  
  // Cada estudiante tiene su propia tasa de asistencia dentro del rango
  for (const student of students) {
    // Tasa individual de asistencia para este estudiante
    const studentAttendanceRate = ATTENDANCE_RATE_MIN + Math.random() * (ATTENDANCE_RATE_MAX - ATTENDANCE_RATE_MIN);
    
    for (const day of schoolDays) {
      const isPresent = Math.random() < studentAttendanceRate;
      const status = isPresent ? 'present' : 'absent';
      
      attendance.push({
        date: formatDate(day),
        course: student.course,
        section: student.section,
        username: student.username,
        rut: student.rut,
        name: student.name,
        status: status
      });
      
      totalRecords++;
      if (isPresent) presentCount++;
    }
  }
  
  // Ordenar por fecha, luego por curso, sección
  attendance.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.course !== b.course) return a.course.localeCompare(b.course);
    if (a.section !== b.section) return a.section.localeCompare(b.section);
    return a.name.localeCompare(b.name);
  });
  
  // Generar CSV
  const csvHeader = 'date,course,section,username,rut,name,status';
  const csvLines = attendance.map(a => 
    `${a.date},${a.course},${a.section},${a.username},${a.rut},${a.name},${a.status}`
  );
  
  const csvContent = [csvHeader, ...csvLines].join('\n');
  
  // Guardar archivo
  const outputPath = path.join(__dirname, `../public/test-data/asistencia-completo-${year}.csv`);
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  
  // Estadísticas finales
  const actualAttendanceRate = (presentCount / totalRecords) * 100;
  
  console.log('\n📊 Estadísticas:');
  console.log(`   Total de registros: ${totalRecords.toLocaleString()}`);
  console.log(`   Presentes: ${presentCount.toLocaleString()}`);
  console.log(`   Ausentes: ${(totalRecords - presentCount).toLocaleString()}`);
  console.log(`   Tasa de asistencia: ${actualAttendanceRate.toFixed(1)}%`);
  console.log(`   Estudiantes: ${students.length}`);
  console.log(`   Días hábiles: ${schoolDays.length}`);
  
  console.log(`\n✅ Archivo generado: ${outputPath}`);
  console.log(`   Tamaño: ${(csvContent.length / 1024 / 1024).toFixed(2)} MB`);
  
  return { totalRecords, presentCount, actualAttendanceRate };
}

// Ejecutar para 2024 y 2025
async function main() {
  const year = process.argv[2] ? parseInt(process.argv[2]) : 2024;
  await generateAttendance(year);
}

main().catch(console.error);
