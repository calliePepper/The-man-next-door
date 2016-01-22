# The-man-next-door
This is a gaming experiment, and augmented reality if you will. Through a fake social network (Twaddle) the user meets the main character Robin, and it is on this platform that the user can interact with the story.

Although it is constantly changing (this is a pet project at the moment, not a planed monalith), the current system stands as follows:

# Client side
The client side is a simple html / javascript engine with a heavy emphasis on timed events. This can be displayed as both a website and exported as a cordova android application

# Server side
A Node.js server sits on the back end and supplies three major functions:

1. A system for recording analytics on the players
2. An automatic update of the storyline when there are updates
3. Providing notifications via the GCM system
