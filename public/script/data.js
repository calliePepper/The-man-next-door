            function post(postId,userId,date,text,image,video,likes,comments,liked,caption) {
                this.postId = postId;
                this.user = userId;
                this.date = date;
                this.text = text;
                this.image = image;
                this.video = video;
                this.likes = likes;
                this.comments = comments;
                this.liked = liked;
                this.caption = caption;
            }

            function comment(order,userId,date,text,image,video,liked) {
                this.order = order;
                this.user = userId;
                this.date = date;
                this.text = text;
                this.image = image;
                this.video = video;
                this.likes = liked;
            }
            
            function choice(choiceId,choice1,choice2,choice3,choiceMade) {
                this.choiceId = choiceId;
                this.choice1 = choice1;
                this.choice2 = choice2;
                this.choice3 = choice3;
                this.choiceMade = 0;
            }

            function message(fromId,toId,time,content,image,video,from,msgId) {
                this.fromId = fromId;
                this.toId = toId;
                this.date = time;
                this.text = content;
                this.image = image;
                this.video = video;
                this.from = from;
                this.msgId = msgId;
            }

            function user(firstname,lastname,pronoun,created,avatar,hero,friended,typingSpeed,waitTime,trust,companionship) {
                this.firstname = firstname;
                this.lastname = lastname;
                this.pronoun = pronoun;
                this.created = created;
                this.avatar = avatar;
                this.hero = hero;
                this.friended = friended;
                this.typingSpeed = typingSpeed;
                this.waitTime = waitTime;
                this.trust = trust;
                this.companionship = companionship;
            }
            
            function trending(day,title,content) {
                this.day = day;
                this.title = title;
                this.content = content;
            }
      

          
      