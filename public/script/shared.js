            var choiceControls = {};
            
            choiceControls.create = function(choiceId,target,remove,choice1,choice2,choice3) {
                $('.choice').unbind();
                var choiceString = '';
                if (choice1!=0) {choiceString += '<div id="choice1" class="choice">'+choice1+'</div>';}
                if (choice2!=0) {choiceString += '<div id="choice2" class="choice">'+choice2+'</div>';}
                if (choice3!=0) {choiceString += '<div id="choice3" class="choice">'+choice3+'</div>';}
                $('#'+target).append('<div id="choiceBlock" class="choiceBlock">'+choiceString+'</div>');
                $('#choiceBlock').css('max-height','300px');
                $('.choice').on('click touch', function() {
                    choiceControls.choose(choiceId,$(this).attr('id'));
                    if (remove != '') {
                        $('#'+remove).removeClass('choiceBeing');
                    }
                });
            }

            choiceControls.choose = function(id,choice) {
                var theChoice = $('#'+choice).html();
                commentsString = '<div class="comments">';
                var commentSince = time.wordify(Math.floor(Date.now() / 1000));
                var usersAvatar = totalData['users'][0]['avatar'];
                var usersFirstname = totalData['users'][0]['firstname'];
                var usersLastname = totalData['users'][0]['lastname'];
                var imageComments = '';
                var likedComments = '';
                commentsString += '<div class="comment"><div class="commentAvatar"><img class="avatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><span class="commentBy">'+usersFirstname+' '+usersLastname+'</span><span class="commentContent">'+theChoice+'</span>'+imageComments+'<div class="commentFooter">'+likedComments+commentSince+'</div></div>';
                commentsString += '</div>';
                $('#choiceBlock').remove();
                $('#comments_0').append(commentsString);        
            }
            
            var users = {}
            
            users.load = function() {
                $.each(totalData['users'], function(index, value) {
                    if (index != 0 ) {
                        $('#sideBar').append('<a id="'+value['firstname']+'" href="'+value['firstname']+'" class="friend sideLink"><img src="img/'+value['avatar']+'" class="navAvatar mobile" alt="Navigation avatar" /><i id="userIcon" class="desktop fa fa-user"></i>'+value['firstname']+' '+value['lastname']+'</a>');    
                    }
                });
            }
            
            var time = {}
            
            time.wordify = function(newTimes) {
                var currentTime = Math.floor(Date.now() / 1000);
                console.log('The current time is '+currentTime);
                console.log('The post time is '+newTimes);
                console.log('The difference in minutes is '+(currentTime - newTimes) / 60);
                var difference = (currentTime - newTimes) / 60;
                if (difference < 60) {
                    return Math.floor(difference)+' minutes ago';
                } else if (difference / 60 < 24) {
                    return Math.floor(difference/60)+' hours ago';
                } else {
                    return Math.floor(difference/60/24)+' days ago';
                }
            }

            time.date = function(newTimes) {
                var date = new Date(newTimes*1000);
                var hours = date.getHours();
                var minutes = "0" + date.getMinutes();
                var seconds = "0" + date.getSeconds();
                var year = date.getFullYear();
                var month = date.getMonth();
                var date = date.getDate();
                return date+'/'+month+'/'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
            }

            var feed = {};

            feed.create = function(target,objects) {
                $.each(objects, function(index,value) {
                    var imageLink = '';
                    if (value['image'] != '') {
                        imageLink = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
                    }
                    var likedText = '';
                    if (value['likes'] != '') {
                        likedText = '<span class="colouredText">'+value['likes']+'</span> people like this';
                    }
                    var sinceText = time.wordify(value['date']);
                    var usersAvatar = totalData['users'][value['user']]['avatar'];
                    var usersFirstname = totalData['users'][value['user']]['firstname'];
                    var usersLastname = totalData['users'][value['user']]['lastname'];
                    var commentsString = '';
                    if (value['comments'].length > 0) {
                        commentsString = '<div class="comments" id="comments_'+index+'">';
                        $.each(value['comments'], function(index,value) {
                            var commentSince = time.wordify(value['date']);
                            var usersAvatar = totalData['users'][value['user']]['avatar'];
                            var usersFirstname = totalData['users'][value['user']]['firstname'];
                            var usersLastname = totalData['users'][value['user']]['lastname'];
                            var imageComments = '';
                            if (value['image'] != '') {
                                imageComments = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
                            }
                            var likedComments = '';
                            if (value['likes'] != '') {
                                likedComments = '<span class="colouredText commentLikes"><i class="fa fa-thumbs-up"></i>'+value['likes']+'</span>';
                            }
                            commentsString += '<div class="comment"><div class="commentAvatar"><img class="avatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><span class="commentBy">'+usersFirstname+' '+usersLastname+'</span><span class="commentContent">'+value['text']+'</span>'+imageComments+'<div class="commentFooter">'+likedComments+commentSince+'</div></div>';
                        });
                        commentsString += '</div>';
                    }
                    $('#'+target).append('<div id="feed_'+index+'" class="feedObject" ><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar"><img class="avatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy">'+usersFirstname+' '+usersLastname+'</div><div class="date">'+sinceText+'</div></div><p>'+value['text']+'</p>'+imageLink+'<div class="feedControls"><span class="feedControl likeControl" id="like_'+index+'"><i class="fa fa-thumbs-up"></i>Like</span><span id="comment_'+index+'" class="feedControl commentControl"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
                });
            }          


            function post(userId,date,text,image,liked,comments) {
                this.user = userId;
                this.date = date;
                this.text = text;
                this.image = image;
                this.likes = liked;
                this.comments = comments;
            }

            function comment(order,userId,date,text,image,liked) {
                this.order = order;
                this.user = userId;
                this.date = date;
                this.text = text;
                this.image = image;
                this.likes = liked;
            }

            function message(userId,time,content,image,from) {
                this.user = userId;
                this.date = time;
                this.text = content;
                this.image = image;
                this.from = from;
            }

            function user(firstname,lastname,pronoun,created,avatar,hero) {
                this.firstname = firstname;
                this.lastname = lastname;
                this.pronoun = pronoun;
                this.created = created;
                this.avatar = avatar;
                this.hero = hero;
            }
            
            function trending(day,title,content) {
                this.day = day;
                this.title = title;
                this.content = content;
            }
      
            Notification.requestPermission();
            
            function spawnNotification(theBody,theIcon,theTitle) {
                var options = {
                    body: theBody,
                    icon: theIcon
                }
                var n = new Notification(theTitle,options);
            }
        
            $('#mobileNav').on('click touch', function() {
                $('#feedContent').toggleClass('navFlip');
                $('.sideBar').toggleClass('navFlip');
            });
        