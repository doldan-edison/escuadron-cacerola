/* Escuadrón Cacerola — reglas del juego, sonido, menús y controles.
   El dibujo es 3D y va aparte: render3d.js (la partida), figuras.js (muñecos), escenario.js (calle y edificios),
   escenas.js (lo que pasa a los costados) y motor3d.js (three.js por lotes). Acá no se dibuja nada. */
import {crearRender} from './render3d.js';
const $=id=>document.getElementById(id);
const cv=$('cv');
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* ---------- medidas ---------- */
const TW=3,FAR=80,VSCROLL=7,BSPD=46,BRANGE=22,MAXVIS=56,MAXN=400;
let R3=null;   // el dibujante 3D; se crea al final, cuando ya existe el estado

/* ---------- enemigos: clones de Santi y directivos del Grupo ---------- */
/* Cómo se ve cada uno está en figuras.js (tabla ENE, en este mismo orden):
   0 clon de Santi · 1 clon "¡calma!" · 2 directivo del Grupo · 3 Santi hincha, con la albirroja (zigzag) ·
   4 vocero (tira comunicados) · 5 director blindado · 6 mega-directivo
   dice = lo que grita al irse: 's' frases de Santi, 'd' frases de directivo. */
const ANT=[
  {dice:'s',hp:1,w:.66,walk:2.2,bite:1,body:'#22325e'},
  {dice:'s',hp:.8,w:.6,walk:4.3,bite:1,body:'#4a5568'},
  {dice:'d',hp:9,w:1.12,walk:1.7,bite:3,body:'#2b2f36'},
  {dice:'s',hp:.9,w:.62,walk:3.7,bite:1,zig:1.6,body:'#e23a2e'},
  {dice:'d',hp:2.5,w:.78,walk:2.2,bite:1,spit:1,body:'#2f8a2a'},
  {dice:'d',hp:30,w:1.3,walk:1.4,bite:5,gift:1,bar:1,body:'#5a7896'},
  {dice:'d',hp:140,w:1.8,walk:1,bite:12,biteF:.25,gift:1,bar:1,body:'#15181f'}
];
const DICE={
  s:['¡Vamos a estar mejor!','¡Vamos a estar mejor!','¡Calma y prudencia!','¡El sistema es sólido!','¡Tip de ahorro!','¡Ya vendí mis acciones!','¡No fui yo!','¡Me voy!'],
  d:['¡Delirio colectivo!','¡Era una promo!','¡Yo solo firmaba!','¡Me voy!']
};

/* ---------- jefes ---------- */
/* fin = cartel que levanta al irse · ico = lo que tira · img = retrato de Flow (se muestra al aparecer).
   El muñeco de cada uno está en figuras.js. Los números son los del juego original, por nivel (mismo equilibrio). */
const BOSS={
  app:{name:'La App Caída de ueno',fin:'¡Reiniciando…!',img:null,size:6.6,hw:1.45,adv:.3,sway:.55,cd:3.2,tele:1,cf:.2,sk:2,sum:6,sumType:0,shot:'#FA3E74',ico:'error',atk:['charge','summon','charge']},
  pena:{name:'Santi Peña, el Ex Accionista',fin:'¡RENUNCIO!',img:'arte/jefe-pena.webp',size:7.4,hw:1.35,adv:.3,sway:.9,cd:2.9,tele:.95,cf:.2,sk:2,sum:8,sumType:1,shot:'#ffffff',ico:'calma',atk:['spit3','summon','spit3','charge']},
  cartes:{name:'Horacio Cartes, el Patrón',fin:'¡Le solté la mano!',img:'arte/jefe-cartes.webp',size:7.6,hw:1.2,adv:.34,sway:1.5,cd:2.5,tele:.72,cf:.22,sk:3,sum:8,sumType:1,shot:'#c8102e',ico:'panuelo',atk:['charge','charge','spit1','summon']},
  carvallo:{name:'Carlos Carvallo, el Banquero Giratorio',fin:'¡RENUNCIO!',img:'arte/jefe-carvallo.webp',size:7.4,hw:1.5,adv:.32,sway:.8,cd:2.5,tele:.85,cf:.24,sk:3,sum:6,sumType:2,shot:'#f4f4f4',ico:'papel',atk:['spit5','charge','summon','spit3']},
  vazquez:{name:'Miguel Vázquez, el Dueño',fin:'¡Intervenido!',img:'arte/jefe-vazquez.webp',size:8,hw:1.6,adv:.28,sway:.6,cd:2.3,tele:.85,cf:.25,sk:3,sum:10,sumType:0,shot:'#5aa0ff',ico:'tarjeta',atk:['summonBig','spit5','charge','summon','spit3','charge']}
};

/* ---------- niveles ---------- */
/* Colores por nivel: de la mañana en la sucursal a la noche frente al Congreso. edge = cordón de la vereda. */
const PAL=[
  {sky:['#7fc4f5','#d8efff'],haze:'#dfe9f2',lawn:['#bdb8ae','#8e8a83'],path:'#4f5258',edge:'#e4dfd3',far:'#6f7f95'},
  {sky:['#5fb4f0','#cfeaff'],haze:'#ece6d8',lawn:['#c8b9a0','#9a8a72'],path:'#55575c',edge:'#eadbb8',far:'#8a7f9a'},
  {sky:['#8fb3d9','#e4ecf5'],haze:'#d6dde6',lawn:['#a8b0b8','#7d858d'],path:'#4a4d52',edge:'#d6dce3',far:'#5d6f86'},
  {sky:['#ff9e7a','#ffd7a8'],haze:'#ffd2b0',lawn:['#b89a86','#8a6e5c'],path:'#4d4a4c',edge:'#e0c6ae',far:'#7a5a6a'},
  {sky:['#141a40','#5a3a7a'],haze:'#6a5a8a',lawn:['#5f5a6e','#3e3a4c'],path:'#3a3b44',edge:'#a8a4b6',far:'#2a2440',noche:1}
];
/* g = par de puertas (la primera es la buena), w = oleada, c = caja.
   El tamaño de cada oleada, la vida de las cajas y la del jefe se calculan solos a partir del
   escuadrón que tendría alguien que elige bien: press = qué tan cerca del límite queda. */
/* Además: r = regalo (se agarra pasando por encima; 'trampa' es un reintegro falso), t = un regalo de verdad y un reintegro
   falso lado a lado, G = mega-clon, y una puerta con 'x' cruza sus mitades cada tanto.
   Dificultad por nivel: merced = hasta cuánto se achica la vida enemiga si venís con poco escuadrón (1 = nada),
   zig = parte de las rojas que va en zigzag, esc = escupidoras por oleada, sk = bajas por escupitajo,
   acz = acorazadas por oleada, furia = vida del jefe a la que se enfurece. */
const LV=[
  {name:'La Sucursal de ueno',boss:'app',hp:1,press:.36,merced:.5,cap:140,bossT:15,script:[
    ['g','+4','+1'],['w'],['g','+6','-2'],['w'],['c','squad',6],['g','x2','+3'],['w'],['r','furia'],['g','+10','-6'],['w'],['c','rate'],['g','x2','/2'],['w']]},
  {name:'El Palacio de López',boss:'pena',hp:1.5,press:.62,merced:.55,zig:.5,cap:160,bossT:20,script:[
    ['g','+5','+2'],['w'],['g','x2','+4'],['w'],['c','squad',8],['r','escudo'],['g','+8','-4'],['w'],['g','x2','-8'],['c','dmg'],['w'],['t','squad'],['g','+12','/2'],['w'],['g','x2','/3'],['w']]},
  {name:'El Quincho',boss:'cartes',hp:2.2,press:.78,merced:.65,zig:.6,esc:2,sk:2,furia:.4,cap:180,bossT:22,script:[
    ['g','+6','-1'],['w'],['g','x3','+5'],['w'],['c','rate'],['r','hielo'],['g','+8','-6'],['w'],['g','x2','/2'],['c','squad',15],['w'],['t','bomba'],['g','-3','-12'],['w'],['g','x2','/3'],['w'],['r','furia'],['g','+20','-15'],['w']]},
  {name:'El Banco Central',boss:'carvallo',hp:3,press:.88,merced:.7,zig:.6,esc:3,sk:3,acz:1,furia:.5,cap:200,bossT:24,script:[
    ['g','+8','+3'],['w'],['g','x2','-2'],['w'],['c','dmg'],['r','escudo'],['g','x2','+6','x'],['w'],['g','-5','-15'],['c','squad',20],['w'],['t','dron'],['g','+15','/2'],['w'],['c','rate'],['r','bomba'],['g','+25','/3','x'],['w'],['t','squad'],['g','x2','-20'],['w']]},
  {name:'La Bóveda del Grupo',boss:'vazquez',hp:4,press:.9,merced:.8,zig:.7,esc:3,sk:4,acz:2,furia:.5,cap:220,bossT:26,script:[
    ['g','+10','+4'],['w'],['g','x3','+8'],['w'],['c','rate'],['r','escudo'],['g','+12','-8','x'],['w'],['g','+20','/2'],['c','squad',25],['w'],['t','hielo'],['g','-8','-20'],['w'],['G'],['t','dron'],['c','dmg'],['g','x2','/3','x'],['w'],['r','bomba'],['g','+30','-25'],['w'],['t','furia'],['g','+40','/2','x'],['w']]}
];
/* regalos (gadgets) y armas. 'trampa' (reintegro falso) no está en GPOOL: solo sale donde lo pone el guion del nivel. */
const GPOOL=['squad','furia','escudo','bomba','hielo','dron'];
const GAD={squad:{t:'Vecinos',col:'#7fd0ff'},furia:{t:'¡Indignación!',col:'#ff9a2a'},escudo:{t:'¡Paraguas!',col:'#7fe0ff'},bomba:{t:'¡Cacerolazo!',col:'#ffe066'},hielo:{t:'¡Paro general!',col:'#bfeaff'},dron:{t:'¡Prensa en vivo!',col:'#ff7a6a'},trampa:{t:'¡Era estafa!',col:'#7dff6a'}};
const ARMA=[
  {t:'Volantes',d:''},
  {t:'Megáfono',d:'Cambia los volantes por un grito que atraviesa a los clones en fila. Llega menos lejos.',desde:1},
  {t:'Cacerolazo',d:'Apunta solo y el ruido salta de clon en clon. Llega un poco menos lejos.',desde:3}
];
/* fuego: v velocidad, r alcance, d daño por llama, p parte que recibe cada hormiga que atraviesa, b contra jefe y cajas.
   rayo: r alcance, w ancho de puntería, d daño, b contra jefe, n saltos, s distancia del salto, k lo que conserva en cada salto. */
const FUEGO={v:24,r:16,d:1,p:.4,b:1.05,max:8};
const RAYO={r:20,w:.5,d:1,b:1,n:6,s:2.6,k:1};
const PCOL=['#8a6bff','#2ad4c8','#ffa62a','#ff4f8a','#c06bff'];

/* ---------- estado ---------- */
const UPG0=()=>({start:0,dmg:0,rate:0,chaleco:0,suerte:0});
const G={level:0,auto:true,phase:'run',dist:0,speed:VSCROLL,len:100,t:0,time:0,x:0,tx:0,N:3,maxN:3,kills:0,lost:0,rateBuff:0,dmgBuff:0,fireAcc:0,fi:0,shake:0,slow:1,endT:0,shown:false,boss:null,pending:[],pi:0,gates:[],crates:[],shots:[],upg:UPG0(),
  arma:0,fx:{escudo:0,hielo:0,dron:0,furia:0},gifts:[],bolts:[],portal:null,warp:0,boom:0,llega:0,nGift:0};
const splats=[],escapes=[];   // escapes: clones espantados que se van corriendo (solo se dibujan)
const ants=[],bullets=[],parts=[],floats=[],soldiers=[],idos=[];   // idos: vecinos que se dispersan (solo se dibujan)
let SIM=false,paused=false;
const save={level:0,upg:UPG0(),armas:[],arma:0,retry:0,kills:0,time:0,owed:false,sound:true};
const SKEY='cacerola.v1';
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SKEY)||'null');if(s&&typeof s.level==='number'){save.level=clamp(s.level|0,0,LV.length-1);const u=s.upg||{};for(const k in save.upg)save.upg[k]=u[k]|0;save.armas=Array.isArray(s.armas)?s.armas.filter(i=>i===1||i===2):[];save.arma=save.armas.includes(s.arma|0)?s.arma|0:0;save.retry=s.retry|0;save.kills=s.kills|0;save.time=+s.time||0;save.owed=!!s.owed;save.sound=s.sound!==false;}}catch(e){}}
function storeSave(){try{localStorage.setItem(SKEY,JSON.stringify(save));}catch(e){}}
function resetSave(){save.level=0;save.upg=UPG0();save.armas=[];save.arma=0;save.retry=0;save.kills=0;save.time=0;save.owed=false;}

const FORM=[],ORDER=[];
for(let i=0;i<MAXVIS;i++){const r=.275*Math.sqrt(i+.15),a=i*2.39996;FORM.push({x:r*Math.cos(a),z:r*Math.sin(a)*.85});ORDER.push(i);}
ORDER.sort((a,b)=>FORM[b].z-FORM[a].z);
const sqR=()=>.275*Math.sqrt(soldiers.length||1)+.28;
const live=()=>G.phase==='run'||G.phase==='boss';
const fireRate=()=>3.2*(1+.2*G.upg.rate)*(1+G.rateBuff)*(G.fx.furia>0?2:1);
const shotDmg=()=>(1+.3*G.upg.dmg)*(1+G.dmgBuff);

function parseOp(s){const k=s[0],v=+s.slice(1);const o=k==='+'?{t:'a',v}:k==='-'?{t:'a',v:-v}:k==='x'?{t:'m',v}:{t:'d',v};o.ch=0;o.bonus=0;o.pop=0;return o;}
function applyOp(n,o){let r=o.t==='a'?n+o.v:o.t==='m'?n*o.v:Math.ceil(n/o.v);return clamp(Math.round(r),1,MAXN);}
function opText(o){return o.t==='a'?(o.v>=0?'+'+o.v:'−'+(-o.v)):o.t==='m'?'×'+o.v:'÷'+o.v;}
const opGood=o=>o.t==='m'||(o.t==='a'&&o.v>=0);

function buildLevel(L,skill){
  const def=LV[L],R=rng(977+L*131);let d=46;const pend=[];G.gates=[];G.crates=[];G.gifts=[];
  let en=3+2*L,uf=1+.2*L,wi=0;const nW=def.script.filter(e=>e[0]==='w').length,pool=GPOOL.slice(0,Math.min(6,3+L));
  const regalo=(dd,kind)=>G.gifts.push({k:'r',d:dd,z:dd,x:(R()<.5?-1:1)*(.5+R()*1.3),kind:kind||pool[(R()*pool.length)|0],t:R()*9});
  for(const e of def.script){
    if(e[0]==='g'){
      const flip=R()<.5,a=parseOp(e[1]),b=parseOp(e[2]);
      G.gates.push({k:'g',d,z:d,L:flip?b:a,R:flip?a:b,used:false,wrong:skill<1&&Math.random()>skill,cruza:e[3]==='x',ct:1.6,cf:0});d+=18;
      en=Math.min(MAXN,applyOp(en,a)+(a.t==='a'?5:0));
    }else if(e[0]==='w'){
      const prog=nW>1?wi/(nW-1):0;
      if(!wi)d+=14;   // la primera oleada sale más atrás: que las rojas no lleguen antes que la primera puerta
      wi++;
      const depth=26+14*prog,units=def.press*(.5+prog)*11.5*en*uf/def.hp,sf=.2+.4*prog;
      let ns=units*sf/9,rest=units*(1-sf),hm=1;
      if(ns+rest>def.cap){hm=(ns+rest)/def.cap;ns/=hm;rest/=hm;}
      ns=Math.round(ns);const nf=Math.round(rest*.25),n=ns+nf+Math.round(rest*.75);
      // novedades del nivel: parte de las rojas va en zigzag, algunas obreras escupen y cada acorazada reemplaza a 3 soldado
      const nz=Math.round(nf*(def.zig||0)),ne=def.esc?Math.min(Math.round(def.esc*(.5+prog)),n-ns-nf):0,na=def.acz&&prog>.3?Math.min(def.acz,Math.floor(ns/3)):0;
      for(let i=0;i<n;i++){
        let type=i<ns?2:i<ns+nf?1:0;
        if(type===2&&i<na*3){if(i%3)continue;type=5;}
        else if(type===1&&i-ns<nz)type=3;
        else if(type===0&&i-ns-nf<ne)type=4;
        pend.push({d:d+R()*depth+(type===2||type===5?depth*.25:type===4?depth*.3:0),x:(R()*2-1)*(TW-.4),type,hm,en});
      }
      d+=depth+14;en=Math.round(en*.95);
    }else if(e[0]==='r'){
      regalo(d-6,e[1]);
    }else if(e[0]==='t'){
      // un regalo de verdad y, del otro lado, un reintegro falso que se le parece
      const s=R()<.5?-1:1;G.gifts.push({k:'r',d:d-6,z:d-6,x:s*1.4,kind:e[1]||pool[(R()*pool.length)|0],t:R()*9});
      G.gifts.push({k:'r',d:d-6,z:d-6,x:-s*1.4,kind:'trampa',t:R()*9});
    }else if(e[0]==='G'){
      // gigante: aguanta unos 2 segundos de fuego del escuadrón esperado
      pend.push({d:d+10,x:0,type:6,hm:3.2*en*uf*2.2/(ANT[6].hp*def.hp),en});d+=18;
    }else{
      const hp=Math.round(3.2*en*uf*1.3);
      G.crates.push({k:'c',d:d-4,z:d,x:(R()<.5?-1:1)*1.6,hp,max:hp,rw:e[1],amt:e[2]||0,dead:false,hit:0});d+=4;
      if(e[1]==='squad')en+=e[2];else if(e[1]==='rate')uf*=1.25;else uf*=1.3;
    }
  }
  const nx=G.upg.suerte|0;for(let i=0;i<nx;i++)regalo(60+(d-90)*(i+.5)/nx);   // mejora "Buena suerte": regalos de más
  pend.sort((a,b)=>a.d-b.d);G.pending=pend;G.pi=0;G.len=d+2;G.expN=en;
  G.bossHp=Math.round(def.bossT*3.2*en*uf*.7);
}
function setupLevel(L,auto,opt){
  opt=opt||{};
  G.level=L;G.auto=!!auto;G.phase='run';G.dist=0;G.speed=VSCROLL;G.t=0;G.time=0;G.x=0;G.tx=0;
  G.upg=Object.assign(UPG0(),opt.upg||save.upg);
  G.arma=opt.arma!=null?opt.arma:(auto?0:save.arma);
  G.fx={escudo:5*G.upg.chaleco,hielo:0,dron:0,furia:0};G.bolts=[];G.portal=null;G.warp=0;G.boom=0;G.nGift=0;G.nAcz=0;G.llega=L>0&&!auto?1:0;
  G.N=opt.n!=null?opt.n:(auto&&!SIM?8:3+4*G.upg.start+Math.min(8,2*save.retry));
  G.ease=opt.ease!=null?opt.ease:(auto?1:1-Math.min(.36,.12*save.retry));
  G.slop=opt.slop||null;G.apT=0;G.apX=0;G.pilot=false;
  G.maxN=G.N;G.kills=0;G.lost=0;G.rateBuff=0;G.dmgBuff=0;G.fireAcc=0;G.fi=0;G.shake=0;G.slow=1;G.endT=0;G.shown=false;G.boss=null;G.shots=[];
  ants.length=0;bullets.length=0;parts.length=0;floats.length=0;soldiers.length=0;
  buildLevel(L,opt.skill==null?1:opt.skill);
  syncSoldiers();
  splats.length=0;escapes.length=0;G.meVoy=0;
  idos.length=0;G.festT=-9;
  if(!SIM)R3.nivel(L);
}

/* ---------- efectos ---------- */
function burst(x,z,n,col,spd,r){if(SIM)return;for(let i=0;i<n;i++){if(parts.length>240)return;const a=Math.random()*TAU,v=spd*(.4+Math.random()*.6);parts.push({x,z,h:.3,vx:Math.cos(a)*v,vz:Math.sin(a)*v*.6,vh:2+Math.random()*3.5,life:0,max:.35+Math.random()*.3,col,r:r*(.6+Math.random()*.6)});}}
function floatText(x,z,txt,col,size){if(SIM)return;floats.push({x,z,h:1.6,txt,col,size:size||.8,life:0});}

/* ---------- escuadrón ---------- */
function syncSoldiers(){
  const vis=Math.min(G.N,MAXVIS);
  while(soldiers.length<vis)soldiers.push({x:G.x,z:.35,sp:0});
  while(soldiers.length>vis){const p=soldiers.pop();burst(p.x,p.z,4,'#ffd23f',2.5,.09);if(!SIM&&idos.length<28)idos.push({x:p.x,z:p.z,t:0,i:soldiers.length,dir:p.x<G.x?-1:1});}
}
function addSquad(n){G.N=clamp(G.N+n,0,MAXN);if(G.N>G.maxN)G.maxN=G.N;syncSoldiers();}
function lose(n){
  if(!live()||n<=0)return;
  if(G.fx.escudo>0){const a=Math.min(n,G.fx.escudo);G.fx.escudo-=a;n-=a;burst(G.x,.6,6,'#7fe0ff',4,.09);sfx('shield');if(n<=0)return;}
  n=Math.min(n,G.N);G.N-=n;G.lost+=n;syncSoldiers();
  G.shake=Math.max(G.shake,.25);sfx('lose');
  if(G.N<=0){G.phase='lost';G.endT=0;G.shake=1;burst(G.x,.3,24,'#ffd23f',5,.12);sfx('over');}
}

/* ---------- hormigas ---------- */
function spawnAnt(type,x,d,hm){const A=ANT[type],m=hm||1,sz=Math.min(1.35,Math.pow(m,.25)),hp=A.hp*LV[G.level].hp*m*G.ease;ants.push({type,x,d,z:d-G.dist,hp,max:hp,sz,hw:A.w*.5*sz+.12,walk:A.walk*(.85+Math.random()*.3),bite:A.bite,off:Math.random()*2-1,lat:.9+Math.random()*.8,ph:Math.random()*8,hit:0,cd:.8+Math.random()*1.4});}
/* Espantar a un clon: no muere, sale corriendo por el costado entre papel picado (y a veces avisa "¡me voy!"). */
function killAnt(a){
  G.kills++;const A=ANT[a.type];if(A.gift&&live()&&(a.type===6||G.nAcz++%3===0))dropGift(a.x,a.d);/* el mega-clon siempre deja regalo; los blindados, uno de cada tres */
  if(SIM)return;
  const n=A.bar?4:1;burst(a.x,a.z,n+1,'#d52b1e',3,.07);burst(a.x,a.z,n,'#ffffff',3,.07);burst(a.x,a.z,n,'#2a5bd7',3,.07);
  if(escapes.length<36)escapes.push({type:a.type,x:a.x,d:a.d,sz:a.sz,dir:a.x<G.x?-1:1,t:0,ph:a.ph});
  if(G.t-G.meVoy>1.3&&Math.random()<.45){G.meVoy=G.t;const D=DICE[A.dice||'s'];floatText(a.x,a.z,D[(Math.random()*D.length)|0],'#ffffff',.5);}
  sfx('kill');
}

/* ---------- regalos ---------- */
function dropGift(x,d,kind){
  const pool=GPOOL.slice(0,Math.min(6,3+G.level));
  G.gifts.push({k:'r',d,z:d-G.dist,x:clamp(x,-TW+.7,TW-.7),kind:kind||pool[(Math.random()*pool.length)|0],t:Math.random()*9});
}
function useGift(g){
  const k=g.kind,T=GAD[k];
  if(k==='trampa'){
    // reintegro falso: se van vecinos (el paraguas lo frena, como cualquier golpe)
    const n=Math.max(2,Math.ceil(G.N*.2));floatText(G.x,.6,T.t,'#ff7a6a',.85);burst(G.x,.6,12,'#25d366',5,.1);sfx('scam');G.shake=Math.max(G.shake,.35);lose(n);
    return;
  }
  G.nGift++;
  if(k==='squad'){const n=6+4*G.level;addSquad(n);floatText(G.x,.6,'+'+n,T.col,1);}
  else if(k==='escudo')G.fx.escudo+=10;
  else if(k==='furia')G.fx.furia=8;
  else if(k==='hielo')G.fx.hielo=4;
  else if(k==='dron')G.fx.dron=12;
  else{
    // bomba: limpia todo lo que hay cerca; a las grandes les saca media vida y al jefe un 8%
    for(const a of ants)if(a.hp>0&&a.z<30&&a.z>-1){if(ANT[a.type].bar)a.hp-=a.max*.5;else a.hp=0;a.hit=1;if(a.hp<=0){a.hp=0;killAnt(a);}}
    const b=G.boss;if(b&&G.phase==='boss'&&b.state!=='dead'&&b.state!=='portal')hitBoss(b.max*.08);
    G.boom=1;G.shake=Math.max(G.shake,.8);
  }
  if(k!=='squad')floatText(G.x,.6,T.t,T.col,.8);
  burst(G.x,.6,14,T.col,5,.11);sfx(k==='bomba'?'bomb':'gift');
}

/* ---------- jefe ---------- */
function spawnBoss(){
  const def=BOSS[LV[G.level].boss],hp=Math.round(G.bossHp*G.ease*clamp(.5+.5*G.N/G.expN,Math.max(.6,LV[G.level].merced||0),1));
  // se abre un portal al fondo y el jefe sale de adentro
  G.portal={k:'p',z:27,s:0,tgt:1,out:false};
  G.boss={k:'b',def,x:0,z:27,home:16,hp,max:hp,t:0,state:'portal',st:.9,cd:2,ai:0,lane:0,hit:0,esc:.12,gf:0,fur:0,dbl:0};
  if(!G.auto&&!SIM){$('bossName').textContent=def.name;banner('¡Jefe!',def.name);retrato(def.img);}
  sfx('portal');
}
function hitBoss(d){
  const b=G.boss;b.hp-=d;b.hit=1;
  if(b.hp>0&&b.gf<2&&b.hp/b.max<(b.gf?.33:.66)){b.gf++;dropGift(b.x+(Math.random()<.5?-1.3:1.3),G.dist+b.z-1);}
  if(b.hp<=0&&b.state!=='dead'){
    b.hp=0;b.state='dead';b.st=0;G.phase='won';G.endT=0;G.slow=.3;G.shake=1;G.shots.length=0;sfx('bossdie');
    for(let i=0;i<6;i++)burst(b.x+(Math.random()-.5)*2,b.z+(Math.random()-.5)*2,10,['#d52b1e','#ffffff','#2a5bd7'][i%3],7,.16);
    if(!G.auto&&!SIM)banner(b.def.fin,b.def.name);
    for(const a of ants){if(a.hp>0){a.hp=0;killAnt(a);}}
    // el portal se reabre para pasar al nivel que sigue (en el último se cierra)
    const p=G.portal;if(p){if(G.level<LV.length-1){p.out=true;p.tgt=1.25;}else p.tgt=0;}
  }
}
function doAttack(b,a){
  const B=b.def;
  if(a==='charge'){b.state='tele';b.st=B.tele*(b.dbl?.55:1);b.lane=clamp(G.x,-(TW-B.hw*.8),TW-B.hw*.8);sfx('tele');}
  else if(a.slice(0,4)==='spit'){
    const n=(+a[4]||1)+(b.fur?1:0);
    for(let i=0;i<n;i++)G.shots.push({k:'s',x0:b.x,z0:b.z,x:b.x,z:b.z,tx:clamp(G.x+(i-(n-1)/2)*1.5,-TW+.3,TW-.3),t:-i*.12,dur:1.45,kills:B.sk,col:B.shot,ico:B.ico});
    b.cd=B.cd;sfx('spit');
  }else{
    const n=a==='summonBig'?B.sum*2:B.sum;
    for(let i=0;i<n;i++)spawnAnt(B.sumType,clamp(b.x+(Math.random()*2-1)*2.4,-TW+.3,TW-.3),G.dist+b.z+Math.random()*5,1.5);
    b.cd=B.cd*.8;
  }
}
function updBoss(dt){
  const b=G.boss,B=b.def;b.t+=dt;if(b.hit>0)b.hit-=dt*5;
  b.at=(b.at||0)+dt*(b.state==='dash'?2.4:b.state==='tele'?.3:1); // reloj de la animación: casi quieto al avisar, rápido al embestir
  if(b.state==='dead'){b.st+=dt;return;}
  if(!live())return;
  if(b.state==='portal'){b.z=G.portal.z-.3;b.st-=dt;if(b.st<=0){b.state='enter';sfx('boss');}return;}
  if(b.state==='enter'){b.z-=9*dt;b.esc=Math.min(1,b.esc+dt*1.5);if(b.z<=b.home){b.z=b.home;b.esc=1;b.state='idle';b.cd=1.6;G.portal.tgt=.42;}return;}
  if(b.state==='idle'){
    // furia: con poca vida ataca más seguido, escupe de más y embiste dos veces
    const F=LV[G.level].furia;
    if(F&&!b.fur&&b.hp<b.max*F){b.fur=1;b.cd=Math.min(b.cd,.8);G.shake=Math.max(G.shake,.5);sfx('boss');if(!G.auto&&!SIM)banner('¡Se puso nervioso!',B.name);}
    b.home=Math.max(7,b.home-B.adv*dt);
    b.z+=(b.home-b.z)*Math.min(1,dt*4);
    const tx=Math.sin(b.t*B.sway)*(TW-B.hw*.7)*.85;
    b.x+=clamp(tx-b.x,-4*dt,4*dt);
    b.cd-=dt*(b.fur?1.4:1);
    if(b.cd<=0)doAttack(b,B.atk[b.ai++%B.atk.length]);
  }else if(b.state==='tele'){
    b.x+=clamp(b.lane-b.x,-9*dt,9*dt);b.st-=dt;
    if(b.st<=0){b.x=b.lane;b.state='dash';sfx('dash');}
  }else if(b.state==='dash'){
    b.z-=58*dt;
    if(b.z<=1.2){
      b.z=1.2;b.state='back';G.shake=1;sfx('impact');burst(b.x,1,14,'#e8d2a0',6,.14);
      if(Math.abs(G.x-b.lane)<B.hw+sqR()*.5)lose(Math.max(2,Math.ceil(G.N*B.cf)));
    }
  }else if(b.state==='back'){
    b.z+=15*dt;
    if(b.z>=b.home){b.z=b.home;b.state='idle';b.cd=B.cd*(.65+.35*b.hp/b.max);if(b.fur&&!b.dbl){b.dbl=1;doAttack(b,'charge');}else b.dbl=0;}
  }
}

/* ---------- simulación de un paso ---------- */
function update(dt){
  G.t+=dt;
  const alive=live(),fx=G.fx;
  if(alive&&!G.auto)G.time+=dt;
  if(alive){if(fx.hielo>0)fx.hielo-=dt;if(fx.dron>0)fx.dron-=dt;if(fx.furia>0)fx.furia-=dt;}
  if(G.llega>0)G.llega-=dt*1.3;
  if(G.boom>0)G.boom-=dt*1.8;
  if(G.phase==='run'){G.dist+=G.speed*dt;if(G.dist>=G.len){G.phase='boss';spawnBoss();}}
  else{
    // muerto el jefe, el escuadrón vuelve a correr hacia el portal
    if(G.phase==='won'&&G.portal&&G.portal.out&&G.endT>.9&&!G.warp)G.speed=Math.min(VSCROLL*1.7,G.speed+10*dt);
    else G.speed=Math.max(0,G.speed-9*dt);
    G.dist+=G.speed*dt;if(!alive)G.endT+=dt;
  }
  if(G.portal){
    const q=G.portal;q.z-=G.speed*dt;q.s+=clamp(q.tgt-q.s,-dt*1.6,dt*1.6);
    if(q.out&&G.phase==='won'){
      if(q.z<=1.1){q.z=1.1;if(!G.warp){G.warp=.001;sfx('warp');}}
      if(G.warp>0)G.warp=Math.min(1,G.warp+dt*1.5);
    }
  }
  const lim=TW-.45;G.tx=clamp(G.tx,-lim,lim);
  G.x+=clamp(G.tx-G.x,-15*dt,15*dt);
  while(G.pi<G.pending.length&&G.pending[G.pi].d-G.dist<86){const p=G.pending[G.pi++];spawnAnt(p.type,p.x,p.d,p.hm*clamp(.4+.6*G.N/p.en,.5,1));}
  const R=sqR(),bossPhase=G.phase==='boss';

  // escuadrón: cada uno sigue su lugar en la formación con un poco de retraso
  for(let i=0;i<soldiers.length;i++){const p=soldiers[i],f=FORM[i],k=Math.min(1,dt*(16-i*.12));p.x+=(clamp(G.x+f.x,-TW+.2,TW-.2)-p.x)*k;p.z+=(.35+f.z-p.z)*k;if(p.sp<1)p.sp=Math.min(1,p.sp+dt*5);}

  // puertas y cajas
  for(let i=G.gates.length-1;i>=0;i--){
    const g=G.gates[i];g.z=g.d-G.dist;
    if(g.L.pop>0)g.L.pop-=dt*3;if(g.R.pop>0)g.R.pop-=dt*3;
    if(g.cruza&&!g.used){
      // puerta que se cruza: las mitades cambian de lado cada tanto, pero no cuando ya está encima
      if(g.cf>0)g.cf-=dt*4;
      if(g.z>7&&g.z<40){g.ct-=dt;if(g.ct<=0){g.ct=1.6;const t=g.L;g.L=g.R;g.R=t;g.cf=1;sfx('pop');}}
    }
    if(!g.used&&g.z<=.35&&alive){
      g.used=true;const o=G.x<0?g.L:g.R,before=G.N,after=applyOp(before,o);
      if(after>=before){addSquad(after-before);G.festT=G.t;sfx('good');floatText(G.x,.5,opText(o),'#7fd0ff',1);burst(G.x,.6,12,'#7fd0ff',5,.1);}
      else{const n=before-after;G.N=after;G.lost+=n;syncSoldiers();sfx('bad');floatText(G.x,.5,opText(o),'#ff7a6a',1);G.shake=Math.max(G.shake,.4);}
    }
    if(g.z<-3)G.gates.splice(i,1);
  }
  for(let i=G.crates.length-1;i>=0;i--){
    const c=G.crates[i];c.z=c.d-G.dist;if(c.hit>0)c.hit-=dt*6;
    if(!c.dead&&alive&&c.z<1&&c.z>-.5&&Math.abs(G.x-c.x)<.95+R*.7){c.dead=true;burst(c.x,c.z,14,'#c98a4a',5,.14);sfx('impact');G.shake=Math.max(G.shake,.6);lose(2);}
    if(c.dead||c.z<-3)G.crates.splice(i,1);
  }
  // regalos: se agarran pasando por encima; con el camino quieto (pelea con el jefe) se acercan solos
  for(let i=G.gifts.length-1;i>=0;i--){
    const g=G.gifts[i];if(G.speed<6.5)g.d-=(6.5-G.speed)*dt;g.z=g.d-G.dist;
    if(alive&&g.z<.9&&g.z>-.6&&Math.abs(G.x-g.x)<R*.6+.75){G.gifts.splice(i,1);useGift(g);continue;}
    if(g.z<-3)G.gifts.splice(i,1);
  }

  // hormigas
  const hielo=fx.hielo>0;
  for(let i=ants.length-1;i>=0;i--){
    const a=ants[i],A=ANT[a.type];
    if(a.hp<=0){ants[i]=ants[ants.length-1];ants.pop();continue;}
    const quieta=hielo&&!A.bar;   // el hielo congela a las comunes; a las grandes solo las frena
    if(!quieta)a.d-=a.walk*(bossPhase?2.2:1)*(hielo?.3:1)*dt;
    a.z=a.d-G.dist;
    if(a.hit>0)a.hit-=dt*6;
    if(alive){
      if(!quieta){
        if(a.z<26){const tx=G.x+a.off*(R+.35);a.x+=clamp(tx-a.x,-a.lat*dt,a.lat*dt);}
        if(A.zig&&a.z<40)a.x=clamp(a.x+Math.cos(G.t*3.2+a.ph)*A.zig*dt,-TW+.3,TW-.3);
        if(A.spit&&a.z<26&&a.z>7){
          a.cd-=dt;
          if(a.cd<=0){a.cd=2.4;G.shots.push({k:'s',x0:a.x,z0:a.z,x:a.x,z:a.z,tx:clamp(G.x,-TW+.3,TW-.3),t:0,dur:1.35,kills:LV[G.level].sk||2,col:'#8be04a',ico:'papel'});sfx('spit');}
        }
      }
      if(a.z<.75&&a.z>-.5&&Math.abs(a.x-G.x)<R+.4){
        a.hp=0;
        if(quieta){killAnt(a);continue;}   // congelada: se rompe sin morder
        burst(a.x,a.z,3,A.body,3,.08);lose(A.biteF?Math.max(a.bite,Math.ceil(G.N*A.biteF)):a.bite);continue;
      }
    }
    if(a.z<-2.6){ants[i]=ants[ants.length-1];ants.pop();}
  }

  // disparo automático según el arma; cada chorro lleva el daño de varios fumigadores
  const b=G.boss,boss=b&&b.state!=='dead'&&b.state!=='portal'?b:null;
  if(alive&&soldiers.length){
    G.fireAcc+=dt*fireRate();
    while(G.fireAcc>=1){
      G.fireAcc-=1;
      const vis=soldiers.length,tot=G.N*shotDmg(),arma=G.arma;
      if(arma===2)zap(tot,vis,boss);
      else{
        const K=Math.min(vis,arma===1?FUEGO.max:12),per=tot/K;
        for(let k=0;k<K;k++){
          const p=soldiers[(G.fi++)%vis],z=p.z+.6+Math.random()*.8;
          if(arma===1)bullets.push({x:p.x+(Math.random()-.5)*.3,z,pz:z,z0:z,dmg:per*FUEGO.d,fl:1,vx:(Math.random()-.5)*1.2,hits:[],gh:null});
          else bullets.push({x:p.x+(Math.random()-.5)*.12,z,pz:z,dmg:per,gh:null});
        }
      }
      // los drones siempre tiran veneno, cada uno un 30% de lo que tira el escuadrón
      if(fx.dron>0)for(let s=-1;s<=1;s+=2)bullets.push({x:clamp(G.x+s*(R+.9),-TW+.2,TW-.2),z:1.5,pz:1.5,dmg:tot*.3,gh:null});
      sfx(arma===1?'flame':arma===2?'zap':'shot');
    }
  }

  // balas y llamas
  for(let i=bullets.length-1;i>=0;i--){
    const u=bullets[i],fl=u.fl;u.pz=u.z;u.z+=(fl?FUEGO.v:BSPD)*dt;if(fl)u.x+=u.vx*dt;
    let dead=fl?u.z>u.z0+FUEGO.r:u.z>BRANGE;
    if(!dead){
      const z0=u.pz-.35,z1=u.z+.35,an=fl?.3:0,duro=fl?u.dmg*FUEGO.b:u.dmg;
      if(boss&&boss.z>z0-.6&&boss.z<z1+.6&&Math.abs(u.x-boss.x)<boss.def.hw+an){hitBoss(duro);dead=true;if(!SIM&&Math.random()<.3)burst(u.x,boss.z-.5,1,fl?'#ffb040':'#fff',3,.07);}
      if(!dead)for(const c of G.crates){if(!c.dead&&c.z>z0&&c.z<z1+.5&&Math.abs(u.x-c.x)<.98+an){c.hp-=duro;c.hit=1;dead=true;if(c.hp<=0)breakCrate(c);break;}}
      if(!dead)for(const g of G.gates){if(!g.used&&u.gh!==g&&g.z>z0&&g.z<z1){u.gh=g;const o=u.x<0?g.L:g.R;if(o.t==='a'&&o.bonus<5){o.ch++;if(o.ch>=6){o.ch=0;o.v++;o.bonus++;o.pop=1;sfx('pop');}}}}
      if(!dead)for(let j=0;j<ants.length;j++){
        const a=ants[j];
        if(a.hp>0&&a.z>z0&&a.z<z1&&Math.abs(u.x-a.x)<a.hw+an){
          if(fl){
            // la llama no se gasta: quema una vez a cada hormiga que cruza
            if(u.hits.indexOf(a)<0){u.hits.push(a);a.hp-=u.dmg*FUEGO.p;a.hit=1;if(a.hp<=0)killAnt(a);if(u.hits.length>=10){dead=true;break;}}
          }else{const h=a.hp;a.hp-=u.dmg;u.dmg-=h;a.hit=1;if(a.hp<=0)killAnt(a);if(u.dmg<=.01){dead=true;break;}}
        }
      }
    }
    if(dead){bullets[i]=bullets[bullets.length-1];bullets.pop();}
  }

  if(b)updBoss(dt*(hielo?.35:1));
  for(let i=G.shots.length-1;i>=0;i--){
    const s=G.shots[i];s.t+=dt;if(s.t<0)continue;
    const k=s.t/s.dur;s.x=lerp(s.x0,s.tx,k);s.z=lerp(s.z0,.25,k);
    if(k>=1){burst(s.tx,.25,8,s.col,4,.1);sfx('splat');if(live()&&Math.abs(G.x-s.tx)<sqR()*.7+.5)lose(s.kills);G.shots.splice(i,1);}
  }

  if(!SIM){
    for(let i=G.bolts.length-1;i>=0;i--){const q=G.bolts[i];q.life+=dt;if(q.life>.09)G.bolts.splice(i,1);}
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life+=dt;if(p.life>=p.max){parts[i]=parts[parts.length-1];parts.pop();continue;}p.x+=p.vx*dt;p.z+=(p.vz-G.speed)*dt;p.h+=p.vh*dt;p.vh-=12*dt;if(p.h<0)p.h=0;}
    for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.life+=dt;f.h+=1.6*dt;if(f.life>1)floats.splice(i,1);}
    for(let i=splats.length-1;i>=0;i--){const q=splats[i];q.life+=dt;if(q.life>=q.max){splats[i]=splats[splats.length-1];splats.pop();}}
    for(let i=escapes.length-1;i>=0;i--){const e=escapes[i];e.t+=dt;e.x+=e.dir*5.5*dt;e.d+=2*dt;if(e.t>.75){escapes[i]=escapes[escapes.length-1];escapes.pop();}}
    for(let i=idos.length-1;i>=0;i--){const e=idos[i];e.t+=dt;e.x+=e.dir*4.5*dt;e.z-=(G.speed*.5+2.5)*dt;if(e.t>.9){idos[i]=idos[idos.length-1];idos.pop();}}
    if(G.shake>0)G.shake=Math.max(0,G.shake-dt*2.5);
  }
}
/* Rayo: sin proyectil. Cada descarga busca lo más cercano en su carril y, si le sobra daño, salta a las hormigas vecinas. */
function zap(tot,vis,boss){
  const K=Math.min(vis,5);
  for(let k=0;k<K;k++){
    const p=soldiers[(G.fi++)%vis],x=p.x,z=p.z;let bud=tot/K*RAYO.d,t=null,tz=RAYO.r,crate=null;
    const pts=SIM?null:[x,z+.5];
    for(const a of ants)if(a.hp>0&&a.z>z&&a.z<tz&&Math.abs(a.x-x)<a.hw+RAYO.w){t=a;tz=a.z;}
    for(const c of G.crates)if(!c.dead&&c.z>z&&c.z<tz&&Math.abs(c.x-x)<1.1){crate=c;tz=c.z;t=null;}
    // las puertas que cruza la descarga también suman, como con las gotas (5 descargas valen por 12 gotas)
    for(const g of G.gates)if(!g.used&&g.z>z&&g.z<tz){const o=x<0?g.L:g.R;if(o.t==='a'&&o.bonus<5){o.ch+=2.4;if(o.ch>=6){o.ch=0;o.v++;o.bonus++;o.pop=1;sfx('pop');}}}
    if(boss&&G.phase==='boss'&&boss.z<tz&&Math.abs(boss.x-x)<boss.def.hw+RAYO.w){
      hitBoss(bud*RAYO.b);if(pts)pts.push(boss.x+clamp(x-boss.x,-1,1)*boss.def.hw*.6,boss.z);t=null;
    }else if(crate){
      crate.hp-=bud;crate.hit=1;if(crate.hp<=0)breakCrate(crate);if(pts)pts.push(crate.x,crate.z);
    }else{
      let saltos=0;
      while(t){
        const h=t.hp;t.hp-=bud;bud-=h;t.hit=1;if(pts)pts.push(t.x,t.z);if(t.hp<=0)killAnt(t);
        if(bud<=.01||++saltos>RAYO.n)break;
        let n=null,nd=RAYO.s*RAYO.s;
        for(const a of ants)if(a.hp>0&&a.z>0&&a.z<RAYO.r+3){const dx=a.x-t.x,dz=a.z-t.z,q=dx*dx+dz*dz;if(q<nd){nd=q;n=a;}}
        t=n;bud*=RAYO.k;
      }
    }
    if(pts&&pts.length>2&&G.bolts.length<16){G.bolts.push({p:pts,life:0});if(Math.random()<.035)floatText(pts[pts.length-2],pts[pts.length-1],'¡CLANG!','#ffcf33',.5);}
  }
}
function breakCrate(c){
  // cajero destrabado: escupe billetes y lo que tenía guardado
  c.dead=true;burst(c.x,c.z,12,'#7bc96f',6,.13);burst(c.x,c.z,8,'#c9ced6',5,.12);sfx('crate');
  if(c.rw==='squad'){addSquad(c.amt);floatText(c.x,c.z,'+'+c.amt,'#7fd0ff',1);}
  else if(c.rw==='rate'){G.rateBuff+=.25;floatText(c.x,c.z,'¡Más ritmo!','#ffcf33',.8);}
  else{G.dmgBuff+=.3;floatText(c.x,c.z,'¡Más presión!','#ff9a7a',.8);}
}

/* ---------- piloto automático (demo de portada y pruebas de equilibrio) ---------- */
function autopilot(){
  const s=G.slop;if(!s)return apIdeal();
  G.apT-=1/60;if(G.apT>0)return G.apX;
  G.apT=s.lag;G.apX=clamp(apIdeal()+(Math.random()*2-1)*s.noise,-TW+.45,TW-.45);return G.apX;
}
function apIdeal(){
  const R=sqR(),lim=TW-.45;let tx=G.x,gate=null;
  for(const g of G.gates)if(!g.used&&g.z>.3&&g.z<18&&(!gate||g.z<gate.z))gate=g;
  if(gate){const l=applyOp(G.N,gate.L),r=applyOp(G.N,gate.R);let side=l>r?-1:r>l?1:(G.x<0?-1:1);if(gate.wrong)side=-side;tx=side*1.5;}
  else{
    let crate=null;for(const c of G.crates)if(!c.dead&&c.z>3&&c.z<30&&(!crate||c.z<crate.z))crate=c;
    let sx=0,sw=0;for(const a of ants)if(a.hp>0&&a.z>0&&a.z<30){const w=1/(a.z+4);sx+=a.x*w;sw+=w;}
    if(crate&&sw<.6)tx=crate.x;else if(sw>0)tx=sx/sw;
    const b=G.boss;if(b&&G.phase==='boss'&&sw<.5)tx=b.x;
    let gift=null;for(const g of G.gifts)if(g.kind!=='trampa'&&g.z>.2&&g.z<12&&(!gift||g.z<gift.z))gift=g;
    if(gift)tx=gift.x;
    for(const c of G.crates)if(!c.dead&&c.z<3&&c.z>-1&&Math.abs(tx-c.x)<1.1+R*.7)tx=c.x>0?c.x-(1.3+R*.7):c.x+(1.3+R*.7);
  }
  // el piloto esquiva los reintegros falsos (también cuando va hacia una puerta)
  for(const g of G.gifts)if(g.kind==='trampa'&&g.z<4&&g.z>-1&&Math.abs(tx-g.x)<R*.6+.95)tx=clamp(g.x>0?g.x-(R*.6+1.1):g.x+(R*.6+1.1),-TW+.45,TW-.45);
  const b=G.boss;
  if(b&&G.phase==='boss'){
    if(b.state==='tele'||b.state==='dash'){const need=b.def.hw+R*.5+.3;if(Math.abs(tx-b.lane)<need){const l=b.lane-need,r=b.lane+need;tx=l<-lim?r:r>lim?l:(Math.abs(G.x-l)<Math.abs(G.x-r)?l:r);}}
  }
  for(const s of G.shots)if(s.t>0&&s.dur-s.t<.9){const need=R*.7+.65;if(Math.abs(tx-s.tx)<need){const l=s.tx-need,r=s.tx+need;tx=l<-lim?r:r>lim?l:(G.x<=s.tx?l:r);}}
  return clamp(tx,-lim,lim);
}
window.__antSim=(L,upg,skill,n,slop,ease,arma)=>{
  SIM=true;setupLevel(L,true,{upg:Object.assign(UPG0(),upg),skill:skill==null?1:skill,n:n==null?3+4*((upg&&upg.start)||0):n,ease:ease||1,slop,arma:arma|0});
  let t=0,nBoss=0,tBoss=0,peak=0;
  while(t<420&&live()){G.tx=autopilot();update(1/60);t+=1/60;if(ants.length>peak)peak=ants.length;if(G.phase==='boss'){if(!nBoss)nBoss=G.N;tBoss+=1/60;}}
  const r={res:G.phase,t:+t.toFixed(1),N:G.N,nBoss,tBoss:+tBoss.toFixed(1),kills:G.kills,lost:G.lost,maxN:G.maxN,bossHp:G.boss?Math.round(G.boss.hp):null,len:Math.round(G.len),expN:G.expN,ants:G.pending.length,peak,bossMax:G.bossHp,gifts:G.nGift};
  SIM=false;setupLevel(0,true);return r;
};

/* ---------- sonido (sintetizado, sin archivos) ---------- */
const AU={ctx:null,master:null,on:true,nb:null,last:{},music:null};
const GAP={shot:95,kill:45,lose:80,pop:60,splat:60,flame:110,zap:90,shield:90,spit:150};
function auInit(){
  if(AU.ctx)return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    AU.ctx=new AC();AU.master=AU.ctx.createGain();AU.master.gain.value=AU.on?.5:0;AU.master.connect(AU.ctx.destination);
    const n=AU.ctx.sampleRate*.5|0;AU.nb=AU.ctx.createBuffer(1,n,AU.ctx.sampleRate);const d=AU.nb.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
    startMusic();
  }catch(e){AU.ctx=null;}
}
function tone(f,dur,type,vol,to,delay){const a=AU.ctx;if(!a||!AU.on)return;const t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(AU.master);o.start(t);o.stop(t+dur+.02);}
function noise(dur,vol,freq,delay){const a=AU.ctx;if(!a||!AU.on)return;const t=a.currentTime+(delay||0),s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=AU.nb;f.type='bandpass';f.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(AU.master);s.start(t);s.stop(t+dur+.02);}
function sfx(n){
  if(SIM||G.auto||!AU.ctx||!AU.on)return;
  const now=performance.now(),gap=GAP[n]||0;if(gap&&now-(AU.last[n]||0)<gap)return;AU.last[n]=now;
  switch(n){
    case'shot':tone(1700+Math.random()*500,.06,'triangle',.03,1400);noise(.04,.035,5200);break;   // golpe de cacerola
    case'kill':tone(480+Math.random()*240,.06,'triangle',.07,170);break;
    case'scam':tone(330,.12,'square',.09);tone(220,.28,'square',.09,0,.13);noise(.2,.08,600,.05);break;   // "error" del reintegro falso
    case'good':tone(523,.1,'square',.08);tone(659,.1,'square',.08,0,.08);tone(784,.18,'square',.08,0,.16);break;
    case'bad':tone(220,.28,'sawtooth',.1,85);break;
    case'lose':tone(170,.12,'square',.08,70);break;
    case'pop':tone(900,.05,'sine',.06,1300);break;
    case'crate':noise(.2,.2,700);tone(880,.2,'triangle',.1,0,.05);tone(1175,.25,'triangle',.1,0,.13);break;
    case'boss':tone(95,.9,'sawtooth',.16,42);noise(.6,.1,220);break;
    case'tele':tone(300,.14,'square',.07,620);tone(300,.14,'square',.07,620,.2);break;
    case'dash':noise(.3,.18,520);break;
    case'impact':noise(.35,.28,150);tone(72,.3,'sine',.3,34);break;
    case'spit':tone(520,.2,'sine',.08,190);break;
    case'splat':noise(.12,.12,900);break;
    case'bossdie':noise(1,.28,300);tone(210,1,'sawtooth',.14,30);[523,659,784,1047].forEach((f,i)=>tone(f,.22,'square',.08,0,.9+i*.13));break;
    case'over':[392,330,262,196].forEach((f,i)=>tone(f,.25,'triangle',.11,0,i*.16));break;
    case'click':tone(700,.05,'square',.05);break;
    case'flame':tone(210+Math.random()*40,.12,'sawtooth',.035,170);noise(.1,.05,1200);break;   // megáfono
    case'zap':tone(2200+Math.random()*800,.07,'square',.03,1800);noise(.05,.04,6000);break;   // cacerolazo
    case'gift':tone(2100,.09,'sine',.08,2350);tone(2100,.09,'sine',.08,2350,.11);tone(2300,.2,'sine',.08,2000,.22);break;   // silbato
    case'bomb':for(let i=0;i<7;i++)tone(1400+Math.random()*900,.09,'triangle',.06,1100,i*.06);noise(.5,.18,3000);tone(90,.4,'sine',.22,40);break;
    case'shield':tone(1200,.08,'sine',.07,700);break;
    case'portal':tone(120,1.1,'sine',.12,520);noise(.9,.06,1500);break;
    case'warp':tone(300,.8,'sine',.14,1800);noise(.7,.08,2500);break;
  }
}
function startMusic(){
  if(AU.music)return;
  const bass=[110,0,110,0,131,0,110,0,98,0,98,0,147,0,131,0],lead=[440,523,659,523,587,523,440,392,392,440,523,440,587,659,587,523];
  let step=0,next=0;
  AU.music=setInterval(()=>{
    const a=AU.ctx;if(!a||a.state!=='running')return;
    if(next<a.currentTime)next=a.currentTime+.06;
    while(next<a.currentTime+.3){
      const boss=G.phase==='boss',m=boss?.75:1;
      if(AU.on&&!paused&&!G.auto&&live()){const i=step%16,d=next-a.currentTime;if(bass[i])tone(bass[i]*m,.22,'triangle',.085,0,d);if(i%2===0||boss)tone(lead[i]*m,.1,'square',.016,0,d);if(i%4===2)noise(.04,.025,6000,d);if(i%4===0)tone(70,.14,'sine',.13,42,d);}   /* bombo de marcha */
      step++;next+=boss?.16:.19;
    }
  },80);
}
function setSound(on){AU.on=on;save.sound=on;storeSave();if(AU.master)AU.master.gain.value=on?.5:0;const b=$('btnSound');b.classList.toggle('off',!on);b.setAttribute('aria-pressed',String(on));}

/* ---------- interfaz ---------- */
const SCR=['scrTitle','scrPause','scrWin','scrLose','scrEnd'];
function show(id){if(id)$('retrato').hidden=true;for(const s of SCR)$(s).hidden=s!==id;$('app').classList.toggle('dim',!!id&&id!=='scrTitle');$('hud').hidden=id==='scrTitle'||G.auto;if(id)$('banner').hidden=true;}
function banner(a,b){const el=$('banner');el.textContent='';const s=document.createElement('span');s.textContent=a;el.appendChild(s);if(b){const m=document.createElement('small');m.textContent=b;el.appendChild(m);}el.hidden=false;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}
/* Retrato del jefe (la caricatura hecha con Flow) que entra un momento cuando aparece. */
function retrato(src){const el=$('retrato');if(!src){el.hidden=true;return;}el.src=src;el.hidden=false;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}
const fmtT=t=>{t=Math.round(t);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');};
let hudProg=-1,hudBoss=-1,hudChips='';
function syncHud(){
  if(G.auto)return;
  const p=Math.round(clamp(G.dist/G.len,0,1)*200)/2;if(p!==hudProg){hudProg=p;$('hudProg').style.width=p+'%';}
  const b=G.boss,on=!!b&&G.phase==='boss';if($('bossBar').hidden===on)$('bossBar').hidden=!on;
  if(on){const f=Math.round(clamp(b.hp/b.max,0,1)*200)/2;if(f!==hudBoss){hudBoss=f;$('bossFill').style.width=f+'%';}}
  const fx=G.fx,ch=[fx.escudo>0?'Paraguas '+fx.escudo:'',fx.furia>0?'Indignación '+Math.ceil(fx.furia)+'s':'',fx.hielo>0?'Paro '+Math.ceil(fx.hielo)+'s':'',fx.dron>0?'Prensa '+Math.ceil(fx.dron)+'s':'',
    G.rateBuff>0?'Ritmo +'+Math.round(G.rateBuff*100)+'%':'',G.dmgBuff>0?'Presión +'+Math.round(G.dmgBuff*100)+'%':''].filter(Boolean).join('|');
  if(ch!==hudChips){hudChips=ch;const el=$('chips');el.textContent='';for(const t of ch.split('|'))if(t){const s=document.createElement('span');s.className='chip';s.textContent=t;el.appendChild(s);}}
}
function refreshTitle(){
  const cont=save.level>0||save.owed;
  $('btnPlay').textContent=cont?'Seguir marchando · Nivel '+(save.level+1):'Marchar';
  $('btnReset').hidden=!cont;$('btnReset').textContent='Empezar de cero';$('btnReset').dataset.sure='';
}
function goTitle(){paused=false;$('banner').hidden=true;setupLevel(0,true);refreshTitle();show('scrTitle');}
function play(L){
  auInit();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();
  paused=false;hudProg=hudBoss=-1;setupLevel(L,false);show(null);
  $('hudLevel').textContent='Nivel '+(L+1);$('bossBar').hidden=true;
  banner('Nivel '+(L+1),LV[L].name);
}
const UPS=[
  {k:'start',t:'Se suman vecinos',d:'+4 manifestantes al empezar cada nivel'},
  {k:'dmg',t:'Más presión',d:'+30% de fuerza en cada reclamo'},
  {k:'rate',t:'Grito rápido',d:'+20% de ritmo de reclamo'},
  {k:'chaleco',t:'Paraguas',d:'Empezás cada nivel con un paraguas que aguanta 5 golpes'},
  {k:'suerte',t:'Buena suerte',d:'Un regalo más en cada nivel'}
];
/* Fila para elegir qué arma llevar (aparece cuando ya se compró alguna). enVivo: cambia también la partida en curso. */
function armaRow(el,enVivo){
  el.textContent='';const tiene=[0].concat(save.armas).sort();el.hidden=tiene.length<2;if(el.hidden)return;
  const s=document.createElement('span');s.textContent='Llevás:';el.appendChild(s);
  for(const i of tiene){
    const b=document.createElement('button');b.type='button';b.textContent=ARMA[i].t;b.setAttribute('aria-pressed',String(save.arma===i));
    b.addEventListener('click',()=>{sfx('click');save.arma=i;storeSave();if(enVivo)G.arma=i;armaRow(el,enVivo);});
    el.appendChild(b);
  }
}
/* Tienda entre niveles: 3 tarjetas. Si hay un arma nueva disponible va primera; el resto sale sorteado de UPS
   (el sorteo depende del nivel y de las hormigas eliminadas, así que recargar la página no lo cambia). */
function showUpgrades(stats){
  $('winStats').textContent=stats||'Te quedó una mejora por elegir.';
  const box=$('ups');box.textContent='';
  const cards=[],R=rng(save.level*97+save.kills*13+5),pool=UPS.slice();
  for(let i=1;i<ARMA.length;i++)if(save.level>=ARMA[i].desde&&!save.armas.includes(i)){cards.push({arma:i});break;}
  while(cards.length<3&&pool.length)cards.push(pool.splice((R()*pool.length)|0,1)[0]);
  for(const u of cards){
    const A=u.arma?ARMA[u.arma]:null;
    const b=document.createElement('button');b.type='button';b.className=A?'up arma':'up';
    const l=document.createElement('span'),t=document.createElement('b'),lv=document.createElement('span');
    t.textContent=A?A.t:u.t;l.appendChild(t);l.appendChild(document.createTextNode(A?A.d:u.d));
    lv.className='lv';lv.textContent=A?'Arma nueva':'Nv. '+(save.upg[u.k]+1);
    b.appendChild(l);b.appendChild(lv);
    b.addEventListener('click',()=>{sfx('click');if(A){save.armas.push(u.arma);save.arma=u.arma;}else save.upg[u.k]++;save.owed=false;storeSave();play(save.level);});
    box.appendChild(b);
  }
  armaRow($('armasWin'),false);
  show('scrWin');
}
function onWin(){
  save.kills+=G.kills;save.time+=G.time;save.retry=0;
  if(G.level>=LV.length-1){
    $('endStats').textContent=save.kills+' clones espantados en '+fmtT(save.time)+' de marcha.';
    resetSave();storeSave();
    show('scrEnd');
  }else{
    save.level=G.level+1;save.owed=true;storeSave();
    showUpgrades(G.kills+' clones espantados · marcha final: '+G.N);
  }
}
function onLose(){
  save.retry++;storeSave();
  const pct=Math.round(clamp(G.dist/G.len,0,1)*100);
  $('loseStats').textContent=G.phase==='lost'&&G.boss?'Llegaste hasta '+G.boss.def.name.split(',')[0]+'. Le quedaba '+Math.ceil(G.boss.hp/G.boss.max*100)+'% de aguante.':'Recorriste el '+pct+'% del recorrido.';
  $('btnRetry').textContent='Reintentar con +'+Math.min(8,2*save.retry)+' vecinos';
  show('scrLose');
}
function togglePause(){
  if(G.auto||!live())return;
  paused=!paused;if(paused)armaRow($('armasPause'),true);show(paused?'scrPause':null);
}
$('btnPlay').addEventListener('click',()=>{auInit();sfx('click');if(save.owed)showUpgrades('');else play(save.level);});
$('btnReset').addEventListener('click',e=>{
  const b=e.currentTarget;
  if(!b.dataset.sure){b.dataset.sure='1';b.textContent='¿Seguro? Tocá de nuevo para borrar';return;}
  resetSave();storeSave();play(0);
});
$('btnPause').addEventListener('click',togglePause);
$('btnResume').addEventListener('click',togglePause);
$('btnRestart').addEventListener('click',()=>play(G.level));
$('btnHome').addEventListener('click',goTitle);
$('btnLoseHome').addEventListener('click',goTitle);
$('btnRetry').addEventListener('click',()=>play(G.level));
$('btnAgain').addEventListener('click',()=>play(0));
$('btnSound').addEventListener('click',()=>{auInit();setSound(!AU.on);});

/* ---------- controles ---------- */
let drag=null;const keys={l:0,r:0};
const lim=()=>TW-.45;
cv.addEventListener('pointerdown',e=>{
  if(G.auto||paused)return;
  if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();
  drag={id:e.pointerId,sx:e.clientX,gx:G.tx};
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
  e.preventDefault();
});
cv.addEventListener('pointermove',e=>{
  if(G.auto||paused)return;
  if(e.pointerType==='mouse'){const r=cv.getBoundingClientRect();G.tx=clamp(R3.aMundo(e.clientX-r.left),-lim(),lim());}
  else if(drag&&e.pointerId===drag.id)G.tx=clamp(drag.gx+(e.clientX-drag.sx)/R3.unit*1.3,-lim(),lim());
});
const endDrag=e=>{if(drag&&e.pointerId===drag.id)drag=null;};
cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{
  const k=e.key;
  if(k==='ArrowLeft'||k==='a'||k==='A'){keys.l=1;e.preventDefault();}
  else if(k==='ArrowRight'||k==='d'||k==='D'){keys.r=1;e.preventDefault();}
  else if(k==='Escape'||k==='p'||k==='P')togglePause();
});
addEventListener('keyup',e=>{const k=e.key;if(k==='ArrowLeft'||k==='a'||k==='A')keys.l=0;else if(k==='ArrowRight'||k==='d'||k==='D')keys.r=0;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!G.auto&&live()&&!paused)togglePause();});
addEventListener('resize',()=>R3.resize());

/* ---------- bucle ---------- */
function checkEnd(){
  if(G.shown)return;
  // con portal de salida se espera a que el escuadrón lo cruce
  if(G.phase==='won'&&(G.portal&&G.portal.out?G.warp>=1||G.endT>9:G.endT>2.3)){G.shown=true;if(G.auto)setupLevel(0,true);else onWin();}
  else if(G.phase==='lost'&&G.endT>1.4){G.shown=true;if(G.auto)setupLevel(0,true);else onLose();}
}
let last=0,lento=0,ultQ=0;
function frame(ts){
  requestAnimationFrame(frame);
  let dt=(ts-last)/1000;last=ts;
  if(dt>0&&dt<.25&&!paused){lento=lento*.96+dt*.04;if(lento>.026&&ts-ultQ>3000){R3.lento();ultQ=ts;lento=.016;}}
  if(!(dt>0)||dt>.25)dt=.016;
  if(dt>.05)dt=.05;
  if(!paused){
    if(G.auto||G.pilot)G.tx=autopilot();
    else if(keys.l||keys.r)G.tx=clamp(G.tx+(keys.r-keys.l)*11*dt,-lim(),lim());
    if(G.slow<1)G.slow=Math.min(1,G.slow+dt*.8);
    const steps=dt>.025?2:1;
    for(let i=0;i<steps;i++)update(dt/steps*G.slow);
    checkEnd();
  }
  R3.render();syncHud();
}

try{R3=crearRender({G,ants,bullets,parts,floats,soldiers,escapes,idos,ANT,LV,PAL,GAD,PCOL,TW,FAR,FUEGO,sqR,opText,opGood});}
catch(e){console.error(e);$('sinWebgl').hidden=false;throw e;}
loadSave();
AU.on=save.sound;$('btnSound').classList.toggle('off',!AU.on);$('btnSound').setAttribute('aria-pressed',String(AU.on));
setupLevel(0,true);
R3.resize();
refreshTitle();
window.__antPlay=(L,pilot,upg,arma)=>{if(upg)Object.assign(save.upg,upg);if(arma){if(!save.armas.includes(arma))save.armas.push(arma);save.arma=arma;}play(L);G.pilot=!!pilot;};
/* Adelanta la partida (sec segundos con piloto automático) y dibuja. fin = cuadros que sigue después de ganar o perder (por defecto hasta la pantalla siguiente). */
window.__antStep=(sec,idle,fin)=>{paused=false;for(let i=0;i<sec*60&&live();i++){if(!idle)G.tx=autopilot();update(1/60);}if(!live()){for(let i=0;i<(fin==null?330:fin);i++)update(1/60);if(fin==null)checkEnd();}R3.render();syncHud();return G.phase+' N'+G.N+' ants'+ants.length+' gifts'+G.nGift+' warp'+G.warp.toFixed(2);};
window.__antCfg={LV,FUEGO,RAYO,ANT,G,BOSS};
/* Cuando terminan de cargar las letras se repintan las texturas que llevan texto. */
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>R3.fuentes());
window.__antGift=k=>{useGift({kind:k});R3.render();syncHud();};
requestAnimationFrame(frame);
window.__juegoListo=true;
