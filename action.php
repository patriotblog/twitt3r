<?php

/**
* Tweets a message and all other activities that user whose user token and secret you save.
*
*
* @author patriotblog
*/

include('config.php');


date_default_timezone_set('UTC');
header('Access-Control-Allow-Origin: null', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS', true);

function isAjaxRequest(){
	if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
		return true;
	}	
	return false;
}
$hasToken = false;
if(isset($_GET['token'])){
	$data = $_GET['token'];
	
	$data = str_replace('""',' ',$data);
	
	$data = str_replace('\"','"',$data);
	
	$data = str_replace('\"','"',$data);
        $data = str_replace('\"','"',$data);

	$data = mb_substr($data, 1);
	$data = mb_substr($data, 0, strlen($data)-1);
	
	
	$parsed_data = json_decode($data);
	
	if(isset($parsed_data->screen_name))
		$hasToken = true;
	
}
if($hasToken){}
elseif ( isset($_COOKIE['x_access_token']) ) {
	$data = $_COOKIE['x_access_token'];
	$data = str_replace('\"','"',$data);
	$data = str_replace('\"','"',$data);
	
	$parsed_data = json_decode($data);
}else{	
	header("Location: index.php?authorize=1");
	
		
}

$_user_screen_name = $parsed_data->screen_name;
$tmhOAuth = new tmhOAuth(array(
  'consumer_key'    => $config ['Consumer_key'],
  'consumer_secret' => $config ['Consumer_secret'],
  'user_token' => $parsed_data->oauth_token,
  'user_secret' => $parsed_data->oauth_token_secret,
));


if(isset($_POST['rb']) && !empty($_POST['rb'])){
	$redirect = $_POST['rb'];
}else{
	$redirect =  'timeline';
}
if(isset($_GET['w']) && $_GET['w'] == 'send'){
	
	$params = array(
	  'status' => $_POST['twitt'],
	  'include_entities'=>true,
	  'trim_user'=>true
	);
	
	if(isset($_POST['reply']) && !empty($_POST['reply'])){
		$params['in_reply_to_status_id'] = $_POST['reply'];
	}
	
	$code = $tmhOAuth->request('POST', $tmhOAuth->url('1.1/statuses/update'), $params);


	if ($code == 200) {
		
			$ret = array();
	
			$ret['status'] = 'success';
			$ret['response'] = json_decode($tmhOAuth->response['response']);
		
			print json_encode($ret);
			exit();
		
			
	} else {
		
			$ret = array();
			
			$ret['status'] = 'error';
			$ret['response'] = $tmhOAuth->response['response'];
			
			print json_encode($ret);
			exit();
	}
}elseif(isset($_GET['w']) && $_GET['w'] == 'favorite'){
	if($_POST['cd']!='false'){
		$action = 'destroy.json';
	}else{
		$action = 'create.json';
	}
	$url = $tmhOAuth->url('1.1/favorites/'.$action);
	$code = $tmhOAuth->request('POST', $url, array(
	  'id' => $_POST['id']
	));
	$ret = array();
	if ($code == 200) {
		$ret['status'] = 'success';
		$ret['response'] = $tmhOAuth->response['response'];
	}else{
		$ret['status'] = 'error';
		$ret['response'] = $tmhOAuth->response['response'];
	}
	
	print json_encode($ret);
	exit();
	
}elseif(isset($_GET['w']) && $_GET['w'] == 'retwitt'){
	
	$url = $tmhOAuth->url('1.1/statuses/retweet/'.$_POST['id'].'.json');
	
	$code = $tmhOAuth->request('POST', $url, array(
	  'id' => $_POST['id']
	));
	
	$ret = array();
	if ($code == 200) {
		$ret['status'] = 'success';
		$ret['response'] = $tmhOAuth->response['response'];
	}else{
		$ret['status'] = 'error';
		$ret['response'] = $tmhOAuth->response['response'];
	}
	
	print json_encode($ret);
	exit();
	
}elseif(isset($_GET['w']) && $_GET['w'] == 'list' && (!isset($_GET['mentions']) || empty($_GET['mentions']) || $_GET['mentions']=='mentions' || $_GET['mentions']=='favorites')){
	date_default_timezone_set('UTC');
	$params = array(
	  'include_entities' => '1',
	  'count' => 20,
	  'include_rts'=>1
	);
	if(isset($_GET['page']) && !empty($_GET['page'])){
		if(isset($_GET['last_id']) && !empty($_GET['last_id'])){
			$params['max_id'] = $_GET['last_id'];
		}
		
		
		$tineline_rt = 'statuses/home_timeline';
	}
	
	
	if(isset($_GET['user']) && !empty($_GET['user'])){
		if($_GET['user']=='.me.')
			$_GET['user'] = $_user_screen_name;
			
		$tineline_rt = 'statuses/user_timeline';
		$params['screen_name'] = $_GET['user'];
		$rrt = '&user='.$_GET['user'];
	}elseif(isset($_GET['mentions']) && !empty($_GET['mentions'])){
		if($_GET['mentions']=='mentions'){
			$tineline_rt = 'statuses/mentions_timeline';
			$rrt = '&mentions';
		}elseif($_GET['mentions']=='favorites'){
			$tineline_rt = 'favorites/list';
			$params['screen_name'] = $_user_screen_name;
			$rrt = '&favorites';
		}
	}else{
		$tineline_rt = 'statuses/home_timeline';
		$rrt = '';
	}
	
	$code = $tmhOAuth->request('GET', $tmhOAuth->url('1.1/'.$tineline_rt), $params);
	$ret = array();
	
	$ret['param'] = $params;
	$ret['tineline_rt'] = $tineline_rt;
	
	
	if($code == 200){
		$ret['status'] = 'success';
		$tweets = json_decode($tmhOAuth->response['response'], true);
		$ret_tweets = array();
	
	
		if(isset($_GET['last_id']) && !empty($_GET['last_id'])){
			foreach($tweets as $tweet){
				if($tweet['id_str'] != $_GET['last_id'])
					$ret_tweets[] = $tweet;
			}
		}else{
			$ret_tweets = $tweets;
		}
		$ret['timeline'] = $ret_tweets;
		
		$ncode = $tmhOAuth->request('GET', $tmhOAuth->url('1.1/users/profile_banner.json'), array('screen_name'=>$_GET['user']));
		
		if($ncode == 200){
			$ret['banner']['x'] = json_decode($tmhOAuth->response['response']);
		}else{
			$ret['banner']['y'] = $tmhOAuth->response['response'];
		}
		$ret['api_info_update'] = array(
			'version'=>$config['scripts_version']
		);
	}else{
		$ret['status'] = 'error';
		$ret['response'] = $tmhOAuth->response['response'];
	}
	print json_encode($ret);
	exit();	
}elseif(isset($_GET['w']) && $_GET['w'] == 'list' && (isset($_GET['mentions']) && ! empty($_GET['mentions']))){

	date_default_timezone_set('UTC');
	
	$query = $_GET['mentions'];
	
	$params = array(
	  'q' => str_replace('q_#', '',$_GET['mentions']),
	  'result_type'=>'mixed',
	  'include_entities'=>'true',
	);
	
	
	if(strpos($query, 'q_#')=== false){
		$params['rpp'] = 20;
		if(isset($_GET['page']) && !empty($_GET['page'])){
			$params['page'] = $_GET['page'];
		}
		
		$code = $tmhOAuth->request('GET', 'http://search.twitter.com/search.json', $params);
	}else{
		$code = $tmhOAuth->request('GET', $tmhOAuth->url('1.1/search/tweets.json'), $params);
	}
	$ret = array();
	
	$ret['param'] = $params;
	$ret['api_info_update'] = array(
			'version'=>$config['scripts_version']
		);
	if($code == 200){
		$ret['status'] = 'success';
		$xyz = json_decode($tmhOAuth->response['response'], true);
		$ret['timeline'] = $xyz['statuses'];
		
	}else{
		$ret['status'] = 'error';
		$ret['response'] = $tmhOAuth->response['response'];
	}
	print json_encode($ret);
	exit();	
	
}elseif(isset($_GET['w']) && $_GET['w'] == 'view'){
	date_default_timezone_set('UTC');
	$params = array(
	  'include_entities' => '1',
	  'id'=>$_GET['id'],
	  'include_rts'=>1
	);
	
	
	$condition = true;
	while($condition){
		$code = $tmhOAuth->request('GET', $tmhOAuth->url('1.1/statuses/show.json'), $params);
		$ret = array();
		if($code == 200){
			$ret['status'] = 'success';
			$d = json_decode($tmhOAuth->response['response'], true);
			$ret['timeline'][] = $d;
			if(!isset($d['in_reply_to_user_id_str']) || empty($d['in_reply_to_user_id_str'])){
				$condition = false;
			}
			
		}else{
			$ret['status'] = 'error';
			$ret['response'] = $tmhOAuth->response['response'];
			$condition = false;
		}
		$condition = false;
	}
	print json_encode($ret);
	exit();	
}elseif(isset($_GET['w']) && $_GET['w'] == 'ulist'){
	date_default_timezone_set('UTC');
	$params = array(
		'screen_name ' => $_user_screen_name,
		'cursor'=>-1
	);
	
	
	$rout = $_POST['r'];
	
	$code = $tmhOAuth->request('GET', $tmhOAuth->url('1/'.$rout.'/ids.json'), $params);
	$ret = array();
	if($code == 200){
		$ret['status'] = 'success';
		$d = json_decode($tmhOAuth->response['response'], true);
		
		
		
		$ret['uids'] = $d['ids'];
		$ret['page']  = $page = $_POST['page'];
		$post_id = '';
		$xu = 1;
		$process_ids = array_slice($d['ids'], $page*20, 20);
		foreach($process_ids as $idx){
			
			
				
			
			if($xu==1)
				$sep = '';
			else
				$sep = ',';
				
			$post_id.=$sep.$idx;
			
			$xu ++;
		}
		
		
		$newparams = array(
			'user_id' => $post_id,
			'include_entities'=>false
		);
		
		$newcode = $tmhOAuth->request('POST', $tmhOAuth->url('1/users/lookup.json'), $newparams);
		if($newcode == 200){
			$ret['users'] = json_decode($tmhOAuth->response['response'], true);
		}else{
			$ret['status'] = 'error';
			$ret['response'] = $tmhOAuth->response['response'];
		}

		
	}else{
		$ret['status'] = 'error';
		$ret['response'] = $tmhOAuth->response['response'];
	}

	print json_encode($ret);
	exit();	
}elseif(isset($_GET['w']) && $_GET['w'] == 'uf'){
	date_default_timezone_set('UTC');
	$params = array(
	  'user_id' => $_GET['user_id']
	);
	
	
	$code = $tmhOAuth->request('POST', $tmhOAuth->url('1.1/friendships/destroy/'.$_GET['user_id'].'.json'), $params);
	$ret = array();
	if($code == 200){
		$ret['status'] = 'success';
		$ret['response'] = json_decode($tmhOAuth->response['response'], true);
		
	}else{
		$ret['status'] = 'error';
		$ret['response'] = $tmhOAuth->response['response'];
	}
	print json_encode($ret);
	exit();	
}elseif(isset($_GET['w']) && $_GET['w'] == 'df'){
	date_default_timezone_set('UTC');
	$params = array(
	  'user_id' => $_GET['user_id']
	);
	
	
	$code = $tmhOAuth->request('POST', $tmhOAuth->url('1.1/friendships/create.json'), $params);
	$ret = array();
	if($code == 200){
		$ret['status'] = 'success';
		$ret['response'] = json_decode($tmhOAuth->response['response'], true);
		
	}else{
		$ret['status'] = 'error';
		$ret['response'] = $tmhOAuth->response['response'];
	}
	print json_encode($ret);
	exit();	
}elseif(isset($_GET['w']) && $_GET['w'] == 'friendships'){
	date_default_timezone_set('UTC');
	$params = array(
	  'screen_name' => $_POST['screen_name']
	);
	
	
	$code = $tmhOAuth->request('GET', $tmhOAuth->url('1.1/friendships/lookup.json'), $params);
	$ret = array();
	if($code == 200){
		$ret['status'] = 'success';
		$ret['response'] = json_decode($tmhOAuth->response['response']);
		
	}else{
		$ret['status'] = 'error';
		$ret['response'] = $tmhOAuth->response['response'];
	}
	print json_encode($ret);
	exit();	
}else{
	header("Location: ".$redirect.".php?send=empty_action");
}
?>