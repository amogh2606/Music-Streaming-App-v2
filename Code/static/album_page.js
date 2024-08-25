const nav_bar_user= Vue.component('nav_bar_user', {
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
                <li class="nav-item" v-if="this.$root.access === 'User'"><a href="/creator/" class="nav-link" aria-current="page">Creator Account</a></li>
                <li class="nav-item" v-if="this.$root.access === 'Creator'"><a href="/creator/dashboard" class="nav-link" aria-current="page">Creator Account</a></li>
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
    }


});

const nav_bar_admin = Vue.component('nav_bar_admin', {
    template: `
<div class="container">
    <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
      <a href="/admin/dashboard" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
        <svg class="bi me-2" width="40" height="32"><use xlink:href="#bootstrap"></use></svg>
        <span class="fs-4">Administrator</span>
      </a>



      <ul class="nav nav-pills">
          
          <li class="nav-item"><a href="/admin/users" class="btn btn-outline-primary" aria-current="page">Users</a></li>
          <li class="nav-item"><a class="nav-link">|</a></li>
        <li class="nav-item"><a href="/admin/dashboard" class="btn btn-outline-primary" aria-current="page">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link">|</a></li>
        <li class="nav-item"><a href="/admin/tracks" class="btn btn-outline-primary">Tracks</a></li>
          <li class="nav-item"><a class="nav-link">|</a></li>
        <li class="nav-item"><a href="/admin/logout" class="btn btn-danger">Logout</a></li>

      </ul>
        </header>
    </div>
    `})



const album = Vue.component('album', {
    template: `
    <div class="box" style="border-radius: 20px; border: 2px solid black;padding-top: 20px;padding-left: 10px;padding-bottom: 10px;padding-right: 10px;margin: 10px">
  <div class="row">
    <div class="col-md-4">
  <h1>{{ album_name }}</h1>
    </div>

</div>
<!-- {% for song in songs %}-->
<div v-for="song in songs" class="box" style="border-radius: 20px; background-color: #EADDD7; padding-left:10px;border: 2px solid black;padding-top: 10px;padding-bottom: 10px;margin-bottom: 10px ">
  <div class="row">
    <div class="col-md-4">
      <h3> {{ song.song_name }}</h3>
    </div>
    <div class="col-md-4 offset-md-4">
      <a type="button" :href="'/song/' + song.song_id" class="btn btn-outline-success" >View Lyrics</a>
      <a type="button"  v-on:click="playSong(song.song_path)" class="btn btn-outline-primary" >Play</a>

    </div>
  </div>
  </div>
<!-- {% endfor %}-->
</div>
`,
    data: function(){
        return {
            album_id: '',
            songs: [],
            album_name: ''
        }
    },
    mounted: async function() {
        let pathArray = window.location.pathname.split('/');
        this.album_id = pathArray[pathArray.length - 1];
        const response = await fetch('/api/album/' + this.album_id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'music-token': sessionStorage.getItem('music-token')
                }
            });
        const album = await response.json();
        this.songs = album.songs;
        this.album_name = album.album_name;
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
    data: {
        currentSong: "",
        isPlaying: false,
        song_path: '',
        currentComponent:'',
        songChange: 0,
        access: '',
        navbarComponent: ''
    },
    beforeCreate: function() {
        if (!sessionStorage.getItem('music-token')) {
            window.location.href = '/';
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

        if(this.access==='User' || this.access==='Creator'){
            this.navbarComponent='nav_bar_user';
        };
        if(this.access==='Admin'){
            this.navbarComponent='nav_bar_admin';
        }
    }
})