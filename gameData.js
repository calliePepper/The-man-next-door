module.exports = {
    
    feedObjects: {
	    7:{postId:7,fromId:1,date:563,text:'You\'d think that I’d know how to study by now.',image:'',caption:'',video:'',likes:2,comments:0},
	    8:{postId:8,fromId:1,date:585,text:'I was wondering if I could ask a favour of anyone reading this. Does anyone know a database I can access to check local seismic reports? I don’t know if they’d have anything specific to where I live, but anything will do.',image:'',caption:'',video:'',likes:1,comments:0},
	    9:{postId:9,fromId:1,date:600,text:'Does anyone else ever feel the urgency in decisions? Laying the foundation for a day of serious research on the nature of this world, versus getting ready for a party.',image:'',caption:'',video:'',likes:1,comments:0},
	    10:{postId:10,fromId:1,date:690,text:'Finally, some success! Actually not. I hoped optimism would spur one of you to help me out with this. I don’t know what to look for.',image:'',caption:'',video:'',likes:4,comments:0},
	    11:{postId:11,fromId:1,date:824,text:'My neighbour is being weird again. I might just watch him, get some inspiration on this. I’m not being paranoid, but I hope there’s no way for him to see these posts. It could be funny though. A sort of Mutually weird neighbour\' kind of thing.',image:'',caption:'',video:'',likes:10,comments:0},
	    12:{postId:11,fromId:1,date:862,text:'And of course, someone organised a party and this happens…',image:'forecast1.png',caption:'<div class="captionTitle">Bureau of meteorology</div><div class="captionContent">Provides access to weather forecasts, warnings, observations and radar imagery</div></div class="captionLink">bom.com</div>',video:'',likes:10,comments:0},
	    13:{postId:12,fromId:1,date:923,text:'Weird. So, my brand new friend (read: strange neighbour) has started up some recreational painting. All over his house.',image:'',caption:'',video:'',likes:4,comments:0},
	    14:{postId:13,fromId:3,date:1072,text:'Robin. If you can read this, I hate to stomp all over what must be a seriously intense day of study, but could you please respond to my messages?',image:'',caption:'',video:'',likes:3,comments:14}
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
                {order:1,user:3,date:501,text:'Can confirm we felt nothing over here, and we are only like 10 minutes drive away',image:'',video:'',like:1}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'4'
        },
        5:{
            comments:[
                {order:1,user:2,date:523,text:'Must have been a light one, I didn\'t even wake up',image:'',video:'',like:1}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'4'
        },
        6:{
            comments: [
                {order:1,user:2,date:422,text:'Great, less than 24 hours back and you are already digger through people\'s trash. Nice work',image:'',video:'',like:1}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'5'
        },
        7:{
            comments: [
                {order:1,user:3,date:564,text:'Anything I can help with?',image:'',video:'',like:1},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'7'
        },
        8:{
            comments: [
                {order:2,user:1,date:565,text:'Just the usual cosmic mysteries',image:'',video:'',like:1},
                {order:3,user:3,date:565,text:'Studying the cosmic mysteries is one of your strong points. Come on Robin, I believe in you!',image:'',video:'',like:1},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'7'
        },
        9:{
            comments: [
                {order:4,user:1,date:566,text:'Thanks buddy. I\'ll tip you in on my findings',image:'',video:'',like:1},
                {order:5,user:3,date:567,text:'I am so very sure of that.',image:'',video:'',like:1},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'7'
        },
        10:{
            comments: [
                {order:1,user:2,date:600,text:'I checked the NEIC (National Earthquake Information Center). No reports. It\'s supposed to report on local findings, but nothing so far.',image:'',video:'',like:1},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'8'
        },
        11:{
            comments: [
                {order:2,user:3,date:605,text:'What do you need?',image:'',video:'',like:1}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'9'
        },
        12:{
            comments: [
                {order:2,user:1,date:615,text:'Maybe some help with the whole clothing situation. I\'ve been away awhile, I don’t know what the current dress style is. Have you talked to Marcel? He’s pretty good in that department.',image:'',video:'',like:1}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'9'
        },
         13:{
            comments: [
                {order:2,user:3,date:625,text:'I actually haven\'t. Not even sure if he\'s coming.',image:'',video:'',like:1}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'9'
        },
        14:{
            comments: [
                {order:2,user:1,date:630,text:'Weird, I know I wasn\'t dreaming.',image:'',video:'',like:1}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'8'
        },
       
        15:{
            comments: [
                {order:1,user:2,date:930,text:'Anything good?',image:'',video:'',like:1},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'13'
        },
        16:{
            comments: [
                {order:2,user:1,date:940,text:'Just shapes and lines. Someone would probably call it post-modern',image:'',video:'',like:1},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'13'
        },
        17:{
            comments: [
                {order:2,user:3,date:960,text:'Wait, I swear I heard rain outside.',image:'',video:'',like:1},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'13'
        },
        18:{
            comments: [
                {order:2,user:1,date:980,text:'Doesn’t seem to be stopping him. The paint is just dripping straight off the house.',image:'',video:'',like:1},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'13'
        },
        19:{
            comments: [
                {order:2,user:1,date:990,text:'Well. That’s odd.',image:'',video:'',like:1},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'13'
        },
        20:{
            comments: [
                {order:4,user:2,date:1000,text:'I think the guy is just odd all-over',image:'',video:'',like:1}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'13'
        },
        21:{
            comments: [
                {order:1,user:1,date:1078,text:'Sorry, I was deep into the mystery.',image:'',video:'',like:''},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'14'
        },
        22:{
            comments: [
                {order:2,user:3,date:1079,text:'Respond to my message?',image:'',video:'',like:''},
            ],
            autoTarget:'',
            autoId:'',
            feedId:'14'
        },
        23:{
            comments: [
                {order:3,user:1,date:1081,text:'Sorry, on it now',image:'',video:'',like:''}
            ],
            autoTarget:'',
            autoId:'',
            feedId:'14'
        }
    },
    
    /*
    7:{
            comment: [
                {order:,user:,date:,text:,image:,video:,like:}    
            ],
            autoTarget:'',
            autoId:'',
            feedId:''
        }
    */
    
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
            501:{object:'commentObjects',id:'4'},
            521:{object:'commentObjects',id:'6'},
            523:{object:'commentObjects',id:'5'},
            563:{object:'feedObjects',id:'7'},
            564:{object:'commentObjects',id:'7'},
            565:{object:'commentObjects',id:'8'},
            566:{object:'commentObjects',id:'9'},
            585:{object:'feedObjects',id:'8'},
            600:{object:'commentObjects',id:'10'},
            600:{object:'feedObjects',id:'9'},
            605:{object:'messageObjects',id:'1'},
            605:{object:'commentObjects',id:'11'},
            615:{object:'commentObjects',id:'12'},
            625:{object:'commentObjects',id:'13'},
            630:{object:'commentObjects',id:'14'},
            690:{object:'feedObjects',id:'10'},
            824:{object:'feedObjects',id:'11'},
            862:{object:'feedObjects',id:'12'},
            923:{object:'feedObjects',id:'13'},
            930:{object:'commentObjects',id:'15'},
            940:{object:'commentObjects',id:'16'},
            960:{object:'commentObjects',id:'17'},
            980:{object:'commentObjects',id:'18'},
            990:{object:'commentObjects',id:'19'},
            1000:{object:'commentObjects',id:'20'},
            1072:{object:'feedObjects',id:'14'},
            1078:{object:'commentObjects',id:'21'},
            1079:{object:'commentObjects',id:'22'},
            1081:{object:'commentObjects',id:'23'},
        },
        1: {
            
        }
    }
};
