var pressingSeek = false;
var seekingTo = null;

function getMouseSongPosition(x) {
    let mouseX = x - $(".song-progress").offset().left;
    let normalizedX = mouseX / $(".song-progress").width();
    let max = $(".song-progress").attr("max")
    let position = Math.floor(normalizedX * max);
    if (position < 0) {position = 0;}
    if (position > max) {position = max;}
    return position;
}

$(document).ready(function() {
    $(".play").on("click", function() {
        requestApi("me/player/play", function() {}, "PUT");
    });
    $(".pause").on("click", function() {
        requestApi("me/player/pause", function() {}, "PUT");
    });
    $(".previous").on("click", function() {
        requestApi("me/player/previous", function() {}, "POST");
    });
    $(".next").on("click", function() {
        requestApi("me/player/next", function() {}, "POST");
    });
    $(".shuffle.false").on("click", function() {
        requestApi("me/player/shuffle", function() {}, "PUT", null, {"state": true});
    });
    $(".shuffle.true").on("click", function() {
        requestApi("me/player/shuffle", function() {}, "PUT", null, {"state": false});
    });
    $(".repeat.off").on("click", function() {
        requestApi("me/player/repeat", function() {}, "PUT", null, {"state": "context"});
    });
    $(".repeat.context").on("click", function() {
        requestApi("me/player/repeat", function() {}, "PUT", null, {"state": "track"});
    });
    $(".repeat.track").on("click", function() {
        requestApi("me/player/repeat", function() {}, "PUT", null, {"state": "off"});
    });

    $(".song-progress,.progress-dot").on("mousedown", function() {
        pressingSeek = true;
        $(".progress-dot").css("display", "inline");
    });
    $("body").on("mousemove", function(event) {
        if (pressingSeek) {
            let position = getMouseSongPosition(event.pageX);
            seekingTo = position;
            setProgressBar(position);
        }
    });
    $("body").on("mouseup", function(event) {
        if (pressingSeek) {
            $(".progress-dot").css("display", "");
            let position = getMouseSongPosition(event.pageX);
            setProgressBar(position);
            seekingTo = position;
            setTimeout(function() {seekingTo = null;}, 3000);
            requestApi("me/player/seek", function() {}, "PUT", null, {"position_ms": position});
            pressingSeek = false;
        }
    });
});

function transferDevice(device) {
    let body = {
        device_ids: [device.id]
    };
    console.log("Transfer to " + device.name);
    console.log(body);
    requestApi("me/player", function() {}, "PUT", "text/json", null, body);
}

function startTrack(track, elm) {
    if (elm.hasClass("browse")) {startContext(track);}
    if (elm.hasClass("search")) {startSearchTrack(track);}
}

function queueTrack(track) {
    requestApi("me/player/queue", function() {}, "POST", null, {uri: track.uri});
}

function startPlay(what, offset=0) {
    let params = {
        offset: {
            position: offset
        }
    };
    if (typeof what == "string") {
        params.context_uri = what;
    } else if (typeof what == "object") {
        params.uris = what;
    } else {
        return;
    }
    requestApi("me/player/play", function() {refreshBrowse();}, "PUT", "text/json", null, params);
}