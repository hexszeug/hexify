$(document).ready(function() {
    $("body").on("click", function(event) {
        closeContextMenu();
        let target = $(event.target);
        if (!target.hasClass("link")) {
            target = target.parents(".link");
        }
        if (target.hasClass("link")) {clickLink(target, false, event);}
    });
    $("body").on("contextmenu", function(event) {
        closeContextMenu();
        let target = $(event.target);
        if (!target.hasClass("link")) {
            target = target.parents(".link");
        }
        if (target.hasClass("link")) {clickLink(target, true, event);}
    })
})

function getHtml(tag, classes=[], html="", attrs={}, link=false) {
    if(link) {classes.push("link");}
    attrs["class"] = "";
    classes.forEach(element => {
        attrs["class"] += element + " "
    });
    let result = $("<" + tag + ">");
    result.attr(attrs);
    result.html(html);
    return result;
}

function songToHtml(song, link=true) {
    return getHtml("span", ["song"], song.name, {"data-json": jsonString(song), title: song.name}, link);
}

function songAlbumToHtml(song, link=true) {
    return getHtml("span", ["song-album"], song.name, {"data-json": jsonString(song), title: song.name}, link);
}

function artistToHtml(artist, link=true) {
    return getHtml("span", ["artist"], artist.name, {"data-json": jsonString(artist)}, link);
}

function artistsToHtml(artists, link=true) {
    let result = getHtml("span", ["comma-list"]);
    let title = "";
    artists.forEach(function(element, i) {
        if (i > 0) {result.html(result.html() + ", "); title += ", ";}
        result.append(artistToHtml(element, link))
        title += element.name;
    });
    result.attr("title", title);
    return result;
}

function albumToHtml(album, link=true) {
    return getHtml("span", ["album"], album.name, {"data-json": jsonString(album), title: album.name}, link);
}

function userToHtml(user, link=true) {
    if (user["display_name"] == null || user["display_name"] == undefined) {user.display_name = "";}
    let avatar = "";
    if (user["images"] != null && user["images"] != undefined) {
        avatar = getHtml("figure", ["image", "is-24x24"], getHtml("img", ["is-rounded"], "", {src: user.images[0].url}));
    }
    return getHtml("span", ["user"], avatar + user.display_name, {"data-json": jsonString(user), title: user.display_name}, link);
}

function deviceToHtml(device, link=true) {
    let classes = ["device", "dropdown-item"];
    if (device.is_active) {classes.push("has-text-primary");}
    else {classes.push("has-text-dark");}
    if (link) {classes.push("link")};
    return getHtml("a", classes, device.name, {"data-json": jsonString(device)}, link);
}

function menuHtml() {
    let dot = getHtml("span", [], "");
    let dots = getHtml("div", ["open-context-menu", "three-dots"], "", {"data-json": jsonString(null)}, true);
    dots.append(dot.clone());
    dots.append(dot.clone());
    dots.append(dot.clone());
    return dots;
}

// -----------------------------------------
// -----------------------------------------
// -----------------------------------------

function clickLink(link, isRight=false, event) {
    let obj = stringJson(link.attr("data-json"));
    if (link.hasClass("open-context-menu")) {
        let realLink = link.parents(".link");
        openContextMenu(stringJson(realLink.attr("data-json")), event);
    }
    if (obj == null) {return;}
    if(!isRight) {
        if (link.hasClass("device")) {transferDevice(obj);}
        if (link.hasClass("song-album")) {openBrowse(obj.album.uri);}
        if (link.hasClass("album")) {openBrowse(obj.uri);}
        if (link.hasClass("artist")) {openBrowse(obj.uri);}
        if (link.hasClass("playlist")) {openBrowse(obj.uri);}
        if (link.hasClass("track")) {startTrack(obj, link);}
        if (link.hasClass("current-context")) {openCurrentContext();}
        if (link.hasClass("queue")) {queueTrack(obj);}
    } else {
        openContextMenu(obj, event);
    }
}

function openContextMenu(obj, event) {
    if (event == null) {return;}
    let type = obj.type;
    let menuHead = $(".context-menu");
    let menu = menuHead.find(".dropdown-content").html("");
    if (type == "track") {
        menu.append(getContextMenuItem("Add to queue", ["queue"], obj));
        menu.append(getContextMenuItem("Show in Album", ["album"], obj.album));
    } else {
        return;
    }
    menuHead.addClass("is-active");
    let x = event.pageX;
    let y = event.pageY;
    let maxX = $(document).width();
    let maxY = $(document).height();
    let menuX = menu.width();
    let menuY = menu.height();
    if (x + menuX > maxX) {menuHead.addClass("is-right");}
    else {menuHead.removeClass("is-right");}
    if (y + menuY > maxY) {menuHead.addClass("is-up");}
    else {menuHead.removeClass("is-up");}
    menuHead.css("left", x).css("top", y);
    event.preventDefault();
}

function closeContextMenu() {
    $(".context-menu").removeClass("is-active");
}

function getContextMenuItem(html, classes, data) {
    let type = "a";
    if (data == null) {type = "div"}
    return getHtml(type, classes.concat(["dropdown-item"]), html, {"data-json": jsonString(data)}, data != null);
}