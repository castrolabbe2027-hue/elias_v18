// PDF Content Generator - Shared module for extracting educational content
// This module provides topic-specific educational content from curriculum books

export interface BookInfo {
  course: string;
  subject: string;
  title: string;
}

// Generate topic-specific educational content based on subject, topic, and course
export function generateTopicContent(subject: string, topic: string, course: string): string {
  const topicNormalized = topic.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const subjectNormalized = subject.toLowerCase();
  
  // Ciencias Naturales topics
  if (subjectNormalized.includes('ciencias naturales') || subjectNormalized.includes('biología') || subjectNormalized.includes('biologia')) {
    const content = generateCienciasNaturalesContent(topicNormalized, topic, course);
    if (content) return content;
  }
  
  // Matemáticas topics
  if (subjectNormalized.includes('matemáticas') || subjectNormalized.includes('matematicas') || subjectNormalized.includes('matemática')) {
    const content = generateMatematicasContent(topicNormalized, topic, course);
    if (content) return content;
  }
  
  // Historia topics
  if (subjectNormalized.includes('historia') || subjectNormalized.includes('sociales') || subjectNormalized.includes('geografía')) {
    const content = generateHistoriaContent(topicNormalized, topic, course);
    if (content) return content;
  }
  
  // Lenguaje topics
  if (subjectNormalized.includes('lenguaje') || subjectNormalized.includes('comunicación') || subjectNormalized.includes('comunicacion')) {
    const content = generateLenguajeContent(topicNormalized, topic, course);
    if (content) return content;
  }
  
  // Fallback - generate generic educational content
  return generateGenericContent(topic, subject, course);
}

function generateCienciasNaturalesContent(topicNormalized: string, topic: string, course: string): string | null {
  // Sistema Respiratorio
  if (topicNormalized.includes('sistema respiratorio') || topicNormalized.includes('respiratorio') || topicNormalized.includes('respiracion')) {
    return `
SISTEMA RESPIRATORIO - Contenido del Libro de Ciencias Naturales ${course}

CAPÍTULO: EL SISTEMA RESPIRATORIO HUMANO

1. INTRODUCCIÓN AL SISTEMA RESPIRATORIO
El sistema respiratorio es el conjunto de órganos que permite el intercambio de gases entre nuestro cuerpo y el ambiente. Su función principal es incorporar oxígeno (O₂) al organismo y eliminar dióxido de carbono (CO₂), un producto de desecho del metabolismo celular.

2. ÓRGANOS DEL SISTEMA RESPIRATORIO

2.1 Vías Respiratorias Superiores:

FOSAS NASALES
- Son las cavidades de entrada del aire al sistema respiratorio
- Están revestidas por mucosa nasal con cilios y moco
- Funciones: filtrar partículas, calentar y humedecer el aire
- Los vellos nasales atrapan partículas grandes

FARINGE
- Conducto muscular compartido con el sistema digestivo
- Mide aproximadamente 13 cm de longitud
- Conecta las fosas nasales con la laringe
- Contiene las amígdalas que ayudan a combatir infecciones

LARINGE
- Órgano cartilaginoso que contiene las cuerdas vocales
- Permite la producción de la voz (fonación)
- La epiglotis cierra la laringe durante la deglución para evitar que los alimentos entren a las vías respiratorias

2.2 Vías Respiratorias Inferiores:

TRÁQUEA
- Tubo de aproximadamente 12 cm de largo y 2 cm de diámetro
- Formada por anillos cartilaginosos en forma de "C"
- Revestida internamente por células ciliadas que mueven el moco hacia arriba

BRONQUIOS
- La tráquea se divide en dos bronquios principales (derecho e izquierdo)
- Cada bronquio entra a un pulmón
- Se ramifican sucesivamente en bronquios secundarios y terciarios

BRONQUIOLOS
- Son ramificaciones más pequeñas de los bronquios
- Carecen de cartílago en sus paredes
- Terminan en los sacos alveolares

ALVÉOLOS PULMONARES
- Pequeñas bolsas de aire donde ocurre el intercambio gaseoso
- Cada pulmón contiene aproximadamente 300 millones de alvéolos
- Están rodeados por una red de capilares sanguíneos
- Sus paredes son muy delgadas (0.2 micras) para facilitar la difusión de gases

PULMONES
- Son los órganos principales del sistema respiratorio
- El pulmón derecho tiene 3 lóbulos, el izquierdo tiene 2
- Están protegidos por la caja torácica
- Cubiertos por una membrana llamada pleura

DIAFRAGMA
- Músculo en forma de cúpula ubicado debajo de los pulmones
- Principal músculo de la respiración
- Al contraerse, desciende y permite la entrada de aire

3. EL PROCESO DE RESPIRACIÓN

3.1 Mecánica Respiratoria:

INSPIRACIÓN (Inhalación)
- El diafragma se contrae y desciende
- Los músculos intercostales elevan las costillas
- La cavidad torácica aumenta de volumen
- Los pulmones se expanden
- El aire entra por diferencia de presión

ESPIRACIÓN (Exhalación)
- El diafragma se relaja y asciende
- Los músculos intercostales se relajan
- La cavidad torácica disminuye de volumen
- Los pulmones se comprimen
- El aire sale al exterior

3.2 Frecuencia Respiratoria:
- Adulto en reposo: 12-20 respiraciones por minuto
- Niños: 20-30 respiraciones por minuto
- Durante el ejercicio la frecuencia aumenta

4. INTERCAMBIO GASEOSO

4.1 En los Alvéolos Pulmonares (Respiración Externa):
- El oxígeno pasa del aire alveolar a la sangre de los capilares
- El dióxido de carbono pasa de la sangre al aire alveolar
- Este proceso ocurre por difusión simple
- Depende de las diferencias de presión parcial de los gases

4.2 En los Tejidos (Respiración Interna):
- El oxígeno pasa de la sangre a las células
- El dióxido de carbono pasa de las células a la sangre
- Las células usan el oxígeno para la respiración celular

5. CUIDADOS DEL SISTEMA RESPIRATORIO

5.1 Hábitos Saludables:
- Respirar por la nariz para filtrar y calentar el aire
- Evitar ambientes con aire contaminado
- No fumar ni exponerse al humo del tabaco
- Realizar ejercicio físico regularmente
- Mantener una buena postura para facilitar la respiración

5.2 Prevención de Enfermedades:
- Lavarse las manos frecuentemente
- Cubrirse al toser o estornudar
- Ventilar los espacios cerrados
- Evitar cambios bruscos de temperatura
- Vacunarse según el calendario de vacunación

6. ENFERMEDADES DEL SISTEMA RESPIRATORIO

ENFERMEDADES COMUNES:
- Resfriado común: Infección viral leve de las vías superiores
- Gripe: Infección viral más severa con fiebre y malestar general
- Bronquitis: Inflamación de los bronquios
- Neumonía: Infección de los pulmones
- Asma: Inflamación crónica con dificultad para respirar

FACTORES DE RIESGO:
- Tabaquismo (causa principal de enfermedades respiratorias graves)
- Contaminación del aire
- Exposición a sustancias tóxicas
- Falta de actividad física
- Sistema inmune debilitado

7. ACTIVIDADES DE APRENDIZAJE

EXPERIMENTO: La Capacidad Pulmonar
Materiales: Botella grande, manguera, recipiente con agua
Procedimiento: Medir el volumen de aire que puedes exhalar

REFLEXIÓN:
¿Por qué es importante cuidar nuestro sistema respiratorio?
¿Cómo afecta la contaminación a nuestra salud respiratoria?
¿Qué podemos hacer para mantener sanos nuestros pulmones?
`;
  }
  
  // Célula
  if (topicNormalized.includes('celula') || topicNormalized.includes('celular') || topicNormalized.includes('célula')) {
    return `
LA CÉLULA - Contenido del Libro de Ciencias Naturales ${course}

CAPÍTULO: LA CÉLULA - UNIDAD BÁSICA DE LA VIDA

1. INTRODUCCIÓN
La célula es la unidad estructural y funcional de todos los seres vivos. Es la estructura más pequeña capaz de realizar todas las funciones vitales: nutrición, relación y reproducción.

2. TEORÍA CELULAR

La teoría celular, establecida en el siglo XIX, postula que:
1. Todos los seres vivos están formados por células
2. La célula es la unidad funcional de los seres vivos
3. Toda célula proviene de otra célula preexistente

Científicos importantes:
- Robert Hooke (1665): Observó por primera vez las células en el corcho
- Anton van Leeuwenhoek: Observó microorganismos
- Matthias Schleiden y Theodor Schwann: Formularon la teoría celular
- Rudolf Virchow: Estableció que toda célula proviene de otra célula

3. TIPOS DE CÉLULAS

3.1 CÉLULAS PROCARIOTAS
- No poseen núcleo definido (el material genético está libre en el citoplasma)
- Son más pequeñas y simples
- No tienen organelos membranosos
- Ejemplos: bacterias y arqueas

3.2 CÉLULAS EUCARIOTAS
- Poseen núcleo definido con envoltura nuclear
- Son más grandes y complejas
- Tienen organelos membranosos especializados
- Ejemplos: células animales, vegetales, de hongos y protistas

4. PARTES DE LA CÉLULA EUCARIOTA

4.1 MEMBRANA CELULAR (Membrana Plasmática)
- Estructura: Bicapa de fosfolípidos con proteínas
- Función: Controla el paso de sustancias hacia dentro y fuera de la célula
- Es selectivamente permeable
- Participa en la comunicación celular

4.2 CITOPLASMA
- Medio gelatinoso entre la membrana y el núcleo
- Compuesto principalmente por agua, sales y moléculas orgánicas
- Contiene el citoesqueleto que da forma a la célula
- Alberga los organelos celulares

4.3 NÚCLEO
- Centro de control de la célula
- Contiene el material genético (ADN)
- Está rodeado por la envoltura nuclear
- Contiene el nucléolo donde se forman los ribosomas

4.4 ORGANELOS CELULARES

MITOCONDRIAS
- Función: Producen energía (ATP) mediante la respiración celular
- Llamadas "las centrales energéticas de la célula"
- Tienen su propio ADN

RIBOSOMAS
- Función: Síntesis de proteínas
- Pueden estar libres en el citoplasma o adheridos al retículo endoplasmático
- Formados por ARN ribosomal y proteínas

RETÍCULO ENDOPLASMÁTICO
- RE Rugoso: Con ribosomas, sintetiza proteínas
- RE Liso: Sin ribosomas, sintetiza lípidos y desintoxica

APARATO DE GOLGI
- Función: Modifica, empaqueta y distribuye proteínas y lípidos
- Forma vesículas para transporte

LISOSOMAS
- Función: Digestión intracelular
- Contienen enzimas digestivas
- Eliminan desechos y estructuras dañadas

5. ORGANELOS EXCLUSIVOS DE CÉLULAS VEGETALES

PARED CELULAR
- Estructura rígida exterior a la membrana
- Compuesta principalmente de celulosa
- Función: Protección y soporte estructural

CLOROPLASTOS
- Función: Realizan la fotosíntesis
- Contienen clorofila (pigmento verde)
- Producen glucosa usando luz solar

VACUOLA CENTRAL
- Gran vacuola que ocupa la mayor parte de la célula
- Función: Almacena agua, nutrientes, pigmentos y desechos
- Mantiene la presión de turgencia

6. FUNCIONES CELULARES

NUTRICIÓN
- Obtención de nutrientes del medio
- Transformación en energía y materiales para la célula

RELACIÓN
- Respuesta a estímulos del ambiente
- Comunicación con otras células

REPRODUCCIÓN
- División celular para crear nuevas células
- Mitosis (células somáticas)
- Meiosis (células reproductivas)

7. DIFERENCIAS ENTRE CÉLULA ANIMAL Y VEGETAL

CÉLULA ANIMAL:
- No tiene pared celular
- No tiene cloroplastos
- Tiene centriolos
- Vacuolas pequeñas y múltiples
- Forma irregular

CÉLULA VEGETAL:
- Tiene pared celular de celulosa
- Tiene cloroplastos para fotosíntesis
- No tiene centriolos
- Una gran vacuola central
- Forma regular (generalmente rectangular)
`;
  }
  
  // Fotosíntesis
  if (topicNormalized.includes('fotosintesis') || topicNormalized.includes('fotosíntesis')) {
    return `
LA FOTOSÍNTESIS - Contenido del Libro de Ciencias Naturales ${course}

CAPÍTULO: LA FOTOSÍNTESIS - EL PROCESO QUE SOSTIENE LA VIDA

1. DEFINICIÓN
La fotosíntesis es el proceso mediante el cual las plantas, algas y algunas bacterias transforman la energía luminosa del sol en energía química almacenada en forma de glucosa.

2. ECUACIÓN DE LA FOTOSÍNTESIS

6CO₂ + 6H₂O + Luz solar → C₆H₁₂O₆ + 6O₂

Dióxido de carbono + Agua + Energía luminosa → Glucosa + Oxígeno

3. ESTRUCTURAS INVOLUCRADAS

CLOROPLASTOS
- Organelos donde ocurre la fotosíntesis
- Contienen tilacoides (membranas internas) y estroma
- Poseen su propio ADN

CLOROFILA
- Pigmento verde que captura la luz
- Ubicada en los tilacoides
- Absorbe luz roja y azul, refleja verde

ESTOMAS
- Poros en las hojas
- Permiten entrada de CO₂ y salida de O₂
- Regulan la pérdida de agua

4. FASES DE LA FOTOSÍNTESIS

FASE LUMINOSA (Reacciones Dependientes de la Luz)
- Ocurre en los tilacoides
- Requiere luz solar directa
- Proceso:
  1. La clorofila absorbe energía luminosa
  2. El agua se descompone (fotólisis): 2H₂O → 4H⁺ + 4e⁻ + O₂
  3. Se libera oxígeno como subproducto
  4. Se produce ATP y NADPH (moléculas energéticas)

FASE OSCURA (Ciclo de Calvin)
- Ocurre en el estroma del cloroplasto
- No requiere luz directa (pero usa productos de la fase luminosa)
- Proceso:
  1. Fijación del CO₂ (se incorpora carbono)
  2. Reducción usando ATP y NADPH
  3. Síntesis de glucosa (C₆H₁₂O₆)
  4. Regeneración de la molécula receptora

5. FACTORES QUE AFECTAN LA FOTOSÍNTESIS

INTENSIDAD LUMINOSA
- Mayor luz = mayor fotosíntesis (hasta un punto de saturación)
- Muy poca luz reduce significativamente el proceso

CONCENTRACIÓN DE CO₂
- Mayor CO₂ = mayor fotosíntesis (hasta cierto límite)
- Es el factor limitante más común

TEMPERATURA
- Temperatura óptima: 25-35°C para la mayoría de plantas
- Temperaturas extremas reducen la eficiencia

DISPONIBILIDAD DE AGUA
- El agua es reactivo esencial
- La falta de agua cierra los estomas y reduce la fotosíntesis

6. IMPORTANCIA DE LA FOTOSÍNTESIS

PARA LA VIDA EN LA TIERRA:
- Produce el oxígeno que respiramos
- Es la base de las cadenas alimenticias
- Regula el CO₂ atmosférico (efecto invernadero)
- Produce toda la materia orgánica del planeta

PARA EL ECOSISTEMA:
- Las plantas son productores primarios
- Transforman energía solar en energía química
- Sostienen a todos los demás organismos

7. RELACIÓN CON LA RESPIRACIÓN CELULAR

La fotosíntesis y la respiración celular son procesos complementarios:

FOTOSÍNTESIS:
- Consume CO₂ y H₂O
- Libera O₂
- Almacena energía en glucosa
- Ocurre en cloroplastos
- Requiere luz

RESPIRACIÓN CELULAR:
- Consume O₂ y glucosa
- Libera CO₂ y H₂O
- Libera energía (ATP)
- Ocurre en mitocondrias
- No requiere luz
`;
  }
  
  // Sistema digestivo
  if (topicNormalized.includes('sistema digestivo') || topicNormalized.includes('digestivo') || topicNormalized.includes('digestion')) {
    return `
SISTEMA DIGESTIVO - Contenido del Libro de Ciencias Naturales ${course}

CAPÍTULO: EL SISTEMA DIGESTIVO

1. FUNCIÓN DEL SISTEMA DIGESTIVO
El sistema digestivo transforma los alimentos en nutrientes que pueden ser absorbidos y utilizados por las células del cuerpo.

2. ÓRGANOS DEL TUBO DIGESTIVO

BOCA
- Inicia la digestión mecánica (masticación) y química (saliva)
- Contiene dientes, lengua y glándulas salivales
- La saliva contiene amilasa que digiere almidones

FARINGE
- Conecta la boca con el esófago
- Participa en la deglución

ESÓFAGO
- Tubo muscular de aproximadamente 25 cm
- Transporta el bolo alimenticio al estómago
- Movimientos peristálticos impulsan el alimento

ESTÓMAGO
- Órgano en forma de bolsa
- Digiere proteínas con ácido clorhídrico y pepsina
- El quimo es el resultado de la digestión estomacal

INTESTINO DELGADO
- Mide aproximadamente 6-7 metros
- Tres partes: duodeno, yeyuno e íleon
- Ocurre la mayor absorción de nutrientes
- Vellosidades intestinales aumentan la superficie de absorción

INTESTINO GRUESO
- Mide aproximadamente 1.5 metros
- Absorbe agua y sales minerales
- Forma y almacena las heces fecales
- Contiene bacterias beneficiosas (flora intestinal)

3. GLÁNDULAS ANEXAS

GLÁNDULAS SALIVALES
- Producen saliva con enzimas digestivas
- Humedecen el alimento

HÍGADO
- Produce bilis para emulsionar grasas
- Almacena glucosa como glucógeno
- Desintoxica la sangre

PÁNCREAS
- Produce jugo pancreático con enzimas digestivas
- Produce insulina y glucagón (hormonas)

VESÍCULA BILIAR
- Almacena y concentra la bilis
- Libera bilis al duodeno durante la digestión

4. PROCESOS DIGESTIVOS

DIGESTIÓN MECÁNICA
- Fragmentación física del alimento
- Incluye masticación y movimientos peristálticos

DIGESTIÓN QUÍMICA
- Enzimas descomponen moléculas complejas
- Amilasa: digiere almidones
- Proteasas: digieren proteínas
- Lipasas: digieren grasas

ABSORCIÓN
- Paso de nutrientes al torrente sanguíneo
- Ocurre principalmente en el intestino delgado

ELIMINACIÓN
- Expulsión de materiales no digeridos
- Formación de heces fecales

5. CUIDADOS DEL SISTEMA DIGESTIVO

- Masticar bien los alimentos
- Comer despacio y en horarios regulares
- Consumir fibra (frutas, verduras, cereales integrales)
- Beber suficiente agua
- Evitar comidas muy grasas o picantes
- Realizar actividad física
`;
  }
  
  return null;
}

function generateMatematicasContent(topicNormalized: string, topic: string, course: string): string | null {
  // Sumas y Restas
  if (topicNormalized.includes('suma') || topicNormalized.includes('resta') || topicNormalized.includes('adicion') || topicNormalized.includes('sustraccion')) {
    return `
## SUMAS Y RESTAS - Libro de Matemáticas ${course}

### CAPÍTULO: OPERACIONES BÁSICAS - SUMA Y RESTA

---

## PARTE 1: LA SUMA (ADICIÓN)

### 1. ¿Qué es la suma?

La suma o adición es una operación matemática que consiste en **combinar o añadir** dos o más cantidades para obtener una cantidad total llamada **SUMA** o **TOTAL**.

### 2. Partes de la suma

**Estructura:**
- **25** → Primer sumando
- **+ 18** → Segundo sumando
- **= 43** → Suma, total o resultado

*El símbolo "+" se lee "más"*

### 3. Propiedades de la suma

**PROPIEDAD CONMUTATIVA:** El orden de los sumandos no altera la suma
- Ejemplo: 5 + 3 = 3 + 5 = **8**

**PROPIEDAD ASOCIATIVA:** Se pueden agrupar los sumandos de diferentes formas
- Ejemplo: (2 + 3) + 4 = 2 + (3 + 4) = **9**

**ELEMENTO NEUTRO:** Cualquier número sumado con cero da el mismo número
- Ejemplo: 7 + 0 = **7**

### 4. Pasos para sumar (Método vertical)

1. Escribir los números uno debajo del otro, alineando las unidades
2. Sumar de derecha a izquierda (comenzando por las unidades)
3. Si la suma de una columna es 10 o más, "llevar" la decena a la siguiente columna
4. Escribir el resultado

---

## EJEMPLO RESUELTO #1: Suma sin llevar

**Calcular: 234 + 152**

| Posición | Centenas | Decenas | Unidades |
|----------|----------|---------|----------|
| Número 1 | 2 | 3 | 4 |
| Número 2 | + 1 | + 5 | + 2 |
| **Resultado** | **3** | **8** | **6** |

**Paso a paso:**
- Unidades: 4 + 2 = **6**
- Decenas: 3 + 5 = **8**
- Centenas: 2 + 1 = **3**

**RESULTADO: 234 + 152 = 386**

---

## EJEMPLO RESUELTO #2: Suma con llevada

**Calcular: 567 + 285**

**Paso a paso:**

**PASO 1 - Unidades:** 7 + 5 = 12
- Escribo **2**, llevo **1** a las decenas

**PASO 2 - Decenas:** 6 + 8 = 14, más 1 que llevaba = 15
- Escribo **5**, llevo **1** a las centenas

**PASO 3 - Centenas:** 5 + 2 = 7, más 1 que llevaba = 8
- Escribo **8**

**RESULTADO: 567 + 285 = 852**

---

## PARTE 2: LA RESTA (SUSTRACCIÓN)

### 1. ¿Qué es la resta?

La resta o sustracción es una operación matemática que consiste en **quitar** una cantidad de otra para encontrar la **DIFERENCIA** entre ambas.

### 2. Partes de la resta

**Estructura:**
- **45** → Minuendo (cantidad mayor)
- **- 18** → Sustraendo (lo que quito)
- **= 27** → Diferencia o resultado

*El símbolo "-" se lee "menos"*

### 3. Regla importante

⚠️ El **MINUENDO** siempre debe ser **MAYOR o IGUAL** que el **SUSTRAENDO**
(No podemos quitar más de lo que tenemos en números naturales)

### 4. Pasos para restar (Método vertical)

1. Escribir el minuendo arriba y el sustraendo abajo, alineando las unidades
2. Restar de derecha a izquierda (comenzando por las unidades)
3. Si el dígito de arriba es menor, "pedir prestado" a la posición siguiente
4. Escribir el resultado

---

## EJEMPLO RESUELTO #3: Resta sin prestar

**Calcular: 586 - 243**

| Posición | Centenas | Decenas | Unidades |
|----------|----------|---------|----------|
| Minuendo | 5 | 8 | 6 |
| Sustraendo | - 2 | - 4 | - 3 |
| **Resultado** | **3** | **4** | **3** |

**Paso a paso:**
- Unidades: 6 - 3 = **3**
- Decenas: 8 - 4 = **4**
- Centenas: 5 - 2 = **3**

**RESULTADO: 586 - 243 = 343**

---

## EJEMPLO RESUELTO #4: Resta con préstamo

**Calcular: 523 - 187**

**Paso a paso:**

**PASO 1 - Unidades:** 3 - 7 = ¡No se puede!
- Pido 1 decena prestada (el 2 se convierte en 1)
- Ahora: 13 - 7 = **6**

**PASO 2 - Decenas:** 1 - 8 = ¡No se puede!
- Pido 1 centena prestada (el 5 se convierte en 4)
- Ahora: 11 - 8 = **3**

**PASO 3 - Centenas:** 4 - 1 = **3**

**RESULTADO: 523 - 187 = 336**

---

## PARTE 3: Relación entre suma y resta

La suma y la resta son **OPERACIONES INVERSAS**. Una deshace lo que hace la otra.

**Verificación de resultados:**
- Si 25 + 18 = 43, entonces 43 - 18 = 25 y 43 - 25 = 18
- Si 50 - 23 = 27, entonces 27 + 23 = 50

Esto nos sirve para **COMPROBAR** si nuestros cálculos están correctos.

---

## PARTE 4: PROBLEMAS DE LA VIDA REAL

### PROBLEMA 1: Dinero

**Situación:** María tenía $1.250 ahorrados. Su abuela le regaló $780 por su cumpleaños. ¿Cuánto dinero tiene María ahora?

**Identificación:**
- Dato 1: Tenía $1.250
- Dato 2: Le dieron $780
- Pregunta: ¿Cuánto tiene ahora? → **SUMA** (le dieron más)

**Resolución:**
- 1.250 + 780 = **2.030**

**Respuesta:** María tiene **$2.030**

**Comprobación:** 2.030 - 780 = 1.250 ✓

---

### PROBLEMA 2: Distancia

**Situación:** Un ciclista debe recorrer 2.500 metros. Ya ha recorrido 1.875 metros. ¿Cuántos metros le faltan por recorrer?

**Identificación:**
- Dato 1: Total a recorrer = 2.500 m
- Dato 2: Ya recorrió = 1.875 m
- Pregunta: ¿Cuánto falta? → **RESTA** (quitar lo recorrido)

**Resolución:**
- 2.500 - 1.875 = **625**

**Respuesta:** Le faltan **625 metros**

**Comprobación:** 1.875 + 625 = 2.500 ✓

---

### PROBLEMA 3: Edades

**Situación:** Pedro tiene 12 años y su hermana Ana tiene 8 años. Su papá tiene 35 años más que Ana. ¿Cuántos años tiene el papá? ¿Cuál es la diferencia de edad entre Pedro y Ana?

**Resolución Parte A (Edad del papá):**
- Ana tiene 8 años
- Papá tiene 35 años MÁS que Ana → SUMA
- Edad del papá = 8 + 35 = **43 años**

**Resolución Parte B (Diferencia de edad):**
- Pedro = 12 años, Ana = 8 años
- Diferencia = 12 - 8 = **4 años**

**Respuestas:**
- El papá tiene **43 años**
- La diferencia entre Pedro y Ana es de **4 años**

---

### PROBLEMA 4: Tienda

**Situación:** En una tienda había 456 manzanas. Llegaron 238 manzanas más. Durante el día se vendieron 389 manzanas. ¿Cuántas manzanas quedan en la tienda?

**Paso 1:** Calcular el total después de que llegaron más
- 456 + 238 = **694 manzanas**

**Paso 2:** Restar las que se vendieron
- 694 - 389 = **305 manzanas**

**Respuesta:** Quedan **305 manzanas** en la tienda

**Comprobación:** 305 + 389 = 694 ✓

---

## EJERCICIOS PARA PRACTICAR

**Nivel Básico:**
1. 345 + 231 = ?
2. 567 - 234 = ?
3. 189 + 456 = ?

**Nivel Intermedio:**
4. 678 + 394 = ?
5. 805 - 467 = ?
6. 1.234 + 876 = ?

**Nivel Avanzado:**
7. 3.456 + 2.789 = ?
8. 5.002 - 1.847 = ?
9. 8.765 - 4.987 = ?

**Problemas:**
10. Juan tenía 1.500 figuritas y regaló 875. ¿Cuántas le quedan?
11. Una biblioteca tiene 2.340 libros. Llegan 567 libros nuevos. ¿Cuántos hay ahora?
12. Un estadio tiene 15.000 asientos. Se ocuparon 12.456. ¿Cuántos quedan vacíos?

---

## CONSEJOS PARA NO EQUIVOCARSE

- Siempre alinear bien los números por posición (unidades con unidades)
- Comenzar siempre de derecha a izquierda
- No olvidar lo que llevamos o pedimos prestado
- Comprobar el resultado con la operación inversa
- En problemas, identificar primero qué operación usar
- Leer el problema completo antes de resolver
`;
  }

  // Multiplicación y División
  if (topicNormalized.includes('multiplicacion') || topicNormalized.includes('division') || topicNormalized.includes('multiplicar') || topicNormalized.includes('dividir')) {
    return `
## MULTIPLICACIÓN Y DIVISIÓN - Libro de Matemáticas ${course}

### CAPÍTULO: OPERACIONES - MULTIPLICACIÓN Y DIVISIÓN

---

## PARTE 1: LA MULTIPLICACIÓN

### 1. ¿Qué es la multiplicación?

La multiplicación es una **suma abreviada** de sumandos iguales.

En lugar de sumar: 4 + 4 + 4 + 4 + 4 = 20
Escribimos: **4 × 5 = 20** (4 sumado 5 veces)

### 2. Partes de la multiplicación

**Estructura:**
- **23** → Multiplicando
- **× 4** → Multiplicador
- **= 92** → Producto (resultado)

*Los números que se multiplican también se llaman FACTORES*

### 3. Las tablas de multiplicar

Es fundamental memorizar las tablas del 1 al 10.

**Tabla del 2:** 2, 4, 6, 8, 10, 12, 14, 16, 18, 20
**Tabla del 3:** 3, 6, 9, 12, 15, 18, 21, 24, 27, 30
**Tabla del 4:** 4, 8, 12, 16, 20, 24, 28, 32, 36, 40
**Tabla del 5:** 5, 10, 15, 20, 25, 30, 35, 40, 45, 50
**Tabla del 6:** 6, 12, 18, 24, 30, 36, 42, 48, 54, 60
**Tabla del 7:** 7, 14, 21, 28, 35, 42, 49, 56, 63, 70
**Tabla del 8:** 8, 16, 24, 32, 40, 48, 56, 64, 72, 80
**Tabla del 9:** 9, 18, 27, 36, 45, 54, 63, 72, 81, 90

### 4. Propiedades de la multiplicación

**PROPIEDAD CONMUTATIVA:** El orden no altera el producto
- Ejemplo: 3 × 5 = 5 × 3 = **15**

**PROPIEDAD ASOCIATIVA:** Se pueden agrupar los factores
- Ejemplo: (2 × 3) × 4 = 2 × (3 × 4) = **24**

**ELEMENTO NEUTRO:** Todo número multiplicado por 1 da el mismo número
- Ejemplo: 7 × 1 = **7**

**ELEMENTO ABSORBENTE:** Todo número multiplicado por 0 da 0
- Ejemplo: 8 × 0 = **0**

**PROPIEDAD DISTRIBUTIVA:** a × (b + c) = (a × b) + (a × c)
- Ejemplo: 3 × (4 + 2) = 3×4 + 3×2 = 12 + 6 = **18**

---

## EJEMPLO RESUELTO #1: Multiplicación por una cifra

**Calcular: 347 × 6**

**Paso a paso:**

**PASO 1:** 7 × 6 = 42 → Escribo **2**, llevo **4**

**PASO 2:** 4 × 6 = 24, + 4 = 28 → Escribo **8**, llevo **2**

**PASO 3:** 3 × 6 = 18, + 2 = 20 → Escribo **20**

**RESULTADO: 347 × 6 = 2.082**

---

## EJEMPLO RESUELTO #2: Multiplicación por dos cifras

**Calcular: 234 × 56**

**Paso a paso:**

**PASO 1:** Multiplicar 234 × 6 = **1.404**

**PASO 2:** Multiplicar 234 × 5 = **1.170** (escribir desplazado una posición)

**PASO 3:** Sumar los productos parciales
- 1.404 + 11.700 = **13.104**

**RESULTADO: 234 × 56 = 13.104**

---

## PARTE 2: LA DIVISIÓN

### 1. ¿Qué es la división?

La división es **repartir** una cantidad en partes iguales o averiguar cuántas veces cabe un número en otro.

### 2. Partes de la división

**Estructura:**
- **156** → Dividendo (lo que reparto)
- **÷ 12** → Divisor (en cuántas partes)
- **= 13** → Cociente (resultado)
- **resto 0** → Resto (lo que sobra)

### 3. Tipos de división

**DIVISIÓN EXACTA:** El resto es 0
- Ejemplo: 20 ÷ 4 = 5 (resto 0)

**DIVISIÓN INEXACTA:** El resto es mayor que 0
- Ejemplo: 23 ÷ 4 = 5 (resto 3)

### 4. Relación fundamental

**Dividendo = Divisor × Cociente + Resto**
- Ejemplo: 23 = 4 × 5 + 3 ✓

---

## EJEMPLO RESUELTO #3: División por una cifra

**Calcular: 847 ÷ 7**

**Paso a paso:**

**PASO 1:** ¿Cuántas veces cabe 7 en 8? → **1 vez** (1×7=7)
- 8 - 7 = 1 → Bajo el 4 → Queda 14

**PASO 2:** ¿Cuántas veces cabe 7 en 14? → **2 veces** (2×7=14)
- 14 - 14 = 0 → Bajo el 7 → Queda 7

**PASO 3:** ¿Cuántas veces cabe 7 en 7? → **1 vez** (1×7=7)
- 7 - 7 = 0

**RESULTADO: 847 ÷ 7 = 121** (resto 0) → División exacta

**Comprobación:** 7 × 121 + 0 = 847 ✓

---

## EJEMPLO RESUELTO #4: División con resto

**Calcular: 593 ÷ 8**

**Paso a paso:**

**PASO 1:** ¿Cuántas veces cabe 8 en 5? → 0 veces (tomamos 59)

**PASO 2:** ¿Cuántas veces cabe 8 en 59? → **7 veces** (7×8=56)
- 59 - 56 = 3 → Bajo el 3 → Queda 33

**PASO 3:** ¿Cuántas veces cabe 8 en 33? → **4 veces** (4×8=32)
- 33 - 32 = 1

**RESULTADO: 593 ÷ 8 = 74** (resto 1)

**Comprobación:** 8 × 74 + 1 = 592 + 1 = 593 ✓

---

## PARTE 3: Relación entre multiplicación y división

La multiplicación y la división son **OPERACIONES INVERSAS**.

- Si 6 × 8 = 48, entonces 48 ÷ 8 = 6 y 48 ÷ 6 = 8
- Si 72 ÷ 9 = 8, entonces 8 × 9 = 72

---

## PARTE 4: PROBLEMAS DE LA VIDA REAL

### PROBLEMA 1: Compras

**Situación:** Una caja de galletas cuesta $1.250. Si compras 8 cajas, ¿cuánto pagas en total?

**Identificación:**
- Precio de una caja: $1.250
- Cantidad de cajas: 8
- Pregunta: Total a pagar → **MULTIPLICACIÓN**

**Resolución:**
- 1.250 × 8 = **10.000**

**Respuesta:** Debes pagar **$10.000**

---

### PROBLEMA 2: Repartir

**Situación:** Una profesora tiene 156 lápices para repartir entre 12 estudiantes en partes iguales. ¿Cuántos lápices recibe cada estudiante?

**Identificación:**
- Total de lápices: 156
- Número de estudiantes: 12
- Pregunta: ¿Cuántos para cada uno? → **DIVISIÓN**

**Resolución:**
- 156 ÷ 12 = **13**

**Respuesta:** Cada estudiante recibe **13 lápices**

**Comprobación:** 12 × 13 = 156 ✓

---

### PROBLEMA 3: Transporte

**Situación:** Un bus escolar puede llevar 45 pasajeros. Si hay 320 estudiantes que deben ir a un paseo, ¿cuántos buses se necesitan?

**Resolución:**
- 320 ÷ 45 = 7 (resto 5)
- 7 buses llevan: 7 × 45 = 315 estudiantes
- Quedan: 5 estudiantes sin bus

⚠️ **ATENCIÓN:** Aunque el resto es 5, necesitamos un bus más para esos estudiantes

**Respuesta:** Se necesitan **8 buses** (7 buses completos + 1 bus para los 5 restantes)

---

### PROBLEMA 4: Producción

**Situación:** Una fábrica produce 2.340 botellas por hora. ¿Cuántas botellas produce en 24 horas?

**Resolución:**
- 2.340 × 24 = **56.160**

**Respuesta:** La fábrica produce **56.160 botellas** en 24 horas

---

## CONSEJOS PARA MULTIPLICAR Y DIVIDIR

**Para la multiplicación:**
- Memorizar las tablas de multiplicar
- Alinear bien los productos parciales
- No olvidar lo que llevamos
- Usar la propiedad conmutativa si es más fácil

**Para la división:**
- El divisor siempre debe ser menor que el dividendo parcial
- El resto siempre debe ser menor que el divisor
- Comprobar con la fórmula: D = d × c + r
- Practicar la estimación de cuántas veces cabe
`;
  }

  // Fracciones - nuevo formato Markdown
  if (topicNormalized.includes('fraccion') || topicNormalized.includes('fracciones')) {
    return generateFraccionesContent(topic, course);
  }

  // Ecuaciones - nuevo formato Markdown
  if (topicNormalized.includes('ecuacion') || topicNormalized.includes('ecuaciones') || topicNormalized.includes('algebra') || topicNormalized.includes('despejar')) {
    return generateEcuacionesContent(topic, course);
  }
  
  return null;
}

// Contenido de Fracciones en formato Markdown
function generateFraccionesContent(topic: string, course: string): string {
  return `
## FRACCIONES - Libro de Matemáticas ${course}

### CAPÍTULO: FRACCIONES - CONCEPTOS Y OPERACIONES

---

## PARTE 1: ¿QUÉ ES UNA FRACCIÓN?

Una fracción representa una o más partes iguales de un todo dividido en partes iguales.

### Partes de una fracción

**Estructura:**
- **3** → NUMERADOR (cuántas partes tomamos)
- **―** → Línea divisoria
- **4** → DENOMINADOR (en cuántas partes se divide el todo)

**Se lee:** "tres cuartos" = **3/4**

### Representación visual de 3/4

| Parte 1 | Parte 2 | Parte 3 | Parte 4 |
|---------|---------|---------|---------|
| ✓ | ✓ | ✓ | ○ |

→ 3 partes pintadas de 4 = **3/4**

---

## PARTE 2: TIPOS DE FRACCIONES

### 1. Fracciones PROPIAS (menor que 1)
**Numerador < Denominador**

Ejemplos:
- 1/2 (un medio)
- 3/4 (tres cuartos)
- 5/8 (cinco octavos)

### 2. Fracciones IMPROPIAS (mayor que 1)
**Numerador > Denominador**

Ejemplos:
- 5/4 (cinco cuartos)
- 7/3 (siete tercios)
- 9/2 (nueve medios)

### 3. Números MIXTOS
**Parte entera + fracción propia**

Ejemplos:
- 1 1/2 (uno y medio)
- 2 3/4 (dos y tres cuartos)
- 3 2/5 (tres y dos quintos)

---

## PARTE 3: FRACCIONES EQUIVALENTES

Fracciones equivalentes representan la **MISMA** cantidad aunque tengan diferentes numeradores y denominadores.

**Ejemplos:**
- 1/2 = 2/4 = 3/6 = 4/8 = 5/10

### Cómo obtener fracciones equivalentes

**AMPLIFICAR:** Multiplicar numerador y denominador por el mismo número
- 1/2 × 3/3 = 3/6 ✓

**SIMPLIFICAR:** Dividir numerador y denominador por el mismo número
- 6/8 ÷ 2/2 = 3/4 ✓

---

## PARTE 4: OPERACIONES CON FRACCIONES

### SUMA DE FRACCIONES

**Con igual denominador:**
- 2/5 + 1/5 = 3/5
- (Se suman los numeradores, el denominador queda igual)

**Con diferente denominador:**
1. Encontrar denominador común
2. Convertir las fracciones
3. Sumar los numeradores

**Ejemplo:** 1/3 + 1/4

1. Denominador común: 12 (mínimo común múltiplo de 3 y 4)
2. Convertir: 1/3 = 4/12, 1/4 = 3/12
3. Sumar: 4/12 + 3/12 = **7/12**

---

### RESTA DE FRACCIONES

**Con igual denominador:**
- 5/8 - 2/8 = 3/8

**Con diferente denominador:**
- Mismo procedimiento que la suma

**Ejemplo:** 3/4 - 1/3

1. Denominador común: 12
2. Convertir: 3/4 = 9/12, 1/3 = 4/12
3. Restar: 9/12 - 4/12 = **5/12**

---

### MULTIPLICACIÓN DE FRACCIONES

**Regla:** Numerador × numerador, denominador × denominador

**Ejemplo:** 2/3 × 4/5

- 2 × 4 = 8
- 3 × 5 = 15
- Resultado: **8/15**

---

### DIVISIÓN DE FRACCIONES

**Regla:** Multiplicar por el inverso de la segunda fracción

**Ejemplo:** 3/4 ÷ 2/5

1. Invertir la segunda fracción: 2/5 → 5/2
2. Multiplicar: 3/4 × 5/2 = 15/8
- Resultado: **15/8** o **1 7/8**

---

## PARTE 5: CONVERSIONES

### De fracción impropia a número mixto

**Ejemplo:** 11/4

- Dividir: 11 ÷ 4 = 2 (cociente) resto 3
- Resultado: **2 3/4**

### De número mixto a fracción impropia

**Ejemplo:** 3 2/5

- Calcular: (3 × 5) + 2 = 17
- Resultado: **17/5**

---

## PARTE 6: PROBLEMAS RESUELTOS

### PROBLEMA 1: Pizza

**Situación:** Una pizza se dividió en 8 partes iguales. María comió 3 partes y Juan comió 2 partes. ¿Qué fracción de pizza comieron entre los dos? ¿Cuánta pizza quedó?

**Resolución:**
- María: 3/8
- Juan: 2/8
- Total comido: 3/8 + 2/8 = **5/8**
- Pizza que quedó: 8/8 - 5/8 = **3/8**

---

### PROBLEMA 2: Terreno

**Situación:** Un terreno se divide en partes iguales. Pedro tiene 2/5 del terreno y Ana tiene 1/3. ¿Cuánto tienen entre los dos?

**Resolución:**
1. Denominador común: 15
2. Pedro: 2/5 = 6/15
3. Ana: 1/3 = 5/15
4. Total: 6/15 + 5/15 = **11/15**

**Respuesta:** Entre los dos tienen **11/15** del terreno

---

## CONSEJOS IMPORTANTES

- Siempre simplificar el resultado final
- En suma y resta, necesitas denominador común
- En multiplicación, multiplicar en cruz
- En división, invertir y multiplicar
- Practicar conversiones entre tipos de fracciones
`;
}

// Contenido de Ecuaciones en formato Markdown
function generateEcuacionesContent(topic: string, course: string): string {
  return `
## ECUACIONES - Libro de Matemáticas ${course}

### CAPÍTULO: INTRODUCCIÓN AL ÁLGEBRA - ECUACIONES

---

## PARTE 1: ¿QUÉ ES UNA ECUACIÓN?

Una ecuación es una **igualdad matemática** donde hay al menos un valor desconocido (incógnita) que debemos encontrar.

### Ejemplo básico

**x + 5 = 12**

- **x** → Incógnita (valor desconocido)
- **+5** → Operación
- **=** → Signo igual (indica igualdad)
- **12** → Resultado conocido

**Solución:** x = 7 (porque 7 + 5 = 12)

---

## PARTE 2: PARTES DE UNA ECUACIÓN

| Elemento | Descripción | Ejemplo en: 3x + 2 = 14 |
|----------|-------------|-------------------------|
| Incógnita | Valor a encontrar | x |
| Coeficiente | Número que multiplica | 3 |
| Término independiente | Número solo | 2 y 14 |
| Miembros | Lados de la ecuación | (3x + 2) y (14) |

---

## PARTE 3: REGLAS FUNDAMENTALES

### Regla del equilibrio

Lo que hagas a un lado de la ecuación, **debes hacerlo al otro lado**.

### Operaciones inversas

Para despejar, usamos la operación contraria:

| Operación | Inversa |
|-----------|---------|
| Suma (+) | Resta (-) |
| Resta (-) | Suma (+) |
| Multiplicación (×) | División (÷) |
| División (÷) | Multiplicación (×) |

---

## PARTE 4: PASOS PARA RESOLVER ECUACIONES

### Método general:

1. **Agrupar** términos semejantes
2. **Despejar** la incógnita paso a paso
3. **Verificar** el resultado

---

## EJEMPLO RESUELTO #1: Ecuación de un paso

**Resolver: x + 8 = 15**

**Paso 1:** Identificar qué debemos eliminar → el "+8"

**Paso 2:** Aplicar operación inversa → restar 8 en ambos lados

- x + 8 - 8 = 15 - 8
- x + 0 = 7
- **x = 7**

**Verificación:** 7 + 8 = 15 ✓

---

## EJEMPLO RESUELTO #2: Ecuación de un paso (resta)

**Resolver: x - 12 = 25**

**Paso 1:** Identificar qué debemos eliminar → el "-12"

**Paso 2:** Aplicar operación inversa → sumar 12 en ambos lados

- x - 12 + 12 = 25 + 12
- x = **37**

**Verificación:** 37 - 12 = 25 ✓

---

## EJEMPLO RESUELTO #3: Ecuación con multiplicación

**Resolver: 4x = 28**

**Paso 1:** Identificar → x está multiplicado por 4

**Paso 2:** Aplicar operación inversa → dividir por 4

- 4x ÷ 4 = 28 ÷ 4
- x = **7**

**Verificación:** 4 × 7 = 28 ✓

---

## EJEMPLO RESUELTO #4: Ecuación con división

**Resolver: x/5 = 9**

**Paso 1:** Identificar → x está dividido por 5

**Paso 2:** Aplicar operación inversa → multiplicar por 5

- (x/5) × 5 = 9 × 5
- x = **45**

**Verificación:** 45 ÷ 5 = 9 ✓

---

## EJEMPLO RESUELTO #5: Ecuación de dos pasos

**Resolver: 3x + 5 = 20**

**Paso 1:** Eliminar el término independiente

- 3x + 5 - 5 = 20 - 5
- 3x = 15

**Paso 2:** Eliminar el coeficiente

- 3x ÷ 3 = 15 ÷ 3
- x = **5**

**Verificación:** 3(5) + 5 = 15 + 5 = 20 ✓

---

## EJEMPLO RESUELTO #6: Ecuación más compleja

**Resolver: 2x - 7 = 4x - 15**

**Paso 1:** Agrupar términos con x en un lado

- 2x - 7 - 2x = 4x - 15 - 2x
- -7 = 2x - 15

**Paso 2:** Agrupar números en el otro lado

- -7 + 15 = 2x - 15 + 15
- 8 = 2x

**Paso 3:** Despejar x

- 8 ÷ 2 = 2x ÷ 2
- **x = 4**

**Verificación:**
- Lado izquierdo: 2(4) - 7 = 8 - 7 = 1
- Lado derecho: 4(4) - 15 = 16 - 15 = 1 ✓

---

## PARTE 5: PROBLEMAS DE LA VIDA REAL

### PROBLEMA 1: Compras

**Situación:** Ana compró 3 cuadernos iguales y pagó $2.100. ¿Cuánto cuesta cada cuaderno?

**Planteo:** 3x = 2.100

**Resolución:**
- 3x ÷ 3 = 2.100 ÷ 3
- x = **$700**

**Respuesta:** Cada cuaderno cuesta **$700**

---

### PROBLEMA 2: Edades

**Situación:** La edad de Pedro más 8 años es igual a 25 años. ¿Cuántos años tiene Pedro?

**Planteo:** x + 8 = 25

**Resolución:**
- x + 8 - 8 = 25 - 8
- x = **17**

**Respuesta:** Pedro tiene **17 años**

**Verificación:** 17 + 8 = 25 ✓

---

### PROBLEMA 3: Dinero

**Situación:** María tiene el doble de dinero que Juan más $500. Si María tiene $1.700, ¿cuánto tiene Juan?

**Planteo:** 2x + 500 = 1.700

**Resolución:**
- 2x + 500 - 500 = 1.700 - 500
- 2x = 1.200
- x = **$600**

**Respuesta:** Juan tiene **$600**

**Verificación:** 2(600) + 500 = 1.200 + 500 = 1.700 ✓

---

## ERRORES COMUNES A EVITAR

1. **Olvidar hacer la operación en ambos lados**
2. **Confundir signos al mover términos**
3. **No verificar la solución**
4. **Orden incorrecto de operaciones**

---

## CONSEJOS PARA RESOLVER ECUACIONES

- Siempre verificar el resultado sustituyendo
- Primero eliminar sumas/restas, luego multiplicaciones/divisiones
- Mantener el orden y limpieza en los pasos
- Practicar con problemas de la vida real
`;
}

function generateHistoriaContent(topicNormalized: string, topic: string, course: string): string | null {
  // Independencia de Chile
  if (topicNormalized.includes('independencia') || topicNormalized.includes('emancipacion')) {
    return `
LA INDEPENDENCIA DE CHILE - Contenido del Libro de Historia ${course}

CAPÍTULO: EL PROCESO DE INDEPENDENCIA

1. ANTECEDENTES DE LA INDEPENDENCIA

CAUSAS EXTERNAS:
- Independencia de Estados Unidos (1776)
- Revolución Francesa (1789)
- Invasión napoleónica a España (1808)
- Ideas de la Ilustración (libertad, igualdad, soberanía popular)

CAUSAS INTERNAS:
- Descontento criollo por discriminación en cargos públicos
- Restricciones comerciales impuestas por España
- Deseo de participación política
- Conciencia de identidad americana

2. ETAPAS DE LA INDEPENDENCIA

PATRIA VIEJA (1810-1814)
- 18 de septiembre de 1810: Primera Junta Nacional de Gobierno
- Primer Congreso Nacional (1811)
- Gobierno de José Miguel Carrera
- Primeras reformas: libertad de comercio, libertad de prensa
- Desastre de Rancagua (octubre 1814): Derrota patriota

RECONQUISTA ESPAÑOLA (1814-1817)
- Restauración del dominio español
- Gobierno represivo de Mariano Osorio y Casimiro Marcó del Pont
- Tribunales de Vindicación
- Patriotas exiliados a Argentina
- Resistencia guerrillera (Manuel Rodríguez)

PATRIA NUEVA (1817-1823)
- Cruce de los Andes por el Ejército Libertador
- Batalla de Chacabuco (12 febrero 1817): Victoria patriota
- Bernardo O'Higgins asume como Director Supremo
- Proclamación de la Independencia (12 febrero 1818)
- Batalla de Maipú (5 abril 1818): Victoria decisiva
- Gobierno de O'Higgins hasta 1823

3. PERSONAJES IMPORTANTES

BERNARDO O'HIGGINS (1778-1842)
- "Padre de la Patria"
- Director Supremo de Chile
- Organizó el Ejército patriota
- Proclamó la Independencia

JOSÉ DE SAN MARTÍN (1778-1850)
- Libertador de Argentina, Chile y Perú
- Organizó el Ejército de los Andes
- Estratega del cruce de los Andes

JOSÉ MIGUEL CARRERA (1785-1821)
- Líder de la Patria Vieja
- Impulsó reformas liberales
- Creó los primeros símbolos patrios

MANUEL RODRÍGUEZ (1785-1818)
- Guerrillero patriota
- Símbolo de resistencia durante la Reconquista
- "El guerrillero"

4. OBRAS DEL GOBIERNO DE O'HIGGINS
- Abolición de títulos de nobleza
- Creación del Cementerio General
- Fundación de escuelas
- Apertura del Instituto Nacional
- Organización de la Armada de Chile
- Abolición de las corridas de toros

5. SÍMBOLOS PATRIOS
- Bandera nacional (actual desde 1817)
- Escudo nacional
- Himno nacional
- Escarapela
`;
  }
  
  // Pueblos originarios
  if (topicNormalized.includes('pueblos originarios') || topicNormalized.includes('indigenas') || topicNormalized.includes('mapuche')) {
    return `
PUEBLOS ORIGINARIOS DE CHILE - Contenido del Libro de Historia ${course}

CAPÍTULO: LOS PUEBLOS ORIGINARIOS

1. INTRODUCCIÓN
Chile fue habitado por diversos pueblos originarios antes de la llegada de los españoles. Cada pueblo desarrolló su propia cultura, adaptándose al medio ambiente donde vivía.

2. PUEBLOS DEL NORTE

AYMARAS
- Ubicación: Altiplano (regiones de Arica y Parinacota, Tarapacá)
- Actividades: Agricultura en terrazas, ganadería de llamas y alpacas
- Características: Cultivo de papa, quinoa y maíz
- Organización: Ayllus (comunidades familiares)

ATACAMEÑOS (Lickanantay)
- Ubicación: Desierto de Atacama, oasis
- Actividades: Agricultura de oasis, comercio, metalurgia
- Características: Sistemas de riego, cultivo en terrazas
- Importante centro: San Pedro de Atacama

CHANGOS
- Ubicación: Costa del norte de Chile
- Actividades: Pesca, caza de lobos marinos
- Características: Balsas de cuero de lobo marino inflado

DIAGUITAS
- Ubicación: Valles transversales (Copiapó, Huasco, Elqui)
- Actividades: Agricultura, ganadería, metalurgia
- Características: Cerámica decorada, influencia incaica

3. PUEBLOS DE LA ZONA CENTRAL Y SUR

MAPUCHES
- Ubicación: Desde el río Aconcagua hasta Chiloé
- Organización social: Lof (comunidad), rewe (agrupación de lof)
- Autoridades: Lonko (jefe), machi (sanador/a espiritual)
- Actividades: Agricultura, ganadería, recolección
- Lengua: Mapudungún
- Religión: Creencia en Ngenechen (dios creador)
- Vivienda: Ruka
- Resistencia a la conquista española

4. PUEBLOS DEL SUR Y ZONA AUSTRAL

HUILLICHES
- Ubicación: Sur del río Toltén hasta Chiloé
- Características: Parte del pueblo mapuche, adaptados al clima lluvioso
- Actividades: Agricultura, pesca, recolección de mariscos

CHONOS
- Ubicación: Archipiélago de los Chonos
- Actividades: Pesca, caza de lobos marinos
- Características: Nómades del mar

KAWÉSQAR (Alacalufes)
- Ubicación: Canales patagónicos
- Actividades: Pesca, caza, recolección
- Características: Nómades canoeros, adaptados al frío extremo

SELK'NAM (Onas)
- Ubicación: Tierra del Fuego
- Actividades: Caza de guanacos
- Características: Nómades terrestres, ceremonias de iniciación

YAGANES (Yámanas)
- Ubicación: Extremo sur, Cabo de Hornos
- Actividades: Pesca, caza marina
- Características: El pueblo más austral del mundo

5. LEGADO DE LOS PUEBLOS ORIGINARIOS
- Lenguas y toponimia (nombres de lugares)
- Alimentos: papa, maíz, quinoa, porotos
- Textiles y artesanías
- Conocimientos medicinales
- Tradiciones y ceremonias
- Cosmovisión y relación con la naturaleza
`;
  }
  
  return null;
}

function generateLenguajeContent(topicNormalized: string, topic: string, course: string): string | null {
  // Sustantivos
  if (topicNormalized.includes('sustantivo') || topicNormalized.includes('sustantivos')) {
    return `
EL SUSTANTIVO - Contenido del Libro de Lenguaje ${course}

CAPÍTULO: LAS CLASES DE PALABRAS - EL SUSTANTIVO

1. DEFINICIÓN
El sustantivo es la palabra que sirve para nombrar personas, animales, cosas, lugares, sentimientos o ideas.

2. CLASIFICACIÓN DE SUSTANTIVOS

POR SU SIGNIFICADO:

SUSTANTIVOS COMUNES
- Nombran de forma general
- Se escriben con minúscula
- Ejemplos: perro, ciudad, libro, mesa

SUSTANTIVOS PROPIOS
- Nombran de forma específica y única
- Se escriben con mayúscula inicial
- Ejemplos: Pedro, Chile, Andes, Amazonas

POR SU EXTENSIÓN:

SUSTANTIVOS INDIVIDUALES
- Nombran un solo elemento
- Ejemplos: árbol, abeja, soldado, estrella

SUSTANTIVOS COLECTIVOS
- Nombran un conjunto de elementos
- Ejemplos: bosque (conjunto de árboles), enjambre (conjunto de abejas)

POR SU NATURALEZA:

SUSTANTIVOS CONCRETOS
- Se perciben con los sentidos
- Ejemplos: mesa, flor, música, perfume

SUSTANTIVOS ABSTRACTOS
- No se perciben con los sentidos
- Expresan ideas, sentimientos o cualidades
- Ejemplos: amor, libertad, justicia, belleza

3. GÉNERO DE LOS SUSTANTIVOS

MASCULINO:
- Generalmente terminan en -o
- Usan artículos: el, un, los, unos
- Ejemplos: el niño, el perro, el libro

FEMENINO:
- Generalmente terminan en -a
- Usan artículos: la, una, las, unas
- Ejemplos: la niña, la perra, la casa

EXCEPCIONES IMPORTANTES:
- Masculinos en -a: el día, el mapa, el planeta, el problema
- Femeninos en -o: la mano, la radio, la foto
- Sustantivos invariables: el/la estudiante, el/la artista

4. NÚMERO DE LOS SUSTANTIVOS

SINGULAR: Indica uno solo
- Ejemplos: gato, flor, lápiz

PLURAL: Indica más de uno
- Ejemplos: gatos, flores, lápices

FORMACIÓN DEL PLURAL:
- Palabras terminadas en vocal: +s (casa → casas)
- Palabras terminadas en consonante: +es (pared → paredes)
- Palabras terminadas en -z: cambia a -ces (lápiz → lápices)
- Palabras terminadas en -s (agudas): +es (autobús → autobuses)
- Palabras terminadas en -s (no agudas): no cambian (el lunes → los lunes)

5. FUNCIÓN EN LA ORACIÓN

El sustantivo puede ser:
- SUJETO de la oración: "El perro ladra"
- COMPLEMENTO del verbo: "Compré un libro"
- COMPLEMENTO de otro sustantivo: "La casa de Pedro"

6. ACOMPAÑANTES DEL SUSTANTIVO
- Artículos: el, la, los, las, un, una, unos, unas
- Adjetivos: grande, pequeño, rojo, hermoso
- Determinantes: este, ese, aquel, mi, tu, su
`;
  }
  
  // Verbos
  if (topicNormalized.includes('verbo') || topicNormalized.includes('verbos')) {
    return `
EL VERBO - Contenido del Libro de Lenguaje ${course}

CAPÍTULO: LAS CLASES DE PALABRAS - EL VERBO

1. DEFINICIÓN
El verbo es la palabra que expresa acción, estado o proceso. Es el núcleo del predicado y la palabra más importante de la oración.

2. ACCIDENTES DEL VERBO

PERSONA:
- Primera persona: quien habla (yo, nosotros)
- Segunda persona: a quien se habla (tú, ustedes, vosotros)
- Tercera persona: de quien se habla (él, ella, ellos, ellas)

NÚMERO:
- Singular: una persona (yo canto, tú cantas, él canta)
- Plural: varias personas (nosotros cantamos, ellos cantan)

TIEMPO:
- Presente: acción actual (yo camino)
- Pasado/Pretérito: acción ya realizada (yo caminé)
- Futuro: acción por realizarse (yo caminaré)

MODO:
- Indicativo: expresa hechos reales
- Subjuntivo: expresa deseos, dudas, posibilidades
- Imperativo: expresa órdenes o mandatos

3. CONJUGACIONES VERBALES

PRIMERA CONJUGACIÓN: Verbos terminados en -AR
- Infinitivo: amar, cantar, caminar, saltar
- Modelo: AMAR
  - Presente: amo, amas, ama, amamos, aman
  - Pretérito: amé, amaste, amó, amamos, amaron
  - Futuro: amaré, amarás, amará, amaremos, amarán

SEGUNDA CONJUGACIÓN: Verbos terminados en -ER
- Infinitivo: comer, beber, correr, temer
- Modelo: COMER
  - Presente: como, comes, come, comemos, comen
  - Pretérito: comí, comiste, comió, comimos, comieron
  - Futuro: comeré, comerás, comerá, comeremos, comerán

TERCERA CONJUGACIÓN: Verbos terminados en -IR
- Infinitivo: vivir, partir, escribir, subir
- Modelo: VIVIR
  - Presente: vivo, vives, vive, vivimos, viven
  - Pretérito: viví, viviste, vivió, vivimos, vivieron
  - Futuro: viviré, vivirás, vivirá, viviremos, vivirán

4. TIEMPOS SIMPLES Y COMPUESTOS

TIEMPOS SIMPLES (una sola palabra):
- Presente: canto
- Pretérito imperfecto: cantaba
- Pretérito perfecto simple: canté
- Futuro: cantaré
- Condicional: cantaría

TIEMPOS COMPUESTOS (verbo haber + participio):
- Pretérito perfecto compuesto: he cantado
- Pretérito pluscuamperfecto: había cantado
- Futuro perfecto: habré cantado
- Condicional perfecto: habría cantado

5. VERBOS REGULARES E IRREGULARES

VERBOS REGULARES:
- Siguen el modelo de su conjugación
- Mantienen su raíz sin cambios
- Ejemplos: amar, comer, vivir

VERBOS IRREGULARES:
- Cambian su raíz o sus desinencias
- No siguen completamente el modelo
- Ejemplos: ser, ir, tener, hacer, decir, poder

6. FORMAS NO PERSONALES DEL VERBO

INFINITIVO: Forma básica (termina en -ar, -er, -ir)
- Ejemplo: cantar, comer, vivir

GERUNDIO: Expresa acción en desarrollo
- Termina en -ando (1ª conj.) o -iendo (2ª y 3ª conj.)
- Ejemplo: cantando, comiendo, viviendo

PARTICIPIO: Forma que puede funcionar como adjetivo
- Termina en -ado (1ª conj.) o -ido (2ª y 3ª conj.)
- Ejemplo: cantado, comido, vivido
`;
  }
  
  // Comprensión lectora
  if (topicNormalized.includes('comprension lectora') || topicNormalized.includes('lectura')) {
    return `
COMPRENSIÓN LECTORA - Contenido del Libro de Lenguaje ${course}

CAPÍTULO: ESTRATEGIAS DE COMPRENSIÓN LECTORA

1. ¿QUÉ ES LA COMPRENSIÓN LECTORA?
Es la capacidad de entender lo que se lee, interpretando el significado de las palabras, las ideas del autor y el mensaje del texto.

2. NIVELES DE COMPRENSIÓN

NIVEL LITERAL
- Identificar información explícita en el texto
- Reconocer personajes, lugares, hechos
- Responder: ¿Qué? ¿Quién? ¿Dónde? ¿Cuándo?

NIVEL INFERENCIAL
- Deducir información no explícita
- Interpretar significados implícitos
- Relacionar ideas y sacar conclusiones

NIVEL CRÍTICO
- Evaluar el contenido del texto
- Formar opiniones propias
- Distinguir hechos de opiniones

3. ESTRATEGIAS ANTES DE LEER

ACTIVAR CONOCIMIENTOS PREVIOS
- ¿Qué sé sobre este tema?
- ¿Qué he leído antes sobre esto?

FORMULAR PREDICCIONES
- ¿De qué tratará el texto según el título?
- ¿Qué información espero encontrar?

ESTABLECER UN PROPÓSITO
- ¿Para qué voy a leer este texto?
- ¿Qué quiero aprender?

4. ESTRATEGIAS DURANTE LA LECTURA

SUBRAYAR IDEAS IMPORTANTES
- Identificar ideas principales
- Marcar palabras clave

HACER PREGUNTAS
- ¿Qué significa esta palabra?
- ¿Por qué sucede esto?

VISUALIZAR
- Crear imágenes mentales
- Imaginar la escena descrita

RELEER CUANDO SEA NECESARIO
- Volver a leer partes confusas
- Aclarar significados

5. ESTRATEGIAS DESPUÉS DE LEER

RESUMIR
- Expresar las ideas principales con tus palabras
- Organizar la información

EVALUAR
- ¿Entendí el texto?
- ¿Logré mi propósito de lectura?

RELACIONAR
- Conectar con experiencias personales
- Relacionar con otros textos

6. TIPOS DE TEXTOS

TEXTOS NARRATIVOS
- Cuentan una historia
- Tienen personajes, lugar, tiempo y acontecimientos
- Ejemplos: cuentos, novelas, fábulas

TEXTOS INFORMATIVOS
- Entregan información sobre un tema
- Organización clara de ideas
- Ejemplos: artículos, enciclopedias, noticias

TEXTOS ARGUMENTATIVOS
- Presentan opiniones y las defienden
- Incluyen argumentos y evidencias
- Ejemplos: ensayos, cartas al editor

TEXTOS INSTRUCTIVOS
- Indican cómo hacer algo
- Tienen pasos ordenados
- Ejemplos: recetas, manuales, instrucciones
`;
  }
  
  return null;
}

function generateGenericContent(topic: string, subject: string, course: string): string {
  return `
CONTENIDO EDUCATIVO: ${topic.toUpperCase()}
Libro: ${subject} - ${course}

UNIDAD DE APRENDIZAJE

1. INTRODUCCIÓN AL TEMA
${topic} es un contenido fundamental del currículo de ${subject} para ${course}. Su estudio permite desarrollar competencias específicas establecidas en los objetivos de aprendizaje.

2. OBJETIVOS DE APRENDIZAJE
Al finalizar esta unidad, los estudiantes serán capaces de:
- Comprender los conceptos básicos relacionados con ${topic}
- Identificar los elementos principales del tema
- Aplicar los conocimientos en situaciones prácticas
- Relacionar el tema con otros contenidos de ${subject}
- Desarrollar habilidades de pensamiento crítico

3. CONCEPTOS FUNDAMENTALES

3.1 Definición
${topic} se define como un conjunto de conocimientos y habilidades que permiten comprender aspectos importantes de ${subject}.

3.2 Características principales
- El tema presenta componentes esenciales que deben ser identificados
- Existe una estructura organizada de conceptos
- Se relaciona con otros temas del currículo
- Tiene aplicaciones en la vida cotidiana

3.3 Elementos clave
- Componente teórico: fundamentos conceptuales
- Componente práctico: aplicaciones y ejemplos
- Componente de evaluación: criterios de logro

4. DESARROLLO DEL CONTENIDO

4.1 Marco teórico
El estudio de ${topic} requiere una comprensión progresiva de sus componentes. Los estudiantes deben ser capaces de identificar, analizar y aplicar estos conocimientos.

4.2 Aspectos importantes
- Primera dimensión: conceptos básicos y definiciones
- Segunda dimensión: relaciones y conexiones
- Tercera dimensión: aplicaciones prácticas

4.3 Ejemplos y casos
Los ejemplos permiten ilustrar los conceptos de manera concreta, facilitando la comprensión y la transferencia del aprendizaje.

5. METODOLOGÍA DE ESTUDIO

5.1 Pasos para el aprendizaje
1. Lectura comprensiva del material
2. Identificación de ideas principales
3. Elaboración de resúmenes y esquemas
4. Aplicación en ejercicios prácticos
5. Autoevaluación del aprendizaje

5.2 Recursos de apoyo
- Textos escolares y material complementario
- Recursos digitales y multimedia
- Actividades grupales y colaborativas

6. ACTIVIDADES SUGERIDAS

ACTIVIDAD 1: Exploración inicial
- Investigar sobre ${topic}
- Compartir conocimientos previos

ACTIVIDAD 2: Análisis de casos
- Estudiar ejemplos concretos
- Identificar patrones y características

ACTIVIDAD 3: Aplicación práctica
- Resolver problemas relacionados
- Crear productos o presentaciones

7. EVALUACIÓN DEL APRENDIZAJE

Criterios de evaluación:
- Comprensión de conceptos fundamentales
- Capacidad de análisis y síntesis
- Aplicación práctica de conocimientos
- Trabajo colaborativo y participación

8. CONEXIONES CON OTROS CONTENIDOS

${topic} se relaciona con otros temas de ${subject} y con otras asignaturas del currículo, permitiendo una comprensión integrada del conocimiento.

9. IMPORTANCIA DEL TEMA

El dominio de ${topic} permite a los estudiantes:
- Avanzar en su comprensión de ${subject}
- Desarrollar habilidades de pensamiento crítico
- Aplicar conocimientos en situaciones reales
- Prepararse para contenidos más avanzados

10. SÍNTESIS

En resumen, ${topic} representa un contenido esencial que contribuye al desarrollo integral de los estudiantes de ${course} en el área de ${subject}.
`;
}
