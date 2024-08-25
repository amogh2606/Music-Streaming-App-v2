const nav_bar = Vue.component('nav_bar', {
    template: `
    <div class="container">
    <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
        <a href="/creator/dashboard" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
            <svg class="bi me-2" width="40" height="32">
                <use xlink:href="#bootstrap"></use>
            </svg>
            <span class="fs-4">Creator Account</span>
        </a>

        <ul class="nav nav-pills">
            <li class="nav-item"><a href="/upload/song" class="nav-link" aria-current="page">Upload Song</a></li>
            <li class="nav-item"><a href="#" class="nav-link">|</a></li>
            <li class="nav-item"><a href="/home" class="nav-link">User Account</a></li>
            <li class="nav-item"><a href="#" class="nav-link">|</a></li>
            <li class="nav-item"><a href="/user_logout" class="nav-link">Logout</a></li>

        </ul>
    </header>
</div>
`
    
})

const statistics = Vue.component('statistics', {
    template: `
   <div class="box"
     style="border-radius: 20px;border: 2px solid black; padding-bottom: 30px;text-align: center;margin: 10px">
    <h1>&emsp;Dashboard</h1>
    <br/>
    <div class="container">
        <div class="row">
            <div class="col-md-4">
                <div class="box"
                     style="border: 1px solid black; border-radius: 20px; background-color: mediumaquamarine; padding-top: 10px">
                    <h3>Total Songs </h3>
                    <h3> Uploaded</h3>
                    <h1>{{ n }}</h1>
                </div>
            </div>
            <div class="col-md-4">
                <div class="box"
                     style="border: 1px solid black; border-radius: 20px; background-color: lightsalmon; padding-top: 10px;text-align: center">
                    <h3>Average</h3>
                    <h3> Rating&nbsp;</h3>
                    <h1>{{ r }}</h1>
                </div>
            </div>
            <div class="col-md-4">
                <div class="box"
                     style="border: 1px solid black; border-radius: 20px; background-color: lightsteelblue ; padding-top: 10px; text-align: center">
                    <h3>Total </h3>
                    <h3> Albums</h3>
                    <h1>{{ a }}</h1>
                </div>
            </div>
        </div>
    </div>
</div>
`,
    data: function(){
        return {
            n: '',
            r: '',
            a: ''
        }
    }
    ,
    mounted: async function(){
        await fetch("http://localhost:9000/api/creator/dashboard",{
            headers:{
                'music-token': sessionStorage.getItem('music-token')
            },
            method: 'GET'

        })
            .then(response => response.json())
            .then(data => {
                this.n = data.n;
                this.r = data.r;
                this.a = data.a;
            })
    }
})

const songs=Vue.component('songs', {
    template:`
    <div class="box"
     style="border-radius: 20px; border: 2px solid black;padding-top: 20px;padding-left: 10px;padding-bottom: 10px;padding-right: 10px;margin: 10px">
    <div class="row">
        <div class="col-md-4">
            <h1>Your Uploads</h1>
        </div>
        <div class="col-md-4 offset-md-4">
            <a href='/upload/song' type="button" class="btn btn-outline-info" style="justify-content: end">Upload</a>
        </div>
    </div>
<!--    {% for song in songs %}-->
    <div class="box" v-for="song in songs"
         style="border-radius: 20px; background-color: #EADDD7; padding-left:10px;border: 2px solid black;padding-top: 10px;padding-bottom: 10px; margin-bottom: 10px ">
        <div class="row">
            <div class="col-md-4">
                <h3> {{ song.song_name }}</h3>
            </div>
            <div class="col-md-4 offset-md-4">
                <a type="button" :href="'/song/' + song.song_id" class="btn btn-outline-success">View Lyrics</a>
                <a type="button" :href="'/creator/song/edit/' + song.song_id" class="btn btn-outline-primary">Edit</a>
                   <a type="button" class="btn btn-outline-danger" v-on:click="delete_song(song.song_id)">Delete</a>

            </div>
        </div>
    </div>
<!--    {% endfor %}-->
</div>
`,
    data: function(){
        return {
            songs: [],
        }
    },
    mounted: async function(){
        await fetch("/api/creator/songs",
            {
                method: 'GET',
                headers: {
                    'music-token': sessionStorage.getItem('music-token')
                }
            })
            .then(response => response.json())
            .then(data => {
                this.songs = data;
            })
    },
    methods: {
        delete_song: async function(song_id){
            console.log(song_id)
            await fetch('/api/music/' +song_id, {
                method: 'DELETE',
                headers: {
                    'music-token': sessionStorage.getItem('music-token')
                }
            }).then(response => response.json()).catch((error) => {});
            window.location.href = "/creator/dashboard";
        }
    }
})

const albums = Vue.component('albums', {
    template:`
    <div class="box"
     style="border-radius: 20px; border: 2px solid black;padding-top: 20px;padding-left: 10px;padding-bottom: 10px;padding-right: 10px;margin: 10px">
    <div class="row">
        <div class="col-md-4">
            <h1>Your Albums</h1>
        </div>
        <div class="col-md-4 offset-md-4">
            <a href='/creator/create_album' type="button" class="btn btn-outline-info" style="justify-content: end">New
                Album</a>
        </div>
    </div>
<!--    {% for album in albums %}-->
    <div class="box" v-for="album in albums"
         style="border-radius: 20px; background-color: #EADDD7; padding-left:10px;border: 2px solid black;padding-top: 10px;padding-bottom: 10px; margin-bottom: 10px">
        <div class="row">
            <div class="col-md-4">
                <h3> {{ album.album_name }}</h3>
            </div>
            <div class="col-md-4 offset-md-4">
                <a type="button" :href="'/album/' + album.album_id" class="btn btn-outline-success">View Album</a>
                <a type="button" :href="'/creator/album/edit/' + album.album_id"
                   class="btn btn-outline-primary">Edit</a>
                <a type="button" class="btn btn-outline-danger" v-on:click="delete_album(album.album_id)">Delete</a>

            </div>
        </div>
    </div>
<!--    {% endfor %}-->
</div>
`,
    data: function(){
        return {
            albums: [],
        }
    },
    mounted: function(){
        fetch("http://localhost:9000/api/creator/albums",{
            method: 'GET',
            headers: {
                'music-token': sessionStorage.getItem('music-token')
            }

        })
            .then(response => response.json())
            .then(data => {
                this.albums = data;
            })
    },
    methods: {
        delete_album: async function(album_id){
            console.log(album_id)
            await fetch(`http://localhost:9000/api/album/${album_id}`, {
                method: 'DELETE',
                headers: {
                    'music-token': sessionStorage.getItem('music-token')
                }
            })
            window.location.href = "/creator/dashboard";
        },
    }
})

var app = new Vue({
    el: "#app"

})
