// VeroSpace owns non-editable long-press and selection behavior.
// Editable form fields remain selectable; native project/budget pickers are replaced by V7.
const vsEditableTarget=target=>{
  const el=target instanceof Element?target:target?.parentElement;
  return Boolean(el?.closest('input,textarea,[contenteditable="true"],[data-allow-select="true"]'));
};

document.addEventListener('contextmenu',event=>{
  if(!vsEditableTarget(event.target))event.preventDefault();
},{capture:true});

document.addEventListener('selectstart',event=>{
  if(!vsEditableTarget(event.target))event.preventDefault();
},{capture:true});

document.addEventListener('dragstart',event=>{
  const el=event.target instanceof Element?event.target:event.target?.parentElement;
  if(el?.closest('img,svg'))event.preventDefault();
},{capture:true});

document.addEventListener('selectionchange',()=>{
  const selection=window.getSelection?.();
  if(!selection||selection.isCollapsed||!selection.rangeCount)return;
  const anchor=selection.anchorNode instanceof Element?selection.anchorNode:selection.anchorNode?.parentElement;
  if(!vsEditableTarget(anchor))selection.removeAllRanges();
});

// Load the canonical layer after the base deferred scripts have initialized.
document.addEventListener('DOMContentLoaded',()=>{
  if(!document.querySelector('link[data-verospace-v7]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='v7-canonical.css?v=20260903c1';
    link.dataset.verospaceV7='true';
    document.head.appendChild(link);
  }
  if(!document.querySelector('script[data-verospace-v7]')){
    const script=document.createElement('script');
    script.src='v7-canonical.js?v=20260903c1';
    script.async=false;
    script.dataset.verospaceV7='true';
    document.body.appendChild(script);
  }
},{once:true});
