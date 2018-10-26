function search_google(q, isbn){

  var query = "";
  if(q != ""){
    query += q;
  } else if(isbn != ""){
    query += "isbn:"+isbn;
  }

  var url = "https://www.googleapis.com/books/v1/volumes?q="+query+"&format=json";

  show_url(url);

  $.getJSON(url, function(data) {

    console.log(data);

    var items = data["items"];
    for(var i = 0; i < items.length; i++){
      var item = items[i]["volumeInfo"];
      var title = item["title"];
      var publisher = item["publisher"];
      var url = item["infoLink"];
      var thumb = null;
      if(item["imageLinks"]){
        thumb = item["imageLinks"]["smallThumbnail"];
      }
      add_row(thumb, title, publisher, url);
    }
  })
}
