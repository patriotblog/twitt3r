<?php
include('config.php');
date_default_timezone_set('UTC');
function isAjaxRequest(){
	if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
		return true;
	}	
	return false;
}

//$headers = apache_request_headers();

//var_dump($_SERVER);

header('Access-Control-Allow-Origin: null', true);

// send cookies from client
header('Access-Control-Allow-Credentials: true', true);
// allow all methods
header('Access-Control-Allow-Methods: GET, POST, OPTIONS', true);

$hasToken = false;
if(isset($_POST['token'])){
	$data = $_POST['token'];
	$data = str_replace('\"','"',$data);
	$data = str_replace('\"','"',$data);


	//exit(var_dump($data));
	
	$parsed_data = json_decode($data);
	//$parsed_data = json_decode($parsed_data);
	if(isset($parsed_data->screen_name))
		$hasToken = true;
	//echo 'fff';
	//exit(var_dump($parsed_data));
	
}
if($hasToken){}
elseif ( isset($_COOKIE['x_access_token']) ) {
	$data = $_COOKIE['x_access_token'];
	$data = str_replace('\"','"',$data);
	$data = str_replace('\"','"',$data);
	$parsed_data = json_decode($data);
	$parsed_data->screen_name = $_COOKIE[$config['cookie_screen_name']];
}else{
	print json_encode(array('status'=>'error', 'response'=>NULL));
	exit();
}
$tmhOAuth = new tmhOAuth(array(
  'consumer_key'    => $config ['Consumer_key'],
  'consumer_secret' => $config ['Consumer_secret'],
  'user_token' => $parsed_data->oauth_token,
  'user_secret' => $parsed_data->oauth_token_secret,
));

		$version = '1.0.1.3';
		$server_location = 'http://twitt3r.ir/twitt3r/';
		//$server_location = '';
		$js_list = array(
			urlencode($server_location.'assets.php?src=json2.js'),
			urlencode($server_location.'assets.php?src=underscore-min.js'),
			urlencode($server_location.'assets.php?src=backbone-min.js'),
			urlencode($server_location.'assets.php?src=entities.js&v=1.0.5'),
			urlencode($server_location.'assets.php?src=jquery.base64.min.js'),
			urlencode($server_location.'assets.php?src=scripts.js&v='.$version),
			urlencode($server_location.'assets.php?src=bb_scripts.js&v='.$version),
			//urlencode($server_location.'assets/jquery.mobile-1.2.0.min.js.js'),
		);
		$js_object = array();
		foreach($js_list as $js){
			$js_object['scripts'][] = array(
				'url'=>$js,
				'md5'=>md5($js)
			);	
		}
		//$tmhOAuth->config['user_token']  = $parsed_data->oauth_token;
 		//$tmhOAuth->config['user_secret'] = $parsed_data->oauth_token_secret;
		$params = array('screen_name'=>$parsed_data->screen_name);
		$code = $tmhOAuth->request('GET', $tmhOAuth->url('1/users/show.json'), $params);
		if ($code == 200) {
		    $resp = json_decode($tmhOAuth->response['response']);
			
			$pdata = $resp;
			
			
		
			//$pdata = str_replace('\"','"',$pdata);
			//$pdata = str_replace('\"','"',$pdata);
			$js_object['profile']= array_merge(array('user_data'=>$pdata), array('tokenss'=>$data));
			
			//exit(var_dump($js_object['profile']));
			
		}else{
			$js_object['profile'] = $tmhOAuth->response['response'];
		}
  
		$js_object['params'] = $params;
		$js_object['app_data'] = array(
			'server_location'=>$server_location
		);
	
	
		
		print json_encode(array('status'=>'success', 'response'=>$js_object));
		exit();
?>