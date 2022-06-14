var browse = null;
var market = "DE";
var browseHistory = [];
var browseHistoryPos = 0;

function addToHistory(browse) {
    browseHistory = browseHistory.slice(0, browseHistoryPos + 1);
    browseHistoryPos = browseHistory.push(browse) - 1;
}

function backInHistory() {
    if (browseHistoryPos > 0) {browseHistoryPos--;}
    browse = Object.assign(browseHistory[browseHistoryPos]);
    refreshBrowse();
}

function forwardInHistory() {
    if (browseHistoryPos < browseHistory.length - 1) {browseHistoryPos++;}
    browse = Object.assign(browseHistory[browseHistoryPos]);
    refreshBrowse();
}

function showingCurrentContext() {
    if (playerData.context == undefined || playerData.context == null) {return false;}
    return browse.uri == playerData.context.uri;
}

$(document).ready(function() {
    $(".browse-history-back").on("click", function() {
        backInHistory();
    });
    $(".browse-history-forward").on("click", function() {
        forwardInHistory();
    })
});

function startContext(track) {
    if (browse == null || browse.uri == null || browse.uri == undefined || browse.uri == "") {return}
    let uri = browse.uri;
    let offset = track.offset;
    if (browse.type == "artist") {
        let uris = [];
        browse.tracks.forEach(element => {
            uris.push(element.uri);
        });
        startPlay(uris, offset);
    } else {
        startPlay(uri, offset);
    }
}

function openCurrentContext() {
    if(playerData.context == undefined || playerData.context == null) {return;}
    openBrowse(playerData.context.uri);
}

function openBrowse(uri) {
    console.log("opening...", uri);
    if(browse != null && browse.uri == uri) {changeTabTo("browse"); refreshBrowse(); return;}
    let destination = uri.split(":");
    requestApi(destination[1] + "s/" + destination[2], function(data, status) {
        if (status == 200) {
            browse = Object.assign(data);
            addToHistory(browse);
            console.log(browseHistory);
            changeTabTo("browse");
            refreshBrowse();
            if (data.type == "artist") {
                requestApi(destination[1] + "s/" + destination[2] + "/top-tracks", function(data, status) {
                    if (status == 200) {
                        browse.tracks = data.tracks;
                        refreshBrowse();
                    }
                }, "GET", null, {market: market});
                requestApi(destination[1] + "s/" + destination[2] + "/albums", function(data, status) {
                    if (status == 200) {
                        browse.albums = data.items;
                        refreshBrowse();
                    }
                }, "GET", null, {market: market, limit: 6});
            }
        }
    });
}

function refreshBrowse() {
    let type = null;
    if (browse != null && browse["type"] != undefined) {type = browse.type;}
    let cover = $(".browse-cover").html("");
    let browseType = $(".browse-type").html("");
    let name = $(".browse-name").html("");
    let info = $(".browse-info").html("");
    let content = $(".browse-content").html("");
    if (type == "artist") {
        cover.attr("src", browse.images[1].url);
        browseType.html(browse.type);
        name.html(browse.name);
        info.html(getFollower(browse));
        if(browse.tracks != undefined && browse.tracks != null) {content.append(getTrackList(browse.tracks, "browse", true, false, true, true, false, true, false, true, true, true, false, true, playerData.context == null));}
        if(browse.albums != undefined && browse.albums != null) {content.append(getAlbumList(browse.albums));}
    } else if (type == "album") {
        cover.attr("src", browse.images[1].url);
        browseType.html(browse.album_type);
        name.html(browse.name);
        info.append(artistsToHtml(browse.artists).addClass("has-text-weight-semibold"));
        info.append(" - " + getReleaseDate(browse) + " - " + getContextDuration(browse.tracks));
        content.append(getContextTable(browse));
        let copy = getHtml("section", ["section", "is-small"]);
        browse.copyrights.forEach(element => {
            copy.append(getHtml("p", ["is-size-7", "is-italic", "has-text-weight-light"], element.text));
        });
        content.append(copy);
    } else if (type == "playlist") {
        cover.attr("src", browse.images[0].url);
        browseType.html(browse.type);
        name.html(browse.name);
        info.html("");
        info.append(getHtml("p", [], browse.description));
        let bottom = getHtml("p", []);
        bottom.append(userToHtml(browse.owner));
        bottom.append(" - " + getFollower(browse) + " - " + getContextDuration(browse.tracks));
        info.append(bottom);
        content.append(getContextTable(browse));
    }
}

function getContextDuration(context) {
    let total_tracks = context.total;
    let tracks = total_tracks + " Song";
    if (total_tracks > 1) {tracks += "s";}
    let duration = 0;
    context.items.forEach(element => {
        if (element["track"] != undefined && element["track"] != null) {
            duration += element.track.duration_ms;
        } else {
            duration += element.duration_ms;
        }
    });
    return tracks + ", " + msToHrsMin(duration);
}

function getContextTable(context) {
    let isPlaylist = false;
    if (context.type == "playlist") {isPlaylist = true;}
    return getTrackList(context.tracks.items, "browse", isPlaylist, !isPlaylist, isPlaylist, true, true, isPlaylist, isPlaylist, !isPlaylist, true, true, isPlaylist, true, showingCurrentContext());
}

function getFollower(obj) {
    if (obj["followers"] == undefined || obj["followers"] == null) {return "";}
    let result = formatBigNumber(obj.followers.total) + " Follower";
    if (obj.followers.total > 1) {result += "s"};
    return result;
}

function msToHrsMin(millis) {
    let sec = (millis - (millis % 1000)) / 1000;
    let min = (sec - (sec % 60)) / 60;
    let hrs = (min - (min % 60)) / 60;
    sec = sec % 60;
    min = min % 60;
    return hrs + " Hrs. " + min + " Min.";
}

function formatBigNumber(number) {
    let numberStr = number.toString();
    let result = "";
    for (let i = numberStr.length; i > 0; i--) {
        result += numberStr.charAt(numberStr.length - i);
        if (i % 3 == 1 && i != 1) {result += ",";}
    }
    return result;
}

function getReleaseDate(album) {
    let release = new Date(album.release_date);
    return release.getFullYear();
}