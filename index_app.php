<?php
include('config.php');

$tmhOAuth = new tmhOAuth(array(
  'consumer_key'    => $config ['Consumer_key'],
  'consumer_secret' => $config ['Consumer_secret'],
));

$here = tmhUtilities::php_self();
$isGuest = true;

session_start();

function outputError($tmhOAuth) {
	
	if(isset($tmhOAuth->response['response'])){
		$reponse_error = json_decode($tmhOAuth->response['response']);
		echo '<title>Twitt3r - '.$reponse_error->error.'</title>';
		echo '<h1>Error:'.$reponse_error->error.'</h1>';
	}else{
		header("Location: login.html");
	}

}

if ( isset($_REQUEST['wipe'])) {
  session_destroy();
  setcookie ($config['access_token'], 'x', time()-60*60*24*30 );
  header("Location: {$here}");
} elseif (isset($_REQUEST['oauth_verifier'])) {
  $tmhOAuth->config['user_token']  = $_SESSION['oauth']['oauth_token'];
  $tmhOAuth->config['user_secret'] = $_SESSION['oauth']['oauth_token_secret'];
  $code = $tmhOAuth->request('POST', $tmhOAuth->url('oauth/access_token', ''), array(
    'oauth_verifier' => $_REQUEST['oauth_verifier']
  ));
  
  if ($code == 200) {

    $_SESSION[$config['access_token']] = $tmhOAuth->extract_params($tmhOAuth->response['response']);
	$token = $_SESSION[$config['access_token']];
	unset($_COOKIE[$config['access_token']]);
	
	?><script type="text/javascript">setTimeout(function(){window.opener.postMessage('<?php echo json_encode(array('type'=>'token', 'value'=>$token));?>', '*');},1000);</script><?php
	
	exit();
  } else {
    outputError($tmhOAuth);
  }
} elseif ( isset($_REQUEST['authenticate']) || isset($_REQUEST['authorize']) ) {
  $callback = isset($_REQUEST['oob']) ? 'oob' : $here;

  $params = array(
    'oauth_callback'     => $callback
  );

  if (isset($_REQUEST['force_write'])) {
    $params['x_auth_access_type'] = 'write';
  }elseif (isset($_REQUEST['force_read'])) {
    $params['x_auth_access_type'] = 'read';
  }

  $code = $tmhOAuth->request('POST', $tmhOAuth->url('oauth/request_token', ''), $params);
	
  if ($code == 200) {
    $_SESSION['oauth'] = $tmhOAuth->extract_params($tmhOAuth->response['response']);
    $method = isset($_REQUEST['authenticate']) ? 'authenticate' : 'authorize';
    $force  = isset($_REQUEST['force']) ? '&force_login=1' : '';
    $authurl = $tmhOAuth->url("oauth/{$method}", '') .  "?oauth_token={$_SESSION['oauth']['oauth_token']}{$force}";
	
	header("Location: ".$authurl);
  } else {
    outputError($tmhOAuth);
  }
}
if($isGuest):?>
<ul class="index_menu">
	<li><button id="AuthorizeBtn"   href="index.html" class="btn btn-success" type="button">Authorize Application With Twitter</button></li>
</ul>
<?php endif;
if(!$isGuest):
?>
<ul class="index_menu a_menu">
	<?php
		$profile_image = getTwitterProfileImage($_COOKIE[$config['cookie_screen_name']]);
		
	?>
	<li class="user_avatar"><img src="<?php echo $profile_image;?>"></li>
	<li><a class="btn" href="timeline.php">timeline</a></li>
	<li><a class="btn" href="home.php?_toch_view">ajax timeline for html5</a></li>
	<li class="remove_cookie"><a class="" href="?wipe=1">Start Over and delete stored tokens</a></li>
</ul>
<?php endif;?>
  <?php 
  	function getTwitterProfileImage($username) {
		$size = '_bigger';
		$api_call = 'https://api.twitter.com/1.1/users/show.json?screen_name='.$username;
		$results = json_decode(file_get_contents($api_call));
		return str_replace('_normal', $size, $results->profile_image_url);
	}
  ?>
  <style>
	.body{background:url("assets/images/_twitter_bg.png") no-repeat scroll center -105px transparent;}
  </style>