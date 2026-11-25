import {islands,roundSize} from './engine.ts';

export const key='archipel-des-nombres:save';
export const avatars=['Renard','Hibou','Lapin','Chat'];
export const defaults=Object.freeze({sound:true,voice:true,motion:true,contrast:false,large:false,flash:false});
const freshRecords=()=>Array.from({length:2},()=>Array.from({length:islands.length},()=>({mastery:false,first:0,errors:0,rounds:0})));
function count(n,max=999999){return typeof n==='number'&&Number.isSafeInteger(n)?Math.max(0,Math.min(max,n)):0;}
export function parse(raw){
  const empty={version:2,active:'',players:[]};
  try{
    const data=JSON.parse(raw);
    if(![1,2].includes(data?.version)||!Array.isArray(data.players)) return empty;
    for(const source of data.players.slice(0,12)){
      if(typeof source?.id!=='string'||!/^[\w-]{1,64}$/.test(source.id)||typeof source.name!=='string'||!source.name.trim()||empty.players.some(p=>p.id===source.id)) continue;
      const settings={...defaults},records=freshRecords();
      for(const [key,defaultValue] of Object.entries(defaults)){
        if(typeof defaultValue==='boolean'&&typeof source.settings?.[key]==='boolean') settings[key]=source.settings[key];
      }
      records.forEach((chapter,c)=>chapter.forEach((entry,i)=>{
        const item=source.records?.[c]?.[i];
        if(item) Object.assign(entry,{mastery:item.mastery===true,first:Math.min(count(item.first,10),roundSize(c,i)),errors:count(item.errors),rounds:count(item.rounds)});
      }));
      empty.players.push({id:source.id,name:source.name.trim().slice(0,24),avatar:count(source.avatar,3),settings,records});
    }
    empty.active=empty.players.find(p=>p.id===data.active)?.id??empty.players[0]?.id??'';
  } catch {}
  return empty;
}
export function load(){
  try {return parse(localStorage.getItem(key));} catch {return parse(null);}
}
export function persist(data){
  try {localStorage.setItem(key,JSON.stringify(data));return true;} catch {return false;}
}
export function add(data,name,avatar){
  if(!name.trim()||data.players.length>=12) return false;
  const id=globalThis.crypto?.randomUUID?.()??Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  data.players.push({id,name:name.trim().slice(0,24),avatar,settings:{...defaults},records:freshRecords()});
  data.active=id;
  return true;
}
export function remove(data,id){
  data.players=data.players.filter(p=>p.id!==id);
  if(data.active===id) data.active=data.players[0]?.id??'';
}
export function record(player,chapter,island,result){
  const entry=player.records[chapter][island];
  entry.rounds++;entry.first=Math.max(entry.first,result.first);
  entry.mastery ||= result.mastery;
}
