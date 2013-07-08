// JavaScript Document
wait = "<div class='w8'></div>";
twitt_view = '<div><div id="" class="twitt"><ul class="header"><li class="user"><a href=""><span></span></a></li><li class="fav " data-id=""><a href="#">fav</a></li><li class="rep" data-user="" data-id=""><a href="#">rep</a></li><li class="rt" data-id=""><a href="#">RT</a></li></ul><p></p></div></div>';

var imgSrcArray = new Array();
var mywindow;
var apear_count = 0;
var currentOffset = 0;
var isComposeOpen = false;
function setOffsetx() {
	currentOffset = window.pageYOffset;
	localStorage.setItem("app_init_top_offset", currentOffset);
	setTimeout(function(){
		setOffsetx();
	},3000);
}
function setApiSettings(settings){
	console.log('settings:');
	console.log(settings);
	if(global_settings_obj.currentVersion==settings.version){
		console.log('same');
	}else{
		console.log('new version relased');
		global_settings_obj.newVersion=true;
	}
	console.log(global_settings_obj);
	localStorage.setItem('settings', JSON.stringify(global_settings_obj));
}
$(document).ready(function(e) {
	
	$("#AuthorizeBtn").live("click", function(){
		window.location = $(this).attr('href');
	});
	
	$(".authorize_btn").data('href', 'http://twitt3r.ir/twitt3r/index_app.php?authorize=1&call_back=index.html');
	$(".authorize_btn").attr('href', '#');
	
	$("#AuthorizeBtn").live("click", function(){
		btn = $(this);
		$(btn).css('opacity', 0.5);
		url = $(btn).data('href');
		console.log(url);
		mywindow = window.open(url, "mywindow", "location=0,status=0,scrollbars=1,width=600, height:400");
		
		return false;
	});
	$("#twitts").live("dblclick",function(){
		
		if($(".sidebar").is(":visible")){
			closeSidebar();
		}
	})
});	
window.addEventListener("message", listener, false);
//$(document).ready(function(e) {
	
function are_cookies_enabled(){
	var cookieEnabled = (navigator.cookieEnabled) ? true : false;

	if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled)
	{ 
		document.cookie="testcookie";
		cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
	}
	return (cookieEnabled);
}
function setCookie(c_name,value,exdays){
	//alert('c_name:'+c_name);
	//alert('value:'+value);
	//alert('exdays:'+exdays);
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
	//alert(document.cookie);
}
function getCookie(c_name){
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++){
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name){
			return unescape(y);
		}
	}
}
function listener(event){
	//alert('ikk');
	console.log(event);
	
	if (event.origin !== "http://twitt3r.ir")
		return;
		
	tokens = JSON.parse(event.data);
	console.log(tokens);
	if(tokens.type=='token'){
		//alert(event.origin);
		if(are_cookies_enabled()){
			console.log('coo');
			setCookie('tokens', JSON.stringify(tokens.value), 10);
		}else{		
			console.log('local');
			localStorage.setItem('tokens', JSON.stringify(tokens.value));
		}
		//alert(getCookie('tokens'));
		mywindow.close();
		window.location = 'index.html';
	}
}
function closeSidebar(){
	$(".sidebar").animate({
		left:'-75%',
		duration: 1000
	}, function(){
		$(".sidebar").remove();
	});	
}	
function follow_actions(x){
	app.userlistview.action_follow({target:x});
}
function getImageSrcs(){
	$("img[data-src]").each(function(index, element) {
       imgSrcArray.push({src:$(this).attr('data-src'), obj:this, type:'src'});
    });
	
	$("div[data-src]").each(function(index, element) {
       imgSrcArray.push({src:$(this).attr('data-src'), obj:this, type:'bg'});
    });	
}
function loadScripts(){

	

	twitter_mini_png = localStorage.getItem('twitter_mini_png');
	if(twitter_mini_png){
		new_addr = twitter_mini_png;
		setMetaTagsForIOS(new_addr);
	}else{
		$.get('avatar.php?format=b&src='+$.base64.encode('http://twitt3r.ir/twitt3r/assets/images/_twitter_logo.png'), function(logo){
			new_addr = 'data:image/gif;base64,'+logo;	
			localStorage.setItem('_twitter_logo_png', new_addr);
			setMetaTagsForIOS(new_addr);
		});
	}
	
	
	function setMetaTagsForIOS(new_addr){	
		//addLinkTag('apple-mobile-web-app-capable', new_addr);
		//addLinkTag('apple-touch-icon-precomposed', new_addr);
		
	}	
				
					
	//$(".menu li a[href='send.php']").removeAttr('href');
	
	$(document).bind("mobileinit", function(){
		//$.event.special.swipe.verticalDistanceThreshold =10;
		//$.event.special.swipe.horizontalDistanceThreshold =100;
		//$.event.special.tap.tapholdThreshold ='4500';
		//$.event.special.swipe.durationThreshold = 1500;
	});
	$(document).keyup(function(e) {
		x = $("#send_twitt textarea").val();
        $(".counter").html(x.length);
		if(x.length>140)
			$(".counter").addClass('red');
		else
			$(".counter").removeClass('red');
    });
	
	$("#ping, .ping").live("click", function(){
		isComposeOpen = true;
		text = localStorage.getItem("buffered_text");
		//$("#send_twitt").css('top', window.pageYOffset/10);
		
		$(".twitts").css('visibility', 'hidden');
		$("#send_twitt").toggle();
		//currentOffset
		$("#send_twitt textarea").focus();
		$("#send_twitt textarea").html(text);
		$("#send_twitt .reset").toggle();
	});
	$(".box_menu a").live('click',function(){
		closeSidebar();
	})
	/*
	$("#twitts").live("swipe", function(){
		
		closeSidebar();
		
	})
	*/
	
	$('#twitt_list > li:last-child').appear(function(event, $all_appeared_elements) {
		apear_count++;
		console.log('test apear: '+apear_count);
		if(apear_count<2){
			$("#next").click();
		}
	});
	$("#search_form_id").live('submit',function(){
		q = $('.search_box').val();
		if(q)
			app.search_action('#'+q);
	});
	$("li.search_btn a").live("click", function(){
		q = $(".search_box").val();
		if(q){
			//app.search_action('#'+q);
			$(this).next('form').submit();
			$(".search_box").remove();
		}else{
			if($(".search_box").attr('class')){
				$(".search_box").remove();
			}else{
				$(this).parent('li').append('<form id="search_form_id" action="#search"><input type="text" class="search_box"><input type="submit" style="display:none"></form>');
				$(".search_box").focus();
				old_q = app.listview.collection.mentions;
				
				if(old_q){
					if(old_q.indexOf('q_#')>-1)
						$(".search_box").val(old_q.replace('q_#', ''));
				}
			}
		}
	});
	/*
	$("li.twitt").live("tap", function(event){
		
		id = $(this).attr('id');
		$(".footer").hide();
		$("#"+id).children(".footer").toggle();
		//event.stopPropagation()
	});
	*/
	
	$(".rep").live("click", function(){
		id = $(this).attr('data-id');
		
		users = $(this).attr('data-users');
		text_before_reply = '';
		users = users.split(',');
		$(users).each(function(index, element) {
			if(element!=$(".myusername").val())
	            text_before_reply += '@'+element+' ';
        });
		
		btn = $(this);
		form = $("#send_twitt");
		$("#ping").click();
		
		$(form).children('.reply').val(id);
		$(form).children('textarea').html(text_before_reply);
		$(form).children('textarea').focus();
		$("#send_twitt .reset").show();
		moveCaretToEnd($(form).children('textarea'));
		return false;
	});
	
	$(".rt").live("click", function(){
		id = $(this).attr('data-id');
		btn = $(this);
		$.ajax({
			url:app_location_address+'action.php?token='+JSON.stringify(my_tokens)+'&w=retwitt',
			data:{
				id:id
			},
			type:"POST",
			beforeSend: function(a){
				//$(btn).after(wait);
				//$(btn).hide();
				$(btn).addClass('wait');
			},
			success: function(a){
				obj = $.parseJSON(a);
				if(obj.status=='success'){
					setFlashNew('انجام شد', 'success');
					//$(btn).toggleClass('faved');
				}else{
					errorObj = $.parseJSON(obj.response);
					setFlashNew(errorObj.errors, 'error');
				}
			},
			complete: function(a){
				//$(btn).show();
				//$(".w8").remove();
				$(btn).removeClass('wait');
			},
			error: function(a){
				//$(btn).show();
				$(btn).removeClass('wait');
			}
		});
		return false;
	});
	$(".fav").live("click", function(){
		id = $(this).attr('data-id');
		btn = $(this);
		$.ajax({
			url:app_location_address+'action.php?token='+JSON.stringify(my_tokens)+'&w=favorite',
			data:{
				id:id,
				cd:$(btn).hasClass('faved')
			},
			type:"POST",
			beforeSend: function(a){
				//$(btn).after(wait);
				$(btn).addClass('wait');
			},
			success: function(a){
				obj = $.parseJSON(a);
				if(obj.status=='success'){
					$(btn).toggleClass('faved');
					
					setFlashNew('انجام شد', 'success');
				}else{
					errorObj = $.parseJSON(obj.response);
					setFlashNew(errorObj.errors, 'error');
				}
			},
			complete: function(a){
				//$(".w8").remove();
				//$(btn).show();
				$(btn).removeClass('wait');
			},
			error: function(a){
				//$(btn).show();
				$(btn).removeClass('wait');
			}
		});
		return false;
	});
	$("#send_twitt .reset").live('click', function(){
		isComposeOpen = false;
		$("#send_twitt .reply").val('');
		text = $("#send_twitt textarea").val();
		localStorage.setItem("buffered_text", text);
		//$("#send_twitt textarea").html('');
		$("#send_twitt").fadeOut();
		//$(".twitts").fadeIn();
		$(".twitts").css('visibility', 'visible');
		$(".counter").html(0);
		$(this).hide();
	});
	$("#send_twitt").on("submit", function(){
		form = $(this);
		$.ajax({
			url:app_location_address+$(form).attr('action')+'&token='+JSON.stringify(my_tokens),
			data:$(form).serialize(),
			type:(form).attr('method'),
			beforeSend: function(a){
				$(form).append(wait);
				$(form).children('.submit').css('visibility', 'hidden');
			},
			success: function(a){
				obj = $.parseJSON(a);
				//errorObj = $.parseJSON(obj.response);
				errorObj = obj;
				if(obj.status=='success'){
					setFlashNew('انجام شد', 'success');
					localStorage.setItem("buffered_text", '');
					$("#send_twitt textarea").val('');
					$("#send_twitt textarea").html('');
					$("#send_twitt .reset").click();
					renderTwittView(errorObj);
				}else{
					
					
					if(errorObj.error)
						setFlashNew(errorObj.error, 'error');  
						  
					$(errorObj.errors).each(function(index, element) {
                    	setFlashNew(element.message, 'error');    
                    });
					
				}
					
			},
			complete: function(a){
				$(".w8").remove();
				$(form).children('.submit').css('visibility', 'visible');
			},
			error: function(a){
				$(form).children('.submit').css('visibility', 'visible');
			}
		});
		return false;
	});
}
function renderTwittView(twitt){
	$(".newTwitt").data('model',twitt.response);
	$(".newTwitt").click();
	if($(".newTwitt").data('h')!='5'){
		twitt_view_x = $(twitt_view).clone();
		$(".twitt", twitt_view_x).attr('data-id', twitt.id);
		$(".twitt .header .user a", twitt_view_x).attr('href', '?user='+twitt.user.screen_name);
		$(".twitt .header .user a span", twitt_view_x).html(twitt.user.screen_name);
		$(".twitt .header li", twitt_view_x).attr('data-id',twitt.id);
		$(".twitt .header li.rep", twitt_view_x).attr('data-user',twitt.user.screen_name);
		$(".twitt p", twitt_view_x).html(twitt.text);
		$(".twitt_list").prepend(twitt_view_x);
	}
}
function setFlash(){
	//alert('dddd');
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
	if($fade==1) $("#flashMessage_"+$rand).animate({opacity: 1.0}, 3000).fadeOut("slow", function(){
		$(this).remove();
	});
	return $("#flashMessage_"+$rand);
}
function animateFlash(flash){
	$(flash).fadeOut("slow", function(){
		$(this).remove();
	});
}
function moveCaretToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}
