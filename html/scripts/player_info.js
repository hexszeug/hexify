var playerData = {item: {id: ""}};

function refreshApp() {
    refreshPlayer();
}

function refreshPlayer() {
    requestApi("me/player", function(data, status) {
        if (status == 200) {
            if (playerData.item == null || data.item == null) {return;}
            let last_song_id = playerData.item.id;
            playerData = data;
            if (playerData.item.id != last_song_id) {refreshSong();}
            if ($(".dropdown-menu.refresh-devices").css("display") == "block") {refreshDevices();}
            refreshProgressBar(playerData.progress_ms);
            $(".pp").addClass("is-hidden");
            if (playerData.is_playing) {
                $(".pp.pause").removeClass("is-hidden");
            } else {
                $(".pp.play").removeClass("is-hidden");
            }
            $(".shuffle").addClass("is-hidden");
            if (playerData.shuffle_state) {
                $(".shuffle.true").removeClass("is-hidden");
            } else {
                $(".shuffle.false").removeClass("is-hidden");
            }
            $(".repeat").addClass("is-hidden");
            if (playerData.repeat_state == "context") {
                $(".repeat.context").removeClass("is-hidden");
            } else if (playerData.repeat_state == "track") {
                $(".repeat.track").removeClass("is-hidden");
            } else {
                $(".repeat.off").removeClass("is-hidden");
            }
        } else {
            clearInterval(worker);
            console.warn("Player Requests Stopped: " + status);
        }
    });
}

function refreshSong() {
    let song = playerData.item;
    $(".playing-tags").html(getTags(song));
    $(".playing-song").html(songAlbumToHtml(song));
    $(".playing-artist").html(artistsToHtml(song.artists));
    $(".cover-large").attr("src", song.album.images[0].url);
    $(".cover-medium").attr("src", song.album.images[1].url);
    $(".cover-small").attr("src", song.album.images[2].url);
    refreshProgressBar(playerData.progress_ms, song.duration_ms);
    refreshBrowse();
    refreshSearchDisplay();
}

function refreshProgressBar(val, max=undefined) {
    if (seekingTo != null && !pressingSeek) {
        if (val - seekingTo < 3000 && val - seekingTo >= 0) {
            seekingTo = null;
        }
    }
    if (seekingTo == null) {
        setProgressBar(val, max);
    } else if (max != undefined) {
        if (!pressingSeek) {
            setProgressBar(seekingTo, max);
        } else {
            setProgressBar(undefined, max);
            let dot = $(".progress-dot");
            let size = dot.height();
            let dotX = dot.offset().left;
            let barX = dotX + size / 2;
            let pos = getMouseSongPosition(barX);
            setProgressBar(pos);
        }
    }
}

function setProgressBar(val, max=undefined) {
    let bar = $(".song-progress");
    if (max != undefined) {
        bar.attr("max", max);
        $(".song-duration").html(msToMinSec(max));
    }
    if (val != undefined) {
        bar.attr("value", val);
        $(".song-time").html(msToMinSec(val));
        let dot = $(".progress-dot");
        max = bar.attr("max");
        let barPosX = bar.offset().top;
        let barPosY = bar.offset().left;
        let barHeight = bar.height();
        let barWidth = bar.width();
        let dotSize = dot.height();
        let posX = barPosX - (dotSize - barHeight) / 2;
        let posY = (barPosY + (val / max) * barWidth) - dotSize / 2;
        dot.css("top", posX).css("left", posY);
    }
}

function refreshDevices() {
    requestApi("me/player/devices", function(data) {
        let devices = data.devices;
        let htmls = $(".devices").html("");
        devices.forEach(function(element, i) {
            htmls.append(deviceToHtml(element));
        });
    });
}

function msToMinSec(millis) {
    let sec = (millis - (millis % 1000)) / 1000;
    let min = (sec - (sec % 60)) / 60;
    sec = sec % 60;
    let space = "";
    if (sec < 10) {space = "0"}
    return min + ":" + space + sec;
}