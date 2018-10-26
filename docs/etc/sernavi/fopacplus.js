/**************
fopacplus.js、複数のサイトを検索する際、便利なように作った仕組みです。
利用は営利・非営利を問わず無料、再配布・ソースの変更も自由です。著作権表示なども不要です。
ただし、その利用によって発生したいかなる損害も当方は保障しかねます。すべて自己責任でお願いします。
作成：wemfls
サイト:http://wemfls.web.fc2.com/
******************/

var dispMode="SIMPLE";//表示モード、最初「検索ボタン」１つのみ表示がSIMPLE、検索対象のボタンをすべて表示する場合はMULTIを指定する。
var connectMessage="Connect to "; // 他サイト移行画面のメッセージ。
var tagList =[
	['カーリル','utf-8','get','https://calil.jp/search?q=OPACWORD&sysid=Chiba_Nagareyama'],
	['東京都立','utf-8','session','https://catalog.library.metro.tokyo.jp/winj/opac/search-standard.do?lang=ja&txt_word=OPACWORD&submit_btn_searchEasy=%E6%A4%9C%E7%B4%A2&hid_word_column=fulltext&txt_dummy='],
	['カーリルローカル','utf-8','get','https://calil.jp/local/search?csid=chiba&q=OPACWORD'],
];
function opacPlus(){//画面表示（onload)時に呼び出す最初の関数

//ファイル名を取得する
	if(document.location.href.indexOf('/')>0){
		var url = document.location.href.split('/');
	}else{
		var url = document.location.href.split('\\');
	}
	var filename = url[url.length-1].split('?')[0];

//取得したファイル名でフォームを作成
	if(dispMode=="SIMPLE"){
		var formHtml = '<form method="get" action="'+filename+'" name="opacform" id="opacform"><input type="text" name="WORD" value="" /><input type="hidden" name="TARGET" value="0" /> <input type="submit" value=" 検 索 " class="submit" /></form>';
	}else{
		var formHtml = '<form method="get" action="'+filename+'" name="opacform" id="opacform" target="_blank"><input type="text" name="WORD" value="" /><div class="sitebutton">';
		for(var i=0; i< tagList.length; i++){
			formHtml += '<input type="submit" name = "PLUSSITE" value="'+tagList[i][0]+'" class="submit"> ';
		}
		formHtml += '</div></form>'
	}
//パラメータと値を取得
	var getArr = retrieveGET(document.location.href);	
	if(getArr["WORD"]){//検索語でありWORDパラメータが存在した場合は以下のif文を実行
		//WORDから余分なものを削除する
		var word = decodeWord(getArr["WORD"]);
		word = word.replace(/\+/g," ");
		
		if(getArr["PLUSSITE"]){
			var psite = decodeWord(getArr["PLUSSITE"]);
			psite = psite.replace(/\+/g," ");
			console.log(psite);
			for(var i=0; i< tagList.length; i++){
				if(psite == tagList[i][0]){
					console.log(i+'|'+tagList[i][0]);
					var uri = tagList[i][3].replace('OPACWORD',word);
					var param = uri.split('?')[1].split('&');
					if(tagList[i][2]=="get" || tagList[i][2]=="sameorigin"){
						var f = '<form method="get" action = "'+uri.split('?')[0]+'" id="post_form">';
					}else{
						var f = '<form method="post" action = "'+uri.split('?')[0]+'" id="post_form">';
					}
					for(var j=0; j<param.length; j++){
						var pr = param[j].split('=');
						f += '<input name="'+pr[0]+'" type="hidden" value="'+decodeWord(pr[1]).replace(/\+/g," ")+'" />';
					}
					f += '</form>';
					var body = document.getElementsByTagName('body')[0];
					body.innerHTML = '<div class="connect">'+connectMessage+tagList[i][0]+' ('+uri.split('?')[0]+') ...'+'<iframe style="width:1px; height:1px; border:0px;" src="' + uri.split('?')[0]+ '" onload="reloadData(500);"></iframe>'+f+'</div>';
				}
			}
		}else{
			if(!getArr["TARGET"]){//検索対象（TARGETパラメータ）の指定がなければ、tagList配列の先頭を検索対象とする。
				getArr["TARGET"]=0;
			}
			//TARGETから余分なものを削除する
			var target = decodeWord(getArr["TARGET"]);
			target = target.replace(/\+/g," ");

		
			if(tagList[target]){//検索対象としてしたものが存在すれば、それをそうでない場合は、tagList配列の先頭を検索対象とする。
				if(tagList[target][2]=='post'){
					var uri=filename+'?TYPE=SESSION&SENDDATA='+encodeWord(word,tagList[target][1])+'&TARGET='+target;
				}else{
					var uri = tagList[target][3];
				}
			}else{
				if(tagList[0][2]=='post'){
					var uri=filename+'?TYPE=SESSION&SENDDATA='+encodeWord(word,tagList[target][1])+'&TARGET='+0;
				}else{
					var uri = tagList[0][3];
				}
			}
			//検索対象のURLから"OPACWORD"の部分を検索語に置き換える。
			uri = uri.replace('OPACWORD',encodeWord(word,tagList[target][1]));
		
			//iframeで検索結果を表示する
			var frameDiv =document.getElementById('flameArea');
			frameDiv.innerHTML='<br />';
			var frmBody = document.createElement('div');
			frmBody.setAttribute('class','iframeBody');
			frameDiv.appendChild(frmBody);
			var ifrm = document.createElement('iframe');
			ifrm.name='opacPlus';
			ifrm.src=uri;
			ifrm.setAttribute('id','opacPlus');
			frmBody.appendChild(ifrm);
		
			//他の検索対象をタグ猟奇（tagArea）に表示する。
			var listDiv =document.getElementById('tagArea');
			listDiv.innerHTML = listDiv.innerHTML+formHtml;
			document.opacform.WORD.value = word;
			document.opacform.TARGET.value = target;
			for(var i=0; i < tagList.length; i++){
				var a = document.createElement('a');
				if(tagList[i][2]=='get' || tagList[i][2]=='post'){
					a.href= filename+'?TARGET='+i+'&WORD='+encodeWord(word,tagList[target][1]);
					a.target = '_top';
					a.innerHTML =tagList[i][0];
				}else if(tagList[i][2]=='sameorigin'){	//フレームで表示できない場合は別タブで開く
					a.href=tagList[i][3].replace('OPACWORD',encodeWord(word,tagList[target][1]));
					a.target = '_blank';
					a.innerHTML = tagList[i][0] + '<span style="font-size:75%;">(別タブ)</span>';
				}else if(tagList[i][2]=='session'){		//セッションIDが必要な場合には、１度セッションIDを取得してから開く
					a.href=filename+'?TYPE=SESSION&SENDDATA='+encodeWord(word,tagList[target][1])+'&TARGET='+i;
					a.target = '_blank';
					a.innerHTML = tagList[i][0] + '<span style="font-size:75%;">(別タブ)</span>';
				}
				listDiv.appendChild(a);
				if(i == target)a.setAttribute('class','selected');
			}
			frameResize();
		}
	}else if(getArr["TYPE"]=='SESSION' && getArr["SENDDATA"] && tagList[getArr["TARGET"]]){ //セッション取得用に別タブで開く場合の処理。1度ミニマムなiframeでセッションを取得し、目的のURIを開き直す
		var target = decodeWord(getArr["TARGET"]);
		target = target.replace(/\+/g," ");
		var uri = tagList[target][3].replace('OPACWORD',decodeWord(getArr["SENDDATA"]));
		var param = uri.split('?')[1].split('&');
		var f = '<form method="post" action = "'+uri.split('?')[0]+'" id="post_form">';
		for(var i=0; i<param.length; i++){
			var pr = param[i].split('=');
			f += '<input name="'+pr[0]+'" type="hidden" value="'+decodeWord(pr[1]).replace(/\+/g," ")+'" />';
		}
		f += '</form>';
		var body = document.getElementsByTagName('body')[0];
		body.innerHTML = '<div class="connect">'+connectMessage+tagList[target][0]+' ('+uri.split('?')[0]+') ...'+'<iframe style="width:1px; height:1px;" src="' + uri.split('?')[0]+ '" onload="reloadData(1000);"></iframe>'+f+'</div>';
		
	}else{//検索語が指定されていない場合には、初期画面を表示
		var f =document.getElementById('flameArea');
		var frm = f.getElementsByTagName('form');
		if(frm.length>0){//フォームがある場合には、そのactionの対象をこのファイル名にする。
			for(var i=0; i<frm.length; i++){
				frm[i].action=filename;
			}
		}else{//フォームがない場合には、フォームを記述する。
			f.innerHTML = formHtml + f.innerHTML;
		}
	}
}
function reloadData(num){//セッションが必要な際は一度セッションデータを取得してからリロードする。
	if(num){
		setTimeout('reloadData()',num);
	}else{
		document.getElementById('post_form').submit();
//		var getArr = retrieveGET(document.location.href);
//		var word = decodeWord(getArr["SENDDATA"]);
//		word = word.replace(/\+/g," ");
//		var target = decodeWord(getArr["TARGET"]);
//		target = target.replace(/\+/g," ");
//		var uri = tagList[target][1].replace('OPACWORD',encodeWord(word,tagList[target][1]));
//		location.href=uri;
	}
}
var getCookie=0;
function reloadURI(num){	//指定されたタイト(magtit)のフォームを実行し、検索結果を表示。最初のみ、Cookie取得のため２度実行する関数。
	var getArr = retrieveGET(document.location.href);
	var word = decodeWord(getArr["WORD"]);
	word = word.replace(/\+/g," ");
	window.open(tagList[num][3].replace('OPACWORD',encodeWord(word,tagList[target][1])),tagList[num][3].split('?')[0]);
	if(getCookie==0){
		getCookie=1;
		setTimeout('reloadURI('+num+')',300);
	}
}
function frameResize(){	//iframeのウィンドウとぴったりにするための関数
	var ifr = document.getElementById('opacPlus');
	if(ifr){
		var h = window.innerHeight;
		var w = window.innerWidth;
//		console.log(h+'/'+w+'/'+document.getElementById('tagArea').offsetHeight);
		if(w > 992){
			ifr.style.height=h-75+'px';
		}else{
			ifr.style.height=h-document.getElementById('tagArea').offsetHeight-35 +'px';
		}
	}
}
function retrieveGET(url) {	//getメソッドで送られてきたパラメータを配列にして返す
 var getArr = new Array();
 var query = url.split('?')[1];
 if(query){
	 var parms = query.split('&');
	 for (var i=0; i<parms.length; i++) {
	 	var pos = parms[i].indexOf('=');
	 	if (pos > 0) {
   			var key = parms[i].substring(0,pos);
   			var val = parms[i].substring(pos+1);
   			getArr[key] = val;
  		}
  	}
 }
 return getArr;
}
function decodeWord(word,code) {	//)URLコード(word)を文字に変換する。codeを指定しない場合は、utf-8
	if(code){
		var c= code.toLowerCase();
	}else{
		var c = "utf-8";
	}
	if(c=="shift-jis"){
		word = UnescapeSJIS(word);
	}else if(c=="euc-jp"){
		word = UnescapeEUCJP(word);
	}else{
		word=decodeURI(word);
	}
	word = decodeURI(word);
	word = word.replace(/</g,'&lt;');
	word = word.replace(/>/g,'&gt;');
	word = word.replace(/&/g,'&amp;');
	word = word.replace(/\"/g,'&quat;');
	word = word.replace(/\'/g,'&#39;');

	return word;
}
function encodeWord(word,code){	//文字(word)をURLコードに変換する。codeを指定しない場合は、utf-8
	if(code){
		var c=  code.toLowerCase();
	}else{
		var c = "utf-8";
	}
	if(c=="shift-jis"){
		word = EscapeSJIS(word);
	}else if(c=="euc-jp"){
		word = EscapeEUCJP(word);
	}else{
		word = encodeURI(word);
	}
	return word;
}
window.onresize = frameResize;


-->