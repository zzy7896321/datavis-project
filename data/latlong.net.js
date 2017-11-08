//https://www.latlong.net/
// use the console of chrome

(function() {
  if (! window.jQuery ) {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js'; // you can change this url by latest jQuery version
    (document.getElementsByTagName('head')[0] ||
      document.getElementsByTagName('body')[0]).appendChild(s);
  }
}());

let input = $("input[placeholder='Type a place name']");
let find_button = input.next();

function next() {
	result.push([city_names[cur], +$("#lat").val(), +$("#lng").val()]);
    ++cur;
    if (cur < city_names.length) {
        input.val(city_names[cur]);
        (new Promise(r => setTimeout(r, 500))).then(function () {
			find_button.click();
			(new Promise(r => setTimeout(r, 5000))).then(function () {next()});
		});
    }
}

function start_first() {
    result = [];
    cur = 0;
    input.val(city_names[cur]);
	(new Promise(r => setTimeout(r, 500))).then(function () {
		find_button.click();
		(new Promise(r => setTimeout(r, 5000))).then(function () {next()});
	});
}