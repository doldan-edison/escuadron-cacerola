/* La calle en 3D: asfalto y veredas con textura, cielo, edificios a los costados, decorado (lapachos, faroles,
   banderas, carteles) y el edificio que marca el final de cada nivel. */
import {THREE,B,U,T,C,BLANCO,NEGRO,emit,emitR,emitA,pon,ponA,fset,marco,lote,loteTx,texLienzo,pintarCielo,scene,hemi,sol,V,LETREROS,GEO,TAU,clamp,rng,hexA} from './motor3d.js';
import {rr,txt,uTxt,uFondo,pintaCartel,UV,UV2,UV3,UNG,TINTA} from './dibujo2d.js';

const TW=3,LEN=260,ATRAS=14,PD=96,PB=120,VY=.14;   // VY = altura de la vereda
let S=null,nivel=0,noche=false;
let lzRoad=null,lzVer=null,txRoad=null,txVer=null;
const base={},decor=[],edif=[],EB=[],EM=[];
export const FX={};     // brillos y sombras blandas que usa todo el dibujo
export const ESC={huecos:[]};   // tramos de vereda ocupados por una escena: ahí no va decorado
const HITO={},TXD={};
const f0=marco();
const mk=(w,h,fn)=>{const k=document.createElement('canvas');k.width=w;k.height=h;if(fn)fn(k.getContext('2d'),w,h);return k;};

/* ---------- ambiente por nivel: de la mañana en la sucursal a la noche frente a la bóveda ---------- */
const AMB=[
  {hs:'#ffffff',hg:'#e0d8cc',hi:1.9,sc:'#fff4d6',si:1.7,sp:[-4,10,9],let:'#ffffff'},
  {hs:'#fffaf0',hg:'#e6d6b8',hi:1.9,sc:'#fff0c8',si:1.8,sp:[4,10,9],let:'#ffffff'},
  {hs:'#eef3fa',hg:'#c9ced6',hi:2.1,sc:'#e9eef5',si:1.2,sp:[-3,10,9],let:'#f1f4f8'},
  {hs:'#ffd9b8',hg:'#c9a48c',hi:1.7,sc:'#ff9a5a',si:2.2,sp:[-9,6,7],let:'#ffe2cc'},
  {hs:'#9aa0e8',hg:'#5a5478',hi:1.75,sc:'#b9c2ff',si:1.1,sp:[5,10,8],let:'#b4b2d6'}
];
/* tinte del suelo: lc/la vereda, pc/pa asfalto, dk oscurece todo */
const GT=[
  {lc:null,la:0,pc:null,pa:0,dk:null},
  {lc:'#e0b080',la:.25,pc:null,pa:0,dk:null},
  {lc:'#9fb3c9',la:.25,pc:'#7d8da0',pa:.2,dk:null},
  {lc:'#e8a070',la:.3,pc:'#c08060',pa:.2,dk:'#f2dfd2'},
  {lc:'#7a6aa8',la:.35,pc:'#5a5a90',pa:.35,dk:'#b4b2cc'}
];

/* ---------- texturas del suelo ---------- */
function baldosa(){
  // 384 px = 4 unidades: 4×4 baldosas con juntas y manchas
  const Z=384,R=rng(99),n=4,q=Z/n;
  return mk(Z,Z,c=>{
    c.fillStyle='#8f897f';c.fillRect(0,0,Z,Z);
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){
      const v=(R()*18-9)|0,b=205+v;c.fillStyle='rgb('+b+','+(b-5)+','+(b-14)+')';c.fillRect(i*q+2,j*q+2,q-4,q-4);
      c.fillStyle='rgba(255,255,255,.18)';c.fillRect(i*q+2,j*q+2,q-4,4);
      c.strokeStyle='rgba(0,0,0,.06)';c.lineWidth=2;for(let k=1;k<4;k++){c.beginPath();c.moveTo(i*q+2+k*(q-4)/4,j*q+2);c.lineTo(i*q+2+k*(q-4)/4,j*q+q-2);c.stroke();}
    }
    for(let i=0;i<300;i++){c.fillStyle=R()<.5?'rgba(80,70,60,.18)':'rgba(255,255,255,.2)';c.beginPath();c.arc(R()*Z,R()*Z,1+R()*2.5,0,TAU);c.fill();}
    for(let i=0;i<5;i++){c.fillStyle='rgba(60,50,40,.12)';c.beginPath();c.ellipse(R()*Z,R()*Z,8+R()*14,5+R()*8,R()*3,0,TAU);c.fill();}
  });
}
function asfalto(){
  // 512 px = 6 unidades (todo el ancho de la calle): línea amarilla cortada al medio y blanca en los bordes
  const Z=512,R=rng(5);
  return mk(Z,Z,c=>{
    c.fillStyle='#5a5c62';c.fillRect(0,0,Z,Z);
    for(let i=0;i<2600;i++){const x=R()*Z,y=R()*Z,r=.8+R()*2.2;c.fillStyle=R()<.5?'rgba(30,30,34,.35)':'rgba(170,170,175,.25)';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
    for(let i=0;i<7;i++){c.strokeStyle='rgba(25,25,28,.45)';c.lineWidth=2;c.beginPath();let x=R()*Z,y=R()*Z;c.moveTo(x,y);for(let k=0;k<5;k++){x+=R()*40-20;y+=R()*30;c.lineTo(x,y);}c.stroke();}
    c.fillStyle='#f2c230';for(const y of[26,282])c.fillRect(Z/2-5,y,10,154);
    c.fillStyle='rgba(240,240,236,.85)';c.fillRect(11,0,6,Z);c.fillRect(Z-17,0,6,Z);
  });
}
function tenir(dst,src,col,a,dark){
  const c=dst.getContext('2d'),w=dst.width,h=dst.height;c.globalCompositeOperation='source-over';c.globalAlpha=1;c.drawImage(src,0,0);
  if(col&&a>0){c.globalCompositeOperation='color';c.globalAlpha=a;c.fillStyle=col;c.fillRect(0,0,w,h);}
  if(dark){c.globalCompositeOperation='multiply';c.globalAlpha=1;c.fillStyle=dark;c.fillRect(0,0,w,h);}
  c.globalCompositeOperation='source-over';c.globalAlpha=1;
}

/* ---------- edificios: cajas con la fachada pintada (sin luz: la sombra va en la textura y en el color de cada cara) ---------- */
const TIPOS=[
  {len:7,h:5,dep:6,pisos:2,cols:4,pared:'#efe2c4',techo:'#b9ad94',local:'FARMACIA',toldo:'#d52b1e'},
  {len:6,h:6.6,dep:6,pisos:3,cols:3,pared:'#e9b7a6',techo:'#a88d82',local:'DESPENSA',toldo:'#2a9df4'},
  {len:8,h:11,dep:7,pisos:6,cols:5,pared:'#b9c2cc',techo:'#8a929c',local:'CAMBIOS',toldo:'#1DBF79'},
  {len:8,h:17,dep:8,pisos:10,cols:5,pared:'#5f7f9a',techo:'#4a6076',vidrio:1},
  {len:7,h:3.9,dep:6,pisos:1,cols:3,pared:'#f4ecd8',techo:'#b5533a',local:'COPETÍN',toldo:'#e0a100'},
  {len:7,h:5.2,dep:6,pisos:2,cols:4,pared:'#f2f6f4',techo:'#9aa6a0',ueno:1},
  {len:6,h:8.4,dep:6,pisos:4,cols:3,pared:'#e6d39a',techo:'#a8996a',local:'LOTERÍA',toldo:'#8a6bd8'}
];
function pintaFachada(c,w,h,T,hora){
  const R=rng((T.len*7+T.h*13)|0),nt=hora===2;
  c.fillStyle=T.pared;c.fillRect(0,0,w,h);
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(255,255,255,.14)');g.addColorStop(1,'rgba(0,0,0,.14)');c.fillStyle=g;c.fillRect(0,0,w,h);
  if(nt){c.fillStyle='rgba(18,22,58,.66)';c.fillRect(0,0,w,h);}
  if(T.vidrio){
    const cw=w/T.cols,rh=h/T.pisos;
    for(let j=0;j<T.pisos;j++)for(let i=0;i<T.cols;i++){c.fillStyle=nt?(R()<.42?'#ffd978':'#1c2a3e'):(R()<.5?'#9cc4e2':'#84b0d2');c.fillRect(i*cw+3,j*rh+3,cw-6,rh-6);if(!nt){c.fillStyle='rgba(255,255,255,.25)';c.fillRect(i*cw+3,j*rh+3,(cw-6)*.4,rh-6);}}
  }else{
    const pb=h/(T.pisos+.15)*1.15,n=T.pisos-1,ph=n?(h-pb)/n:0,cw=w/T.cols;
    for(let j=0;j<n;j++){
      const y=j*ph;
      for(let i=0;i<T.cols;i++){
        const x=i*cw+cw*.2,ww=cw*.6,wh=ph*.56,yy=y+ph*.22;
        c.fillStyle=nt?'#8a8fb0':'#ffffff';c.fillRect(x-3,yy-3,ww+6,wh+6);
        c.fillStyle=nt?(R()<.5?'#ffd978':'#232a3a'):'#5d7f9a';c.fillRect(x,yy,ww,wh);
        if(!nt){c.fillStyle='rgba(255,255,255,.3)';c.fillRect(x,yy,ww*.45,wh);}
        c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x-3,yy+wh+3,ww+6,3);
      }
      c.fillStyle='rgba(0,0,0,.1)';c.fillRect(0,y+ph-4,w,4);
    }
    const y0=h-pb;
    c.fillStyle='rgba(0,0,0,.16)';c.fillRect(0,y0,w,pb);
    if(T.ueno){
      // sucursal cerrada: cartel verde, persiana baja y un papel pegado
      c.fillStyle=uFondo(c,0,y0,w,pb*.3);c.fillRect(0,y0,w,pb*.32);uTxt(c,'ueno',w/2,y0+pb*.17,pb*.26,'#fff');
      c.fillStyle='#8a929c';c.fillRect(w*.12,y0+pb*.38,w*.76,pb*.62);
      c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=2;for(let k=1;k<8;k++){c.beginPath();c.moveTo(w*.12,y0+pb*.38+k*pb*.075);c.lineTo(w*.88,y0+pb*.38+k*pb*.075);c.stroke();}
      c.fillStyle='#fffbe6';c.fillRect(w*.3,y0+pb*.55,w*.4,pb*.2);txt(c,'CERRADO',w/2,y0+pb*.655,pb*.11,'#d52b1e',w*.36);
    }else{
      c.fillStyle=T.toldo;c.fillRect(0,y0,w,pb*.26);txt(c,T.local,w/2,y0+pb*.14,pb*.17,'#fff',w*.9);
      for(let i=0;i<8;i++){c.fillStyle=i%2?'#ffffff':T.toldo;c.fillRect(i*w/8,y0+pb*.26,w/8+1,pb*.12);}
      c.fillStyle=nt?'#ffe9a8':'#9cc4de';c.fillRect(w*.08,y0+pb*.44,w*.5,pb*.44);
      c.fillStyle='rgba(255,255,255,.35)';c.fillRect(w*.08,y0+pb*.44,w*.2,pb*.44);
      c.fillStyle='#4a3a2a';c.fillRect(w*.68,y0+pb*.42,w*.2,pb*.58);
    }
  }
  if(hora===1){c.fillStyle='rgba(255,140,80,.16)';c.fillRect(0,0,w,h);}
}
function crearEdificios(){
  TIPOS.forEach((T,i)=>{
    const w=256,h=Math.min(640,Math.round(256*T.h/T.len));
    const k=mk(w,h),tex=texLienzo(k,false);
    const mz=new THREE.MeshBasicMaterial({map:tex}),mx=new THREE.MeshBasicMaterial({map:tex,color:0xd0d2da}),mr=new THREE.MeshBasicMaterial({color:T.techo});
    EM[i]={k,tex,w,h,mr};
    EB[i]=lote(GEO.box,[mx,mx,mr,mr,mz,mz],28,0);
  });
}
function armarEdificios(L){
  edif.length=0;
  const R=rng(71+L*29),mix=[[0,1,5,4,6,0,1],[4,0,6,4,1,2],[4,4,0,4,6],[2,3,2,6,1,3],[3,3,2,3,5,2]][L%5];
  for(let side=-1;side<=1;side+=2){
    let d=0;
    while(d<PB-3){
      const t=mix[(R()*mix.length)|0],T=TIPOS[t];let len=T.len*(.9+R()*.25);if(d+len>PB-3)len=PB-d;
      const q=.86+R()*.14;
      edif.push({side,d0:d+len/2,len,h:T.h*(.88+R()*.3),dep:T.dep,t,x:11+R()*1.2,c:new Float32Array([q,q,q])});
      d+=len+.25+R()*.9;
    }
  }
}

/* ---------- decorado ---------- */
/* 0 lapacho · 1 farol · 2 cartel de protesta · 3 bandera · 4 aviso "2 de cada 3" · 5 cantero · 6 banco */
const ROSA=['#ff9bd2','#f06ab0','#ffc2e4','#e0559e'].map(C),TRONCO=C('#5a3a26'),MADERA=C('#9a6a3a'),ROJO=C('#d52b1e'),AZUL=C('#0038a8'),
  POSTE=C('#3a3f4a'),CONC=C('#c9c4b8'),VERDES=['#4f9e31','#6cbf45','#3d8427'].map(C);
function armarDecor(L){
  decor.length=0;
  const R=rng(31+L*17),tipos=[[2,5,3,4,6,0,5],[5,5,2,4,6,3],[0,0,3,5,2,6,0],[2,4,5,5,3,6],[3,2,4,2,5,6]][L%5];
  // fila pareja pegada al cordón: farol y lapacho alternados, como en una avenida
  for(let d=0;d<PD;d+=16){const s=(d/16)%2?1:-1;decor.push({x:s*3.75,d0:d,t:1,k:1,sd:d});decor.push({x:-s*4.9,d0:d+8,t:L===4?1:0,k:.9+R()*.3,sd:d+3});}
  // y lo demás, suelto por la vereda
  for(let i=0;i<22;i++){const side=i%2?1:-1,t=tipos[(R()*tipos.length)|0];decor.push({x:side*(5.7+Math.pow(R(),1.3)*4),d0:R()*PD,t,k:.85+R()*.4,sd:R()*50,v:(R()*4)|0});}
}
function lapacho(x,gz,k,t,sd){
  pon(B.cyl,x,VY+1.0*k,gz,.3*k,2.0*k,.3*k,TRONCO);
  fset(f0,x,VY+1.7*k,gz,0,k);
  emitR(B.cyl,f0,-.32,.3,0,0,0,.7,.13,.9,.13,TRONCO);emitR(B.cyl,f0,.32,.34,0,0,0,-.7,.13,.9,.13,TRONCO);
  const sw=Math.sin(t*1.7+sd)*.06;
  for(let i=0;i<7;i++){const a=i*2.4+sd,r=i?.78:0,py=.85+(i%3)*.34+(i?0:.5);emit(B.sph,f0,Math.cos(a)*r+sw*py,py,Math.sin(a)*r*.8,1.3,1.12,1.3,ROSA[i%4]);}
  // pétalos que caen
  for(let i=0;i<4;i++){const q=(t*.2+i*.25+sd*.13)%1;pon(U.box,x+Math.cos(i*2.1+sd)*.95*k+Math.sin(t+i)*.2,VY+(2.5-q*2.5)*k,gz+Math.sin(i*1.7+sd)*.8*k,.08,.02,.08,ROSA[i%4],q*9+i);}
  ponA(FX.som,x,VY+.02,gz,2.9*k,1,2.5*k,NEGRO,.22);
}
function farol(x,gz,t){
  const s=x>0?-1:1,lx=x+s*.6;
  pon(B.cyl,x,VY+1.65,gz,.12,3.3,.12,POSTE);pon(B.cyl,x,VY+.12,gz,.3,.24,.3,POSTE);
  pon(B.box,x+s*.3,VY+3.3,gz,.7,.07,.07,POSTE);
  pon(U.sph,lx,VY+3.2,gz,.3,.24,.3,noche?C('#fff0b0'):C('#f4f1e4'));
  if(noche){ponA(FX.luz,lx,VY+3.2,gz,2.2,2.2,1,C('#ffd98a'),.5);ponA(FX.luzPiso,lx,.04,gz,6,1,6,C('#ffcf7a'),.22);}
}
function bandera(x,gz,k,t,sd){
  pon(B.cyl,x,VY+1.9*k,gz,.08,3.8*k,.08,C('#d8d8d8'));pon(B.sph,x,VY+3.85*k,gz,.17,.17,.17,C('#ffcf33'));
  fset(f0,x,VY+3.2*k,gz,0,k);
  for(let j=0;j<5;j++){const z=Math.sin(t*5-j*.9+sd)*.045*(j+1);for(let i=0;i<3;i++)emit(B.box,f0,.2+.3*j,.42-.24*i,z,.31,.245,.02,i?i>1?AZUL:BLANCO:ROJO);}
  emit(B.sph,f0,.8,.18,.03,.16,.16,.03,C('#ffcf33'));
}
function cantero(x,gz,k,sd){
  pon(B.rbox,x,VY+.28*k,gz,1.5*k,.56*k,.75*k,CONC);
  for(let i=0;i<4;i++)pon(B.sph,x+(i-1.5)*.34*k,VY+(.62+(i%2)*.08)*k,gz,.62*k,.52*k,.6*k,VERDES[(i+(sd|0))%3]);
  for(let i=0;i<3;i++)pon(U.sph,x+(i-1)*.42*k,VY+.92*k,gz+.12,.11,.11,.11,i%2?C('#ffcf33'):C('#ff7ab2'));
}
function banco(x,gz){
  const s=x>0?-1:1;
  pon(B.box,x,VY+.42,gz,.5,.07,1.5,MADERA);pon(B.box,x-s*.24,VY+.72,gz,.06,.5,1.5,MADERA);
  for(const z of[-.6,.6]){pon(B.box,x,VY+.2,gz+z,.42,.4,.07,POSTE);}
}
function dibDecor(dist,t){
  for(const d of decor){
    const z=((d.d0-dist)%PD+PD)%PD-6;
    let tapa=false;for(const h of ESC.huecos)if((d.x>0)===(h.s>0)&&Math.abs(z-h.z)<h.r){tapa=true;break;}
    if(tapa)continue;
    const yw=d.x>0?-.3:.3;
    switch(d.t){
      case 0:lapacho(d.x,z,d.k,t,d.sd);break;
      case 1:farol(d.x,z,t);break;
      case 2:pon(B.box,d.x,VY+.7*d.k,z,.07,1.4*d.k,.07,MADERA);pon(B.box,d.x,VY+1.6*d.k,z,1.4*d.k,.82*d.k,.05,BLANCO,yw);fset(f0,d.x,VY+1.6*d.k,z,yw,d.k);emit(TXD.prot[d.v||0],f0,0,0,.03,1.34,.76,1,BLANCO);break;
      case 3:bandera(d.x,z,d.k,t,d.sd);break;
      case 4:for(const q of[-.9,.9])pon(B.cyl,d.x+q*d.k,VY+.9*d.k,z,.1,1.8*d.k,.1,POSTE);fset(f0,d.x,VY+2.6*d.k,z,yw,d.k);emit(B.box,f0,0,0,0,2.8,1.8,.1,C('#27343f'));emit(TXD.aviso,f0,0,0,.06,2.66,1.66,1,BLANCO);break;
      case 5:cantero(d.x,z,d.k,d.sd);break;
      case 6:banco(d.x,z);break;
    }
  }
}

/* ---------- el edificio del final de cada nivel (queda detrás del portal y del jefe) ---------- */
function hito(L,gz,t){
  const f=fset(f0,0,0,gz,0,1);
  if(L===0){
    // la sucursal de ueno, cerrada
    emit(B.box,f,0,3.2,-3.5,13,6.4,7,C('#f2f6f4'));emit(B.box,f,0,5.5,.03,13.04,1.8,.12,C(UV2));emit(HITO.ueno,f,0,5.5,.11,5.4,1.5,1,BLANCO);
    emit(B.box,f,0,1.6,.06,3.5,3.2,.12,C('#27343f'));emit(B.box,f,0,1.55,.14,3.2,3.0,.06,C('#8a929c'));
    for(let i=1;i<9;i++)emit(B.box,f,0,.1+i*.33,.18,3.2,.03,.02,C('#6a727c'));
    emit(HITO.cerrado,f,0,1.9,.22,2.6,1.1,1,BLANCO);
    emitR(B.box,f,0,3.75,.9,.32,0,0,13,.12,1.9,C(UV2));
    for(const s of[-1,1]){emit(B.rbox,f,s*4.6,1.15,.35,1.3,2.3,.8,C(UV2));emit(B.box,f,s*4.6,1.6,.77,.9,.6,.04,C(UNG));}
  }else if(L===1){
    // el Palacio de López: cuerpo ancho, alas, torre con cúpula y arcos
    const cr=C('#efe6d2'),cr2=C('#d8ccb2'),osc=C('#5a4a3a');
    emit(B.box,f,0,2.6,-3,9,5.2,6,cr);emit(B.box,f,0,5.35,-3,9.5,.3,6.5,cr2);
    for(const s of[-1,1]){emit(B.box,f,s*8,1.9,-3,7,3.8,5,cr);emit(B.box,f,s*8,3.92,-3,7.4,.26,5.4,cr2);for(let i=-2;i<=2;i++){emit(B.box,f,s*8+i*1.25,1.9,-.48,.7,1.6,.06,osc);emit(B.sph,f,s*8+i*1.25,2.7,-.48,.7,.7,.1,osc);}}
    emit(B.box,f,0,7,-3,3,3.2,3,cr);emit(B.box,f,0,8.7,-3,3.4,.26,3.4,cr2);emit(B.sph,f,0,8.85,-3,2.6,2.3,2.6,C('#b9c2cc'));emit(B.cone,f,0,10.7,-3,.5,1.7,.5,cr2);
    for(let i=-3;i<=3;i++){emit(B.box,f,i*1.2,1.4,.03,.72,2.4,.1,osc);emit(B.sph,f,i*1.2,2.6,.03,.72,.72,.14,osc);if(i<3)emit(B.cyl,f,i*1.2+.6,2.3,.25,.2,4.6,.2,BLANCO);}
    emit(B.box,f,0,.15,1.1,6.4,.3,2.2,cr2);emit(B.box,f,0,.42,.7,5.2,.26,1.4,cr2);
    emit(B.cyl,f,0,12.2,-3,.06,1.6,.06,C('#d8d8d8'));
    for(let j=0;j<4;j++){const z=Math.sin(t*5-j*.9)*.05*(j+1);for(let i=0;i<3;i++)emit(B.box,f,.2+.3*j,12.8-.2*i,-3+z,.31,.205,.02,i?i>1?AZUL:BLANCO:ROJO);}
    emit(HITO.palacio,f,0,4.72,.06,5.6,.62,1,BLANCO);
  }else if(L===2){
    // el quincho: techo de paja a dos aguas sobre postes, parrilla humeando y mesa larga
    const paja=C('#c9a25a');
    emit(B.box,f,0,.1,-3,14,.2,8.4,C('#c9b08a'));
    for(const x of[-6,-2,2,6])for(const z of[-.2,-5.8])emit(B.cyl,f,x,1.7,z,.3,3.2,.3,MADERA);
    emitR(B.prism,f,0,4.6,-3,0,Math.PI/2,0,9.4,2.8,15,paja);emit(B.box,f,0,3.26,-3,15.2,.16,9.6,C('#a8813c'));
    emit(B.box,f,4.2,.7,1,1.7,1,.95,C('#3a3a40'));emit(U.box,f,4.2,1.22,1,1.5,.05,.75,C(((t*3)|0)%2?'#ff7a2a':'#ff5a1a'));
    for(let i=0;i<5;i++){const q=(t*.35+i*.2)%1;emitA(T.sph,f,4.2+Math.sin(q*5+i)*.3,1.5+q*3,1,.5+q*.9,.5+q*.9,.5+q*.9,C('#d8d8dc'),.34*(1-q));}
    emit(B.box,f,-1.6,.95,-2.6,5.4,.12,1.3,MADERA);for(const x of[-3.9,.7])emit(B.box,f,x,.5,-2.6,.14,.9,1.1,MADERA);
    for(const z of[-3.6,-1.6])emit(B.box,f,-1.6,.5,z,5.2,.1,.4,MADERA);
    emit(B.box,f,0,2.75,.2,5.6,1.2,.1,MADERA);emit(HITO.quincho,f,0,2.75,.27,5.3,1.0,1,BLANCO);
    emit(B.cyl,f,-6.9,2.4,.6,.07,4.6,.07,C('#d8d8d8'));for(let j=0;j<4;j++)emit(B.box,f,-6.7+.3*j,4.4,.6+Math.sin(t*5-j)*.05*(j+1),.31,.6,.02,C('#c8102e'));
  }else if(L===3){
    // el Banco Central: base con columnas y torre con fajas de ventanas
    emit(B.box,f,0,2.2,-3.5,16,4.4,7,CONC);for(let i=-5;i<=5;i++)emit(B.box,f,i*1.45,2.2,.1,.5,4.4,.5,C('#e4dfd3'));
    emit(B.box,f,0,4.6,.2,16.4,.5,.9,C('#e4dfd3'));
    emit(B.box,f,0,11.2,-4,7,13.6,6,C('#b9b4a8'));for(let j=0;j<7;j++)emit(B.box,f,0,5.8+j*1.75,-.96,6.4,.9,.1,noche?C('#ffd978'):C('#3a4a5c'));
    emit(HITO.bcp,f,0,5.55,.72,10,1.15,1,BLANCO);
    emit(B.box,f,0,1.5,.08,2.6,3,.1,C('#27343f'));
    emit(B.cyl,f,0,19,-4,.07,2.2,.07,C('#d8d8d8'));for(let j=0;j<4;j++){const z=Math.sin(t*5-j*.9)*.05*(j+1);for(let i=0;i<3;i++)emit(B.box,f,.2+.3*j,19.8-.2*i,-4+z,.31,.205,.02,i?i>1?AZUL:BLANCO:ROJO);}
  }else{
    // la torre del Grupo y, abajo, la puerta redonda de la bóveda
    emit(B.box,f,0,12,-4.5,9,24,7,C('#16323a'));
    for(let j=0;j<10;j++)for(let i=0;i<5;i++)if((i*7+j*13+i*j)%5<3)emit(U.box,f,(i-2)*1.6,7+j*1.5,-.97,1.1,.9,.06,C('#ffd978'));
    emit(U.box,f,0,22.6,-.9,9.1,1.6,.25,C(UV2));emit(HITO.grupo,f,0,22.6,-.75,7.6,1.2,1,BLANCO);
    emit(B.box,f,0,2.8,-1.4,13,5.6,4.4,C('#22282f'));
    emitR(B.cyl,f,0,2.7,.7,Math.PI/2,0,0,4.3,.5,4.3,C('#9aa4b0'));emit(B.tor,f,0,2.7,.98,4.5,4.5,3,C('#6a7480'));
    for(let k=0;k<4;k++)emitR(B.box,f,0,2.7,1.05,0,0,t*.6+k*Math.PI/4,2.6,.17,.12,C('#4a505a'));
    emit(B.sph,f,0,2.7,1.1,.6,.6,.3,C('#c9ced6'));emit(B.box,f,2.5,2.7,.8,.5,1.4,.4,C('#4a505a'));
    emit(HITO.boveda,f,0,6.0,.85,6,1.0,1,BLANCO);
  }
}

/* ---------- cielo ---------- */
function cielo(L){
  const p=S.PAL[L%S.PAL.length];
  pintarCielo((c,w,h,hf,asp)=>{
    const hy=h*hf,sx=w/V.W,sy=h/V.H;   // sx,sy: píxeles del lienzo por píxel de pantalla (el fondo se estira)
    let g=c.createLinearGradient(0,0,0,hy);g.addColorStop(0,p.sky[0]);g.addColorStop(1,p.sky[1]);
    c.fillStyle=g;c.fillRect(0,0,w,hy+1);c.fillStyle=p.haze;c.fillRect(0,hy,w,h-hy);
    const cx=w*.72,cy=hy*.4,R0=Math.min(V.horY*.2,30);
    c.save();c.translate(cx,cy);c.scale(sx,sy);
    if(p.noche){
      const R=rng(3);c.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<60;i++){c.beginPath();c.arc((R()-.72)*V.W,(R()-.4)*V.horY,R()*1.3+.4,0,TAU);c.fill();}
      g=c.createRadialGradient(0,0,0,0,0,R0*5);g.addColorStop(0,'rgba(255,250,220,.4)');g.addColorStop(1,'rgba(255,250,220,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,R0*5,0,TAU);c.fill();
      c.fillStyle='#fff8dc';c.beginPath();c.arc(0,0,R0,0,TAU);c.fill();
    }else{
      g=c.createRadialGradient(0,0,0,0,0,R0*7);g.addColorStop(0,'rgba(255,252,220,.95)');g.addColorStop(.14,'rgba(255,244,190,.5)');g.addColorStop(1,'rgba(255,244,190,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,R0*7,0,TAU);c.fill();
    }
    c.restore();
    // edificios lejanos, pálidos, pegados al horizonte
    const R=rng(7+L);let x=-6;
    while(x<w+6){const bw=10+R()*22,bh=hy*(.12+R()*.3);c.fillStyle=hexA(p.far,.42);c.fillRect(x,hy-bh,bw,bh+1);x+=bw+R()*4;}
    g=c.createLinearGradient(0,hy*.55,0,hy);g.addColorStop(0,hexA(p.haze,0));g.addColorStop(1,hexA(p.haze,.9));c.fillStyle=g;c.fillRect(0,hy*.55,w,hy*.45+1);
  });
}

/* ---------- armado ---------- */
export function crearEscenario(St){
  S=St;
  const soft=(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h);};
  FX.som=loteTx(64,64,soft,{suave:true,piso:true,cap:1500,orden:1,fijo:true});
  FX.luzPiso=loteTx(64,64,soft,{suave:true,suma:true,piso:true,cap:160,orden:1.5,fijo:true});
  FX.luz=loteTx(64,64,soft,{suave:true,suma:true,cap:260,orden:5,fijo:true});
  FX.anillo=loteTx(128,128,(c,w,h)=>{c.strokeStyle='#fff';c.lineWidth=12;c.beginPath();c.arc(w/2,h/2,w/2-10,0,TAU);c.stroke();c.globalAlpha=.25;c.fillStyle='#fff';c.beginPath();c.arc(w/2,h/2,w/2-10,0,TAU);c.fill();},{suave:true,piso:true,cap:48,orden:2,fijo:true});
  base.ver=baldosa();base.road=asfalto();
  lzVer=mk(384,384);lzRoad=mk(512,512);txVer=texLienzo(lzVer,true);txRoad=texLienzo(lzRoad,true);
  txRoad.repeat.set(1,LEN/6);txVer.repeat.set(14,LEN/4);
  const calle=new THREE.Mesh(new THREE.PlaneGeometry(TW*2,LEN),new THREE.MeshLambertMaterial({map:txRoad}));
  calle.rotation.x=-Math.PI/2;calle.position.set(0,0,-(LEN/2-ATRAS));scene.add(calle);
  const mv=new THREE.MeshLambertMaterial({map:txVer});
  for(const s of[-1,1]){const v=new THREE.Mesh(new THREE.PlaneGeometry(56,LEN),mv);v.rotation.x=-Math.PI/2;v.position.set(s*(TW+.2+28),VY,-(LEN/2-ATRAS));scene.add(v);}
  crearEdificios();
  const P=[[['DEVOLVÉ',.36,TINTA],['MI PLATA',.36,'#d52b1e']],[['¿Y EL',.34,TINTA],['REINTEGRO?',.3,'#d52b1e']],[['NO ERA',.36,TINTA],['DELIRIO',.38,'#d52b1e']],[['MI SALDO',.34,'#d52b1e'],['NO ES UN TIP',.26,TINTA]]];
  TXD.prot=P.map(L=>loteTx(320,184,pintaCartel(L,{borde:'#d52b1e',radio:.08}),{cap:16}));
  /* parodia de su aviso "2 de cada 3 paraguayos usan ueno": mismo verde, otra frase */
  TXD.aviso=loteTx(416,260,pintaCartel([['2 de cada 3',.24,'#ffffff','u'],['quieren',.24,UNG,'u'],['su plata',.24,UNG,'u']],{fondo:'ueno',borde:'#ffffff',radio:.08}),{cap:8});
  HITO.ueno=loteTx(512,144,pintaCartel([['ueno bank',.7,'#ffffff','u']],{fondo:'nada'}),{cap:2});
  HITO.cerrado=loteTx(384,160,pintaCartel([['CERRADO',.4,'#d52b1e'],['en resolución (BCP)',.2,TINTA,'u']],{fondo:'#fffbe6',borde:'nada',radio:.04}),{cap:2});
  HITO.palacio=loteTx(512,72,pintaCartel([['PALACIO DE LÓPEZ',.6,'#5a4a3a']],{fondo:'nada'}),{cap:2});
  HITO.quincho=loteTx(512,100,pintaCartel([['EL QUINCHO',.7,'#fff6e8']],{fondo:'nada'}),{cap:2});
  HITO.bcp=loteTx(768,90,pintaCartel([['BANCO CENTRAL DEL PARAGUAY',.62,'#3a4a5c']],{fondo:'nada'}),{cap:2});
  HITO.grupo=loteTx(640,104,pintaCartel([['GRUPO VÁZQUEZ',.7,'#ffffff','u']],{fondo:'nada'}),{cap:2,brilla:true});
  HITO.boveda=loteTx(512,90,pintaCartel([['LA BÓVEDA',.7,'#ffcf33']],{fondo:'nada'}),{cap:2,brilla:true});
}
export function nivelEscenario(L){
  nivel=L;const p=S.PAL[L%S.PAL.length],a=AMB[L%AMB.length],g=GT[L%GT.length];noche=!!p.noche;
  hemi.color.set(a.hs);hemi.groundColor.set(a.hg);hemi.intensity=a.hi;sol.color.set(a.sc);sol.intensity=a.si;sol.position.set(a.sp[0],a.sp[1],a.sp[2]);
  scene.fog.color.set(p.haze);
  for(const m of LETREROS)m.color.set(a.let);
  tenir(lzVer,base.ver,g.lc,g.la,g.dk);txVer.needsUpdate=true;tenir(lzRoad,base.road,g.pc,g.pa,g.dk);txRoad.needsUpdate=true;
  repintarFachadas();
  cielo(L);armarEdificios(L);armarDecor(L);
}
export function repintarFachadas(){
  const hora=nivel%5===4?2:nivel%5===3?1:0;
  EM.forEach((m,i)=>{const c=m.k.getContext('2d');c.setTransform(1,0,0,1,0,0);pintaFachada(c,m.w,m.h,TIPOS[i],hora);m.tex.needsUpdate=true;});
}
export function recielo(){cielo(nivel);}
export const esNoche=()=>noche;
export function dibEscenario(dist,len,t){
  const p=S.PAL[nivel%S.PAL.length],cord=C(p.edge);
  txRoad.offset.y=(dist/6)%1;txVer.offset.y=(dist/4)%1;
  for(const s of[-1,1])pon(B.box,s*(TW+.1),VY/2,LEN/2-ATRAS,.2,VY,LEN,cord);
  for(const e of edif){const z=((e.d0-dist)%PB+PB)%PB-ATRAS;pon(EB[e.t],e.side*(e.x+e.dep/2),e.h/2,z,e.dep,e.h,e.len,e.c);}
  dibDecor(dist,t);
  const hz=len+38-dist;if(hz<110)hito(nivel%5,hz,t);
}
