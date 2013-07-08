<?php
header('Access-Control-Allow-Origin: null', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS', true);

	if(isset($_GET['src']) && !empty($_GET['src'])){
		$url = base64_decode($_GET['src']);
		$x = parse_url($url);
		$isTwimg = (strpos($x['host'], 'wimg.com'));
		$isTwitt3r = (strpos($x['host'], 'witt3r.ir'));
		$isTwitter = (strpos($x['host'], 'witter.com'));
		if(isset($x['host']) && ($isTwimg|| $isTwitt3r || $isTwitter)){
			if(isset($_GET['format']) && $_GET['format']=='b'){
				$av = get_avatar_file($url, false);
				echo base64_encode($av);
				
			}elseif(isset($_GET['format']) && $_GET['format']=='r'){
				$username = str_replace('p=','',$x['query']);
				$u =  getTwitterProfileImage($username);
				header('Content-Type: image/jpeg');
				get_avatar_file($u);
			}else{
				header('Content-Type: image/jpeg');
				get_avatar_file($url);
			}			
		}
	}
	function get_avatar_file($src, $echo=true){
		$md5_file = md5($src);
		
		$local_addr = 'avatars/'.$md5_file;
		if(file_exists($local_addr)){
			if($echo) 
				echo file_get_contents($local_addr);
			else 
				return file_get_contents($local_addr);
			return;
		}
		$x = get_url($src);
		file_put_contents($local_addr, $x);
		if($echo)
			echo $x;
		else
			return $x;
		return;
	}
	
	function get_url($url) {
		$ch = curl_init();
		curl_setopt($ch,CURLOPT_URL,$url);
		curl_setopt($ch,CURLOPT_RETURNTRANSFER,1); 
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,5);
		$content = curl_exec($ch);
		curl_close($ch);
		return $content;
	}
	
	function getTwitterProfileImage($username) {
		$size = '_bigger';
		$api_call = 'https://api.twitter.com/1/users/show.json?screen_name='.$username;
		$results = json_decode(file_get_contents($api_call));
		return str_replace('_normal', $size, $results->profile_image_url);
	}
?>