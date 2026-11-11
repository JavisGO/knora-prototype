/* 首页综合：复刻平台「首页工作台-首页」，并汇总用户各项目「添加到首页」的内容（2026-11-11）。
 * 在原型现有首页 DOM 上做重排与换肤，保留原有检索、范围筛选与结果页逻辑。
 * 按用户权限：检索结果、知识目录、类型与目录、标签、最新/最热知识、审批待办（与项目无关）。
 * 项目添加到首页：轮播图、智能体、热词，汇总显示（用户有 2 个项目就显示 2 个项目的轮播图）。 */
(function(){
'use strict';
if(document.body.dataset.app!=='portal'||document.body.dataset.page!=='home')return;
var hero=document.getElementById('homeSearchHero');if(!hero)return;
var content=document.getElementById('content');
var ICON={"search": "<svg viewBox=\"64 64 896 896\" data-i=\"search\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z\"></path></svg>", "bulb": "<svg viewBox=\"64 64 896 896\" data-i=\"bulb\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M632 888H392c-4.4 0-8 3.6-8 8v32c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32v-32c0-4.4-3.6-8-8-8zM512 64c-181.1 0-328 146.9-328 328 0 121.4 66 227.4 164 284.1V792c0 17.7 14.3 32 32 32h264c17.7 0 32-14.3 32-32V676.1c98-56.7 164-162.7 164-284.1 0-181.1-146.9-328-328-328zm127.9 549.8L604 634.6V752H420V634.6l-35.9-20.8C305.4 568.3 256 484.5 256 392c0-141.4 114.6-256 256-256s256 114.6 256 256c0 92.5-49.4 176.3-128.1 221.8z\"></path></svg>", "ellipsis": "<svg viewBox=\"64 64 896 896\" data-i=\"ellipsis\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z\"></path></svg>", "filter": "<svg viewBox=\"64 64 896 896\" data-i=\"filter\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M880.1 154H143.9c-24.5 0-39.8 26.7-27.5 48L349 597.4V838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V597.4L907.7 202c12.2-21.3-3.1-48-27.6-48zM603.4 798H420.6V642h182.9v156zm9.6-236.6l-9.5 16.6h-183l-9.5-16.6L212.7 226h598.6L613 561.4z\"></path></svg>", "down": "<svg viewBox=\"64 64 896 896\" data-i=\"down\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z\"></path></svg>", "tags": "<svg viewBox=\"64 64 896 896\" data-i=\"tags\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M483.2 790.3L861.4 412c1.7-1.7 2.5-4 2.3-6.3l-25.5-301.4c-.7-7.8-6.8-13.9-14.6-14.6L522.2 64.3c-2.3-.2-4.7.6-6.3 2.3L137.7 444.8a8.03 8.03 0 000 11.3l334.2 334.2c3.1 3.2 8.2 3.2 11.3 0zm62.6-651.7l224.6 19 19 224.6L477.5 694 233.9 450.5l311.9-311.9zm60.16 186.23a48 48 0 1067.88-67.89 48 48 0 10-67.88 67.89zM889.7 539.8l-39.6-39.5a8.03 8.03 0 00-11.3 0l-362 361.3-237.6-237a8.03 8.03 0 00-11.3 0l-39.6 39.5a8.03 8.03 0 000 11.3l243.2 242.8 39.6 39.5c3.1 3.1 8.2 3.1 11.3 0l407.3-406.6c3.1-3.1 3.1-8.2 0-11.3z\"></path></svg>", "fire": "<svg viewBox=\"64 64 896 896\" data-i=\"fire\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M834.1 469.2A347.49 347.49 0 00751.2 354l-29.1-26.7a8.09 8.09 0 00-13 3.3l-13 37.3c-8.1 23.4-23 47.3-44.1 70.8-1.4 1.5-3 1.9-4.1 2-1.1.1-2.8-.1-4.3-1.5-1.4-1.2-2.1-3-2-4.8 3.7-60.2-14.3-128.1-53.7-202C555.3 171 510 123.1 453.4 89.7l-41.3-24.3c-5.4-3.2-12.3 1-12 7.3l2.2 48c1.5 32.8-2.3 61.8-11.3 85.9-11 29.5-26.8 56.9-47 81.5a295.64 295.64 0 01-47.5 46.1 352.6 352.6 0 00-100.3 121.5A347.75 347.75 0 00160 610c0 47.2 9.3 92.9 27.7 136a349.4 349.4 0 0075.5 110.9c32.4 32 70 57.2 111.9 74.7C418.5 949.8 464.5 959 512 959s93.5-9.2 136.9-27.3A348.6 348.6 0 00760.8 857c32.4-32 57.8-69.4 75.5-110.9a344.2 344.2 0 0027.7-136c0-48.8-10-96.2-29.9-140.9z\"></path></svg>", "clock-circle": "<svg viewBox=\"64 64 896 896\" data-i=\"clock-circle\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z\"></path><path d=\"M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.6-3.7 1.8-8.7-1.8-11.2z\"></path></svg>", "close": "<svg fill-rule=\"evenodd\" viewBox=\"64 64 896 896\" data-i=\"close\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z\"></path></svg>", "eye": "<svg viewBox=\"64 64 896 896\" data-i=\"eye\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z\"></path></svg>", "right": "<svg viewBox=\"64 64 896 896\" data-i=\"right\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z\"></path></svg>", "send": "<svg viewBox=\"64 64 896 896\" data-i=\"send\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"M931.4 498.9L94.9 79.5c-3.4-1.7-7.3-2.1-11-1.2a15.99 15.99 0 00-11.7 19.3l86.2 352.2c1.3 5.3 5.2 9.6 10.4 11.3l147.7 50.7-147.6 50.7c-5.2 1.8-9.1 6-10.3 11.3L72.2 926.5c-.9 3.7-.5 7.6 1.2 10.9 3.9 7.9 13.5 11.1 21.5 7.2l836.5-417c3.1-1.5 5.6-4.1 7.2-7.1 3.9-8 .7-17.6-7.2-21.6zM170.8 826.3l50.3-205.6 295.2-101.3c2.3-.8 4.2-2.6 5-5 1.4-4.2-.8-8.7-5-10.2L221.1 403 171 198.2l628 314.9-628.2 313.2z\"></path></svg>","agents":"<svg viewBox=\"0 0 24 24\" width=\"1em\" height=\"1em\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"><circle cx=\"12\" cy=\"5\" r=\"2.4\"/><circle cx=\"5\" cy=\"18\" r=\"2.4\"/><circle cx=\"19\" cy=\"18\" r=\"2.4\"/><path d=\"M11 7.2 6.2 15.8M13 7.2l4.8 8.6M7.4 18h9.2\"/></svg>"};
var FILE={"md": "<svg viewBox=\"0 0 1024 1024\" width=\"1em\" height=\"1em\" style=\"display:block\"><path d=\"M930.304 896a128 128 0 0 1-128 128h-576a128 128 0 0 1-128-128V128a128 128 0 0 1 128-128h448l256 256v640z\" fill=\"#695DF7\"></path><path d=\"M254.08 448h46.272l79.488 81.024a12.8 12.8 0 0 0 18.24 0L477.568 448h46.272c7.04 0 12.8 5.76 12.8 12.8v215.36a12.8 12.8 0 0 1-12.8 12.8h-33.472a12.8 12.8 0 0 1-12.8-12.8V533.248L398.08 614.272a12.8 12.8 0 0 1-18.24 0L300.352 533.248v142.912a12.8 12.8 0 0 1-12.8 12.8H254.08a12.8 12.8 0 0 1-12.8-12.8V460.8c0-7.04 5.76-12.8 12.8-12.8z m489.344 12.8v94.848c0 7.04 5.76 12.8 12.8 12.8h32.896a12.8 12.8 0 0 1 9.664 21.248l-89.984 103.232a12.8 12.8 0 0 1-19.328 0L599.488 589.696a12.8 12.8 0 0 1 9.6-21.248h32.96a12.8 12.8 0 0 0 12.8-12.8V460.8c0-7.04 5.76-12.8 12.8-12.8h62.976c7.04 0 12.8 5.76 12.8 12.8z\" fill=\"#FFFFFF\"></path><path d=\"M674.304 0l256 256h-191.232a64 64 0 0 1-64-63.744L674.304 0z\" fill=\"#FFFFFF\" opacity=\".403\"></path></svg>", "docx": "<svg viewBox=\"0 0 1024 1024\" width=\"1em\" height=\"1em\" style=\"display:block\"><path d=\"M930.304 896a128 128 0 0 1-128 128h-576a128 128 0 0 1-128-128V128a128 128 0 0 1 128-128h448l256 256v640z\" fill=\"#1389FF\"></path><path d=\"M674.304 0l256 256h-191.232a64 64 0 0 1-64-63.744L674.304 0z\" fill=\"#FFFFFF\" opacity=\".403\"></path><path d=\"M576 746.88c10.24 0 19.2-3.392 26.88-10.24a54.272 54.272 0 0 0 15.36-25.6l69.12-225.28a29.76 29.76 0 0 0 1.28-10.24 29.888 29.888 0 0 0-8-20.48 26.56 26.56 0 0 0-20.8-8.96c-15.36 1.728-25.152 10.24-29.44 25.6l-56.32 211.84-46.72-207.36a36.224 36.224 0 0 0-13.12-21.44 36.864 36.864 0 0 0-24-8.64c-19.2 1.728-31.36 11.712-36.48 30.08l-48 206.72-52.48-206.08-1.28-5.12a36.864 36.864 0 0 0-10.56-17.92 26.368 26.368 0 0 0-18.88-7.68 28.608 28.608 0 0 0-21.44 8.96 29.44 29.44 0 0 0-6.72 31.36l66.56 222.08a63.68 63.68 0 0 0 15.36 26.88c8.128 7.68 17.728 11.52 28.8 11.52 22.208-1.728 36.288-13.632 42.24-35.84l43.52-187.52 40.96 185.6a44.8 44.8 0 0 0 15.36 26.24c8.128 7.68 17.728 11.52 28.8 11.52z\" fill=\"#FFFFFF\"></path></svg>", "pdf": "<svg viewBox=\"0 0 1024 1024\" width=\"1em\" height=\"1em\" style=\"display:block\"><path d=\"M930.304 896a128 128 0 0 1-128 128h-576a128 128 0 0 1-128-128V128a128 128 0 0 1 128-128h448l256 256v640z\" fill=\"#E83D30\"></path><path d=\"M674.304 0l256 256h-191.232a64 64 0 0 1-64-63.744L674.304 0z\" fill=\"#FFFFFF\" opacity=\".403\"></path><path d=\"M499.84 358.4c9.216 0 19.136 3.456 26.112 9.728a47.744 47.744 0 0 1 13.312 22.464c4.736 16.128 4.224 33.792 1.536 53.952-1.92 14.592-10.368 33.92-14.72 50.56 1.024 1.92 0.896 3.2 1.92 5.12 17.792 31.168 41.728 62.464 67.264 85.12 1.664 1.472 3.328 2.048 4.992 3.328 12.544-2.368 27.712-8.576 39.04-9.792 21.376-2.24 39.936-2.56 56.32 1.984a50.56 50.56 0 0 1 23.04 12.8 40.704 40.704 0 0 1 10.944 27.392c0 12.288-7.232 28.288-19.2 35.008-11.968 6.656-24.192 7.424-40.064 7.424-28.032 0-53.696-13.056-77.76-29.76-28.864 6.4-56.32 11.072-87.168 22.016-22.784 8.064-37.12 17.536-57.216 26.688-6.208 10.24-11.264 24.512-17.6 33.344-12.608 17.408-25.088 31.616-39.04 41.344-14.08 9.728-33.408 15.36-50.304 6.272a39.168 39.168 0 0 1-19.264-20.736 38.336 38.336 0 0 1 1.92-28.736c7.552-15.488 20.352-25.344 36.48-36.288 14.464-9.728 39.168-18.112 58.688-27.52 14.976-26.048 30.592-50.944 43.328-82.368 9.984-24.64 13.248-44.672 19.84-67.776-13.376-27.072-23.68-53.504-26.432-76.928-1.728-14.848-1.28-29.056 5.76-42.304a44.48 44.48 0 0 1 38.336-22.336z m10.816 189.952c-4.48 12.48-5.312 23.04-10.432 35.712-5.632 13.824-13.44 23.808-19.648 37.248 4.352-1.664 6.976-3.84 11.456-5.44 21.12-7.488 39.936-9.6 60.992-15.36a375.36 375.36 0 0 1-42.368-52.16z\" fill=\"#FFFFFF\"></path></svg>"};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var ico=function(name,cls){return '<span class="anticon'+(cls?' '+cls:'')+'" role="img" aria-label="'+name+'">'+ICON[name]+'</span>'};
var inResults=new URLSearchParams(location.search).get('mode')==='results';
var CH=window.KnoraCustomHome;

/* ---------- 演示：当前用户已添加到首页的项目数（0 / 1 / 2） ---------- */
var DKEY='knora:home-demo-projects';
function demoCount(){var q=new URLSearchParams(location.search).get('projects');if(q!==null&&/^[0-2]$/.test(q))return Number(q);try{var v=localStorage.getItem(DKEY);if(v!==null&&/^[0-2]$/.test(v))return Number(v)}catch(e){}return 2}
var DEMO=demoCount();
function cfgs(){return CH?CH.homeConfigs().slice(0,DEMO):[]}

/* ---------- 结构：banner + 居中内容区 ---------- */
document.body.classList.add('home-replica');
var parent=hero.parentElement,root=document.createElement('div');root.className='hr-root';
var banner=document.createElement('div');banner.className='hr-banner';
var body=document.createElement('div');body.className='hr-content';
parent.insertBefore(root,hero);root.appendChild(banner);root.appendChild(body);
var heroBox=document.createElement('div');heroBox.className='hr-hero';body.appendChild(heroBox);heroBox.appendChild(hero);
Array.prototype.slice.call(parent.children).forEach(function(n){if(n!==root)body.appendChild(n)});

/* ---------- 轮播：平台自带 3 张 + 各项目的图 ---------- */
var BASE=[{img:'assets/home-banner/search.webp',label:'检索全域知识'},{img:'assets/home-banner/notice.webp',label:'AIVA ME7 申报公示'},{img:'assets/home-banner/qa.webp',label:'智能问答'}];
var head=document.createElement('div');head.className='hr-head';
var dots=document.createElement('div');dots.className='hr-dots';dots.setAttribute('role','tablist');dots.setAttribute('aria-label','首页轮播');
var modes=document.getElementById('homeModeSwitch');
head.appendChild(dots);head.appendChild(modes);hero.insertBefore(head,hero.firstChild);
/* 无项目智能体时不需要模式切换，只保留一个检索框 */
modes.classList.add('hr-solo');
var slides=[],cur=0,timer=0,link=null;
function slideList(){var list=BASE.map(function(b){return {img:b.img,label:b.label}});cfgs().forEach(function(c){CH.slidesOf(c).forEach(function(s){list.push({img:s.image,label:s.source+' 轮播图',source:s.source,project:s.project,doc:s.doc})})});return list}
function show(i){cur=(i+slides.length)%slides.length;banner.querySelectorAll('.hr-slide').forEach(function(s,k){s.classList.toggle('on',k===cur)});dots.querySelectorAll('button').forEach(function(b,k){b.setAttribute('aria-selected',String(k===cur))});var s=slides[cur];if(link){link.hidden=!s.doc;link.title=s.doc?'打开文档：'+s.doc.name:''}}
function play(){clearInterval(timer);timer=setInterval(function(){if(!document.hidden)show(cur+1)},6000)}
function renderBanner(){slides=slideList();
  banner.innerHTML=slides.map(function(s,i){return '<div class="hr-slide'+(i===0?' on':'')+'" style="background-image:url(\''+esc(s.img)+'\')">'+(s.source?'<span class="hr-chip">'+ico('agents')+esc(s.source)+'</span>':'')+'</div>'}).join('')+'<button type="button" class="hr-banner-link" hidden aria-label="打开关联文档"></button>';
  link=banner.querySelector('.hr-banner-link');link.onclick=function(){var s=slides[cur];if(s&&s.doc)CH.openDocument(s.project,s.doc)};
  dots.innerHTML=slides.map(function(s,i){return '<button type="button" role="tab" aria-selected="'+(i===0)+'" aria-label="'+esc(s.label)+'"></button>'}).join('');
  show(0);play()}
dots.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;show(Array.prototype.indexOf.call(dots.children,b));play()});

/* ---------- 检索面板 ---------- */
var input=document.getElementById('homeSearch'),btn=document.getElementById('homeSearchBtn');
var line=hero.querySelector('.portal-search-line'),filters=hero.querySelector('.portal-range-filter-line'),summary=document.getElementById('homeRangeSummary');
var consoleBox=hero.querySelector('.portal-search-console');consoleBox.classList.add('hr-console');
function greet(){var h=new Date().getHours();return h<6?'晚上好':h<12?'上午好':h<18?'下午好':'晚上好'}
var USER='陈宇';
if(!inResults)input.value='';
var lineIcon=line.querySelector(':scope > svg');if(lineIcon)lineIcon.outerHTML=ico('search','hr-input-icon');
function setBtn(ask){btn.innerHTML='<span class="hr-blabel">'+(ask?'提问':'搜索')+'</span>'+ico(ask?'send':'search','hr-bico')}

/* 模式页签：知识检索 / 多智能体 */
var modeBtns=modes.querySelectorAll('[data-search-mode]');
modeBtns[0].innerHTML=ico('search')+'<span>知识检索</span>';
function isAsk(){return modeBtns[1].classList.contains('active')}

/* 智能体条：多智能体模式下选择由谁回答 */
var AGENT_DEFAULT={id:'default',name:'全域知识助手',source:''};
var selAgent='default',agentOpts=[AGENT_DEFAULT];
var agentBar=document.createElement('div');agentBar.className='hr-agentbar';
line.parentNode.insertBefore(agentBar,line.nextSibling);
function agentOptions(){var o=[AGENT_DEFAULT];cfgs().forEach(function(c){CH.agentOptionsOf(c).forEach(function(a){o.push(a)})});return o}
function agentName(){var a=agentOpts.filter(function(x){return x.id===selAgent})[0];return a?a.name:AGENT_DEFAULT.name}
function updatePlaceholder(){var ask=isAsk();input.placeholder=ask?greet()+'，'+USER+'，向「'+agentName()+'」提问，基于知识资源回答，来源可追溯':greet()+'，'+USER+'，检索全域知识，统一检索文档、图片与数据表，让知识触手可及'}
function renderAgents(){agentOpts=agentOptions();if(!agentOpts.some(function(o){return o.id===selAgent}))selAgent='default';
  agentBar.innerHTML='<span class="hr-ab-label">选择智能体</span><div class="hr-ab-list">'+agentOpts.map(function(o){return '<button type="button" class="hr-agent'+(o.id===selAgent?' on':'')+'" data-agent="'+esc(o.id)+'" title="'+esc((o.source?o.source+' · ':'')+o.name)+'"><i>'+esc((o.source||'平')[0])+'</i><b>'+esc(o.name)+'</b>'+(o.source?'<small>'+esc(o.source)+'</small>':'<small>平台</small>')+'</button>'}).join('')+'</div>'+(agentOpts.length===1?'<span class="hr-ab-hint">暂无项目智能体。项目添加到首页后，这里会出现项目智能体。</span>':'');
  modeBtns[1].innerHTML=ico('agents')+'<span>智能体</span>'+(agentOpts.length>1?'<em class="hr-count">'+agentOpts.length+'</em>':'');
  updatePlaceholder()}
agentBar.addEventListener('click',function(e){var b=e.target.closest('[data-agent]');if(!b)return;selAgent=b.dataset.agent;renderAgents();input.focus()});
function syncMode(){var ask=isAsk();consoleBox.classList.toggle('hr-ask',ask);setBtn(ask);updatePlaceholder()}
modes.addEventListener('click',function(e){if(e.target.closest('[data-search-mode]'))setTimeout(syncMode,0)});

/* 筛选行：类型与目录 / 标签 */
var typeTrigger=document.getElementById('homeTypeTrigger'),tagTrigger=document.getElementById('homeTagTrigger');
typeTrigger.innerHTML=ico('filter')+'<span class="hr-flabel">类型与目录</span><span class="hr-fvalue"><b id="homeTypeLabel">全部类型</b><i>·</i><b id="homeScopeLabel">全部有权目录</b></span>'+ico('down');
tagTrigger.innerHTML=ico('tags')+'<span class="hr-flabel">标签</span><span class="hr-fvalue"><b id="homeTagLabel">全部标签</b></span>'+ico('down');
function syncActive(){
  var t=document.getElementById('homeTypeLabel').textContent,d=document.getElementById('homeScopeLabel').textContent,g=document.getElementById('homeTagLabel').textContent;
  typeTrigger.classList.toggle('hr-active',!(t==='全部类型'&&d==='全部有权目录'));
  tagTrigger.classList.toggle('hr-active',g!=='全部标签');
}
syncActive();
var hint=filters.querySelector('.portal-permission-scope');
function syncHint(){if(!hint)return;var t=document.getElementById('homeScopeLabel').textContent,txt=t==='全部有权目录'?'在全部有权空间中检索':'在已圈定的范围内检索';if(hint.textContent!==txt)hint.textContent=txt}
if(hint){new MutationObserver(function(){syncHint();syncActive()}).observe(document.getElementById('homeTypeTrigger').parentElement.parentElement,{subtree:true,childList:true,characterData:true});syncHint()}
var archive=hero.querySelector('.archive-portal-switch');if(archive)filters.insertBefore(archive,hint||null);

/* ---------- 热门 / 最近：项目人工热词在前，其次项目搜索热词，再补平台热门 ---------- */
var PLATFORM_HOT=['客户风险','采购管理办法','供应商准入','经营分析','重点客户'],HKEY='knora:home-history:v1';
function hotList(){var list=[],seen={};
  function add(w,src){if(!seen[w]){seen[w]=1;list.push({w:w,src:src})}}
  var cs=cfgs();
  cs.forEach(function(c){(c.words||[]).forEach(function(w){add(w,c.name)})});
  cs.forEach(function(c){CH.hotwordsOf(c).forEach(function(w){add(w,c.name)})});
  PLATFORM_HOT.forEach(function(w){add(w,'')});
  return list.slice(0,10)}
function loadHist(){try{var v=JSON.parse(localStorage.getItem(HKEY));if(Array.isArray(v))return v}catch(e){}return ['供应商准入','风险分级']}
function saveHist(v){try{localStorage.setItem(HKEY,JSON.stringify(v))}catch(e){}}
var kw=document.createElement('div');kw.className='hr-keywords';
function drawKw(){var hist=loadHist();
  kw.innerHTML='<div class="hr-kw-row" data-type="hot"><span class="hr-kw-label">'+ico('fire','hr-kw-ico')+'热门</span><div class="hr-kw-list">'+hotList().map(function(h){return '<button type="button" class="hr-kw-item" data-kw="'+esc(h.w)+'" title="'+esc(h.src?'来自「'+h.src+'」':h.w)+'">'+esc(h.w)+'</button>'}).join('')+'</div></div>'+
  (hist.length?'<div class="hr-kw-row" data-type="history"><span class="hr-kw-label">'+ico('clock-circle','hr-kw-ico')+'最近</span><div class="hr-kw-list">'+hist.map(function(w){return '<span class="hr-kw-item hr-kw-hist"><button type="button" data-kw="'+esc(w)+'" title="'+esc(w)+'">'+esc(w)+'</button><button type="button" class="hr-kw-x" data-kw-del="'+esc(w)+'" aria-label="删除历史「'+esc(w)+'」">'+ico('close')+'</button></span>'}).join('')+'</div><button type="button" class="hr-kw-clear" data-kw-clear>清空</button></div>':'');
}
consoleBox.appendChild(kw);
kw.addEventListener('click',function(e){
  var del=e.target.closest('[data-kw-del]');if(del){saveHist(loadHist().filter(function(w){return w!==del.dataset.kwDel}));drawKw();return}
  if(e.target.closest('[data-kw-clear]')){saveHist([]);drawKw();return}
  var k=e.target.closest('[data-kw]');if(k){input.value=k.dataset.kw;btn.click()}
});
function remember(){var q=input.value.trim();if(!q||q.length>20)return;var h=loadHist().filter(function(w){return w!==q});h.unshift(q);saveHist(h.slice(0,8));drawKw()}
btn.addEventListener('click',remember,true);
input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.isComposing)remember()},true);

/* 隐藏原有汇总行与「我的智能体 / 常用操作」，范围信息已在筛选行体现 */
if(summary)summary.classList.add('hr-legacy-hidden');
var agentZone=body.querySelector('.portal-agent-zone');if(agentZone)agentZone.classList.add('hr-legacy-hidden');

/* ---------- 下方五个卡片（按用户权限，与项目无关） ---------- */
var DOCS={
 'doc-risk':['客户风险分级与处置管理办法.docx','docx'],
 'doc-report':['2026 年重点客户经营分析报告.pdf','pdf'],
 'doc-playbook':['重点客户联合运营手册.docx','docx'],
 'doc-channel':['渠道策略复盘纪要.docx','docx'],
 'doc-guide':['质量追溯与供应风险分析_原始场景说明.md','md']
};
function space(){try{return localStorage.getItem('knora:tenant')==='sailisi'?'赛力斯集团':'赛豆企业'}catch(e){return '赛豆企业'}}
function fileRow(id,metaLeft,right,extra){var d=DOCS[id];return '<a class="hr-row" href="portal-document-detail.html?doc='+encodeURIComponent(id)+'"><span class="hr-ficon">'+FILE[d[1]]+'</span><span class="hr-rbody"><span class="hr-rtitle" title="'+esc(d[0])+'">'+esc(d[0])+'</span><span class="hr-rmeta"><span>'+esc(metaLeft)+'</span>'+(extra?'<span>'+esc(extra)+'</span>':'')+'</span></span>'+(right||'')+'</a>'}
function card(title,aside,inner){return '<section class="hr-card"><header><h3>'+title+'</h3>'+(aside||'')+'</header><div class="hr-card-body">'+inner+'</div></section>'}
function link2(text,href){return '<a class="hr-link" href="'+href+'">'+text+ico('right')+'</a>'}
function approval(name,meta,status){return '<a class="hr-row" href="portal-mine.html"><span class="hr-aicon">'+ico('filter')+'</span><span class="hr-rbody"><span class="hr-rtitle">'+esc(name)+'</span><span class="hr-rmeta"><span>'+esc(meta)+'</span></span></span><span class="hr-tag hr-tag-pending">'+status+'</span></a>'}
function cards(){
  var sp=space();
  return '<div class="hr-grid hr-grid3">'+
   card('最新知识','',fileRow('doc-guide',sp,'','3 天前更新')+fileRow('doc-playbook',sp,'','3 天前更新')+fileRow('doc-risk',sp,'','3 天前更新'))+
   card('最热知识','<span class="hr-aside">近 30 天浏览</span>',fileRow('doc-risk',sp,'<span class="hr-views">'+ico('eye')+'12</span>','3 天前更新')+fileRow('doc-report',sp,'<span class="hr-views">'+ico('eye')+'8</span>','5 天前更新'))+
   card('我的收藏',link2('管理收藏','portal-mine.html'),fileRow('doc-risk',sp,'','')+fileRow('doc-channel',sp,'',''))+
  '</div><div class="hr-grid hr-grid2">'+
   card('最近使用',link2('查看全部','portal-mine.html'),fileRow('doc-report',sp,'<span class="hr-time">11-10 18:37</span>','')+fileRow('doc-playbook',sp,'<span class="hr-time">11-09 10:12</span>',''))+
   card('我的审批待办',link2('进入审批','portal-mine.html'),approval('客户运营制度资源发布申请','3 份文档 · 市场营销域','待审批')+approval('客户风险数据表分配申请','2 张数据表 · 客户运营部','待审批'))+
  '</div>';
}
var home=document.getElementById('homeDefault');
if(home){home.innerHTML=cards();home.classList.add('hr-cards')}

/* ---------- 演示控制：我已添加到首页的项目数 ---------- */
var demo=document.createElement('div');demo.className='hr-demo';
function drawDemo(){demo.innerHTML='<span>演示 · 我已添加到首页的项目数</span>'+[0,1,2].map(function(n){return '<button type="button" data-n="'+n+'" class="'+(n===DEMO?'on':'')+'">'+n+'</button>'}).join('')}
demo.addEventListener('click',function(e){var b=e.target.closest('[data-n]');if(!b)return;DEMO=Number(b.dataset.n);try{localStorage.setItem(DKEY,String(DEMO))}catch(x){}renderAll()});
document.body.appendChild(demo);

function renderAll(){drawDemo();renderBanner();renderAgents();drawKw();syncMode();modes.classList.toggle('hr-solo',agentOpts.length<=1)}
renderAll();
var sig=JSON.stringify(cfgs());
function resync(){var now=JSON.stringify(cfgs());if(now!==sig){sig=now;renderAll()}}
window.addEventListener('storage',function(e){if(e.key==='knora:custom-homes:v1')resync()});
window.addEventListener('focus',resync);
})();
