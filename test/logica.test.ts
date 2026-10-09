import { describe, it, expect } from 'vitest';
import {
  CONFIG,
  DICCIONARIO,
  crearGenerador,
  elegirPalabraSecreta,
  crearJuego,
  evaluarIntento,
  enviarIntento,
  reiniciarJuego,
  generarCuadroCompartir,
} from '../src/logica.ts';
import type { EstadoJuego } from '../src/logica.ts';

// Diccionario chiquito y controlado para las pruebas.
const PALABRAS = [
  'PERRO', 'GATOS', 'TECLA', 'VUELO', 'MADRE',
  'NUBES', 'LIBRO', 'FUEGO', 'CANTO', 'DANZA',
];

function juegoDePrueba(secreta = 'PERRO'): EstadoJuego {
  return crearJuego(secreta, PALABRAS);
}

describe('El estado inicial se arma bien', () => {
  it('una partida nueva empieza jugando, sin intentos y sin mensaje', () => {
    const estado = juegoDePrueba();

    expect(estado.palabraSecreta).toBe('PERRO');
    expect(estado.estado).toBe('jugando');
    expect(estado.intentos).toEqual([]);
    expect(estado.mensaje).toBe('');
    expect(estado.permitidas.has('PERRO')).toBe(true);
  });
});

describe('Cada acción del usuario responde si fue válida', () => {
  it('un intento válido se agrega y devuelve true', () => {
    const estado = juegoDePrueba();

    const valido = enviarIntento(estado, 'GATOS');

    expect(valido).toBe(true);
    expect(estado.intentos).toHaveLength(1);
    expect(estado.intentos[0].palabra).toBe('GATOS');
    expect(estado.intentos[0].letras).toHaveLength(CONFIG.LARGO_PALABRA);
  });

  it('una palabra de largo incorrecto devuelve false y no se agrega', () => {
    const estado = juegoDePrueba();

    const valido = enviarIntento(estado, 'SOL');

    expect(valido).toBe(false);
    expect(estado.intentos).toHaveLength(0);
    expect(estado.mensaje).toContain('5 letras');
  });

  it('acepta la palabra escrita en minúsculas y sin tildes', () => {
    const estado = juegoDePrueba();

    expect(enviarIntento(estado, 'perro')).toBe(true);
    expect(estado.estado).toBe('ganado');
  });
});

describe('No se puede hacer una acción prohibida por las reglas', () => {
  it('rechaza una palabra que no está en el diccionario', () => {
    const estado = juegoDePrueba();

    const valido = enviarIntento(estado, 'ZZZZZ');

    expect(valido).toBe(false);
    expect(estado.intentos).toHaveLength(0);
    expect(estado.mensaje).toContain('diccionario');
  });

  it('no deja seguir jugando después de que la partida terminó', () => {
    const estado = juegoDePrueba();
    enviarIntento(estado, 'PERRO');

    const valido = enviarIntento(estado, 'GATOS');

    expect(valido).toBe(false);
    expect(estado.intentos).toHaveLength(1);
    expect(estado.mensaje).toContain('terminó');
  });

  it('no se puede jugar más de la cantidad máxima de intentos', () => {
    const estado = juegoDePrueba();
    const erroneas = ['GATOS', 'TECLA', 'VUELO', 'MADRE', 'NUBES', 'LIBRO'];

    erroneas.forEach((palabra) => enviarIntento(estado, palabra));
    const sobrante = enviarIntento(estado, 'FUEGO');

    expect(sobrante).toBe(false);
    expect(estado.intentos).toHaveLength(CONFIG.INTENTOS_MAXIMOS);
    expect(estado.estado).toBe('perdido');
  });
});

describe('La condición de termina bien y la de termina mal', () => {
  it('cuando se acierta la palabra, la partida queda ganada', () => {
    const estado = juegoDePrueba();

    enviarIntento(estado, 'PERRO');

    expect(estado.estado).toBe('ganado');
    expect(estado.mensaje).toContain('Correcto');
  });

  it('cuando se agotan los intentos sin acertar, la partida queda perdida', () => {
    const estado = juegoDePrueba();
    const erroneas = ['GATOS', 'TECLA', 'VUELO', 'MADRE', 'NUBES', 'LIBRO'];

    erroneas.forEach((palabra) => enviarIntento(estado, palabra));

    expect(estado.estado).toBe('perdido');
    expect(estado.mensaje).toContain('PERRO');
  });
});

describe('Un uso completo de principio a fin', () => {
  it('se puede llegar al final bueno jugando desde el principio', () => {
    const generador = crearGenerador(7);
    const secreta = elegirPalabraSecreta(PALABRAS, generador);
    const estado = crearJuego(secreta, PALABRAS);

    enviarIntento(estado, 'GATOS');
    enviarIntento(estado, 'TECLA');
    enviarIntento(estado, 'VUELO');
    const gano = enviarIntento(estado, secreta);

    expect(gano).toBe(true);
    expect(estado.estado).toBe('ganado');
    expect(estado.intentos.length).toBeLessThanOrEqual(CONFIG.INTENTOS_MAXIMOS);
    const ultimo = estado.intentos[estado.intentos.length - 1];
    expect(ultimo.letras.every((l) => l.resultado === 'correcta')).toBe(true);
  });
});

describe('Las pistas de color comparan bien las letras repetidas', () => {
  it('cada aparición de una letra se marca una sola vez', () => {
    const pistas = evaluarIntento('SESOS', 'QUESO');

    expect(pistas).toEqual([
      'presente',
      'presente',
      'ausente',
      'presente',
      'ausente',
    ]);
  });

  it('las letras en su lugar se marcan como correctas antes que las presentes', () => {
    const pistas = evaluarIntento('PERRO', 'PERRO');

    expect(pistas).toEqual([
      'correcta',
      'correcta',
      'correcta',
      'correcta',
      'correcta',
    ]);
  });
});

describe('El azar es reproducible con la misma semilla', () => {
  it('dos generadores con la misma semilla eligen la misma palabra', () => {
    const primera = elegirPalabraSecreta(DICCIONARIO, crearGenerador(42));
    const segunda = elegirPalabraSecreta(DICCIONARIO, crearGenerador(42));

    expect(primera).toBe(segunda);
    expect(DICCIONARIO).toContain(primera);
  });

  it('el generador siempre devuelve números entre 0 y 1', () => {
    const generador = crearGenerador(123);
    for (let i = 0; i < 50; i += 1) {
      const n = generador();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe('Todas las palabras del diccionario sirven para jugar', () => {
  it('cada palabra tiene exactamente el largo exigido y solo letras', () => {
    DICCIONARIO.forEach((palabra) => {
      expect(palabra).toHaveLength(CONFIG.LARGO_PALABRA);
      expect(/^[A-ZÑ]+$/.test(palabra)).toBe(true);
    });
  });
});

describe('Reiniciar y compartir', () => {
  it('reiniciar con una palabra válida limpia los intentos y vuelve a jugar', () => {
    const estado = juegoDePrueba();
    enviarIntento(estado, 'GATOS');

    const pudo = reiniciarJuego(estado, 'DANZA');

    expect(pudo).toBe(true);
    expect(estado.palabraSecreta).toBe('DANZA');
    expect(estado.estado).toBe('jugando');
    expect(estado.intentos).toEqual([]);
  });

  it('el cuadro para compartir tiene una fila de emojis por intento', () => {
    const estado = juegoDePrueba();
    enviarIntento(estado, 'GATOS');
    enviarIntento(estado, 'PERRO');

    const cuadro = generarCuadroCompartir(estado, 1);
    const lineas = cuadro.split('\n');

    expect(lineas[0]).toContain('Palabra del Día #1');
    expect(lineas).toHaveLength(estado.intentos.length + 1);
    expect(lineas[2]).toHaveLength(CONFIG.LARGO_PALABRA * 2);
  });
});
