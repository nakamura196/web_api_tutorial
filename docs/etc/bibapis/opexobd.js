/****************
opexodb.jsはopenBDとNDLサーチなどから取得した書誌と、openBDとGoogleBooksから取得した表紙画像を組み合わせて、
簡単にブックリストを作るための仕組みです。
利用は営利・非営利を問わず無料、再配布・ソースの変更も自由です。著作権表示なども不要です。
ただし、その利用によって発生したいかなる損害も当方は保障しかねます。すべて自己責任でお願いします。
作成：wemfls
サイト:http://wemfls.web.fc2.com/
******************/

var wemOBDMode='SHOSHI';//IMAGE（表紙画像）、TITLE（表紙画像＋タイトル）、SHOSHI（書誌情報）の３択。指定されない場合には、IMAGE。
var wemOBDDisp='booklist';//表示領域のID（'ISBN:ISBN番号'で指定する場合は不要))
var wemOBDLink='http://api.calil.jp/openurl?rft.isbn=OPACWORD';//リンク先を指定ISBNを指定する部分に'OPACWORD'の文字列を代入
var wemAPIsite='NDL';//openBDの後に調べるAPIを、NDL(NDLサーチAPI),CINII(CiniiBooksAPI),GOOGLE(GoogleBooksAPI)から選択
var wemOBDFLG='';//ONLYを入れると書誌取得にwemAPIsiteのAPIしか使わなくなる（openBDを使わない）
var wemISBNList ='';//ISBNを入れる変数。空の場合は、ISBN入力画面が表示される
var wemOBDsysid='';//calilで検索対象の図書館システムを指定したいときに、システムIDを入力する。

var wemNoOBDList = new Array();

addOnload(getBookList);	//onloadに追加する関数。これで不要ならコメントアウトすること。

function getBookList(){	//ISBNリストをGETで受け取るか、あらかじめwemISBNListに持っていた場合は、書誌を取得するためにwemGetOpenBDを呼び出す
	var getArr = retrieveGET(location.href);
	if(wemISBNList.length>0){
		var csv = wemISBNList;
		wemGetOpenBD(csv);
	}else if(getArr["isbn"]){
		var cells = getArr["isbn"].split("%2C");
		if(cells.length==1){
			cells = splitByLength(getArr["isbn"],13);
		}
		var csv = new Array();
		for (var i = 0; i < cells.length; i++) {
			if(ISBN13to10(cells[0])!=0){
				csv.push(cells[i]);
			}
		}
		if(csv.length >0){
			if(wemOBDsysid){
				console.log("getSession "+wemOBDsysid);
				var body = document.getElementsByTagName('body')[0];
				body.innerHTML += '<iframe style="width:1px; height:1px; border:none; display:none;" src="https://calil.jp/search?q=OPACWORD&sysid=' + wemOBDsysid+ '"></iframe>';
			}
			wemGetOpenBD(csv);
		}
	}
}

function wemGetOpenBD(csv){	//openBDから書誌などを取得するためにクエリを投げる
	if(document.getElementById(wemOBDDisp)){
		document.getElementById(wemOBDDisp).innerHTML='';
	}
	var d = document.getElementsByTagName('div');
	var lng = d.length;
	for(var i =0; i<lng; i++){
		if(d[i].getAttribute('id')&&d[i].getAttribute('id').indexOf('ISBN:')===0){
			var idIsbn = d[i].getAttribute('id').split(':');
			if(ISBN13to10(idIsbn[1])!=0){
				d[i].setAttribute('id','ISBN:'+ISBN13to10(idIsbn[1]));
			}
		}
	}
	var isbnlist='';
	for(var i=0; i < csv.length; i++){
		if(ISBN13to10(csv[i])!=0){
			if(wemOBDFLG=='ONLY'){
				wemNoOBDList.push(ISBN13to10(csv[i]));
			}else{
				isbnlist += ISBN13to10(csv[i])+',';
			}
		}
	}
	if(wemOBDFLG=='ONLY'){
		noOpenBD(0);
	}else{
		var url = 'https://api.openbd.jp/v1/get?isbn='+isbnlist.substr( 0, isbnlist.length-1 )+'&pretty';
		console.log(url)
		var req = new XMLHttpRequest();		  // XMLHttpRequest オブジェクトを生成する
		req.onreadystatechange = function() {		  // XMLHttpRequest オブジェクトの状態が変化した際に呼び出されるイベントハンドラ
			if(req.readyState == 4 && req.status == 200){ // サーバーからのレスポンスが完了し、かつ、通信が正常に終了した場合
				wemGetOpenBDResult(JSON.parse(req.responseText),isbnlist.substr( 0, isbnlist.length-1 )); // 取得した JSON ファイルの中身を表示
			}
		};
		req.open("GET", url, true); // HTTPメソッドとアクセスするサーバーの　URL　を指定
		req.send(null);
	}
}
function wemGetOpenBDResult(result,isbnlist){//openBDから結果が戻ってきたら、その内容を処理し、該当データが取得できない場合はサブの書誌APIにクエリを投げる関数noOpenBDを呼び出す
	var item =new Array();
	var isbn = isbnlist.split(',');
	console.log(isbnlist+'|'+isbn[0] + '|' + result);
	if(result != null){
		item = result;
		for (i in item) {
			if(item[i]!= null){
				var bib = item[i].summary;
				var tit = bib.title;
				var series = bib.series;
				var aut = bib.author;
				var yy = bib.pubdate;
				var pub = bib.publisher;
				var cover = bib.cover;
				var cont = '';
				var tamesi ='';
				if(series !=""){
					cont += 'シリーズ:'+series+'<br />';
				}
				if(item[i].onix.CollateralDetail){if(item[i].onix.CollateralDetail.TextContent){if(item[i].onix.CollateralDetail.TextContent.Text){
					cont +=item[i].onix.CollateralDetail.TextContent.Text
				}}}
				if(item[i].hanmoto.hastameshiyomi){
					tamesii=item[i].hanmoto.hastameshiyomi
				}
				dispBook(isbn[i],cover,tit,aut,pub,yy+' <span class="powerBy">power by openBD</span>',cont,tamesi);
				if(cover ==""){
					var scriptElement = document.createElement("script");
					if(document.getElementById('jsonScript'+isbn[i])){document.getElementById('jsonScript'+isbn[i]).parentNode.removeChild(document.getElementById('jsonScript'+isbn[i]));}
					scriptElement.setAttribute("id", "jsonScript"+isbn);
					if(location.protocol=='https:'){
						scriptElement.setAttribute("src","https://encrypted.google.com/books?bibkeys=" + isbn[i] + "&jscmd=viewapi&callback=gba_Entries");
					}else{
						scriptElement.setAttribute("src","http://books.google.com/books?bibkeys=" + isbn[i] + "&jscmd=viewapi&callback=gba_Entries");
					}
					scriptElement.setAttribute("type", "text/javascript");
					document.getElementsByTagName('head')[0].appendChild(scriptElement);
				}
			}else{
				wemNoOBDList.push(isbn[i]);
			}
		}
	}else{
		wemNoOBDList.push(isbn[0]);
	}
	if(wemNoOBDList[0])noOpenBD(0);
}
function noOpenBD(n){	//openBDに無かった書誌についてサブの書誌APIを呼び出す（wemAPIsiteで指定）
	console.log('noOpenBD'+'|'+wemAPIsite+'|'+n+'|'+wemNoOBDList[n]);
	if(wemAPIsite=="CINII"){
		cinii_getData(n);
	}else if(wemAPIsite=="GOOGLE"){
		gba_getData(n);
	}else{
		ndl_getData(n);
	}
}
function dispBook(isbn,cover,title,aut,pub,yar,content,tamesiyomi){//書誌APIからデータをもらって、実際に画面上に描画する
	var divisbn = document.getElementById('ISBN:'+ isbn);
	if (!divisbn){//もし描画領域id=ISBN:ISBN10桁　が無い場合は、wemOBDDispに指定された領域に描画領域を作る
		var dispDiv =document.getElementById(wemOBDDisp);
		var divisbn= document.createElement('div');
		divisbn.setAttribute('id','ISBN:'+ isbn);
		if(wemOBDMode =='SHOSHI'){
			divisbn.setAttribute('class','bibData');
		}else{
			divisbn.setAttribute('class','titOnly');
		}
		dispDiv.appendChild(divisbn);
		if(wemOBDMode !='SHOSHI'){
			divisbn.style.display='inline-block';
		}
	}
	divisbn.innerHTML='';
	if(wemOBDMode == 'SHOSHI'){	//書誌情報を全て表示する場合
		if(cover){
			divisbn.innerHTML ='<div class="cover"><img src="'+cover+'" alt="表紙画像" /><br /><span style="font-size:75%;">by openBD</span></div>';
		}else{
			divisbn.innerHTML ='<div class="cover"></div>';
		}
		divisbn.innerHTML +='<a target="_blank" href="'+wemOBDLink.replace('OPACWORD',isbn)+'" class="title">'+title+'</a><br /><span class="auther">'+aut+'</span><br /><span class="publisher">'+pub+'</span><br /><span class="pubdate">'+yar+'</span><br />';
		if(tamesiyomi){
			divisbn.innerHTML += '<a href="'+tamesiyomi+'" target="_blank" class="tameshiyomi">試し読み</a><br />';
		}
		if(content){
			divisbn.innerHTML += '<span class="content">' + content +'</span><br />';
		}
	}else if(cover){	//書影がある場合
		if(wemOBDMode == 'TITLE'){
			divisbn.innerHTML +='<a target="_blank" href="'+wemOBDLink.replace('OPACWORD',isbn)+'" class="title">'+title+'</a>';
		}
		divisbn.innerHTML +='<div class="cover"><img src="'+cover+'" alt="表紙画像" /><br /><span style="font-size:75%;">by openBD</span></</div>';
	}else{	//書影が無い場合
		if(wemOBDMode == 'TITLE'){
			divisbn.innerHTML ='<a target="_blank" href="'+wemOBDLink.replace('OPACWORD',isbn)+'" class="title">'+title+'</a>';
		}
		divisbn.innerHTML +='<div class="cover"><span class="auther">'+aut+'</span><br /><span class="publisher">'+pub+'</span><br /><span class="pubdate">'+yar+'</span></div>';
	}
	return divisbn;
}

function removediv(divid){	//与えられたIDのdivを削除する
	var d = document.getElementById(divid);
	d.parentNode.removeChild(d);
}

function createHttpRequest(){// XMLファイルを開くための関数
	if(window.ActiveXObject){
		try{
			return new ActiveXobject("Msxml2.XMLHTTP")
		}catch(e){
			try{
				return new ActiveXObject("Microsoft.XMLHTTP")
			}catch(e2){
				return null;
			}
		}
	}else if(window.XMLHttpRequest){
		return new XMLHttpRequest();
	}else{
		return null;
	}
}
function ISBN13to10( isbn13 ){	//isbn13で与えられた文字列をISBNを10桁へ修正（10桁の場合はそのまま）
	isbn13 = isbn13.replace(/(^\s+)|(\s+$)/g, "");
	isbn13 = isbn13.replace(/\r\n/g,'');
	isbn13 = isbn13.replace(/(\n|\r)/g, '');
	var base = isbn13.toString().split("-").join("");
	if(base.length==13){
		base=base.slice(3,-1);
		var digit = 0;
		for(var i=0; i<base .length; i++){
			digit += Number(base.charAt(i)) * (10-i);
		}
		digit %= 11;
		digit = 11-digit;
		if(digit == 10){
			digit='X';
		}else if(digit == 11){
			digit='0';
		}
		return base + digit.toString();
	}else if(base.length==10){
		return base;
	}else{
		return '0';
	}
}
function trimStr(word){	//文字列をTrimする
	word = word.replace(/(^\s+)|(\s+$)/g, "");
	word = word.replace(/\r\n/g,'');
	word = word.replace(/(\n|\r)/g, '');
	return word;
}
function retrieveGET(url){
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
function splitByLength(str, length) {
	var resultArr = new Array();
	var index = 0;
	var start = index;
	var end = start + length;
	while (start < str.length) {
		resultArr[index] = str.substring(start, end);
		index++;
		start = end;
		end = start + length;
	}
	return resultArr;
}

function cinii_getData(n){
	var isbn = wemNoOBDList[n];
	if(ISBN13to10(isbn)!=0){
		var cf = "https://ci.nii.ac.jp/books/opensearch/search?isbn="+isbn;
		var httpobj = createHttpRequest(); //対象のファイルを開く
		httpobj.open("GET",cf,true);
		httpobj.onreadystatechange = function(){
			if (httpobj.readyState==4){
				if(httpobj.status == 200||httpobj.status == 0){
					var tit = 'ISBN:'+isbn;
					var aut = ' ';
					var yy = ' ';
					var pub = ' ';
					var bibData = httpobj.responseXML.documentElement.getElementsByTagName('entry')[0];
					if(bibData){
						if(bibData.getElementsByTagName('title')){
							tit = bibData.getElementsByTagName('title')[0].childNodes[0].nodeValue ;
							if(bibData.getElementsByTagName('name')){
								if(bibData.getElementsByTagName('name')[0].childNodes[0])aut = bibData.getElementsByTagName('name')[0].childNodes[0].nodeValue ;
							}
							if(bibData.getElementsByTagName('updated'))yy = bibData.getElementsByTagName('updated')[0].childNodes[0].nodeValue;
							if(bibData.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/','publisher'))pub = bibData.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/','publisher')[0].childNodes[0].nodeValue;
							dispBook(isbn,"",tit,aut,pub,yy+' <span class="powerBy">power by Cinii</span>');
						}
						dispBook(isbn,"",tit,aut,pub,yy+' <span class="powerBy">power by Cinii</span>');
					}else{
						dispBook(isbn,"",tit,aut,pub,yy);
					}


					var scriptElement = document.createElement("script");
					if(document.getElementById('jsonScript'+isbn)){document.getElementById('jsonScript'+isbn).parentNode.removeChild(document.getElementById('jsonScript'+isbn));}
					scriptElement.setAttribute("id", "jsonScript"+isbn);
					if(location.protocol=='https:'){
						scriptElement.setAttribute("src","https://encrypted.google.com/books?bibkeys=" + isbn + "&jscmd=viewapi&callback=gba_Entries");
					}else{
						scriptElement.setAttribute("src","http://books.google.com/books?bibkeys=" + isbn + "&jscmd=viewapi&callback=gba_Entries");
					}
					scriptElement.setAttribute("type", "text/javascript");
					document.getElementsByTagName('head')[0].appendChild(scriptElement);

					for(var j=0; j<wemNoOBDList.length; j++){
						if(isbn==wemNoOBDList[j] && wemNoOBDList[j+1]){
							setTimeout(function(){noOpenBD(j+1)},500);
							break;
						}
					}
				}
			}
		}
		try{
			httpobj.send(null);
		}catch(e){}
	}
}
function ndl_getData(n){
	var isbn = wemNoOBDList[n];
	if(ISBN13to10(isbn)!=0){
		var url = "http://iss.ndl.go.jp/api/opensearch?isbn="+isbn;
		var script = document.createElement('script');
		script.src = 'https://query.yahooapis.com/v1/public/yql?q='+encodeURIComponent('select * from rss where url ="'+url+'"')+ '&format=json&diagnostics=true&callback=wemGetNdlData';
		script.charset = 'UTF-8';
		document.body.appendChild(script);
	}
}
function wemGetNdlData(result){
	var url = result.query.diagnostics.url.content;
	isbn = url.replace('http://iss.ndl.go.jp/api/opensearch?isbn=','');
	if(result.query.results){
		if(result.query.results.item.length){
			for(var i=result.query.results.item.length-1; i>=0; i--){
				if(result.query.results.item[i].category!="障害者向け資料" && result.query.results.item[i].publisher !="音訳サービスＪ"){
					var item = result.query.results.item[i];
					break;
				}
			}
		}else{
			var item = result.query.results.item;
		}
		var aut="";
		var pub="";
		var yy ="";
		var cont="";
		if(item){
			if(item.title instanceof Array){
				var tit = item.title[0];
			}else{
				var tit = item.title;
			}
			if(item.creator){
				if(item.creator instanceof Array){
					aut = item.creator[0];
				}else{
					aut = item.creator;
				}
			}
			pub=item.publisher;
			//	console.log(item.publisher);
			if(item.publisher){
				if(item.publisher instanceof Array){
					pub = item.publisher[0];
				}else{
					pub = item.publisher;
				}
			}
			if(item.pubDate){
				yy = item.pubDate.split(' ')[3];
			}
			if(item.seriesTitle){
				if(item.seriesTitle instanceof Array){
					cont +='シリーズ:'
					for(var i=0; i < item.seriesTitle.length; i++){
						cont += item.seriesTitle[i];
					}
				}else{
					cont += item.seriesTitle;
				}
				cont += '<br />';
			}
			if(item.subject){
				if(item.subject instanceof Array){
					cont +='分類番号:'
					for(var i=0; i < item.subject.length; i++){
						if(item.subject[i].type){cont += item.subject[i].type.replace('dcndl:','') +':'+ item.subject[i].content+' ';}
					}
				}else{
					cont += item.subject.type.replace('dcndl:','') +':'+ item.subject.content;
				}
				cont += '<br />';
			}
		}else{
			var tit = 'ISBN:'+isbn;
		}
		dispBook(isbn,"",tit,aut,pub,yy+' <span class="powerBy">power by NDLサーチ</span>',cont);
	}else{
		var tit = 'ISBN:'+isbn;
		dispBook(isbn,"",tit,'','','');
	}

	for(var j=0; j<wemNoOBDList.length; j++){
		if(isbn==wemNoOBDList[j] && wemNoOBDList[j+1]){
			setTimeout(function(){noOpenBD(j+1)},500);
			break;
		}
	}
	var scriptElement = document.createElement("script");
	if(document.getElementById('jsonScript'+isbn)){document.getElementById('jsonScript'+isbn).parentNode.removeChild(document.getElementById('jsonScript'+isbn));}
	scriptElement.setAttribute("id", "jsonScript"+isbn);
	if(location.protocol=='https:'){
		scriptElement.setAttribute("src","https://encrypted.google.com/books?bibkeys=" + isbn + "&jscmd=viewapi&callback=gba_Entries");
	}else{
		scriptElement.setAttribute("src","http://books.google.com/books?bibkeys=" + isbn + "&jscmd=viewapi&callback=gba_Entries");
	}
	scriptElement.setAttribute("type", "text/javascript");
	document.getElementsByTagName('head')[0].appendChild(scriptElement);
}
function gba_getData(n){
	var isbn = wemNoOBDList[n];
	if(ISBN13to10(isbn)!=0){
		var url = "https://www.googleapis.com/books/v1/volumes?q=isbn:"+isbn+"&callback=wemGetGBA";
		var script = document.createElement('script');
		script.src = url;
		script.charset = 'UTF-8';
		document.body.appendChild(script);
	}
}
function wemGetGBA(result){
	if(result.totalItems) {
		var item = result.items[0].volumeInfo;
		var isbn = ISBN13to10(item.industryIdentifiers[0].identifier)
		var tit = item.title;
		var aut="";
		if(item.authors){
			if(item.authors instanceof Array){
				for(var i=0; i< item.authors.length; i++){
					aut += item.authors[i]+',';
				}
			}else{
				aut = item.authors;
			}
		}
		var yy = item.publishedDate;

		var cont ="";
		if(item.description){
			cont = item.description;
		}
		var divisbn = dispBook(isbn,"",tit,aut,"",yy+' <span class="powerBy">power by GoogleBooks</span>',cont);

		var cover="";
		if(item.imageLinks){if(item.imageLinks.thumbnail){
			cover = item.imageLinks.thumbnail;
			var d = divisbn.getElementsByTagName('div');
			for(var j=0; j<d.length; j++){
				if(d[j].getAttribute('class')=='cover'){
					d[j].innerHTML = '<a href="'+item.previewLink+'" target="blank"><img src="'+cover+'" alt="表紙画像" /></a><br /><span style="font-size:75%;">by Google</span>';
					break;
				}
			}
		}}
		for(var j=0; j<wemNoOBDList.length; j++){
			if(isbn==wemNoOBDList[j] && wemNoOBDList[j+1]){
				setTimeout(function(){noOpenBD(j+1)},500);
				break;
			}
		}
	}else{
		var scp = document.getElementsByTagName('script');
		var url =scp[scp.length-1].src;
		url = url.replace('https://www.googleapis.com/books/v1/volumes?q=isbn:','');
		isbn = url.split('&')[0];
		for(var j=0; j<wemNoOBDList.length; j++){
			if(isbn==wemNoOBDList[j] ){
				dispBook(isbn,"",'ISBN:'+isbn,"","","");
				if(wemNoOBDList[j+1]){
					setTimeout(function(){noOpenBD(j+1)},500);
				}
				break;
			}
		}
	}
}
function gba_Entries(booksInfo) {//本を表示するgba_searchのコールバック関数：表示先はidがdivid
	for (i in booksInfo) {
		var book = booksInfo[i];
		if(document.getElementById('ISBN:'+book.bib_key)&&book.thumbnail_url){
			var divisbn = document.getElementById('ISBN:'+book.bib_key);
			var d = divisbn.getElementsByTagName('div');
			for(var j=0; j<d.length; j++){
				if(d[j].getAttribute('class')=='cover'){
					d[j].innerHTML = '<a href="'+book.info_url+'" target="blank"><img src="'+book.thumbnail_url+'" alt="表紙画像" /></a><br /><span style="font-size:75%;">by Google</span>';
					break;
				}
			}
			break;
		}
	}
}
function addOnload(func){//onlaodがすでにある場合に、OPAC＋用の関数を追加するための関数
	try {
		window.addEventListener("load", func, false);
	} catch (e) {
		// IE用
		window.attachEvent("onload", func);
	}
}
