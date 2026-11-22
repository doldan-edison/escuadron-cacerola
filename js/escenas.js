/* Escenas del costado del camino: maquetas con muñecos que cuentan, en chiste, lo que fue pasando con el caso.
   Cada una se apoya en un hecho publicado (ver README): los exdirectivos con prisión preventiva en la ex-Tacumbú,
   el expresidente en Viñas Cué, el yate y las avionetas incautados, el pago a los ahorristas, los 27 imputados…
   La prisión preventiva no es una condena: los carteles lo dicen ("prevenidos", "preventiva"). */
import {B,U,T,C,BLANCO,NEGRO,V,emit,emitR,emitA,ponA,fset,fchild,marco,loteTx,TAU} from './motor3d.js';
import {persona,SANTI3D} from './figuras.js';
import {FX,ESC} from './escenario.js';
import {pintaCartel,rr,txt,uTxt,uFondo,poly,TINTA,UV,UV2,UV3,UNG} from './dibujo2d.js';

const VY=.14,fS=marco(),fY=marco(),fZ=marco(),TX={};
let OX=0,GZ=0,YW=0,CY=1,SY=0,LOD=0,E=1;   // E = escala de la maqueta (más grande en pantallas angostas, para que se lea)
const lista=[];
const ROJO=C('#d52b1e'),AZUL=C('#0038a8'),MADERA=C('#9a6a3a'),FIERRO=C('#3a3f4a'),PIZ=C('#27343f'),ACERO=C('#8a94a6'),GOMA=C('#20232b'),ORO=C('#ffcf33');
const AN=[];for(let i=0;i<8;i++)AN.push({ph:0,amp:0,lean:0,hop:0,roll:0,a0:null,a1:null,hx:0,hy:0,sq:1,sent:0,t:0});
function an(i,t,o){const a=AN[i];a.ph=0;a.amp=0;a.lean=0;a.hop=0;a.roll=0;a.a0=a.a1=null;a.hx=-.25;a.hy=0;a.sq=1;a.sent=0;a.t=t;if(o)for(const k in o)a[k]=o[k];return a;}
/* muñeco parado en la escena: lx a la derecha, lz hacia la cámara, ry giro, ly altura sobre la vereda */
function fig(st,lx,lz,ry,sc,a,ly){
  const x=OX+(lx*CY+lz*SY)*E,gz=GZ+(lx*SY-lz*CY)*E;
  persona(st,x,VY+(ly||0)*E,gz,YW+ry,sc*E,a,LOD);
  ponA(FX.som,x,VY+.02,gz,sc*E*.75,1,sc*E*.6,NEGRO,(ly||0)>1?.1:.24);
}

/* ---------- quiénes aparecen ---------- */
const DIR=[
  {traje:'#2b2f36',corb:'#1DBF79',pelo:'#141414',gordo:1,gafete:1,boca:'seria',lleva:'barrotes'},
  {traje:'#3a4a5c',corb:'#1DBF79',pelo:'#5a3a22',gafete:1,boca:'nervioso',lleva:'sacude'},
  {traje:'#15181f',corb:'#1DBF79',pelo:'#6a6a70',gafete:1,lentes:1,lleva:'jarro'}
];
const ENTREGA={traje:'#3a4a5c',corb:'#1DBF79',pelo:'#141414',gafete:1,boca:'nervioso',lleva:'arriba'};
const GUARDIA={traje:'#7a7550',pant:'#4a4d33',kepi:'#4a4d33',pelo:'#2a1d14',piel:'#c98e62',boca:'seria',lleva:'llaves'};
const MILICO={traje:'#4f5a34',pant:'#3a4428',casco:'#3a4428',piel:'#e0a878',boca:'seria',lleva:'venia'};
const PATRON={traje:'#f4f4f4',chaleco:'#7a1f2b',pelo:'#4d4d52',canas:'#8a8a90',gordo:1,boca:'seria',pant:'#2a2d36',lleva:'panuelo'};
const PRESO={...SANTI3D,boca:'sonrisa',lleva:'barrotes'};
const GLOBERO={...SANTI3D,banda:1,boca:'nervioso',lleva:'globos'};
const VEC=[
  {albi:1,traje:'#f4f4f4',corta:1,pant:'#2f4f86',pelo:'#2a1d14',piel:'#e0a878',zap:'#f4f4f4'},
  {traje:'#7fc4f5',pant:'#4a4038',pelo:'#9a9aa0',peinado:'rodete'},
  {traje:'#ffcf33',corta:1,pant:'#2f4f86',pelo:'#5a3a22',peinado:'cola'},
  {traje:'#2f8a5a',pant:'#3a3f4a',pelo:'#141414',piel:'#8d5a3b',gorra:'#d52b1e'},
  {traje:'#d52b1e',corta:1,pant:'#23262e',pelo:'#c9a15a',peinado:'largo'}
];
const COBRAN=VEC.map(v=>({...v,boca:'sonrisa',lleva:'billetes'})),MATERO={...VEC[3],lleva:'terere'};
const ENOJADO={...VEC[0],boca:'nervioso',lleva:'enoja'},SINPLATA={...VEC[4],boca:'nervioso',lleva:'billetera'};
const FISCAL={traje:'#5a6270',corb:'#d52b1e',pelo:'#5a3a22',lentes:1,boca:'seria',lleva:'sello'};
const PERITO={traje:'#f4f4f4',franja:'#0038a8',pant:'#23262e',pelo:'#2a1d14',peinado:'cola',lleva:'carpetas'};
const PERIODISTA={traje:'#2a6fd1',pant:'#23262e',pelo:'#c9a15a',peinado:'largo',boca:'sonrisa',lleva:'mic'};
const CAMARO={traje:'#3a3f4a',pant:'#23262e',pelo:'#141414',gorra:'#141414',lleva:'camara'};
const CHIPERA={traje:'#ffffff',delantal:'#d52b1e',pant:'#7a1f2b',pelo:'#2a1d14',peinado:'rodete',piel:'#c98e62',boca:'sonrisa',lleva:'canasto'};
const TRUCHO={traje:'#6a5a3a',pant:'#3a3020',pelo:'#141414',sombrero:'#3a3020',lentes:'osc',boca:'sonrisa',lleva:'cania'};

/* ---------- piezas repetidas ---------- */
/* celda abierta al frente: piso, fondo, costados, techo y barrotes */
function celda(f,w,h,dp,col,colT){
  emit(B.box,f,0,.08,0,w,.16,dp,C('#8a8a86'));
  emit(B.box,f,0,h/2+.1,-dp/2+.12,w,h,.24,col);
  for(const s of[-1,1])emit(B.box,f,s*(w/2-.12),h/2+.1,0,.24,h,dp,col);
  emit(B.box,f,0,h+.26,0,w+.3,.32,dp+.3,colT);
  const n=Math.round(w/.5);for(let i=1;i<n;i++)emit(B.cyl,f,-w/2+i*w/n,h/2+.1,dp/2-.08,.09,h,.09,FIERRO);
  for(const q of[.2,.72])emit(B.box,f,0,h*q,dp/2-.08,w,.1,.1,FIERRO);
}
/* cartel sobre dos postes */
function cartelon(tx,x,y,z,w,h,ry){
  fchild(fY,fS,x,0,z,0,ry||0,0);
  for(const s of[-1,1])emit(B.cyl,fY,s*w*.4,y/2,-.06,.09,y,.09,FIERRO);
  emit(B.box,fY,0,y,0,w+.14,h+.14,.1,PIZ);emit(tx,fY,0,y,.06,w,h,1,BLANCO);
}
function chancho(px,py,pz,yaw,s){
  const rosa=C('#ff9ab8'),ros2=C('#e8759a');
  fchild(fY,fS,px,py,pz,0,yaw,0);
  emit(B.sph,fY,0,0,0,s,s*.85,s*1.2,rosa);emit(B.sph,fY,0,s*.1,s*.58,s*.62,s*.6,s*.55,rosa);
  emitR(B.cyl,fY,0,s*.06,s*.88,Math.PI/2,0,0,s*.3,s*.14,s*.26,ros2);
  for(const k of[-1,1]){emit(B.cone,fY,k*s*.22,s*.42,s*.5,s*.2,s*.26,s*.12,ros2);emit(B.sph,fY,k*s*.16,s*.2,s*.82,s*.08,s*.1,s*.06,NEGRO);
    for(const z of[-.3,.3])emit(B.cyl,fY,k*s*.26,-s*.42,z*s,s*.17,s*.3,s*.17,ros2);}
  emit(B.box,fY,0,s*.42,-s*.05,s*.06,s*.04,s*.3,NEGRO);
}

/* ---------- las escenas ---------- */
const FN={
  /* Hecho: seis exdirectivos con prisión preventiva; cinco fueron llevados al Centro Nacional de Prevenidos (ex-Tacumbú). */
  tacumbu(t){
    celda(fS,4.6,3.0,2.4,C('#b9b4a8'),C('#8f8a7e'));
    emit(B.box,fS,0,4.08,1.0,4.7,1.14,.12,PIZ);emit(TX.tacumbu,fS,0,4.08,1.07,4.5,1.0,1,BLANCO);
    emit(TX.sesion,fS,0,3.36,1.37,4.5,.3,1,BLANCO);
    emit(TX.palitos,fS,1.2,2.2,-.95,1.5,.9,1,BLANCO);
    fig(DIR[0],-1.3,.55,0,1.85,an(0,t,{roll:Math.sin(t*2)*.05,hy:Math.sin(t*.9)*.4}));
    fig(DIR[1],0,.6,0,1.75,an(1,t,{lean:Math.sin(t*9)*.05}));
    fig(DIR[2],1.3,.55,0,1.8,an(2,t,{hy:Math.sin(t*1.3+1)*.3}));
    const gx=Math.sin(t*.55)*1.9,dir=Math.cos(t*.55)>0?1:-1;
    fig(GUARDIA,gx,2.2,dir*Math.PI/2,1.8,an(3,t,{ph:t*5,amp:.8}));
  },
  /* Hecho: el expresidente, destituido por juicio político, cumple prisión preventiva en la cárcel militar de Viñas Cué;
     lo trasladaron ahí después de que se publicaran privilegios (suite con gimnasio) en su primer lugar de reclusión. */
  vinascue(t){
    const f=fchild(fZ,fS,.6,0,0,0,0,0);
    celda(f,3.0,2.9,2.2,C('#6f7a4c'),C('#4f5a34'));
    emit(B.box,f,0,3.95,.95,3.2,1.0,.12,PIZ);emit(TX.vinas,f,0,3.95,1.02,3.0,.85,1,BLANCO);
    fig(PRESO,.6,.5,0,1.85,an(0,t,{hy:Math.sin(t*.8)*.5,lean:.05}));
    emit(TX.tip,fS,.1,5.3+Math.sin(t*2)*.07,1.2,3.9,1.5,1,BLANCO);
    // la cinta de correr, clausurada, y las pesas
    emit(B.box,fS,-1.9,.3,1.2,1.0,.24,1.9,C('#2a2d36'));emit(B.box,fS,-1.9,.44,1.2,.8,.04,1.7,C('#4a505a'));
    for(const s of[-1,1])emit(B.box,fS,-1.9+s*.45,1.0,.45,.07,1.3,.07,ACERO);
    emit(B.box,fS,-1.9,1.6,.45,1.0,.3,.1,PIZ);
    emitR(TX.clausurado,fS,-1.9,1.05,1.35,0,0,-.22,2.0,.42,1,BLANCO);
    emitR(B.cyl,fS,-1.0,.32,2.3,0,0,Math.PI/2,.08,.8,.08,ACERO);for(const s of[-1,1])emit(B.sph,fS,-1.0+s*.4,.32,2.3,.36,.36,.36,PIZ);
    // la banda, colgada de un perchero
    emit(B.cyl,fS,2.75,1.2,1.4,.07,2.4,.07,MADERA);emit(B.box,fS,2.75,2.35,1.4,.6,.06,.06,MADERA);
    for(let i=-1;i<=1;i++)emit(B.box,fS,2.75+i*.09,1.75+Math.sin(t*2+i)*.02,1.44,.09,1.1,.02,i<0?ROJO:i?AZUL:BLANCO);
    fig(MILICO,2.3,2.5,-.3,1.8,an(1,t));
  },
  /* Hecho: la Fiscalía incautó el yate "Zeus", dos avionetas y autos de lujo. */
  incautados(t){
    fchild(fY,fS,.3,.95,.3,0,-.25,Math.sin(t*1.4)*.03);
    emit(B.rbox,fY,0,.45,0,1.5,.9,4.2,BLANCO);emitR(B.cone,fY,0,.45,2.75,Math.PI/2,0,0,1.5,1.4,.9,BLANCO);
    emit(B.box,fY,0,.1,0,1.53,.2,4.1,C('#1d3fb8'));
    emit(B.rbox,fY,0,1.22,-.5,1.2,.75,1.9,BLANCO);emit(B.box,fY,0,1.28,-.5,1.24,.3,1.6,PIZ);emit(B.box,fY,0,1.7,-.9,.9,.1,.9,BLANCO);
    emitR(TX.zeus,fY,.77,.55,.7,0,Math.PI/2,0,1.5,.5,1,BLANCO);emitR(TX.zeus,fY,-.77,.55,.7,0,-Math.PI/2,0,1.5,.5,1,BLANCO);
    emit(B.box,fY,0,-.3,-.2,1.2,.22,4.4,PIZ);
    for(const s of[-1,1])for(const z of[-1.4,1.0])emitR(B.cyl,fY,s*.72,-.5,z,0,0,Math.PI/2,.8,.3,.8,GOMA);
    for(const s of[-1,1])emit(B.cone,fS,.3+s*1.9,.4,3.6,.4,.8,.4,C('#ff7a2a'));
    emitR(TX.incautado,fS,.3,1.0,3.6,0,0,0,3.8,.55,1,BLANCO);
    // la avioneta, con cepo en la rueda
    fchild(fY,fS,-.6,1.55,-3.4,0,.55,0);
    emitR(B.cap,fY,0,0,0,Math.PI/2,0,0,1.0,3.8,1.0,BLANCO);emit(B.box,fY,0,.12,.4,5.4,.12,1.0,BLANCO);emit(B.box,fY,0,.13,.4,5.42,.07,.3,C('#1d3fb8'));
    emit(B.box,fY,0,.55,-1.7,.12,1.0,.7,C('#1d3fb8'));emit(B.box,fY,0,.2,-1.7,1.8,.1,.5,BLANCO);emit(B.sph,fY,0,.26,.9,.72,.5,.95,PIZ);
    for(let k=0;k<2;k++)emitR(B.box,fY,0,0,1.95,0,0,t*3+k*Math.PI/2,1.5,.12,.04,C('#4a505a'));
    for(const s of[-1,1]){emit(B.box,fY,s*.7,-.65,.4,.08,1.0,.08,ACERO);emitR(B.cyl,fY,s*.7,-1.2,.4,0,0,Math.PI/2,.5,.2,.5,GOMA);}
    emit(B.box,fY,.7,-1.2,.4,.36,.72,.72,ORO);
    emitR(TX.incautado,fY,0,.75,.42,-Math.PI/2,0,.3,2.6,.38,1,BLANCO);
    cartelon(TX.senabico,-2.3,2.5,2.4,1.9,1.3,.3);
    fig(PERITO,2.4,2.7,-.5,1.8,an(0,t,{hx:Math.sin(t*2)*.12}));
  },
  /* Hecho: el BCP pagó a los ahorristas con el Fondo de Garantía, en bancos asignados, a cerca de 1,2 millones de depositantes. */
  fila(t){
    emit(B.box,fS,0,1.5,-2.3,3.4,3.0,1.2,C('#e4dfd3'));emit(B.box,fS,0,1.75,-1.68,1.9,1.2,.06,PIZ);emit(B.box,fS,0,1.05,-1.55,2.3,.12,.5,MADERA);
    emit(B.box,fS,0,3.55,-1.72,3.6,1.1,.12,C('#146542'));emit(TX.pago,fS,0,3.55,-1.65,3.5,1.0,1,BLANCO);
    emit(U.box,fS,1.15,2.72,-1.66,1.2,.42,.06,C('#15171c'));emit(TX.turno,fS,1.15,2.72,-1.62,1.14,.36,1,BLANCO);
    const cic=Math.floor(t*.22),q=(t*.22)%1,paso=Math.min(1,q*3);
    for(let i=0;i<5;i++)fig(VEC[(i+cic)%5],i%2?.14:-.14,-.6+(i+1-paso)*1.05,Math.PI,1.7,an(i,t,{ph:t*7+i,amp:paso<1?.9:0,hy:Math.sin(t*.7+i)*.3}));
    // el que ya cobró se va contento por el costado
    const sx=1.0+q*2.6;
    if(q<.92)fig(COBRAN[(cic+4)%5],sx,-.5+q*1.6,Math.PI*.6,1.7,an(5,t,{ph:t*9,amp:1,hop:Math.abs(Math.sin(t*9))*.12}));
    // y el último de la fila se trajo el sillón y el tereré
    emit(B.box,fS,-1.7,.55,3.4,.8,.08,.8,C('#2a6fd1'));emit(B.box,fS,-1.7,.95,3.05,.8,.8,.08,C('#2a6fd1'));
    fig(MATERO,-1.7,3.5,Math.PI*.85,1.7,an(6,t,{sent:1}),.25);
    emit(B.cyl,fS,-1.0,.36,3.6,.22,.5,.22,C('#d52b1e'));
  },
  /* Hecho: Cartes anunció que su partido acompañaría el juicio político; los diarios titularon que "le soltó la mano". */
  solto(t){
    cartelon(TX.solto,0,3.5,-1.3,3.8,1.25,0);
    fig(PATRON,-1.3,.6,.3,2.0,an(0,t,{hy:.35}));
    const q=(t*.16)%1,k=q>.86?(1-q)/.14:q<.06?q/.06:1;
    fig(GLOBERO,1.3+Math.sin(t*1.5)*.15,.4,-.2,1.7*k,an(1,t,{ph:t*9,amp:.5}),.15+q*q*5.2);
  },
  /* Hecho: unos 27 imputados; uno de los buscados se presentó solo ante la Fiscalía. */
  fiscalia(t){
    cartelon(TX.fiscalia,-.3,3.7,-1.1,4.0,1.25,0);
    emit(B.box,fS,-.6,1.0,.6,2.7,.1,1.1,MADERA);for(const s of[-1,1])emit(B.box,fS,-.6+s*1.2,.5,.6,.1,1.0,.9,MADERA);
    const cols=[C('#e8c98a'),C('#9ec3e6'),C('#f2a6a0')];
    for(let i=0;i<14;i++)emitR(B.box,fS,-1.45+Math.sin(t*1.6)*.004*i*i,1.1+i*.1,.6,0,((i*37)%7-3)*.06,0,.7,.09,.5,cols[i%3]);
    emit(B.box,fS,-.15,1.07,.8,.5,.03,.36,BLANCO);
    fig(FISCAL,-.25,-.25,0,1.8,an(0,t));
    const q=(t*.2)%1,x=2.9-Math.min(1,q*1.6)*1.6;
    fig(ENTREGA,x,1.3,-Math.PI*.42,1.75,an(1,t,{ph:t*7,amp:q<.62?.9:0}));
    emit(TX.entrego,fS,x+.1,2.75,1.3,1.9,.8,1,BLANCO);
    emit(B.rbox,fS,x+.75,.3,1.6,.2,.5,.7,C('#3a2a1e'));
  },
  /* Hecho: un exdirectivo habló de "delirio colectivo" al contar cómo se manejaba el banco. */
  prensa(t){
    for(const s of[-1,1])emit(B.cyl,fS,s*1.7,.8,-1.36,.1,1.6,.1,FIERRO);
    emit(B.box,fS,0,2.7,-1.3,4.5,2.5,.2,C('#15171c'));emit(TX.envivo,fS,0,2.7,-1.19,4.3,2.3,1,BLANCO);
    if(((t*2)|0)%2)emit(U.sph,fS,-1.75,3.52,-1.12,.16,.16,.08,C('#ff3b30'));
    fig(PERIODISTA,-.9,.6,.5,1.8,an(0,t,{hy:.3}));
    fig(ENOJADO,.35,.6,-.5,1.75,an(1,t,{hop:Math.abs(Math.sin(t*6))*.1,hy:-.3}));
    fig(CAMARO,2.0,2.1,-.9,1.8,an(2,t));
  },
  /* Juego de palabras con la puerta roja del juego: los ahorros, encerrados en el corralito. */
  corralito(t){
    for(let i=0;i<=6;i++)for(const z of[-1.3,1.3])emit(B.box,fS,-1.8+i*.6,.5,z,.1,1.0,.1,MADERA);
    for(let i=1;i<4;i++)for(const x of[-1.8,1.8])emit(B.box,fS,x,.5,-1.3+i*.65,.1,1.0,.1,MADERA);
    for(const y of[.35,.75]){for(const z of[-1.3,1.3])emit(B.box,fS,0,y,z,3.7,.08,.05,MADERA);for(const x of[-1.8,1.8])emit(B.box,fS,x,y,0,.05,.08,2.7,MADERA);}
    for(let i=0;i<5;i++){const a=t*.7+i*1.26;chancho(Math.cos(a)*(i%2?1.2:.6),.34+Math.abs(Math.sin(t*5+i*1.7))*.3,Math.sin(a*1.3+i)*.8,a+Math.PI/2,.55);}
    cartelon(TX.corralito,0,2.7,-1.7,3.5,1.2,0);
  },
  /* Con la app caída, en la calle solo corre el efectivo. */
  chipa(t){
    cartelon(TX.chipa,.3,3.3,-1.0,3.4,1.3,0);
    emit(B.box,fS,1.0,.9,.7,1.5,.08,.9,MADERA);for(const s of[-1,1])emit(B.box,fS,1.0+s*.65,.45,.7,.08,.9,.7,MADERA);
    emit(B.cyl,fS,1.0,1.06,.7,.95,.26,.95,C('#b8894a'));
    for(let i=0;i<6;i++)emitR(B.tor,fS,1.0+Math.cos(i*1.05)*.26,1.24,.7+Math.sin(i*1.05)*.26,Math.PI/2,0,0,.3,.3,.5,C('#f2c66a'));
    for(let i=0;i<3;i++){const q=(t*.5+i/3)%1;emitA(T.sph,fS,1.0+Math.sin(q*6+i)*.12,1.4+q*1.2,.7,.25+q*.3,.25+q*.3,.25+q*.3,BLANCO,.3*(1-q));}
    fig(CHIPERA,-.5,.6,.25,1.85,an(0,t,{roll:Math.sin(t*2)*.04}));
    fig(SINPLATA,2.3,1.9,-1.0,1.7,an(1,t,{hy:Math.sin(t*4)*.4}));
  },
  /* Aviso de verdad: los reintegros por link son estafa (el BCP no manda links). El trucho "pesca" con caña: phishing. */
  estafa(t){
    emit(B.box,fS,-.2,.9,1.0,1.6,.07,.8,ACERO);for(const s of[-1,1])emit(B.box,fS,-.2+s*.7,.45,1.0,.06,.9,.6,ACERO);
    emit(B.box,fS,-.2,.96,1.0,.7,.04,.5,PIZ);emitR(B.box,fS,-.2,1.22,.74,-.3,0,0,.7,.5,.04,PIZ);emitR(U.box,fS,-.2,1.22,.765,-.3,0,0,.6,.4,.01,C('#2BD98E'));
    fig(TRUCHO,-.2,0,0,1.85,an(0,t,{hy:Math.sin(t*1.1)*.4}));
    cartelon(TX.reintegros,-2.2,2.4,-.2,2.3,1.5,.25);
    cartelon(TX.nolinks,2.2,2.3,.9,2.4,1.6,-.3);
    if(((t*3)|0)%2)emit(U.sph,fS,2.2,3.3,.9,.22,.22,.22,C('#ff3b30'));
  }
};
/* orden por nivel: las de la cárcel van primero, que son las que cuentan cómo terminó la historia */
const PLAN=[
  ['tacumbu','fila','vinascue','chipa','prensa','incautados','estafa','corralito'],
  ['vinascue','solto','tacumbu','prensa','fila','fiscalia','corralito','incautados'],
  ['solto','vinascue','corralito','chipa','incautados','tacumbu','fiscalia','prensa'],
  ['fila','fiscalia','tacumbu','estafa','incautados','vinascue','prensa','solto'],
  ['tacumbu','incautados','vinascue','fiscalia','solto','corralito','fila','estafa']
];
export function armarEscenas(L,len){
  lista.length=0;const P=PLAN[L%PLAN.length];let i=0;
  for(let d=30;d<len+10;d+=48){lista.push({d,s:i%2?-1:1,k:P[i%P.length]});i++;}
}
export function dibEscenas(dist,t){
  ESC.huecos.length=0;E=V.W/V.H<.75?1.3:1.12;
  for(const e of lista){
    const z=e.d-dist;if(z<-10||z>94)continue;
    ESC.huecos.push({s:e.s,z,r:7.5*E});
    OX=e.s*(3.5+2.6*E);GZ=z;YW=-e.s*.42;CY=Math.cos(YW);SY=Math.sin(YW);LOD=z<34?0:1;
    fset(fS,OX,VY,GZ,YW,E);
    FN[e.k](t,e.s);
  }
}

/* ---------- carteles ---------- */
export function crearEscenas(){
  const N='nada';
  TX.tacumbu=loteTx(576,128,pintaCartel([['EX-TACUMBÚ',.56,'#ffffff'],['centro nacional de prevenidos',.2,UV,'u']],{fondo:N}),{cap:4});
  TX.sesion=loteTx(768,56,pintaCartel([['DIRECTORIO EN SESIÓN PERMANENTE',.7,'#ffcf33']],{fondo:N}),{cap:4});
  TX.palitos=loteTx(240,144,(c,w,h)=>{
    c.strokeStyle='#4a4a46';c.lineWidth=5;c.lineCap='round';
    for(let g=0;g<3;g++)for(let i=0;i<(g<2?5:2);i++){const x=20+g*76+i*13;c.beginPath();if(i===4){c.moveTo(x-58,h*.52);c.lineTo(x+2,h*.2);}else{c.moveTo(x,h*.16);c.lineTo(x+2,h*.56);}c.stroke();}
    uTxt(c,'en preventiva',w/2,h*.8,h*.17,'#4a4a46');
  },{cap:4});
  TX.vinas=loteTx(384,112,pintaCartel([['VIÑAS CUÉ',.6,'#ffffff'],['prisión preventiva',.2,'#ffcf33','u']],{fondo:N}),{cap:4});
  TX.tip=loteTx(512,200,(c,w,h)=>{
    c.lineJoin='round';c.fillStyle='#fff';c.strokeStyle=TINTA;c.lineWidth=7;
    c.beginPath();c.moveTo(w*.56,h*.72);c.lineTo(w*.62,h*.97);c.lineTo(w*.7,h*.72);c.closePath();c.fill();c.stroke();
    c.beginPath();c.ellipse(w/2,h*.4,w*.47,h*.36,0,0,TAU);c.fill();c.stroke();
    c.fillStyle='#fff';c.fillRect(w*.565,h*.66,w*.13,h*.08);
    txt(c,'¡TIP DE AHORRO!',w/2,h*.29,h*.19,'#0038a8',w*.8);uTxt(c,'Acá no se paga alquiler',w/2,h*.52,h*.15,TINTA,'center',w*.8);
  },{cap:4});
  const cinta=(s,a,b)=>(c,w,h)=>{c.fillStyle=a;c.fillRect(0,h*.1,w,h*.8);c.fillStyle=b;for(let x=-h;x<w;x+=h*.9){c.beginPath();c.moveTo(x,h*.9);c.lineTo(x+h*.3,h*.9);c.lineTo(x+h*.75,h*.1);c.lineTo(x+h*.45,h*.1);c.fill();}
    c.fillStyle=a;const tw=w*.62;c.fillRect((w-tw)/2,h*.1,tw,h*.8);txt(c,s,w/2,h*.54,h*.5,b,tw*.94);};
  TX.clausurado=loteTx(512,104,cinta('GIMNASIO CLAUSURADO','#ffcf33','#141a33'),{cap:4});
  TX.incautado=loteTx(640,96,cinta('INCAUTADO','#ffcf33','#141a33'),{cap:6,doble:true});
  TX.zeus=loteTx(256,88,pintaCartel([['ZEUS',.8,'#1d3fb8']],{fondo:N}),{cap:4});
  TX.senabico=loteTx(320,220,pintaCartel([['BIENES',.24,TINTA],['INCAUTADOS',.24,'#d52b1e'],['yate, avionetas y autos',.13,TINTA,'u']],{fondo:'#fffbe6',borde:N,radio:.04}),{cap:4});
  TX.pago=loteTx(640,184,pintaCartel([['PAGO A AHORRISTAS',.36,'#ffffff'],['banco asignado · anticipo del fondo de garantía',.15,'#D6FCEC','u']],{fondo:N}),{cap:4});
  TX.turno=loteTx(288,92,(c,w,h)=>{c.font='700 '+(h*.5|0)+'px ui-monospace,Menlo,Consolas,monospace';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ff5a4a';c.fillText('N° 1.199.998',w/2,h*.54,w*.92);},{cap:4,brilla:true});
  TX.solto=loteTx(608,200,pintaCartel([['LE SOLTÓ',.4,TINTA],['LA MANO',.4,'#c8102e']],{fondo:'#ffffff',borde:N,radio:.06}),{cap:4});
  TX.fiscalia=loteTx(640,200,pintaCartel([['FISCALÍA',.46,'#ffffff'],['27 imputados (y contando)',.2,'#ffcf33','u']],{fondo:N}),{cap:4});
  TX.entrego=loteTx(304,128,(c,w,h)=>{
    c.lineJoin='round';c.fillStyle='#fff';c.strokeStyle=TINTA;c.lineWidth=6;
    c.beginPath();c.moveTo(w*.3,h*.7);c.lineTo(w*.26,h*.97);c.lineTo(w*.46,h*.7);c.closePath();c.fill();c.stroke();
    rr(c,6,6,w-12,h*.68,h*.3);c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(w*.3,h*.62,w*.15,h*.1);
    txt(c,'¡ME ENTREGO!',w/2,h*.4,h*.27,'#d52b1e',w*.84);
  },{cap:4});
  TX.envivo=loteTx(560,300,(c,w,h)=>{
    c.fillStyle='#22303c';c.fillRect(0,0,w,h);const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(120,170,220,.5)');g.addColorStop(1,'rgba(20,30,50,.2)');c.fillStyle=g;c.fillRect(0,0,w,h);
    c.fillStyle='#d52b1e';rr(c,w*.04,h*.07,w*.4,h*.19,8);c.fill();txt(c,'EN VIVO',w*.24,h*.172,h*.13,'#fff',w*.36);
    c.fillStyle='#ffcf33';c.fillRect(0,h*.56,w,h*.15);txt(c,'ÚLTIMO MOMENTO',w/2,h*.642,h*.11,TINTA,w*.9);
    c.fillStyle='#ffffff';c.fillRect(0,h*.71,w,h*.29);txt(c,'«Fue un delirio colectivo»',w/2,h*.86,h*.13,'#d52b1e',w*.92);
    uTxt(c,'siguen los reclamos de los ahorristas',w/2,h*.4,h*.085,'#ffffff','center',w*.9);
  },{cap:4,brilla:true});
  TX.corralito=loteTx(560,192,pintaCartel([['CORRALITO',.46,'#d52b1e'],['ahorros en engorde',.2,TINTA,'u']],{fondo:'#fff6e8',borde:N,radio:.06}),{cap:4});
  TX.chipa=loteTx(560,214,pintaCartel([['CHIPA',.46,'#8a5a2b'],['SOLO EFECTIVO',.26,'#d52b1e']],{fondo:'#fff3c4',borde:N,radio:.06}),{cap:4});
  TX.reintegros=loteTx(368,240,pintaCartel([['uen0+',.24,'#ffffff','u'],['REINTERGOS',.2,UNG],['¡cobrá ya!',.16,'#ffffff','u']],{fondo:'ueno',borde:N,radio:.08}),{cap:4});
  TX.nolinks=loteTx(384,256,pintaCartel([['¡OJO, ESTAFA!',.26,'#d52b1e'],['El BCP no',.2,TINTA],['manda links',.2,TINTA]],{fondo:'#ffcf33',borde:N,radio:.06}),{cap:4});
}
