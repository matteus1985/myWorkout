const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=__dirname;
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'catalogue.js'),'utf8'),context,{filename:'catalogue.js'});
vm.runInContext('const LIFT_CATALOGUE=window.LIFT_CATALOGUE;',context);
vm.runInContext(fs.readFileSync(path.join(root,'sketches.js'),'utf8'),context,{filename:'sketches.js'});
const catalogue=context.window.LIFT_CATALOGUE;
const sketches=context.window.LIFT_SKETCHES;
const output=path.join(root,'media','exercises');
fs.mkdirSync(output,{recursive:true});
for(const exercise of catalogue.exercises){
  const svg=sketches.thumbnail(exercise);
  if(!svg.startsWith('<svg')||!svg.includes('aria-label=')||!svg.includes('<title>'))throw new Error('Invalid illustration for '+exercise.id);
  fs.writeFileSync(path.join(output,exercise.id+'.svg'),svg,'utf8');
}
console.log(`Generated ${catalogue.exercises.length} exercise illustrations.`);
