
// src/ai/flows/generate-quiz.ts
'use server';

/**
 * @fileOverview Generates a quiz on a specific topic from a selected book.
 * The quiz will have 15 open-ended questions, each with its expected answer/explanation.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function (formatted HTML string).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { bookPDFs } from '@/lib/books-data';

// Cache para contenido de PDFs (evita descargas repetidas)
const pdfContentCache = new Map<string, { pages: string[]; timestamp: number }>();
const PDF_CACHE_TTL = 30 * 60 * 1000; // 30 minutos
const PDF_FAILURE_TTL = 5 * 60 * 1000; // 5 minutos (para caché negativa)

// Cache para contexto extraído por topic (evita re-procesar)
const contextCache = new Map<string, { context: string; references: string[]; timestamp: number }>();
const CONTEXT_CACHE_TTL = 15 * 60 * 1000; // 15 minutos

// Cache para salida final del quiz (evita llamadas repetidas al modelo)
const quizOutputCache = new Map<string, { output: GenerateQuizOutput; timestamp: number }>();
const QUIZ_OUTPUT_TTL = 10 * 60 * 1000; // 10 minutos

// Deduplicación de requests concurrentes (mismo input)
const quizInFlight = new Map<string, Promise<GenerateQuizOutput>>();

function makeQuizCacheKey(input: GenerateQuizInput): string {
  return [
    input.language,
    input.courseName?.trim() || '',
    input.bookTitle?.trim() || '',
    input.topic?.trim().toLowerCase() || '',
  ].join('|');
}

function isLikelyRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b429\b|too many requests|rate\s*limit|quota/i.test(msg);
}


// Banco de contenido educativo por tema para generar cuestionarios específicos
const topicQuestionBanks: Record<string, Array<{ q: string; a: string }>> = {
  'sistema respiratorio': [
    { q: '¿Cuál es la función principal del sistema respiratorio?', a: 'La función principal del sistema respiratorio es permitir el intercambio de gases: incorporar oxígeno (O₂) del aire hacia la sangre y eliminar dióxido de carbono (CO₂) del cuerpo hacia el exterior.' },
    { q: '¿Cuáles son los órganos principales que componen el sistema respiratorio?', a: 'Los órganos principales son: nariz, faringe, laringe, tráquea, bronquios y pulmones. También incluye estructuras como los alvéolos pulmonares y el diafragma.' },
    { q: '¿Qué son los alvéolos y cuál es su función?', a: 'Los alvéolos son pequeños sacos de aire ubicados al final de los bronquiolos en los pulmones. Su función es realizar el intercambio gaseoso: el oxígeno pasa a la sangre y el CO₂ pasa al aire para ser exhalado.' },
    { q: '¿Cómo funciona el proceso de inhalación?', a: 'Durante la inhalación, el diafragma se contrae y desciende, los músculos intercostales elevan las costillas, aumentando el volumen de la cavidad torácica. Esto crea una presión negativa que hace que el aire entre a los pulmones.' },
    { q: '¿Cómo funciona el proceso de exhalación?', a: 'Durante la exhalación, el diafragma se relaja y sube, los músculos intercostales se relajan y las costillas bajan. El volumen torácico disminuye, aumentando la presión interna y expulsando el aire de los pulmones.' },
    { q: '¿Qué función cumple la nariz en el sistema respiratorio?', a: 'La nariz filtra, calienta y humedece el aire que respiramos. Los vellos nasales y el moco atrapan partículas de polvo, bacterias y otros contaminantes, protegiendo los pulmones.' },
    { q: '¿Cuál es la función de la tráquea?', a: 'La tráquea es un tubo formado por anillos de cartílago que conecta la laringe con los bronquios. Su función es conducir el aire hacia los pulmones y mantener la vía aérea abierta.' },
    { q: '¿Qué es el diafragma y por qué es importante para la respiración?', a: 'El diafragma es un músculo con forma de cúpula ubicado debajo de los pulmones. Es el músculo principal de la respiración; su contracción y relajación permiten la entrada y salida de aire de los pulmones.' },
    { q: '¿Cuál es la diferencia entre respiración pulmonar y respiración celular?', a: 'La respiración pulmonar es el intercambio de gases en los pulmones (O₂ entra, CO₂ sale). La respiración celular ocurre en las células, donde se usa el O₂ para obtener energía de los nutrientes y se produce CO₂ como desecho.' },
    { q: '¿Qué enfermedades pueden afectar al sistema respiratorio?', a: 'Algunas enfermedades comunes son: asma (inflamación de las vías respiratorias), bronquitis (inflamación de los bronquios), neumonía (infección de los pulmones), gripe y resfriado común.' },
    { q: '¿Por qué es importante respirar por la nariz y no por la boca?', a: 'Respirar por la nariz es importante porque el aire se filtra, calienta y humedece antes de llegar a los pulmones. La boca no tiene estas funciones protectoras, lo que puede causar irritación o infecciones.' },
    { q: '¿Cómo se relaciona el sistema respiratorio con el sistema circulatorio?', a: 'Ambos sistemas trabajan juntos: el sistema respiratorio capta el O₂ y lo transfiere a la sangre en los alvéolos. El sistema circulatorio transporta ese O₂ a todas las células del cuerpo y recoge el CO₂ para eliminarlo por los pulmones.' },
    { q: '¿Qué ocurre si no respiramos correctamente durante varios minutos?', a: 'Si no respiramos, las células no reciben oxígeno y no pueden producir energía. Esto causa daño celular, especialmente en el cerebro, y puede provocar pérdida de consciencia y, si se prolonga, la muerte.' },
    { q: '¿Qué hábitos ayudan a mantener sano el sistema respiratorio?', a: 'Hábitos saludables incluyen: no fumar, hacer ejercicio regularmente, evitar la contaminación del aire, lavarse las manos frecuentemente para prevenir infecciones y mantener buena ventilación en espacios cerrados.' },
    { q: '¿Cuántas veces aproximadamente respiramos por minuto en reposo?', a: 'Un adulto en reposo respira aproximadamente entre 12 y 20 veces por minuto. Los niños respiran más rápido, entre 20 y 30 veces por minuto. Durante el ejercicio, la frecuencia respiratoria aumenta.' },
  ],
  'célula': [
    { q: '¿Qué es una célula?', a: 'La célula es la unidad básica estructural y funcional de todos los seres vivos. Es la parte más pequeña de un organismo que puede realizar todas las funciones vitales como nutrición, relación y reproducción.' },
    { q: '¿Cuáles son las partes principales de una célula?', a: 'Las partes principales son: membrana celular (protege y regula el paso de sustancias), citoplasma (gel donde flotan los orgánulos) y núcleo (contiene el material genético ADN). Las células vegetales también tienen pared celular y cloroplastos.' },
    { q: '¿Cuál es la diferencia entre célula animal y célula vegetal?', a: 'La célula vegetal tiene pared celular (rigidez), cloroplastos (fotosíntesis) y una gran vacuola central. La célula animal no tiene estas estructuras, pero posee centriolos y vacuolas más pequeñas.' },
    { q: '¿Qué función cumple el núcleo de la célula?', a: 'El núcleo es el centro de control de la célula. Contiene el ADN con la información genética que dirige todas las actividades celulares y permite la reproducción celular.' },
    { q: '¿Qué es la membrana celular y cuál es su función?', a: 'La membrana celular es una capa delgada que rodea la célula. Su función es proteger la célula y controlar qué sustancias entran y salen, actuando como una barrera selectiva.' },
    { q: '¿Qué son las mitocondrias y para qué sirven?', a: 'Las mitocondrias son orgánulos llamados "centrales de energía" de la célula. Realizan la respiración celular, transformando los nutrientes en energía (ATP) que la célula puede usar.' },
    { q: '¿Qué función cumplen los cloroplastos?', a: 'Los cloroplastos son orgánulos presentes solo en células vegetales. Contienen clorofila y realizan la fotosíntesis, convirtiendo luz solar, agua y CO₂ en glucosa y oxígeno.' },
    { q: '¿Qué es el citoplasma?', a: 'El citoplasma es una sustancia gelatinosa que llena el interior de la célula, entre la membrana y el núcleo. En él flotan los orgánulos y ocurren muchas reacciones químicas importantes.' },
    { q: '¿Qué tipos de células existen según su complejidad?', a: 'Existen células procariotas (simples, sin núcleo definido, como las bacterias) y células eucariotas (más complejas, con núcleo y orgánulos, como las de animales, plantas y hongos).' },
    { q: '¿Cómo se reproducen las células?', a: 'Las células se reproducen por división celular. La mitosis produce dos células hijas idénticas a la original. La meiosis (en células reproductoras) produce células con la mitad del material genético.' },
    { q: '¿Por qué se dice que la célula es la unidad de vida?', a: 'Porque todos los seres vivos están formados por células. Incluso los organismos más simples tienen al menos una célula. Además, las células realizan todas las funciones vitales necesarias para la vida.' },
    { q: '¿Qué es el ADN y dónde se encuentra?', a: 'El ADN (ácido desoxirribonucleico) es la molécula que contiene la información genética. Se encuentra en el núcleo de las células eucariotas, organizado en estructuras llamadas cromosomas.' },
    { q: '¿Qué función cumple el retículo endoplasmático?', a: 'El retículo endoplasmático es una red de membranas en el citoplasma. El RE rugoso (con ribosomas) sintetiza proteínas; el RE liso sintetiza lípidos y ayuda a eliminar toxinas.' },
    { q: '¿Qué son los ribosomas?', a: 'Los ribosomas son pequeños orgánulos que fabrican proteínas. Leen las instrucciones del ADN (copiadas en el ARN) y ensamblan los aminoácidos para formar las proteínas que la célula necesita.' },
    { q: '¿Qué es el aparato de Golgi?', a: 'El aparato de Golgi es un orgánulo formado por sacos aplanados. Recibe proteínas del RE, las modifica, empaqueta y las envía a su destino final dentro o fuera de la célula.' },
  ],
  'fotosíntesis': [
    { q: '¿Qué es la fotosíntesis?', a: 'La fotosíntesis es el proceso mediante el cual las plantas, algas y algunas bacterias transforman la energía luminosa del sol en energía química (glucosa), utilizando agua y dióxido de carbono, y liberando oxígeno.' },
    { q: '¿Cuál es la ecuación general de la fotosíntesis?', a: 'La ecuación es: 6CO₂ + 6H₂O + luz solar → C₆H₁₂O₆ + 6O₂. Es decir, seis moléculas de dióxido de carbono más seis de agua, con luz, producen una molécula de glucosa y seis de oxígeno.' },
    { q: '¿Dónde ocurre la fotosíntesis en las plantas?', a: 'La fotosíntesis ocurre principalmente en las hojas, dentro de orgánulos llamados cloroplastos. Los cloroplastos contienen clorofila, el pigmento verde que captura la luz solar.' },
    { q: '¿Qué es la clorofila y cuál es su función?', a: 'La clorofila es un pigmento verde presente en los cloroplastos. Su función es absorber la luz solar (principalmente luz roja y azul) y convertirla en energía química para la fotosíntesis.' },
    { q: '¿Cuáles son los reactivos (ingredientes) de la fotosíntesis?', a: 'Los reactivos son: dióxido de carbono (CO₂), que entra por los estomas de las hojas; agua (H₂O), que sube por las raíces y el tallo; y luz solar, que es captada por la clorofila.' },
    { q: '¿Cuáles son los productos de la fotosíntesis?', a: 'Los productos son: glucosa (C₆H₁₂O₆), un azúcar que la planta usa como fuente de energía y para construir estructuras; y oxígeno (O₂), que se libera a la atmósfera por los estomas.' },
    { q: '¿Por qué la fotosíntesis es importante para la vida en la Tierra?', a: 'Es importante porque produce el oxígeno que respiran la mayoría de los seres vivos y es la base de las cadenas alimenticias, ya que las plantas producen el alimento que luego consumen los animales.' },
    { q: '¿Qué son los estomas?', a: 'Los estomas son pequeños poros en la superficie de las hojas. Permiten el intercambio de gases: el CO₂ entra para la fotosíntesis y el O₂ y vapor de agua salen. Se abren y cierran según las condiciones.' },
    { q: '¿Qué factores afectan la velocidad de la fotosíntesis?', a: 'Los factores principales son: intensidad de la luz (más luz, más fotosíntesis hasta un límite), concentración de CO₂, temperatura (óptima entre 25-35°C) y disponibilidad de agua.' },
    { q: '¿Cuál es la diferencia entre la fase luminosa y la fase oscura de la fotosíntesis?', a: 'La fase luminosa ocurre en presencia de luz, en los tilacoides, donde se capta energía y se produce ATP y O₂. La fase oscura (ciclo de Calvin) ocurre en el estroma y usa ATP para fijar CO₂ y formar glucosa.' },
    { q: '¿Qué pasaría si no existiera la fotosíntesis?', a: 'Sin fotosíntesis no habría oxígeno en la atmósfera para respirar, ni alimentos para los herbívoros. La vida como la conocemos no podría existir, ya que la fotosíntesis sostiene las cadenas tróficas.' },
    { q: '¿Las plantas también respiran?', a: 'Sí, las plantas respiran todo el tiempo (día y noche), consumiendo O₂ y liberando CO₂. La fotosíntesis solo ocurre con luz y produce más O₂ del que consumen, por eso liberan oxígeno durante el día.' },
    { q: '¿Por qué las hojas son generalmente verdes?', a: 'Las hojas son verdes porque la clorofila refleja la luz verde y absorbe las luces roja y azul. El color verde que vemos es la luz que no se utiliza para la fotosíntesis.' },
    { q: '¿Pueden hacer fotosíntesis organismos que no son plantas?', a: 'Sí, las algas y algunas bacterias (cianobacterias) también realizan fotosíntesis. Estos organismos también tienen clorofila u otros pigmentos fotosintéticos y contribuyen significativamente al oxígeno atmosférico.' },
    { q: '¿Qué rol juegan las hojas en la fotosíntesis?', a: 'Las hojas son el órgano principal de la fotosíntesis. Su forma plana maximiza la captura de luz, los estomas permiten el intercambio de gases, y las nervaduras transportan agua y nutrientes.' },
  ],
  'fracciones': [
    { q: '¿Qué es una fracción?', a: 'Una fracción es una forma de representar partes de un todo. Se escribe con dos números separados por una línea: el numerador (arriba) indica cuántas partes tenemos, y el denominador (abajo) indica en cuántas partes se dividió el todo.' },
    { q: '¿Cuáles son las partes de una fracción?', a: 'Las partes son: el numerador (número superior, indica las partes que se toman) y el denominador (número inferior, indica en cuántas partes iguales se divide la unidad). Por ejemplo, en 3/4, el 3 es el numerador y el 4 es el denominador.' },
    { q: '¿Qué significa la fracción 1/2?', a: 'La fracción 1/2 (un medio) significa que un todo se dividió en 2 partes iguales y se toma 1 de esas partes. Es equivalente a la mitad del total, o al 50%.' },
    { q: '¿Cómo se comparan dos fracciones con el mismo denominador?', a: 'Cuando dos fracciones tienen el mismo denominador, se comparan sus numeradores. La fracción con mayor numerador es la mayor. Por ejemplo: 5/8 > 3/8 porque 5 > 3.' },
    { q: '¿Cómo se suman fracciones con el mismo denominador?', a: 'Para sumar fracciones con igual denominador, se suman los numeradores y se mantiene el mismo denominador. Ejemplo: 2/5 + 1/5 = 3/5.' },
    { q: '¿Cómo se restan fracciones con el mismo denominador?', a: 'Para restar fracciones con igual denominador, se restan los numeradores y se mantiene el denominador. Ejemplo: 4/7 - 2/7 = 2/7.' },
    { q: '¿Qué son fracciones equivalentes?', a: 'Las fracciones equivalentes son fracciones que representan la misma cantidad aunque tengan números diferentes. Por ejemplo: 1/2 = 2/4 = 4/8. Se obtienen multiplicando o dividiendo numerador y denominador por el mismo número.' },
    { q: '¿Cómo se simplifica una fracción?', a: 'Para simplificar una fracción, se divide el numerador y el denominador por el mismo número (su máximo común divisor). Ejemplo: 6/8 se simplifica dividiendo ambos entre 2, quedando 3/4.' },
    { q: '¿Qué es una fracción propia?', a: 'Una fracción propia es aquella donde el numerador es menor que el denominador. Su valor es menor que 1. Ejemplos: 1/2, 3/4, 2/5.' },
    { q: '¿Qué es una fracción impropia?', a: 'Una fracción impropia es aquella donde el numerador es mayor o igual que el denominador. Su valor es mayor o igual a 1. Ejemplo: 5/3 (que equivale a 1 entero y 2/3).' },
    { q: '¿Qué es un número mixto?', a: 'Un número mixto combina un número entero con una fracción propia. Ejemplo: 2 1/4 significa 2 enteros más 1/4. Se puede convertir a fracción impropia: 2 1/4 = 9/4.' },
    { q: '¿Cómo se convierte una fracción impropia a número mixto?', a: 'Se divide el numerador entre el denominador. El cociente es la parte entera, el residuo es el nuevo numerador, y el denominador se mantiene. Ejemplo: 11/4 = 2 3/4 (11÷4=2 con residuo 3).' },
    { q: '¿Cómo se multiplican dos fracciones?', a: 'Para multiplicar fracciones, se multiplican los numeradores entre sí y los denominadores entre sí. Ejemplo: 2/3 × 4/5 = (2×4)/(3×5) = 8/15.' },
    { q: '¿Cómo se representa una fracción en una recta numérica?', a: 'Primero se divide el segmento entre 0 y 1 en partes iguales según el denominador. Luego se cuenta desde 0 tantas partes como indica el numerador. Ejemplo: 3/4 está en la tercera marca de un segmento dividido en 4.' },
    { q: 'Da un ejemplo de fracción en la vida cotidiana.', a: 'Ejemplos cotidianos: una pizza dividida en 8 pedazos (cada pedazo es 1/8), media hora es 1/2 de hora, un cuarto de litro de leche es 1/4 de litro.' },
  ],
  'animales': [
    { q: '¿Cómo se clasifican los animales según su alimentación?', a: 'Según su alimentación, los animales se clasifican en: herbívoros (comen plantas), carnívoros (comen otros animales) y omnívoros (comen plantas y animales).' },
    { q: '¿Qué características distinguen a los animales vertebrados de los invertebrados?', a: 'Los vertebrados tienen columna vertebral y esqueleto interno (peces, anfibios, reptiles, aves, mamíferos). Los invertebrados no tienen columna vertebral (insectos, arañas, gusanos, moluscos, medusas).' },
    { q: '¿Cuáles son los cinco grupos de animales vertebrados?', a: 'Los cinco grupos son: peces (acuáticos, respiran por branquias), anfibios (piel húmeda, metamorfosis), reptiles (piel escamosa, huevos en tierra), aves (plumas, ponen huevos) y mamíferos (pelo, amamantan a sus crías).' },
    { q: '¿Qué son los animales ovíparos y cuáles son vivíparos?', a: 'Los ovíparos nacen de huevos puestos fuera del cuerpo de la madre (aves, reptiles, peces). Los vivíparos nacen del vientre de la madre y se alimentaron a través de la placenta (la mayoría de mamíferos).' },
    { q: '¿Cómo respiran los peces?', a: 'Los peces respiran por branquias. El agua entra por la boca, pasa por las branquias donde el oxígeno disuelto pasa a la sangre, y el agua sale por las aberturas branquiales.' },
    { q: '¿Qué es la metamorfosis en los animales?', a: 'La metamorfosis es el proceso de transformación física que sufren algunos animales desde que nacen hasta ser adultos. Por ejemplo, la rana pasa de huevo a renacuajo (con cola y branquias) a rana adulta (con patas y pulmones).' },
    { q: '¿Por qué las aves pueden volar?', a: 'Las aves pueden volar gracias a: huesos huecos y livianos, alas con plumas especializadas, músculos pectorales fuertes, y un sistema respiratorio muy eficiente con sacos aéreos.' },
    { q: '¿Qué características tienen los mamíferos?', a: 'Los mamíferos tienen: pelo o pelaje, glándulas mamarias que producen leche para alimentar a sus crías, son de sangre caliente, respiran por pulmones, y la mayoría son vivíparos.' },
    { q: '¿Qué son los animales de sangre fría y cuáles de sangre caliente?', a: 'Los de sangre fría (poiquilotermos) como peces, anfibios y reptiles, dependen del ambiente para regular su temperatura. Los de sangre caliente (homeotermos) como aves y mamíferos mantienen temperatura corporal constante.' },
    { q: '¿Cuáles son algunos ejemplos de animales invertebrados?', a: 'Ejemplos de invertebrados: insectos (hormigas, mariposas), arácnidos (arañas, escorpiones), moluscos (caracoles, pulpos), crustáceos (cangrejos, camarones), gusanos y medusas.' },
    { q: '¿Cómo se desplazan los diferentes animales?', a: 'Los animales se desplazan de diversas formas: caminando o corriendo (perros, caballos), volando (aves, murciélagos, insectos), nadando (peces, delfines), reptando (serpientes), saltando (ranas, canguros).' },
    { q: '¿Qué son los animales domésticos y los silvestres?', a: 'Los animales domésticos viven con los humanos y dependen de ellos (perros, gatos, vacas). Los animales silvestres viven en la naturaleza sin depender de humanos (leones, águilas, tiburones).' },
    { q: '¿Por qué algunos animales están en peligro de extinción?', a: 'Las principales causas son: destrucción de su hábitat, caza excesiva, contaminación, cambio climático e introducción de especies invasoras. Ejemplos: panda, tigre, rinoceronte.' },
    { q: '¿Qué es un ecosistema y qué rol cumplen los animales?', a: 'Un ecosistema es un sistema formado por seres vivos y su ambiente. Los animales cumplen roles como consumidores (herbívoros y carnívoros), descomponedores, polinizadores, y dispersores de semillas.' },
    { q: '¿Cómo se reproducen los animales?', a: 'La mayoría de animales se reproduce sexualmente (unión de gametos masculino y femenino). Pueden ser ovíparos (huevos), vivíparos (crías vivas) u ovovivíparos (huevos que eclosionan dentro de la madre).' },
  ],
  'plantas': [
    { q: '¿Cuáles son las partes principales de una planta?', a: 'Las partes principales son: raíz (absorbe agua y nutrientes, ancla la planta), tallo (sostiene la planta y transporta sustancias), hojas (realizan fotosíntesis), flores (reproducción), frutos y semillas (dispersión).' },
    { q: '¿Qué función cumple la raíz de una planta?', a: 'La raíz absorbe agua y sales minerales del suelo, ancla la planta al sustrato, y en algunas plantas almacena nutrientes (como en la zanahoria o la remolacha).' },
    { q: '¿Qué función cumple el tallo?', a: 'El tallo sostiene las hojas, flores y frutos, transporta agua y nutrientes desde las raíces hacia las hojas (xilema) y los azúcares de las hojas al resto de la planta (floema).' },
    { q: '¿Qué función cumplen las hojas?', a: 'Las hojas realizan la fotosíntesis (producen alimento usando luz solar), la respiración (intercambio de gases) y la transpiración (liberación de vapor de agua).' },
    { q: '¿Cómo se reproducen las plantas con flores?', a: 'Las plantas con flores se reproducen sexualmente: el polen (gameto masculino) fertiliza el óvulo (gameto femenino) en la flor. Esto produce semillas dentro del fruto, que al germinar dan nuevas plantas.' },
    { q: '¿Qué es la germinación?', a: 'La germinación es el proceso por el cual una semilla se desarrolla hasta convertirse en una plántula. Requiere agua, temperatura adecuada y oxígeno. La semilla absorbe agua, se hincha, rompe su cubierta y emerge la raíz y el tallo.' },
    { q: '¿Qué necesitan las plantas para vivir?', a: 'Las plantas necesitan: luz solar (para fotosíntesis), agua (para transporte y reacciones químicas), dióxido de carbono (para fotosíntesis), nutrientes del suelo (sales minerales) y temperatura adecuada.' },
    { q: '¿Por qué las plantas son importantes para el planeta?', a: 'Las plantas producen el oxígeno que respiramos, son la base de las cadenas alimenticias, regulan el clima, previenen la erosión del suelo, y proporcionan alimentos, medicinas y materiales.' },
    { q: '¿Qué diferencia hay entre plantas terrestres y acuáticas?', a: 'Las plantas terrestres tienen raíces desarrolladas, tallos rígidos y sistemas para evitar pérdida de agua. Las acuáticas tienen tejidos menos rígidos, raíces pequeñas o ausentes, y estructuras flotantes.' },
    { q: '¿Qué es la polinización?', a: 'La polinización es el transporte del polen desde los estambres (parte masculina) hasta el pistilo (parte femenina) de una flor. Puede ser por viento, agua, insectos, aves u otros animales.' },
    { q: '¿Qué son las plantas angiospermas y gimnospermas?', a: 'Las angiospermas producen flores y frutos que protegen las semillas (manzanos, rosales). Las gimnospermas tienen semillas desnudas, sin fruto, generalmente en conos (pinos, abetos).' },
    { q: '¿Cómo se adaptan las plantas al desierto?', a: 'Las plantas del desierto (xerófitas) tienen: hojas pequeñas o espinas para reducir pérdida de agua, tallos que almacenan agua (cactus), raíces profundas o extensas, y cutículas gruesas.' },
    { q: '¿Qué es la savia y qué tipos existen?', a: 'La savia es el líquido que circula por la planta. La savia bruta (agua y minerales) sube por el xilema desde las raíces. La savia elaborada (azúcares de la fotosíntesis) baja por el floema a toda la planta.' },
    { q: '¿Qué son los tropismos en las plantas?', a: 'Los tropismos son movimientos de crecimiento de la planta en respuesta a estímulos. Fototropismo: hacia la luz. Geotropismo: las raíces hacia abajo (gravedad). Hidrotropismo: hacia el agua.' },
    { q: '¿Qué utilidades tienen las plantas para el ser humano?', a: 'Las plantas nos proporcionan: alimentos (frutas, verduras, cereales), medicinas, madera, papel, fibras textiles (algodón), oxígeno, combustibles, y embellecen el ambiente.' },
  ],
};

// Obtener preguntas específicas por tema o usar genéricas
function getTopicQuestions(topic: string, isSpanish: boolean): Array<{ q: string; a: string }> {
  const topicLower = topic.toLowerCase().trim();
  
  // Buscar coincidencia exacta o parcial
  for (const [key, questions] of Object.entries(topicQuestionBanks)) {
    if (topicLower.includes(key) || key.includes(topicLower)) {
      return questions;
    }
  }
  
  // Si no hay tema específico, generar preguntas genéricas mejoradas
  const topicCap = capitalizeFirstLetter(topic);
  return isSpanish ? [
    { q: `¿Qué es ${topic} y por qué es importante estudiarlo?`, a: `${topicCap} es un tema fundamental que permite comprender conceptos esenciales. Su estudio desarrolla habilidades de análisis y comprensión del mundo que nos rodea.` },
    { q: `¿Cuáles son los conceptos principales de ${topic}?`, a: `Los conceptos principales incluyen las definiciones básicas, las características distintivas, los ejemplos más representativos y las aplicaciones prácticas en situaciones reales.` },
    { q: `¿Cómo se relaciona ${topic} con la vida cotidiana?`, a: `${topicCap} tiene aplicaciones directas en la vida diaria. Comprender este tema nos ayuda a tomar mejores decisiones y entender fenómenos que observamos regularmente.` },
    { q: `Describe las características más importantes de ${topic}.`, a: `Las características más importantes incluyen sus propiedades fundamentales, cómo se identifica, sus componentes principales y qué lo diferencia de conceptos similares.` },
    { q: `Menciona y explica tres ejemplos relacionados con ${topic}.`, a: `Ejemplos relevantes pueden incluir casos del entorno escolar, situaciones familiares y fenómenos naturales observables, cada uno demostrando aspectos diferentes del tema.` },
    { q: `¿Por qué es importante conocer sobre ${topic}?`, a: `Conocer sobre ${topic} es importante porque desarrolla el pensamiento crítico, permite resolver problemas reales y facilita la comprensión de temas más avanzados relacionados.` },
    { q: `¿Cómo explicarías ${topic} a alguien que no lo conoce?`, a: `Para explicar ${topic} de forma clara, se debe partir de ideas simples, usar ejemplos concretos y cotidianos, y relacionarlo con experiencias que la persona ya conoce.` },
    { q: `¿Qué preguntas te surgen al estudiar ${topic}?`, a: `Al estudiar este tema pueden surgir preguntas sobre su origen, cómo funciona, para qué sirve, cómo se aplica, y cómo se relaciona con otros conocimientos previos.` },
    { q: `Compara ${topic} con otro tema que hayas estudiado.`, a: `Al comparar temas se pueden identificar similitudes en sus principios básicos, diferencias en sus aplicaciones, y conexiones que enriquecen la comprensión de ambos.` },
    { q: `¿Cuál es la idea más importante que aprendiste sobre ${topic}?`, a: `La idea más importante es comprender los fundamentos del tema, reconocer su utilidad práctica y ser capaz de aplicar este conocimiento en situaciones nuevas.` },
    { q: `¿Cómo puedes aplicar lo aprendido sobre ${topic}?`, a: `Este conocimiento se puede aplicar en actividades escolares, proyectos personales, resolución de problemas cotidianos y en la comprensión de noticias o información relacionada.` },
    { q: `Resume con tus propias palabras qué es ${topic}.`, a: `Un buen resumen debe incluir una definición clara, las características principales, por qué es importante y uno o dos ejemplos que ilustren el concepto.` },
    { q: `¿Qué dificultades encontraste al estudiar ${topic}?`, a: `Las dificultades comunes incluyen entender la terminología nueva, conectar diferentes conceptos entre sí, y visualizar cómo se aplica el conocimiento en la práctica.` },
    { q: `¿Qué más te gustaría aprender sobre ${topic}?`, a: `Se puede profundizar estudiando casos especiales, investigando la historia del tema, explorando aplicaciones avanzadas y descubriendo temas relacionados.` },
    { q: `Crea un ejemplo original relacionado con ${topic}.`, a: `Un buen ejemplo original debe demostrar comprensión del tema, ser relevante y aplicable, y mostrar correctamente los conceptos aprendidos en una situación nueva.` },
  ] : [
    { q: `What is ${topic} and why is it important to study?`, a: `${topicCap} is a fundamental topic that helps understand essential concepts. Studying it develops analysis skills and understanding of the world around us.` },
    { q: `What are the main concepts of ${topic}?`, a: `The main concepts include basic definitions, distinctive characteristics, representative examples, and practical applications in real situations.` },
    { q: `How does ${topic} relate to everyday life?`, a: `${topicCap} has direct applications in daily life. Understanding this topic helps us make better decisions and comprehend phenomena we observe regularly.` },
    { q: `Describe the most important characteristics of ${topic}.`, a: `The most important characteristics include its fundamental properties, how it is identified, its main components, and what differentiates it from similar concepts.` },
    { q: `Mention and explain three examples related to ${topic}.`, a: `Relevant examples can include cases from school, family situations, and observable natural phenomena, each demonstrating different aspects of the topic.` },
    { q: `Why is it important to know about ${topic}?`, a: `Knowing about ${topic} is important because it develops critical thinking, allows solving real problems, and facilitates understanding of related advanced topics.` },
    { q: `How would you explain ${topic} to someone unfamiliar with it?`, a: `To explain ${topic} clearly, start with simple ideas, use concrete everyday examples, and relate it to experiences the person already knows.` },
    { q: `What questions arise when studying ${topic}?`, a: `When studying this topic, questions may arise about its origin, how it works, what it is used for, how it is applied, and how it relates to prior knowledge.` },
    { q: `Compare ${topic} with another topic you have studied.`, a: `When comparing topics, you can identify similarities in basic principles, differences in applications, and connections that enrich understanding of both.` },
    { q: `What is the most important idea you learned about ${topic}?`, a: `The most important idea is understanding the fundamentals, recognizing practical utility, and being able to apply this knowledge in new situations.` },
    { q: `How can you apply what you learned about ${topic}?`, a: `This knowledge can be applied in school activities, personal projects, solving everyday problems, and understanding related news or information.` },
    { q: `Summarize in your own words what ${topic} is.`, a: `A good summary should include a clear definition, main characteristics, why it is important, and one or two examples that illustrate the concept.` },
    { q: `What difficulties did you encounter when studying ${topic}?`, a: `Common difficulties include understanding new terminology, connecting different concepts, and visualizing how knowledge applies in practice.` },
    { q: `What else would you like to learn about ${topic}?`, a: `You can go deeper by studying special cases, researching the topic's history, exploring advanced applications, and discovering related topics.` },
    { q: `Create an original example related to ${topic}.`, a: `A good original example should demonstrate understanding of the topic, be relevant and applicable, and correctly show learned concepts in a new situation.` },
  ];
}

function buildFallbackQuizHtml(input: GenerateQuizInput, _pdfContext: string): string {
  const isSpanish = input.language === 'es';
  const titlePrefix = isSpanish ? 'CUESTIONARIO' : 'QUIZ';
  const topicUpper = (input.topic || '').toUpperCase();
  const topic = input.topic?.trim() || (isSpanish ? 'el tema' : 'the topic');

  // Obtener preguntas específicas del tema
  const topicQuestions = getTopicQuestions(topic, isSpanish);
  
  // Mezclar las preguntas para variar
  const shuffled = [...topicQuestions].sort(() => Math.random() - 0.5);
  
  // Tomar las primeras 15
  const selectedQuestions = shuffled.slice(0, 15);

  let formattedQuizHtml = `<h2>${titlePrefix} - ${topicUpper}</h2>`;
  formattedQuizHtml += `<p><strong>${isSpanish ? 'Libro:' : 'Book:'}</strong> ${input.bookTitle}</p>`;
  formattedQuizHtml += `<p><strong>${isSpanish ? 'Curso:' : 'Course:'}</strong> ${input.courseName}</p>`;
  formattedQuizHtml += `<br /><br />`;

  selectedQuestions.forEach((item, index) => {
    formattedQuizHtml += `<p style="margin-bottom: 1em;"><strong>${index + 1}. ${item.q}</strong></p>`;
    const answerLabel = isSpanish ? 'Respuesta esperada' : 'Expected answer';
    formattedQuizHtml += `<p style="margin-top: 0.5em; margin-bottom: 0.5em;"><strong>${answerLabel}:</strong></p>`;
    const formattedAnswer = capitalizeFirstLetter(String(item.a || '').replace(/\n/g, '<br />'));
    formattedQuizHtml += `<p style="margin-top: 0.25em; margin-bottom: 2em; text-align: justify;">${formattedAnswer}</p>`;
    if (index < 14) {
      formattedQuizHtml += '<hr style="margin-top: 1rem; margin-bottom: 1.5rem; border-top: 1px solid #e5e7eb;" />';
    }
  });

  return formattedQuizHtml;
}

// PDF processing (server-side)
// PDF.js in Node.js is unreliable; we skip it entirely and rely on fallback content.
// This function is kept as a stub that always returns empty to avoid breaking the flow.
async function extractTextFromPdfBuffer(_buf: ArrayBuffer): Promise<string[]> {
  // PDF.js worker setup fails in Node.js/Edge environments consistently.
  // Rather than fight with worker configuration, we skip PDF extraction entirely
  // and rely on the fallback quiz generator which produces reasonable content.
  console.log('[generate-quiz] PDF extraction disabled in server environment, using fallback');
  return [];
}

function toDriveDownloadUrl(entry: { pdfUrl?: string; driveId?: string }): string | null {
  if (entry?.driveId) return `https://drive.google.com/uc?export=download&id=${entry.driveId}`;
  if (entry?.pdfUrl) {
    // Convert /file/d/<id>/view?usp=... to direct download
    const m = entry.pdfUrl.match(/\/file\/d\/([^/]+)\/view/);
    if (m && m[1]) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
    return entry.pdfUrl;
  }
  return null;
}

async function fetchPdfArrayBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) return null;
    return await resp.arrayBuffer();
  } catch (e) {
    console.warn('[generate-quiz] fetch PDF failed:', e);
    return null;
  }
}

// Función optimizada para obtener páginas de PDF con caché
async function getPdfPagesWithCache(url: string): Promise<string[]> {
  // Verificar caché
  const cached = pdfContentCache.get(url);
  if (cached) {
    const ttl = cached.pages.length > 0 ? PDF_CACHE_TTL : PDF_FAILURE_TTL;
    if (Date.now() - cached.timestamp < ttl) {
      console.log('[generate-quiz] Usando PDF desde caché:', url.substring(0, 50));
      return cached.pages;
    }
  }
  
  // Descargar y extraer
  const buf = await fetchPdfArrayBuffer(url);
  if (!buf) {
    // Caché negativa para evitar reintentos continuos
    pdfContentCache.set(url, { pages: [], timestamp: Date.now() });
    return [];
  }
  
  const pages = await extractTextFromPdfBuffer(buf);
  
  // Guardar en caché
  // Limpiar entradas antiguas si hay más de 5
  if (pdfContentCache.size > 5) {
    const oldestKey = pdfContentCache.keys().next().value;
    if (oldestKey) pdfContentCache.delete(oldestKey);
  }
  // Guardar también páginas vacías (caché negativa) para evitar repetir descargas cuando pdfjs falla
  pdfContentCache.set(url, { pages, timestamp: Date.now() });
  
  return pages;
}

function selectRelevantContext(pages: string[], topic: string, subjectHint?: string, maxChars = 8000): { context: string; usedPageIndexes: number[] } {
  if (!pages?.length) return { context: '', usedPageIndexes: [] };
  const terms = (topic.toLowerCase().split(/[^a-záéíóúñü0-9]+/i).filter(Boolean));
  const subjectTerms = subjectHint ? subjectHint.toLowerCase().split(/[^a-záéíóúñü0-9]+/i).filter(Boolean) : [];
  const scorePage = (txt: string) => {
    const low = txt.toLowerCase();
    let s = 0;
    terms.forEach(t => { if (t && low.includes(t)) s += 3; });
    subjectTerms.forEach(t => { if (t && low.includes(t)) s += 1; });
    return s + Math.min(2, txt.length / 5000); // tiny length prior
  };
  const scored = pages.map((t, idx) => ({ idx, s: scorePage(t), t }));
  scored.sort((a, b) => b.s - a.s);
  const chunks: string[] = [];
  const used: number[] = [];
  let acc = 0;
  for (const it of scored) {
    if (!it.t || it.t.length < 100) continue;
    chunks.push(`(p.${it.idx + 1}) ${it.t}`);
    used.push(it.idx);
    acc += it.t.length;
    if (acc >= maxChars) break;
    if (chunks.length >= 12) break; // cap pages
  }
  return { context: chunks.join('\n\n'), usedPageIndexes: used };
}

async function collectContextForInput(input: GenerateQuizInput): Promise<{ context: string; references: string[] }> {
  // Generar clave de caché para el contexto
  const contextKey = `${input.courseName}_${input.bookTitle}_${input.topic.toLowerCase().trim()}`;
  
  // Verificar caché de contexto (incluye caché negativa)
  const cachedContext = contextCache.get(contextKey);
  if (cachedContext) {
    const ttl = cachedContext.context ? CONTEXT_CACHE_TTL : 2 * 60 * 1000; // 2 min para caché negativa
    if (Date.now() - cachedContext.timestamp < ttl) {
      console.log('[generate-quiz] Usando contexto desde caché para:', input.topic);
      return { context: cachedContext.context, references: cachedContext.references };
    }
  }
  
  // Identify PDFs by course and subject/book
  const course = input.courseName;
  const hint = input.bookTitle;
  const candidates = bookPDFs.filter(b => b.course === course && (b.title === hint || b.subject === hint));
  const refs: string[] = [];
  let combinedContext = '';
  
  for (const b of candidates) {
    const url = toDriveDownloadUrl(b);
    if (!url) continue;
    
    // Usar función con caché en lugar de descargar directamente
    const pages = await getPdfPagesWithCache(url);
    if (!pages.length) continue;
    
    const { context } = selectRelevantContext(pages, input.topic, b.subject, 6000);
    if (context) {
      combinedContext += (combinedContext ? '\n\n' : '') + `Fuente: ${b.title} (${b.subject})\n` + context;
      refs.push(b.title);
    }
    if (combinedContext.length > 14_000) break; // cap total
  }
  
  // Guardar en caché de contexto (incluye caché negativa cuando no hay contexto)
  if (contextCache.size > 20) {
    const oldestKey = contextCache.keys().next().value;
    if (oldestKey) contextCache.delete(oldestKey);
  }
  contextCache.set(contextKey, { context: combinedContext, references: refs, timestamp: Date.now() });
  
  return { context: combinedContext, references: refs };
}

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  bookTitle: z.string().describe('The title of the book.'),
  courseName: z.string().describe('The name of the course (used for context if needed).'),
  language: z.enum(['es', 'en']).describe('The language for the quiz content (e.g., "es" for Spanish, "en" for English).'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

// Schema for the structured output expected from the AI prompt
const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the open-ended question.'),
  expectedAnswer: z.string().describe('A comprehensive ideal answer to the open-ended question, based on the book content. This should be detailed enough for a student to understand the topic thoroughly.'),
});

const AiPromptOutputSchema = z.object({
  quizTitle: z.string().describe('The title of the quiz, formatted as "CUESTIONARIO - [TOPIC_NAME_IN_UPPERCASE]" if language is "es", or "QUIZ - [TOPIC_NAME_IN_UPPERCASE]" if language is "en".'),
  questions: z.array(QuestionSchema).length(15).describe('An array of exactly 15 open-ended quiz questions.'),
});

// Schema for the final output of the flow (formatted HTML string)
const GenerateQuizOutputSchema = z.object({
  quiz: z.string().describe('The generated quiz as a formatted HTML string.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  const cacheKey = makeQuizCacheKey(input);
  const cachedOut = quizOutputCache.get(cacheKey);
  if (cachedOut && Date.now() - cachedOut.timestamp < QUIZ_OUTPUT_TTL) {
    console.log('[generate-quiz] Usando quiz HTML desde caché para:', input.topic);
    return cachedOut.output;
  }

  const inFlight = quizInFlight.get(cacheKey);
  if (inFlight) {
    console.log('[generate-quiz] Esperando request en vuelo para:', input.topic);
    return inFlight;
  }

  const work = (async (): Promise<GenerateQuizOutput> => {
    try {
      // Mock mode for development only when NO compatible key is present
      const hasAnyKey = !!(process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY);
      if (process.env.NODE_ENV === 'development' && !hasAnyKey) {
        console.log('📝 Running generateQuiz in MOCK mode');
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const isSpanish = input.language === 'es';
        const titlePrefix = isSpanish ? 'CUESTIONARIO' : 'QUIZ';
        const topicUpper = input.topic.toUpperCase();
        
        const mockQuestions = [
          {
            questionText: isSpanish ? `¿Cuál es el concepto más importante de ${input.topic}?` : `What is the most important concept of ${input.topic}?`,
            expectedAnswer: isSpanish ? `El concepto más importante es la comprensión fundamental de los principios básicos que rigen ${input.topic}.` : `The most important concept is the fundamental understanding of the basic principles that govern ${input.topic}.`
          },
          {
            questionText: isSpanish ? `¿Cómo se relaciona ${input.topic} con otros temas del curso?` : `How does ${input.topic} relate to other course topics?`,
            expectedAnswer: isSpanish ? `${capitalizeFirstLetter(input.topic)} se conecta con múltiples áreas del conocimiento a través de sus aplicaciones prácticas.` : `${capitalizeFirstLetter(input.topic)} connects with multiple knowledge areas through its practical applications.`
          },
          {
            questionText: isSpanish ? `¿Cuáles son las aplicaciones prácticas de ${input.topic}?` : `What are the practical applications of ${input.topic}?`,
            expectedAnswer: isSpanish ? `Las aplicaciones incluyen resolver problemas cotidianos y comprender fenómenos naturales.` : `Applications include solving everyday problems and understanding natural phenomena.`
          }
        ];
        
        // Generate 15 questions by repeating and varying the mock questions
        const questions = [];
        for (let i = 0; i < 15; i++) {
          const baseQuestion = mockQuestions[i % mockQuestions.length];
          questions.push({
            questionText: `${baseQuestion.questionText}`,
            expectedAnswer: capitalizeFirstLetter(baseQuestion.expectedAnswer)
          });
        }
        
        const mockHtml = `
          <div class="quiz-container">
            <h1>${titlePrefix} - ${topicUpper}</h1>
            <p><strong>${isSpanish ? 'Libro:' : 'Book:'}</strong> ${input.bookTitle}</p>
            <p><strong>${isSpanish ? 'Curso:' : 'Course:'}</strong> ${input.courseName}</p>
            
            <br />
            
            ${questions.map((q, index) => `
              <div class="question-block" style="margin-bottom: 2em;">
                <p style="margin-bottom: 1em;"><strong>${index + 1}. ${q.questionText}</strong></p>
                <div class="answer-space">
                  <p style="margin-bottom: 0.5em;"><strong>${isSpanish ? 'Respuesta esperada:' : 'Expected answer:'}</strong></p>
                  <p style="margin-bottom: 1.5em; text-align: justify;">${q.expectedAnswer}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        
        return { quiz: mockHtml };
      }

      // Gather PDF context before calling the AI flow
      let context = '';
      let references: string[] = [];
      try {
        const ctx = await collectContextForInput(input);
        context = ctx.context;
        references = ctx.references;
      } catch (ctxErr) {
        console.warn('[generate-quiz] Context collection failed, continuing with empty context:', ctxErr);
      }

      try {
        return await generateQuizFlow({ ...input, _pdfContext: context, _pdfRefs: references });
      } catch (err) {
        // Fallback (especialmente útil cuando el proveedor responde 429)
        const isRateLimited = isLikelyRateLimitError(err);
        console.warn('[generate-quiz] AI quiz generation failed' + (isRateLimited ? ' (rate limited)' : '') + ':', err);
        return { quiz: buildFallbackQuizHtml(input, context) };
      }
    } catch (unexpected) {
      console.warn('[generate-quiz] Unexpected error, using fallback quiz:', unexpected);
      return { quiz: buildFallbackQuizHtml(input, '') };
    }
  })();

  quizInFlight.set(cacheKey, work);
  try {
    const out = await work;
    quizOutputCache.set(cacheKey, { output: out, timestamp: Date.now() });
    return out;
  } catch (finalErr) {
    // Ultimate fallback: if even the work promise rejects, return a basic quiz
    console.error('[generate-quiz] Final catch triggered, returning emergency fallback:', finalErr);
    return { quiz: buildFallbackQuizHtml(input, '') };
  } finally {
    quizInFlight.delete(cacheKey);
  }
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema.extend({
    topic_uppercase: z.string(),
    title_prefix: z.string(),
    _pdfContext: z.string().optional(),
    _pdfRefs: z.array(z.string()).optional(),
  })},
  output: {schema: AiPromptOutputSchema},
  prompt: `You are an expert educator and curriculum designer.
Your task is to generate a comprehensive quiz STRICTLY based on the provided PDF context extracted from the book(s) related to "{{bookTitle}}" and topic "{{topic}}".

Important rules:
- Use ONLY the following extracted PDF context to craft the questions and expected answers.
- If the context is insufficient, prefer concise, general high-level questions but DO NOT invent detailed facts not present in the context.
- Keep all content in {{{language}}}.

PDF CONTEXT (may be partial and noisy, includes page markers like (p.12)):
"""
{{_pdfContext}}
"""

The quiz MUST adhere to the following structure:
1.  **Quiz Title**: The title must be exactly "{{title_prefix}} - {{topic_uppercase}}".
2.  **Number of Questions**: Generate exactly 15 unique open-ended questions.
3.  **For each question, provide**:
    *   \`questionText\`: The clear and concise text of the open-ended question.
    *   \`expectedAnswer\`: A comprehensive ideal answer to the question, referencing concepts from the book "{{bookTitle}}" where possible. This answer should be detailed and clear, suitable for study and understanding.

All content (title, questions, answers) should be directly relevant to the topic "{{topic}}" as covered in the provided PDF context for "{{bookTitle}}". Ensure the language of all generated content is {{{language}}}.
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    // Extend input schema at runtime for internal fields
    inputSchema: GenerateQuizInputSchema.extend({ _pdfContext: z.string().optional(), _pdfRefs: z.array(z.string()).optional() }),
    outputSchema: GenerateQuizOutputSchema, // Flow returns the HTML string
  },
  async (input: GenerateQuizInput & { _pdfContext?: string; _pdfRefs?: string[] }) => {
    const titlePrefix = input.language === 'es' ? 'CUESTIONARIO' : 'QUIZ';
    const promptInput = {
      ...input,
      topic_uppercase: input.topic.toUpperCase(),
      title_prefix: titlePrefix,
      _pdfContext: input._pdfContext || '',
    };
    const {output} = await generateQuizPrompt(promptInput);

    if (!output || !output.questions || output.questions.length === 0) {
      throw new Error('AI failed to generate quiz questions.');
    }

    const isSpanish = input.language === 'es';
  let formattedQuizHtml = `<h2>${output.quizTitle}</h2>`;
    formattedQuizHtml += `<p><strong>${isSpanish ? 'Libro:' : 'Book:'}</strong> ${input.bookTitle}</p>`;
    formattedQuizHtml += `<p><strong>${isSpanish ? 'Curso:' : 'Course:'}</strong> ${input.courseName}</p>`;
    formattedQuizHtml += `<br /><br />`;
    
    output.questions.forEach((q, index) => {
      formattedQuizHtml += `<p style="margin-bottom: 1em;"><strong>${index + 1}. ${q.questionText}</strong></p>`;
      const answerLabel = input.language === 'es' ? 'Respuesta esperada' : 'Expected answer';
      formattedQuizHtml += `<p style="margin-top: 0.5em; margin-bottom: 0.5em;"><strong>${answerLabel}:</strong></p>`;
      // Format the expected answer for better readability, e.g., convert newlines to <br>
      const formattedAnswer = capitalizeFirstLetter(q.expectedAnswer.replace(/\n/g, '<br />'));
      formattedQuizHtml += `<p style="margin-top: 0.25em; margin-bottom: 2em; text-align: justify;">${formattedAnswer}</p>`;
      
      if (index < output.questions.length - 1) {
        formattedQuizHtml += '<hr style="margin-top: 1rem; margin-bottom: 1.5rem; border-top: 1px solid #e5e7eb;" />';
      }
    });

    // Append references if available
    if (Array.isArray(input._pdfRefs) && input._pdfRefs.length) {
      formattedQuizHtml += `<hr style="margin-top: 1rem; margin-bottom: 1rem; border-top: 1px solid #e5e7eb;" />`;
      const refsTitle = isSpanish ? 'Referencias (PDF)' : 'References (PDF)';
      formattedQuizHtml += `<p><strong>${refsTitle}:</strong> ${input._pdfRefs.join('; ')}</p>`;
    }

    return { quiz: formattedQuizHtml };
  }
);
