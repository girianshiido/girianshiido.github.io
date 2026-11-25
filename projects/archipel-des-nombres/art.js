import {spots} from './engine.ts';

const colors = {
  shell: ['#f69b81','#fbcab3','#ac4b48'], fish: ['#55adbe','#a7e0dc','#23697e'],
  berry: ['#ec6c73','#ffd1bc','#9d3d54'], flower: ['#f797b1','#ffcf65','#ac546c'],
  leaf: ['#64b894','#a7d9a8','#348371'], star: ['#f4c35b','#ffdf85','#a97134'],
  seed: ['#b87849','#f6ce8a','#7f4b3e'], pearl: ['#d9b5ce','#fff2ea','#816a9b'], lantern: ['#f3ab55','#ffe6a4','#704537'],
};
function circle(ctx,x,y,r,color) {
  ctx.beginPath(); ctx.arc(x,y,r,0,2*Math.PI); ctx.fillStyle=color; ctx.fill();
}
function ellipse(ctx,x,y,rx,ry,color) {
  ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,2*Math.PI); ctx.fillStyle=color; ctx.fill();
}
function paint(ctx,color,trace) {
  ctx.beginPath(); trace(ctx); ctx.closePath(); ctx.fillStyle=color; ctx.fill();
}
function line(ctx,color,width,trace) {
  ctx.beginPath(); trace(ctx); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();
}
function rect(ctx,x,y,w,h,r,color) {
  ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);
  else {ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);}
  ctx.fillStyle=color;ctx.fill();
}
export function drawToken(ctx,name,x,y,size) {
  ctx.save(); ctx.translate(x,y); ctx.scale(size/100,size/100);
  const [main,light,dark]=colors[name]||colors.shell;
  ellipse(ctx,0,38,34,5,'#253e4424');
  if(name==='shell') {
    paint(ctx,dark,p=>{p.moveTo(-10,34);p.bezierCurveTo(-88,2,-44,-61,0,-45);p.bezierCurveTo(44,-61,88,2,10,34);});
    paint(ctx,main,p=>{p.moveTo(-8,28);p.bezierCurveTo(-80,-1,-42,-58,0,-40);p.bezierCurveTo(42,-58,80,-1,8,28);});
    for(let i=-2;i<=2;i++) line(ctx,light,4,p=>{p.moveTo(i*3.7,22);p.quadraticCurveTo(i*13,-7,i*16,-31+8*Math.abs(i));});
    rect(ctx,-13,24,26,10,4,light);
  } else if(name==='fish') {
    paint(ctx,dark,p=>{p.moveTo(23,0);p.quadraticCurveTo(40,-22,49,-24);p.quadraticCurveTo(42,-4,49,24);p.quadraticCurveTo(38,21,23,0);});
    ellipse(ctx,-6,1,36,24,main);
    paint(ctx,light,p=>{p.moveTo(-10,-12);p.quadraticCurveTo(9,-5,11,6);p.quadraticCurveTo(1,13,-10,10);});
    circle(ctx,-27,-4,4.5,'#123c4b');circle(ctx,-28,-5,1.3,'#fff');
    ellipse(ctx,-31,6,5,3,'#f7b6a1');
  } else if(name==='berry') {
    paint(ctx,main,p=>{p.moveTo(0,-19);p.bezierCurveTo(-31,-32,-43,-9,-32,13);p.bezierCurveTo(-21,40,-9,39,0,35);p.bezierCurveTo(13,39,22,38,32,12);p.bezierCurveTo(43,-15,27,-28,0,-19);});
    line(ctx,dark,5,p=>{p.moveTo(0,-19);p.quadraticCurveTo(4,-37,14,-44);});
    paint(ctx,'#559971',p=>{p.moveTo(4,-23);p.quadraticCurveTo(11,-49,35,-41);p.quadraticCurveTo(27,-20,4,-23);});
    line(ctx,light,6,p=>{p.moveTo(-24,0);p.quadraticCurveTo(-25,-8,-18,-14);});
  } else if(name==='flower') {
    line(ctx,'#4f9271',7,p=>{p.moveTo(0,38);p.lineTo(0,-7);});
    for(let i=0;i<6;i++){const a=i*Math.PI/3;circle(ctx,23*Math.cos(a),-8+23*Math.sin(a),14,main);}
    circle(ctx,0,-8,17,dark);circle(ctx,0,-9,14,light);
    circle(ctx,-4,-13,2,'#fff8dc');circle(ctx,4,-7,2,'#e7a85e');
  } else if(name==='leaf') {
    paint(ctx,main,p=>{p.moveTo(-30,29);p.quadraticCurveTo(-54,-23,38,-39);p.quadraticCurveTo(48,34,-30,29);});
    line(ctx,dark,4,p=>{p.moveTo(-34,38);p.quadraticCurveTo(-7,7,24,-21);});
    line(ctx,light,3,p=>{p.moveTo(-9,11);p.lineTo(-15,-13);p.moveTo(2,2);p.lineTo(24,2);p.moveTo(12,-8);p.lineTo(11,-23);});
  } else if(name==='seed') {
    paint(ctx,dark,p=>{p.moveTo(4,-42);p.bezierCurveTo(55,-6,42,28,0,39);p.bezierCurveTo(-43,31,-52,-5,4,-42);});
    paint(ctx,main,p=>{p.moveTo(4,-37);p.bezierCurveTo(50,-5,39,25,0,34);p.bezierCurveTo(-34,24,-44,-6,4,-37);});
    line(ctx,light,5,p=>{p.moveTo(1,-27);p.bezierCurveTo(-9,-11,-10,11,0,26);});
    line(ctx,light,3,p=>{p.moveTo(7,-23);p.quadraticCurveTo(21,-10,22,2);});
  } else if(name==='pearl') {
    circle(ctx,0,-3,37,dark);
    const shimmer=ctx.createRadialGradient(-13,-19,3,0,-3,34);
    shimmer.addColorStop(0,'#ffffff');shimmer.addColorStop(.45,light);shimmer.addColorStop(.79,main);shimmer.addColorStop(1,'#9a81ad');
    circle(ctx,0,-4,34,shimmer);
    ellipse(ctx,-12,-22,12,5,'#ffffffbf');
    circle(ctx,16,14,4,'#f4e7ff99');
  } else if(name==='lantern') {
    line(ctx,dark,7,p=>{p.moveTo(-14,-26);p.bezierCurveTo(-14,-56,14,-56,14,-26);});
    rect(ctx,-29,-27,58,65,13,dark);
    rect(ctx,-21,-23,42,54,11,main);
    ellipse(ctx,0,1,16,20,light);
    ellipse(ctx,0,5,9,13,'#fff6d6');
    line(ctx,dark,4,p=>{p.moveTo(-25,-21);p.lineTo(25,32);p.moveTo(25,-21);p.lineTo(-25,32);});
    rect(ctx,-32,-29,64,9,4,dark);
    rect(ctx,-32,29,64,9,4,dark);
  } else if(name==='star') {
    paint(ctx,dark,p=>{for(let i=0;i<10;i++){const a=Math.PI*i/5-Math.PI/2;const r=i%2?20:45;p.lineTo(Math.cos(a)*r,Math.sin(a)*r);}});
    paint(ctx,main,p=>{for(let i=0;i<10;i++){const a=Math.PI*i/5-Math.PI/2;const r=i%2?17:39;p.lineTo(Math.cos(a)*r,Math.sin(a)*r-1);}});
    circle(ctx,-8,-5,3.5,'#644525');circle(ctx,8,-5,3.5,'#644525');
    line(ctx,'#644525',2,p=>{p.moveTo(-4,4);p.quadraticCurveTo(0,8,4,4);});
  }
  ctx.restore();
}
const paths = {
  map:'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15',
  user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  settings:'M4 7h16 M4 17h16 M9 4v6 M15 14v6',
  install:'M12 3v12m-5-5 5 5 5-5 M4 15v5h16v-5',
  lock:'M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4 M12 15v2',
  arrow:'M5 12h14m-7-7 7 7-7 7',
  back:'M19 12H5m7-7-7 7 7 7',
  arrowSmall:'M9 5l7 7-7 7',
  sound:'M3 9h4l5-4v14l-5-4H3z M16 8a6 6 0 0 1 0 8 M19 5a10 10 0 0 1 0 14',
  mute:'M3 9h4l5-4v14l-5-4H3z M16 9l5 6m0-6-5 6',
  check:'M4 12l5 5L20 6',
  close:'M6 6l12 12M18 6 6 18',
  plus:'M5 12h14m-7-7v14',
  minus:'M5 12h14',
  spark:'M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z',
  beacon:'M7 21h10L15 9H9z M8 9h8V5H8z M7 5l5-3 5 3 M3 5l2 1m14 0 2-1 M4 11l2-1m12 0 2 1 M7.9 16h8.2',
  shell:'M8 19C2 15 2 7 7 7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c5 0 5 8-1 12z M9 17 6 11m6 6V8m3 9 3-6',
  echo:'M3 12h2m3-4v8m4-12v16m4-12v8m3-4h2',
  dice:'M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z M7 7h.01 M12 12h.01 M17 17h.01',
  flower:'M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M12 9c-5-8 5-8 1 0 8-5 10 4 2 4 7 5-2 10-3 2-3 8-11 2-3-2-9-1-5-10 3-4Z',
  lamp:'M8 17h8v4H8z M9 17c0-4-4-4-4-9a7 7 0 0 1 14 0c0 5-4 5-4 9 M12 17v-6m-3-1 3 2 3-2',
  chart:'M4 3v17h17 M8 15v-4m5 4V8m5 7V5',
  basket:'M3 10h18l-2 10H5z M8 10l3-6m5 6-3-6 M9 14v3m6-3v3',
};
export function icon(name) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[name]||paths.spark)+'"/></svg>';
}

export function setCanvas(canvas) {
  const w=canvas.clientWidth, h=canvas.clientHeight;
  if(!w||!h) return null;
  const ratio=Math.min(2,devicePixelRatio||1);
  const width=Math.round(w*ratio), height=Math.round(h*ratio);
  if(canvas.width!==width) canvas.width=width;
  if(canvas.height!==height) canvas.height=height;
  const ctx=canvas.getContext('2d');
  if(!ctx) return null;
  ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.clearRect(0,0,w,h);
  return {ctx,w,h};
}
export function drawBasket(canvas) {
  const area=setCanvas(canvas);
  if(!area)return;
  const {ctx,w,h}=area;
  const middle=w/2,left=8,right=w-8,top=33,bottom=h-30;
  ellipse(ctx,middle,h-5,w*.39,4,'#6841272d');

  const handle=p=>{
    p.moveTo(w*.26,top+7);
    p.bezierCurveTo(w*.28,-5,w*.72,-5,w*.74,top+7);
  };
  line(ctx,'#714329',12,handle);
  line(ctx,'#cb8f4c',8,handle);
  line(ctx,'#eabd7f',3,handle);

  const wall=p=>{
    p.moveTo(left,bottom-10);
    p.bezierCurveTo(left+7,h-25,left+19,h-10,left+39,h-8);
    p.quadraticCurveTo(middle,h+1,right-39,h-8);
    p.bezierCurveTo(right-19,h-10,right-7,h-25,right,bottom-10);
  };
  const weave=ctx.createLinearGradient(0,bottom-10,0,h-4);
  weave.addColorStop(0,'#e1ad6b');
  weave.addColorStop(1,'#9c5e34');
  paint(ctx,weave,wall);
  ctx.save();
  ctx.clip();
  for(let y=bottom-1,row=0;y<h;y+=6,row++){
    for(let x=left+(row%2)*8-16;x<right;x+=16){
      line(ctx,row%2?'#8b4f2d':'#9d5d35',2,p=>{
        p.moveTo(x,y+2);p.quadraticCurveTo(x+8,y-2,x+15,y+3);
      });
      line(ctx,'#f2c58b',1,p=>{
        p.moveTo(x+2,y+1);p.quadraticCurveTo(x+8,y-2,x+13,y+1);
      });
    }
  }
  ctx.restore();
  line(ctx,'#784427',2,wall);

  const rim=p=>{
    p.moveTo(left+24,top-1);
    p.quadraticCurveTo(middle,top-9,right-24,top-1);
    p.bezierCurveTo(right+7,top+3,right+6,bottom-5,right-25,bottom);
    p.quadraticCurveTo(middle,bottom+7,left+25,bottom);
    p.bezierCurveTo(left-6,bottom-5,left-7,top+3,left+24,top-1);
  };
  const liner=ctx.createLinearGradient(0,top,0,bottom);
  liner.addColorStop(0,'#f1d8ae');
  liner.addColorStop(.33,'#fff3d6');
  liner.addColorStop(1,'#f6debb');
  paint(ctx,liner,rim);
  line(ctx,'#835030',8,rim);
  line(ctx,'#c68a4c',5,rim);
  line(ctx,'#eab97d',2,rim);
}

export function collection(canvas, info) {
  const scene=setCanvas(canvas);
  if(!scene) return;
  const {ctx,w,h}=scene;
  if(info.hidden) return;
  const {n,layout,seed,token,marked,scale=1} = info;
  const isDouble=n>5;
  const isCard=canvas.classList.contains('mini-canvas');
  const contrast=document.documentElement.dataset.contrast==='true';
  if(layout==='dice') {
    const size=Math.min(w*.86,h*.88);
    rect(ctx,w/2-size/2,h/2-size/2+4,size,size,size*.16,contrast?'#23536b':'#b4c9cd');
    rect(ctx,w/2-size/2,h/2-size/2,size,size,size*.16,'#fffaf0');
    for(const [x,y] of spots(n,'dice',seed)) circle(ctx,w/2+(x-.5)*size,h/2+(y-.5)*size,size*.072,'#19474c');
    return;
  }
  const wide=layout==='frame'||layout==='line';
  const area=Math.min(w, h*(wide?2.8:2.65));
  const origin=(w-area)/2;
  const points=spots(n,layout,seed);
  const size=Math.min(w*(isDouble?.126:.17),h*(wide?.39:.245),isCard?31:73)*scale;
  if(layout==='frame') {
    const rows=n>5?2:1, gap=area*.18, side=Math.min(gap*.91,h*(rows===2?.35:.47));
    for(let i=0;i<rows*5;i++){
      const x=origin+(.14+.18*(i%5))*area;
      const y=(rows===1?.5:.28+.44*Math.floor(i/5))*h;
      rect(ctx,x-side/2,y-side/2,side,side,side*.22,contrast?'#ccdadd':'#d6eee5');
      rect(ctx,x-side/2+1.6,y-side/2+1.6,side-3.2,side-3.2,side*.21,'#fffdf2');
    }
  }
  if(n===0){
    line(ctx,contrast?'#557d84':'#9dc6be',2,p=>{p.moveTo(w*.40,h*.67);p.quadraticCurveTo(w*.5,h*.71,w*.60,h*.67);});
  }
  points.forEach(([x,y],i)=>{
    const px=origin+x*area, py=y*h;
    if(marked?.has(i)) circle(ctx,px,py,size*.61,contrast?'#b4dbd1':'#b0e2ca');
    drawToken(ctx,token,px,py,size);
    if(marked?.has(i)) {
      const bx=px+size*.36, by=py-size*.32;
      circle(ctx,bx,by,Math.max(7,size*.185),'#175a51');
      ctx.fillStyle='#fff';ctx.font='bold '+Math.max(10,size*.22)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(String(marked.order?.indexOf(i)+1||i+1),bx,by+1);
    }
  });
}
export function hitPositions(canvas,n,layout,seed) {
  const w=canvas.clientWidth,h=canvas.clientHeight;
  const area = Math.min(w,h*((layout==='line'||layout==='frame')?2.8:2.65));
  return spots(n,layout,seed).map(([x,y])=>[ ((w-area)/2+x*area)/w*100, y*100 ]);
}
