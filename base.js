function read_text(url){
        return fetch(url).then(res=>{
                               if(res.ok==true){
                                   return res.text();
                               }else{
                                   return undefined;
                               }
                             })
                  .then(str=>str);
}
function media(urls,url_end=1){
      let div=document.createElement("div");
      div.style.display="none";
      if(urls==""){
           return div;
      }else{
            urls=urls.split(" ");
            let url=urls.slice(0,url_end).join(" ");
            if(url_end==urls.length){
                 urls=urls.slice(1).join(" ");
                 url_end=1;
            }else{
                 urls=urls.join(" ");
                 url_end=url_end+1;
            }
            fetch(url,{method:"HEAD"}).then(
                function(response){
                    if(response.ok==true){
                         let mda=undefined;
                         let type=response.headers.get("Content-Type");
                         type=type.substr(0,type.indexOf("/"));
                         if(type=="image"){
                              mda=document.createElement("img");
                         }else if(type=="video"||type=="audio"){
                              mda=document.createElement(type);
                              mda.controls=true;
                         }else{
                              /*PASS*/
                         }
                         if(mda!=undefined){
                              mda.src=url;
                              mda.style.width="100%";
                              mda.className="media";
                              mda.onerror=function(){
                                              this.parentNode
                                                  .replaceChild(media(urls,url_end),this);
                                          };
                              div.parentNode
                                 .replaceChild(mda,div);
                         }else{
                              div.parentNode
                                 .replaceChild(media(urls,url_end),div);
                         }
                    }else{
                         div.parentNode
                            .replaceChild(media(urls,url_end),div);
                    }
                 },
                 function(error){
                     div.parentNode
                        .replaceChild(media(urls,url_end),div);
                 });
              return div;
          }
}
function text(str){
      let pre=document.createElement("pre");
      pre.className="text";
      pre.style.overflowWrap="break-word";
      pre.style.whiteSpace="pre-wrap";
      pre.style.width="100%";
      pre.style.display="inline";
      pre.innerText=`${str}\n`;
      return pre;
}
function title(str){
    let button=document.createElement("button");
    button.className="title";
    button.style.width="100%";
    button.style.fontSize="1.5em";
    button.style.textAlign="center";
    button.style.boxShadow="none";
    button.style.borderStyle="none";
    button.appendChild(text(str));
    button.onclick=function(){
                       let content=this.nextSibling;
                       if(content.style.display==""){
                           content.style.display="none";
                       }else{
                           content.style.display="";
                       }
                   };
    return button;
}
function content(){
    let div=document.createElement("div");
    div.className="content";
    div.style.width="100%";
    div.style.display="none";
    return div;
}
function end(){
    let button=document.createElement("button");
    button.className="end";
    button.style.width="100%";
    button.style.fontSize="1.5em";
    button.style.textAlign="center";
    button.style.boxShadow="none";
    button.style.borderStyle="none";
    let txt=text("End of Read");
    txt.className="unknown";
    button.appendChild(txt);
    button.onclick=function(){
                       let content=this.parentNode;
                       if(content.style.display==""){
                           content.style.display="none";
                       }else{
                           content.style.display="";
                       }
                   };
    return button;
}
function blank(){
    let div=document.createElement("div");
    div.className="blank";
    div.style.width="100%";
    div.style.background="red";
    div.style.fontSize="1.1em";
    div.innerHTML="<br>";
    return div;
}
function link(href){
    let a=document.createElement("a");
    a.className="link";
    a.style.width="100%";
    a.href=href;
    a.innerText=`${href}`;
    return a;
}
async function blog(str){
    let strs=str.split(/\r\n|\r|\n/);
    let node=document.createElement("div");
    node.className="blog";
    for(let x=0; x<strs.length; x=x+1){
        str=strs[x];
        switch(str[0]){
            case "+":
               node.appendChild(media(str.substr(1)));
               break;
            case "-":
               node.appendChild(link(str.substr(1)));
               break;
            case ">":
               if(node.className=="content"){
                    node.appendChild(end());
                    node=node.parentNode;
               }else{
                    /*PASS*/
               }
               if(str.substr(1)!=""){
                     node.appendChild(blank());
                     node.appendChild(title(str.substr(1)));
                     let snode=content();
                     node.appendChild(snode);
                     node=snode;
               }else{
                    /*PASS*/
               }
               break;
            case "$":
               let insert=await read_text(str.substr(1));
               let inserts=insert.split(/\r\n|\r|\n/);
               for(let y=0;y<inserts.length; y=y+1){
                   insert=inserts[y];
                   strs.splice((x+1)+y,0,insert);
               }
               break;
            case "=":
               str=str.substr(1);
            default:
               node.appendChild(text(str));
         }
     }
     if(node.className=="content"){
         node.appendChild(end());
         node=node.parentNode;
     }else{
         /*PASS*/
     }
     return node;
}
function make(id,str){
    let node=document.getElementById(id);
    node.innerHTML="";
    blog(str).then(ret=>node.appendChild(ret));
}
