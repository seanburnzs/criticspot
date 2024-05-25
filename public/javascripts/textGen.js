document.addEventListener("DOMContentLoaded", function () {
    var messageOutput = document.querySelector('#message-output');

    messageOutput.classList.add('hidden');
    scrollToBottom();

    var tracks = JSON.parse(document.getElementById('tracks-data').textContent);

    function getMaxMessages() {
    return 50;
}
    
    var maxMessages = getMaxMessages();

    function createMessageBubble(text) {
        var bubbleContainer = document.createElement('div');
        bubbleContainer.className = 'message-bubble-container';

        var bubble = document.createElement('div');
        bubble.className = 'message-bubble new';
        bubble.innerText = text;

        bubbleContainer.appendChild(bubble);

        var previousBubble = messageOutput.querySelector('.message-bubble.new');
        if (previousBubble) {
            previousBubble.classList.remove('new');
        }

        messageOutput.appendChild(bubbleContainer);
        messageOutput.scrollTop = messageOutput.scrollHeight;

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
        messageOutput.appendChild(indicator);
        messageOutput.scrollTop = messageOutput.scrollHeight;
    }

    function removeTypingIndicator() {
        var indicator = document.querySelector('.typing-indicator');
        if (indicator) {
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

    fetch('/messages.json')
        .then(response => response.json())
        .then(data => {
            var intros = data.intros;
            var outros = data.outros;
            var popularityMessages = data.popularityMessages;

            var textToType = intros.join("||") + "||";

            var totalPopularity = 0;
            tracks.forEach(function (track) {
                totalPopularity += track.popularity;
            });

            var avgPopularity = totalPopularity / tracks.length;

            function getSongName(tracks, position) {
                return tracks.length > position ? tracks[position].name : '';
            }

            function getArtistName(tracks, position) {
                return tracks.length > position && tracks[position].artists.length > 0 ? tracks[position].artists[0].name : '';
            }

            var messages = [];

            if (avgPopularity <= 15) {
                messages = popularityMessages["15"];
            } else if (avgPopularity <= 30) {
                messages = popularityMessages["30"];
            } else if (avgPopularity <= 70) {
                messages = popularityMessages["70"];
            } else {
                messages = popularityMessages["100"];
            }

            messages.forEach(function (message) {
                textToType += message.replace('{avgPopularity}', avgPopularity)
                    .replace('{song0}', getSongName(tracks, 0))
                    .replace('{song1}', getSongName(tracks, 1))
                    .replace('{song2}', getSongName(tracks, 2))
                    .replace('{song3}', getSongName(tracks, 3))
                    .replace('{song4}', getSongName(tracks, 4))
                    .replace('{song5}', getSongName(tracks, 5))
                    .replace('{song6}', getSongName(tracks, 6))
                    .replace('{artist0}', getArtistName(tracks, 0))
                    .replace('{artist1}', getArtistName(tracks, 1))
                    .replace('{artist2}', getArtistName(tracks, 2))
                    .replace('{artist5}', getArtistName(tracks, 5))
                    .replace('{artist9}', getArtistName(tracks, 9))
                    .replace('{artist10}', getArtistName(tracks, 10))
                    .replace('{artist28}', getArtistName(tracks, 28)) + "||";
            });

            textToType += outros.join("||") + "||";

            createTypingIndicator();

            setTimeout(function () {
                messageOutput.classList.remove('hidden');
                removeTypingIndicator();
                typeWriter(textToType, 0);
            }, 6000);
        });
});
