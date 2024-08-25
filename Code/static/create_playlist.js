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

const Playlist = Vue.component('Playlist', {
    data: function() {
        return {
            songs: [],
            playlistName: '',
            selectedSongs: {}
        }
    },
    template: `

    <form method="post" @submit.prevent="createPlaylist">
<div class="container">
    <div class="row">
        <div class="col-md-4">
            <h2>New Playlist</h2>
</div>
        <div class="col-md-4 offset-md-4">
    <input type="text" class="form-control" placeholder="Enter Playlist Name" name="playlist_name" v-model="playlistName" required>
        </div>
    </div>
    <div v-for="song in songs">
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
    <button type="submit"  class="btn btn-primary" style="align-self: center;align-content: center;align-items: center">Add</button>
</div>
</form>
    `,
    mounted: async function() {
        await fetch('/api/music',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'music-token': sessionStorage.getItem('music-token')
            }
        })
            .then(response => response.json())
            .then(data => {
                this.songs = data;
            });
    },
    methods: {
        createPlaylist: async function() {
            console.log('function called')
            const data = { name: this.playlistName, songs: this.selectedSongs };
            console.log(data);
            console.log(JSON.stringify(data));

            await fetch('/api/playlist', {
                method: 'POST',
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
            window.location.href = "/home";
        }
    }
});

var app = new Vue({
    el: '#app',
    beforeCreate: async function() {
        if (!sessionStorage.getItem('music-token')) {
            window.location.href = '/';
        };
        await fetch('/api/access',
            {
                method: 'POST',
                headers: {
                    'music-token': sessionStorage.getItem('music-token')
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.access === 'Admin' ) {
                    alert('You are not authorized to view this page');
                    window.location.href = '/';
                }
            });
    },
    data:{
        currentSong: "",
        isPlaying: false,
        song_path: '',
        currentComponent:'',
        songChange: 0
    }
});