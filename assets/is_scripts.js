function scrolling(){
}
function my_scrolling(){
	$('#twitt_list').scrollz({
			pull : true
		});
   $('#twitt_list').scrollz('hidePullHeader');   
   $('#twitt_list').bind('pulled', function() {
   //$('#twitt_list').scrollz('height', 1200);
		
		nextPageIndex = 0;
		
		reload();
	});
		
	// Load more function : used to load AJAX content (uses Twitter JSONP)
	var nextPageIndex = 0;
	var loading = false;	
}
my_scrolling();
function reload() {
	app.listview.fetch();
}
function loadMore(){
	//app.listview.paginationNext();
}