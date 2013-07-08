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

if(isset($_GET['src']) && !empty($_GET['src'])){
	$src = $_GET['src'];
	$local_addr = 'assets/'.$src;
	if(file_exists($local_addr)){
		header('Content-Type: text/javascript');
		echo file_get_contents($local_addr);
	}else{
		echo 'not fond';
	}
}