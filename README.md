# Hexify

Note: This is a learn by doing project to learn fetching data from REST Api's and displaying it on a webapp, so it is relativly buggy.

This is an "almost" Spotify Client, which can't stream audio from Spotify.
It uses the Spotify Developer API to provide control over the following Spotify actions:

- the player
  - pause/resume
  - skip to next/previous track
  - toggle shuffle and repeat mode
  - seek to timestamp in track
- search songs, artists, playlists and albums
- start playing songs, playlists and albums
- select the streaming device

The api app to provide access to the Spotify API is in developer state,
so I'd have to add each Spotify Account who should be able to use Hexify to the Developer App.
Due to this limitation each person who wants to use this app must create an own App at
the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
and enter the client ID and secret into Hexify. Than everyone should be able to try this app out.

Sometimes you have to start your Spotify player on a normal client before the current song shows up in hexify and the contoll buttons work.
I won't try to fix this, as this is realy just a proof of concept.
