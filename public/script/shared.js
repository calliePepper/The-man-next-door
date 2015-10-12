            function createChoice(choiceId,choice1,choice2,choice3,target) {
                $('.choice').unbind();
                $('#'+target).append('<div id="choiceBlock" class="choiceBlock"><div id="choice1" class="choice">'+choice1+'</div><div id="choice2" class="choice">'+choice2+'</div><div id="choice3" class="choice">'+choice3+'</div></div>');
                $('.choice').on('click touch', function() {
                    choiceMade(choiceId,$(this).attr('id'));
                });
            }

            function choiceMade(id,choice) {
                console.log('You choice '+choice);
                $('#choiceBlock').html('Your choice was '+$('#'+choice).html());
                $('#choiceBlock').removeAttr('id');
            }
            
            function wordifyTime(newTimes) {
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

            function datifyTime(newTimes) {
                var date = new Date(newTimes*1000);
                var hours = date.getHours();
                var minutes = "0" + date.getMinutes();
                var seconds = "0" + date.getSeconds();
                var year = date.getFullYear();
                var month = date.getMonth();
                var date = date.getDate();
                return date+'/'+month+'/'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
            }

            function createFeed(target,objects) {
                $.each(objects, function(index,value) {
                    var imageLink = '';
                    if (value['image'] != '') {
                        imageLink = '<img src="img/'+value['image']+'" alt="user image" class="feedImage" />';
                    }
                    var likedText = '';
                    if (value['likes'] != '') {
                        likedText = '<span class="colouredText">'+value['likes']+'</span> people like this';
                    }
                    var sinceText = wordifyTime(value['date']);
                    var usersAvatar = totalData['users'][value['user']]['avatar'];
                    var usersFirstname = totalData['users'][value['user']]['firstname'];
                    var usersLastname = totalData['users'][value['user']]['lastname'];
                    var commentsString = '';
                    if (value['comments'].length > 0) {
                        commentsString = '<div class="comments">';
                        $.each(value['comments'], function(index,value) {
                            var commentSince = wordifyTime(value['date']);
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
                    $('#'+target).append('<div class="feedObject"><div class="innerFeed"><div class="feedHeader"><div class="feedAvatar"><img class="avatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy">'+usersFirstname+' '+usersLastname+'</div><div class="date">'+sinceText+'</div></div><p>'+value['text']+'</p>'+imageLink+'<div class="feedControls"><span class="feedControl likeControl"><i class="fa fa-thumbs-up"></i>Like</span><span class="feedControl commentControl"><i class="fa fa-comment"></i>Comment</span></div></div><div class="likedSection">'+likedText+'</div>'+commentsString+'</div>');
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
            
            var comments = {
                    1: [
                        new comment(1,1,1444611193,'God I am awesome','',-2),
                        new comment(1,1,1444610193,'So amazingly awesome','',5),
                    ]
            }

            var totalData = {
                posts: [
                    new post(1,1444511193,'Check out this image, found it at <a href="http://image.google.com">Google</a>','exampleLink.png',500,comments[1]),
                    new post(1,1444362078,'Yo yo yo','',23,''),
                    new post(1,1444162078,'Bitches love me','',7,'')
                ],
                trending: [
                    new trending(1,'Twaddle','A new social media for the masses, is looking for new employees'),
                    new trending(1,'Puppy love','A puppy is a small regional zoo has made friends with a zebra, and they are the most unlikeliest of companions!'),
                    new trending(1,'Baby Possom','Photos shared of baby marsupial snuggling with toy kangaroo'),
                    new trending(1,'Skinning Cats','There are more than one way! Our top chefs look at old age techniques that you probably have never heard of'),
                    new trending(1,'Netherworld vacation','Are you tired of your boring existance? Think you deserve a great vacation? We show you paths that the guides don\'t want you to know about')
                ],
                messages: [
                    new message(1,1444422078,'Bloop','',1),
                    new message(1,1444230423,"Bite my shiny metal ass. Bender, we're trying our best. Yeah, I do that with my stupidness. Oh God, what have I done?<br>But I've never been to the moon! You, a bobsleder!? That I'd like to see! What kind of a father would I be if I said no? I just told you! You've killed me! We don't have a brig.",'',0),
                    new message(1,1444511193,'Check out this image, found it at <a href="http://image.google.com">Google</a>','messageImage.jpg',1),
                ],
                users: {
                    1: new user('Sam','Creed','they',1429323,'samAvatar.png','samBg.jpg')
                }
            };  