# Escuadrón Cacerola — edición ueno

Parodia política para navegador, en PC y celular. Se trabaron los ahorros de medio país con la caída de ueno bank. Salís a la calle con una marcha de vecinos, sumás gente en las puertas y espantás a los clones del caso.

> **Es una parodia**, sin relación con ueno bank ni con las personas caricaturizadas. Los personajes son caricaturas hechas para el humor. Las causas judiciales del caso ueno siguen abiertas: hay personas con prisión preventiva, que es una medida cautelar y no una condena, y nadie fue condenado. Ningún chiste afirma que alguien haya cometido un delito.
>
> Si alguien te escribe prometiendo devolverte la plata por un link, es estafa. El BCP no manda links por WhatsApp. Consultá solo sus canales oficiales.

## Cómo se juega

- Deslizá el dedo, mové el mouse o usá las flechas para mover la marcha. Los volantes salen solos.
- Pasá por la puerta azul. Las rojas son el **corralito** (dividen) y la **comisión** (resta). Si le tirás volantes a una puerta de suma o resta, el número sube.
- Destrabá los **cajeros "fuera de servicio"** a volantazos. Te dan vecinos, más ritmo o más presión.
- Agarrá los regalos (paquetes rosados): paraguas, cacerolazo general, paro general, prensa en vivo, indignación o vecinos.
- **Ojo con los reintegros falsos.** Aparecen al lado de un regalo verdadero: un cupón verde "uen0+ REINTERGO 50 %" o un WhatsApp con un link trucho. Tienen una palabra mal escrita y titilan. Si los agarrás, se va el 20 % de la marcha. El paraguas te protege.
- Al final de cada nivel aparece un jefe. Cuando se le termina el aguante, levanta su cartel y se va:
  1. La Sucursal de ueno: **La App Caída de ueno** ("servicio no disponible")
  2. El Palacio de López: **Santi Peña, el Ex Accionista** ("¡Vamos a estar mejor!")
  3. El Quincho: **Horacio Cartes, el Patrón** (le soltó la mano)
  4. El Banco Central: **Carlos Carvallo, el Banquero Giratorio**
  5. La Bóveda del Grupo: **Miguel Vázquez, el Dueño**
- Después de cada nivel elegís 1 de 3 tarjetas: una mejora que dura toda la partida o un arma nueva. El megáfono sale desde el nivel 1 y el cacerolazo desde el 3. El arma se cambia en la pausa.

Los enemigos son clones de Santi (de traje con la banda, al teléfono pidiendo calma, o con la albirroja y el pulgar arriba) y directivos del Grupo con su credencial verde. Nadie se lastima: se espantan y se van corriendo, gritando frases como "¡Vamos a estar mejor!" o "¡Calma y prudencia!".

## Lo que pasa a los costados

Mientras marchás, en las veredas van pasando maquetas con muñecos que cuentan en chiste cómo siguió la historia. Cada una se apoya en un hecho publicado por la prensa en noviembre de 2026:

| Escena | El hecho |
|---|---|
| **Ex-Tacumbú**: el "directorio en sesión permanente" tras las rejas | Un juez dictó prisión preventiva a seis exdirectivos; cinco fueron llevados al Centro Nacional de Prevenidos, la ex-Tacumbú ([Última Hora](https://www.ultimahora.com/juez-ordena-prision-para-seis-directivos-de-ueno-imputados-y-arresto-domiciliario-para-otros-dos), [ABC](https://www.abc.com.py/policiales/2026/11/06/autorizaron-ingreso-de-exdirectivos-de-ueno-al-centro-nacional-de-prevenidos-ex-tacumbu/)) |
| **Viñas Cué**: "tip de ahorro: acá no se paga alquiler", y el gimnasio clausurado | El expresidente, destituido por juicio político, cumple prisión preventiva en la cárcel militar de Viñas Cué; lo trasladaron después de que se conocieran privilegios en su primer lugar de reclusión ([ABC](https://www.abc.com.py/nacionales/2026/11/19/santiago-pena-en-prision-juez-sigue-esperando-protocolo-de-seguridad-en-vinas-cue/), [La Nación](https://www.lanacion.com.ar/el-mundo/el-escandalo-por-los-privilegios-de-santiago-pena-en-prision-fuerza-su-traslado-a-otra-carcel-nid16112026/)) |
| **Incautados**: el yate "Zeus" y la avioneta con cepo | La Fiscalía incautó un yate, dos avionetas y autos de lujo ([ABC](https://www.abc.com.py/economia/2026/11/06/ueno-bank-incautan-yate-de-lujo-y-avioneta-de-miguel-vazquez/)) |
| **Le soltó la mano**: el Patrón despide con el pañuelo al que se va en globo | Cartes anunció que su partido acompañaría el juicio político ([Infobae](https://www.infobae.com/america/america-latina/2026/11/05/escandalo-del-ueno-bank-el-expresidente-horacio-cartes-dijo-que-su-partido-apoyara-el-juicio-politico-a-santiago-pena/)) |
| **Pago a ahorristas**: la fila, con sillón y tereré | El BCP devolvió los ahorros con el Fondo de Garantía de Depósitos, en bancos asignados ([La Nación](https://www.lanacion.com.py/negocios/2026/11/05/estos-son-los-bancos-y-cronograma-de-pagos-para-ahorristas-de-ueno-bank/)) |
| **Fiscalía**: la pila de carpetas y el que dice "¡me entrego!" | Hay unos 27 imputados y uno de ellos se presentó solo ([ABC](https://www.abc.com.py/nacionales/2026/11/12/caso-ueno-el-considerado-segundo-de-miguel-vazquez-se-entrego-a-la-fiscalia/)) |
| **En vivo**: "fue un delirio colectivo" | La frase es de un exdirectivo ([ABC](https://www.abc.com.py/policiales/2026/11/20/desde-octubre-del-2025-se-sabia-del-problema-de-liquidez-de-ueno-bank-revelan/)) |
| **Reintegros truchos**: el que "pesca" con caña | Aviso de verdad: el BCP no manda links |

El corralito de chanchitos alcancía y la chipera que solo acepta efectivo son chistes sueltos.

Las escenas están en `js/escenas.js`. Los directivos que aparecen ahí son muñecos genéricos, sin nombre. Si la situación judicial cambia, hay que revisar estos carteles.

## Cómo está hecho

Es una versión del [Escuadrón Antiplaga](https://github.com/doldan-edison/escuadron-antiplaga), con las mismas reglas y el mismo equilibrio, pero dibujada en 3D con [three.js](https://threejs.org) r170. La biblioteca va incluida en `lib/` (licencia MIT, en `lib/three.LICENSE.txt`), así que el juego no depende de ningún servidor ajeno para dibujar.

| Archivo | Qué tiene |
|---|---|
| `index.html` | La página, los menús y los estilos |
| `js/juego.js` | Las reglas, los niveles, el sonido y los controles. No dibuja nada |
| `js/render3d.js` | El dibujo de la partida: marcha, clones, puertas, cajeros, regalos, portal y jefes |
| `js/figuras.js` | Los muñecos: cómo son, cómo se mueven y qué llevan en la mano |
| `js/escenario.js` | La calle, los edificios, el decorado y el edificio del final de cada nivel |
| `js/escenas.js` | Las escenas de los costados |
| `js/motor3d.js` | La cámara y el dibujo por lotes sobre three.js |
| `js/dibujo2d.js` | Utilidades para pintar los carteles |

Todos los muñecos están armados por código con piezas simples (esferas, cápsulas y cajas) y se animan moviendo esas piezas: caminan, golpean la cacerola, saludan, salen corriendo. No hay modelos ni archivos de animación.

Todo lo que lleva letras se pinta por código con los colores de ueno: la app caída, los cupones falsos, los cajeros, los carteles y los globos de lo que dice cada jefe. No se usó ninguna foto de las personas ni el logo de ueno.

Las imágenes de `arte/` son caricaturas tipo juguete generadas con IA en Google Flow y recortadas con `herramientas/recortar.mjs` (necesita Node y ffmpeg). Hoy el juego usa las de los jefes, como retrato cuando aparecen (`BOSS.x.img` en `js/juego.js`). Las demás quedaron de la versión anterior, que era en 2D.

La dificultad de cada nivel se ajusta en la tabla `LV` de `js/juego.js`.

Para medirla sin jugar, escribí en la consola del navegador `__antSim(nivel, mejoras, acierto, n, torpeza)`. Corre una partida con piloto automático, y el piloto esquiva los reintegros falsos.

Para probarlo en la PC hace falta Node (el servidor simple de Python no sirve: entrega mal los módulos de JavaScript):

```bash
node herramientas/servidor.mjs 8378
```
