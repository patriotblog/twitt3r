var app;
var is_under_dev = false;
var app_init_data;
var app_location_address;
function inits() {
(function($) {
	var Twitt = Backbone.Model.extend({
		defaults: {
			id:'',
			user: '',
			favorited:'',
			text:'',
			source:'',
			created_at:'',
			retweeted_status:'',
			entities:'',
			lang:''
		},
		initialize: function(data){
			_.bindAll(this, 'createModel'); // every function that uses 'this' as the current object should be in here
			this.createModel(data);
		},
		createModel:function(data){
			//console.log(data);
			this.set(
				{'id': data.id_str},
				{'user': data.user},
				{'favorited': data.favorited},
				{'text': data.text},
				{'source': data.source},
				{'created_at': data.created_at},
				{'entities':data.entities},
				{'in_reply_to_status_id_str':data.in_reply_to_status_id_str},
				{'retweeted_status': data.retweeted},
				{'lang': data.lang}
			);
			
		}
	});  
	var TwittList = Backbone.Collection.extend({
    	model: Twitt,
		page:1,
		user:null,
		mentions:null,
		last_id:null
	});
	
	var TwittView = Backbone.View.extend({
		tagName: 'li', // name of (orphan) root tag in this.el
		className:'twitt',
		//attributes:'#test=test',
		initialize: function(){        
			_.bindAll(this, 'render', 'formatText'); // every function that uses 'this' as the current object should be in here
			
		},
		render: function(){
			
			$(this.el).attr('id', this.model.get('id'));
			t_view = _.template("<div class='status'></div><div class='user_profile_avatar'><a class='user_profile' data-user='<%= screen_name %>' href='?user=<%= screen_name %>'><img data-user='<%= screen_name %>' data-src='<%= avatar_url %>'></a></div><ul class='header'><li class='user'><a class='user_profile' data-user='<%= screen_name %>' href='?user=<%= screen_name %>'><b data-user='<%= screen_name %>'><%= name %></b> @<%= screen_name %></a></li><li><a href='' class='user_profile rt_real_user' data-user='<%= read_user_screen_name %>'><%= real_user %></a></li></ul><div class='small'><a href='<%= permalink %>' data-id='<%= id %>' class='permalink'><%= minutes_ago %></a><span>via <%= source_device %></span></div><p><%= text %></p><%= embed_img %><ul class='footer header'><li data-id='<%= id %>' class='fav <%= faved_status %>'><a href='#'></a></li><li data-id='<%= id %>' data-users='<%= reply_to_users %>' class='rep'><a data-users='<%= reply_to_users %>' href='#'></a></li><li data-id='<%= id %>' class='rt <%= retweet_status %>'><a href='#'></a></li><li data-id='<%= id %>'   class='more '><a data-id='<%= id %>'  class='permalink' href='#'></a></li></ul>");
			permalink_view = _.template("https://twitter.com/<%= screen_name %>/status/<%= id %>");
			
			if(this.model.get('favorited')){
                isFaved = 'faved';
		    }else{
                isFaved = '';
		    }
			
			if(this.model.get('retweeted_status')){
                
                var user_rt = this.model.get('retweeted_status').user;
               // console.log($('.myusername').val());
                //console.log(this.model.get('retweeted_status'));
                if(this.model.get('user').screen_name==$('.myusername').val())
                    isTR = 'rtt';
                else
                    isTR = '';
                real_user = 'RT by '+this.model.get('user').screen_name+'('+this.model.get('user').name+')';
                read_user_screen_name = this.model.get('user').screen_name;
		    }else{
                isTR = '';
                var user_rt = this.model.get('user');
                real_user = '';
                read_user_screen_name = '';
		    }
			isToMe = '';
			x = this;
			reply_to_users = [this.model.get('user').screen_name];
			$(this.model.get('entities').user_mentions).each(function() {
				reply_to_users.push(this.screen_name);
                if(this.screen_name== $(".myusername").val()){
					isToMe = 'tome';
					return;
				}
            });
			
			
			$(this.el).addClass(isFaved);
			$(this.el).addClass('lang_'+this.model.get('lang'));
			$(this.el).addClass(isTR);
			$(this.el).addClass(isToMe);
			$(this.el).data('id', this.model.get('id'));
			
			
			xyz = new Date().getTimezoneOffset();
			xyz = xyz*60;
			//xyz = 0;
			created_at = new Date(this.model.get('created_at')).getTime()+xyz;
			//created_at_local = new Date(created_at).getTime();
			now_date = new Date().getTime();
			
			
			
			//console.log(created_at);
			minutes_ago = '';
			
			d = (now_date-created_at)/1000;
			
			//console.log(xyz);
			
			if(d<60){
			     minutes_ago =  Math.floor(d)+'s';
			}else if(d>60 && d<3600){
			     minutes_ago = Math.floor(d/60)+'m'
			}else if(d>3600 && d<86400){
			     minutes_ago = Math.floor(d/1440)+'h'
			}else if(d>86400){
			          minutes_ago = Math.floor(d/86400)+'d'
			}
			
			embed_img = '<div class="media_cari">';
			ent = this.model.get('entities');
			//self = this;
			if(ent.media && global_settings_obj.showimage){
				$(ent.media).each(function(index, element) {
				    //self.app.username!='sharh'
					if(false){
						media_url = this.media_url;	
					}
					else{
						media_url = app_location_address+'avatar.php?src='+$.base64.encode(this.media_url);
					}
                    embed_img += '<img src="'+media_url+'">';
                });	
			}
			embed_img += '</div>';			
			$(this.el).html(t_view({
				id :this.model.get('id'),
				screen_name:user_rt.screen_name,
				name:user_rt.name,
				source_device:this.model.get('source'),
				minutes_ago:minutes_ago,
				permalink:permalink_view({
					screen_name:user_rt.screen_name,
					id :this.model.get('id')
				}),
				text:this.formatText(this.model.get('entities'), this.model.get('text')),
				faved_status:isFaved,
				retweet_status:isTR,
				avatar_url:user_rt.profile_image_url,
				//avatar_url:'avatar.php?src='+$.base64.encode(user_rt.profile_image_url),
				//avatar_url:self.app.showImage(user_rt.profile_image_url),
				reply_to_users:reply_to_users,
				real_user:real_user,
				read_user_screen_name:read_user_screen_name,
				embed_img:embed_img
				//text:twttr.txt.extractMentions(this.model.get('text'))
			}));
			
			//console.log(this);
			return this; // for chainable calls, like .render().el
		},
		formatText:function(entities, text){
			//console.log(text);
			string =  linkify_entities(entities, text);
			return string;
		}
	});

	var ListView = Backbone.View.extend({
		el: $('.twitts'), // el attaches to existing element
		app:{},
		isNewList:true,
		imageList:{},
		currentUserBaneer:{},
		events: {
			//'click button#add': 'addItem'
			'click a#reload': 'reload',
			'click a#next': 'paginationNext',
			'click a#prev': 'paginationPrev',
			'click a#homeView': 'homeView',
			'click a#mentions': 'mentions',
			'click a.newTwitt': 'newTwitt',
			//'click a.ping': 'newTwitt',
			'click a.back': 'goBackward',
			'click a.permalink': 'showTwitt',
			'click .menux a':'showMenu',
			'click #sidebar_favorites_cnt a':'showFavorites',
			'click a.user_profile':'profileView',
			'click a.search_link':'showSearchResult',
			'click #sidebar_my_tweet_cnt a':'profileView'
		},
		initialize: function(page, user, mentions, y, z){
			_.bindAll(
				this, 
				'fetch', 
				'appendItem', 
				'reload', 
				'paginationNext', 
				'paginationPrev', 
				'profileView', 
				'homeView', 
				'mentions', 
				'newTwitt', 
				'prependItem',
				'goBackward',
				'setHistory',
				'renderFinished',
				'renderStarted',
				'appLoad',
				'loadModel',
				'twittView',
				'showTwitt',
				'relatedTwitt',
				'showMenu',
				'showFavorites',
				'insePageTitle',
				'showImage',
				'insImageInto',
				'showSearchResult'
			); // every function that uses 'this' as the current object should be in here
			//this.counter = 0;
			//$(".twitt_list").remove();
			//$(".twitt_list").remove();
			
			//this.app = app;
			
			if(arguments[3])
				this.isNewList =arguments[3];
			else
				this.isNewList = true;
				
			
			//this.app = app;
				
			
			
			$(this.el).children('.twitt_list').css('opacity',.1);
			
			this.collection = new TwittList();
			
			
			this.collection.bind('add', this.appendItem); // collection event binder
			this.collection.page = page;
			if(user)this.collection.user = user;
			if(mentions)this.collection.mentions = mentions;
			//this.collection.last_id=
			
			
			//this.appLoad();
			//this.fetch();
			//this.fetch();
			//console.log(app.history);
			if(typeof(this.app.history)=='object'){
			//if(typeof(app.history)=='object'){
				this.fetch();
			}else{
				this.appLoad();
			}
			
			
			
			//this.appLoad();
			//this.fetch();
			//this.render();
		},
		appLoad:function(){
			
			self = this;
			
			need_to_fetch = false;
			//console.log(self);
			if(typeof(Storage)!=="undefined"){
				old_data = localStorage.getItem("TwittCollection");
				//console.log('d');
				if(old_data){
					self.renderStarted(true);
					$(".twitt_list").remove();
					
					show_back_btn = '';
					
					$(self.el).html('<ul class="navi"><li class="menux"><a href="#"></a><li class="title"></li><li class="search_btn"><a class="search" ></a></li><li class="back_btn"><a class="back '+show_back_btn+'" href="#"></a></li></li></ul><div class="actions grad"><a id="reload"></a><a id="homeView"><span class="logo icon"></span>Home</a><a id="ping" class="logo"><span class="icon"></span></a><a class="user_profile" data-user=".me."><span data-user=".me." class="icon"></span>Me</a><a id="mentions"><span class="icon"></span>Connect</a></div><div id="pullDown" class=""><span class="pullDownIcon"></span><span class="pullDownLabel">Pull down to refresh...</span></div><ul id="twitt_list" class="twitt_list"></ul><div id="pullUp"><span class="pullUpIcon"></span><span class="pullUpLabel">Pull up to refresh...</span></div><div class="pager"><a href="#" id="next">next</a><a id="prev">prev</a></div><a data-h="5" class="newTwitt"></a>');
					//console.log('ddd');
					old_object = JSON.parse(old_data);
					cnt = 0;
					//console.log(old_object);
					$(old_object.timeline).each(function(){
						if(cnt>20)
							return;
						cnt++;
						t = new Twitt(this);
						//alert('salam mahdi');
						
						if(self.collection)
							self.collection.add(t);
						
						//alert('salam mahdi');
					});
					if(old_object.conc){
    					//self.collection.page = old_object.conc.page;
						//self.collection.user = old_object.conc.user;
    					//self.collection.mentions = old_object.conc.mentions;
                    }					
					self.renderFinished();
				}else{
					need_to_fetch = true;
				}
			  
			}
			else{
			//console.log('b');
			  need_to_fetch = true;
			}
			if(need_to_fetch){
				
				this.fetch();
			}else{
				scrolling();
			}
			//console.log(need_to_fetch);
		},
		fetch:function(){
		   //console.log('fetch');
		    self=this;
			
			
			
			$.ajax({
				url:app_location_address+'action.php?token='+JSON.stringify(my_tokens)+'&w=list',
				data:{
					page:self.collection.page,
					user:self.collection.user,
					mentions:self.collection.mentions,
					last_id:self.collection.last_id
				},
				type:"GET",
				beforeSend: function(a){
					//console.log(app_location_address+'action.php?token='+JSON.stringify(my_tokens)+'&w=list');
					self.renderStarted();
				},
				success: function(a){
					//console.log(a);
					if(self.isNewList) {
						$(".twitt_list").remove();
					}
						
					if(self.app.history.length>1)
						show_back_btn ='show';
					else
						show_back_btn = '';
					
					if(self.isNewList) {	
						$(self.el).html('<ul class="navi"><li class="menux"><a href="#"></a><li class="title"></li><li class="search_btn"><a class="search" ></a></li><li class="back_btn"><a class="back '+show_back_btn+'" href="#"></a></li></li></ul><div class="actions grad"><a id="reload"></a><a id="homeView"><span class="logo icon"></span>Home</a><a id="ping" class="logo"><span class="icon"></span></a><a class="user_profile" data-user=".me."><span data-user=".me." class="icon"></span>Me</a><a id="mentions"><span class="icon"></span>Connect</a></div><div id="pullDown" class=""><span class="pullDownIcon"></span><span class="pullDownLabel">Pull down to refresh...</span></div><ul id="twitt_list" class="twitt_list"></ul><div id="pullUp"><span class="pullUpIcon"></span><span class="pullUpLabel">Pull up to refresh...</span></div><div class="pager"><a href="#" id="next">next</a><a id="prev">prev</a></div><a data-h="5" class="newTwitt"></a>');
					}

					obj = $.parseJSON(a);
					//console.log('obj:');
					//console.log(obj);
					if(obj.status=='success'){
						setApiSettings(obj.api_info_update);
						if(obj.timeline.results){
							$(obj.timeline.results).each(function(index) {
								t = new Twitt(this);
								t.set({
									'user':{id:this.from_user_id, name:this.from_user, profile_image_url:this.profile_image_url, screen_name:this.from_user}
								});
								self.collection.add(t);
							});
							//console.log('search');
						}else{
							$(obj.timeline).each(function(index) {
								t = new Twitt(this);
								self.collection.add(t);
							});
							//console.log('fetch');
						}
						
						//if(self.collection.page==1 && self.collection.user==null && self.collection.mentions ==null){
							localStorage.setItem("TwittCollection", JSON.stringify({
								timeline:self.collection,
								conc:{
								    user:self.collection.user,
								    page:self.collection.page,
								    mentions:self.collection.mentions
								}
							}));
						//}
						
						if(obj.banner){
							//console.log(obj.banner);
							if(obj.banner.x){
								self.currentUserBaneer = obj.banner.x;
							}
						}
						
						//$(btn).toggleClass('faved');
					}else{
						errorObj = $.parseJSON(obj.response);
						
						if(typeof(errorObj.errors)=='object'){
							$(errorObj.errors).each(function(){
								setFlashNew(this.message, 'error');
							});
							
						}else{
							setFlashNew(errorObj.errors, 'error');
						}
					}
					//console.log('fetch fineshed');
					
				},
				complete: function(a){
					//$(btn).show();
					//console.log(a.responseText);
					self.renderFinished();
				},
				error: function(a){
					//console.log(a);
					//$(btn).show();
				}
			});
		},
		renderFinished:function(){
			self = this;
			//console.log('finished');
			this.insePageTitle();
			$(".actions.grad .w8").remove();
			$(this.el).children('.twitt_list').css('opacity',1);
			$('body').removeClass('body');
			$(".twitts").removeClass('twitts_wait');
			if(this.isNewList) {
				$("html, body").animate({ scrollTop: 0 }, "fast");
			}else{
				
			}
			if(this.collection.user){
    			var user_profile_view =  _.template("<li id='<%= id %>' data-id='<%= id %>' class='user li_<%= myProfile %>'><div data-src='<%= bg %>' class='bg'></div><div class='user'><a data-user='<%= screen_name %>' class='avatar' href=''><img data-user='<%= screen_name %>' src='<%= avatar %>'></a><div class='name'><a data-user='<%= screen_name %>' class='screen_name' href=''><%= screen_name %></a><a data-user='<%= screen_name %>' class='_name' href=''><%= name %></a><div class='description'><%= description %></div></div></div><ul class='uactions <%= myProfile %>'><li onClick='follow_actions(this)' id='df_<%= id %>' data-what='df' data-id='<%= id %>' class='btn btn-success follow <%= isFollowing %>'>follow</li><li onClick='follow_actions(this)'  id='nf_<%= id %>'  data-what='uf' data-id='<%= id %>' class='btn btn-danger  unfollow <%= isFollowing %>'>unfollow</li></ul><div class='fix'></div></li>");
    			user_model = this.collection.at(0).get('user');
    			
    			if(user_model.screen_name == this.app.myuserprofile.screen_name){
    			     var myProfile = 'myProfile';
			    }else{
			         var myProfile = '';
			    }
			         
    			//console.log(self.currentUserBaneer);
				if(self.currentUserBaneer){
					//console.log('test');
					try{
						bg_image = self.currentUserBaneer.sizes.mobile.url;
					}catch(err){
						//console.log('error');
						bg_image = '';
					}
				}else{
					bg_image = '';
				}
				console.log(bg_image);
    			$("#twitt_list").prepend(user_profile_view({
    			     id :user_model.id_str,
    				screen_name:user_model.screen_name,
    				avatar:app_location_address+'avatar.php?src='+$.base64.encode(user_model.profile_image_url),
    				name:user_model.screen_name,
    				description:user_model.description,
    				isFollowing:user_model.following,
    				myProfile:myProfile,
    				//bg:'avatar.php?src='+$.base64.encode(self.currentUserBaneer.sizes.mobile.url),
    				bg:bg_image
    			}));
    			this.friendships(user_model.screen_name);
			}
			
			 getImageSrcs();
            //var imgSrcArray = new Array();
            $(imgSrcArray).each(function(){
                //console.log('images');
				//console.log(this);
                self.showImage(this.src, this.obj, this.type);
            });
			//console.log(this.collection.length);
			$("#next").css('opacity',1);
			$("#next").css('height','');
			$("#next").removeClass('twitts_wait');
			apear_count = 0;
			$(this.collection.models).each(function(index, element) {
				this.collection.last_id = element.id;
            });
			//console.log('last_id:'+this.collection.last_id);
		},
		renderStarted:function(x){
			//$(this.el).children('.actions').prepend('<div class="w8">&nbsp;</div>');
			$("#twitt_list>.user").remove();
			if(x==true){
			}
			else{
				$(".twitts").addClass('twitts_wait');
			}
			$(".user_list li").remove();
			$("#users .nextPage").hide();
			
			//$('body').addClass('body');
		},
		paginationNext:function(){
			//this.initialize(this.collection.page+1, this.collection.user, this.collection.mentions);
			this.renderStarted();
			this.collection.page = this.collection.page+1;
			this.isNewList = false;
			$("#next").css('opacity',0.2);
			//$("#next").css('marginBottom','55px');
			$("#next").css('height','75px');
			$("#next").addClass('twitts_wait');
			//last  = $("#twitt_list li").last();
			//console.log('-----------');
			//console.log($(last).attr('id'));
			//x = $(last).offset().top;
			//console.log(x);
			//$("html, body").animate({ scrollTop: x }, "fast");
			//console.log('-----------');
			this.fetch();
			
			this.setHistory({page:this.collection.page+1, user:this.collection.user, mentions:this.collection.mentions});
			return false;
		},
		paginationPrev:function(){
			if(this.collection.page-1>0)
				id =this.collection.page-1;
			else
				id = 1;
			this.initialize(id, this.collection.user, this.collection.mentions);
			
			this.setHistory({page:id, user:this.collection.user, mentions:this.collection.mentions});
			return false;
		},
		reload:function(){
			this.isNewList = true;
			this.initialize(this.collection.page, this.collection.user, this.collection.mentions);
			
			return false;
		},
		profileView:function(x){
			this.isNewList = true;
			user = $(x.target).attr('data-user');
			this.initialize(1, user, null);
			
			
			
			this.setHistory({page:1, user:user, mentions:null});
			return false;
		},
		showSearchResult:function(x){
			q = $(x.target).attr('data-search');
			//console.log(q);
			this.initialize(1, null, 'q_'+q);
			this.setHistory({page:1, user:null, mentions:'q_'+q});
			return false;
		},
		homeView:function(){
			this.isNewList = true;
            this.initialize(1, null, null);
			
			this.setHistory({page:1, user:null, mentions:null});
	        return false;
	    },
	    mentions:function(){
			this.isNewList = true;
	       this.initialize(1, null, 'mentions');
		   
		   this.setHistory({page:1, user:null, mentions:'mentions'});
	    },
		loadModel:function(id){
		      found = null;
			$(this.collection.models).each(function(index, element) {
                if(element.id==id){
                    found = element;
					return element;
				}
            });
			return found;
		},
		twittView:function(item){
			this.isNewList = true;
			var self = this;
			var twittview = new TwittView({
				model: item
			});
			//$('ul.twitt_list', this.el).html(twittview.render().el);
			
			$('ul.twitt_list', this.el).children('li').remove();
			
			
			this.collection = new TwittList();
            this.collection.add(item);
			
			
			x = this.setHistory({page:1, user:'.view.', mentions:null});
			
			$(this.el).children('.pager').hide();
			$('.back').addClass('show');
			
			localStorage.setItem("TwittCollection", JSON.stringify({
				timeline:self.collection
			}));
			
			$("li.twitt#"+twittview.model.get('id')).children('.footer').show();				
							
			//self.appendItem(t);
			rid  = twittview.model.get('in_reply_to_status_id_str');
			
			if(rid){
				this.relatedTwitt(rid);
				$("li.twitt#"+twittview.model.get('id')).addClass('isInRply');
			}
		},
		insePageTitle:function(){
			title = 'Twitt3r';
			
			if(this.collection.user)
			     title = this.collection.user;
			     
            if(this.collection.mentions)
			     title = this.collection.mentions.replace('q_#','Search:');	
			     
			$(".twitts .actions .active").removeClass('active');
			
			//console.log(this.collection.user);
			
			if(this.collection.user=='.me.'){
				$(".twitts .actions .user_profile").addClass('active');
			}
			else if(this.collection.mentions=='mentions'){
				$(".twitts .actions #mentions").addClass('active');
			}
			else{
				$(".twitts .actions #homeView").addClass('active');	
			}
			//console.log(this.collection.mentions);
			
			     
			$('ul.navi .title').html(title);	
		},
		showTwitt:function(x){
			
			id = $(x.target).data('id');
			if(id){
			     
			}else{
    			 id = $(x.target).parents('.twitt').data('id');
			}
			
			item = this.loadModel(id);	
			if(item)
				this.twittView(item);
			else
				console.log('nabood');
				
			this.renderFinished();
			return false;
		},
		relatedTwitt:function(id){
		  self = this;
            items = $.ajax({
                url:app_location_address+'action.php?token='+JSON.stringify(my_tokens)+'&w=view',
                data:{id:id},
                success:function(a){
                    obj = $.parseJSON(a);
					if(obj.status=='success'){
						$(obj.timeline).each(function(index) {
						      //console.log(index);
                            t = new Twitt(this);
                            self.collection.add(t);
                            self.prependItem(t);
							
                        });
                        //console.log(this.collection);
						//if(self.collection.page==1 && self.collection.user==null && self.collection.mentions ==null){
							localStorage.setItem("TwittCollection", JSON.stringify({
								timeline:self.collection
							}));
						//}
						//$(btn).toggleClass('faved');
					}else{
						errorObj = $.parseJSON(obj.response);
						
						if(typeof(errorObj.errors)=='object'){
							$(errorObj.errors).each(function(){
								setFlashNew(this.message, 'error');
							});
							
						}else{
							setFlashNew(errorObj.errors, 'error');
						}
					}
                }
            }); 
		},
		goBackward:function(){
			this.app.history.splice(this.app.history.length-1,1);
			
				
				
			newLoc = _.last(this.app.history);
			if(typeof(newLoc)=='object'){
				if(newLoc.user=='.view.')
					newLoc.user = null;
				this.initialize(newLoc.page, newLoc.user, newLoc.mentions);
				$("html, body").animate({ scrollTop: 0 }, "fast");
				
			}
			else{
				//console.log('last page');
				//$(".twitts ul.navi li a.back").hide();
			}
			
		},
		setHistory:function(obj){
			if(obj.page ==1 &&
				obj.user == null &&
				obj.mentions == null
			){
				this.app.history = [obj]
			}else{
				this.app.history.push(obj);
			}
		},
		newTwitt:function(x){
			if(this.collection.user){}
			else{
				data = $(x.target).data('model');
				data.user.screen_name = this.app.username;
				data.user.name = this.app.username;
				data.user.profile_image_url = this.app.myuserprofile.profile_image_url;
				t = new Twitt(data);
				
				this.prependItem(t);
			}
		},
		appendItem:function(item, opt){
			var twittview = new TwittView({
				model: item
			});
			$('ul.twitt_list', this.el).append(twittview.render().el);
			
		},
		prependItem:function(item){
			var twittview = new TwittView({
				model: item
			});
			$('ul.twitt_list', this.el).prepend(twittview.render().el);
		},
		showMenu:function(){
			
			this.app.renderSidebar();
		},
		showFavorites:function(){
			this.isNewList = true;
			this.initialize(1, null, 'favorites');
			this.setHistory({page:1, user:null, mentions:'favorites'});
			//this.initialize(1, null, 'favorites');
		},
		
		showImage:function(src, obj, type){
		  //console.log(obj);
		  shouldGet = false;
		  self = this;
          loc = $.base64.encode(src);
          data = localStorage.getItem(loc);
//          console.log(data);
          if(data){
                now = new Date().getTime().toString();
                data = JSON.parse(data);
                if(JSON.stringify(data.value)=='{}')
                   shouldGet = true ;
                else{
                    x = (now-data.date)/1000;
                    //console.log(x);
                    if(x>24*60*60)
                        shouldGet = true;
                    else
                        this.insImageInto(data.value, obj, type, loc, src);
                }
          }else{
            
			shouldGet = true;      
          }
          //console.log(shouldGet); 
            if(shouldGet){
                $.ajax({
                    url:app_location_address+'avatar.php?format=b&src='+loc, 
                    beforeSend:function(){
                        this.obj = {obj:obj, type:type, loc:loc, src:src};
                    },
                    success:function(result){
                        
                        localStorage.setItem(this.obj.loc, JSON.stringify({value:result, date:new Date().getTime()}));
                        self.insImageInto(result, this.obj.obj, this.obj.type, this.obj.loc, this.obj.src);
                   }
               });
            }
		},
		insImageInto:function(data, obj, type, loc, src){
		  //console.log(data);
           if(type=='src'){
                $("img[data-src='"+src+"']").attr('src', 'data:image/png;base64,'+data);   
                //$(obj).attr('src', 'data:image/png;base64,'+data);   
           }
            if(type=='bg'){
                //console.log(data);
                $("div[data-src='"+src+"']").attr('style', 'background:url(data:image/png;base64,'+data+') no-repeat center center');   
           }
		},
		
		friendships:function(screen_name){
		    //console.log('ss:'+screen_name);
		    self = this;
		    object = {};
			$.ajax({
				url:app_location_address+'action.php?token='+JSON.stringify(my_tokens)+'&w=friendships',
				data:{screen_name:screen_name},
				type:'POST',
				beforeSend:function(){
				    $("#twitt_list .user ul li").hide();
				    $("#twitt_list .user ul").append('<div class="w8"></div>');
				},
				complete:function(){
				    $(".w8").hide();
				},
				success: function(a){
					obj = $.parseJSON(a);
					if(obj.status=='success'){
						conc = obj.response[0];
						
						
						
						if(conc){
                            object = conc.connections;
                            k = false;
                            for(xi=0;xi<2;xi++){
                        
                                if(object[xi] == 'following'){
                                    k = true;
                                    $("#nf_"+conc.id_str).show();
                                }else if(object[xi] == 'followed_by'){
                                    $("#twitt_list .user ul").append('<div class="followed_by">this user is following you</div>');
                                }
                                //console.log(object[xi]);
                            }
                            if(!k){
                                $("#df_"+conc.id_str).show();
                            }
                        }
					}else{
						errorObj = $.parseJSON(obj.response);
						
						if(typeof(errorObj.errors)=='object'){
							$(errorObj.errors).each(function(){
								setFlashNew(this.message, 'error');
							});
							
						}else{
							setFlashNew(errorObj.errors, 'error');
						}
					}
				}
			});
		},
	});
	
	
	
	
	
	var User = Backbone.Model.extend({
		defaults: {
			id:'',
			u:{}
		},
		initialize: function(data){
			_.bindAll(this, 'createModel'); // every function that uses 'this' as the current object should be in here
			this.createModel(data);
		},
		createModel:function(data){
			//console.log(data.lang);
			this.set(
				{'u': data},
				{'id': data.id_str}
			);
			
		}
	}); 
	var UserList = Backbone.Collection.extend({
    	model: User,
		page:1
	});
	var UserView = Backbone.View.extend({
		tagName: 'li', // name of (orphan) root tag in this.el
		className:'user',
		//attributes:'#test=test',
		initialize: function(){        
			_.bindAll(this, 'render'); // every function that uses 'this' as the current object should be in here
			
		},
		render: function(){
			
			$(this.el).attr('id', this.model.get('id'));
			t_view = _.template("<ul class='uactions'><li data-what='df' data-id='<%= id %>' class='btn btn-success follow <%= isFollowing %>'>follow</li><li  data-what='uf' data-id='<%= id %>' class='btn btn-danger  unfollow <%= isFollowing %>'>unfollow</li></ul><div class='user'><a data-user='<%= screen_name %>' class='avatar' href=''><img data-user='<%= screen_name %>' src='<%= avatar %>'></a><div class='name'><a data-user='<%= screen_name %>' class='screen_name' href=''><%= screen_name %></a><a data-user='<%= screen_name %>' class='_name' href=''><%= name %></a></div><div class='description'><%= description %></div></div>");
			
			//console.log(this.model.get('u'));
			
			$(this.el).html(t_view({
				id :this.model.get('u').id_str,
				screen_name:this.model.get('u').screen_name,
				avatar:app_location_address+'avatar.php?src='+$.base64.encode(this.model.get('u').profile_image_url),
				name:this.model.get('u').screen_name,
				description:this.model.get('u').description,
				isFollowing:this.model.get('u').following
			}));
			//console.log(this);
			return this; // for chainable calls, like .render().el
		}
	});
	
	var UserListView  = Backbone.View.extend({
		el: $('.users'), // el attaches to existing element
		app:{},
		relation:'friends',
		page:0,
		events: {
			'click #sidebar_followings_cnt a': 'showFriends',
			'click #sidebar_followers_cnt a': 'showFollowes',
			'click #sidebar_favorites_cnt a': 'showFavorites',
			'click #sidebar_my_tweet_cnt a':'showMyTweet',
			'click a.nextPage':'nextPage',
			'click .unfollow':'action_follow',
			'click .follow':'action_follow',
			'click .user a':'show_profile'
		},
		initialize: function(page, user, mentions){
			_.bindAll(
				this, 
				'fetch',
				'appendItem',
				'showFollowes',
				'showFriends',
				'showFavorites',
				'readyToRenderUsers',
				'renderFinished',
				'showMyTweet',
				'nextPage',
				'action_follow',
				'show_profile',
				'insePageTitle'
			); // every function that uses 'this' as the current object should be in here
			this.collection = new UserList();
			this.collection.bind('add', this.appendItem); // collection event binder
			$(this.el).html('<ul  class="user_list"></ul><a href="#" class="nextPage">More</a>');
			
		},
		insePageTitle:function(title){
			//title = 'Twitt3r';
			
			$('ul.navi .title').html(title);	
		},
		action_follow:function(x){
		      //console.log(x);
		      //console.log(x.target);
			self = this;
			btn = $(x.target);
			id = $(x.target).attr('data-id');
			what = $(x.target).attr('data-what');
			if(what=='uf')
				btn_next = 'follow';
			if(what=='df')
				btn_next = 'unfollow';
			
			$.ajax({
				url:app_location_address+'action.php?token='+JSON.stringify(my_tokens)+'&w='+what,
				data:{user_id:id},
				type:'GET',
				beforeSend:function(){
					$(btn).hide();
					$(btn).after('<div class="w8"></div>');
				},
				success:function(a){
					obj = $.parseJSON(a);
					if(obj.status=='success'){
						//$(btn).parents('.uactions').children('.follow').show();
						$("#"+id+" ."+btn_next).show();
						setFlashNew('انجام شد', 'success');
					}else{
						errorObj = $.parseJSON(obj.response);
						
						if(typeof(errorObj.errors)=='object'){
							$(errorObj.errors).each(function(){
								setFlashNew(this.message, 'error');
							});
							
						}else{
							setFlashNew(errorObj.errors, 'error');
						}
					}
					
				},
				complete:function(){
					$(".w8").remove();
				}
			});
		},
		nextPage:function(){
			//this.relation = 'followers';
            this.readyToRenderUsers();
			this.page = this.page+1;
            this.app.listview.setHistory({page:1, user:'.view.', mentions:null});
            this.fetch();
		},
		show_profile:function(x){
			this.app.listview.profileView(x);
			
		},
		showMyTweet:function(x){
			this.app.listview.profileView(x);	
		},
		showFavorites:function(){
		  this.app.listview.showFavorites();
		},
		renderFinished:function(){
			$("html, body").animate({ scrollTop: 0 }, "fast");
			$('.nextPage').css('display', 'block').show();
			
            this.insePageTitle(this.relation);
            //$(".nextPage").show();
		},
		readyToRenderUsers:function(){
		      $("#twitt_list li").remove();
            $(".user_list li").remove();
            $(".pager").hide();
            $(".nextPage").hide();
            //alert('dd');
		},
		showFollowes:function(){
            this.relation = 'followers';
            this.readyToRenderUsers();
            this.app.listview.setHistory({page:1, user:'.view.', mentions:null});
            this.fetch();
			//this.renderFinished();
		},
		showFriends:function(){
            this.relation = 'friends';
            this.readyToRenderUsers();
            this.app.listview.setHistory({page:1, user:'.view.', mentions:null});
            this.fetch();
			
		},
		fetch:function(){
			self = this;
			$.ajax({
				url:app_location_address+'action.php?token='+JSON.stringify(my_tokens)+'&w=ulist',
				data:{r:this.relation, page:self.page},
				type:'POST',
				success: function(a){
					obj = $.parseJSON(a);
					if(obj.status=='success'){
						$(obj.users).each(function(index, elem) {
                            t = new User(elem);
                            self.collection.add(t);
                        });
					}else{
						errorObj = $.parseJSON(obj.response);
						
						if(typeof(errorObj.errors)=='object'){
							$(errorObj.errors).each(function(){
								setFlashNew(this.message, 'error');
							});
							
						}else{
							setFlashNew(errorObj.errors, 'error');
						}
					}
				},
				complete:function(){
				    self.renderFinished();
				}
			});
		},
		appendItem:function(item, opt){
			var uview = new UserView({
				model: item
			});
			$('ul.user_list', this.el).append(uview.render().el);
			
		},
	});
		
		
		
		
		
			
	var App = Backbone.View.extend({
		el: $('.twitts'), // el attaches to existing element
		history:[],
		listview:{},
		userlistview:{},
		username : '',
		myuserprofile:{},
		app_init_top_offset:'',
		initialize:function(){
			_.bindAll(
				this, 
				'renderSidebar',
				'search_action'
				//'showImage',
				//'insImageInto'
			);
			app = this;
			//console.log('me');
			//console.log(app);
			app_init_data = localStorage.getItem("app_data");
			app_init_data = JSON.parse(app_init_data);
			app_location_address = app_init_data.server_location;
			p = localStorage.getItem('user_data');
			
			
		
			
			
			//console.log(p);
			this.myuserprofile= JSON.parse(p);
			//console.log(this.myuserprofile);
			//return;
			
			this.username = this.myuserprofile.screen_name;
			
			//alert('dd');
			//console.log('----------');
			
			//app = this;
			
			this.listview = new ListView(1, null, null, 'y', 'xxx'); 
			//console.log('----------');			
			this.listview.app = this;
			
			
			this.listview.setHistory({page:1, user:null, mentions:null});
			
			
			this.userlistview = new UserListView();
			this.userlistview.app = this;
			
			
			
			
			//console.log(x);
			
			
			//this.renderSidebar();
		},
		search_action:function(q){
			x = $("div");
			$(x).attr('data-search', q);
			obj = {target:x};
			this.listview.showSearchResult(obj);
		},
		renderSidebar:function(){
			
			//console.log(this.myuserprofile);
			
			template = '<ul class="sidebar"><li class="user_sec"><ul><li class="settings"><a href="#"></a></li><li class="avatar"><img id="sidebar_user_avatar" src=""></li><li id="sidebar_name" class="name"></li><li id="sidebar_screen_name" class="screen_name"></li><li id="sidebar_description"></li></ul></li><li class="box_menu"><ul><li id="sidebar_my_tweet_cnt" class="sec"><span class="btn"></span><a href="#" class="" data-user="">My Tweets</a></li><li id="sidebar_favorites_cnt" class="sec"><span class="btn"></span><a href="#">Favorites</a></li><li id="sidebar_followings_cnt" class="sec"><span class="btn"></span><a href="#">Followings</a></li><li id="sidebar_followers_cnt" class="sec"><span class="btn"></span><a href="#">Followers</a></li><li id="sidebar_lists_cnt" class="sec"><span class="btn"></span><a href="#">Lists</a></li></ul></li><li class="sec logout_sec"><a class="wipe_btn" href="'+app_location_address+'index.php?wipe=1">SingOut</a></li></ul>';
			$(".users").append(template);
			
			
			$("#sidebar_user_avatar").attr('src', app_location_address+'avatar.php?src='+$.base64.encode(this.myuserprofile.profile_image_url));
			$("#sidebar_my_tweet_cnt span").html(this.myuserprofile.statuses_count);
			$("#sidebar_followings_cnt span").html(this.myuserprofile.friends_count);
			$("#sidebar_followers_cnt span").html(this.myuserprofile.followers_count);
			$("#sidebar_favorites_cnt span").html(this.myuserprofile.favourites_count);
			$("#sidebar_lists_cnt span").hide();
			$("#sidebar_description").html(this.myuserprofile.description);
			
			$("#sidebar_screen_name").html('@'+this.myuserprofile.screen_name);
			$("#sidebar_name").html(this.myuserprofile.name);
			
			$("#sidebar_my_tweet_cnt a").attr('data-user', this.myuserprofile.screen_name);
			
			$(".sidebar").animate({
				left:'0px',
				duration: 1000
			});
		}
	});
	app = new App();
	loadScripts();
})(jQuery);
}
function scrolling(){
	app_init_top_offset = localStorage.getItem("app_init_top_offset");
	console.log('recover offset :'+app_init_top_offset );
	if(app_init_top_offset){
		
	}else{
		app_init_top_offset = 0;
		localStorage.setItem("app_init_top_offset", app_init_top_offset);
	}
	$("html, body").animate({ scrollTop: app_init_top_offset }, "fast");
	setTimeout(function(){
		setOffsetx();
	},3000);
}
if(is_under_dev){
    inits();
}