const nav_bar= Vue.component('nav_bar', {
    template: `
    <div class="container">
        <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
            <a href="/home" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                <svg class="bi me-2" width="40" height="32">
                    <use xlink:href="#bootstrap"></use>
                </svg>
                <span class="fs-4">User Account</span>
            </a>

            <form class="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" method="post" @submit.prevent="search_func">
            <span class="input-group-text" id="basic-addon1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                       class="bi bi-search" viewBox="0 0 16 16">
  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"></path>
</svg>

          <input type="search" class="form-control" placeholder="Search..." aria-label="Search" name="search" v-model="search">
                 </span>
            </form>

            <ul class="nav nav-pills">
                <li class="nav-item" v-if="access === 'User'"><a href="/creator/" class="nav-link" aria-current="page">Creator Account</a></li>
                <li class="nav-item" v-if="access === 'Creator'"><a href="/creator/dashboard" class="nav-link" aria-current="page">Creator Account</a></li>
                <li class="nav-item"><a class="nav-link">|</a></li>
                <li class="nav-item"><a href="/user" class="nav-link">User Account Details</a></li>
                <li class="nav-item"><a class="nav-link">|</a></li>
                <li class="nav-item"><a href="/user_logout" class="nav-link">Logout</a></li>

            </ul>
        </header>
    </div>
    `,data: function(){
        return {
            search: '',
            access:''
        }
    },
    methods:{
        search_func: function(){
            console.log("searching")
            window.location.href = '/search/' + this.search;

        }
    },
    mounted: async function(){
        await fetch("/api/access",{
            method: 'POST',
            headers: {
                'music-token': sessionStorage.getItem('music-token')
            }
        }).then(response => response.json())
            .then(data => {
                this.access = data.access;
            })
    }

});

const player = Vue.component('player', {
    template: `
    <div v-if="$root.isPlaying" class="sticky-bottom" align="center" id="audiocontrol">
        <audio ref="audioPlayer" controls autoplay>
            <source :src="'/' + $root.song_path" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    </div>
    `,
    watch: {
        '$root.songChange': function () {
            this.$refs.audioPlayer.load();
        }
    }
});

const playlist = Vue.component('playlist', {
    template: `
    <div class="box" style="border-radius: 20px; border: 2px solid black;padding-top: 20px;padding-left: 10px;padding-bottom: 10px;padding-right: 10px;margin: 10px">
  <div class="row">
    <div class="col-md-4">
  <h1>{{ playlist_name }}</h1>
    </div>
      <div class="col-md-4 offset-md-4">
<!--          <h5>&ensp;</h5>-->
        <a type="button" v-on:click="edit_playlist(playlist_id)" class="btn btn-outline-primary" >Edit Playlist</a>
          <a type="button" v-on:click="delete_playlist" class="btn btn-outline-danger" >Delete Playlist</a>
      </div>

</div>
<!-- {% for song in songs %}-->
<div v-for="song in songs"class="box" style="border-radius: 20px; background-color: #EADDD7; padding-left:10px;border: 2px solid black;padding-top: 10px;padding-bottom: 10px;margin-bottom: 10px ">
  <div class="row">
    <div class="col-md-4">
      <h3> {{ song.song_name }}</h3>
    </div>
    <div class="col-md-4 offset-md-4">
      <a type="button" :href="'/song/' + song.song_id" class="btn btn-outline-success" >View Lyrics</a>
      <a type="button"   v-on:click="playSong(song.song_path)" class="btn btn-outline-primary" >Play</a>

    </div>
  </div>
  </div>
<!-- {% endfor %}-->
</div>
`,
    data: function(){
        return {
            // play :[],
            playlist_id: '',
            songs: [],
            playlist_name: ''
        }
    },
    mounted: async function() {
        let pathArray = window.location.pathname.split('/');
        this.playlist_id = pathArray[pathArray.length - 1];
        // console.log(this.playlist_id);
        let response = await fetch('/api/playlist/' + this.playlist_id, {
            method: 'GET',
            headers: {
                'music-token': sessionStorage.getItem('music-token')
            }
        });
        let playlist = await response.json();
        // console.log(playlist);
        this.play = playlist
        this.playlist_id = playlist.playlist_id
        this.songs = playlist.songs
        this.playlist_name = playlist.playlist_name
        if(this.songs === undefined){
            window.location.href = "/home";
        }
    },
    methods: {
        playSong: function(song_path){
            console.log(song_path);
            this.$root.isPlaying = false
            this.$root.isPlaying = true;
            this.$root.song_path = song_path;
            this.$root.playerComponent = 'player';
            this.$root.songChange += 1;
        },
        delete_playlist: async function() {
            await fetch('/api/playlist/' + this.playlist_id, {
                method: 'DELETE',
                headers: {
                    'music-token': sessionStorage.getItem('music-token')
                }
            })
            window.location.href = "/home";

        },

        edit_playlist: function(playlist_id) {
            this.$root.currentComponent = 'EditPlaylist';
            this.$root.playlist_id = playlist_id;
            this.$root.playlist_name = this.playlist_name;

        }
    }
})

const EditPlaylist = Vue.component('EditPlaylist', {
    data: function() {
        return {
            songs: [],
            playlistName: '',
            selectedSongs: {},
            songs_in_playlist: [],
            songs_not_in_playlist: []
        }
    },
    template: `

    <form method="post" @submit.prevent="createPlaylist">
<div class="container">
    <div class="row">
        <div class="col-md-4">
            <h2>{{ this.$root.playlist_name }}</h2>
</div>
        <div class="col-md-4 offset-md-4">
    <input type="text" class="form-control" placeholder="Enter Playlist Name" name="album_name" v-model="playlistName"  >
        </div>
    </div>
       <div v-for="song in songs_in_playlist">
<!--    {% for song in songs %}-->
    <div class="box" style="border-radius: 20px; background-color: lightgrey; padding-left:10px; margin-bottom: 10px ">
        <br/>
        <div class="row">
            <div class="col-md-4">
        <h3>{{ song.song_name }}</h3>
                </div>
            <div class="col-md-4 offset-md-4">
                <div class="form-check">
            <input class="form-check-input" type="checkbox" :value="song.id" v-model="selectedSongs[song.song_id]" :id="'flexCheckDefault' + index" name="song_id" checked="checked" >
        </div>
    </div>
</div>
    </div>
    </div>
    <div v-for="song in songs_not_in_playlist">
<!--    {% for song in songs %}-->
    <div class="box" style="border-radius: 20px; background-color: lightgrey; padding-left:10px; margin-bottom: 10px ">
        <br/>
        <div class="row">
            <div class="col-md-4">
        <h3>{{ song.song_name }}</h3>
                </div>
            <div class="col-md-4 offset-md-4">
                <div class="form-check">
            <input class="form-check-input" type="checkbox" :value="song.id" v-model="selectedSongs[song.song_id]" :id="'flexCheckDefault' + index" name="song_id">
        </div>
    </div>
</div>
    </div>
    </div>
<!--{% endfor %}-->
    <br/>
    <br/>
    <br/>
    <br/>
    <button type="submit"  class="btn btn-primary" style="align-self: center;align-content: center;align-items: center">Save</button>
</div>
</form>
    `,
    mounted: async function() {
        await fetch('/api/playlist/edit/' + this.$root.playlist_id, {
            method: 'GET',
            headers: {
                'music-token': sessionStorage.getItem('music-token')
            }
        })
            .then(response => response.json())
            .then(data => {
                this.songs_in_playlist = data.songs_in_playlist;
                this.songs_not_in_playlist = data.songs_not_in_playlist;
                for (let song of this.songs_in_playlist) {
                    this.selectedSongs[song.song_id] = true;
                };
                this.playlistName = this.$root.playlist_name
            });

        }
    ,
    methods: {
        createPlaylist: async function() {
            console.log('function called')
            const data = { name: this.playlistName, songs: this.selectedSongs };
            console.log(data);
            console.log(JSON.stringify(data));

            await fetch('/api/playlist/'+ this.$root.playlist_id,{
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'music-token': sessionStorage.getItem('music-token')
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch((error) => {
                    console.error('Error:', error);
                });
            await fetch('/api/playlist/' + this.$root.playlist_id, {
                method: 'GET',
                headers: {
                    'music-token': sessionStorage.getItem('music-token')
                }
            })
                .then(response => {
                    if (response.status === 404) {
                        window.location.href = '/home';
                    }
                    return response.json();
                })
                .catch(error => console.error('Error:', error));
            window.location.href = "/playlist/" + this.$root.playlist_id;
        }
    }

});


var app = new Vue({
    el: "#app",
    data: {
        currentSong: "",
        isPlaying: false,
        currentComponent: 'playlist',
        playerComponent:'',
        playlist_id:'',
        playlist_name: '',
        song_path: '',
        songChange: 0,
        songs:[],
        msg:''
    },
    beforeCreate: function() {
        if (!sessionStorage.getItem('music-token')) {
            window.location.href = '/';
        }
    }
})