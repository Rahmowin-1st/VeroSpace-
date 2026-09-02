// VeroSpace owns non-editable long-press and selection behavior.
// Form fields remain fully native/editable for accessibility and usability.
const vsEditableTarget=target=>{
  const el=target instanceof Element?target:target?.parentElement;
  return Boolean(el?.closest('input,textarea,select,[contenteditable="true"],[data-allow-select="true"]'));
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
