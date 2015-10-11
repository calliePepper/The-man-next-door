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
                        var sinceText = wordifyTime(value['date']);
                        var usersAvatar = totalData['users'][value['user']]['avatar'];
                        var usersFirstname = totalData['users'][value['user']]['firstname'];
                        var usersLastname = totalData['users'][value['user']]['lastname'];
                        $('#'+target).append('<div class="feedObject"><div class="feedHeader"><div class="feedAvatar"><img class="avatar" src="img/'+usersAvatar+'" alt="'+usersFirstname+'\'s Avatar" /></div><div class="postedBy">'+usersFirstname+' '+usersLastname+'</div><div class="date">'+sinceText+'</div></div><p>'+value['text']+'</p>'+imageLink+'<div class="likedSection"><span class="colouredText">'+value['likes']+'</span> people like this</div></div>');
                    });
            }          


            function post(userId,date,text,image,liked) {
                this.user = userId;
                this.date = date;
                this.text = text;
                this.image = image;
                this.likes = liked;
            }

            function comment(parentId,order,userId,date,text,image,liked) {
                this.parent = parentId;
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

            var totalData = {
                posts: {
                    1:new post(1,1444962078,'Check out this image, found it at <a href="http://image.google.com">Google</a>','exampleLink.png',500),
                    2:new post(1,1444362078,'Yo yo yo','',23),
                    3:new post(1,1444162078,'Bitches love me','',7)
                },
                comments: [
                    new comment(1,1,1,1444962078,'God I am awesome','',-2),
                ],
                messages: [
                    new message(1,1444422078,'Bloop','',1),
                    new message(1,1444230423,"Bite my shiny metal ass. Bender, we're trying our best. Yeah, I do that with my stupidness. Oh God, what have I done?<br>But I've never been to the moon! You, a bobsleder!? That I'd like to see! What kind of a father would I be if I said no? I just told you! You've killed me! We don't have a brig.",'',0),
                    new message(1,1444422078,'Bloop','',1),
                    new message(1,1444230423,"Bite my shiny metal ass. Bender, we're trying our best. Yeah, I do that with my stupidness. Oh God, what have I done?<br>But I've never been to the moon! You, a bobsleder!? That I'd like to see! What kind of a father would I be if I said no? I just told you! You've killed me! We don't have a brig.",'',0),
                    new message(1,1444422078,'Bloop','',1),
                    new message(1,1444230423,"Bite my shiny metal ass. Bender, we're trying our best. Yeah, I do that with my stupidness. Oh God, what have I done?<br>But I've never been to the moon! You, a bobsleder!? That I'd like to see! What kind of a father would I be if I said no? I just told you! You've killed me! We don't have a brig.",'',0)
                ],
                users: {
                    1: new user('Sam','Creed','they',1429323,'samAvatar.png','samBg.jpg')
                }
            };  