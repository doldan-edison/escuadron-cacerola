/* Dibujo de la partida en 3D. Lee el estado del juego (no lo cambia) y emite las piezas de cada cuadro.
   Encima del 3D hay un lienzo 2D transparente para lo que es texto: números, globos, carteles que suben. */
import {THREE,B,U,T,C,BLANCO,NEGRO,V,scene,iniciar,ajustar,camara,proj,vaciar,dibujar,emit,emitR,emitA,emitRA,pon,ponA,fset,fchild,fesc,marco,loteTx,rehacerTexturas,tinte,TAU,clamp,lerp,hexA} from './motor3d.js';
import {persona,jefe,SOLD,ENE,crearFiguras} from './figuras.js';
import {crearEscenario,nivelEscenario,dibEscenario,repintarFachadas,recielo,FX} from './escenario.js';
import {crearEscenas,armarEscenas,dibEscenas} from './escenas.js';
import {rr,ell,poly,txt,uTxt,uFondo,uMoneda,label,DISPLAY,TINTA,UV,UV3,UNG} from './dibujo2d.js';

export function crearRender(S){
  const {G,ants,bullets,parts,floats,soldiers,escapes,idos,ANT,LV,GAD,PCOL,TW,FAR,FUEGO,sqR,opText,opGood}=S;
  const cv=document.getElementById('cv'),ov=document.getElementById('ov'),o2=ov.getContext('2d');
  iniciar(cv);crearFiguras();crearEscenario(S);crearEscenas();

  const TXO={},f1=marco(),f2=marco(),pj={x:0,y:0,s:0,w:0},PA=[0,0],PB=[0,0];
  const AS=[];for(let i=0;i<4;i++)AS.push({ph:0,amp:0,lean:0,hop:0,roll:0,a0:null,a1:null,hx:0,hy:0,sq:1,sent:0,t:0});
  const HIELO=C('#a8e4ff'),FURIA=C('#ff2a10'),AZG=C('#2ea0ff'),ROG=C('#ff483c'),AZD=C('#0d4f9e'),ROD=C('#9e1c16'),POSTEB=C('#eeeae0'),LUZA=C('#9ad6ff'),ORO=C('#ffcf33'),
    VERDEU=C('#22c583'),VERDEO=C('#146542'),OSCU=C('#252529'),ROSAR=C('#f0508f'),ROSAC=C('#ff9cc4'),AMAR=C('#ffe14a'),PIZ=C('#27343f'),ROJOM=C('#ff2d23'),AMARR=C('#ffbe28');
  let camS=0,dpo=1;

  /* ---------- texturas de los objetos ---------- */
  TXO.volante=loteTx(96,128,(c,w,h)=>{
    c.fillStyle='#ffffff';c.strokeStyle='#8a94a6';c.lineWidth=4;c.fillRect(4,4,w-8,h-8);c.strokeRect(4,4,w-8,h-8);
    c.fillStyle='#d52b1e';c.fillRect(6,6,w-12,26);c.fillStyle='#0038a8';for(const y of[50,70,90])c.fillRect(18,y,y>80?40:60,9);
  },{cap:420,doble:true,fijo:true});
  TXO.onda=loteTx(128,128,(c,w,h)=>{
    c.scale(2,2);const g=c.createRadialGradient(32,40,2,32,36,30);g.addColorStop(0,'rgba(255,250,210,.55)');g.addColorStop(1,'rgba(255,220,90,0)');c.fillStyle=g;c.fillRect(0,0,64,64);
    c.lineCap='round';for(let i=0;i<3;i++){c.strokeStyle='rgba(255,'+(235-i*30)+','+(150-i*40)+','+(.95-i*.22)+')';c.lineWidth=5-i;c.beginPath();c.arc(32,44,10+i*9,-Math.PI*.82,-Math.PI*.18);c.stroke();}
  },{suave:true,cap:120,orden:4,fijo:true});
  /* reintegro falso: cupón con la pinta de los "ueno+" (delatan el "uen0" y el "REINTERGO") o un WhatsApp con link trucho */
  TXO.cupon=loteTx(340,204,(c,w,h)=>{
    const u=200;c.lineWidth=.05*u;c.strokeStyle=TINTA;c.fillStyle=uFondo(c,0,0,w,h);rr(c,5,5,w-10,h-10,.16*u);c.fill();c.stroke();
    c.save();rr(c,5,5,w-10,h-10,.16*u);c.clip();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=.03*u;c.beginPath();c.moveTo(-.1*u,h*.9);c.bezierCurveTo(w*.3,h*.4,w*.6,h*1.1,w*1.05,h*.35);c.stroke();c.restore();
    uTxt(c,'uen0+',.16*u,h*.2,.24*u,'#ffffff','left');uTxt(c,'REINTERGO',.16*u,h*.45,.17*u,UNG,'left');
    c.lineJoin='round';c.font='800 '+(.5*u|0)+'px Nunito,system-ui,sans-serif';c.textAlign='left';c.textBaseline='middle';c.lineWidth=.07*u;c.strokeStyle=UV3;c.strokeText('50%',.14*u,h*.75);c.fillStyle='#ffffff';c.fillText('50%',.14*u,h*.75);
    uMoneda(c,w*.8,h*.6,.2*u);
  },{cap:8,doble:true,brilla:true});
  TXO.wsp=loteTx(350,250,(c,w,hh)=>{
    const u=200,h=204;c.lineWidth=.05*u;c.strokeStyle=TINTA;c.lineJoin='round';c.fillStyle='#dcf8c6';
    c.beginPath();c.moveTo(w*.2,h-4);c.lineTo(w*.08,h+.2*u);c.lineTo(w*.38,h-4);c.closePath();c.fill();c.stroke();
    rr(c,5,5,w-10,h-10,.16*u);c.fill();c.stroke();c.fillRect(w*.21,h-12,w*.15,10);
    c.fillStyle='#25d366';c.beginPath();c.arc(w-.2*u,.2*u,.16*u,0,TAU);c.fill();c.stroke();
    uTxt(c,'uen0 te devuelve',w/2,h*.26,.17*u,UNG,'center',w*.74);uTxt(c,'¡COBRÁ YA!',w/2,h*.52,.25*u,UV3,'center',w*.86);
    uTxt(c,'uen0-devoluci0n.xyz',w/2,h*.77,.13*u,'#0b4a8a','center',w*.86);c.fillStyle='#0b4a8a';c.fillRect(w*.12,h*.86,w*.76,.02*u);
  },{cap:8,doble:true,brilla:true});
  function icono(c,k){
    c.fillStyle=c.strokeStyle='#141a33';c.lineWidth=1.8;c.lineCap='round';c.lineJoin='round';
    if(k==='squad'){c.beginPath();c.arc(-1.5,-3,2.8,0,TAU);c.fill();rr(c,-5.5,0,8,6.5,2.5);c.fill();c.beginPath();c.moveTo(5,-5);c.lineTo(5,0);c.moveTo(2.5,-2.5);c.lineTo(7.5,-2.5);c.stroke();}
    else if(k==='escudo'){c.beginPath();c.moveTo(-7,0);c.quadraticCurveTo(0,-9,7,0);c.closePath();c.fill();c.beginPath();c.moveTo(0,0);c.lineTo(0,5.5);c.quadraticCurveTo(0,7.5,-2.2,7);c.stroke();}
    else if(k==='bomba'){rr(c,-6,-1.5,12,7,2);c.fill();c.fillRect(-7.5,-3.5,15,2.2);c.beginPath();c.moveTo(6.5,1);c.lineTo(9,0);c.stroke();c.beginPath();c.moveTo(-3,-6.5);c.lineTo(-1,-4.5);c.moveTo(3,-6.5);c.lineTo(1,-4.5);c.stroke();}
    else if(k==='hielo'){rr(c,-5,-5.5,3.6,11,1.2);c.fill();rr(c,1.4,-5.5,3.6,11,1.2);c.fill();}
    else if(k==='dron'){rr(c,-6.5,-4,10,8,1.6);c.fill();c.beginPath();c.moveTo(3.5,-1.5);c.lineTo(7,-4);c.lineTo(7,4);c.lineTo(3.5,1.5);c.closePath();c.fill();c.fillStyle='#ff3b30';c.beginPath();c.arc(-3.6,-1.2,1.4,0,TAU);c.fill();}
    else{rr(c,-1.6,-6.5,3.2,8.5,1.4);c.fill();c.beginPath();c.arc(0,5,1.9,0,TAU);c.fill();}
  }
  TXO.ico={};
  for(const k in GAD)if(k!=='trampa')TXO.ico[k]=loteTx(128,128,(c,w,h)=>{
    c.fillStyle='#141a33';c.beginPath();c.arc(64,64,62,0,TAU);c.fill();c.fillStyle=GAD[k].col;c.beginPath();c.arc(64,64,53,0,TAU);c.fill();
    c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.ellipse(64,40,36,18,0,0,TAU);c.fill();
    c.translate(64,64);c.scale(5,5);icono(c,k);
  },{cap:12,fijo:true,brilla:true});
  /* portal: fondo oscuro, aro y brazos del remolino (se tiñen con el color del nivel) */
  TXO.hoyo=loteTx(256,256,(c,w,h)=>{const g=c.createRadialGradient(128,128,0,128,128,124);g.addColorStop(0,'#0b0420');g.addColorStop(.55,'#2a1060');g.addColorStop(.9,'rgba(70,40,150,.9)');g.addColorStop(1,'rgba(70,40,150,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},{suave:true,cap:4,orden:3,fijo:true});
  TXO.aro=loteTx(256,256,(c,w,h)=>{c.strokeStyle='#fff';c.lineWidth=13;c.beginPath();c.arc(128,128,116,0,TAU);c.stroke();},{suave:true,cap:8,orden:3.2,fijo:true});
  TXO.remolino=loteTx(256,256,(c,w,h)=>{
    c.lineCap='round';
    for(let a=0;a<4;a++){c.strokeStyle='rgba(255,255,255,'+(a%2?.6:.95)+')';c.lineWidth=13-a*1.5;c.beginPath();for(let i=0;i<=22;i++){const q=i/22,an=a*TAU/4+q*5.2,px=128+Math.cos(an)*110*q,py=128+Math.sin(an)*110*q;if(i)c.lineTo(px,py);else c.moveTo(px,py);}c.stroke();}
  },{suave:true,cap:8,orden:3.1,fijo:true});
  TXO.cruza=loteTx(128,128,(c,w,h)=>{
    c.fillStyle='#141a33';c.beginPath();c.arc(64,64,62,0,TAU);c.fill();c.fillStyle='#ffcf33';c.beginPath();c.arc(64,64,53,0,TAU);c.fill();
    c.strokeStyle='#141a33';c.lineWidth=10;c.lineCap='round';c.lineJoin='round';
    for(let q=-1;q<=1;q+=2){const y=64+q*16;c.beginPath();c.moveTo(64-q*27,y);c.lineTo(64+q*27,y);c.moveTo(64+q*12,y-12);c.lineTo(64+q*27,y);c.lineTo(64+q*12,y+12);c.stroke();}
  },{cap:8,doble:true,fijo:true,brilla:true});
  TXO.fuera=loteTx(256,64,(c,w,h)=>{c.fillStyle='#fffbe6';c.fillRect(0,4,w,h-8);txt(c,'FUERA DE SERVICIO',w/2,h/2+2,h*.5,'#d52b1e',w*.92);},{cap:12});
  TXO.ueno=loteTx(192,64,(c,w,h)=>{uTxt(c,'ueno',w/2,h/2+2,h*.9,'#ffffff');},{cap:12,brilla:true});
  TXO.calma=loteTx(192,112,(c,w,h)=>{c.fillStyle='#fff';c.strokeStyle=TINTA;c.lineWidth=6;c.beginPath();c.ellipse(w/2,h/2,w/2-5,h/2-5,0,0,TAU);c.fill();c.stroke();txt(c,'CALMA',w/2,h/2+3,h*.38,'#0038a8',w*.8);},{cap:24,doble:true,brilla:true});

  /* ---------- números de las puertas: una textura por texto, en placas sueltas ---------- */
  const ETQ=new Map(),PLQ=[],geoP=new THREE.PlaneGeometry(1,1);let nq=0;
  function etiqueta(o){
    const good=opGood(o),s=opText(o),key=(good?'b':o.t)+s;let tx=ETQ.get(key);
    if(!tx){
      const k=document.createElement('canvas');k.width=256;k.height=192;const c=k.getContext('2d'),dk=good?'#0d4f9e':'#9e1c16';
      label(c,s,128,good?100:78,s.length>3?88:112,'#fff',dk);
      if(!good)label(c,o.t==='d'?'CORRALITO':'COMISIÓN',128,160,34,'#ffe0dc',dk);   // las rojas dicen qué son
      tx=new THREE.CanvasTexture(k);tx.colorSpace=THREE.SRGBColorSpace;ETQ.set(key,tx);
    }
    return tx;
  }
  function placa(tx,x,y,gz,w,h){
    let m=PLQ[nq];
    if(!m){m=new THREE.Mesh(geoP,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,map:tx}));m.renderOrder=4;m.frustumCulled=false;scene.add(m);PLQ.push(m);}
    nq++;if(m.material.map!==tx)m.material.map=tx;m.visible=true;m.position.set(x,y,-gz);m.scale.set(w,h,1);
  }

  /* ---------- la marcha ---------- */
  function dibMarcha(t){
    const n=soldiers.length,R=sqR();if(!n)return;
    const won=G.phase==='won',wq=G.warp,fest=won&&!wq&&G.endT<1.2,fur=G.fx.furia>0,dj=t-(G.festT==null?-9:G.festT),a=AS[0];
    for(let i=0;i<n;i++){
      const p=soldiers[i],st=SOLD[i%SOLD.length],k=(.3+.7*p.sp)*(1-wq*.9)*1.1,x=lerp(G.x+(p.x-G.x)*1.22,0,wq),z=.35+(p.z-.35)*1.22;
      a.t=t+i*.7;a.ph=t*(fur?13:9.5)+i*1.3;a.amp=1;a.lean=fur?.14:.05;a.roll=0;a.a0=a.a1=null;a.hx=0;a.hy=0;a.sq=1;
      let hop=0,yaw=Math.PI;
      if(fest){hop=Math.abs(Math.sin(t*9+i))*.45;yaw=Math.PI+Math.sin(t*6+i)*.6;PA[0]=0;PA[1]=-2.7;PB[0]=0;PB[1]=2.7;a.a0=PA;a.a1=PB;}
      else if(dj>=0&&dj<.7)hop=Math.max(0,Math.sin(dj*10-i*.12))*.34*(1-dj/.7);   // saltito al pasar una puerta buena
      a.hop=hop+wq*1.6;
      persona(st,x,0,z,yaw,k,a,1);
      ponA(FX.som,x,.02,z,.62*k,1,.5*k,NEGRO,.26);
    }
    if(wq>.15)return;
    if(G.fx.escudo>0){
      // paraguas gigante sobre la marcha
      const d=(R+.75)*2,pul=1+Math.sin(t*6)*.03;
      ponA(T.hemi,G.x,1.05,.35,d*pul,d*.55*pul,d*pul,C('#7fe0ff'),.3);pon(B.cyl,G.x,1.0,.35,.05,2.0,.05,C('#8a94a6'));
      ponA(FX.anillo,G.x,.04,.35,d,1,d*.9,C('#bfeaff'),.55);
    }
    if(fur)ponA(FX.luzPiso,G.x,.05,.35,(R+1)*2.6,1,(R+1)*2.2,C('#ff7a1a'),.4+.12*Math.sin(t*10));
  }
  function dibDrones(t){
    if(G.fx.dron<=0||(G.fx.dron<2&&((t*8)|0)%2))return;   // parpadean cuando se están por ir
    const R=sqR();
    for(let d=-1;d<=1;d+=2){
      const x=clamp(G.x+d*(R+.9),-TW+.2,TW-.2),y=1.75+Math.sin(t*5+d)*.08,z=.9;
      fset(f1,x,y,z,Math.sin(t*2+d)*.25,1);
      emit(B.rbox,f1,0,0,0,.44,.16,.36,C('#f4f6fa'));emit(B.box,f1,0,.03,0,.84,.04,.06,PIZ);emit(B.box,f1,0,.03,0,.06,.04,.74,PIZ);emit(B.sph,f1,0,-.12,.08,.15,.15,.15,PIZ);
      for(const q of[[-.42,0],[.42,0],[0,-.37],[0,.37]])emitA(T.disc,f1,q[0],.07,q[1],.36,1,.36,BLANCO,.45);
      if(((t*3)|0)%2)emit(U.sph,f1,.12,.06,.17,.06,.06,.06,C('#ff3b30'));
      ponA(FX.som,x,.02,z,.6,1,.4,NEGRO,.2);
    }
  }

  /* ---------- clones y directivos ---------- */
  function dibClon(a,t,hielo){
    const A=ANT[a.type],E=ENE[a.type],an=AS[1],sc=E.sc*a.sz*1.12,ice=hielo&&!A.bar;
    an.t=t+a.ph;an.ph=ice?a.ph:t*A.walk*2.6+a.ph;an.amp=ice?0:1;an.lean=A.walk>3?.2:.04;an.hop=0;an.hx=-.4;an.sq=a.hit>0?1-a.hit*.12:1;
    let yaw=Math.atan2(G.x-a.x,a.z+3)*.8;if(A.zig)yaw+=Math.cos(t*3.2+a.ph)*.5;
    if(a.hit>0)tinte(BLANCO,a.hit*(A.bar?.2+.2*Math.sin(t*50+a.ph):.6));else if(ice)tinte(HIELO,.6);
    persona(E.st,a.x,0,a.z,yaw,sc,an,A.bar?(a.z<34?0:1):(a.z<20?1:2));
    tinte(null);
    ponA(FX.som,a.x,.02,a.z,sc*.72,1,sc*.55,NEGRO,.24);
  }
  /* clon espantado: sale corriendo por el costado con los brazos en alto y se le vuelan los papeles */
  function dibHuidas(t){
    const an=AS[2];
    for(const e of escapes){
      const z=e.d-G.dist;if(z<-2||z>FAR)continue;
      const E=ENE[e.type],q=clamp(1-e.t/.75,0,1);
      an.t=t;an.ph=e.t*26+e.ph;an.amp=1;an.lean=.3;an.hop=Math.abs(Math.sin(e.t*16))*.3;an.sq=1;an.hx=0;
      PA[0]=0;PA[1]=-2.6+Math.sin(e.t*30)*.4;PB[0]=0;PB[1]=2.6-Math.sin(e.t*30+1)*.4;an.a0=PA;an.a1=PB;
      persona(E.st,e.x,0,z,e.dir*Math.PI/2,E.sc*e.sz*1.12*(.3+.7*q),an,2);
      pon(U.box,e.x-e.dir*.5,.5+e.t*1.4,z+.1,.15,.2,.01,BLANCO,e.t*20);pon(U.box,e.x-e.dir*.9,.9-e.t*.5,z-.2,.15,.2,.01,BLANCO,e.t*14+2);
    }
    // vecinos que se dispersan: corren hacia atrás, a los costados
    for(const e of idos){
      const q=clamp(1-e.t/.9,0,1);
      an.t=t;an.ph=e.t*24+e.i;an.amp=1;an.lean=.25;an.hop=0;an.sq=1;an.a0=an.a1=null;
      persona(SOLD[e.i%SOLD.length],e.x,0,e.z,e.dir*2.2,1.1*(.25+.75*q),an,2);
    }
    an.a0=an.a1=null;
  }

  /* ---------- puertas, cajeros, regalos, portal ---------- */
  function dibPuerta(g,t){
    if(g.used||g.z>FAR+8)return;
    const h=2.4,z=g.z,cf=g.cruza&&g.cf>0?g.cf:0;
    for(let side=-1;side<=1;side+=2){
      const o=side<0?g.L:g.R,good=opGood(o),col=good?AZG:ROG,x0=side<0?-TW:.06,x1=side<0?-.06:TW,w=x1-x0;
      let xc=(x0+x1)/2;if(cf)xc=lerp(xc,-xc,cf*cf);   // recién cruzadas: llegan deslizándose desde el otro lado
      ponA(T.box,xc,h/2,z,w,h,.08,col,.4+.06*Math.sin(t*4+g.d+side));
      ponA(T.box,xc-w/2+.15+((t*.45+g.d*.13+(side>0?.5:0))%1)*(w-.3),h/2,z-.06,.22,h,.02,BLANCO,.16);
      pon(B.rbox,xc,h+.1,z,w-.1,.36,.26,good?AZD:ROD);
      ponA(FX.som,xc,.03,z,w*1.05,1,1.2,col,.32);
      const pop=1+Math.sin(t*4+g.d)*.035+(o.pop>0?o.pop*.25:0);
      placa(etiqueta(o),xc,h*.52,z-.14,w*.8*pop,w*.6*pop);
    }
    for(const px of[-TW,0,TW]){pon(B.cyl,px,(h+.3)/2,z,.2,h+.3,.2,POSTEB);pon(U.sph,px,h+.42,z,.32,.32,.32,px?LUZA:ORO);}
    if(g.cruza){
      // puerta que se cruza: ficha con dos flechas que gira cuando está por cambiar
      const ya=g.ct<.45&&z>7;
      fset(f1,0,h+1.05,z,ya?t*14:Math.sin(t*2)*.3,ya?1.25:1);emit(TXO.cruza,f1,0,0,0,.9,.9,1,BLANCO);
      if(cf)ponA(T.box,0,h/2,z-.1,TW*2,h,.02,BLANCO,cf*.5);
    }
  }
  /* cajero automático "fuera de servicio": se destraba a volantazos */
  function dibCajero(k,t){
    if(k.z>FAR+8)return;
    const hit=k.hit>0?k.hit:0;
    fset(f1,k.x,0,k.z,Math.sin(t*40)*hit*.05,1+hit*.05);
    if(hit)tinte(BLANCO,hit*.6);
    emit(B.rbox,f1,0,1.0,0,1.5,2.0,.9,VERDEU);emit(B.box,f1,0,1.38,.46,1.1,.64,.04,OSCU);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)emit(B.box,f1,-.2+i*.2,.86-j*.13,.47,.14,.09,.04,VERDEO);
    emit(B.box,f1,0,.38,.46,.8,.07,.03,OSCU);
    tinte(null);
    emit(TXO.ueno,f1,0,1.84,.47,.72,.24,1,BLANCO);emitR(TXO.fuera,f1,.12,.62,.5,0,0,-.18,1.2,.3,1,BLANCO);
    ponA(FX.som,k.x,.02,k.z,2.3,1,1.5,NEGRO,.3);
  }
  function dibRegalo(g,t){
    if(g.z>FAR+6)return;
    const bob=Math.sin(t*3.4+g.t)*.1;
    ponA(FX.som,g.x,.02,g.z,1.1,1,.6,NEGRO,.22);
    if(g.kind==='trampa'){
      const fl=.7+.3*Math.sin(t*12+g.t*3);
      ponA(FX.luz,g.x,1.05+bob,g.z,3.2,3.2,1,C('#7dff6a'),.5*fl);
      fset(f1,g.x,1.05+bob,g.z,Math.sin(t*2+g.t)*.35,1);
      if(((g.t*10)|0)%2)emit(TXO.cupon,f1,0,0,0,1.75,1.05,1,BLANCO);else emit(TXO.wsp,f1,0,0,0,1.75,1.25,1,BLANCO);
      return;
    }
    const col=C(GAD[g.kind].col);
    ponA(FX.luz,g.x,.8+bob,g.z,2.9,2.9,1,col,.5);
    fset(f1,g.x,.4+bob,g.z,t*1.6+g.t,1);
    emit(B.rbox,f1,0,.36,0,.84,.68,.84,ROSAR);emit(B.box,f1,0,.36,0,.86,.69,.18,AMAR);emit(B.box,f1,0,.36,0,.18,.69,.86,AMAR);
    emit(B.rbox,f1,0,.74,0,.92,.2,.92,ROSAC);emit(B.sph,f1,-.16,.93,0,.3,.2,.2,AMAR);emit(B.sph,f1,.16,.93,0,.3,.2,.2,AMAR);
    fset(f1,g.x,1.8+bob,g.z,0,1);emit(TXO.ico[g.kind],f1,0,0,0,.9,.9,1,BLANCO);
  }
  /* portal: óvalo con remolino. De ahí sale el jefe y por ahí se pasa al nivel siguiente. */
  function dibPortal(p,t,al){
    if(p.s<=.02)return;
    const rx=2.75*p.s,ry=3.5*p.s,cy=ry*.92+.1,col=C(p.col||PCOL[(G.level+1)%PCOL.length]),a=al==null?1:al,z=p.z;
    ponA(FX.som,0,.03,z,rx*2.4,1,rx*.9,col,.4*a);ponA(FX.luz,0,cy,z+.3,rx*4.2,ry*3.6,1,col,.4*a);
    fset(f1,0,cy,z,0,1);fesc(f1,rx*2,ry*2,1);
    emitA(TXO.hoyo,f1,0,0,0,1,1,1,BLANCO,a);
    fchild(f2,f1,0,0,.01,0,0,-t*2.6);emitA(TXO.remolino,f2,0,0,0,.95,.95,1,col,a);
    fchild(f2,f1,0,0,.02,0,0,t*1.7);emitA(TXO.remolino,f2,0,0,0,.66,.66,1,BLANCO,.55*a);
    emitA(TXO.aro,f1,0,0,.03,1.04,1.04,1,col,a);emitA(TXO.aro,f1,0,0,.04,.98,.98,1,BLANCO,.5*a);
    if(a>=1)for(let i=0;i<10;i++){const an=i*.63+t*(i%2?1.3:-1.1),q=.53+.06*Math.sin(t*3+i*1.7);emit(U.sph,f1,Math.cos(an)*q,Math.sin(an)*q,.05,.03,.024,.14,BLANCO);}
  }

  /* ---------- jefe y lo que tira ---------- */
  function dibJefe(b,t){
    if(b.state==='portal'||(b.state==='dead'&&b.st>1.5))return;
    const D=b.def;let sc=D.size*.72*(b.esc||1),x=b.x;
    if(b.state==='tele')x+=Math.sin(b.t*70)*.05;
    if(b.state==='dead')sc*=1-clamp((b.st-.5)/1,0,1)*.85;
    if(b.fur)tinte(FURIA,.2+.1*Math.sin(b.t*9));else if(b.hit>0)tinte(BLANCO,b.hit*(.1+.12*Math.sin(t*50)));
    jefe(LV[G.level].boss,b,x,b.z,sc);
    tinte(null);
    ponA(FX.som,x,.02,b.z,sc*.85,1,sc*.6,NEGRO,.3);
    if(b.fur&&b.state!=='dead')for(let i=0;i<4;i++){const q=(t*1.6+i/4)%1,sg=i%2?1:-1;ponA(T.sph,x+sg*sc*.2,sc*(1.02+q*.3),b.z,.3+q*.5,.3+q*.5,.3+q*.5,BLANCO,.5*(1-q));}
  }
  function dibTiro(s,t){
    if(s.t<0)return;
    const k=s.t/s.dur,y=Math.sin(k*Math.PI)*2.4+.5,col=C(s.col);
    ponA(FX.som,s.x,.02,s.z,.7,1,.4,NEGRO,.25);ponA(FX.luz,s.x,y,s.z,1.8,1.8,1,col,.5);
    fset(f1,s.x,y,s.z,s.t*5,1);
    switch(s.ico){
      case'error':emit(B.sph,f1,0,0,0,.7,.7,.7,C('#FA3E74'));for(const q of[-1,1]){emit(U.box,f1,0,.07,q*.33,.1,.3,.06,BLANCO);emit(U.box,f1,0,-.2,q*.32,.1,.1,.06,BLANCO);}break;
      case'tarjeta':emitR(B.rbox,f1,0,0,0,.4,0,0,.9,.58,.06,C('#2a5bd7'));emitR(B.box,f1,-.2,.02,0,.4,0,0,.2,.16,.08,ORO);break;
      case'panuelo':emitR(B.cone,f1,0,0,0,Math.PI,0,0,.85,.75,.14,C('#c8102e'));break;
      case'calma':fset(f1,s.x,y,s.z,Math.sin(s.t*7)*.4,1);emit(TXO.calma,f1,0,0,0,1.15,.67,1,BLANCO);break;
      default:emitR(B.box,f1,0,0,0,s.t*4,0,.3,.5,.66,.03,BLANCO);emitR(B.box,f1,0,0,0,s.t*4,0,.3,.36,.06,.05,C('#8a94a6'));
    }
    // marca roja donde va a caer
    const r=(.5+.5*k)*1.7;ponA(FX.anillo,s.tx,.04,.25,r,1,r,ROJOM,.35+.55*k);
  }
  function tramo(xa,za,xb,zb){
    const dx=xb-xa,dz=zb-za,l=Math.hypot(dx,dz);if(l<.01)return;const yw=Math.atan2(dz,dx),mx=(xa+xb)/2,mz=(za+zb)/2;
    pon(U.box,mx,.55,mz,l,.16,.16,AMARR,yw);pon(U.box,mx,.55,mz,l,.22,.06,C('#fffbe6'),yw);
  }
  function dibDisparos(t){
    for(const b of bullets){
      if(b.fl){
        // grito del megáfono: arcos de sonido que crecen y se apagan
        const q=clamp((b.z-b.z0)/FUEGO.r,0,1),w=.8+1.8*q;
        fset(f1,b.x,.55,b.z,0,1);emitRA(TXO.onda,f1,0,0,0,-1.15,0,0,w,w,1,BLANCO,1-q*q*.85);
      }else{
        // volante de reclamo: un papelito que gira en el aire
        fset(f1,b.x,.62+Math.sin(b.z*1.3+b.x*4)*.08,b.z,b.z*2.2+b.x*5,1);emitR(TXO.volante,f1,0,0,0,b.z*1.7,0,.4,.3,.4,1,BLANCO);
      }
    }
    // cacerolazo: descargas en zigzag
    for(const q of G.bolts){
      const p=q.p;let x0=p[0],z0=p[1];
      for(let i=2;i<p.length;i+=2){const x1=p[i],z1=p[i+1],mx=(x0+x1)/2+(Math.random()-.5)*.6,mz=(z0+z1)/2+(Math.random()-.5)*.6;tramo(x0,z0,mx,mz);tramo(mx,mz,x1,z1);x0=x1;z0=z1;}
    }
    let i=0;for(const p of parts){if(p.z<-3)continue;const s=p.r*2.4*(1-p.life/p.max*.6);pon(U.box,p.x,p.h+.06,p.z,s,s,s,C(p.col),p.life*9+(i++));}
  }

  /* ---------- lo que va escrito encima ---------- */
  const GLOBO={pena:['¡VAMOS A','ESTAR MEJOR!','#0038a8'],cartes:['ACOMPAÑAMOS','EL JUICIO','#c8102e'],vazquez:['SOLVENCIA','5,56 %','#d52b1e']};
  function pill(x,y,s,tag,col,oscuro,ico){
    const c=o2,fs=(tag.length>4?.36:.6)*s;c.font=Math.max(8,fs|0)+'px '+DISPLAY;
    const tw=c.measureText(tag).width,iw=ico?.5*s:0,bw=tw+iw+.5*s,bh=.82*s;
    c.fillStyle='#141a33';rr(c,x-bw/2-.05*s,y-bh/2-.05*s,bw+.1*s,bh+.1*s,bh*.5);c.fill();
    c.fillStyle=col;rr(c,x-bw/2,y-bh/2,bw,bh,bh*.45);c.fill();
    c.fillStyle='rgba(255,255,255,.28)';rr(c,x-bw/2+.1*s,y-bh/2+.06*s,bw-.2*s,bh*.3,bh*.15);c.fill();
    if(ico){const ix=x-bw/2+.36*s;c.fillStyle='#fff';c.beginPath();c.arc(ix,y-.14*s,.13*s,0,TAU);c.fill();rr(c,ix-.15*s,y+.02*s,.3*s,.26*s,.1*s);c.fill();}
    c.textAlign='center';c.textBaseline='middle';c.fillStyle=oscuro?'#141a33':'#fff';c.fillText(tag,x+iw/2,y+.03*s);
  }
  function encima(t){
    const c=o2;c.setTransform(dpo,0,0,dpo,0,0);c.clearRect(0,0,V.W,V.H);c.globalAlpha=1;
    // cajeros: cuánto aguantan y qué dan
    for(const k of G.crates){
      if(k.dead||k.z>FAR||k.z<-2)continue;
      proj(k.x,1.38,k.z-.5,pj);if(pj.w<1)continue;
      label(c,String(Math.max(1,Math.ceil(k.hp))),pj.x,pj.y,.46*pj.s,'#fff','#252529');
      proj(k.x,2.75+Math.sin(t*3+k.d)*.07,k.z,pj);
      if(k.rw==='squad')pill(pj.x,pj.y,pj.s,'+'+k.amt,'#2a9df4',false,true);else if(k.rw==='rate')pill(pj.x,pj.y,pj.s,'RITMO','#ffcf33',true);else pill(pj.x,pj.y,pj.s,'PRESIÓN','#ef4b3c');
    }
    // los grandes muestran cuánto aguante les queda
    for(const a of ants){
      const A=ANT[a.type];if(!A.bar||a.hp<=0||a.hp>=a.max||a.z>FAR||a.z<-1)continue;
      proj(a.x,ENE[a.type].sc*a.sz*1.26+.15,a.z,pj);const bw=pj.s*1.1,bh=Math.max(3,pj.s*.11);
      c.fillStyle='#141a33';c.fillRect(pj.x-bw/2-1.5,pj.y-1.5,bw+3,bh+3);c.fillStyle='#ef4b3c';c.fillRect(pj.x-bw/2,pj.y,bw*clamp(a.hp/a.max,0,1),bh);
    }
    const b=G.boss;
    if(b&&b.state!=='portal'){
      const D=b.def,key=LV[G.level].boss,L=GLOBO[key];
      if(L&&b.state!=='dead'&&(b.esc||1)>.9){
        // globo con lo que dice el jefe
        proj(b.x-D.size*.3,D.size*.8,b.z,pj);const k=pj.s*D.size/270,by=Math.sin(t*3)*3;
        c.save();c.translate(pj.x,pj.y);c.scale(k,k);c.lineJoin='round';c.fillStyle='#fff';c.strokeStyle='#141a33';c.lineWidth=4;
        c.beginPath();c.moveTo(26,by+19);c.lineTo(54,by+43);c.lineTo(16,by+25);c.closePath();c.fill();c.stroke();
        c.beginPath();c.ellipse(0,by,62,27,0,0,TAU);c.fill();c.stroke();
        txt(c,L[0],0,by-9,15,L[2],105);txt(c,L[1],0,by+10,15,L[2],105);c.restore();
      }
      if(b.state==='dead'&&b.st<3.2){
        // el cartel que levanta al irse: "¡RENUNCIO!" y compañía
        const st=b.st;proj(b.x,D.size*.5+Math.min(st,1.5)*.5,b.z,pj);
        const fs=Math.max(13,.95*pj.s),x=pj.x,yy=pj.y;c.font=(fs|0)+'px '+DISPLAY;const tw=c.measureText(D.fin).width+fs*1.1,th=fs*1.6;
        c.globalAlpha=clamp(st/.25,0,1)*clamp((3.2-st)/.6,0,1);
        c.fillStyle='#8a5a2b';c.fillRect(x-fs*.13,yy,fs*.26,th*1.6);
        c.fillStyle='#fff';c.strokeStyle='#141a33';c.lineWidth=Math.max(2,fs*.12);rr(c,x-tw/2,yy-th/2,tw,th,fs*.25);c.fill();c.stroke();
        label(c,D.fin,x,yy+fs*.06,fs,'#d52b1e','#fff');c.globalAlpha=1;
      }
    }
    // cuántos somos
    if(soldiers.length&&G.warp<.15){
      proj(G.x,2.5,.35,pj);const u=V.unit,s=String(G.N),fs=.62*u;c.font=(fs|0)+'px '+DISPLAY;
      const bw=Math.max(c.measureText(s).width+.5*u,1.1*u),bh=.84*u,x=pj.x,y=pj.y;
      c.fillStyle='#141a33';rr(c,x-bw/2,y-bh/2,bw,bh,bh/2);c.fill();c.strokeStyle='#ffcf33';c.lineWidth=Math.max(1.5,.05*u);c.stroke();
      c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff6e8';c.fillText(s,x,y+.03*u);
    }
    for(const f of floats){proj(f.x,f.h,f.z,pj);if(pj.w<1)continue;c.globalAlpha=clamp(1.6-f.life*1.6,0,1);label(c,f.txt,pj.x,pj.y,f.size*pj.s,f.col,'#141a33');}
    c.globalAlpha=1;
    if(G.warp>0){
      // entrada al portal: la pantalla se va a blanco con el color del portal en los bordes
      const col=PCOL[(G.level+1)%PCOL.length],g=c.createRadialGradient(V.cx,V.H*.45,0,V.cx,V.H*.45,Math.max(V.W,V.H)*.8);
      g.addColorStop(0,'rgba(255,255,255,'+G.warp.toFixed(2)+')');g.addColorStop(1,hexA(col,G.warp.toFixed(2)));c.fillStyle=g;c.fillRect(0,0,V.W,V.H);
    }
  }

  /* ---------- un cuadro ---------- */
  function render(){
    const t=G.t,b=G.boss,hielo=G.fx.hielo>0;
    vaciar();nq=0;
    // la cámara acompaña un poco a la marcha (y se pasea sola en la portada)
    const obj=G.x*.3+(G.auto?Math.sin(t*.23)*1.3:0);camS+=(obj-camS)*.1;
    camara(camS,G.shake>0?G.shake*.4:0);
    dibEscenas(G.dist,t);dibEscenario(G.dist,G.len,t);
    if(b&&b.state==='tele')ponA(T.box,b.lane,.04,(b.z-2.6)/2,b.def.hw*2,.02,b.z+2.6,C('#ff5a48'),.42+.2*Math.sin(t*24));
    for(const g of G.gates)dibPuerta(g,t);
    for(const k of G.crates)if(!k.dead)dibCajero(k,t);
    for(const g of G.gifts)dibRegalo(g,t);
    for(const s of G.shots)dibTiro(s,t);
    if(G.portal)dibPortal(G.portal,t);
    if(b)dibJefe(b,t);
    for(const a of ants)if(a.hp>0&&a.z<=FAR+6&&a.z>-2.6)dibClon(a,t,hielo);
    dibHuidas(t);dibDisparos(t);
    if(G.llega>0)dibPortal({z:.1,s:.35+.5*(1-G.llega),col:PCOL[G.level%PCOL.length]},t,clamp(G.llega,0,1));   // llegada por el portal al empezar el nivel
    dibMarcha(t);dibDrones(t);
    if(G.boom>0){
      // cacerolazo general: ondas de ruido que se abren desde la marcha
      const q=1-G.boom,r=2+q*34;ponA(FX.anillo,G.x,.05,.35,r,1,r,C('#ffe066'),G.boom);ponA(FX.anillo,G.x,.06,.35,r*.7,1,r*.7,C('#fffadc'),G.boom*.8);
    }
    for(let i=nq;i<PLQ.length;i++)PLQ[i].visible=false;
    dibujar();encima(t);
  }
  function resize(){
    ajustar(cv);
    dpo=Math.min(window.devicePixelRatio||1,2);ov.width=Math.round(V.W*dpo);ov.height=Math.round(V.H*dpo);
    recielo();
  }
  return{
    render,resize,
    nivel(L){nivelEscenario(L);armarEscenas(L,G.len);camS=0;},
    fuentes(){rehacerTexturas();repintarFachadas();for(const t of ETQ.values())t.dispose();ETQ.clear();},
    lento(){if(V.ql<3){V.ql++;ajustar(cv);return true;}return false;},
    get unit(){return V.unit;},
    /* píxel horizontal de la pantalla → x del juego, a la altura de la marcha */
    aMundo(px){return(px-V.cx)/V.unit+V.camX;}
  };
}
