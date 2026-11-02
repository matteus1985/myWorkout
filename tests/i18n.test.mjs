import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

test('language switching translates known UI labels and keeps personal content and form values',()=>{
  const parent={closest:()=>false};
  const personalParent={closest:()=>true};
  const label={nodeValue:' Settings ',parentElement:parent};
  const personal={nodeValue:'Nutrition',parentElement:personalParent};
  const field={value:'unsaved meal',matches:()=>false,querySelectorAll:()=>[]};
  const document={body:field,documentElement:{lang:'en'},createTreeWalker(){let index=-1;const list=[label,personal];return {nextNode(){return ++index<list.length;},get currentNode(){return list[index];}};}};
  const context={window:{},document,NodeFilter:{SHOW_TEXT:4}};
  vm.runInNewContext(readFileSync(new URL('../i18n.js',import.meta.url),'utf8'),context);
  const i18n=context.window.LiftI18n;
  for(const [code,expected] of [['it',' Impostazioni '],['fr',' Paramètres '],['de',' Einstellungen '],['en',' Settings ']]){
    i18n.setLanguage(code);assert.equal(label.nodeValue,expected);assert.equal(personal.nodeValue,'Nutrition');assert.equal(field.value,'unsaved meal');assert.equal(document.documentElement.lang,code);
  }
});

test('all catalogue exercise names and guide strings have local translations without changing IDs',()=>{
  const catalogue={window:{}};vm.runInNewContext(readFileSync(new URL('../catalogue.js',import.meta.url),'utf8'),catalogue);
  const translations={window:{}};vm.runInNewContext(readFileSync(new URL('../i18n-data.js',import.meta.url),'utf8'),translations);
  const exercises=catalogue.window.LIFT_CATALOGUE.exercises;
  for(const language of ['it','fr','de'])for(const exercise of exercises){
    assert.ok(exercise.id);assert.ok(translations.window.LIFT_I18N_DATA[language][exercise.name],`${language}: ${exercise.name}`);
    for(const instruction of Object.values(exercise.guide||{}))if(instruction?.trim())assert.ok(translations.window.LIFT_I18N_DATA[language][instruction],`${language}: ${instruction}`);
  }
});

test('timer labels stay current after the timer state and language change',()=>{
  const attr={'aria-label':'Pause workout timer'};
  const button={closest:()=>false,hasAttribute:k=>k in attr,getAttribute:k=>attr[k],setAttribute:(k,v)=>attr[k]=v};
  const root={matches:()=>false,querySelectorAll:()=>[button]};
  const document={body:root,documentElement:{},createTreeWalker:()=>({nextNode:()=>false})};
  const context={window:{},document,NodeFilter:{SHOW_TEXT:4}};vm.runInNewContext(readFileSync(new URL('../i18n.js',import.meta.url),'utf8'),context);
  const i18n=context.window.LiftI18n;i18n.setLanguage('it');assert.match(attr['aria-label'],/pausa/i);
  attr['aria-label']='Resume workout timer';i18n.apply();assert.match(attr['aria-label'],/Riprendi/);
  i18n.setLanguage('fr');assert.match(attr['aria-label'],/Reprendre/);
  i18n.setLanguage('en');assert.equal(attr['aria-label'],'Resume workout timer');
});

test('timer terminology is concise in all supported languages',()=>{
  const root={matches:()=>false,querySelectorAll:()=>[]};
  const document={body:root,documentElement:{},createTreeWalker:()=>({nextNode:()=>false})};
  const context={window:{},document,NodeFilter:{SHOW_TEXT:4}};vm.runInNewContext(readFileSync(new URL('../i18n.js',import.meta.url),'utf8'),context);
  for(const [language,timer,complete] of [['en','Rest timer','Rest complete'],['it','Timer','Recupero terminato'],['fr','Timer','Récupération terminée'],['de','Timer','Pause beendet']]){
    context.window.LiftI18n.setLanguage(language);
    assert.equal(context.window.LiftI18n.translate('Rest timer'),timer);
    assert.equal(context.window.LiftI18n.translate('Rest complete'),complete);
    assert.ok(context.window.LiftI18n.translate('Set 1 weight in kilograms'));
  }
});

test('rowing exercise names use natural gym terminology in all supported languages',()=>{
  const root={matches:()=>false,querySelectorAll:()=>[]};
  const document={body:root,documentElement:{},createTreeWalker:()=>({nextNode:()=>false})};
  const context={window:{},document,NodeFilter:{SHOW_TEXT:4}};vm.runInNewContext(readFileSync(new URL('../i18n.js',import.meta.url),'utf8'),context);
  const i18n=context.window.LiftI18n;
  const expected={it:'Rematore con il petto appoggiato',fr:'Rowing avec appui poitrine',de:'Brustgestütztes Rudern'};
  for(const [language,name] of Object.entries(expected)){i18n.setLanguage(language);assert.equal(i18n.translate('Chest-Supported Row'),name);}
  i18n.setLanguage('it');assert.equal(i18n.translate('Barbell Row'),'Rematore con bilanciere');assert.equal(i18n.translate('Dumbbell Upright Row'),'Tirata al mento con manubri');
});
