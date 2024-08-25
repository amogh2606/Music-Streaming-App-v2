const navbar= Vue.component('navbar', {
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
        await fetch("api/access",{
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
const home = Vue.component('home', {
    template: `
   <div class="container">
    <div class="row">
        <div class="col-md-4">
            <h2>Recommended Tracks</h2>
        </div>
        <div class="col-md-4 offset-md-4">
            <a type="button" href="/search/%" class="btn btn-success">Show More</a>
        </div>
    </div>
</div>
`
})

const songs= Vue.component('songs', {
    template: `
<div>
    <div class="container">
    <div class="row">


        <div class="col-sm-2" v-for="song in songs">
            <div class="card" style="width: 10rem;">
                <img src="https://play-lh.googleusercontent.com/y2TAEAEqGxJOV4UyXGf3JrPH5ZJR0eC_PgLUVMtaDIENQmy8FT7KrLraIRz1skytGc_5"
                     class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title">{{ song.song_name }}</h5>
                    <a  class="btn btn-outline-primary btn-sm" style="width:5" v-on:click="playSong(song.song_path)">Play</a>
                    <!--                  <audio controls>-->
                    <!--                      <source src="/uploads/3.mp3" type="audio/mpeg" style="width: 10px">-->
                    <br/>
                    <a :href="'/song/' + song.song_id" class="btn btn-outline-primary btn-sm">Lyrics</a>
                </div>
            </div>
        </div>



    </div>
</div>
<!-- <div v-if="$root.isPlaying" class="sticky-bottom" align="center" id="audiocontrol">-->
<!--        <audio controls autoplay>-->
<!--            <source :src="'/' + $root.song_path" type="audio/mpeg">-->
<!--            Your browser does not support the audio element.-->
<!--        </audio>-->
<!--    </div>-->
    </div>
`,
    data: function(){
        return {
            songs: [],
        }
    },
    mounted: async function(){
        console.log(sessionStorage.getItem('music-token'));
        const response1= await fetch("http://localhost:9000/api/music/render",{
            method: 'GET',
            headers: {
                'music-token': sessionStorage.getItem('music-token')
            }

        })
        this.songs=await response1.json();
        console.log(this.songs)
    },
    methods: {
        playSong: function(song_path){
            console.log(song_path);
            this.$root.isPlaying = false
            this.$root.isPlaying = true;
            this.$root.song_path = song_path;
            this.$root.currentComponent = 'player';
            this.$root.songChange += 1;
        }

    }
})

const playlists=Vue.component('playlists', {
    template: `
<div>
    <div class="container">
    <div class="row">
        <div class="col-md-4">
            <h2>Your Playlist</h2>
        </div>
        <div class="col-md-4 offset-md-4">
            <a href='/create/playlist' type="button" class="btn btn-success">Create New Playlist</a>
        </div>
    </div>
</div>

<div class="container">
    <div class="row">
<!--        {% for playlist in playlists %}-->
        <div class="col-sm-2" v-for="playlist in playlists">
            <div class="card" style="width: 10rem;">
                <img src="https://images.assetsdelivery.com/compings_v2/alekseyvanin/alekseyvanin1905/alekseyvanin190501805.jpg"
                     class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title">{{ playlist.playlist_name }}</h5>
                    <a :href="'/playlist/' + playlist.playlist_id" class="btn btn-outline-primary btn-sm"
                       style="width: 5">View Tracks</a>
                </div>
            </div>
        </div>
<!--        {% endfor %}-->
    </div>
</div>
`,
    data: function(){
        return {
            playlists: []
        }
    },
    mounted: async function() {
        const response = await fetch("/api/playlist/render", {
            method: 'GET',
            headers: {
                'music-token': sessionStorage.getItem('music-token')
            }
        });
        this.playlists=await response.json();
    }
})

const albums=Vue.component('albums', {
    template:
       ` <div>
    <div class="container">
    <div class="row">
        <div class="col-md-4">
            <h2>Albums</h2>
        </div>
        <div class="col-md-4 offset-md-4">
            <a type="button" href="/all/albums" class="btn btn-success">All Albums</a>
        </div>
    </div>
</div>
</br>
<div class="container">
    <div class="row">
<!--        {% for album in albums %}-->

        <div class="col-sm-2" v-for="album in albums">
            <div class="card" style="width: 10rem;">
                <img src="https://cdn-icons-png.flaticon.com/512/26/26789.png" class="card-img-top" a>
                <div class="card-body">
                    <h5 class="card-title">{{ album.album_name }}</h5>
                    <a :href="'/album/' + album.album_id" class="btn btn-outline-primary btn-sm" style="width: 5">View
                        Album</a>
                    <br/>
                </div>
            </div>
        </div>
<!--        {% endfor %}-->
    </div>
</div>
</div>
`,
    data: function(){
        return {
            albums: [],
        }
    },
    created: async function() {
        const response = await fetch("http://localhost:9000/api/album/render",{
            method: 'GET',
            headers: {
                'music-token': sessionStorage.getItem('music-token')
            }
        } );
        this.albums=await response.json();
    }
})
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

var app = new Vue({
    el: "#app",
    beforeCreate: function() {
        if (!sessionStorage.getItem('music-token')) {
            window.location.href = '/';
        }
    },
    data: {
        isPlaying: false,
        song_path: '',
        currentComponent:'',
        songChange: 0
    }

})