// logica.ts · Reglas de «Palabra del Día».
// Este archivo NO toca la pantalla: nada de document, window, alert ni console.log.
// Solo datos y funciones que trabajan sobre el estado del juego.

// ============================================================
// CONFIG · todos los números juntos, con su unidad
// ============================================================
export const CONFIG = {
  LARGO_PALABRA: 5, // cantidad de letras que tiene la palabra secreta (letras)
  INTENTOS_MAXIMOS: 6, // intentos disponibles por partida (intentos)
  MAX_FILAS_COMPARTIR: 6, // filas que muestra el cuadro de emojis (filas)
  MAX_PISTAS: 2, // pistas que se pueden pedir por partida (pistas)
} as const;

// ============================================================
// Tipos
// ============================================================

// Resultado de una letra tras compararla con la palabra secreta.
export type ResultadoLetra = 'correcta' | 'presente' | 'ausente';

// Una letra ya evaluada, lista para pintar en pantalla.
export interface LetraEvaluada {
  letra: string;
  resultado: ResultadoLetra;
}

// Un intento completo del jugador.
export interface Intento {
  palabra: string;
  letras: LetraEvaluada[];
}

// Los tres estados posibles de una partida.
export type SituacionPartida = 'jugando' | 'ganado' | 'perdido';

// Todo lo que sabe el juego en un momento dado.
export interface EstadoJuego {
  palabraSecreta: string;
  permitidas: ReadonlySet<string>;
  intentos: Intento[];
  pistas: string[]; // pistas ya reveladas, en orden
  pistasUsadas: number; // cuántas pistas se pidieron en la partida
  estado: SituacionPartida;
  mensaje: string;
}

// Generador de números al azar reproducible.
export type GeneradorAleatorio = () => number;

// ============================================================
// Diccionario propio · palabras de 5 letras, sin tildes
// ============================================================
export const DICCIONARIO: readonly string[] = [
  'PERRO', 'GATOS', 'LIBRO', 'FUEGO', 'MUNDO',
  'CIELO', 'NUBES', 'COSTA', 'VERDE', 'NEGRO',
  'ROJOS', 'ARBOL', 'AGUAS', 'SOLES', 'LUNAS',
  'CAMPO', 'MONTE', 'LAGOS', 'ARENA', 'PLAYA',
  'BARCO', 'CALLE', 'SILLA', 'RELOJ', 'COLOR',
  'DULCE', 'FRUTA', 'PANES', 'QUESO', 'LECHE',
  'CARNE', 'PESCA', 'JUEGO', 'DANZA', 'CANTO',
  'SABER', 'PODER', 'AMIGO', 'MADRE', 'PADRE',
  'CLIMA', 'NIEVE', 'RAYOS', 'CALOR', 'DARDO',
  'PUNTA', 'LETRA', 'TINTA', 'PAPEL', 'POEMA',
  'RITMO', 'TONOS', 'CLAVE', 'LLAVE', 'FORMA',
  'PUNTO', 'RUEDA', 'MOTOR', 'VELOZ', 'NADAR',
  'VUELO', 'PLUMA', 'CELDA', 'DATOS', 'TECLA',
  'RATON', 'BOTON', 'REDES', 'NIVEL', 'MARCA',
  'TURNO', 'FICHA', 'TABLA', 'LISTA', 'ORDEN',
  'GRUPO', 'TRATO',
];

// ============================================================
// Pistas · una descripción para cada palabra del diccionario
// ============================================================
export const PISTAS: Record<string, string> = {
  PERRO: 'Animal doméstico fiel que ladra y mueve la cola.',
  GATOS: 'Felinos domésticos que ronronean (en plural).',
  LIBRO: 'Objeto con hojas y tapas que se lee.',
  FUEGO: 'Llama que da calor y luz.',
  MUNDO: 'El planeta entero y todo lo que hay en él.',
  CIELO: 'Espacio azul o estrellado que vemos hacia arriba.',
  NUBES: 'Masas de vapor de agua que flotan en lo alto (en plural).',
  COSTA: 'Orilla o franja de tierra junto al mar.',
  VERDE: 'Color de las hojas y del pasto.',
  NEGRO: 'Color más oscuro de todos.',
  ROJOS: 'Del color de la sangre o del tomate (en plural).',
  ARBOL: 'Planta grande con tronco, ramas y hojas.',
  AGUAS: 'Líquido transparente que bebemos (en plural).',
  SOLES: 'Astros que iluminan y calientan (en plural).',
  LUNAS: 'Acompañan la noche; la de la Tierra, en plural.',
  CAMPO: 'Terreno abierto, a veces con cultivos.',
  MONTE: 'Elevación grande del terreno, más que una colina.',
  LAGOS: 'Extensiones de agua dulce rodeadas de tierra.',
  ARENA: 'Granos finos de las playas y los desiertos.',
  PLAYA: 'Zona de arena junto al mar.',
  BARCO: 'Embarcación que navega por el agua.',
  CALLE: 'Vía por donde pasan personas y vehículos.',
  SILLA: 'Mueble para sentarse, con respaldo.',
  RELOJ: 'Artefacto que mide y muestra las horas.',
  COLOR: 'Sensación que capta el ojo, como el azul o el rojo.',
  DULCE: 'Sabor del azúcar y de la miel.',
  FRUTA: 'Alimento vegetal, como la manzana o la naranja.',
  PANES: 'Alimentos de harina que se hornean (en plural).',
  QUESO: 'Derivado de la leche, típico en las pupusas.',
  LECHE: 'Líquido blanco que da la vaca.',
  CARNE: 'Alimento de origen animal, como la de res.',
  PESCA: 'Actividad de sacar peces del agua.',
  JUEGO: 'Actividad con reglas que sirve para divertirse.',
  DANZA: 'Se expresa moviendo el cuerpo al ritmo de la música.',
  CANTO: 'Se hace con la voz y suena melodioso.',
  SABER: 'Tener conocimiento de algo.',
  PODER: 'Capacidad o fuerza para hacer algo.',
  AMIGO: 'Persona con quien compartís cariño y confianza.',
  MADRE: 'Mujer que da a luz o cría a sus hijos.',
  PADRE: 'Hombre que engendra o cría a sus hijos.',
  CLIMA: 'Condiciones del tiempo de una región.',
  NIEVE: 'Cae blanca y fría del cielo en el invierno.',
  RAYOS: 'Descargas eléctricas luminosas de la tormenta (en plural).',
  CALOR: 'Sensación de temperatura alta.',
  DARDO: 'Flecha corta que se lanza a una diana.',
  PUNTA: 'Extremo agudo de un objeto.',
  LETRA: 'Símbolo del alfabeto, como la A o la Z.',
  TINTA: 'Líquido que usan las plumas y las impresoras.',
  PAPEL: 'Hoja delgada donde se escribe o se imprime.',
  POEMA: 'Texto escrito en versos, con ritmo.',
  RITMO: 'Repetición regular de sonidos o movimientos.',
  TONOS: 'Sonidos con distinta altura (en plural).',
  CLAVE: 'Palabra secreta para entrar o abrir algo.',
  LLAVE: 'Objeto que abre una cerradura.',
  FORMA: 'Contorno o figura de un objeto.',
  PUNTO: 'Señal pequeña y redonda; también una unidad de un juego.',
  RUEDA: 'Círculo que gira y permite avanzar.',
  MOTOR: 'Máquina que produce movimiento.',
  VELOZ: 'Que se mueve muy rápido.',
  NADAR: 'Avanzar en el agua moviendo brazos y piernas.',
  VUELO: 'El desplazarse por el aire, como hacen las aves.',
  PLUMA: 'Con ella escribían; también cubre a las aves.',
  CELDA: 'Habitación pequeña; también la unidad básica de la vida.',
  DATOS: 'Información que maneja una computadora (en plural).',
  TECLA: 'Pieza que se pulsa en un teclado.',
  RATON: 'Dispositivo para mover el cursor; también un roedor.',
  BOTON: 'Pieza que al pulsarla acciona algo.',
  REDES: 'Conectan computadoras; también sirven para pescar (en plural).',
  NIVEL: 'Grado o altura; también una etapa de un juego.',
  MARCA: 'Señal que sirve para reconocer algo.',
  TURNO: 'Momento en que le toca jugar a cada quien.',
  FICHA: 'Pieza de un juego; también una hoja con datos.',
  TABLA: 'Cuadro ordenado en filas y columnas.',
  LISTA: 'Serie de nombres o cosas puestas en orden.',
  ORDEN: 'Colocación correcta de las cosas.',
  GRUPO: 'Conjunto de personas o cosas reunidas.',
  TRATO: 'Acuerdo entre dos personas.',
};

// ============================================================
// Utilidades de texto
// ============================================================

// Deja el texto en mayúsculas y sin tildes, para comparar siempre igual.
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

// Cuenta letras reales, no unidades de código, para no fallar con emojis.
export function contarLetras(texto: string): number {
  return [...texto].length;
}

// ============================================================
// Azar reproducible · la misma semilla da siempre lo mismo
// ============================================================

// Generador tipo Mulberry32: recibe una semilla y devuelve números entre 0 y 1.
export function crearGenerador(semilla: number): GeneradorAleatorio {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Elige una palabra del diccionario usando el generador recibido.
export function elegirPalabraSecreta(
  diccionario: readonly string[],
  generador: GeneradorAleatorio,
): string {
  if (diccionario.length === 0) {
    throw new Error('El diccionario está vacío: no se puede elegir palabra.');
  }
  const indice = Math.min(
    Math.floor(generador() * diccionario.length),
    diccionario.length - 1,
  );
  return normalizar(diccionario[indice]);
}

// ============================================================
// Reglas del juego
// ============================================================

// Crea una partida nueva con la palabra secreta indicada.
export function crearJuego(
  palabraSecreta: string,
  permitidas: readonly string[] = DICCIONARIO,
): EstadoJuego {
  const conjunto = new Set(permitidas.map(normalizar));
  const secreta = normalizar(palabraSecreta);
  conjunto.add(secreta);
  return {
    palabraSecreta: secreta,
    permitidas: conjunto,
    intentos: [],
    pistas: [],
    pistasUsadas: 0,
    estado: 'jugando',
    mensaje: '',
  };
}

// Compara un intento con la palabra secreta y devuelve el color de cada letra.
// Primero marca las correctas y después las presentes, para no contar dos veces
// una letra repetida.
export function evaluarIntento(intento: string, secreta: string): ResultadoLetra[] {
  const palabra = normalizar(intento);
  const objetivo = normalizar(secreta);
  const letrasPalabra = [...palabra];
  const letrasObjetivo = [...objetivo];

  const resultado: ResultadoLetra[] = letrasPalabra.map(() => 'ausente');
  const usadas: boolean[] = letrasObjetivo.map(() => false);

  for (let i = 0; i < letrasPalabra.length; i += 1) {
    if (letrasPalabra[i] === letrasObjetivo[i]) {
      resultado[i] = 'correcta';
      usadas[i] = true;
    }
  }

  for (let i = 0; i < letrasPalabra.length; i += 1) {
    if (resultado[i] === 'correcta') continue;
    for (let j = 0; j < letrasObjetivo.length; j += 1) {
      if (!usadas[j] && letrasPalabra[i] === letrasObjetivo[j]) {
        resultado[i] = 'presente';
        usadas[j] = true;
        break;
      }
    }
  }

  return resultado;
}

// Intenta agregar un intento al estado. Devuelve true si la jugada fue válida.
export function enviarIntento(estado: EstadoJuego, palabra: string): boolean {
  if (estado.estado !== 'jugando') {
    estado.mensaje = 'La partida ya terminó. Empezá una nueva.';
    return false;
  }

  const limpia = normalizar(palabra);

  if (contarLetras(limpia) !== CONFIG.LARGO_PALABRA) {
    estado.mensaje = `La palabra debe tener ${CONFIG.LARGO_PALABRA} letras.`;
    return false;
  }

  if (!/^[A-ZÑ]+$/.test(limpia)) {
    estado.mensaje = 'Solo se permiten letras.';
    return false;
  }

  if (!estado.permitidas.has(limpia)) {
    estado.mensaje = 'Esa palabra no está en el diccionario.';
    return false;
  }

  const letras: LetraEvaluada[] = evaluarIntento(limpia, estado.palabraSecreta).map(
    (resultado, i) => ({ letra: [...limpia][i], resultado }),
  );

  estado.intentos.push({ palabra: limpia, letras });

  if (limpia === estado.palabraSecreta) {
    estado.estado = 'ganado';
    const n = estado.intentos.length;
    estado.mensaje = `¡Correcto! Lo lograste en ${n} ${n === 1 ? 'intento' : 'intentos'}.`;
  } else if (estado.intentos.length >= CONFIG.INTENTOS_MAXIMOS) {
    estado.estado = 'perdido';
    estado.mensaje = `Se acabaron los intentos. La palabra era ${estado.palabraSecreta}.`;
  } else {
    const restantes = CONFIG.INTENTOS_MAXIMOS - estado.intentos.length;
    estado.mensaje = `Seguí intentando. Te quedan ${restantes}.`;
  }

  return true;
}

// Reinicia la partida con una palabra secreta nueva. Devuelve true si se pudo.
export function reiniciarJuego(estado: EstadoJuego, palabraSecreta: string): boolean {
  const secreta = normalizar(palabraSecreta);
  if (!estado.permitidas.has(secreta)) {
    return false;
  }
  estado.palabraSecreta = secreta;
  estado.intentos = [];
  estado.pistas = [];
  estado.pistasUsadas = 0;
  estado.estado = 'jugando';
  estado.mensaje = '';
  return true;
}

// Muestra la pista siguiente de la partida. Devuelve true si se pudo mostrar.
// La primera pista es la descripción; la segunda revela la letra inicial.
export function pedirPista(estado: EstadoJuego): boolean {
  if (estado.estado !== 'jugando') {
    estado.mensaje = 'La partida ya terminó. Empezá una nueva.';
    return false;
  }

  if (estado.pistasUsadas >= CONFIG.MAX_PISTAS) {
    estado.mensaje = 'Ya no te quedan pistas en esta partida.';
    return false;
  }

  const secreta = estado.palabraSecreta;
  const numero = estado.pistasUsadas;
  let pista: string;

  if (numero === 0) {
    pista = PISTAS[secreta] ?? 'No hay descripción para esta palabra.';
  } else {
    pista = `Empieza con la letra «${[...secreta][0]}».`;
  }

  estado.pistas.push(pista);
  estado.pistasUsadas += 1;
  estado.mensaje = `Pista ${estado.pistasUsadas}/${CONFIG.MAX_PISTAS}: ${pista}`;
  return true;
}

// ============================================================
// Cuadro para compartir · el giro del encargo
// ============================================================

// Devuelve el cuadrito de emojis del resultado, sin revelar la palabra.
export function generarCuadroCompartir(estado: EstadoJuego, numeroDia: number): string {
  const emojis: Record<ResultadoLetra, string> = {
    correcta: '🟩',
    presente: '🟨',
    ausente: '⬛',
  };

  const lineas = estado.intentos
    .slice(0, CONFIG.MAX_FILAS_COMPARTIR)
    .map((intento) => intento.letras.map((l) => emojis[l.resultado]).join(''));

  const titulo = `Palabra del Día #${numeroDia} · ${estado.intentos.length}/${CONFIG.INTENTOS_MAXIMOS}`;
  return [titulo, ...lineas].join('\n');
}
