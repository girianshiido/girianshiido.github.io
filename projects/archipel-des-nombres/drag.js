export function bindDrag(root, onDrop, scene) {
  let drag=null;
  function finish(event, cancelled){
    if(!drag || drag.pointer!==event.pointerId)return;
    const transaction=drag;
    drag=null;
    transaction.node.classList.remove('drag-origin');
    transaction.ghost?.remove();
    if(transaction.node.hasPointerCapture(event.pointerId)) transaction.node.releasePointerCapture(event.pointerId);
    if(cancelled||scene()!==transaction.scene)return;
    const hit=document.elementFromPoint(event.clientX,event.clientY);
    if(!transaction.ghost){
      if(hit?.closest('.token-button')===transaction.node){
        onDrop(transaction.item,transaction.where==='stock'?'basket':'stock',null);
      }
      return;
    }
    const land=hit?.closest('[data-drop]');
    if(!land||!root.contains(land))return;
    const where=land.dataset.drop;
    const slot=land.dataset.slot===undefined?null:Number(land.dataset.slot);
    if(where!==transaction.where||slot!==null) onDrop(transaction.item,where,slot);
  }
  root.addEventListener('pointerdown',event=>{
    const node=event.target.closest('.token-button');
    if(!node||event.button!==0||!event.isPrimary||drag)return;
    const bounds=node.getBoundingClientRect();
    drag={node,pointer:event.pointerId,item:Number(node.dataset.item),where:node.dataset.where,
      x:event.clientX,y:event.clientY,offsetX:event.clientX-bounds.left,offsetY:event.clientY-bounds.top,scene:scene(),ghost:null};
  });
  window.addEventListener('pointermove',event=>{
    if(!drag||drag.pointer!==event.pointerId)return;
    if(!drag.ghost){
      if(Math.hypot(drag.x-event.clientX,drag.y-event.clientY)<7)return;
      const source=drag.node.querySelector('canvas');
      if(!source)return;
      const ghost=document.createElement('canvas');
      ghost.width=source.width;ghost.height=source.height;
      ghost.getContext('2d')?.drawImage(source,0,0);
      ghost.className='drag-illustration';
      ghost.style.width=drag.node.clientWidth+'px';
      ghost.style.height=drag.node.clientHeight+'px';
      ghost.setAttribute('aria-hidden','true');
      document.body.append(ghost);
      drag.ghost=ghost;
      drag.node.classList.add('drag-origin');
      if(drag.node.isConnected) drag.node.setPointerCapture(event.pointerId);
    }
    if(event.cancelable)event.preventDefault();
    drag.ghost.style.transform='translate3d('+(event.clientX-drag.offsetX)+'px,'+(event.clientY-drag.offsetY)+'px,0)';
  },{passive:false});
  window.addEventListener('pointerup',event=>finish(event,false));
  window.addEventListener('pointercancel',event=>finish(event,true));
  root.addEventListener('lostpointercapture',event=>finish(event,true));
  root.addEventListener('dragstart',event=>{if(event.target.closest('.token-button'))event.preventDefault();});
}
