<?php
include('config.php');
date_default_timezone_set('UTC');
function isAjaxRequest(){
	if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
		return true;
	}	
	return false;
}

header('Access-Control-Allow-Origin: null', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS', true);

$hasToken = false;
if(isset($_POST['token'])){
	$data = $_POST['token'];
	$data = str_replace('\"','"',$data);
	$data = str_replace('\"','"',$data);

	$parsed_data = json_decode($data);

	if(isset($parsed_data->screen_name)){
		$hasToken = true;
	}
}
if($hasToken){

}
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

$version = $config['scripts_version'];
$server_location = $config['script_location'];
$js_list = array(
	urlencode($server_location.'assets.php?src=json2.js'),
	urlencode($server_location.'assets.php?src=underscore-min.js'),
	urlencode($server_location.'assets.php?src=backbone-min.js'),
	urlencode($server_location.'assets.php?src=entities.js&v=1.0.5'),
	urlencode($server_location.'assets.php?src=jquery.base64.min.js'),
	urlencode($server_location.'assets.php?src=scripts.js&v='.$version),
	urlencode($server_location.'assets.php?src=bb_scripts.js&v='.$version),
	urlencode($server_location.'assets.php?src=style_scripts.js&v='.$version),
	urlencode($server_location.'assets.php?src=jquery.appear.2.0.js'),
);
$js_object = array();
foreach($js_list as $js){
	$js_object['scripts'][] = array(
		'url'=>$js,
		'md5'=>md5($js)
	);	
}
$params = array('screen_name'=>$parsed_data->screen_name);
$code = $tmhOAuth->request('GET', $tmhOAuth->url('1.1/users/show.json'), $params);
if ($code == 200) {
	$resp = json_decode($tmhOAuth->response['response']);
	
	$pdata = $resp;
	
	$js_object['profile']= array_merge(array('user_data'=>$pdata), array('tokenss'=>$data));
	
}else{
	$js_object['profile'] = $tmhOAuth->response['response'];
}

$js_object['params'] = $params;
$js_object['app_data'] = array(
	'server_location'=>$server_location,
);

$js_object['api_version']  = $config['scripts_version'];

print json_encode(array('status'=>'success', 'response'=>$js_object));
exit();
?>