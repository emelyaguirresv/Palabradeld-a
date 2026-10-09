// main.ts · Pantalla de «Palabra del Día».
// No decide nada: solo llama a las funciones de logica.ts y dibuja el resultado.
import './estilo.css';
import {
  CONFIG,
  DICCIONARIO,
  crearGenerador,
  elegirPalabraSecreta,
  crearJuego,
  enviarIntento,
  pedirPista,
  generarCuadroCompartir,
} from './logica.ts';
import type { EstadoJuego, ResultadoLetra } from './logica.ts';

const contenedor = document.querySelector<HTMLDivElement>('#app');
if (!contenedor) {
  throw new Error('Falta el contenedor #app en index.html');
}

// ============================================================
// Estructura de la pantalla
// ============================================================
contenedor.innerHTML = `
  <div class="fondo" aria-hidden="true">
    <span class="orbe orbe-1"></span>
    <span class="orbe orbe-2"></span>
    <span class="orbe orbe-3"></span>
    <div class="rejilla"></div>
    <div class="scanlines"></div>
    <div class="vineta"></div>
  </div>

  <main class="juego" id="juego">
    <header class="cabecera">
      <p class="insignia">
        <span class="pulso"></span>
        <span>MISIÓN DIARIA</span>
        <span class="dia" id="dia">#0</span>
      </p>
      <h1 class="titulo" data-texto="PALABRA DEL DÍA">PALABRA DEL DÍA</h1>
      <p class="subtitulo">
        Adiviná la palabra de ${CONFIG.LARGO_PALABRA} letras en
        ${CONFIG.INTENTOS_MAXIMOS} intentos
      </p>
    </header>

    <div class="barra-progreso" aria-hidden="true">
      <span id="progreso"></span>
    </div>

    <p class="mensaje" id="mensaje" role="status" aria-live="polite"></p>

    <div class="pistas" id="pistas" aria-live="polite"></div>

    <div class="marco">
      <span class="esquina esquina-1"></span>
      <span class="esquina esquina-2"></span>
      <span class="esquina esquina-3"></span>
      <span class="esquina esquina-4"></span>
      <div class="tablero" id="tablero" aria-label="Tablero de intentos"></div>
    </div>

    <div class="teclado" id="teclado" aria-label="Teclado en pantalla"></div>

    <div class="acciones">
      <button type="button" class="boton boton-pista" id="pista">
        <span class="boton-brillo"></span>Pista
      </button>
      <button type="button" class="boton" id="nueva">
        <span class="boton-brillo"></span>Nueva partida
      </button>
    </div>

    <section class="resultado" id="resultado" hidden></section>

    <p class="ayuda">
      <span class="clave correcta">verde</span> letra en su lugar ·
      <span class="clave presente">amarillo</span> letra presente ·
      <span class="clave ausente">gris</span> letra ausente
    </p>
  </main>
`;

const juego = document.querySelector<HTMLElement>('#juego')!;
const tablero = document.querySelector<HTMLDivElement>('#tablero')!;
const teclado = document.querySelector<HTMLDivElement>('#teclado')!;
const mensaje = document.querySelector<HTMLParagraphElement>('#mensaje')!;
const progreso = document.querySelector<HTMLSpanElement>('#progreso')!;
const diaNumero = document.querySelector<HTMLSpanElement>('#dia')!;
const pistas = document.querySelector<HTMLDivElement>('#pistas')!;
const resultado = document.querySelector<HTMLElement>('#resultado')!;
const botonPista = document.querySelector<HTMLButtonElement>('#pista')!;
const botonNueva = document.querySelector<HTMLButtonElement>('#nueva')!;

// ============================================================
// Estado de la pantalla
// ============================================================
let estado: EstadoJuego;
let escritura = '';
let filasReveladas = 0;

// El tablero y el teclado se reutilizan; solo cambia su contenido.
const celdas: HTMLDivElement[][] = [];
const teclas = new Map<string, HTMLButtonElement>();

const TECLADO: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BORRAR'],
];

const PRIORIDAD: Record<ResultadoLetra, number> = {
  ausente: 0,
  presente: 1,
  correcta: 2,
};

// ============================================================
// Fecha · la palabra del día cambia una vez por día
// ============================================================
function semillaDeHoy(): number {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return Number(`${hoy.getFullYear()}${mes}${dia}`);
}

function numeroDelDia(): number {
  const hoy = new Date();
  return Math.floor(
    Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) / 86400000,
  );
}

// ============================================================
// Montaje del tablero y del teclado (una sola vez)
// ============================================================
function construirTablero(): void {
  for (let fila = 0; fila < CONFIG.INTENTOS_MAXIMOS; fila += 1) {
    const contenedorFila = document.createElement('div');
    contenedorFila.className = 'fila';
    const filaCeldas: HTMLDivElement[] = [];

    for (let columna = 0; columna < CONFIG.LARGO_PALABRA; columna += 1) {
      const celda = document.createElement('div');
      celda.className = 'celda';
      celda.style.setProperty('--columna', String(columna));
      contenedorFila.appendChild(celda);
      filaCeldas.push(celda);
    }

    celdas.push(filaCeldas);
    tablero.appendChild(contenedorFila);
  }
}

function construirTeclado(): void {
  TECLADO.forEach((fila) => {
    const contenedorFila = document.createElement('div');
    contenedorFila.className = 'teclado-fila';

    fila.forEach((tecla) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'tecla';
      if (tecla === 'ENTER' || tecla === 'BORRAR') {
        boton.classList.add('tecla-ancha');
      }
      boton.textContent = tecla === 'BORRAR' ? '⌫' : tecla;
      boton.setAttribute('aria-label', tecla === 'BORRAR' ? 'Borrar' : tecla);
      boton.addEventListener('click', () => manejarTecla(tecla));
      teclas.set(tecla, boton);
      contenedorFila.appendChild(boton);
    });

    teclado.appendChild(contenedorFila);
  });
}

// ============================================================
// Entrada · sirve para el dedo y para el teclado físico
// ============================================================
function manejarTecla(bruta: string): void {
  const tecla = bruta.toUpperCase();

  if (estado.estado !== 'jugando') {
    return;
  }

  if (tecla === 'ENTER') {
    if (enviarIntento(estado, escritura)) {
      escritura = '';
    } else {
      sacudir();
    }
    render();
    return;
  }

  if (tecla === 'BORRAR' || tecla === 'BACKSPACE') {
    escritura = escritura.slice(0, -1);
    render();
    return;
  }

  if (/^[A-ZÑ]$/.test(tecla) && escritura.length < CONFIG.LARGO_PALABRA) {
    escritura += tecla;
    render();
  }
}

function sacudir(): void {
  juego.classList.remove('sacudir');
  void juego.offsetWidth;
  juego.classList.add('sacudir');
  window.setTimeout(() => juego.classList.remove('sacudir'), 460);
}

// ============================================================
// Dibujo
// ============================================================
function mapaTeclas(): Map<string, ResultadoLetra> {
  const mapa = new Map<string, ResultadoLetra>();
  estado.intentos.forEach((intento) => {
    intento.letras.forEach((letra) => {
      const actual = mapa.get(letra.letra);
      if (!actual || PRIORIDAD[letra.resultado] > PRIORIDAD[actual]) {
        mapa.set(letra.letra, letra.resultado);
      }
    });
  });
  return mapa;
}

function renderTablero(): void {
  for (let fila = 0; fila < CONFIG.INTENTOS_MAXIMOS; fila += 1) {
    const intento = estado.intentos[fila];
    const esGanadora =
      estado.estado === 'ganado' && fila === estado.intentos.length - 1;

    for (let columna = 0; columna < CONFIG.LARGO_PALABRA; columna += 1) {
      const celda = celdas[fila][columna];
      celda.className = 'celda';
      celda.textContent = '';

      if (intento) {
        const letra = intento.letras[columna];
        celda.textContent = letra.letra;
        celda.classList.add(letra.resultado);
        if (fila >= filasReveladas) {
          celda.classList.add('revelar');
        }
        if (esGanadora) {
          celda.classList.add('ganadora');
        }
      } else if (fila === estado.intentos.length && estado.estado === 'jugando') {
        const letra = [...escritura][columna];
        if (letra) {
          celda.textContent = letra;
          celda.classList.add('activa');
        }
      }
    }
  }

  filasReveladas = estado.intentos.length;
}

function renderTeclado(): void {
  const mapa = mapaTeclas();
  teclas.forEach((boton, tecla) => {
    boton.classList.remove('correcta', 'presente', 'ausente');
    const resultadoTecla = mapa.get(tecla);
    if (resultadoTecla) {
      boton.classList.add(resultadoTecla);
    }
  });
}

function renderMensaje(): void {
  mensaje.textContent = estado.mensaje;
  mensaje.classList.toggle('mensaje-final', estado.estado !== 'jugando');
}

function renderProgreso(): void {
  const avance = estado.intentos.length / CONFIG.INTENTOS_MAXIMOS;
  progreso.style.width = `${avance * 100}%`;
}

function renderEstado(): void {
  juego.classList.toggle('estado-ganado', estado.estado === 'ganado');
  juego.classList.toggle('estado-perdido', estado.estado === 'perdido');
}

function renderPista(): void {
  pistas.innerHTML = '';
  estado.pistas.forEach((texto, indice) => {
    const item = document.createElement('p');
    item.className = 'pista';
    const numero = document.createElement('span');
    numero.className = 'pista-num';
    numero.textContent = String(indice + 1);
    item.appendChild(numero);
    item.appendChild(document.createTextNode(texto));
    pistas.appendChild(item);
  });

  const agotadas =
    estado.pistasUsadas >= CONFIG.MAX_PISTAS || estado.estado !== 'jugando';
  botonPista.disabled = agotadas;
}

function renderResultado(): void {
  if (estado.estado === 'jugando') {
    resultado.hidden = true;
    resultado.innerHTML = '';
    return;
  }

  const gano = estado.estado === 'ganado';
  const cuadro = generarCuadroCompartir(estado, numeroDelDia());

  resultado.hidden = false;
  resultado.innerHTML = `
    <h2 class="titulo-resultado">${gano ? '¡MISIÓN CUMPLIDA!' : 'SEÑAL PERDIDA'}</h2>
    <p class="palabra-secreta">La palabra era <b>${estado.palabraSecreta}</b></p>
    <pre class="cuadro" id="cuadro">${cuadro}</pre>
    <button type="button" class="boton boton-secundario" id="copiar">
      <span class="boton-brillo"></span>Copiar resultado
    </button>
    <p class="aviso-copia" id="aviso-copia" role="status"></p>
  `;

  const botonCopiar = resultado.querySelector<HTMLButtonElement>('#copiar')!;
  const aviso = resultado.querySelector<HTMLParagraphElement>('#aviso-copia')!;
  botonCopiar.addEventListener('click', () => {
    void copiarAlPortapapeles(cuadro, aviso);
  });
}

async function copiarAlPortapapeles(texto: string, aviso: HTMLElement): Promise<void> {
  try {
    await navigator.clipboard.writeText(texto);
    aviso.textContent = 'Listo, copiado.';
  } catch {
    aviso.textContent = 'No se pudo copiar. Seleccionalo a mano.';
  }
}

function render(): void {
  renderTablero();
  renderTeclado();
  renderMensaje();
  renderProgreso();
  renderEstado();
  renderPista();
  renderResultado();
}

// ============================================================
// Partidas
// ============================================================
function comenzarPartida(semilla: number): void {
  estado = crearJuego(elegirPalabraSecreta(DICCIONARIO, crearGenerador(semilla)));
  escritura = '';
  filasReveladas = 0;
  render();
}

// ============================================================
// Arranque
// ============================================================
construirTablero();
construirTeclado();
diaNumero.textContent = `#${numeroDelDia()}`;

botonPista.addEventListener('click', () => {
  if (pedirPista(estado)) {
    render();
  }
});

botonNueva.addEventListener('click', () => {
  comenzarPartida(Math.floor(Math.random() * 1000000));
});

window.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    manejarTecla('ENTER');
  } else if (evento.key === 'Backspace') {
    manejarTecla('BORRAR');
  } else if (/^[a-zA-ZñÑ]$/.test(evento.key)) {
    manejarTecla(evento.key);
  }
});

comenzarPartida(semillaDeHoy());
