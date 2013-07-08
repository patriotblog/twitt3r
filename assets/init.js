function addJavascript(js,pos) {
	var th = document.getElementsByTagName(pos)[0];
	var s = document.createElement('script');
	s.setAttribute('type','text/javascript');
	s.innerHTML = js;
	th.appendChild(s);
	count++;
} 
function addLinkTag(rel, href) {
	var th = document.getElementsByTagName('head')[0];
	var s = document.createElement('link');
	s.setAttribute('rel',rel);
	s.setAttribute('href',href);
	th.appendChild(s);
} 
function urldecode(url) {
	return decodeURIComponent(url.replace(/\+/g, ' '));
}
function checkload(){
	if(try_count>600){
		window.location = window.location;
		return;
	}
	try_count++;
	c = scripts_object.length;
	p = (count/c)*100;
	$(".install_loader .pers").animate({
		width:p+'%',
		duration: 3000
	});	
	if(count==c){
		setTimeout(function(){
			$(".install_loader").remove();
			inits();
		}, 2000);
	}else{
		setTimeout(function(){checkload();}, 1000);
	}
}
function are_cookies_enabled(){
	var cookieEnabled=(navigator.cookieEnabled)? true : false

	//if not IE4+ nor NS6+
	if (typeof navigator.cookieEnabled=="undefined" && !cookieEnabled){ 
		document.cookie="testcookie"
		cookieEnabled=(document.cookie.indexOf("testcookie")!=-1)? true : false
	}
	return cookieEnabled;
}
function start_app(){
	if(are_cookies_enabled()){
		my_tokens = getCookie('tokens');
	}else{
		my_tokens = localStorage.getItem('tokens');
	}
	if(!my_tokens){
		window.location = 'login.html';
		return;
	}
	scripts_object_l = localStorage.getItem('scripts_object');
	scripts_object = JSON.parse(scripts_object_l);
	if(scripts_object_l==null || typeof(scripts_object)!='object' || global_settings_obj.reloadonstartup || global_settings_obj.newVersion){
		$.ajax({
			url:'init.php',
			xhrFields: {
			   //withCredentials: true
			},
			crossDomain: true,
			data:{
				token:my_tokens,
				device:'android',
			},
			timeout: 3000,
			type:'POST',
			beforeSend:function(){
				//xhr.withCredentials = true; 
			},
			success: function(a){
		
				var _obj = JSON.parse(a);
				if(_obj && _obj.status=='success'){
					object = _obj.response;
					scripts_object = object.scripts;
					count = 0;
					if(typeof(object.profile)!='object'){
						test_oath = JSON.parse(object.profile);
						alert(test_oath.errors[0].message);
						return;
					}
					localStorage.setItem('profile', object.profile.tokenss);
					localStorage.setItem('user_data', JSON.stringify(object.profile.user_data));
					localStorage.setItem('app_data', JSON.stringify(object.app_data));
					localStorage.setItem('scripts_object', JSON.stringify(object.scripts));
					
					global_settings_obj.currentVersion = object.api_version;
					global_settings_obj.newVersion = false;
					localStorage.setItem('settings', JSON.stringify(global_settings_obj));
	
					
					if(object.profile)
						tmpPro = JSON.parse(object.profile.tokenss);
						
					$(".myusername").val(tmpPro.screen_name);
					
					deScriptsForMe(scripts_object);
					
					try_count = 0;
					checkload();
				}else{
					window.location = 'login.html';
				}
			},
			complete:function(a, status){
				if(status!='success'){
					var r=confirm("Check Your Connection And Try Again")
					if (r==true){
					  start_app()
					}else{
					  return false;
					}
				}
			}
		});
	}else{
		console.log('no');
		count = 0;
		
		deScriptsForMe(scripts_object);
		
		tmpPro = JSON.parse(my_tokens);
		$(".myusername").val(tmpPro.screen_name);
		checkload();
	}
}
					
var try_count=0;
var my_tokens = {};
var settings_val = localStorage.getItem('settings');
var global_settings_obj = JSON.parse(settings_val);

if(!global_settings_obj || typeof(global_settings_obj.reloadonstartup)=='undefiend' || typeof(global_settings_obj.newVersion)=='undefiend'){
	global_settings_obj = new Object;
	global_settings_obj.showimage = false;
	global_settings_obj.showlinksonembedbrowser = true;
	global_settings_obj.reloadonstartup = false;
	global_settings_obj.newVersion = false;
	global_settings_obj.currentVersion = '';
	localStorage.setItem('settings', JSON.stringify(global_settings_obj));
}
setTimeout(function(){
	start_app();
},500);
function deScriptsForMe(scripts_object){
	for(var i=0; i<scripts_object.length; i++){
		obj = scripts_object[i];
		data = localStorage.getItem(obj.md5);
		if(data){
			addJavascript(data, 'head');
		}else{
			
			$.ajax({
				mydata:{obj:obj, i:i, t:scripts_object.length},
				url:urldecode(obj.url),
				success: function(data){	
					obj = this.mydata.obj;
					localStorage.setItem(obj.md5, data);
					addJavascript(data, 'head');

				}
			});
		}
		
	}
}