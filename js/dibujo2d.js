/* Utilidades de dibujo 2D: se usan para pintar las texturas (carteles, pantallas, cupones) y los textos de encima. */
export const TAU=Math.PI*2;
export const DISPLAY="'Titan One','Arial Black',system-ui,sans-serif";
export const TINTA='#141a33';
/* estilo "ueno" (parodia): verde menta, letras redondas blancas. No se usa su logo. */
export const UV='#2BD98E',UV2='#1DBF79',UV3='#146542',UCL='#D6FCEC',UNG='#252529';

export function ell(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
export function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
export function poly(c,p){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();}
export function line(c,p,w,col){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.stroke();}
export function txt(c,s,x,y,size,col,w){c.font=Math.max(5,size|0)+'px '+DISPLAY;c.textAlign='center';c.textBaseline='middle';c.fillStyle=col;if(w)c.fillText(s,x,y,w);else c.fillText(s,x,y);}
export function uTxt(c,s,x,y,size,col,al,w){c.font='800 '+Math.max(5,size|0)+'px Nunito,system-ui,sans-serif';c.textAlign=al||'center';c.textBaseline='middle';c.fillStyle=col;if(w)c.fillText(s,x,y,w);else c.fillText(s,x,y);}
export function uFondo(c,x,y,w,h){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#2fdc93');g.addColorStop(1,'#19b874');return g;}
/* monedita de guaraní con el borde azul, como las de sus avisos */
export function uMoneda(c,x,y,r){c.fillStyle=UV;c.strokeStyle='#1d3fb8';c.lineWidth=Math.max(1,r*.16);c.beginPath();c.ellipse(x,y,r,r*.82,-.3,0,TAU);c.fill();c.stroke();uTxt(c,'₲',x,y+r*.06,r*1.2,'#ffffff');}
/* texto con borde grueso (para números y gritos) */
export function label(c,s,x,y,size,fill,stroke){c.font=Math.max(8,size|0)+'px '+DISPLAY;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=Math.max(2,size*.2);c.strokeStyle=stroke;c.strokeText(s,x,y);c.fillStyle=fill;c.fillText(s,x,y);}

/* Cartel de varias líneas: L = [[texto, tamaño (fracción del alto), color, 'u' si va con la letra redonda], ...]
   o = {fondo, borde, radio, palo} */
export function pintaCartel(L,o){
  o=o||{};
  return(c,w,h)=>{
    const m=Math.round(h*.04),r=o.radio==null?h*.1:o.radio*h;
    if(o.fondo!=='nada'){
      c.fillStyle=o.fondo==='ueno'?uFondo(c,0,0,w,h):(o.fondo||'#ffffff');rr(c,m,m,w-2*m,h-2*m,r);c.fill();
      if(o.borde!=='nada'){c.strokeStyle=o.borde||TINTA;c.lineWidth=m*1.4;rr(c,m,m,w-2*m,h-2*m,r);c.stroke();}
    }
    let tot=0;for(const l of L)tot+=l[1];
    let y=h*.5-h*tot*.56+(o.dy||0)*h;
    for(const l of L){
      const fs=l[1]*h;y+=fs*.56;
      if(l[3]==='u')uTxt(c,l[0],w/2,y,fs,l[2]||TINTA,'center',w-m*6);else txt(c,l[0],w/2,y+fs*.04,fs,l[2]||TINTA,w-m*6);
      y+=fs*.56;
    }
  };
}
