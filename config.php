<?php
	$config = array(
		'Consumer_key'=>'', //put your consumer key here. go to here https://dev.twitter.com/apps
		'Consumer_secret'=>'', //put your consumer secret here
		'cookie_screen_name'=>'screen_name',
		'cookie_user_profile'=>'user_profile',
		'access_token'=>'x_access_token',
		'call_back'=>'call_back',
		'scripts_version'=>'1.0.2.16'
	);
	

session_start(); 

// Extend cookie life time by an amount of your liking
$cookieLifetime = 365 * 24 * 60 * 60; // A year in seconds
setcookie(session_name(),session_id(),time()+$cookieLifetime);

require 'tmhOAuth/tmhOAuth.php';
require 'tmhOAuth/tmhUtilities.php';


if(isset($_GET['_toch_view'])){
	$isHTML5 = true;
}else{
	$isHTML5 = false;
}
$isDevelope = true;

function my_log($cat, $level, $stringData){
	$myFile = "log.txt";
	$fh = fopen($myFile, 'a') or die("can't open file");
	
	fwrite($fh, time()."\t[$cat]\t[$level]\t$stringData
");
	
	fclose($fh);
}
function parseMentions($string, $delimiter_s='@'){
	$string = $string.' ';	
	$string = preg_replace_callback(
				'/(?:(?<=\s)|^)(@\S+)/i', 
				create_function(
					'$matches', 
					'return "<a href=?user=".substr($matches[0],1).">".$matches[0]."</a>";'
				) , $string);
				
				
	return $string;
}
function parseURLs($string, $delimiter_s='http://'){
		$string = $string.' ';
		
		$pos_s = mb_strpos($string, $delimiter_s);
		
		if($pos_s === FALSE){
			$pos_s = mb_strpos($string, 'https://');
			if($pos_s === FALSE)
				return $string;
		}
		
		if($pos_s+mb_strlen($delimiter_s)>mb_strlen($string))
			return $string;
		
		$pos_e_space_r = mb_strpos($string, "\r", $pos_s+mb_strlen($delimiter_s));
		$pos_e_space_s = mb_strpos($string, " ", $pos_s+mb_strlen($delimiter_s));
		
		if($pos_e_space_r === FALSE)
			$pos_e_space = $pos_e_space_s;
		else
			$pos_e_space = min($pos_e_space_r,$pos_e_space_s);
		
		
		if($pos_e_space === FALSE){
			return $string;
		}
		
		$first = mb_substr($string, 0, $pos_s);
	
		$tmp_param = mb_substr($string, $pos_s, $pos_e_space-($pos_s));
		$tmp_name = mb_substr($string, $pos_s+mb_strlen($delimiter_s), $pos_e_space-($pos_s+mb_strlen($delimiter_s)));

		str_replace('\r','',$tmp_param);
		str_replace('\n','',$tmp_name);
		$transformed = '<a href="'.$tmp_param.'">'.$tmp_name.'</a>';
		$remaind = mb_substr($string, $pos_e_space);
		return $first.$transformed.'&nbsp;'.parseURLs($remaind, $delimiter_s);
 	}
?>