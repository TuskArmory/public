# Rail bot usage
Assumes you already know how to use [JsMacros](https://jsmacros.wagyourtail.xyz/?general.html).
1. Map rail route by it's coordinates, using the existing rails as coordinates.
2. Set the bot's routeTemplate to be that rail
3. Carry axes, food, and stone. The axes clean the rail, the food prevents you from dying and the stone is used to recover from falling into holes in the middle of the rail tunnel 
4. Run the bot.
   
The bot will clean the right-side rail.

The right-side is relative to the direction the rail is going in - for example, on a rail going from (0, 0) to (100, 0) aka east it will face south while cleaning by default.

If you face the left-side rail, it'll clean that rail going toward the start of the defined route - toward (0, 0) in the example
