var stylesheet=
 '<style>\
.current .twitts ul.navi{\
	background:radial-gradient(black 15%, transparent 16%) 0 0,radial-gradient(black 15%, transparent 16%) 8px 8px,radial-gradient(rgba(255,255,255,.1) 15%, transparent 20%) 0 1px,radial-gradient(rgba(255,255,255,.1) 15%, transparent 20%) 8px 9px;\
	background:\
		-webkit-radial-gradient(black 15%, transparent 16%) 0 0,\
		-webkit-radial-gradient(black 15%, transparent 16%) 8px 8px,\
		-webkit-radial-gradient(rgba(255,255,255,.1) 15%, transparent 20%) 0 1px,\
		-webkit-radial-gradient(rgba(255,255,255,.1) 15%, transparent 20%) 8px 9px;\
	background-color:#282828;\
	background-size:16px 16px;\
}\
#twitt_list > li.lang_fa p {\
    text-align: right;\
    direction: rtl;\
}\
#send_twitt textarea {\
}\
#send_twitt {\
    position: fixed;\
    top: 0px;\
    width: 90%;\
}\
@media (max-width: 600px) {\
    .twitt p,#send_twitt textarea {\
        font-size: 18px;\
    };\
}\
@media (min-width: 601px) {\
    #send_twitt center {\
        display: inline-block;\
        margin: 15px 0;\
    }\
    #send_twitt {\
        margin: 0;\
        padding: 0;\
        position: fixed;\
        top: 0;\
        width: 100%;\
    }\
    #send_twitt button {\
        margin: 15px;\
    }\
    #send_twitt textarea {\
        background-color: #fff;\
        font-size: 160%;\
        height: 200px;\
        margin: 20px auto;\
        width: 95%;\
    }\
    .counter {\
        margin: 15px;\
    }\
	#twitt_list .twitt p{\
		font-size: 160%;\
	}\
	.current .twitts ul.navi{\
		background-size:25px 25px;\
	}\
}\
.twitt{\
	font-family: none;\
}\
.twitt p {\
    margin: 0;\
    padding: 15px 5px 0;\
    font-family: none;\
    direction: ltr;\
    text-align: left;\
}\
.current .flash {\
    position: fixed;\
    text-align: center;\
    top: 0;\
    width: 100%;\
    z-index: 15;\
    display: none;\
}\
.current .flash .message {\
    display: inline-block;\
    font-size: 12px;\
    font-weight: bold;\
    margin: 0px;\
    padding: 18px;\
    width: 100%;\
    text-align: center;\
    font-family: Tahoma, Geneva, sans-serif;\
    font-size: 12px;\
    direction: rtl;\
}\
.current .flash .message.success {\
    background-color: #27B5E2;\
    border-color: #27B5E2;\
    color: #fff;\
}\
.current .flash .message.error {\
    background-color: #FDD9D9;\
    border-color: #FBC2C4;\
    color: #7A0000;\
}\
.current .flash .message.info {\
    background-color: #D5EDF8;\
    border-color: #92CAE4;\
    color: #205791;\
}\
.current .flash .message.notice {\
    background-color: #FFF6BF;\
    border-color: #FFD324;\
    color: #514721;\
}\
.twitts_wait {\
    background: url(data:image/gif;base64,R0lGODlhEAAQAPIAAN7g4wAAAKmrrTk6OgAAAFVWV3FydH+AgiH+GkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAAKAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQACgABACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkEAAoAAgAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkEAAoAAwAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkEAAoABAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQACgAFACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQACgAGACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAAKAAcALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==) no-repeat scroll center 0 transparent;\
}\
#twitts #twitt_list > li.user {\
	 background-color: lightslategray;\
}\
#twitts #twitt_list > li {\
  border-radius:0px;\
  margin:0px;\
  border-bottom:0px;\
}\
#twitts .twitt ul.footer{\
	border-top:0px;\
}\
#twitts .twitt .header.footer li{\
	border:0px;\
}\
</style>';

$(document).ready(function(e) {
	$('head').append(stylesheet);
})
function setFlashNew(){
	$mess = arguments[0];
	$class = arguments[1];
	$fade = arguments[2];
	if(!$fade){
		$fade = 1;
		$rand = Math.floor(Math.random()*1000);
	}else{
		$rand = $fade;
	}

	//alert($fade);
	
	
	if(!$(".flash").attr('class')){
		$("#container").append('<div class="flash"></div>');
	}
	if(!$("#flashMessage_"+$rand).attr('id')){
		$(".flash").append('<div class="message" id="flashMessage_'+$rand+'"></div>');
	}
	//$(".message").removeClass('success error info');
	$("#flashMessage_"+$rand).addClass($class);
	$("#flashMessage_"+$rand).html($mess);
	$(".flash").show();
	$("#flashMessage_"+$rand).show();
	
	if($fade==1) {
		$("#flashMessage_"+$rand).animate({opacity: 1.0}, 3000).fadeOut("slow", function(){
			$(this).remove();
			$(".flash").hide();
		});
		//alert('test');
	}
	
	return $("#flashMessage_"+$rand);
}