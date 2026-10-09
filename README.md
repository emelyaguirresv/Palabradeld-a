# Palabra del Día

> «Adiviná la palabra de cinco letras en seis intentos, y mirá cómo se pintan las pistas.»

## 1. Qué es

**Palabra del Día** es un juego de palabras: cada partida esconde una palabra de cinco letras y hay que descubrirla en seis intentos. Después de cada intento, cada letra se pinta de un color según qué tan cerca estuvo.

## 2. Qué hace y cómo se usa

1. Escribí una palabra de cinco letras, con el teclado en pantalla o con el teclado físico.
2. Presioná **ENTER**. Verde = letra en su lugar, amarillo = letra presente en otra posición, gris = letra que no está.
3. Si acertás antes de seis intentos, ganás; si se agotan, la partida se pierde y te muestra la palabra. Después podés **copiar el cuadrito de emojis** para compartir el resultado sin revelar la palabra.

## 3. Enlace para abrirlo

El juego queda publicado en GitHub Pages:

```
https://emelyaguirresv.github.io/Palabradeld-a/
```

## 4. Cómo correrlo en otra máquina

Necesitás Node.js instalado. En una terminal, dentro de la carpeta del proyecto:

```bash
npm install
npm run dev
```

Vite muestra una dirección (por ejemplo `http://localhost:5173`) para abrir en el navegador.

Otros comandos útiles:

```bash
npm test        # corre las pruebas con Vitest
npm run typecheck   # revisa los tipos con TypeScript
npm run build   # genera la versión de producción en dist/
```

## 5. Qué dirigí yo y qué error encontré probando

<!-- ESTUDIANTE: escribí acá con tus palabras, no lo dejes vacío. -->

_(Completar a mano: qué decisiones tomaste vos, qué le pediste a la IA y qué error encontraste mientras probabas el juego.)_

## 6. Declaración de autoría

- Herramienta usada: agente de IA dentro del editor (Copilot / asistente), bajo mi dirección.
- El código lo generó un agente de IA a partir de mi ficha, mis decisiones y los prompts que yo escribí y ordené.
- Las partes que puedo explicar: `src/logica.ts` (las reglas, el objeto `CONFIG`, el generador con semilla y la forma de comparar letras repetidas), `test/logica.test.ts` (qué comprueba cada prueba) y cómo `src/main.ts` solo dibuja lo que la lógica decide.
