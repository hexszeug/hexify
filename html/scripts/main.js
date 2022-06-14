var worker = undefined;

var PLAYING;

function changeTabTo(mode) {
    $(".mode-tabs").find("[data-mode=" + mode + "]").trigger("click");
}

function startWorker() {
    if (access_token != "") {
        worker = setInterval(refreshPlayer, 500);
    }
}

function loggedIn() {
    $(".only-logged-in").removeClass("only-logged-in");
    $("#logIn").html("Relog in");
    refreshApp();
    startWorker();
}

$(window).blur(function() {
    clearInterval(worker);
});

$(window).focus(function() {
    startWorker();
});

$(document).ready(function() {
    PLAYING = getHtml("figure", ["image", "is-24x24"], getHtml("img", [], "", {src: "https://open.scdn.co/cdn/images/equaliser-animated-green.f93a2ef4.gif"}));
    $(".navbar-burger").on("click", function() {
        if ($(this).hasClass("is-active")) {
            $(this).removeClass("is-active");
            $(".navbar-menu").removeClass("is-active");
        } else {
            $(this).addClass("is-active");
            $(".navbar-menu").addClass("is-active");
        }
    });

    $("#account").on("click", function() {
        $("#accountModal").addClass("is-active");
    });
    $(".modal-background,.modal-close").on("click", function() {
        $(this).parent(".modal").removeClass("is-active");
    });

    $("#logIn").on("click", function() {
        $(this).addClass("is-loading");
        requestCode();
    });
    $("#refreshAccessToken").on("click", function() {
        $(this).addClass("is-loading");
        refreshAccessToken();
        setTimeout(function(elm) {
            $(elm).removeClass("is-loading");
            $(elm).attr("disabled", "");
            $(elm).html("Refreshed");
        }, 500, this);
        setTimeout(function(elm) {
            $(elm).removeAttr("disabled");
            $(elm).html("Refresh token")
        }, 2000, this);
    });

    $("#player").find(".cover-medium").on("click", function() {
        $("#coverModal").addClass("is-active");
    });
    $("#player").find(".close-medium-cover").on("click", function() {
        $("#player").find(".opened-medium-cover").addClass("is-hidden");
        $("#player").find(".closed-medium-cover").removeClass("is-hidden");
    });
    $("#player").find(".open-medium-cover").on("click", function() {
        $("#player").find(".opened-medium-cover").removeClass("is-hidden");
        $("#player").find(".closed-medium-cover").addClass("is-hidden");
    });
    $("#player").find(".opened-medium-cover").on("mouseover", function() {
        $("#player").find(".close-medium-cover").removeClass("is-hidden");
    }).on("mouseout", function() {
        $("#player").find(".close-medium-cover").addClass("is-hidden");
    });
    $("#player").find(".closed-medium-cover").on("mouseover", function() {
        $("#player").find(".open-medium-cover").removeClass("is-hidden");
    }).on("mouseout", function() {
        $("#player").find(".open-medium-cover").addClass("is-hidden");
    });

    $(".mode-tabs").find("a").parent().on("click", function() {
        $(".mode-tabs").find("li").removeClass("is-active");
        $(this).addClass("is-active");
        let mode = $(this).attr("data-mode");
        $(".modes").children().addClass("is-hidden");
        $("." + mode).removeClass("is-hidden");
        $(document).scrollTop(0);
    });
});

function jsonQuery(obj) {
    if (obj == null || obj == undefined) {return null;}
    let param_keys = Object.keys(obj);
    let query = "";
    param_keys.forEach(function(element, i) {
        if (i > 0) {
            query += "&";
        }        
        query += encodeURI(element) + "=" + encodeURI(obj[element]);
    });
    return query;
}

function jsonString(obj) {
    if (obj == null || obj == undefined) {return null;}
    return JSON.stringify(obj);
}

function stringJson(str) {
    if (str == null || str == undefined || str == "") {return null;}
    return JSON.parse(str);
}

function getTags(track) {
    let result = getHtml("span", []);
    if (track.explicit) {result.append(getHtml("span", ["tag", "is-dark"], "E"));}
    result.append(" ");
    return result;
}

function getTrackList(tracks, play_type, index, track_number, cover, name, artists, album, added, monthly, duration, menu, is_playlist=false, header=true, mark_current_track=false) {
    let table = getHtml("table", ["table", "track-list", "is-hoverable", "is-fullwidth"]);
    if (header) {
        let head = getHtml("tr", ["is-uppercase"]);
        //head
        if (index) {head.append(getHtml("th", [], "#"));}
        if (track_number) {head.append(getHtml("th", [], "#"));}
        if (cover || name || artists) {head.append(getHtml("th", [], "Title"));}
        if (album) {head.append(getHtml("th", [], "Album"));}
        if (added) {head.append(getHtml("th", [], "Added"));}
        if (monthly) {head.append(getHtml("th", [], "Monthly"));}
        if (duration) {head.append(getHtml("th", [], "Dur"))};
        if (menu) {head.append(getHtml("th", [], ""));}
        //head
        table.append(getHtml("thead").append(head));
    }
    let body = getHtml("tbody");
    tracks.forEach(function(item, i) {
        let track = item;
        if (is_playlist) {track = item.track;}
        let row = getHtml("tr", ["track", "is-hoverable", "is-clickable", play_type], "", {"data-json": jsonString(track)}, true);
        track.offset = i;
        let isCurrentTrack = playerData.item.id == track.id;
        let playing = isCurrentTrack && mark_current_track;
        if (playing) {row.addClass("has-background-grey-lighter").addClass("is-selected");}
        //body
        if (index) {
            if(!playing) {row.append(getHtml("td", ["is-narrow"], i + 1));}
            else {row.append(getHtml("td", ["is-narrow"], PLAYING));}
        }
        if (track_number) {
            if(!playing) {row.append(getHtml("td", ["is-narrow"], track.track_number));}
            else {row.append(getHtml("td", ["is-narrow"], PLAYING));}
        }
        if (cover || name || artists) {
            let cell = getHtml("td", []);
            let columns = getHtml("div", ["columns", "is-vcentered"]);
            if (cover) {
                columns.append(getHtml("div", ["column", "is-narrow"], getHtml("img", [], "", {src: track.album.images[2].url}).css("height", "60px")));
            }
            if (name || artist) {
                let column = getHtml("div", ["column", "is-narrow"]);
                column.append(getHtml("p", ["text", "has-text-weight-semibold"], songToHtml(track, false)));
                let bottom = getHtml("p", ["text"]);
                bottom.append(getTags(track));
                if (artists) {
                    bottom.append(artistsToHtml(track.artists));
                }
                column.append(bottom);
                columns.append(column);
            }
            cell.append(columns);
            row.append(cell);
        }
        if (album) {row.append(getHtml("td", [], albumToHtml(track.album)));}
        if (added) {row.append(getHtml("td", [], "Coming soon..."));}
        if (monthly) {row.append(getHtml("td", [], "Coming soon..."));}
        if (duration) {row.append(getHtml("td", ["is-narrow"], msToMinSec(track.duration_ms)));}
        if (menu) {row.append(getHtml("td", ["is-narrow"], menuHtml()));}
        //head
        body.append(row);
    });
    table.append(body);
    return table;
}

function getArtistList(artists) {
    let columns = getHtml("div", ["columns", "is-multiline", "is-1"]);
    artists.forEach(element => {
        let column = getHtml("div", ["column", "is-2", "is-fullheight"]);
        let box = getHtml("div", ["box", "has-background-light", "artist", "is-clickable", "is-fullwidth"], "", {"data-json": jsonString(element)}, true);
        if (element.images == null || element.images == undefined || element.images[0] == undefined) {
            box.append('<svg width="256" height="256" viewBox="0 0 80 79" xmlns="http://www.w3.org/2000/svg"><title>Artist Icon</title><path d="M53.043 50.486L46.68 46.83c-.636-.366-1.074-.99-1.2-1.716-.125-.725.077-1.462.555-2.02l5.178-6.072c3.287-3.84 5.097-8.743 5.097-13.803V21.24c0-5.85-2.447-11.497-6.716-15.5C45.266 1.686 39.596-.343 33.66.048c-11.12.718-19.83 10.326-19.83 21.87v1.3c0 5.063 1.81 9.964 5.096 13.802l5.18 6.074c.476.558.678 1.295.553 2.02-.127.723-.563 1.35-1.202 1.717l-12.697 7.3C4.124 57.9 0 64.982 0 72.61v5.92h2.97v-5.92c0-6.562 3.548-12.653 9.265-15.902l12.702-7.3c1.407-.81 2.372-2.19 2.65-3.788.276-1.598-.17-3.22-1.222-4.454l-5.18-6.077C18.356 31.787 16.8 27.57 16.8 23.216v-1.3c0-9.982 7.49-18.287 17.05-18.906 5.124-.326 9.99 1.41 13.712 4.9 3.727 3.493 5.778 8.227 5.778 13.332v1.977c0 4.352-1.557 8.57-4.385 11.872l-5.18 6.074c-1.05 1.234-1.496 2.858-1.22 4.456.278 1.597 1.242 2.977 2.647 3.785l4.51 2.59c1.048-.61 2.16-1.12 3.33-1.51zM66.84 37.133v22.71c-2.038-2.203-4.942-3.592-8.17-3.592-6.143 0-11.14 5-11.14 11.14 0 6.143 4.996 11.14 11.14 11.14 6.142 0 11.14-4.997 11.14-11.14V42.28l8.705 5.027L80 44.732l-13.16-7.6zM58.67 75.56c-4.504 0-8.17-3.664-8.17-8.17 0-4.504 3.664-8.168 8.17-8.168 4.504 0 8.168 3.664 8.168 8.17 0 4.504-3.664 8.168-8.17 8.168z" fill="currentColor" fill-rule="evenodd"></path></svg>')
        } else {
            box.append(getHtml("figure", ["image", "is-256x256"], getHtml("img", ["is-rounded"], "", {src: element.images[0].url})));
        }
        box.append(getHtml("p", ["is-size-6", "has-text-weight-semibold", "is-clipped"], element.name, {title: element.name}));
        box.append(getHtml("p", ["is-capitalized"], element.type, {title: element.type}));
        column.append(box);
        columns.append(column);
    });
    return columns;
}

function getAlbumList(albums) {
    let columns = getHtml("div", ["columns", "is-multiline", "is-1"]);
    albums.forEach(element => {
        let column = getHtml("div", ["column", "is-2", "is-fullheight"]);
        let box = getHtml("div", ["box", "has-background-light", "album", "is-clickable", "is-fullwidth"], "", {"data-json": jsonString(element)}, true);
        box.append(getHtml("figure", ["image", "is-256x256"], getHtml("img", [], "", {src: element.images[1].url})));
        box.append(getHtml("p", ["is-size-6", "has-text-weight-semibold", "is-clipped"], element.name, {title: element.name}));
        box.append(getHtml("p", [], artistsToHtml(element.artists)));
        column.append(box);
        columns.append(column);
    });
    return columns;
}

function getPlaylistList(playlists) {
    let columns = getHtml("div", ["columns", "is-multiline", "is-1"]);
    playlists.forEach(element => {
        let column = getHtml("div", ["column", "is-2", "is-fullheight"]);
        let box = getHtml("div", ["box", "has-background-light", "playlist", "is-clickable", "is-fullwidth"], "", {"data-json": jsonString(element)}, true);
        if (element.images[0] != undefined) {
            box.append(getHtml("figure", ["image", "is-256x256"], getHtml("img", [], "", {src: element.images[0].url})));
        }
        box.append(getHtml("p", ["is-size-6", "has-text-weight-semibold", "is-clipped"], element.name, {title: element.name}));
        let user = getHtml("p", []);
        user.append("By ");
        user.append(userToHtml(element.owner));
        box.append(user);
        column.append(box);
        columns.append(column);
    });
    return columns;
}