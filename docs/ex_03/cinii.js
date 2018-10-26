function search_cinii(q, isbn){

  var url = "https://ci.nii.ac.jp/opensearch/search?q="+q+"&format=json";

  show_url(url);

  $.getJSON(url, function(data) {

    console.log(data);
    
    if(data["@graph"]){

      var tbody = $("#tbody");

      var items = data["@graph"][0]["items"];
      for(var i = 0; i < items.length; i++){
        var item = items[i];
        var title = item["title"];
        var publisher = item["dc:publisher"];
        var url = item["@id"];
        var thumb = null;
        add_row(thumb, title, publisher, url);
      }
    }
  })
}
