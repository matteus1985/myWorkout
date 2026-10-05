/* Original static vector anatomy plates: two poses, equipment and movement cues. */
window.LIFT_SKETCHES=(()=>{
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const p=(x,y)=>[x,y],add=(a,b)=>[a[0]+b[0],a[1]+b[1]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],mul=(a,k)=>[a[0]*k,a[1]*k],mid=(a,b)=>mul(add(a,b),.5),len=a=>Math.hypot(...a),unit=a=>mul(a,1/(len(a)||1)),xy=a=>a.join(','),line=(a,b,cls='metal')=>`<path class="${cls}" d="M${xy(a)}L${xy(b)}"/>`;
  function capsule(a,b,r1,r2,highlight=false){const n=mul([-sub(b,a)[1],sub(b,a)[0]],1/(len(sub(b,a))||1)),a1=add(a,mul(n,r1)),a2=add(a,mul(n,-r1)),b1=add(b,mul(n,r2)),b2=add(b,mul(n,-r2));return `<path class="limb" d="M${xy(a1)}L${xy(b1)}Q${xy(add(b,mul(unit(sub(b,a)),r2)))} ${xy(b2)}L${xy(a2)}Q${xy(add(a,mul(unit(sub(a,b)),r1)))} ${xy(a1)}Z"/>${highlight?`<path class="muscle" d="M${xy(add(a,mul(n,r1*.5)))}Q${xy(add(mid(a,b),mul(n,r1*.8)))} ${xy(add(b,mul(n,r2*.3)))}L${xy(add(b,mul(n,-r2*.3)))}Q${xy(add(mid(a,b),mul(n,-r1*.5)))} ${xy(add(a,mul(n,-r1*.5)))}Z"/>`:''}${line(add(a,mul(n,r1*.35)),add(b,mul(n,r2*.2)),'anatomy')}`;}
  function anatomy(q,item){
    const u=unit(sub(q.h,q.s)),n=[-u[1],u[0]],sh1=add(q.s,mul(n,31)),sh2=add(q.s,mul(n,-31)),hp1=add(q.h,mul(n,23)),hp2=add(q.h,mul(n,-23));
    const chest=item.primary.includes('Chest'),back=item.primary.includes('Back'),arms=item.primary.some(m=>m==='Biceps'||m==='Triceps'),forearms=item.primary.includes('Forearms'),delts=item.primary.some(m=>/delts|Shoulders/i.test(m)),traps=item.primary.some(m=>/traps/i.test(m)),quad=item.primary.includes('Quadriceps'),ham=item.primary.includes('Hamstrings'),calf=item.primary.includes('Calves'),abs=item.primary.includes('Abs'),hip=item.primary.includes('Glutes');
    const torso=`M${xy(sh1)}Q${xy(add(mid(sh1,hp1),mul(n,7)))} ${xy(hp1)}Q${xy(add(q.h,mul(u,10)))} ${xy(hp2)}Q${xy(add(mid(sh2,hp2),mul(n,-7)))} ${xy(sh2)}Q${xy(add(q.s,mul(u,-10)))} ${xy(sh1)}Z`;
    const angle=Math.atan2(u[1],u[0])*180/Math.PI-90,head=add(q.s,mul(u,-38));
    const armsSvg=[0,1].map(i=>capsule(i?sh2:sh1,q.e[i],11,8,arms)+capsule(q.e[i],q.w[i],8,5,forearms)+`<ellipse class="skin" cx="${q.w[i][0]}" cy="${q.w[i][1]}" rx="6" ry="8"/>`).join('');
    const legsSvg=[0,1].map(i=>capsule(i?hp2:hp1,q.k[i],15,10,quad||ham)+capsule(q.k[i],q.a[i],10,6,calf)+`<path class="shoe" d="M${q.a[i][0]-6} ${q.a[i][1]-5}q8-2 13 7l14 5q3 8-8 8h-21z"/>`).join('');
    return `${legsSvg}<path class="skin" d="${torso}"/><g transform="translate(${q.s[0]} ${q.s[1]}) rotate(${angle})"><path class="${chest||back?'muscle':'anatomy-fill'}" d="M-26 8q12-7 24 3v23q-20 2-26-12zM26 8q-12-7-24 3v23q20 2 26-12z"/><path class="anatomy" d="M0 5v69M-22 35q10 7 20 0M22 35q-10 7-20 0M-18 48h13M5 48h13M-16 61h11M5 61h11"/>${abs?'<path class="muscle" d="M-13 38h26v34h-26z"/>':''}<path class="shorts" d="M-23 75h46l4 23-25 4-2-10-2 10-25-4z"/>${hip?'<path class="muscle" d="M-21 78h42v18h-42z"/>':''}</g>${capsule(add(q.s,mul(u,-9)),add(q.s,mul(u,-24)),8,7)}<g transform="translate(${head[0]} ${head[1]}) rotate(${angle})"><ellipse class="skin" rx="14" ry="19"/><path class="hair" d="M-14-3q-3-24 20-17q10 4 8 15l-5-6-14 2z"/><path class="anatomy" d="M5-3h3m-1 3 3 5-5 1m-5 5h8"/></g>${armsSvg}`;
  }
  const standing=()=>({s:p(220,125),h:p(220,245),e:[p(170,215),p(270,215)],w:[p(166,275),p(274,275)],k:[p(190,330),p(250,330)],a:[p(185,415),p(255,415)]});
  const seated=()=>({s:p(185,155),h:p(205,265),e:[p(140,225),p(240,225)],w:[p(160,280),p(265,280)],k:[p(285,290),p(305,275)],a:[p(287,415),p(322,412)]});
  const supine=(incline=true)=>({s:p(145,incline?205:260),h:p(250,270),e:[p(125,235),p(215,230)],w:[p(115,160),p(220,150)],k:[p(310,315),p(342,303)],a:[p(310,415),p(355,415)]});
  function pose(item,end){
    const name=item.name.toLowerCase(),type=item.movement;let q=standing(),station='',arrow='';
    const bench=(incline=true)=>`<path class="pad" d="M115 ${incline?195:265}L255 280L305 285"/><path class="metal" d="M250 285v120m-25 0h95m-110-65-20 65m-10 0h30"/>`;
    const seat=()=>'<path class="pad" d="M156 155v122h86"/><path class="metal" d="M200 277v125m-45 8h110"/>';
    if(type==='press'){
      if(/push-up/.test(name)){q={s:p(145,end?245:280),h:p(255,290),e:[p(130,315),p(184,315)],w:[p(140,375),p(194,375)],k:[p(320,325),p(342,325)],a:[p(365,375),p(392,375)]};if(/kneeling/.test(name))q.a=[p(335,360),p(355,360)];if(/incline push/.test(name)){q.s[1]-=60;q.e.forEach(v=>v[1]-=80);q.w.forEach(v=>v[1]-=90);station='<path class="pad" d="M105 290h115"/><path class="metal" d="M110 290v120m95-120v120"/>';}}
      else if(item.equipment==='machine'||/cable chest|band chest/.test(name)){q=seated();if(end){q.e=[p(205,185),p(285,180)];q.w=[p(255,185),p(338,185)];}else{q.e=[p(145,200),p(260,195)];q.w=[p(160,150),p(280,148)];}station=seat();}
      else{const incline=item.pattern==='inclinePress';q=supine(incline);station=/floor/.test(name)?'':bench(incline);if(end){q.e=[p(145,incline?125:180),p(225,incline?120:175)];q.w=[p(150,incline?65:115),p(230,incline?65:110)];}}
    }else if(type==='fly'){
      if(/dumbbell|supine|incline cable/.test(name)){q=supine(/incline/.test(name));station=bench(/incline/.test(name));q.e=end?[p(153,155),p(224,150)]:[p(98,235),p(264,205)];q.w=end?[p(170,95),p(236,90)]:[p(62,218),p(310,185)];}
      else {if(/pec deck|chest-supported/.test(name)){q=seated();station=seat();}q.e=end?[p(195,165),p(255,165)]:[p(135,145),p(308,145)];q.w=end?[p(216,/low-to-high/.test(name)?130:182),p(235,/low-to-high/.test(name)?130:182)]:[p(85,180),p(354,180)];}
    }else if(type==='row'){
      if(/seated|machine|band row|cable row/.test(name)){q=seated();station=item.equipment==='machine'?seat():'';q.e=end?[p(160,205),p(252,205)]:[p(240,170),p(287,160)];q.w=end?[p(195,220),p(270,220)]:[p(293,180),p(344,170)];}
      else if(/inverted|ring row/.test(name)){q={s:p(130,end?225:280),h:p(245,315),e:[p(170,185),p(225,190)],w:[p(172,130),p(235,130)],k:[p(305,355),p(326,345)],a:[p(365,414),p(386,410)]};station='<path class="metal" d="M75 128h205m-198 0v288"/>';}
      else {q.s=p(165,205);q.h=p(245,270);q.k=[p(230,345),p(291,345)];q.a=[p(210,415),p(310,415)];q.e=end?[p(185,230),p(275,230)]:[p(145,270),p(215,267)];q.w=end?[p(205,268),p(292,262)]:[p(140,330),p(212,328)];if(/supported|seal|humble/.test(name))station=bench(!/seal/.test(name));}
    }else if(type==='pulldown'){
      const hanging=/pull-up|chin-up/.test(name);q=hanging?standing():seated();if(hanging){q.s[1]=end?175:210;q.h[1]=end?290:330;q.k=[p(175,365),p(266,365)];q.a=[p(176,422),p(266,422)];station='<path class="metal" d="M105 48h245m-240 0v390m235-390v390"/>';}
      else station=seat();q.e=end?[p(138,135),p(295,135)]:[p(157,65),p(278,65)];q.w=end?(hanging?[p(138,50),p(295,50)]:[p(170,100),p(270,100)]):[p(145,45),p(292,45)];
    }else if(type==='pullover'){
      if(item.equipment==='dumbbell'||/floor|machine/.test(name)){q=supine(false);station=/floor/.test(name)?'':bench(false);q.e=end?[p(178,180),p(237,180)]:[p(80,218),p(140,212)];q.w=end?[p(195,105),p(245,110)]:[p(40,205),p(85,196)];}
      else{q.s=p(207,160);q.h=p(235,260);q.e=end?[p(167,225),p(274,225)]:[p(120,140),p(253,135)];q.w=end?[p(175,290),p(280,290)]:[p(83,97),p(278,85)];}
    }else if(type==='squat'||type==='lunge'){
      if(/leg press/.test(name)){q=supine(true);q.k=end?[p(315,185),p(350,180)]:[p(257,203),p(300,198)];q.a=end?[p(372,110),p(404,103)]:[p(312,145),p(353,135)];station=bench(true)+'<path class="pad" d="M300 135l105-45"/><path class="metal" d="M255 395 414 92"/>';}
      else if(type==='lunge'){q.s=p(210,end?195:135);q.h=p(219,end?300:250);q.k=[p(152,end?340:320),p(308,end?379:325)];q.a=[p(135,422),p(340,423)];q.e=[p(165,end?265:220),p(275,end?260:215)];q.w=[p(164,end?323:275),p(278,end?320:275)];if(/bulgarian/.test(name))station='<path class="pad" d="M316 374h84"/><path class="metal" d="M320 374v48m72-48v48"/>';if(/step-up/.test(name))station='<path class="pad" d="M90 360h95v70h-95z"/>';}
      else {if(end){q.s=p(213,212);q.h=p(224,315);q.k=[p(153,340),p(290,340)];q.e=[p(160,240),p(272,240)];q.w=[p(165,190),p(273,190)];}else{q.e=[p(165,160),p(274,160)];q.w=[p(165,110),p(275,110)];}if(/goblet|bodyweight|landmine/.test(name)){q.w=[p(208,end?245:180),p(233,end?245:180)];}if(/hack|pendulum/.test(name))station='<path class="metal" d="M85 80l190 335m-145-340 190 335"/><path class="pad" d="M145 145l50 94"/>';}
    }else if(type==='hinge'||type==='deadlift'){
      if(end||type==='deadlift'&&!end){q.s=p(155,235);q.h=p(250,270);q.k=[p(227,350),p(282,350)];q.e=[p(134,300),p(210,300)];q.w=[p(126,357),p(202,357)];}if(type==='deadlift'&&end)q=standing();if(/back extension/.test(name)){station='<path class="pad" d="M236 269l27 17"/><path class="metal" d="M250 285l-65 120m-28 0h125m14-55 51 50"/>';q.a=[p(300,395),p(339,388)];}
    }else if(type==='hipThrust'){
      q=supine(false);q.s=p(135,265);q.h=p(248,end?268:335);q.e=[p(174,272),p(238,279)];q.w=[p(238,end?266:325),p(274,end?266:325)];q.k=[p(305,315),p(342,314)];station='<path class="pad" d="M78 270h115"/><path class="metal" d="M87 275v135m94-135v135"/>';
    }else if(type==='legExtension'||type==='legCurl'||type==='seatedCalf'){
      q=seated();station=seat();if(type==='legExtension'){q.a=end?[p(365,275),p(386,261)]:[p(285,415),p(325,409)];}
      if(type==='legCurl'){if(/lying|prone/.test(name)){q={s:p(135,265),h:p(242,262),e:[p(95,282),p(166,282)],w:[p(68,273),p(160,292)],k:[p(305,270),p(330,259)],a:end?[p(304,193),p(332,186)]:[p(375,280),p(397,270)]};station=bench(false);}else {q.a=end?[p(240,363),p(273,355)]:[p(365,275),p(386,261)];}}
      if(/nordic/.test(name)){q.s=p(end?130:235,180);q.h=p(270,285);q.k=[p(295,390),p(327,390)];q.a=[p(360,411),p(390,411)];station='<path class="pad" d="M275 407h120"/>';}
      if(type==='seatedCalf'&&end)q.a.forEach(v=>v[1]-=18);
    }else if(type==='calf'){if(end){Object.values(q).forEach(v=>{if(Array.isArray(v[0]))v.forEach(a=>a[1]-=15);else v[1]-=15;});}station='<path class="pad" d="M154 433h134v13h-134z"/>';}
    else if(type==='lateral'||type==='rearDelt'){if(/seated|machine|pec deck/.test(name)){q=seated();station=seat();}if(/bent|prone|supported/.test(name)){q.s=p(170,203);q.h=p(240,270);station=/supported|prone/.test(name)?bench(true):'';}q.e=end?[p(130,160),p(310,160)]:[p(171,227),p(270,227)];q.w=end?[p(70,172),p(371,172)]:[p(167,288),p(278,288)];}
    else if(type==='overhead'){if(/seated|machine|arnold/.test(name)){q=seated();station=seat();}q.e=end?[p(182,88),p(253,83)]:[p(141,159),p(295,151)];q.w=end?[p(184,35),p(255,30)]:[p(149,92),p(290,83)];}
    else if(type==='facePull'){q.e=end?[p(142,126),p(297,126)]:[p(167,164),p(260,164)];q.w=end?[p(171,100),p(269,100)]:[p(168,195),p(269,195)];}
    else if(type==='upright'){q.e=end?[p(140,140),p(300,140)]:[p(173,218),p(265,218)];q.w=end?[p(190,161),p(249,161)]:[p(186,278),p(256,278)];}
    else if(type==='curl'){if(/seated|incline|preacher|concentration/.test(name)){q=seated();station=seat();}if(/spider/.test(name)){q.s=p(170,205);q.h=p(240,270);station=bench(true);}if(end)q.w=[p(q.e[0][0]+20,q.e[0][1]-65),p(q.e[1][0]-20,q.e[1][1]-65)];if(/preacher/.test(name))station+='<path class="pad" d="M140 212l140 37"/><path class="metal" d="M207 228v180"/>';}
    else if(type==='triceps'||type==='tricepsOverhead'){
      if(/skull/.test(name)){q=supine(false);station=bench(false);q.e=[p(150,180),p(218,180)];q.w=end?[p(158,109),p(232,106)]:[p(111,174),p(166,167)];}
      else if(type==='tricepsOverhead'){q.e=[p(179,64),p(265,64)];q.w=end?[p(188,25),p(255,25)]:[p(205,107),p(235,107)];}
      else{if(/kickback/.test(name)){q.s=p(170,205);q.h=p(245,270);q.e=[p(215,245),p(284,245)];q.w=end?[p(276,280),p(347,280)]:[p(205,306),p(271,306)];}else q.w=end?[p(184,279),p(257,279)]:[p(190,178),p(250,178)];}
    }else if(type==='dip'){q.s=p(220,end?140:195);q.h=p(220,end?260:315);q.e=[p(148,240),p(290,240)];q.w=[p(166,302),p(275,302)];q.k=[p(166,355),p(270,355)];q.a=[p(177,421),p(281,421)];station='<path class="metal" d="M115 302h80m62 0h80m-211 0v133m198-133v133"/>';}
    else if(type==='crunch'){
      if(item.equipment==='cable'||item.equipment==='band'){q=seated();q.s=end?p(185,242):p(190,164);q.h=p(240,290);q.k=[p(207,399),p(281,399)];q.a=[p(293,422),p(344,422)];q.e=[p(153,q.s[1]+18),p(240,q.s[1]+18)];q.w=[p(175,q.s[1]-30),p(248,q.s[1]-30)];}
      else if(item.equipment==='machine'){q=seated();station=seat();if(end)q.s=p(230,215);q.w=[p(155,192),p(260,192)];}
      else{q=supine(false);q.s=end?p(162,290):p(133,355);q.h=p(250,374);q.k=[p(281,307),p(320,299)];q.a=[p(358,420),p(389,420)];q.e=[p(184,315),p(243,325)];q.w=[p(220,303),p(275,307)];}
    }else if(type==='legRaise'){
      if(/lying|reverse|bench/.test(name)){q=supine(false);station=/bench/.test(name)?bench(false):'';q.e=[p(179,295),p(260,300)];q.w=[p(214,309),p(291,309)];q.k=end?[p(277,191),p(312,185)]:[p(320,292),p(345,282)];q.a=end?[p(311,97),p(341,89)]:[p(387,315),p(411,305)];}
      else {q.s=p(220,175);q.h=p(220,290);q.e=[p(161,87),p(280,87)];q.w=[p(145,40),p(296,40)];q.k=end?[p(143,290),p(273,267)]:[p(190,350),p(251,350)];q.a=end?(/knee/.test(name)?[p(145,362),p(277,345)]:[p(90,270),p(333,256)]):[p(185,425),p(257,425)];station='<path class="metal" d="M100 40h240m-230 0v390m220-390v390"/>';}
    }else if(type==='antiRotation'){
      if(/pallof/.test(name)){q.e=[p(182,176),p(265,176)];q.w=end?[p(255,175),p(306,175)]:[p(211,168),p(241,168)];}
      else if(/plank|rollout|bird dog/.test(name)){q={s:p(147,270),h:p(245,301),e:[p(119,324),p(182,324)],w:[p(152,366),p(215,366)],k:[p(300,343),p(330,340)],a:[p(364,416),p(393,410)]};if(/rollout/.test(name)&&end){q.s=p(100,310);q.w=[p(50,389),p(110,389)];station='<circle class="plate" cx="80" cy="392" r="18"/>';}}
      else if(/dead bug/.test(name)){q=supine(false);q.h=p(235,372);q.s=p(135,353);q.k=[p(260,286),p(303,280)];q.a=end?[p(371,355),p(312,349)]:[p(261,351),p(312,349)];q.w=[p(148,260),p(210,end?340:250)];}
    }else if(type==='adduction'||type==='abduction'){if(item.equipment==='machine'){q=seated();station=seat();const spread=(type==='abduction'?end:!end);q.k=spread?[p(119,313),p(302,313)]:[p(192,319),p(250,319)];q.a=spread?[p(99,413),p(327,413)]:[p(190,416),p(259,416)];}else if(end){q.k[1]=p(317,323);q.a[1]=p(370,390);}}
    else if(type==='shrug'){if(end){q.s[1]-=13;q.e.forEach(a=>a[1]-=13);q.w.forEach(a=>a[1]-=13);}if(/seated/.test(name)){q=seated();station=seat();}}
    arrow=`<path class="arrow" d="M360 188q20-35 0-68"/>`;return {q,station,arrow};
  }
  function equipment(item,q){
    const name=item.name.toLowerCase();let out='';
    const db=a=>`<g transform="translate(${a[0]} ${a[1]})"><path class="handle" d="M-22 0h44"/><rect class="plate" x="-26" y="-14" width="11" height="28" rx="3"/><rect class="plate" x="15" y="-14" width="11" height="28" rx="3"/><path class="anatomy" d="M-22-10v20m42-20v20"/></g>`;
    if(item.equipment==='dumbbell'){out=q.w.map(db).join('');if(/goblet|pullover|overhead extension/.test(name))out=db(mid(...q.w));}
    if(item.equipment==='barbell'||item.equipment==='smith'){
      const a=item.movement==='squat'?add(q.s,[0,-8]):item.movement==='hipThrust'?add(q.h,[0,0]):mid(...q.w),w=120;out=`<path class="handle" d="M${a[0]-w} ${a[1]}h${w*2}"/><g class="plate"><rect x="${a[0]-w+5}" y="${a[1]-23}" width="12" height="46" rx="3"/><rect x="${a[0]+w-17}" y="${a[1]-23}" width="12" height="46" rx="3"/></g>`;
      if(item.equipment==='smith')out='<path class="metal" d="M65 38v397m320-397v397m-328 0h342"/>'+out;
    }
    if(item.equipment==='cable'||item.equipment==='band'){
      let anchor=p(50,['pulldown','pullover','facePull','triceps','crunch'].includes(item.movement)?55:400);if(/fly/.test(item.movement))anchor=p(30,/low-to-high/.test(name)?410:/high-to-low/.test(name)?50:180);
      out=item.equipment==='cable'?'<path class="metal" d="M45 40v392m-18 0h58"/><rect class="stack" x="20" y="325" width="45" height="77"/><path class="anatomy" d="M20 340h45m-45 15h45m-45 15h45m-45 15h45"/>':'<circle class="metal" cx="45" cy="'+anchor[1]+'" r="7"/>';
      q.w.forEach(a=>{out+=line(anchor,a,item.equipment==='band'?'band':'cable')+line(add(a,[-9,0]),add(a,[9,0]),'handle');});
      if(item.movement==='fly')out+=line(p(407,anchor[1]),q.w[1],item.equipment==='band'?'band':'cable');
    }
    if(item.equipment==='machine'){
      out+='<path class="metal" d="M65 75v343m0-5h75m235 5V75m-55 338h60"/>';
      if(/pulldown/.test(item.movement))out+='<path class="metal" d="M65 75h310"/>'+q.w.map(a=>line(p(a[0],75),a,'cable')).join('');
      if(item.movement==='legExtension'||item.movement==='legCurl')out+=q.a.map(a=>`<rect class="pad-fill" x="${a[0]-15}" y="${a[1]-20}" width="28" height="12" rx="5"/>`).join('');
      if(item.movement==='fly'||item.movement==='rearDelt'||item.movement==='press')out+=q.w.map(a=>line(add(a,[-5,-30]),add(a,[-5,20]),'handle')).join('');
    }
    return out;
  }
  function render(item){
    if(!item)return '';
    const frame=end=>{const a=pose(item,end),suffix=end?'Finish':'Start';return `<svg class="anatomy-pose" viewBox="0 0 460 490" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(item.name)} ${end?'finish':'start'} position"><title>${esc(item.name)} — ${end?'finish':'start'} position</title><defs><pattern id="pencil${suffix}" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 5 5 0" stroke="#534e4a" stroke-width=".3" opacity=".2"/></pattern><linearGradient id="skinShade${suffix}"><stop stop-color="#f0e9e1"/><stop offset=".5" stop-color="#d5cec7"/><stop offset="1" stop-color="#ebe5de"/></linearGradient><marker id="sketchArrow${suffix}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#d32642"/></marker></defs><style>.skin,.limb{fill:url(#skinShade${suffix});stroke:#514b47;stroke-width:1.8;stroke-linejoin:round}.limb{fill:url(#skinShade${suffix})}.muscle{fill:#d32642;fill-opacity:.42;stroke:#a62c40;stroke-width:.8}.anatomy{fill:none;stroke:#776f68;stroke-width:1;stroke-linecap:round}.anatomy-fill{fill:url(#pencil${suffix});stroke:#776f68;stroke-width:.9}.shorts{fill:#545356;stroke:#302f33;stroke-width:1.5}.hair{fill:#514d48}.shoe{fill:#c8c4bf;stroke:#514b47;stroke-width:1.5}.metal{fill:none;stroke:#77777a;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}.pad{fill:none;stroke:#535256;stroke-width:12;stroke-linecap:round}.pad-fill{fill:#565459;stroke:#333;stroke-width:1}.handle{fill:none;stroke:#48474b;stroke-width:5;stroke-linecap:round}.plate{fill:#77767a;stroke:#414046;stroke-width:2}.cable{fill:none;stroke:#58575c;stroke-width:2}.band{fill:none;stroke:#9f4555;stroke-width:4}.stack{fill:#aaa5a0;stroke:#555;stroke-width:1}.arrow{fill:none;stroke:#d32642;stroke-width:3;marker-end:url(#sketchArrow${suffix})}.ground{stroke:#bdb6ae;stroke-width:1}.caption{font:700 16px system-ui;fill:#383234}</style><rect width="460" height="490" rx="18" fill="#f7f3ed"/><text class="caption" x="24" y="32">${end?'FINISH':'START'}</text><path class="ground" d="M25 442h410"/>${a.station}${anatomy(a.q,item)}${equipment(item,a.q)}${end?a.arrow:''}<text x="230" y="475" text-anchor="middle" font-family="system-ui" font-size="12" fill="#625c56">${esc(item.name)} · ${esc(item.primary.join(' / '))}</text></svg>`;};
    return `<div class="anatomy-plate">${frame(false)}${frame(true)}</div>`;
  }
  function thumbnail(item){
    let svg=render(item).match(/<svg[\s\S]*?<\/svg>/)?.[0]||'';if(!svg)return '';
    const primary=item.primary||[],back=primary.includes('Back'),chest=primary.includes('Chest'),delt=primary.some(m=>/delts|Shoulders/i.test(m)),traps=primary.some(m=>/traps/i.test(m));
    if(back&&!chest){
      const pec=svg.indexOf('<path class="muscle" d="M-26 8');if(pec>=0)svg=svg.slice(0,pec)+svg.slice(pec).replace('class="muscle"','class="anatomy-fill"');
      svg=svg.replace('<path class="anatomy" d="M0 5','<path class="muscle" d="M-27 16q13-9 27 0v38q-15 8-27-7zM27 16q-13-9-27 0v38q15 8 27-7z"/><path class="anatomy" d="M0 5');
    }
    if(traps)svg=svg.replace('<path class="anatomy" d="M0 5','<path class="muscle" d="M-15-3 0 12 15-3 21 15 0 24-21 15z"/><path class="anatomy" d="M0 5');
    if(delt){
      const q=pose(item,false).q,u=unit(sub(q.h,q.s)),n=[-u[1],u[0]],sh1=add(q.s,mul(n,31)),sh2=add(q.s,mul(n,-31));
      const circle=a=>'<ellipse class="muscle" cx="'+a[0]+'" cy="'+a[1]+'" rx="12" ry="10"/>';
      const head=add(q.s,mul(u,-38)),headTag='<g transform="translate('+head[0]+' '+head[1]+')';
      svg=svg.replace(headTag,circle(sh1)+circle(sh2)+headTag);
    }
    return svg;
  }
  return {render,pose,thumbnail};
})();
