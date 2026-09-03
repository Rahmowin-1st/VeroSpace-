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
  const loadCss=(href,key)=>{
    if(document.querySelector(`link[data-${key}]`))return;
    const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.setAttribute(`data-${key}`,'true');document.head.appendChild(link);
  };
  const loadHotfix=()=>{
    if(document.querySelector('script[data-verospace-v7-select-hotfix]'))return;
    const hotfix=document.createElement('script');
    hotfix.src='v7-select-hotfix.js?v=20260903c3';
    hotfix.async=false;
    hotfix.dataset.verospaceV7SelectHotfix='true';
    document.body.appendChild(hotfix);
  };
  loadCss('v7-canonical.css?v=20260903c3','verospace-v7');
  loadCss('v7-polish.css?v=20260903c3','verospace-v7-polish');
  if(!document.querySelector('script[data-verospace-v7]')){
    const script=document.createElement('script');
    script.src='v7-canonical.js?v=20260903c3';
    script.async=false;
    script.dataset.verospaceV7='true';
    script.addEventListener('load',loadHotfix,{once:true});
    document.body.appendChild(script);
  }else{
    loadHotfix();
  }
},{once:true});
