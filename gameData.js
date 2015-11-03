module.exports = {
    
    feedObjects: {
	    4:{postId:4,fromId:1,date:540,text:'Wake up Sheeple!!! (Sent at 9am)',image:'',video:'',likes:4,comments:1},
	    5:{postId:5,fromId:1,date:600,text:'The truth is all over youtube (Sent at 10am)',image:'',video:'rbJg9TQKU0U',likes:4,comments:2},
	    6:{postId:6,fromId:1,date:660,text:'The way I see it, life is a pile of good things and bad things... (Sent at 11am)',image:'',video:'',likes:4,comments:0},
	    7:{postId:7,fromId:1,date:720,text:'Can\'t we share this robbery? Isn\'t that what robberies are all about? (Sent at 12am)',image:'',video:'',likes:4,comments:0},
	    8:{postId:8,fromId:1,date:780,text:'Stop talking, brain thinking (Sent at 1pm)',image:'',video:'',likes:4,comments:0},
	    9:{postId:9,fromId:1,date:840,text:'They call me Robin, I don\'t know why. I call me Robin too. (Sent at 2pm)',image:'',video:'',likes:4,comments:0},
	    10:{postId:10,fromId:1,date:900,text:'You know whe grown-ups tell you everything is going to be fine and you think they are probably lying to make you feel better... (Sent at 3pm)',image:'',video:'',likes:4,comments:0},
	    11:{postId:11,fromId:1,date:960,text:'I\'m nobody\'s taxi service (Sent at 4pm)',image:'',video:'',likes:4,comments:0},
	    12:{postId:12,fromId:1,date:1020,text:'All I\'ve got to do is pass an an ordinary human being. Simple. What could go wrong (Sent at 5pm)',image:'',video:'',likes:4,comments:0},
	    13:{postId:13,fromId:1,date:1080,text:'I\'ll fix it, I\'m good at fixing rot. Call me the Rotmeister. Actually call me Robin. Never call me the Rotmeister (Sent at 6pm)',image:'',video:'',likes:4,comments:0},
	    14:{postId:14,fromId:1,date:1140,text:'Father Christmas. Santas Claus. Or as I\'ve always known him: Jeff (Sent at 7pm)',image:'',video:'',likes:4,comments:0},
	    15:{postId:15,fromId:1,date:1200,text:'Sorry, checking all the water in this area; there is an escaped fish (Sent at 8pm)',image:'',video:'',likes:4,comments:0}
	    
    },
    
    commentObjects: {
        1:{
            comments:[
                {order:1,user:2,date:540,text:'You are such a rebel Robin',image:'',video:'',likes:2},
		        {order:2,user:1,date:541,text:'I know right? It\'s a wonder I haven\'t been arrested',image:'',video:'',likes:1}
            ],
            autoTarget:'choice',
            autoId:'2',
            feedId:'4'
        },
        2:{
            comments:[
                {order:1,user:2,date:601,text:'You are such a rebel Robin',image:'',video:'',likes:2},
		        {order:2,user:1,date:601,text:'I know right? It\'s a wonder I haven\'t been arrested',image:'',video:'',likes:1}
		    ],
		    autoTarget:'',
		    autoId:'',
            feedId:'5'
        },
        3:{
            comments:[
                {order:1,user:1,date:603,text:': Grins like an idiot :',image:'',video:'',likes:5}    
            ],
            autoTarget: 'choice',
            autoId:'4',
            feedId:'4'
        }
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
        4: {choiceId:4,choice1:'You are an idiot',choice2:'Derp',choice3:':Grins like a moron back:',resultType:'comment',result1:0,result2:0,result3:0,ttd:''}
    },
    
    pages: {
        'Twaddle - A social media for the everyman': 'Feed page',
        'Twaddle - Messages': 'Messages',
        'Robin Creed': 'Robin'
    },
    
    events: {
        0: {
            300:{object:'messageObjects',id:'4'},
            540:{object:'feedObjects',id:'4'},
            600:{object:'feedObjects',id:'5'},
            660:{object:'feedObjects',id:'6'},
            720:{object:'feedObjects',id:'7'},
            800:{object:'feedObjects',id:'8'},
            860:{object:'feedObjects',id:'9'},
            900:{object:'feedObjects',id:'10'},
            960:{object:'feedObjects',id:'11'},
            1020:{object:'feedObjects',id:'12'},
            1080:{object:'feedObjects',id:'13'},
            1140:{object:'feedObjects',id:'14'},
            1200:{object:'feedObjects',id:'15'}
        },
        1: {
            
        }
    }

};