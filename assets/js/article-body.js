function articleBody(source) {
  const root=document.createElement('div'), template=document.createElement('template');
  template.innerHTML=source;
  const allowed=new Set(['P','BR','STRONG','B','EM','I','H2','H3','UL','OL','LI','BLOCKQUOTE','A']);
  function append(parent, original){
    if(original.nodeType===Node.TEXT_NODE){parent.append(original.textContent);return}
    if(original.nodeType!==Node.ELEMENT_NODE || ['STYLE','SCRIPT','TEMPLATE'].includes(original.tagName))return;
    let target=parent;
    if(allowed.has(original.tagName)){
      target=document.createElement(original.localName);
      const href=original.getAttribute('href')||'';
      if(original.tagName==='A' && (href.startsWith('https://') || href.startsWith('http://')))target.href=href;
      parent.append(target);
    }
    for(const child of original.childNodes)append(target,child);
  }
  for(const child of template.content.childNodes)append(root,child);
  root.className='article-text';
  return root;
}