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
  estado.estado = 'jugando';
  estado.mensaje = '';
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
