var playlists = null;

$(document).ready(function() {
    $(".mode-tabs").find("[data-mode=libary]").on("click", function() {
        if (playlists == null) {
            openLibary();
        } else {
            refreshLibary();
        }
    });
});

function openLibary() {
    loadPlaylists();
}

function loadPlaylists(offset=0) {
    requestApi("me/playlists", function(data, status) {
        if (status == 200) {
            if (data.offset == 0) {playlists = [];}
            playlists = playlists.concat(data.items);
            if (data.total > data.items.length + data.offset) {
                loadPlaylists(data.offset + data.limit);
            } else {
                refreshLibary();
            }
        }
    }, "GET", null, {limit: 50, offset: offset});
}

function refreshLibary() {
    $(".libary").html("");
    if (playlists != null) {
        $(".libary").append(getPlaylistList(playlists));
    }
}