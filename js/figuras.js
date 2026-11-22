/* Muñecos de juguete armados con piezas (cápsulas, esferas, cajas): cabezones, mirando hacia +z local (a la cámara).
   Con escala 1 miden ~1,05 de alto y apoyan los pies en y=0. Todo se anima moviendo las piezas, sin imágenes. */
import {B,U,T,C,BLANCO,emit,emitR,emitA,pon,fset,fchild,fesc,fpt,fcopia,marco,loteTx,TAU} from './motor3d.js';
import {rr,ell,poly,txt,uTxt,uFondo,pintaCartel,TINTA as TINTA2,UV,UV2,UV3,UCL,UNG} from './dibujo2d.js';

const fR=marco(),fB=marco(),fH=marco(),fL=marco(),fA=[marco(),marco()],fM=marco(),fX=marco(),fP=marco(),v3=[0,0,0];
const BL=BLANCO,TINTA=C('#141a33'),NEG=C('#0e0f12'),ROJO=C('#d52b1e'),AZUL=C('#0038a8'),VERDE=C('#1DBF79'),ORO=C('#ffcf33'),GRIS=C('#c9ced6'),GRISO=C('#4a505a'),
  MADERA=C('#9a6a3a'),CUERO=C('#3a2a1e'),PIEL2=C('#c98e62'),BOCA=C('#5a1e14'),OSC=C('#20232b');
const P0=[0,0],P1=[0,0];
export const TXF={};   // texturas que llevan los muñecos (carteles, pantalla de la app, foto rota…)

/* ---------- cómo son ---------- */
/* st: traje, pant, zap, piel, pelo, peinado (cola, rodete, largo, calvo), canas, gorra, kepi, casco, sombrero, corb, banda (presidencial),
   albi (albirroja), chaleco (inflable), franja, gafete, lentes (true, 'osc'), barba, boca (sonrisa, seria, nervioso), gordo, corta (manga corta), lleva */
const SANTI={traje:'#1f2a44',corb:'#4a68b0',pelo:'#37373d',canas:'#7c7c84',pant:'#1a2238'};
export const SOLD=[
  {albi:1,traje:'#f4f4f4',corta:1,pant:'#2f4f86',pelo:'#2a1d14',piel:'#e0a878',zap:'#f4f4f4',lleva:'cacerola'},
  {traje:'#f4f4f4',franja:'#0038a8',corta:1,pant:'#3a3f4a',pelo:'#5a3a22',peinado:'cola',zap:'#f4f4f4',lleva:'cartel',tx:0},
  {traje:'#d52b1e',corta:1,pant:'#2a2d36',pelo:'#141414',piel:'#c98e62',zap:'#e9edf2',lleva:'cacerola'},
  {traje:'#7fc4f5',pant:'#4a4038',pelo:'#9a9aa0',peinado:'rodete',lleva:'cacerola'},
  {traje:'#ffcf33',corta:1,pant:'#2f4f86',pelo:'#2a1d14',gorra:'#d52b1e',piel:'#e0a878',lleva:'bandera'},
  {albi:1,traje:'#f4f4f4',corta:1,pant:'#23262e',pelo:'#5a3a22',peinado:'largo',zap:'#f4f4f4',lleva:'cacerola'},
  {traje:'#2f8a5a',pant:'#3a3f4a',pelo:'#141414',piel:'#8d5a3b',lleva:'hincha'},
  {traje:'#f4f4f4',franja:'#d52b1e',corta:1,pant:'#2f4f86',pelo:'#c9a15a',peinado:'cola',lleva:'megafono'},
  {traje:'#8a6bd8',corta:1,pant:'#23262e',pelo:'#2a1d14',piel:'#e0a878',lleva:'cartel',tx:1},
  {albi:1,traje:'#f4f4f4',corta:1,pant:'#3a3f4a',pelo:'#141414',gorra:'#0038a8',zap:'#f4f4f4',lleva:'cacerola'},
  {traje:'#ff9a5a',pant:'#2f4f86',pelo:'#5a3a22',peinado:'rodete',piel:'#c98e62',lleva:'cartel',tx:2},
  {traje:'#e9edf2',franja:'#1DBF79',corta:1,pant:'#23262e',pelo:'#2a1d14',piel:'#8d5a3b',lleva:'cacerola'},
  {traje:'#2a9df4',corta:1,pant:'#3a3f4a',pelo:'#c9a15a',peinado:'largo',lleva:'cartel',tx:3}
];
/* enemigos, en el mismo orden que la tabla ANT del juego. sc = tamaño del muñeco. */
export const ENE=[
  {st:{...SANTI,banda:1,lleva:'saluda'},sc:1.15},
  {st:{...SANTI,banda:1,boca:'nervioso',lleva:'calma'},sc:1.08},
  {st:{traje:'#2b2f36',corb:'#1DBF79',pelo:'#141414',gordo:1,gafete:1,lleva:'maletin'},sc:1.7},
  {st:{...SANTI,albi:1,traje:'#f4f4f4',corb:null,corta:1,pant:'#3b5f9e',zap:'#f4f4f4',sponsor:1,boca:'sonrisa',lleva:'hincha'},sc:1.1},
  {st:{traje:'#3a4a5c',corb:'#1DBF79',pelo:'#5a3a22',gafete:1,lleva:'vocero'},sc:1.3},
  {st:{traje:'#2b2f36',corb:'#1DBF79',pelo:'#6a6a70',gordo:1,gafete:1,boca:'seria',lleva:'escudo'},sc:1.95},
  {st:{traje:'#15181f',corb:'#1DBF79',pelo:'#1a1a1a',gordo:1,gafete:1,lentes:'osc',boca:'seria',lleva:'maletin'},sc:2.8}
];
const JEFES={
  pena:{...SANTI,banda:1,boca:'sonrisa',lleva:'saluda'},
  cartes:{traje:'#f4f4f4',chaleco:'#7a1f2b',pelo:'#4d4d52',canas:'#8a8a90',gordo:1,boca:'seria',pant:'#2a2d36',lleva:'foto'},
  carvallo:{traje:'#2a3550',corb:'#2a6fd1',pelo:'#8f959d',barba:'#b9bec5',ceja:'#6a6f77',lentes:1,pant:'#232c44'},
  vazquez:{traje:'#1d2230',corb:'#1DBF79',pelo:'#2a2420',gordo:1,gafete:1,boca:'nervioso',lleva:'maletin'}
};
export const SANTI3D=SANTI;

/* ---------- ropa ---------- */
function vestir(st,w,h,d,go,lod){
  const zf=d/2;
  if(st.albi){for(let i=-1;i<=1;i++)emit(B.box,fB,i*.115*go,h/2,0,.05*go,h*.9,d+.014,ROJO);if(st.sponsor&&TXF.sponsor)emit(TXF.sponsor,fB,0,h*.55,zf+.014,.2,.075,1,BL);}
  else if(st.chaleco){emit(B.rbox,fB,0,h*.47,0,w*1.07,h*.9,d*1.14,C(st.chaleco));emit(B.box,fB,0,h/2,zf+.012,.1,h*.86,.03,BL);}
  else if(st.franja)emit(B.box,fB,0,h*.56,0,w+.014,.06,d+.014,C(st.franja));
  else if(st.corb){emit(B.box,fB,0,h*.7,zf,.12*go,.2,.018,BL);emit(B.box,fB,0,h*.67,zf+.008,.05,.18,.02,C(st.corb));}
  if(st.banda){
    // banda presidencial: tres franjas en diagonal, del hombro derecho a la cadera izquierda
    fchild(fX,fB,0,h*.53,zf+.018,0,0,-.78);
    for(let i=-1;i<=1;i++)emit(B.box,fX,0,i*.036,0,.44*go,.036,.02,i>0?ROJO:i?AZUL:BL);
    if(lod<1)emit(B.sph,fB,.13*go,h*.14,zf+.03,.07,.07,.03,ORO);
  }
  if(st.gafete){emit(B.box,fB,.1*go,h*.36,zf+.016,.09,.11,.016,BL);emit(B.box,fB,.1*go,h*.47,zf+.018,.09,.035,.018,VERDE);}
  if(st.delantal)emit(B.box,fB,0,h*.3,zf+.012,w*.7,h*.6,.02,C(st.delantal));
}
function cabeza(st,R,lod,t,piel){
  const pe=st.pelo?C(st.pelo):null,P=st.peinado;
  if(pe){
    if(P==='calvo'){for(let k=-1;k<=1;k+=2)emit(B.sph,fH,k*R*.84,R*.05,-R*.25,R*.5,R*.8,R*1.15,pe);}
    else{
      emitR(B.hemi,fH,0,R*.05,-R*.05,-.32,0,0,R*2.12,R*2.1,R*2.12,pe);
      if(P==='cola')emitR(B.cap,fH,0,-R*.25,-R*1.12,.35,0,0,R*.5,R*1.3,R*.5,pe);
      else if(P==='rodete')emit(B.sph,fH,0,R*1.0,-R*.3,R*.85,R*.75,R*.85,pe);
      else if(P==='largo')emit(B.sph,fH,0,-R*.4,-R*.38,R*2.1,R*1.9,R*1.5,pe);
    }
  }
  if(st.gorra){const g=C(st.gorra);emitR(B.hemi,fH,0,R*.22,0,-.12,0,0,R*2.18,R*1.9,R*2.18,g);emit(B.box,fH,0,R*.3,R*1.05,R*1.25,R*.1,R*.8,g);}
  if(st.kepi){emit(B.cyl,fH,0,R*.98,0,R*1.75,R*.6,R*1.75,C(st.kepi));emit(B.box,fH,0,R*.74,R*.9,R*1.3,R*.08,R*.75,TINTA);}
  if(st.casco)emitR(B.hemi,fH,0,R*.12,0,-.1,0,0,R*2.3,R*2.2,R*2.3,C(st.casco));
  if(st.sombrero){const g=C(st.sombrero);emit(B.cyl,fH,0,R*.72,0,R*3,R*.08,R*3,g);emit(B.cyl,fH,0,R*1.0,0,R*1.7,R*.6,R*1.7,g);}
  if(lod>1)return;
  if(st.canas&&pe)for(let k=-1;k<=1;k+=2)emit(B.sph,fH,k*R*.93,-R*.05,-R*.1,R*.3,R*.6,R*.85,C(st.canas));
  const ner=st.boca==='nervioso'?Math.sin(t*7)*R*.06:0;
  if(st.lentes==='osc'){for(let k=-1;k<=1;k+=2)emit(B.sph,fH,k*R*.4,R*.12,R*.84,R*.72,R*.5,R*.36,NEG);emit(B.box,fH,0,R*.16,R*.93,R*.4,R*.09,R*.1,NEG);}
  else{
    if(!lod)for(let k=-1;k<=1;k+=2)emit(B.sph,fH,k*R*.38,R*.12,R*.78,R*.46,R*.54,R*.36,BL);
    for(let k=-1;k<=1;k+=2)emit(B.sph,fH,k*R*.38+ner,R*.1,R*(lod?.9:.93),R*.2,R*.27,R*.16,TINTA);
    if(st.lentes&&!lod){for(let k=-1;k<=1;k+=2)emit(B.tor,fH,k*R*.4,R*.12,R*1.0,R*.66,R*.6,R*.5,NEG);emit(B.box,fH,0,R*.14,R*1.02,R*.16,R*.06,R*.06,NEG);}
  }
  if(lod)return;
  const cj=C(st.ceja||st.pelo||'#37373d'),ce=st.boca==='seria'?.25:st.boca==='nervioso'?-.3:-.08;
  for(let k=-1;k<=1;k+=2){emitR(B.box,fH,k*R*.4,R*.46,R*.84,0,0,k*ce,R*.36,R*.08,R*.1,cj);emit(B.sph,fH,k*R*.97,R*.02,0,R*.3,R*.42,R*.3,piel);}
  emit(B.sph,fH,0,-R*.08,R*.97,R*.22,R*.2,R*.2,PIEL2);
  const zb=R*(st.barba?.99:.9),yb=-R*.42;
  if(st.barba)emitR(B.hemi,fH,0,-R*.1,R*.02,Math.PI+.16,0,0,R*2.1,R*1.96,R*2.06,C(st.barba));
  if(st.boca==='sonrisa'){emit(B.box,fH,0,yb-R*.03,zb,R*.36,R*.08,R*.1,BOCA);for(let k=-1;k<=1;k+=2)emitR(B.box,fH,k*R*.25,yb+R*.03,zb-R*.02,0,0,k*.6,R*.2,R*.08,R*.1,BOCA);}
  else if(st.boca==='nervioso'){for(let i=-1;i<=1;i++)emitR(B.box,fH,i*R*.2,yb,zb,0,0,i?.5:-.5,R*.24,R*.06,R*.1,BOCA);}
  else if(st.boca==='seria')emit(B.box,fH,0,yb,zb,R*.44,R*.06,R*.1,BOCA);
  else emit(B.box,fH,0,yb,zb,R*.36,R*.09,R*.1,BOCA);
}

/* ---------- brazos según lo que lleva o hace. Devuelve qué brazos fijó: 1 el de -x, 2 el de +x ---------- */
/* cada brazo = [giro adelante/atrás, giro hacia afuera]. Colgando es [0,0]; adelante es negativo; hacia afuera el signo es el del lado. */
function manos(L,t,ph){
  switch(L){
    case'cacerola':P0[0]=-1.7;P0[1]=.2;P1[0]=-1.45+Math.sin(t*13+ph)*.42;P1[1]=-.45;return 3;
    case'cartel':{const b=Math.sin(t*5+ph)*.06;P0[0]=-2.9+b;P0[1]=.12;P1[0]=-2.9-b;P1[1]=-.12;return 3;}
    case'bandera':P1[0]=-2.5;P1[1]=.2;return 2;
    case'megafono':P1[0]=-2.2;P1[1]=-.5;return 2;
    case'saluda':P1[0]=0;P1[1]=2.5+Math.sin(t*9+ph)*.35;return 2;
    case'calma':P0[0]=-1.35+Math.sin(t*7)*.22;P0[1]=.15;P1[0]=-2.5;P1[1]=-.55;return 3;
    case'maletin':P1[0]=0;P1[1]=.14;return 2;
    case'hincha':{const q=Math.sin(t*10+ph)*.3;P0[0]=0;P0[1]=-2.6+q;P1[0]=0;P1[1]=2.6-q;return 3;}
    case'vocero':case'escudo':case'foto':case'carpetas':case'billetera':P0[0]=-1.05;P0[1]=.32;P1[0]=-1.05;P1[1]=-.32;return 3;
    case'barrotes':P0[0]=-1.35;P0[1]=.1;P1[0]=-1.35;P1[1]=-.1;return 3;
    case'sacude':{const q=Math.sin(t*9)*.12;P0[0]=-1.35+q;P0[1]=.1;P1[0]=-1.35+q;P1[1]=-.1;return 3;}
    case'jarro':P0[0]=-1.35;P0[1]=.1;P1[0]=-1.3;P1[1]=Math.sin(t*3.2)*.55-.1;return 3;
    case'arriba':case'globos':P0[0]=0;P0[1]=-2.8;P1[0]=0;P1[1]=2.8;return 3;
    case'panuelo':P1[0]=0;P1[1]=2.4+Math.sin(t*8)*.4;return 2;
    case'mic':P1[0]=-1.6;P1[1]=-.25;return 2;
    case'camara':P0[0]=-2.2;P0[1]=.5;P1[0]=-2.2;P1[1]=-.5;return 3;
    case'sello':P1[0]=-.9-Math.abs(Math.sin(t*4))*.7;P1[1]=-.1;return 2;
    case'terere':P1[0]=-1.1-Math.max(0,Math.sin(t*1.4))*1.1;P1[1]=-.3;return 2;
    case'llaves':P1[0]=-.5;P1[1]=.3;return 2;
    case'canasto':P1[0]=0;P1[1]=2.85;return 2;
    case'cania':P0[0]=-1.3;P0[1]=.25;P1[0]=-1.5;P1[1]=-.25;return 3;
    case'venia':P1[0]=-2.6;P1[1]=-.75;return 2;
    case'billetes':P1[0]=0;P1[1]=2.6+Math.sin(t*10)*.2;return 2;
    case'enoja':P0[0]=-1.2+Math.sin(t*8)*.5;P0[1]=.2;P1[0]=-1.2-Math.sin(t*8)*.5;P1[1]=-.2;return 3;
  }
  return 0;
}
/* marco derecho (sin la inclinación del brazo) apoyado en la mano k */
function enMano(k){fpt(fA[k],0,-.3,0,v3);fcopia(fM,fB);fM[9]=v3[0];fM[10]=v3[1];fM[11]=v3[2];return fM;}
function llevar(st,L,t,w,h,d,R,lod){
  const zf=d/2;
  switch(L){
    case'cacerola':
      enMano(0);emit(B.cyl,fM,0,.03,0,.27,.13,.27,GRIS);emit(B.box,fM,-.18,.05,0,.14,.03,.045,GRISO);
      emit(B.box,fA[1],0,-.4,0,.035,.24,.035,MADERA);break;
    case'cartel':{
      const y=1.0+Math.sin(t*5)*.015,tx=TXF.cartel[st.tx||0];
      emit(B.box,fB,0,.7,0,.035,.32,.035,MADERA);emit(B.box,fB,0,y,0,.7,.38,.03,BL);
      emit(tx,fB,0,y,.018,.66,.34,1,BL);emitR(tx,fB,0,y,-.018,0,Math.PI,0,.66,.34,1,BL);break;}
    case'bandera':
      enMano(1);emit(B.cyl,fM,0,.38,0,.03,1.05,.03,GRIS);
      for(let j=0;j<4;j++){const z=Math.sin(t*7-j*1.1)*.02*(j+1);for(let i=0;i<3;i++)emit(B.box,fM,.07+.105*j,.84-.075*i,z,.11,.076,.012,i?i>1?AZUL:BL:ROJO);}
      break;
    case'megafono':emitR(B.cone,fH,R*.55,-R*.3,R*1.5,-Math.PI/2,0,0,.22,.3,.22,BL);emit(B.cyl,fH,R*.55,-R*.3,R*.95,.08,.08,.08,ROJO);break;
    case'calma':emit(B.box,fH,R*1.02,0,R*.15,.03,.15,.08,OSC);break;
    case'maletin':enMano(1);emit(B.rbox,fM,.02,-.13,0,.09,.22,.32,CUERO);emit(B.box,fM,.02,0,0,.03,.05,.12,NEG);if(lod<2)emit(B.box,fM,.07,-.13,0,.012,.1,.1,VERDE);break;
    case'vocero':emit(B.box,fB,0,.2,zf+.26,.6,.32,.03,BL);emit(TXF.solido,fB,0,.2,zf+.278,.56,.28,1,BL);break;
    case'escudo':emit(B.rbox,fB,0,.16,zf+.24,.56,.66,.07,BL);emit(B.rbox,fB,0,.16,zf+.262,.5,.6,.06,VERDE);emit(TXF.directorio,fB,0,.18,zf+.3,.44,.26,1,BL);break;
    case'foto':{const q=.14+Math.sin(t*3)*.05;emitR(TXF.fotoA,fB,-.15,.2,zf+.28,0,0,q,.27,.3,1,BL);emitR(TXF.fotoB,fB,.15,.2,zf+.28,0,0,-q,.27,.3,1,BL);break;}
    case'jarro':emit(B.cyl,fA[1],0,-.36,0,.08,.1,.08,GRIS);break;
    case'panuelo':emitR(B.box,fA[1],0,-.4,0,0,0,Math.sin(t*16)*.5,.16,.18,.015,ROJO);break;
    case'mic':emit(B.cyl,fA[1],0,-.38,0,.035,.16,.035,NEG);emit(B.sph,fA[1],0,-.48,0,.08,.08,.08,GRISO);break;
    case'camara':emit(B.box,fH,R*1.15,R*.25,R*.5,.17,.17,.3,OSC);emitR(B.cyl,fH,R*1.15,R*.25,R*.5+.19,Math.PI/2,0,0,.11,.08,.11,GRISO);
      if(((t*3)|0)%2)emit(U.sph,fH,R*1.15,R*.75,R*.5+.1,.04,.04,.04,C('#ff3b30'));break;
    case'sello':emit(B.cyl,fA[1],0,-.36,0,.07,.1,.07,MADERA);break;
    case'terere':enMano(1);emit(B.cyl,fM,0,.02,0,.07,.1,.07,MADERA);emit(B.box,fM,0,.11,0,.012,.12,.012,GRIS);break;
    case'llaves':emit(B.tor,fA[1],0,-.38,0,.1,.1,.1,ORO);break;
    case'canasto':emit(B.cyl,fH,0,R*1.25,0,.44,.14,.44,C('#b8894a'));
      for(let i=0;i<5;i++)emitR(B.tor,fH,Math.cos(i*1.26)*.11,R*1.25+.09,Math.sin(i*1.26)*.11,Math.PI/2,0,0,.13,.13,.2,C('#f2c66a'));break;
    case'billetera':emit(B.box,fB,0,.2,zf+.27,.22,.13,.02,CUERO);break;
    case'carpetas':for(let i=0;i<5;i++)emit(B.box,fB,i%2?.012:-.012,.14+i*.035,zf+.2,.3,.03,.22,i%2?C('#e8c98a'):C('#9ec3e6'));break;
    case'cania':{
      // caña de pescar con un cupón de carnada: "phishing"
      fchild(fX,fB,0,.25,zf+.2,1.0+Math.sin(t*2)*.08,0,0);emit(B.cyl,fX,0,.5,0,.022,1.0,.022,MADERA);
      fpt(fX,0,1,0,v3);fcopia(fM,fB);fM[9]=v3[0];fM[10]=v3[1];fM[11]=v3[2];
      emit(U.box,fM,0,-.2,0,.008,.4,.008,BL);emitR(B.box,fM,0,-.45,0,0,t*2,0,.2,.12,.012,VERDE);emitR(B.box,fM,0,-.45,0,0,t*2,0,.14,.03,.016,BL);break;}
    case'globos':
      for(let i=-1;i<=1;i++){emit(B.sph,fB,i*.2,1.6+(i?0:.14),0,.27,.31,.27,i<0?ROJO:i?AZUL:BL);emit(B.box,fB,i*.13,1.07,0,.008,.8,.008,BL);}
      break;
    case'billetes':for(let i=0;i<3;i++)emitR(B.box,fA[1],0,-.4,0,0,0,(i-1)*.35,.07,.13,.008,C('#7bc96f'));break;
  }
}

/* ---------- el muñeco ---------- */
/* an: ph (fase del paso), amp (cuánto camina, 0-1), lean (inclinación adelante), roll, hop (salto, en unidades del mundo),
   a0/a1 (brazos a mano; si faltan se mueven según lo que lleva o se balancean), hx/hy (cabeza), sq (aplastado), sent (sentado), t (reloj)
   lod: 0 con toda la cara · 1 medio · 2 lejos */
export function persona(st,x,y,gz,yaw,sc,an,lod){
  const go=st.gordo?1.24:1,w=.38*go,h=.36,d=st.gordo?.34:.25,R=.215*(st.cab||1),t=an.t||0;
  const ph=an.ph||0,amp=an.amp||0,s=Math.sin(ph),bob=Math.abs(Math.cos(ph))*.035*amp,sent=an.sent?1:0;
  const piel=C(st.piel||'#f1c59a'),ropa=C(st.traje||'#f4f4f4'),manga=st.manga?C(st.manga):st.corta?piel:st.chaleco?BL:ropa;
  fset(fR,x,y+(an.hop||0)-sent*.19*sc,gz,yaw,sc);
  const pant=C(st.pant||'#23262e'),zap=lod<2?C(st.zap||'#0e0f12'):null;
  for(let k=-1;k<=1;k+=2){
    fchild(fL,fR,k*.1*go,.31,0,sent?-1.45:-k*s*.75*amp,0,sent?k*.14:0);
    emit(B.cap,fL,0,-.15,0,.15,.34,.15,pant);
    if(zap)emit(B.box,fL,0,-.3,.035,.13,.075,.21,zap);
  }
  fchild(fB,fR,0,.3+bob,0,an.lean||0,0,(an.roll||0)+s*.04*amp);
  const sq=an.sq||1;if(sq!==1){const q=1/Math.sqrt(sq);fesc(fB,q,sq,q);}
  emit(lod?B.rbox:B.rboxH,fB,0,h/2,0,w,h,d,ropa);
  if(lod<2)vestir(st,w,h,d,go,lod);
  fchild(fH,fB,0,h+R*.78,0,an.hx||0,an.hy||0,0);
  emit(lod?B.sph:B.sphH,fH,0,0,0,R*1.96,R*2,R*1.9,piel);
  cabeza(st,R,lod,t,piel);
  let m=0;if(!an.a0&&!an.a1&&st.lleva)m=manos(st.lleva,t,ph);
  for(let k=0;k<2;k++){
    const sg=k?1:-1,P=k?(an.a1||(m&2?P1:null)):(an.a0||(m&1?P0:null)),F=fA[k];
    fchild(F,fB,sg*(w/2+.03),h-.05,0,P?P[0]:sg*s*.6*amp,0,P?P[1]:sg*(st.gordo?.22:.1));
    emit(B.cap,F,0,-.13,0,.11,.3,.11,manga);
    if(lod<2)emit(B.sph,F,0,-.28,0,.115,.115,.115,piel);
  }
  if(st.lleva)llevar(st,st.lleva,t,w,h,d,R,lod);
}

/* ---------- jefes ---------- */
const AJ={ph:0,amp:0,lean:0,hop:0,roll:0,a0:null,a1:null,hx:0,hy:0,sq:1,sent:0,t:0},Q0=[0,0],Q1=[0,0];
/* La app de ueno, caída: un teléfono con patas. La pantalla es una textura; la ruedita de "cargando" son piezas sueltas. */
function telefono(x,gz,yaw,sc,an,t){
  const s=Math.sin(an.ph),amp=an.amp,bob=Math.abs(Math.cos(an.ph))*.03*amp;
  fset(fR,x,an.hop||0,gz,yaw,sc);
  for(let k=-1;k<=1;k+=2){fchild(fL,fR,k*.15,.3,0,-k*s*.7*amp,0,0);emit(B.cap,fL,0,-.15,0,.09,.32,.09,OSC);emit(B.box,fL,0,-.29,.04,.14,.07,.22,NEG);}
  fchild(fB,fR,0,.27+bob,0,an.lean||0,0,(an.roll||0)+s*.05*amp);
  emit(B.rboxH,fB,0,.53,0,.68,1.08,.13,C('#15171c'));
  emit(TXF.app,fB,0,.53,.068,.6,.985,1,BL);
  for(let i=0;i<8;i++){const a=t*6+i*TAU/8;emit(U.sph,fB,Math.cos(a)*.038,.115+Math.sin(a)*.038,.075,.016,.016,.016,C(i>4?'#ffffff':'#9fe8c6'));}
  for(let k=0;k<2;k++){
    const sg=k?1:-1,P=k?an.a1:an.a0;
    fchild(fA[k],fB,sg*.35,.62,0,P?P[0]:Math.sin(t*5+k)*.3,0,P?P[1]:sg*(.55+Math.sin(t*5+k*2)*.3));
    emit(B.cap,fA[k],0,-.15,0,.075,.32,.075,OSC);emit(B.sph,fA[k],0,-.31,0,.12,.12,.12,OSC);
  }
  emitR(TXF.alerta,fB,.3,1.12+Math.sin(t*4)*.02,.08,0,0,-.18,.3,.3,1,BL);
}
/* puerta giratoria de Carvallo: cuatro hojas de vidrio que dan vueltas alrededor suyo */
function puerta(x,gz,sc,t){
  fset(fP,x,0,gz,0,sc);
  emit(B.cyl,fP,0,.012,0,1.36,.024,1.36,C('#8a94a6'));
  emit(B.cyl,fP,0,1.34,0,1.4,.1,1.4,C('#2e3442'));
  for(let k=0;k<4;k++){fchild(fX,fP,0,0,0,0,t*1.8+k*Math.PI/2,0);emitA(T.box,fX,.36,.66,0,.62,1.24,.02,C('#bfe1ff'),.28);emit(B.box,fX,.67,.66,0,.03,1.27,.04,C('#6ea0d2'));}
  emit(TXF.puerta,fP,0,1.56,.3,1.3,.3,1,BL);
}
/* b = el jefe del juego (state, t, at, st). El tinte (golpe, furia) lo pone quien llama. */
export function jefe(key,b,x,gz,sc){
  const st=b.state,t=b.t,at=b.at||0,an=AJ;let yaw=0;
  an.t=t;an.a0=an.a1=null;an.hx=-.38;an.hy=Math.sin(t*1.3)*.15;an.sq=1+Math.sin(t*3)*.012;an.roll=0;an.hop=0;an.lean=0;
  if(st==='tele'){an.ph=0;an.amp=0;an.lean=-.22;Q0[0]=0;Q0[1]=-2.3;Q1[0]=0;Q1[1]=2.3;an.a0=Q0;an.a1=Q1;an.roll=Math.sin(t*60)*.02;an.hy=0;}
  else if(st==='dash'){an.ph=at*9;an.amp=1;an.lean=.45;Q0[0]=1.1;Q0[1]=-.3;Q1[0]=1.1;Q1[1]=.3;an.a0=Q0;an.a1=Q1;an.hy=0;}
  else if(st==='dead'){an.ph=t*14;an.amp=.6;yaw=b.st*7;an.hop=Math.abs(Math.sin(b.st*6))*.25*sc;Q0[0]=0;Q0[1]=-2.8;Q1[0]=0;Q1[1]=2.8;an.a0=Q0;an.a1=Q1;}
  else{an.ph=at*(st==='idle'?4.2:7);an.amp=st==='idle'?.55:1;an.lean=st==='back'?-.14:-.06;yaw=Math.sin(t*.9)*.12;}
  if(key==='app'){telefono(x,gz,yaw,sc*.86,an,t);return;}
  persona(JEFES[key],x,0,gz,yaw,sc,an,0);
  if(key==='carvallo')puerta(x,gz,sc,t);
  else if(key==='vazquez'){
    // transpira: gotas que caen al lado de la cabeza
    for(let i=0;i<4;i++){const q=(t*1.4+i/4)%1,sg=i%2?1:-1;pon(U.sph,x+sg*(.27+i*.02)*sc,(1.0-q*.34)*sc,gz,.045*sc,.07*sc,.045*sc,C('#8fd3ff'));}
  }
}

/* ---------- texturas de los muñecos ---------- */
export function crearFiguras(){
  const prot=[[['DEVOLVÉ',.36,'#141a33'],['MI PLATA',.36,'#d52b1e']],[['¿Y MI',.36,'#141a33'],['SALDO?',.4,'#d52b1e']],[['¡BASTA!',.5,'#d52b1e']],[['JUSTICIA',.4,'#0038a8'],['YA',.4,'#d52b1e']]];
  TXF.cartel=prot.map(L=>loteTx(256,128,pintaCartel(L,{borde:'#d52b1e',radio:.08}),{cap:32}));
  TXF.solido=loteTx(256,128,pintaCartel([['TODO',.38,UV3],['SÓLIDO',.38,UV3]],{borde:'nada',fondo:'nada'}),{cap:48});
  TXF.directorio=loteTx(256,150,pintaCartel([['DIRECTORIO',.3,'#ffffff','u'],['S.A.',.36,'#ffffff','u']],{fondo:'nada'}),{cap:24});
  TXF.sponsor=loteTx(128,48,(c,w,h)=>{c.fillStyle='#fff';rr(c,2,2,w-4,h-4,10);c.fill();uTxt(c,'ueno',w/2,h/2+2,h*.72,'#2a5bd7');},{cap:64});
  TXF.puerta=loteTx(416,96,(c,w,h)=>{c.fillStyle='#2e3442';rr(c,2,2,w-4,h-4,18);c.fill();uTxt(c,'ueno',w*.27,h/2+2,h*.62,UV);txt(c,'→ BCP',w*.68,h/2+3,h*.56,'#fff');},{cap:2});
  TXF.alerta=loteTx(128,128,(c,w,h)=>{c.lineJoin='round';c.fillStyle='#ffcf33';c.strokeStyle=TINTA2;c.lineWidth=9;poly(c,[w/2,12,w-10,h-14,10,h-14]);c.fill();c.stroke();txt(c,'!',w/2,h*.62,h*.56,TINTA2);},{cap:2});
  /* la foto rota de Cartes: de un lado el de la banda, del otro el del chaleco */
  const mitad=izq=>(c,w,h)=>{
    c.scale(w/52,h/44);c.fillStyle=izq?'#cfd6de':'#e6d9cf';c.fillRect(0,0,52,44);
    c.fillStyle=izq?'#1f2a44':'#7a1f2b';rr(c,12,24,28,24,8);c.fill();c.fillStyle='#f1c59a';ell(c,26,16,9,10);
    c.fillStyle=izq?'#37373d':'#4d4d52';c.beginPath();c.ellipse(26,10,10,6,0,Math.PI,TAU);c.fill();
    if(izq){c.fillStyle='#d52b1e';c.fillRect(12,28,28,4);c.fillStyle='#0038a8';c.fillRect(12,34,28,4);}
    c.strokeStyle='#ffffff';c.lineWidth=3;c.strokeRect(0,0,52,44);
    c.fillStyle='#ffffff';c.beginPath();const x=izq?52:0;c.moveTo(x,0);for(let i=0;i<=6;i++)c.lineTo(x+(izq?-1:1)*(i%2?5:1),i*44/6);c.lineTo(x,44);c.fill();
  };
  TXF.fotoA=loteTx(156,132,mitad(true),{cap:2,fijo:true});TXF.fotoB=loteTx(156,132,mitad(false),{cap:2,fijo:true});
  /* pantalla de la app: su inicio con la tarjeta de saldo, pero sin saldo ni servicio */
  TXF.app=loteTx(448,736,(c,w,h)=>{
    c.scale(4,4);c.translate(56,120);
    rr(c,-56,-120,112,184,16);c.clip();
    c.fillStyle=uFondo(c,-56,-120,112,184);c.fillRect(-56,-120,112,184);
    c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2;c.beginPath();c.moveTo(-60,20);c.bezierCurveTo(-20,-10,30,50,62,-6);c.stroke();
    c.fillStyle='#15171c';c.beginPath();c.arc(-40,-108,4,0,TAU);c.fill();
    uTxt(c,'ueno bank',4,-104,17,'#ffffff');
    c.fillStyle='#ffffff';rr(c,-48,-90,96,62,9);c.fill();
    uTxt(c,'CA N° ·······',-40,-78,8,'#6C6C78','left');uTxt(c,'Gs. ???',-40,-60,21,UNG,'left');
    c.strokeStyle='#6C6C78';c.lineWidth=1.6;c.beginPath();c.ellipse(34,-78,6,3.6,0,0,TAU);c.moveTo(27,-72);c.lineTo(41,-84);c.stroke();
    c.fillStyle='#FA3E74';rr(c,-40,-46,80,13,6.5);c.fill();uTxt(c,'Servicio no disponible',0,-39,7.5,'#ffffff','center',72);
    for(const ex of[-22,22]){c.fillStyle=UCL;c.beginPath();c.arc(ex,-4,15,0,TAU);c.fill();c.strokeStyle=UNG;c.lineWidth=4.5;c.lineCap='round';c.beginPath();c.moveTo(ex-6,-10);c.lineTo(ex+6,2);c.moveTo(ex+6,-10);c.lineTo(ex-6,2);c.stroke();}
    c.strokeStyle=UNG;c.lineWidth=4.5;c.beginPath();c.moveTo(-15,30);c.quadraticCurveTo(0,19,15,30);c.stroke();
    c.fillStyle='#ffffff';c.fillRect(-56,44,112,20);
    c.fillStyle='#C6C6CC';for(const x of[-42,-22,22,42]){rr(c,x-5,51,10,6,3);c.fill();}
    c.fillStyle=UV2;c.beginPath();c.arc(0,46,13,0,TAU);c.fill();
  },{cap:2,brilla:true});
}
