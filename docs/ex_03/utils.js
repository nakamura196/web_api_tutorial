function get_params(){
  var arg  = new Object;
  var url = location.search.substring(1).split('&');

  for(var i=0; url[i]; i++) {
    var k = url[i].split('=');
    arg[k[0]] = decodeURIComponent(k[1]);
  }
  return arg;
}

function set_params(){
  if(q){
    $("input[name='q']").val(decodeURIComponent(q));
  }
  $("input[name='isbn']").val(isbn);
  $("input[name='target']").val([target]);
}

function show_url(url){
  var a = $("<a>");
  $("#target_url").append(a);
  a.attr("href", url);
  a.append(url);
}

function add_row(thumb, title, publisher, url){
  var tbody = $("#tbody");

  var tr = $("<tr>");
  tbody.append(tr);

  var td = $("<td>");
  tr.append(td);

  if(thumb){
    let img = $("<img>");
    img.attr("src", thumb);
    td.append(img);
  }

  td = $("<td>");
  tr.append(td);
  td.append(title);

  td = $("<td>");
  tr.append(td);
  td.append(publisher);

  td = $("<td>");
  tr.append(td);

  if(url){
    let a = $("<a>");
    td.append(a);
    a.attr("href", url);
    a.append(url);
  }
}
