var searcher = setTimeout(function() {});
var result = null;

$(document).ready(function() {
    $(".mode-tabs").find("[data-mode=search]").on("click", function() {
        $(".search-bar").val("").focus();
        result = null;
        refreshSearchDisplay();
    });

    $(".search-bar").on("keyup", function() {
        let q = $(this).val();
        clearTimeout(searcher);
        if (q == null || q == undefined || q == "") {
            result = null;
            refreshSearchDisplay();
        } else {
            searcher = setTimeout(function(q) {
                let params = {
                    q: q,
                    type: "album,artist,playlist,track",
                    limit: 6
                }
                requestApi("search", function(data, status) {
                    if(status == 200) {
                        result = data;
                        refreshSearchDisplay();
                    } else {
                        console.warn("searched", status);
                    }
                }, "GET", null, params);
            }, 250, q);
        }
    })
});

function refreshSearchDisplay() {
    if (result == null) {
        $(".search-content").children().html("Coming soon...");
    } else {
        $(".search-content").children(".tracks").html(getTrackList(result.tracks.items, "search", true, false, true, true, true, false, false, true, true, true, false, false, playerData.context == null));
        $(".search-content").children(".artists").html(getArtistList(result.artists.items));
        $(".search-content").children(".albums").html(getAlbumList(result.albums.items));
        $(".search-content").children(".playlists").html(getPlaylistList(result.playlists.items));
    }
}

function startSearchTrack(track) {
    let uris = []
    result.tracks.items.forEach(element => {
        uris.push(element.uri);
    });
    startPlay(uris, track.offset);
}