// src/ai/flows/analyze-subject-topics.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { bookPDFs } from '@/lib/books-data';

const AnalyzeSubjectTopicsInputSchema = z.object({
  courseName: z.string().describe('Course name (e.g., "1ro Básico", "2do Medio").'),
  subjectName: z.string().describe('Subject name (e.g., "Matemáticas", "Lenguaje y Comunicación").'),
  language: z.enum(['es', 'en']).describe('Output language.'),
});

export type AnalyzeSubjectTopicsInput = z.infer<typeof AnalyzeSubjectTopicsInputSchema>;

const AnalyzeSubjectTopicsOutputSchema = z.object({
  topics: z.array(z.string()).max(40).describe('Distinct topics detected for the subject.'),
  bookTitle: z.string().optional().describe('Title of the book analyzed.'),
});

export type AnalyzeSubjectTopicsOutput = z.infer<typeof AnalyzeSubjectTopicsOutputSchema>;

// Cache para evitar re-procesar
const topicsCache = new Map<string, { topics: string[]; timestamp: number; bookTitle?: string }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

function normalize(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Detectar qué asignatura es
function detectSubjectType(subjectName: string): 'math' | 'language' | 'science' | 'history' | 'physics' | 'chemistry' | 'biology' | 'other' {
  const s = normalize(subjectName);
  
  if (/matem|math|algebra|geometr|trigonom|calculo|aritmet|matriz|estadistic|probabil/i.test(s)) {
    return 'math';
  }
  if (/lenguaje|comunicacion|language|literature|literatura|gramatica|ortografia|lectura|escritura/i.test(s)) {
    return 'language';
  }
  // Detectar Física específicamente
  if (/^fisica$|^physics$|fisica\s*\d|physics\s*\d/i.test(s)) {
    return 'physics';
  }
  // Detectar Química específicamente
  if (/^quimica$|^chemistry$|quimica\s*\d|chemistry\s*\d/i.test(s)) {
    return 'chemistry';
  }
  // Detectar Biología específicamente
  if (/^biologia$|^biology$|biologia\s*\d|biology\s*\d/i.test(s)) {
    return 'biology';
  }
  // Ciencias Naturales general (básica)
  if (/ciencia|natural|science/i.test(s) && !s.includes('social')) {
    return 'science';
  }
  if (/historia|geography|geografia|social|civica|educacion civica|sociedad/i.test(s)) {
    return 'history';
  }
  
  return 'other';
}

// Determinar el nivel del curso
function getCourseLevel(courseName: string): 'basico' | 'medio' | 'superior' {
  const course = normalize(courseName);
  
  if (course.includes('medio') || course.includes('secundaria') || course.includes('high')) {
    return 'medio';
  }
  if (course.includes('superior') || course.includes('universitario') || course.includes('university')) {
    return 'superior';
  }
  return 'basico';
}

// Temas heurísticos por asignatura y nivel
function getHeuristicTopics(
  subjectType: 'math' | 'language' | 'science' | 'history' | 'physics' | 'chemistry' | 'biology' | 'other',
  level: 'basico' | 'medio' | 'superior',
  language: 'es' | 'en'
): string[] {
  
  const topicsEs: Record<string, Record<string, string[]>> = {
    math: {
      basico: [
        'Números naturales', 'Suma y resta', 'Multiplicación', 'División',
        'Fracciones', 'Decimales', 'Geometría básica', 'Medidas', 'Patrones numéricos',
        'Valor posicional', 'Comparación de números', 'Problemas de lógica',
        'Perímetro y área', 'Figuras 2D y 3D', 'Gráficos de barras'
      ],
      medio: [
        'Álgebra', 'Ecuaciones lineales', 'Sistemas de ecuaciones', 'Funciones',
        'Funciones cuadráticas', 'Trigonometría', 'Geometría analítica', 'Vectores',
        'Matrices', 'Determinantes', 'Probabilidad', 'Estadística', 'Logaritmos',
        'Exponenciales', 'Límites', 'Derivadas', 'Integrales', 'Números complejos'
      ],
      superior: [
        'Cálculo diferencial', 'Cálculo integral', 'Ecuaciones diferenciales',
        'Álgebra lineal', 'Análisis matemático', 'Topología', 'Probabilidad avanzada',
        'Estadística inferencial', 'Métodos numéricos', 'Optimización'
      ]
    },
    language: {
      basico: [
        'Comprensión lectora', 'Escritura de oraciones', 'Vocales y consonantes',
        'Lectura de cuentos', 'Sustantivos y adjetivos', 'Verbos y tiempos verbales',
        'Signos de puntuación', 'Sinónimos y antónimos', 'Textos narrativos',
        'Textos descriptivos', 'Poemas y rimas', 'Fábulas y leyendas',
        'Uso de mayúsculas', 'Orden alfabético', 'Escritura creativa'
      ],
      medio: [
        'Análisis literario', 'Figuras retóricas', 'Géneros literarios',
        'Textos argumentativos', 'Ensayos', 'Crónicas', 'Reseñas literarias',
        'Movimientos literarios', 'Narrativa contemporánea', 'Poesía lírica',
        'Teatro y dramaturgia', 'Oratoria', 'Redacción formal', 'Investigación',
        'Medios de comunicación', 'Análisis crítico', 'Coherencia y cohesión'
      ],
      superior: [
        'Teoría literaria', 'Semiótica', 'Lingüística', 'Morfosintaxis',
        'Fonética y fonología', 'Dialectología', 'Literatura universal',
        'Crítica literaria', 'Estilística', 'Análisis del discurso'
      ]
    },
    science: {
      basico: [
        'Los seres vivos', 'Partes del cuerpo humano', 'Los cinco sentidos',
        'Animales y sus hábitats', 'Plantas y sus partes', 'El ciclo del agua',
        'Estados de la materia', 'Luz y sombras', 'El sistema solar',
        'Cadenas alimentarias', 'Ecosistemas', 'Energía y movimiento',
        'Clasificación de animales', 'El medio ambiente', 'Recursos naturales'
      ],
      medio: [
        'Célula y organismos', 'Genética', 'Evolución', 'Ecología',
        'Anatomía humana', 'Fisiología', 'Química orgánica', 'Química inorgánica',
        'Reacciones químicas', 'Termodinámica', 'Mecánica', 'Ondas',
        'Electricidad y magnetismo', 'Óptica', 'Física moderna', 'Biología molecular'
      ],
      superior: [
        'Bioquímica', 'Microbiología', 'Inmunología', 'Biotecnología',
        'Física cuántica', 'Relatividad', 'Astrofísica', 'Química analítica',
        'Nanotecnología', 'Genómica', 'Neurociencia'
      ]
    },
    // FÍSICA - Temas específicos por nivel
    physics: {
      basico: [
        'Fuerza y movimiento', 'Energía', 'Luz y sonido', 'Electricidad básica',
        'Magnetismo', 'Calor y temperatura', 'Máquinas simples'
      ],
      medio: [
        'Cinemática', 'Dinámica', 'Leyes de Newton', 'Trabajo y energía',
        'Momentum y colisiones', 'Movimiento circular', 'Gravitación universal',
        'Fluidos y presión', 'Ondas mecánicas', 'Ondas sonoras',
        'Óptica geométrica', 'Óptica física', 'Electricidad y circuitos',
        'Electromagnetismo', 'Inducción electromagnética', 'Termodinámica',
        'Física moderna', 'Relatividad especial', 'Física cuántica introductoria',
        'Física nuclear', 'Energía nuclear'
      ],
      superior: [
        'Mecánica clásica avanzada', 'Electrodinámica', 'Física cuántica',
        'Mecánica estadística', 'Relatividad general', 'Física de partículas',
        'Física del estado sólido', 'Astrofísica', 'Cosmología'
      ]
    },
    // QUÍMICA - Temas específicos por nivel
    chemistry: {
      basico: [
        'Estados de la materia', 'Mezclas y soluciones', 'Cambios físicos y químicos',
        'Propiedades de la materia', 'Átomos y moléculas básicos'
      ],
      medio: [
        'Estructura atómica', 'Modelos atómicos', 'Tabla periódica',
        'Configuración electrónica', 'Enlaces químicos', 'Enlace iónico',
        'Enlace covalente', 'Enlace metálico', 'Nomenclatura química',
        'Reacciones químicas', 'Estequiometría', 'Soluciones y concentración',
        'Ácidos y bases', 'pH y neutralización', 'Termoquímica',
        'Cinética química', 'Equilibrio químico', 'Química orgánica',
        'Hidrocarburos', 'Grupos funcionales', 'Polímeros',
        'Electroquímica', 'Pilas y baterías'
      ],
      superior: [
        'Química analítica', 'Química física', 'Química inorgánica avanzada',
        'Química orgánica avanzada', 'Bioquímica', 'Espectroscopía',
        'Síntesis orgánica', 'Catálisis', 'Química ambiental'
      ]
    },
    // BIOLOGÍA - Temas específicos por nivel
    biology: {
      basico: [
        'Seres vivos', 'Plantas y animales', 'El cuerpo humano',
        'Alimentación y nutrición', 'Los sentidos', 'Ecosistemas'
      ],
      medio: [
        'La célula', 'Estructura celular', 'Organelos celulares',
        'Membrana celular', 'División celular', 'Mitosis y meiosis',
        'Genética mendeliana', 'ADN y ARN', 'Síntesis de proteínas',
        'Mutaciones', 'Herencia y cromosomas', 'Evolución biológica',
        'Selección natural', 'Origen de las especies', 'Clasificación de los seres vivos',
        'Ecología', 'Flujo de energía', 'Ciclos biogeoquímicos',
        'Biodiversidad', 'Anatomía humana', 'Sistemas del cuerpo humano',
        'Sistema nervioso', 'Sistema endocrino', 'Sistema inmunológico',
        'Reproducción humana', 'Microbiología', 'Virus y bacterias'
      ],
      superior: [
        'Biología molecular', 'Genética molecular', 'Biotecnología',
        'Ingeniería genética', 'Bioinformática', 'Neurobiología',
        'Inmunología avanzada', 'Microbiología avanzada', 'Ecología avanzada'
      ]
    },
    history: {
      basico: [
        'Mi familia y comunidad', 'Normas de convivencia', 'Derechos de los niños',
        'Símbolos patrios', 'Pueblos originarios', 'Fiestas y tradiciones',
        'Ubicación geográfica', 'Regiones de Chile', 'Zonas climáticas',
        'Recursos naturales', 'Trabajos y oficios', 'Historia personal',
        'Civilizaciones antiguas', 'Descubrimiento de América', 'Colonia'
      ],
      medio: [
        'Historia universal', 'Revolución Francesa', 'Revolución Industrial',
        'Primera Guerra Mundial', 'Segunda Guerra Mundial', 'Guerra Fría',
        'Independencia de América', 'Historia de Chile', 'Geografía física',
        'Geografía humana', 'Economía', 'Globalización', 'Derechos humanos',
        'Democracia y ciudadanía', 'Problemas ambientales', 'Geopolítica'
      ],
      superior: [
        'Historiografía', 'Filosofía política', 'Economía internacional',
        'Relaciones internacionales', 'Antropología', 'Sociología',
        'Pensamiento político', 'Historia del arte', 'Patrimonio cultural'
      ]
    },
    other: {
      basico: [
        'Conceptos básicos', 'Fundamentos', 'Introducción al tema',
        'Aplicaciones prácticas', 'Ejercicios guiados', 'Repaso general'
      ],
      medio: [
        'Teoría', 'Práctica', 'Análisis', 'Síntesis', 'Evaluación',
        'Aplicaciones', 'Estudios de caso', 'Proyectos'
      ],
      superior: [
        'Investigación', 'Metodología', 'Análisis avanzado', 'Seminario',
        'Tesis', 'Publicaciones'
      ]
    }
  };
  
  const topicsEn: Record<string, Record<string, string[]>> = {
    math: {
      basico: [
        'Natural numbers', 'Addition and subtraction', 'Multiplication', 'Division',
        'Fractions', 'Decimals', 'Basic geometry', 'Measurements', 'Number patterns',
        'Place value', 'Number comparison', 'Logic problems',
        'Perimeter and area', '2D and 3D shapes', 'Bar graphs'
      ],
      medio: [
        'Algebra', 'Linear equations', 'Systems of equations', 'Functions',
        'Quadratic functions', 'Trigonometry', 'Analytic geometry', 'Vectors',
        'Matrices', 'Determinants', 'Probability', 'Statistics', 'Logarithms',
        'Exponentials', 'Limits', 'Derivatives', 'Integrals', 'Complex numbers'
      ],
      superior: [
        'Differential calculus', 'Integral calculus', 'Differential equations',
        'Linear algebra', 'Mathematical analysis', 'Topology', 'Advanced probability',
        'Inferential statistics', 'Numerical methods', 'Optimization'
      ]
    },
    language: {
      basico: [
        'Reading comprehension', 'Sentence writing', 'Vowels and consonants',
        'Story reading', 'Nouns and adjectives', 'Verbs and tenses',
        'Punctuation marks', 'Synonyms and antonyms', 'Narrative texts',
        'Descriptive texts', 'Poems and rhymes', 'Fables and legends',
        'Capital letters', 'Alphabetical order', 'Creative writing'
      ],
      medio: [
        'Literary analysis', 'Rhetorical figures', 'Literary genres',
        'Argumentative texts', 'Essays', 'Chronicles', 'Book reviews',
        'Literary movements', 'Contemporary narrative', 'Lyric poetry',
        'Theater and drama', 'Public speaking', 'Formal writing', 'Research',
        'Mass media', 'Critical analysis', 'Coherence and cohesion'
      ],
      superior: [
        'Literary theory', 'Semiotics', 'Linguistics', 'Morphosyntax',
        'Phonetics and phonology', 'Dialectology', 'World literature',
        'Literary criticism', 'Stylistics', 'Discourse analysis'
      ]
    },
    science: {
      basico: [
        'Living things', 'Human body parts', 'The five senses',
        'Animals and habitats', 'Plants and their parts', 'The water cycle',
        'States of matter', 'Light and shadows', 'The solar system',
        'Food chains', 'Ecosystems', 'Energy and motion',
        'Animal classification', 'The environment', 'Natural resources'
      ],
      medio: [
        'Cell and organisms', 'Genetics', 'Evolution', 'Ecology',
        'Human anatomy', 'Physiology', 'Organic chemistry', 'Inorganic chemistry',
        'Chemical reactions', 'Thermodynamics', 'Mechanics', 'Waves',
        'Electricity and magnetism', 'Optics', 'Modern physics', 'Molecular biology'
      ],
      superior: [
        'Biochemistry', 'Microbiology', 'Immunology', 'Biotechnology',
        'Quantum physics', 'Relativity', 'Astrophysics', 'Analytical chemistry',
        'Nanotechnology', 'Genomics', 'Neuroscience'
      ]
    },
    // PHYSICS - Specific topics by level
    physics: {
      basico: [
        'Force and motion', 'Energy', 'Light and sound', 'Basic electricity',
        'Magnetism', 'Heat and temperature', 'Simple machines'
      ],
      medio: [
        'Kinematics', 'Dynamics', 'Newton\'s Laws', 'Work and energy',
        'Momentum and collisions', 'Circular motion', 'Universal gravitation',
        'Fluids and pressure', 'Mechanical waves', 'Sound waves',
        'Geometric optics', 'Physical optics', 'Electricity and circuits',
        'Electromagnetism', 'Electromagnetic induction', 'Thermodynamics',
        'Modern physics', 'Special relativity', 'Introductory quantum physics',
        'Nuclear physics', 'Nuclear energy'
      ],
      superior: [
        'Advanced classical mechanics', 'Electrodynamics', 'Quantum physics',
        'Statistical mechanics', 'General relativity', 'Particle physics',
        'Solid state physics', 'Astrophysics', 'Cosmology'
      ]
    },
    // CHEMISTRY - Specific topics by level
    chemistry: {
      basico: [
        'States of matter', 'Mixtures and solutions', 'Physical and chemical changes',
        'Properties of matter', 'Basic atoms and molecules'
      ],
      medio: [
        'Atomic structure', 'Atomic models', 'Periodic table',
        'Electron configuration', 'Chemical bonds', 'Ionic bonding',
        'Covalent bonding', 'Metallic bonding', 'Chemical nomenclature',
        'Chemical reactions', 'Stoichiometry', 'Solutions and concentration',
        'Acids and bases', 'pH and neutralization', 'Thermochemistry',
        'Chemical kinetics', 'Chemical equilibrium', 'Organic chemistry',
        'Hydrocarbons', 'Functional groups', 'Polymers',
        'Electrochemistry', 'Batteries and cells'
      ],
      superior: [
        'Analytical chemistry', 'Physical chemistry', 'Advanced inorganic chemistry',
        'Advanced organic chemistry', 'Biochemistry', 'Spectroscopy',
        'Organic synthesis', 'Catalysis', 'Environmental chemistry'
      ]
    },
    // BIOLOGY - Specific topics by level
    biology: {
      basico: [
        'Living things', 'Plants and animals', 'The human body',
        'Food and nutrition', 'The senses', 'Ecosystems'
      ],
      medio: [
        'The cell', 'Cell structure', 'Cell organelles',
        'Cell membrane', 'Cell division', 'Mitosis and meiosis',
        'Mendelian genetics', 'DNA and RNA', 'Protein synthesis',
        'Mutations', 'Heredity and chromosomes', 'Biological evolution',
        'Natural selection', 'Origin of species', 'Classification of living things',
        'Ecology', 'Energy flow', 'Biogeochemical cycles',
        'Biodiversity', 'Human anatomy', 'Human body systems',
        'Nervous system', 'Endocrine system', 'Immune system',
        'Human reproduction', 'Microbiology', 'Viruses and bacteria'
      ],
      superior: [
        'Molecular biology', 'Molecular genetics', 'Biotechnology',
        'Genetic engineering', 'Bioinformatics', 'Neurobiology',
        'Advanced immunology', 'Advanced microbiology', 'Advanced ecology'
      ]
    },
    history: {
      basico: [
        'My family and community', 'Rules of coexistence', 'Children\'s rights',
        'National symbols', 'Indigenous peoples', 'Holidays and traditions',
        'Geographic location', 'Regions', 'Climate zones',
        'Natural resources', 'Jobs and occupations', 'Personal history',
        'Ancient civilizations', 'Discovery of America', 'Colonial period'
      ],
      medio: [
        'World history', 'French Revolution', 'Industrial Revolution',
        'World War I', 'World War II', 'Cold War',
        'American independence', 'National history', 'Physical geography',
        'Human geography', 'Economics', 'Globalization', 'Human rights',
        'Democracy and citizenship', 'Environmental issues', 'Geopolitics'
      ],
      superior: [
        'Historiography', 'Political philosophy', 'International economics',
        'International relations', 'Anthropology', 'Sociology',
        'Political thought', 'Art history', 'Cultural heritage'
      ]
    },
    other: {
      basico: [
        'Basic concepts', 'Fundamentals', 'Topic introduction',
        'Practical applications', 'Guided exercises', 'General review'
      ],
      medio: [
        'Theory', 'Practice', 'Analysis', 'Synthesis', 'Evaluation',
        'Applications', 'Case studies', 'Projects'
      ],
      superior: [
        'Research', 'Methodology', 'Advanced analysis', 'Seminar',
        'Thesis', 'Publications'
      ]
    }
  };
  
  const topics = language === 'es' ? topicsEs : topicsEn;
  return topics[subjectType]?.[level] || topics['other'][level];
}

// Temas específicos por curso y asignatura (datos más precisos)
function getSpecificTopics(courseName: string, subjectName: string, language: 'es' | 'en'): string[] | null {
  const course = normalize(courseName);
  const subject = normalize(subjectName);
  
  // Temas específicos por curso para Lenguaje
  const languageTopicsEs: Record<string, string[]> = {
    '1ro basico': [
      'Comprensión lectora de cuentos infantiles', 'Reconocimiento de letras', 
      'Escritura de oraciones simples', 'Vocales y consonantes', 'Sonidos iniciales y finales',
      'Lectura de sílabas', 'Palabras frecuentes', 'Textos narrativos cortos',
      'Uso de mayúsculas', 'Signos de interrogación', 'Rimas y trabalenguas'
    ],
    '2do basico': [
      'Lectura comprensiva de fábulas', 'Escritura de cartas', 'Sustantivos y adjetivos',
      'Verbos y tiempos verbales', 'Uso de la coma', 'Textos descriptivos',
      'Sinónimos y antónimos', 'Poemas simples', 'Historietas', 'Producción de cuentos'
    ],
    '3ro basico': [
      'Lectura de novelas cortas', 'Uso de conectores', 'Sujeto y predicado',
      'Leyendas chilenas', 'Uso de b y v', 'Textos argumentativos simples',
      'Adverbios', 'Lectura crítica', 'Obras teatrales', 'Escritura de resúmenes'
    ],
    '4to basico': [
      'Análisis de textos literarios', 'Figuras literarias', 'Textos argumentativos',
      'Ensayos simples', 'Textos periodísticos', 'Verbos irregulares',
      'Análisis de personajes', 'Crónicas', 'Metáfora y comparación', 'Reportajes'
    ]
  };
  
  // Temas específicos por curso para Ciencias Naturales
  const scienceTopicsEs: Record<string, string[]> = {
    '1ro basico': [
      'Los seres vivos y su entorno', 'Partes del cuerpo humano', 'Los cinco sentidos',
      'Animales y sus hábitats', 'Plantas y sus partes', 'El ciclo del agua',
      'Estados de la materia', 'Luz y sombras', 'El día y la noche',
      'Cuidado del medio ambiente', 'Clasificación de animales'
    ],
    '2do basico': [
      'Sistemas del cuerpo humano', 'Alimentación saludable', 'Vertebrados e invertebrados',
      'Reproducción de plantas', 'Ecosistemas terrestres', 'Mezclas y separaciones',
      'Fuerza y movimiento', 'Recursos naturales', 'Cadenas alimentarias', 'Magnetismo'
    ],
    '3ro basico': [
      'Sistema digestivo', 'Nutrientes y alimentos', 'Clasificación de vertebrados',
      'Polinización', 'Biomas de Chile', 'Propiedades de la materia',
      'Energía cinética y potencial', 'Rocas y minerales', 'Sistema respiratorio', 'Sistema circulatorio'
    ],
    '4to basico': [
      'Sistema nervioso', 'Sistema óseo y muscular', 'Microorganismos',
      'Relaciones tróficas', 'Reacciones químicas', 'Circuitos eléctricos',
      'Estructura de la Tierra', 'Clima y tiempo', 'Desarrollo sustentable', 'Placas tectónicas'
    ],
    '5to basico': [
      'Sistemas del cuerpo humano', 'Sistema digestivo y nutrición', 'Sistema respiratorio',
      'Sistema circulatorio', 'Ciclos de la materia', 'Fotosíntesis', 'Energía en los ecosistemas',
      'Electricidad y circuitos', 'Propiedades de la luz', 'Capas de la Tierra'
    ],
    '6to basico': [
      'Pubertad y adolescencia', 'Sistema reproductor', 'Células y tejidos',
      'Niveles de organización biológica', 'Transferencia de energía', 'Formación de suelos',
      'Capas de la Tierra', 'Sismos y volcanes', 'Energías renovables', 'Cambio climático'
    ],
    '7mo basico': [
      'Organización celular', 'Microorganismos', 'Virus y bacterias', 'Sistema inmunológico',
      'Fuerza y movimiento', 'Leyes de Newton', 'Ondas y sonido', 'Efectos de la fuerza',
      'Modelos atómicos', 'Tabla periódica', 'Enlaces químicos'
    ],
    '8vo basico': [
      'Nutrición y digestión', 'Sistema circulatorio y respiratorio', 'Excreción y sistema urinario',
      'Sexualidad y reproducción humana', 'Modelo corpuscular de la materia', 'Estructura atómica',
      'Reacciones químicas', 'Electricidad y magnetismo', 'Circuitos eléctricos', 'El universo',
      'Sistema solar', 'Origen del universo', 'Evolución estelar'
    ]
  };
  
  // Temas específicos por curso para Historia
  const historyTopicsEs: Record<string, string[]> = {
    '1ro basico': [
      'Mi familia y yo', 'Normas de convivencia', 'Derechos de los niños',
      'Mi escuela y comunidad', 'Trabajos y oficios', 'Ubicación espacial',
      'Celebraciones y tradiciones', 'Símbolos patrios', 'Historia personal',
      'Pueblos originarios de Chile', 'Fiestas Patrias'
    ],
    '2do basico': [
      'Cultura de Chile', 'Regiones naturales de Chile', 'Ubicación de Chile en el mundo',
      'Zonas climáticas', 'Recursos naturales de Chile', 'Civilizaciones antiguas',
      'Griegos y romanos', 'Instituciones del país', 'Democracia y participación',
      'Comercio y moneda', 'Grandes exploradores'
    ],
    '3ro basico': [
      'Pueblos originarios de América', 'Mayas, Aztecas e Incas', 'Conquista de América',
      'Geografía de América', 'Climas de América', 'Recursos de América',
      'Colonización española', 'Vida colonial', 'Mestizaje cultural', 'Independencia de América'
    ],
    '4to basico': [
      'Chile en el siglo XIX', 'Independencia de Chile', 'Organización de la República',
      'Expansión territorial', 'Guerra del Pacífico', 'Sociedad chilena del siglo XIX',
      'Economía del salitre', 'Geografía de Chile', 'Democracia en Chile', 'Derechos ciudadanos'
    ],
    '5to basico': [
      'Grecia antigua', 'Democracia ateniense', 'Roma antigua', 'Legado greco-romano',
      'Civilización medieval', 'Feudalismo', 'El Renacimiento', 'Geografía de Europa',
      'Derechos humanos fundamentales', 'Ciudadanía y participación', 'Trabajo y economía'
    ],
    '6to basico': [
      'Proceso de independencia', 'Formación de América Latina', 'Chile republicano',
      'Organización política de Chile', 'Constitución y derechos', 'Geografía de América',
      'Recursos naturales americanos', 'Integración latinoamericana', 'Problemas ambientales',
      'Economía y comercio', 'Democracia y Estado de derecho'
    ],
    '7mo basico': [
      'Primeras civilizaciones', 'Mesopotamia y Egipto', 'India y China antiguas',
      'Imperio persa', 'Grecia clásica', 'Alejandro Magno', 'República romana',
      'Imperio romano', 'Caída del Imperio romano', 'Edad Media temprana',
      'El Islam y su expansión', 'Feudalismo europeo'
    ],
    '8vo basico': [
      'Renacimiento y Humanismo', 'Reforma protestante', 'Expansión europea',
      'Conquista de América', 'Colonización de América', 'Economía colonial',
      'Ilustración', 'Revoluciones del siglo XVIII', 'Independencia de EE.UU.',
      'Revolución Francesa', 'Revolución Industrial', 'Imperialismo',
      'Formación de los Estados nacionales', 'Chile colonial'
    ]
  };
  
  // Temas específicos por curso para FÍSICA (Enseñanza Media)
  const physicsTopicsEs: Record<string, string[]> = {
    '1ro medio': [
      'Cinemática: posición, desplazamiento y trayectoria', 'Velocidad y rapidez',
      'Movimiento rectilíneo uniforme (MRU)', 'Aceleración', 'Movimiento rectilíneo uniformemente acelerado (MRUA)',
      'Caída libre y lanzamiento vertical', 'Gráficos de movimiento', 'Vectores y escalares',
      'Fuerza y leyes de Newton', 'Primera ley de Newton (inercia)', 'Segunda ley de Newton',
      'Tercera ley de Newton (acción y reacción)', 'Fuerza de rozamiento', 'Fuerza peso y normal',
      'Diagrama de cuerpo libre', 'Trabajo mecánico', 'Potencia mecánica', 'Energía cinética',
      'Energía potencial gravitatoria', 'Conservación de la energía mecánica'
    ],
    '2do medio': [
      'Momentum o cantidad de movimiento', 'Impulso', 'Conservación del momentum',
      'Colisiones elásticas e inelásticas', 'Movimiento circular uniforme', 'Velocidad angular',
      'Aceleración centrípeta', 'Fuerza centrípeta', 'Torque y momento de fuerza',
      'Equilibrio rotacional', 'Gravitación universal', 'Ley de gravitación de Newton',
      'Movimiento de satélites', 'Leyes de Kepler', 'Hidrostática', 'Presión',
      'Presión atmosférica', 'Principio de Pascal', 'Principio de Arquímedes', 'Fluidos en movimiento'
    ],
    '3ro medio': [
      'Ondas mecánicas', 'Características de las ondas', 'Ondas transversales y longitudinales',
      'Longitud de onda, frecuencia y amplitud', 'Velocidad de propagación', 'Reflexión de ondas',
      'Refracción de ondas', 'Difracción', 'Interferencia de ondas', 'Ondas estacionarias',
      'Ondas sonoras', 'Velocidad del sonido', 'Intensidad del sonido', 'Efecto Doppler',
      'Luz y espectro electromagnético', 'Reflexión de la luz', 'Refracción de la luz',
      'Lentes convergentes y divergentes', 'Espejos planos y curvos', 'Óptica del ojo humano'
    ],
    '4to medio': [
      'Electricidad estática', 'Carga eléctrica', 'Ley de Coulomb', 'Campo eléctrico',
      'Potencial eléctrico', 'Corriente eléctrica', 'Ley de Ohm', 'Resistencia eléctrica',
      'Circuitos eléctricos', 'Circuitos en serie y paralelo', 'Potencia eléctrica',
      'Magnetismo', 'Campo magnético', 'Fuerza magnética sobre cargas', 'Inducción electromagnética',
      'Ley de Faraday', 'Transformadores', 'Termodinámica', 'Temperatura y calor',
      'Transferencia de calor', 'Primera ley de la termodinámica', 'Segunda ley de la termodinámica',
      'Física moderna introductoria', 'Efecto fotoeléctrico', 'Dualidad onda-partícula'
    ]
  };
  
  // Temas específicos por curso para QUÍMICA (Enseñanza Media)
  const chemistryTopicsEs: Record<string, string[]> = {
    '1ro medio': [
      'Teoría atómica', 'Modelos atómicos históricos', 'Modelo atómico actual',
      'Estructura del átomo', 'Número atómico y masa atómica', 'Isótopos',
      'Configuración electrónica', 'Niveles y subniveles de energía', 'Tabla periódica',
      'Grupos y períodos', 'Propiedades periódicas', 'Radio atómico',
      'Energía de ionización', 'Electronegatividad', 'Metales, no metales y metaloides',
      'Enlace químico', 'Enlace iónico', 'Enlace covalente', 'Enlace metálico',
      'Estructura de Lewis', 'Polaridad de moléculas'
    ],
    '2do medio': [
      'Nomenclatura química inorgánica', 'Óxidos', 'Hidróxidos', 'Ácidos', 'Sales',
      'Reacciones químicas', 'Tipos de reacciones químicas', 'Balanceo de ecuaciones',
      'Estequiometría', 'Mol y número de Avogadro', 'Masa molar', 'Cálculos estequiométricos',
      'Reactivo limitante', 'Rendimiento de reacciones', 'Soluciones químicas',
      'Concentración de soluciones', 'Molaridad', 'Diluciones', 'Propiedades coligativas',
      'Gases ideales', 'Ley de los gases ideales', 'Presión parcial'
    ],
    '3ro medio': [
      'Termoquímica', 'Entalpía', 'Reacciones exotérmicas y endotérmicas',
      'Energía de enlace', 'Ley de Hess', 'Cinética química', 'Velocidad de reacción',
      'Factores que afectan la velocidad', 'Catalizadores', 'Equilibrio químico',
      'Constante de equilibrio', 'Principio de Le Chatelier', 'Ácidos y bases',
      'Teoría de Arrhenius', 'Teoría de Brønsted-Lowry', 'pH y pOH',
      'Indicadores ácido-base', 'Neutralización', 'Titulación'
    ],
    '4to medio': [
      'Química orgánica', 'El átomo de carbono', 'Hibridación del carbono',
      'Hidrocarburos', 'Alcanos', 'Alquenos', 'Alquinos', 'Hidrocarburos cíclicos',
      'Hidrocarburos aromáticos', 'Isomería', 'Grupos funcionales',
      'Alcoholes', 'Éteres', 'Aldehídos', 'Cetonas', 'Ácidos carboxílicos',
      'Ésteres', 'Aminas', 'Amidas', 'Polímeros', 'Polímeros naturales y sintéticos',
      'Electroquímica', 'Reacciones redox', 'Pilas y baterías', 'Electrólisis'
    ]
  };
  
  // Temas específicos por curso para BIOLOGÍA (Enseñanza Media)
  const biologyTopicsEs: Record<string, string[]> = {
    '1ro medio': [
      'La célula como unidad de vida', 'Teoría celular', 'Célula procarionte y eucarionte',
      'Organelos celulares', 'Membrana plasmática', 'Transporte celular',
      'Difusión y ósmosis', 'Núcleo celular', 'ADN y cromosomas', 'Ciclo celular',
      'Mitosis', 'Meiosis', 'Diferencias entre mitosis y meiosis', 'Reproducción celular',
      'Metabolismo celular', 'Respiración celular', 'Fotosíntesis', 'ATP y energía celular',
      'Enzimas', 'Fermentación'
    ],
    '2do medio': [
      'Genética mendeliana', 'Leyes de Mendel', 'Herencia dominante y recesiva',
      'Cuadro de Punnett', 'Herencia ligada al sexo', 'Cromosomas sexuales',
      'Mutaciones genéticas', 'Estructura del ADN', 'Replicación del ADN',
      'Transcripción', 'Traducción', 'Síntesis de proteínas', 'Código genético',
      'Ingeniería genética', 'Biotecnología', 'Organismos transgénicos',
      'Clonación', 'Bioética', 'Genoma humano', 'Terapia génica'
    ],
    '3ro medio': [
      'Sistema nervioso', 'Neurona y sinapsis', 'Sistema nervioso central',
      'Sistema nervioso periférico', 'Sistema nervioso autónomo', 'Receptores sensoriales',
      'Sistema endocrino', 'Hormonas', 'Glándulas endocrinas', 'Homeostasis',
      'Regulación hormonal', 'Sistema inmunológico', 'Inmunidad innata',
      'Inmunidad adquirida', 'Anticuerpos', 'Vacunas', 'Enfermedades autoinmunes',
      'VIH y SIDA', 'Respuesta inflamatoria', 'Alergias'
    ],
    '4to medio': [
      'Evolución biológica', 'Teoría de Darwin', 'Selección natural',
      'Evidencias de la evolución', 'Especiación', 'Origen de la vida',
      'Historia de la vida en la Tierra', 'Eras geológicas', 'Evolución humana',
      'Ecología', 'Ecosistemas', 'Cadenas y redes tróficas', 'Flujo de energía',
      'Ciclos biogeoquímicos', 'Ciclo del carbono', 'Ciclo del nitrógeno',
      'Dinámica de poblaciones', 'Relaciones interespecíficas', 'Biodiversidad',
      'Conservación ambiental', 'Cambio climático', 'Desarrollo sustentable'
    ]
  };
  
  // Función auxiliar para normalizar nombre de curso
  const normalizeCourseName = (course: string): string => {
    const normalized = normalize(course);
    
    // Primero detectar si es enseñanza media
    const isMedio = normalized.includes('medio');
    
    // Mapear variantes de nombres de cursos para ENSEÑANZA MEDIA
    if (isMedio) {
      if (normalized.includes('4to') || normalized.includes('4°') || normalized.includes('cuarto')) {
        return '4to medio';
      }
      if (normalized.includes('3ro') || normalized.includes('3°') || normalized.includes('tercero')) {
        return '3ro medio';
      }
      if (normalized.includes('2do') || normalized.includes('2°') || normalized.includes('segundo')) {
        return '2do medio';
      }
      if (normalized.includes('1ro') || normalized.includes('1°') || normalized.includes('primero')) {
        return '1ro medio';
      }
    }
    
    // Mapear variantes de nombres de cursos para ENSEÑANZA BÁSICA
    if (normalized.includes('8vo') || normalized.includes('8°') || normalized.includes('octavo')) {
      return '8vo basico';
    }
    if (normalized.includes('7mo') || normalized.includes('7°') || normalized.includes('septimo')) {
      return '7mo basico';
    }
    if (normalized.includes('6to') || normalized.includes('6°') || normalized.includes('sexto')) {
      return '6to basico';
    }
    if (normalized.includes('5to') || normalized.includes('5°') || normalized.includes('quinto')) {
      return '5to basico';
    }
    if (normalized.includes('4to') || normalized.includes('4°') || normalized.includes('cuarto')) {
      return '4to basico';
    }
    if (normalized.includes('3ro') || normalized.includes('3°') || normalized.includes('tercero')) {
      return '3ro basico';
    }
    if (normalized.includes('2do') || normalized.includes('2°') || normalized.includes('segundo')) {
      return '2do basico';
    }
    if (normalized.includes('1ro') || normalized.includes('1°') || normalized.includes('primero')) {
      return '1ro basico';
    }
    return normalized;
  };

  const normalizedCourse = normalizeCourseName(course);
  
  console.log('[getSpecificTopics] Checking subject:', subject, 'course:', normalizedCourse);
  
  // IMPORTANTE: El orden de detección importa!
  // Historia DEBE ir ANTES de Ciencias porque "Historia, Geografía y Ciencias Sociales" contiene "ciencia"
  // Física, Química y Biología DEBEN ir ANTES de Ciencias Naturales genérico
  
  // Buscar temas específicos para Historia (detectar primero por "historia" o "social")
  if (subject.includes('historia') || subject.includes('social') || subject.includes('geografia')) {
    console.log('[getSpecificTopics] Detected as HISTORY');
    const topics = historyTopicsEs[normalizedCourse];
    if (topics) {
      return language === 'es' ? topics : topics;
    }
  }
  
  // FÍSICA - Detectar específicamente antes de ciencias genéricas
  if (subject.includes('fisica') || subject.includes('physics')) {
    console.log('[getSpecificTopics] Detected as PHYSICS');
    const topics = physicsTopicsEs[normalizedCourse];
    if (topics) {
      return language === 'es' ? topics : topics;
    }
  }
  
  // QUÍMICA - Detectar específicamente antes de ciencias genéricas
  if (subject.includes('quimica') || subject.includes('chemistry')) {
    console.log('[getSpecificTopics] Detected as CHEMISTRY');
    const topics = chemistryTopicsEs[normalizedCourse];
    if (topics) {
      return language === 'es' ? topics : topics;
    }
  }
  
  // BIOLOGÍA - Detectar específicamente antes de ciencias genéricas
  if (subject.includes('biologia') || subject.includes('biology')) {
    console.log('[getSpecificTopics] Detected as BIOLOGY');
    const topics = biologyTopicsEs[normalizedCourse];
    if (topics) {
      return language === 'es' ? topics : topics;
    }
  }
  
  // Buscar temas específicos para Ciencias Naturales (solo si contiene "natural" o es exactamente "ciencias")
  if (subject.includes('natural') || (subject.includes('ciencia') && !subject.includes('social'))) {
    console.log('[getSpecificTopics] Detected as SCIENCE');
    const topics = scienceTopicsEs[normalizedCourse];
    if (topics) {
      return language === 'es' ? topics : topics;
    }
  }
  
  // Buscar temas específicos para Lenguaje
  if (subject.includes('lenguaje') || subject.includes('comunicacion')) {
    console.log('[getSpecificTopics] Detected as LANGUAGE');
    const topics = languageTopicsEs[normalizedCourse];
    if (topics) {
      return language === 'es' ? topics : topics;
    }
  }
  
  return null;
}

export async function analyzeSubjectTopics(input: AnalyzeSubjectTopicsInput): Promise<AnalyzeSubjectTopicsOutput> {
  try {
    const cacheKey = `${input.courseName}_${input.subjectName}_${input.language}`;
    
    // Verificar caché
    const cached = topicsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[analyze-subject] Using cached topics');
      return { topics: cached.topics, bookTitle: cached.bookTitle };
    }

    const subjectType = detectSubjectType(input.subjectName);
    const level = getCourseLevel(input.courseName);
    
    console.log('[analyze-subject] Subject type:', subjectType, 'Level:', level);
    
    // Buscar el libro correspondiente en la biblioteca
    const book = bookPDFs.find(b => 
      b.course === input.courseName && 
      normalize(b.subject).includes(normalize(input.subjectName).split(' ')[0])
    );

    // Primero intentar obtener temas específicos por curso
    const specificTopics = getSpecificTopics(input.courseName, input.subjectName, input.language);
    if (specificTopics && specificTopics.length > 0) {
      const result = {
        topics: specificTopics,
        bookTitle: book?.title || `${input.subjectName} - ${input.courseName}`
      };
      topicsCache.set(cacheKey, { ...result, timestamp: Date.now() });
      return result;
    }

    // Usar temas heurísticos basados en tipo de asignatura y nivel
    const heuristicTopics = getHeuristicTopics(subjectType, level, input.language);
    
    const result = {
      topics: heuristicTopics,
      bookTitle: book?.title || (input.language === 'es' 
        ? `${input.subjectName} (${input.courseName})` 
        : `${input.subjectName} (${input.courseName})`)
    };
    
    // Guardar en caché
    topicsCache.set(cacheKey, { ...result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    console.error('[analyze-subject-topics] Error:', error);
    
    const subjectType = detectSubjectType(input.subjectName);
    const level = getCourseLevel(input.courseName);
    
    return { 
      topics: getHeuristicTopics(subjectType, level, input.language),
      bookTitle: input.language === 'es' ? input.subjectName : input.subjectName
    };
  }
}

// Función de conveniencia para mantener compatibilidad con el código existente de matemáticas
export async function analyzeMathPdfTopicsCompatible(input: { courseName: string; language: 'es' | 'en' }): Promise<AnalyzeSubjectTopicsOutput> {
  return analyzeSubjectTopics({
    ...input,
    subjectName: 'Matemáticas'
  });
}
