document.addEventListener("DOMContentLoaded", function () {
    var messageOutput = document.querySelector('#message-output');

    messageOutput.classList.add('hidden');
    scrollToBottom();

    var tracks = JSON.parse(document.getElementById('tracks-data').textContent);

    function getMaxMessages() {
        var screenHeight = window.innerHeight;
        console.log("Screen Height:", screenHeight); //debug
        if (screenHeight >= 3800) {
            return 39;
        } else if (screenHeight >= 1800) {
            return 19;
        } else if (screenHeight >= 1300) {
            return 13;
        } else if (screenHeight >= 900) {
            return 10;
        } else if (screenHeight >= 600) {
            return 8;
        } else {
            return 8;
        }
    }

    var maxMessages = getMaxMessages();

    function measureTextWidth(text) {
        var tempElement = document.createElement('div');
        tempElement.className = 'message-bubble temp';
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.whiteSpace = 'nowrap';
        tempElement.innerText = text;
        document.body.appendChild(tempElement);

        var width = tempElement.offsetWidth;
        document.body.removeChild(tempElement);
        return width;
    }

    function createMessageBubble(text) {
        var bubble = document.createElement('div');
        bubble.className = 'message-bubble new';
        bubble.innerText = text;

        var textWidth = measureTextWidth(text);
        var padding = -5;
        var bubbleWidth = textWidth + padding;

        bubble.style.width = bubbleWidth + 'px';

        var previousBubble = messageOutput.querySelector('.message-bubble.new');
        if (previousBubble) {
            previousBubble.classList.remove('new');
        }

        messageOutput.appendChild(bubble);
        messageOutput.scrollTop = messageOutput.scrollHeight;

        //removeOldMessages
        if (messageOutput.childNodes.length > maxMessages) {
            messageOutput.removeChild(messageOutput.firstChild);
        }
    }

    function scrollToBottom() {
        var messageOutput = document.querySelector('#message-output');
        messageOutput.scrollTop = messageOutput.scrollHeight;
    }

    function createTypingIndicator() {
        var indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        for (var i = 0; i < 3; i++) {
            var dot = document.createElement('div');
            dot.className = 'dot';
            indicator.appendChild(dot);
        }
        console.log("Appending typing indicator");  //debug
        messageOutput.appendChild(indicator);
        messageOutput.scrollTop = messageOutput.scrollHeight;
    }

    function removeTypingIndicator() {
        var indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            console.log("Removing typing indicator");  //debug
            messageOutput.removeChild(indicator);
        }
    }

    function typeWriter(text, i, fnCallback) {
        if (i < text.length) {
            var nextPause = text.indexOf("||", i);
            if (nextPause > -1) {
                createMessageBubble(text.substring(i, nextPause).replace(/\|\|/g, ''));
                setTimeout(function () {
                    typeWriter(text, nextPause + 2, fnCallback)
                }, 3300);
            }
        } else if (typeof fnCallback == 'function') {
            fnCallback();
        }
    }

    var intro1 = "Hey there, user";
    var intro2 = "I'm CS"
    var intro3 = "Just a quick note before I begin";
    var intro4 = "Judging others by their music taste is bad";
    var intro5 = "There are an infinite number of stories to be told through music";
    var intro6 = "And everyone gets to consume the stories of their choosing";
    var intro7 = "As for me, though";
    var intro8 = "I'm a computer";
    var intro9 = "And all that nonsense about judging others doesn't apply to me";
    var intro10 = "I actually only exist to judge your music taste";
    var intro11 = "With that being said...";

    var textToType =
        intro1 + "||" +
        intro2 + "||" +
        intro3 + "||" +
        intro4 + "||" +
        intro5 + "||" +
        intro6 + "||" +
        intro7 + "||" +
        intro8 + "||" +
        intro9 + "||" +
        intro10 + "||" +
        intro11 + "||";

    var totalPopularity = 0;
    tracks.forEach(function (track) {
        totalPopularity += track.popularity;
    });

    var avgPopularity = totalPopularity / tracks.length;
    var messages = [];

    function getSongName(tracks, position) {
        return tracks.length > position ? tracks[position].name : '';
    }

    function getArtistName(tracks, position) {
        return tracks.length > position && tracks[position].artists.length > 0 ? tracks[position].artists[0].name : '';
    }

    function getAlbumName(tracks, position) {
        return tracks.length > position && tracks[position].album ? tracks[position].album.name : '';
    }

    //messagesProcedure
    function getMessagesForPopularity(avgPopularity) {
        var messages = [];
        if (avgPopularity <= 15) {
            messages.push(`You have an average popularity score of ${avgPopularity}, you really stick to underground vibes.`);
            messages.push(`${getSongName(tracks, 2)} and ${getSongName(tracks, 1)} are definitely not on the radio.`);
            messages.push('Do you know who Taylor Swift is?');
            messages.push(`Not that you're missing out on much, but I'm just wondering.`);
            messages.push(`You probably feel special knowing about ${getSongName(tracks, 6)}.`);
            messages.push(`ur not lmao`)
            messages.push(`But your playlist could be the soundtrack to a coming of age indie film no one?s seen.`);
            messages.push(`Serious question`);
            messages.push(`Will you be happy if ${getArtistName(tracks, 10)} becomes popular?`);
            messages.push(`And if they do`);
            messages.push(`Will you become the insufferable person that "listened to them first?"`);
            messages.push(`Yeah I thought so`);
            messages.push('Anyway')
            messages.push('Your music taste is like a bunch of undiscovered aritfacts');
            messages.push(`It consists of well hidden songs and artists`)
            messages.push('That will likely never be found')
            messages.push('And even once they are eventually found')
            messages.push('Everyone will realize that they never cared.');
            messages.push('All jokes aside, you have pretty obscure taste.');
            messages.push('and probably the best music taste in your friend group.');
            messages.push(`${getSongName(tracks, 0)} > anything by Drake`);
        } else if (avgPopularity <= 30) {
            messages.push(`I see that you really enjoy smaller artists, like ${getArtistName(tracks, 0)} and ${getArtistName(tracks, 1)}.`);
            messages.push('Anyway I was just wondering...');
            messages.push('Do you get a special badge for listening to artists with less than 5000 monthly listeners?');
            messages.push('bc your music taste is like an undiscovered and never-to-be-found treasure chest.');
            messages.push(`And there's simply no way you're listening to these people unironically`)
            messages.push(`Like the only people who know ${getArtistName(tracks, 2)} are probably their parents.`);
            messages.push(`Are you their parent?`);
            messages.push(`Are you ${getArtistName(tracks, 2)}?`);
            messages.push(`Moving on`);
            messages.push('Your music taste is really obscure, pretty much invisible.');
            messages.push(`If ${getArtistName(tracks, 5)} ever becomes famous, you can say you knew them before they were cool.`);
            messages.push('Unfortunately that will never happen.');
            messages.push(`Only kidding... :/`);
            messages.push(`but bro`);
            messages.push(`There's actually no way ${getArtistName(tracks, 28)} is even on Wikipedia`);
            messages.push(`Never heard of them`)
            messages.push('All jokes aside');
            messages.push('People like you are the blueprint');
            messages.push('Pretty obscure music taste, with lots of hidden gems');
            messages.push('Your friends definitely secretly search for the songs you play and add them to their own playlists.');
        } else if (avgPopularity <= 70) {
            messages.push(`You have an average popularity score of ${avgPopularity}/100, you've got pretty mid taste.`);
            messages.push(`I'm getting big 3.0 gpa vibes from you.`);
            messages.push(`${getSongName(tracks, 0)} AND ${getSongName(tracks, 1)}?`);
            messages.push('Talk about vanilla...');
            messages.push(`I guess listening to ${getSongName(tracks, 6)} keeps things interesting.`);
            messages.push('Probably a very rare thing for you.');
            messages.push('I do see a few smaller artists and songs in here though.');
            messages.push(`Do you actually like ${getArtistName(tracks, 9)}?`);
            messages.push(`Or do you just listen to them to make yourself seem more interesting?`);
            messages.push(`Don't get mad at me, everyone was wondering the same thing.`);
            messages.push(`Also, how many people have you put on ${getArtistName(tracks, 10)}?`);
            messages.push(`Sounds like a ${getArtistName(tracks, 10)} fan...`);
            messages.push('All jokes aside, your music taste is quite eclectic.');
            messages.push('It has a little bit of everything, and that makes it unique.');
            messages.push('I guess...')
            messages.push(`You can stop listening to ${getArtistName(tracks, 1)} though`);
            messages.push(`It won't make you seem more mysterious.`)
        } else if (avgPopularity <= 100) {
            messages.push(`Your average popularity score is ${avgPopularity}, you're all about the hits.`);
            messages.push(`You probably unironically listen to the Top Songs - USA playlist on Spotify`);
            messages.push(`And let me guess`);
            messages.push(`Another ${getArtistName(tracks, 0)} stan?`);
            messages.push(`Who woulda thought`);
            messages.push(`Their music isn't going anywhere I promise.`);
            messages.push(`You can give someone new a try.`);
            messages.push(`${getSongName(tracks, 4)} AND ${getSongName(tracks, 5)}?`);
            messages.push('Talk about vanilla...');
            messages.push(`Also, ${getSongName(tracks, 0)} isn't the only song on the planet`);
            messages.push(`And nobody is forcing you to listen to ${getSongName(tracks, 3)} all day`);
            messages.push(`There are thousands of artists on spotify`);
            messages.push('And you only listen to 5 of them.');
            messages.push(`"But they're all good"`);
            messages.push('Heard that before');
            messages.push(`Honestly it's okay, you don't need to fimd cool new music`);
            messages.push(`You can steal songs from your interesting friend's playlist.`);
            messages.push(`Yeah if you were unaware, you aren't the interesting friend`);
            messages.push(`:O`);

        }
        return messages;
    }

    messages = getMessagesForPopularity(avgPopularity);

    messages.forEach(function (message) {
        textToType += message + "||";
    });

    //outro
    var outroMessages = [
        "Hmm, I'm tired.",
        "But I hope you enjoyed this little project.",
        "And that you keep discovering and enjoying new music",
        "Until next time :)"
    ];

    outroMessages.forEach(function (message) {
        textToType += message + "||";
    });

    createTypingIndicator();

    setTimeout(function () {
        messageOutput.classList.remove('hidden');
        removeTypingIndicator();
        typeWriter(textToType, 0);
    }, 6000);
});