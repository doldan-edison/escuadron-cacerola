# Escuadrón Cacerola — edición ueno

Parodia política para navegador, en PC y celular. Se trabaron los ahorros de medio país con la caída de ueno bank. Salís a la calle con una marcha de vecinos, sumás gente en las puertas y espantás a los clones del caso.

> **Es una parodia**, sin relación con ueno bank ni con las personas caricaturizadas. Los personajes son caricaturas hechas para el humor. Las causas judiciales del caso ueno siguen abiertas y nadie fue condenado. Ningún chiste afirma que alguien haya cometido un delito.
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

## Cómo está hecho

Es una versión del [Escuadrón Antiplaga](https://github.com/doldan-edison/escuadron-antiplaga), con el mismo motor y el mismo equilibrio. Todo está en `index.html`: canvas 2D, sin dependencias.

Los personajes, la calle, los cajeros y los carteles se dibujan por código. Si se agrega una imagen en `arte/`, la reemplaza:

| Qué | Dónde se pone la imagen |
|---|---|
| Clones | `ANT[i].img` |
| Manifestantes | `MAN[i].src` |
| Jefes | `BOSS.x.img` |
| Decorado | `DEC[i].src` |
| Cajero | `CAJA.src` |

La dificultad de cada nivel se ajusta en la tabla `LV`.

Para medirla sin jugar, escribí en la consola del navegador `__antSim(nivel, mejoras, acierto, n, torpeza)`. Corre una partida con piloto automático, y el piloto esquiva los reintegros falsos.

Para probarlo en la PC:

```bash
python -m http.server 8378
```
