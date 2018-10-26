function search_openbd(isbn){

  var url = "https://api.openbd.jp/v1/get?isbn="+isbn;

  show_url(url);

  $.getJSON(url, function(data) {

    console.log(data);

    if(data[0] != null){
      for(var i = 0; i < data.length; i++){
        var item = data[i]["summary"];
        var title = item["title"];
        var publisher = item["publisher"];
        var url = "http://api.calil.jp/openurl?rft.isbn="+item["isbn"];
        var thumb = null;
        if(item["cover"]){
          thumb = item["cover"];
        }
        add_row(thumb, title, publisher, url);
      }
    }
  })
}
