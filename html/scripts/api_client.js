const ID_COOKIE_EXPIRES = 356 * 24 * 60 * 60 * 1000;

const SCOPES = "ugc-image-upload playlist-modify-private playlist-read-private user-read-private user-read-playback-state user-library-modify user-read-playback-position user-read-recently-played user-modify-playback-state user-read-email user-follow-modify playlist-modify-public user-follow-read user-read-currently-playing playlist-read-collaborative user-library-read user-top-read";
const REDIRECT = new URL(window.location.href).origin + "/index.html";

const AUTH = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1/";

var search_params = undefined;
var cookies = undefined;

var client_id = "";
var client_secret = "";
var code = "";
var access_token = "";
var refresh_token = "";

function readSearchParams() {
    let url = new URL(window.location.href);
    let params_raw = url.search.replace("?", "").split("&");
    let param_object = {};
    params_raw.forEach(element => {
        let param = element.split("=");
        param_object[param[0]] = param[1];
    });
    search_params = param_object;
    window.history.pushState(null, "", url.origin);
}

function readCookies() {
    let cookies_raw = document.cookie.split("; ");
    let cookies_object = {};
    cookies_raw.forEach(element => {
        let cookie = element.split("=");
        cookies_object[cookie[0]] = cookie[1];
    });
    cookies = cookies_object;
}

function setCookie(name, value, expires) {
    let date = new Date();
    date.setTime(date.getTime() + expires);
    let cookie = name + "=" + value + ";";
    cookie += "expires=" + date.toUTCString() + ";"
    cookie += "path=/;";
    cookie += "secure=1;"
    document.cookie = cookie;
}

function refreshSessionStorage() {
    window.sessionStorage.setItem("code", code);
    window.sessionStorage.setItem("access_token", access_token);
    window.sessionStorage.setItem("refresh_token", refresh_token);
}

function readSessionStorage() {
    code = window.sessionStorage.getItem("code");
    access_token = window.sessionStorage.getItem("access_token");
    refresh_token = window.sessionStorage.getItem("refresh_token");
    if (code == null) { code = "" }
    if (access_token == null) { access_token = "" }
    if (refresh_token == null) { refresh_token = "" }
}

function changeClientId() {
    client_id = $("#clientId").val();
    client_secret = $("#clientSecret").val();
    setCookie("client_id", client_id, ID_COOKIE_EXPIRES);
    setCookie("client_secret", client_secret, ID_COOKIE_EXPIRES);
}

function loadClientId() {
    if ("client_id" in cookies) {
        client_id = cookies["client_id"];
    }
    if ("client_secret" in cookies) {
        client_secret = cookies["client_secret"];
    }
    $("#clientId").val(client_id);
    $("#clientSecret").val(client_secret);
}

function requestCode() {
    changeClientId();
    let params = {
        client_id: client_id,
        client_secret: client_secret,
        response_type: "code",
        scope: SCOPES,
        redirect_uri: REDIRECT,
        show_dialog: "true"
    };
    window.location.href = AUTH + "?" + $.param(params);
}

function receiveCode() {
    if ("error" in search_params) {
        if (search_params["error"] == "") {

        } else {
            console.warn("Error: " + search_params["error"]);
        }
    }
    if ("code" in search_params) {
        code = search_params["code"];
        console.log("Received Code: " + code);
        refreshSessionStorage();
        return true;
    }
    return false;
}



$(document).ready(function () {
    readSearchParams();
    readCookies();
    readSessionStorage();

    loadClientId();
    if (receiveCode()) { fetchAccessToken(); }
    else if (refresh_token != "") { refreshAccessToken(); }
});



function fetchAccessToken() {
    let body = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT
    };
    requestAccessToken(body);
}

function refreshAccessToken(callback = undefined) {
    let body = {
        grant_type: "refresh_token",
        refresh_token: refresh_token
    };
    requestAccessToken(body, callback);
}

function requestAccessToken(body, callback = undefined) {
    let header = {
        "Authorization": "Basic " + btoa(client_id + ":" + client_secret)
    };
    let success = function (data, textStatus, xhr) {
        receiveAccessToken(data, textStatus, xhr);
        if (callback != null && callback != undefined) { callback(); }
    }
    ajaxRequest("POST", TOKEN, null, header, body, null, null, success);
}

function receiveAccessToken(data, textStatus, xhr) {
    if ("access_token" in data) {
        access_token = data["access_token"];
    }
    if ("refresh_token" in data) {
        refresh_token = data["refresh_token"];
    }
    console.log("New Access Token: " + access_token);
    console.log("Refresh Token: " + refresh_token);
    refreshSessionStorage();
    loggedIn();
}

function requestApi(key, callback, method = "GET", contentType = undefined, params = undefined, body = undefined) {
    let header = {
        "Authorization": "Bearer " + access_token
    };
    let complete = function (data, textStatus, xhr) {
        let status = xhr.status;
        if (status == 401) {
            console.warn("Access Key Expired");
            refreshAccessToken(function () { requestApi(key, callback, method, contentType, params, body) });
        } else if (callback != null && callback != undefined) {
            callback(data, status);
        }
    };
    ajaxRequest(method, API + key, contentType, header, params, body, null, null, null, complete);
}

function ajaxRequest(method, url, contentType = undefined, header = undefined, params = undefined, data = undefined, responseType = undefined, done = undefined, fail = undefined, complete = undefined) {
    if (data == null || data == undefined) { data = {}; }
    if (contentType == null || contentType == undefined || contentType == "application/x-www-form-urlencoded") {
        contentType = "application/x-www-form-urlencoded";
        data = jsonQuery(data);
    } else if (contentType == "text/json") {
        data = jsonString(data);
    }
    if (responseType == null || responseType == undefined) { responseType = "json"; }
    if (params != null && params != undefined) {
        let query = jsonQuery(params);
        if (query != "") {
            url += "?" + query;
        }
    }
    $.ajax({
        cache: false,
        contentType: contentType,
        data: data,
        dataType: responseType,
        headers: header,
        proccessData: false,
        type: method,
        url: url
    }).done(function (data, textStatus, xhr) {
        if (done != null && done != undefined) {
            done(data, textStatus, xhr);
        }
    }).fail(function (xhr, textStatus, error) {
        if (fail != null && fail != undefined) {
            fail(error, textStatus, xhr);
        }
    }).always(function (data, textStatus, xhr) {
        if (complete != null && complete != undefined) {
            complete(data, textStatus, xhr);
        }
    });
}