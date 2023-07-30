# BotTab
A full robotic personal assistant that runs from a browser tab.

# What you need
1. A basic **Arduino** robot with **two cameras** mounted on it.
2. The cameras and Arduino should connect to a computer running the browser tab.

# How to run
1. This is a static site that can be hosted easily. 
2. Be sure to find where to enter your gpt keys in the two places in the code where it's needed... I should make it a variable later...
3. You may want to switch from GPT 4 to GPT 3.5 Turbo because GPT 4 is expensive and has rate limits. However GPT 3.5 is dumb... very dumb
4. Connect to the Arduino board and cameras.
5. Connect to the site with Google Chrome, the only supported browser currently.
5. You'll first be prompted to enable the serial connection.
6. **You need to go into the site permissions and enable automatic access "allow" to cameras**
7. Make open the browser console to view errors and information. (ctrl shift i)

# To do
1. Add more visual capabilities and sensors to detect more objects and walls.
2. Add more optional sensors like motion, lidar, and so on.
3. Give it the ability to detect facial expressions.
4. Give it the ability to retrain models to learn specific objects and people.
5. Allow for saving and resuming state.
6. Give it the ability to share information as well, access the internet, and other local and web-based digital abilities.
7. More people contribute and improve the code and abilities.
