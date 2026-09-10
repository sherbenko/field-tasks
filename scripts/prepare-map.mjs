import { readFile, writeFile } from 'node:fs/promises';

const css = await readFile(new URL('../node_modules/leaflet/dist/leaflet.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../node_modules/leaflet/dist/leaflet.js', import.meta.url), 'utf8');
const document = `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>${css}
html,body,#map{height:100%;margin:0;background:#e3f0e8;font-family:system-ui}
.leaflet-control-attribution{font-size:11px}.leaflet-popup-content button{padding:12px;border:0;border-radius:8px;background:#176348;color:white;font-size:16px;margin-top:10px;min-width:150px}
.task-marker{background:#176348;border:3px solid white;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;box-shadow:0 2px 8px #0004}
</style></head><body><div id="map" aria-label="Task locations"></div><script>${js}</script>
<script>
const map=L.map('map').setView([53.9045,27.5615],12);
const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
 maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
tiles.on('tileerror',()=>window.ReactNativeWebView.postMessage(JSON.stringify({type:'tileError'})));
const markers=L.layerGroup().addTo(map);
window.setTasks=function(tasks,dark){
 document.getElementById('map').style.background=dark?'#1b2b25':'#e3f0e8';
 markers.clearLayers();
 tasks.forEach((task,index)=>{
  const node=document.createElement('div');
  const title=document.createElement('strong'); title.textContent=task.title; node.appendChild(title);
  const address=document.createElement('p');address.textContent=task.address;node.appendChild(address);
  const button=document.createElement('button');button.textContent='Open task';
  button.onclick=()=>window.ReactNativeWebView.postMessage(JSON.stringify({type:'open',taskId:task.id}));node.appendChild(button);
  L.marker([task.latitude,task.longitude],{title:task.title,icon:L.divIcon({className:'task-marker',html:String(index+1),iconSize:[36,36]})}).addTo(markers).bindPopup(node);
 });
 if(tasks.length) map.fitBounds(tasks.map(task=>[task.latitude,task.longitude]),{padding:[35,35],maxZoom:14});
};
window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}));
</script></body></html>`;
await writeFile(new URL('../assets/map.html', import.meta.url), document);
