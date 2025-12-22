// Script para diagnosticar asignaciones de profesores
console.log('=== DIAGNÓSTICO DE ASIGNACIONES DE PROFESORES ===\n');

// Simular localStorage del navegador leyendo desde el archivo
const fs = require('fs');

// Buscar todos los archivos de localStorage en los datos del proyecto
const possibleKeys = [
  'smart-student-teacher-assignments',
  'smart-student-teacher-assignments-2025',
  'smart-student-teachers-2025',
  'smart-student-sections',
  'smart-student-courses'
];

console.log('Claves a verificar en localStorage:');
possibleKeys.forEach(key => console.log(`  - ${key}`));
console.log('\n');

console.log('Para diagnosticar, ejecute este código en la consola del navegador:');
console.log(`
// ========== EJECUTAR EN CONSOLA DEL NAVEGADOR ==========

// 1. Ver asignaciones legacy
console.log('=== ASIGNACIONES LEGACY ===');
const legacy = JSON.parse(localStorage.getItem('smart-student-teacher-assignments') || '[]');
console.log('Total legacy:', legacy.length);
console.log(legacy);

// 2. Ver asignaciones por año
console.log('\\n=== ASIGNACIONES POR AÑO 2025 ===');
const year2025 = localStorage.getItem('smart-student-teacher-assignments-2025');
if (year2025) {
  try {
    const parsed = JSON.parse(year2025);
    if (Array.isArray(parsed)) {
      console.log('Total 2025 (array):', parsed.length);
      console.log(parsed);
    } else {
      console.log('Formato compacto detectado:', parsed.fmt);
      console.log(parsed);
    }
  } catch (e) {
    console.log('Error parsing:', e);
  }
} else {
  console.log('No hay datos en 2025');
}

// 3. Ver profesor actual
console.log('\\n=== USUARIO ACTUAL ===');
const userStr = localStorage.getItem('smart-student-auth') || sessionStorage.getItem('smart-student-auth');
if (userStr) {
  const user = JSON.parse(userStr);
  console.log('ID:', user.id);
  console.log('Username:', user.username);
  console.log('Role:', user.role);
}

// 4. Buscar asignaciones del profesor
console.log('\\n=== BUSCAR ASIGNACIONES DEL PROFESOR ===');
const user = JSON.parse(localStorage.getItem('smart-student-auth') || sessionStorage.getItem('smart-student-auth') || '{}');
const allAssignments = [...legacy];

// Agregar las de 2025 si existen
if (year2025) {
  try {
    const parsed2025 = JSON.parse(year2025);
    if (Array.isArray(parsed2025)) {
      allAssignments.push(...parsed2025);
    }
  } catch {}
}

const myAssignments = allAssignments.filter(a => 
  a.teacherId === user.id || a.teacherId === user.username
);
console.log('Asignaciones encontradas para el profesor:', myAssignments.length);
console.log(myAssignments);

// ==========================================================
`);

