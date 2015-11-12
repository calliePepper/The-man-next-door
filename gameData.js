module.exports = {
    
    feedObjects: {
	    6:{postId:6,fromId:1,date:540,text:'Wake up Sheeple!!! (Test post for comment systemm)',image:'',video:'',likes:4,comments:1},
	    7:{postId:7,fromId:1,date:640,text:'You\'d think that I’d know how to study by now.',image:'',video:'',likes:2,comments:0},
	    8:{postId:8,fromId:1,date:740,text:'I was wondering if I could ask a favour of anyone reading this. Does anyone know a database I can access to check local seismic reports. I don’t know if they’d have anything specific to where I live, but anything will do.',image:'',video:'',likes:2,comments:0},
	    9:{postId:9,fromId:1,date:820,text:'Finally, some success! Actually not. I hoped optimism would spur one of you to help me out with this. I don’t know what to look for.',image:'',video:'',likes:2,comments:0},
	    10:{postId:10,fromId:1,date:950,text:'My neighbour is being weird again. I might just watch him, get some inspiration on this. I’m not being paranoid, but I hope there’s no way for him to see these posts. It could be funny though. A sort of Mutually weird neighbour\' kind of thing.',image:'',video:'',likes:2,comments:0},
	    11:{postId:11,fromId:1,date:1010,text:'Weird. So, my brand new friend (read: strange neighbour) has started up some recreational painting. All over his house.',image:'',video:'',likes:2,comments:0},
	    12:{postId:12,fromId:3,date:1030,text:'Robin. If you can read this, I hate to stomp all over what must be a seriously intense day of study, but could you please respond to my messages?',image:'',video:'',likes:2,comments:0}
    },
    
    commentObjects: {
        1:{
            comments:[
                {order:1,user:2,date:540,text:'You are such a rebel Robin',image:'',video:'',likes:2},
		        {order:2,user:1,date:541,text:'I know right? It\'s a wonder I haven\'t been arrested',image:'',video:'',likes:1}
            ],
            autoTarget:'choice',
            autoId:'2',
            feedId:'6'
        },
        2:{
            comments:[
                {order:1,user:2,date:601,text:'You are such a rebel Robin',image:'',video:'',likes:2},
		        {order:2,user:1,date:601,text:'I know right? It\'s a wonder I haven\'t been arrested',image:'',video:'',likes:1}
		    ],
		    autoTarget:'choice',
		    autoId:'2',
		    feedId:'6'
        },
        3:{
            comments:[
                {order:1,user:1,date:603,text:': Grins like an idiot :',image:'',video:'',likes:5}    
            ],
            autoTarget: 'choice',
            autoId:'4',
            feedId:'6'
        },
        4:{
            comments:[
                {order:1,user:3,date:500,text:'Can confirm we felt nothing over here, and we are only like 10 minutes drive away',image:'',video:'',like:1}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'4'
        },
        5:{
            comments:[
                {order:1,user:2,date:530,text:'Must have been light if there was one, I didn\'t even wake up',image:'',video:'',like:1}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'4'
        },
    },
    
    messageObjects: {
        1:{
            messages:[
                {msgId:'1_1',fromId:2,toId:2,timestamp:600,message:'Hello? Are you there?',image:'',video:'',from:1},
                {msgId:'1_2',fromId:2,toId:2,timestamp:603,message:'Seriously, I need to talk to you',image:'',video:'',from:1}
            ],
            autoTarget:'choice',
            autoId:'1'
        },
        2:{
            messages:[
                {msgId:'2_1',fromId:2,toId:2,timestamp:1444973605,message:'Thank god you are here, I am starting to really freak out',image:'',video:'',from:1},
                {msgId:'2_2',fromId:2,toId:2,timestamp:1444973705,message:'I think Robin is totally getting carried away with this whole \'neighbour\' situation',image:'',video:'',from:1},
                {msgId:'2_3',fromId:2,toId:2,timestamp:1444973705,message:'Last night I was bombarded with messages about how the neighbour is actually a lizard person',image:'',video:'',from:1},
                {msgId:'2_4',fromId:2,toId:2,timestamp:1444973705,message:'It\'s seriously getting out of hand',image:'',video:'',from:1}
            ],
            autoTarget:'',
            autoId:''
        }        ,
        3:{
            messages:[
                {msgId:'3_1',fromId:2,toId:2,timestamp:1444973605,message:'Wow. Ok',image:'',video:'',from:1},
                {msgId:'3_2',fromId:2,toId:2,timestamp:1444973705,message:'Well fuck you',image:'',video:'',from:1}
            ],
            autoTarget:'',
            autoId:''
        },
        4:{
            messages:[
                {msgId:'4_1',fromId:1,toId:1,timestamp:300,message:'Are you awake? I think I saw something',image:'',video:'',from:1},
                {msgId:'4_2',fromId:1,toId:1,timestamp:304,message:'I definately saw something',image:'',video:'',from:1}
            ],
            autoTarget:'',
            autoId:''
        },
    },
    
    choiceObjects: {
        1: {choiceId:1,choice1:'Ok I\'m here, what is wrong?',choice2:'It can\'t be that important',choice3:'I\'m going to ignore you till you calm down',resultType:'message',result1:2,result2:3,result3:3,ttd:360},
        2: {choiceId:2,choice1:'Robin, you are an embarrasment',choice2:'How do you deal with this Cal?',choice3:'Yeah! Fight the power!',resultType:'comment',result1:3,result2:3,result3:3,ttd:''},
        3: {choiceId:3,choice1:'Deal with the problem yourself',choice2:'Ignore it, it will go away',choice3:'Skin the cat. It\'s the only solution. Skin. The. Cat',resultType:'comment',result1:0,result2:0,result3:0,ttd:''},
        4: {choiceId:4,choice1:'You are an idiot',choice2:'Derp',choice3:': Grins like a moron back :',resultType:'comment',result1:0,result2:0,result3:0,ttd:''}
    },
    
    directionObject: {
        1: {directionId:1,attribute:'storyEvent1',operator:'=',value:'1',trueTarget:'message',trueId:'3',falseTarget:'message',falseId:'4'},
        2: {directionId:2,attribute:'calTrust',operator:'>',value:'10',trueTarget:'message',trueId:'5',falseTarget:'message',falseId:'6'}
    },
    
    pages: {
        'Twaddle - A social media for the everyman': 'Feed page',
        'Twaddle - Messages': 'Messages',
        'Robin Creed': 'Robin'
    },
    
    events: {
        0: {
            300:{object:'messageObjects',id:'4'},
            500:{object:'commentObjects',id:'4'},
            530:{object:'commentObjects',id:'5'},
            540:{object:'feedObjects',id:'6'},
            605:{object:'messageObjects',id:'1'},
            640:{object:'feedObjects',id:'7'},
            740:{object:'feedObjects',id:'8'},
            820:{object:'feedObjects',id:'9'},
            950:{object:'feedObjects',id:'10'},
            1010:{object:'feedObjects',id:'11'},
            1030:{object:'feedObjects',id:'12'},
            
        },
        1: {
            
        }
    }

};