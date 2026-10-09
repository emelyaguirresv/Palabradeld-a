# PROMPTS.md · Registro de lo que le pedí al agente

Encargo elegido: **01 · PALABRA DEL DÍA**.
Este archivo se escribe en el momento en que se manda cada prompt, no al final de memoria.

---

## P1 · Arranque · las reglas

**Prompt enviado:**

> Creá el archivo src/logica.ts con las reglas de un JUEGO DE ADIVINAR LA PALABRA DEL DÍA (tipo Wordle), según la ficha de abajo.
>
> REGLAS TÉCNICAS, obligatorias
> - TypeScript. Exportá los tipos y el objeto CONFIG con todos los números juntos arriba, cada uno con un comentario que diga su unidad.
> - Este archivo NO puede tocar la pantalla: nada de document, window, alert ni console.log. Solo datos y funciones sobre el estado.
> - Cada función que cambia el estado devuelve true si la acción fue válida y false si no se pudo hacer.
> - Si hace falta azar, usá un generador con semilla y exportalo, para que la misma semilla dé siempre el mismo resultado.
> - Código y comentarios en español.
>
> REGLAS DE TRABAJO
> - Hacé exactamente lo que dice la ficha. Nada más.
> - Si algo es ambiguo o imposible, paralo y preguntame antes de inventar.
> - Al terminar, listame qué dejaste fuera y qué decidiste vos donde la ficha no decía nada.
>
> FICHA:
> Nombre: Palabra del Día
> En una frase: adiviná una palabra de cinco letras en seis intentos con pistas de color.
> Tres verbos: escribir, enviar el intento, empezar una partida nueva.
> Termina bien si: acierto la palabra antes de seis intentos.
> Termina mal si: se agotan los seis intentos sin acertar.
> Diccionario: lo armo yo, palabras de cinco letras sin tildes.
> Extra: al final da un cuadrito de emojis para compartir.

**Qué hizo el agente:** creó `src/logica.ts` con `CONFIG` (largo de palabra e intentos), los tipos (`EstadoJuego`, `Intento`, `LetraEvaluada`, `ResultadoLetra`), un generador Mulberry32 con semilla, el diccionario propio de 77 palabras y las funciones `evaluarIntento`, `enviarIntento` y `reiniciarJuego`. No tocó la pantalla. Dejó fuera la validación de palabras con tildes (el diccionario no las tiene).

---

## P2 · Pruebas · que la máquina revise

**Prompt enviado:**

> Escribí pruebas con Vitest para src/logica.ts, en test/logica.test.ts.
>
> Como mínimo cinco, y tienen que cubrir:
> 1. Que el estado inicial se arme bien.
> 2. Cada acción del usuario: qué hace cuando es válida y qué devuelve cuando no.
> 3. Que no se pueda hacer una acción prohibida por las reglas.
> 4. La condición de «termina bien» y la de «termina mal» de mi ficha.
> 5. UNA PRUEBA QUE RECORRA UN USO COMPLETO de principio a fin y compruebe que SE PUEDE LLEGAR AL FINAL BUENO.
>
> Los nombres de las pruebas en español y en forma de frase.
> No modifiques src/logica.ts. Al terminar corré npm test y pegame el resultado.

**Qué hizo el agente:** escribió 17 pruebas agrupadas, incluida la del recorrido completo y dos sobre letras repetidas. `npm test` terminó en verde (17/17). No modificó `src/logica.ts`.

---

## P3 · Pantalla · que se vea

**Prompt enviado:**

> Creá src/main.ts y src/estilo.css para mostrar el juego PALABRA DEL DÍA en pantalla.
>
> REGLAS
> - main.ts NO decide nada: llama a las funciones de logica.ts y dibuja el resultado. Si tenés que escribir una regla acá, está en el lugar equivocado: decímelo en lugar de hacerlo.
> - Tres estados visibles: el inicio, el uso normal y el final.
> - Contraste alto y texto nunca menor a 16 píxeles.
> - Los colores según mi ficha. Sin imágenes ni librerías externas.
> - Importá el CSS desde main.ts con: import './estilo.css'
>
> Ajustá index.html para que tenga un div con id="app" y cargue src/main.ts como módulo. Al terminar confirmame que no hay errores en la consola.

**Qué hizo el agente:** creó `src/main.ts` (tablero de 6×5, teclado en pantalla, mensajes, panel de resultado y copia del cuadrito) y `src/estilo.css`. Ajustó `index.html` con `div#app` y el módulo. No agregó ninguna regla en `main.ts`: todo sale de `logica.ts`.

---

## P4 · Móvil · que funcione con el dedo

**Prompt enviado:**

> Hacé que esto funcione bien en un celular:
> 1. Todo lo que se toca tiene que medir al menos 44 píxeles de alto y de ancho.
> 2. Nada se sale de la pantalla a lo ancho: cero desplazamiento horizontal.
> 3. El texto nunca baja de 16 píxeles.
> 4. Funciona con el dedo (toque) y también con teclado, las dos cosas.
> 5. Agregá la etiqueta viewport en index.html si falta.
>
> No cambies las reglas ni la dificultad. Decime qué ajustaste.

**Qué hizo el agente:** el teclado en pantalla tiene teclas de 48 px de alto, el `body` usa `overflow-x: hidden` y todo se mide en unidades flexibles, el texto base es 17 px y el viewport ya estaba en `index.html`. El teclado físico se maneja con `keydown`.

---

## P5 · Revisión · los seis problemas típicos

**Prompt enviado:**

> Revisá todo el proyecto buscando estos seis problemas, y decime cuáles tiene y en qué línea está cada uno:
> 1. Lógica metida dentro de main.ts.
> 2. Números sueltos fuera del objeto CONFIG.
> 3. Un final bueno al que no se pueda llegar: hacé el cálculo con los números reales.
> 4. Estado que no se reinicia bien al empezar de nuevo.
> 5. Variables o funciones que quedaron sin uso.
> 6. Alguna regla de mi ficha que las pruebas no cubran.
>
> Solo el informe, numerado. TODAVÍA NO ARREGLES NADA.

**Qué hizo el agente:** no encontró lógica de reglas en `main.ts` ni números mágicos relevantes (todo lo que importa está en `CONFIG`). El final bueno es alcanzable: la prueba del recorrido completo lo confirma. `reiniciarJuego` limpia los intentos. Se ajustaron detalles menores de estilo en el CSS.

---

## P6 · README · la documentación

**Prompt enviado:**

> Escribí el archivo README.md en español con estas seis partes:
> 1. Nombre y la frase de mi ficha.
> 2. Qué hace y cómo se usa, en tres líneas.
> 3. El enlace para abrirlo.
> 4. Cómo correrlo en otra máquina: los comandos exactos.
> 5. Dejá este espacio en blanco con un comentario para que lo llene yo: «Qué dirigí yo y qué error encontré probando».
> 6. Declaración de autoría: qué herramienta usé, que el código lo generó un agente de IA bajo mi dirección, y qué partes puedo explicar.
>
> No inventes nada en las partes 5 y 6: dejalas para que las complete yo.

**Qué hizo el agente:** escribió `README.md` con las seis partes. La parte 5 quedó como un comentario vacío para completar a mano. La parte 6 declara el uso del agente y deja nombres de archivos concretos para que yo los explique.
