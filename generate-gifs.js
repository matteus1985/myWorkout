// Generates original, small movement-family GIFs with no external media or dependencies.
// Run with: node generate-gifs.js
const fs = require('fs');
const path = require('path');
const W=112,H=112, BG=0, INK=1, RED=2, PALE=3;
const patterns=['incline-press','chest-press','row','vertical-pull','fly','lateral-raise','hip-thrust','hinge','knee-extension','leg-curl','calf-raise','crunch','rear-delt','curl','triceps','leg-raise','pullover','dip'];
const outDir=path.join(__dirname,'media');fs.mkdirSync(outDir,{recursive:true});
function frame(name,t){
  const p=new Uint8Array(W*H);p.fill(BG);
  const point=(x,y,c,r=2)=>{x=Math.round(x);y=Math.round(y);for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++)if(xx*xx+yy*yy<=r*r&&x+xx>=0&&x+xx<W&&y+yy>=0&&y+yy<H)p[(y+yy)*W+x+xx]=c;};
  const line=(x1,y1,x2,y2,c=INK,r=2)=>{const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1))*2;for(let i=0;i<=n;i++)point(x1+(x2-x1)*i/n,y1+(y2-y1)*i/n,c,r);};
  const head=(x,y)=>point(x,y,INK,7);
  const floor=()=>line(12,99,100,99,PALE,1);
  const stand=()=>{floor();head(55,26);line(55,35,55,67);line(55,67,43,95);line(55,67,69,95);};
  const bar=(x1,y1,x2,y2)=>{line(x1,y1,x2,y2,RED,2);point(x1,y1,RED,4);point(x2,y2,RED,4);};
  switch(name){
    case 'incline-press': case 'chest-press':{
      floor();line(27,76,79,76,PALE,3);head(31,61);line(39,64,71,76);line(71,76,83,96);line(67,76,58,96);const y=58-30*t;line(52,68,55,y+11);line(55,y+11,55,y,INK);line(69,68,75,y+11);line(75,y+11,75,y,INK);bar(43,y,87,y);break;
    }
    case 'row':{
      floor();head(35,40);line(42,46,74,63);line(74,63,81,94);line(74,63,60,94);const x=86-25*t;line(51,52,x,60,INK);line(63,56,x+5,69,INK);bar(x,59,x+5,72);break;
    }
    case 'vertical-pull':{
      stand();const y=12+36*t;bar(27,y,83,y);line(52,39,37,41+23*(1-t));line(37,41+23*(1-t),35,y);line(58,39,73,41+23*(1-t));line(73,41+23*(1-t),75,y);break;
    }
    case 'fly':{
      stand();const x=28+22*t,y=49+6*t;line(54,40,x,y);line(58,40,112-x,y);point(x,y,RED,4);point(112-x,y,RED,4);break;
    }
    case 'lateral-raise': case 'rear-delt':{
      stand();const y=68-29*t;line(53,39,29,y);line(57,39,81,y);point(29,y,RED,4);point(81,y,RED,4);break;
    }
    case 'hip-thrust':{
      floor();line(11,61,39,61,PALE,4);head(30,48);const hy=83-23*t;line(36,55,60,hy);line(60,hy,82,75);line(82,75,85,98);bar(51,hy-4,69,hy-4);break;
    }
    case 'hinge':{
      floor();const a=1-t;head(54-24*a,28+30*a);line(54-18*a,38+26*a,57,68);line(57,68,48,95);line(57,68,68,95);line(50-12*a,48+18*a,43-7*a,74);line(60-12*a,49+18*a,55-7*a,74);bar(34-7*a,74,64-7*a,74);break;
    }
    case 'knee-extension':{
      floor();line(24,60,73,60,PALE,3);head(36,35);line(38,43,51,60);line(51,60,70,62);const y=88-23*t;line(70,62,82,y);point(82,y,RED,4);break;
    }
    case 'leg-curl':{
      floor();line(15,64,91,64,PALE,3);head(24,51);line(31,57,62,56);line(62,56,80,62);const x=91-20*t,y=85-22*t;line(80,62,x,y);point(x,y,RED,4);break;
    }
    case 'calf-raise':{
      floor();const lift=11*t;head(55,24-lift);line(55,32-lift,55,64-lift);line(55,64-lift,44,91-lift);line(55,64-lift,68,91-lift);line(44,91-lift,51,98);line(68,91-lift,74,98);bar(37,36-lift,75,36-lift);break;
    }
    case 'crunch':{
      floor();head(25+10*t,77-14*t);line(32+10*t,79-12*t,56,84);line(56,84,72,75);line(72,75,84,97);line(56,84,46,97);break;
    }
    case 'curl':{
      stand();const y=73-27*t;line(52,40,48,62);line(48,62,37,y);line(58,40,63,62);line(63,62,75,y);bar(36,y,76,y);break;
    }
    case 'triceps':{
      stand();const y=53+27*t;line(52,40,46,53);line(46,53,41,y);line(58,40,67,53);line(67,53,72,y);bar(35,y,78,y);break;
    }
    case 'leg-raise':{
      line(25,12,87,12,PALE,3);head(55,30);line(55,38,55,67);line(55,40,38,12);line(55,40,72,12);const y=92-28*t;line(55,67,44,y);line(55,67,67,y);break;
    }
    case 'pullover':{
      stand();const y=18+42*t;line(53,39,43,y);line(57,39,69,y);bar(36,y,76,y);break;
    }
    case 'dip':{
      floor();line(25,45,41,45,PALE,3);line(69,45,85,45,PALE,3);const drop=17*t;head(55,27+drop);line(55,36+drop,55,66+drop);line(55,66+drop,44,85+drop*.5);line(55,66+drop,68,85+drop*.5);line(53,42+drop,41,45);line(57,42+drop,69,45);break;
    }
  }
  return p;
}
function gif(name){
  const chunks=[], u16=n=>Buffer.from([n&255,n>>8]);
  chunks.push(Buffer.from('GIF89a'),u16(W),u16(H),Buffer.from([0xF1,0,0]));
  chunks.push(Buffer.from([255,246,246,52,14,20,210,22,54,238,189,199]));
  chunks.push(Buffer.from([0x21,0xFF,0x0B]),Buffer.from('NETSCAPE2.0'),Buffer.from([3,1,0,0,0]));
  const steps=[0,.25,.5,.75,1,.75,.5,.25];
  for(const t of steps){
    chunks.push(Buffer.from([0x21,0xF9,4,0,12,0,0,0]));
    chunks.push(Buffer.from([0x2C,0,0,0,0]),u16(W),u16(H),Buffer.from([0,2]));
    const pixels=frame(name,t),bytes=[];let bits=0,count=0;
    const emit=code=>{bits|=code<<count;count+=3;while(count>=8){bytes.push(bits&255);bits>>=8;count-=8;}};
    for(const pixel of pixels){emit(4);emit(pixel);}emit(5);if(count)bytes.push(bits&255);
    for(let i=0;i<bytes.length;i+=255)chunks.push(Buffer.from([Math.min(255,bytes.length-i)]),Buffer.from(bytes.slice(i,i+255)));
    chunks.push(Buffer.from([0]));
  }
  chunks.push(Buffer.from([0x3B]));
  fs.writeFileSync(path.join(outDir,name+'.gif'),Buffer.concat(chunks));
}
for(const name of patterns)gif(name);
