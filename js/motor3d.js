/* Motor 3D: three.js por debajo y, encima, dibujo "inmediato" por lotes.
   En cada cuadro se vacían los lotes y se vuelve a emitir todo (cajas, esferas, cápsulas…): así el dibujo sale
   directo del estado del juego, igual que antes con el lienzo 2D, y miles de piezas cuestan pocas llamadas.
   Coordenadas del juego: x a lo ancho de la calle, gz hacia adelante, y hacia arriba. En three es (x, y, -gz),
   con la cámara atrás y arriba de la marcha, mirando hacia adelante. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
export {THREE};
export const TAU=Math.PI*2;
export const clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const lerp=(a,b,t)=>a+(b-a)*t;
export function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function hexA(h,a){const n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')';}

/* ---------- vista ---------- */
/* unit = píxeles por unidad a la altura de la marcha · foc = distancia focal en píxeles · horY = dónde cae el horizonte */
export const V={W:320,H:560,dpr:1,unit:40,cx:160,foc:400,horY:70,camX:0,camY:6,camBack:8,ql:1};
export let gl=null,scene=null,cam=null,hemi=null,sol=null;
const FOV=58,PITCH=.4,ELEV=.7,TH=Math.tan(FOV*Math.PI/360);
const VP=new THREE.Matrix4(),pe=VP.elements;
const LOTES=[],REHACER=[];
export const B={},U={},T={},GEO={};   // lotes con luz · sin luz · translúcidos · geometrías
export const LETREROS=[];             // materiales sin luz (carteles): cada nivel los tiñe según la hora

/* ---------- colores (se guardan ya convertidos al espacio lineal de three) ---------- */
const CC=new Map(),tc=new THREE.Color();
export function C(h){let c=CC.get(h);if(!c){tc.set(h);c=new Float32Array([tc.r,tc.g,tc.b]);CC.set(h,c);}return c;}
export const BLANCO=C('#ffffff'),NEGRO=C('#000000');

/* ---------- marcos: rotación+escala 3×3 (por filas) y posición. Reemplazan al árbol de objetos de three ---------- */
export const marco=()=>new Float32Array(12);
/* marco suelto en el mundo: posición del juego, giro sobre el eje vertical y escala pareja */
export function fset(o,x,y,gz,yaw,s){
  const c=Math.cos(yaw)*s,n=Math.sin(yaw)*s;
  o[0]=c;o[1]=0;o[2]=n;o[3]=0;o[4]=s;o[5]=0;o[6]=-n;o[7]=0;o[8]=c;o[9]=x;o[10]=y;o[11]=-gz;return o;
}
/* hijo: o = p · mover(x,y,z) · girar(ry, después rx, después rz). o puede ser el mismo p. */
export function fchild(o,p,x,y,z,rx,ry,rz){
  const a=p[0],b=p[1],c=p[2],d=p[3],e=p[4],f=p[5],g=p[6],h=p[7],i=p[8];
  const tx=a*x+b*y+c*z+p[9],ty=d*x+e*y+f*z+p[10],tz=g*x+h*y+i*z+p[11];
  if(!rx&&!ry&&!rz){o[0]=a;o[1]=b;o[2]=c;o[3]=d;o[4]=e;o[5]=f;o[6]=g;o[7]=h;o[8]=i;}
  else{
    const cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
    const r0=cy*cz+sy*sx*sz,r1=-cy*sz+sy*sx*cz,r2=sy*cx,r3=cx*sz,r4=cx*cz,r5=-sx,r6=-sy*cz+cy*sx*sz,r7=sy*sz+cy*sx*cz,r8=cy*cx;
    o[0]=a*r0+b*r3+c*r6;o[1]=a*r1+b*r4+c*r7;o[2]=a*r2+b*r5+c*r8;
    o[3]=d*r0+e*r3+f*r6;o[4]=d*r1+e*r4+f*r7;o[5]=d*r2+e*r5+f*r8;
    o[6]=g*r0+h*r3+i*r6;o[7]=g*r1+h*r4+i*r7;o[8]=g*r2+h*r5+i*r8;
  }
  o[9]=tx;o[10]=ty;o[11]=tz;return o;
}
export function fesc(f,sx,sy,sz){f[0]*=sx;f[3]*=sx;f[6]*=sx;f[1]*=sy;f[4]*=sy;f[7]*=sy;f[2]*=sz;f[5]*=sz;f[8]*=sz;return f;}
export function fpt(f,x,y,z,o){o[0]=f[0]*x+f[1]*y+f[2]*z+f[9];o[1]=f[3]*x+f[4]*y+f[5]*z+f[10];o[2]=f[6]*x+f[7]*y+f[8]*z+f[11];return o;}
export function fcopia(o,p){for(let i=0;i<12;i++)o[i]=p[i];return o;}

/* ---------- emitir piezas ---------- */
let tk=0,tr=1,tg=1,tb=1;
/* tinte para todo lo que se emita después (golpe en blanco, congelado, furia). tinte() lo apaga. */
export function tinte(c,k){if(!c||!(k>0)){tk=0;return;}tk=k>1?1:k;tr=c[0];tg=c[1];tb=c[2];}
/* pieza = marco · mover(x,y,z) · escalar(sx,sy,sz). Las geometrías miden 1 de lado, centradas. */
export function emit(b,f,x,y,z,sx,sy,sz,c){
  const n=b.n;if(n>=b.cap)return-1;b.n=n+1;
  const a=b.arr,i=n*16;
  a[i]=f[0]*sx;a[i+1]=f[3]*sx;a[i+2]=f[6]*sx;a[i+3]=0;
  a[i+4]=f[1]*sy;a[i+5]=f[4]*sy;a[i+6]=f[7]*sy;a[i+7]=0;
  a[i+8]=f[2]*sz;a[i+9]=f[5]*sz;a[i+10]=f[8]*sz;a[i+11]=0;
  a[i+12]=f[0]*x+f[1]*y+f[2]*z+f[9];a[i+13]=f[3]*x+f[4]*y+f[5]*z+f[10];a[i+14]=f[6]*x+f[7]*y+f[8]*z+f[11];a[i+15]=1;
  const q=b.col,j=n*3;
  if(tk){q[j]=c[0]+(tr-c[0])*tk;q[j+1]=c[1]+(tg-c[1])*tk;q[j+2]=c[2]+(tb-c[2])*tk;}else{q[j]=c[0];q[j+1]=c[1];q[j+2]=c[2];}
  return n;
}
export function emitA(b,f,x,y,z,sx,sy,sz,c,al){const n=emit(b,f,x,y,z,sx,sy,sz,c);if(n>=0&&b.ala)b.ala[n]=al;return n;}
const fT=marco(),fW=marco();
/* igual, pero la pieza además gira sobre sí misma */
export function emitR(b,f,x,y,z,rx,ry,rz,sx,sy,sz,c){fchild(fT,f,x,y,z,rx,ry,rz);return emit(b,fT,0,0,0,sx,sy,sz,c);}
export function emitRA(b,f,x,y,z,rx,ry,rz,sx,sy,sz,c,al){fchild(fT,f,x,y,z,rx,ry,rz);return emitA(b,fT,0,0,0,sx,sy,sz,c,al);}
/* pieza suelta en el mundo, sin marco padre */
export function pon(b,x,y,gz,sx,sy,sz,c,yaw){fset(fW,x,y,gz,yaw||0,1);return emit(b,fW,0,0,0,sx,sy,sz,c);}
export function ponA(b,x,y,gz,sx,sy,sz,c,al,yaw){fset(fW,x,y,gz,yaw||0,1);return emitA(b,fW,0,0,0,sx,sy,sz,c,al);}

/* ---------- lotes ---------- */
export function lote(geo,mat,cap,orden){
  const m=new THREE.InstancedMesh(geo,mat,cap);m.frustumCulled=false;m.count=0;m.visible=false;m.renderOrder=orden||0;
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const ic=new THREE.InstancedBufferAttribute(new Float32Array(cap*3).fill(1),3);ic.setUsage(THREE.DynamicDrawUsage);m.instanceColor=ic;
  scene.add(m);
  const b={m,n:0,cap,arr:m.instanceMatrix.array,col:ic.array,al:null,ala:null};LOTES.push(b);return b;
}
/* lote con transparencia propia por pieza (atributo iA) */
function loteA(geo,mat,cap,orden){
  const g=geo.clone(),al=new THREE.InstancedBufferAttribute(new Float32Array(cap).fill(1),1);al.setUsage(THREE.DynamicDrawUsage);g.setAttribute('iA',al);
  const b=lote(g,mat,cap,orden);b.al=al;b.ala=al.array;return b;
}
function alfa(mat){
  mat.onBeforeCompile=sh=>{
    sh.vertexShader='attribute float iA;\nvarying float vA;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvA=iA;');
    sh.fragmentShader='varying float vA;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=vA;');
  };
  return mat;
}
/* Lote de planos con una textura pintada en un lienzo (cartel, pantalla, brillo).
   o: cap · suave (bordes transparentes y alfa por pieza) · suma (mezcla aditiva) · piso (acostado) · doble (dos caras) · luz · fijo (no se repinta con las letras) */
export function loteTx(w,h,pinta,o){
  o=o||{};
  const k=document.createElement('canvas');k.width=w;k.height=h;
  const tex=new THREE.CanvasTexture(k);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  const re=()=>{const c=k.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.save();pinta(c,w,h);c.restore();tex.needsUpdate=true;};
  re();if(!o.fijo)REHACER.push(re);
  const geo=o.piso?GEO.piso:GEO.plane;
  let mat,b;
  if(o.suave){
    mat=alfa(new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:o.suma?THREE.AdditiveBlending:THREE.NormalBlending}));
    b=loteA(geo,mat,o.cap||32,o.orden||3);
  }else{
    mat=new (o.luz?THREE.MeshLambertMaterial:THREE.MeshBasicMaterial)({map:tex,alphaTest:.4,alphaToCoverage:true,side:o.doble?THREE.DoubleSide:THREE.FrontSide});
    if(!o.luz&&!o.brilla)LETREROS.push(mat);
    b=lote(geo,mat,o.cap||32,0);
  }
  b.tex=tex;b.mat=mat;b.re=re;return b;
}
/* textura suelta desde un lienzo (suelo, fachadas) */
export function texLienzo(k,rep){const t=new THREE.CanvasTexture(k);t.colorSpace=THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;}t.anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy());return t;}
export function rehacerTexturas(){for(const r of REHACER)r();}

export function vaciar(){for(const b of LOTES)b.n=0;tk=0;}
function subir(){
  for(const b of LOTES){
    const m=b.m,n=b.n;m.count=n;m.visible=n>0;if(!n)continue;
    let a=m.instanceMatrix;a.clearUpdateRanges();a.addUpdateRange(0,n*16);a.needsUpdate=true;
    a=m.instanceColor;a.clearUpdateRanges();a.addUpdateRange(0,n*3);a.needsUpdate=true;
    if(b.al){a=b.al;a.clearUpdateRanges();a.addUpdateRange(0,n);a.needsUpdate=true;}
  }
}
export function dibujar(){subir();gl.render(scene,cam);}

/* ---------- geometrías ---------- */
/* caja de 1×1×1 con las aristas redondeadas (r) y normales suaves */
function rboxGeo(r,seg){
  const g=new THREE.BoxGeometry(1,1,1,seg,seg,seg),p=g.attributes.position,n=g.attributes.normal,h=.5-r;
  const m=c=>{const a=Math.abs(c)*2;return Math.sign(c)*(a<=.5?h*a*2:h+(a-.5)*2*r);};
  for(let i=0;i<p.count;i++){
    const x=m(p.getX(i)),y=m(p.getY(i)),z=m(p.getZ(i)),qx=clamp(x,-h,h),qy=clamp(y,-h,h),qz=clamp(z,-h,h);
    let dx=x-qx,dy=y-qy,dz=z-qz;const l=Math.hypot(dx,dy,dz);
    if(l>1e-6){dx/=l;dy/=l;dz/=l;p.setXYZ(i,qx+dx*r,qy+dy*r,qz+dz*r);n.setXYZ(i,dx,dy,dz);}else p.setXYZ(i,x,y,z);
  }
  return g;
}
function facetas(g){const q=g.toNonIndexed();q.computeVertexNormals();return q;}
function prismGeo(){const s=new THREE.Shape();s.moveTo(-.5,-.5);s.lineTo(.5,-.5);s.lineTo(0,.5);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);return g;}

function crearLotes(){
  const matL=new THREE.MeshLambertMaterial(),matU=new THREE.MeshBasicMaterial();
  const matT=alfa(new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}));
  Object.assign(GEO,{
    box:new THREE.BoxGeometry(1,1,1),rbox:rboxGeo(.2,4),rboxH:rboxGeo(.16,8),
    sph:new THREE.SphereGeometry(.5,12,8),sphH:new THREE.SphereGeometry(.5,24,16),
    hemi:new THREE.SphereGeometry(.5,12,5,0,TAU,0,Math.PI/2),
    cap:new THREE.CapsuleGeometry(.25,.5,3,8),cyl:new THREE.CylinderGeometry(.5,.5,1,12),cone:new THREE.ConeGeometry(.5,1,12),
    pyr:facetas(new THREE.ConeGeometry(.7071,1,4).rotateY(Math.PI/4)),prism:prismGeo(),
    tor:new THREE.TorusGeometry(.5,.07,6,20),disc:new THREE.CircleGeometry(.5,20).rotateX(-Math.PI/2),
    plane:new THREE.PlaneGeometry(1,1),piso:new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2)
  });
  const capL={box:7000,rbox:1600,rboxH:160,sph:7000,sphH:160,hemi:1600,cap:4500,cyl:1800,cone:400,pyr:64,prism:64,tor:400};
  for(const k in capL)B[k]=lote(GEO[k],matL,capL[k],0);
  const capU={box:1000,sph:700,cyl:200,tor:64,cone:64};
  for(const k in capU)U[k]=lote(GEO[k],matU,capU[k],0);
  const capT={box:300,sph:80,hemi:16,cyl:80,disc:160,tor:32};
  for(const k in capT)T[k]=loteA(GEO[k],matT,capT[k],2);
}

/* ---------- arranque, tamaño y cámara ---------- */
const cieloLz=document.createElement('canvas');cieloLz.width=512;cieloLz.height=512;
let cieloTx=null;
export function iniciar(cv){
  gl=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
  scene=new THREE.Scene();scene.fog=new THREE.Fog(0xdfe9f2,40,100);
  cam=new THREE.PerspectiveCamera(FOV,1,.5,460);
  hemi=new THREE.HemisphereLight(0xffffff,0xb0a898,2.1);scene.add(hemi);
  sol=new THREE.DirectionalLight(0xfff4d6,2.2);sol.position.set(-5,12,6);scene.add(sol);
  cieloTx=new THREE.CanvasTexture(cieloLz);cieloTx.colorSpace=THREE.SRGBColorSpace;scene.background=cieloTx;
  crearLotes();
}
/* el cielo es un fondo fijo: fn(c, ancho, alto, fracción del alto donde cae el horizonte, proporción de la pantalla) */
export function pintarCielo(fn){const c=cieloLz.getContext('2d');c.setTransform(1,0,0,1,0,0);fn(c,512,512,V.horY/V.H,V.W/V.H);cieloTx.needsUpdate=true;}
export function ajustar(cv){
  const r=cv.getBoundingClientRect();V.W=Math.max(200,r.width);V.H=Math.max(200,r.height);
  V.dpr=Math.min(window.devicePixelRatio||1,2)/(V.ql>2?2:V.ql>1?1.4:1);
  gl.setPixelRatio(V.dpr);gl.setSize(V.W,V.H,false);
  const asp=V.W/V.H,co=Math.cos(ELEV-PITCH);
  // en pantallas angostas la cámara se aleja para que la calle entre de lado a lado
  const dist=Math.max(9.4,8.3/(2*TH*asp*co));
  V.camY=dist*Math.sin(ELEV);V.camBack=dist*Math.cos(ELEV)-.35;
  cam.aspect=asp;cam.fov=FOV;cam.rotation.set(-PITCH,0,0);cam.updateProjectionMatrix();
  V.foc=V.H/(2*TH);V.unit=V.foc/(dist*co);V.cx=V.W/2;V.horY=V.H*(.5-.5*Math.tan(PITCH)/TH);
  scene.fog.near=V.camBack+50;scene.fog.far=V.camBack+93;
  camara(V.camX,0);
}
export function camara(x,tem){
  V.camX=x;
  cam.position.set(x+(tem?(Math.random()-.5)*tem:0),V.camY+(tem?(Math.random()-.5)*tem:0),V.camBack);
  cam.updateMatrixWorld();VP.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
}
/* punto del mundo → píxeles de pantalla. o.s = píxeles por unidad a esa distancia (para escalar textos). */
export function proj(x,y,gz,o){
  const z=-gz,w=pe[3]*x+pe[7]*y+pe[11]*z+pe[15];
  o.w=w;o.x=((pe[0]*x+pe[4]*y+pe[8]*z+pe[12])/w*.5+.5)*V.W;o.y=(.5-(pe[1]*x+pe[5]*y+pe[9]*z+pe[13])/w*.5)*V.H;o.s=V.foc/w;return o;
}
