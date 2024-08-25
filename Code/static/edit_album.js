const nav_bar = Vue.component('nav_bar', {
    template: `
    <div class="container">
    <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
      <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
        <svg class="bi me-2" width="40" height="32"><use xlink:href="#bootstrap"></use></svg>
        <span class="fs-4">Creator Account</span>
      </a>

      <ul class="nav nav-pills">
        <li class="nav-item"><a href="/upload/song" class="nav-link" aria-current="page">Upload Song</a></li>
          <li class="nav-item"><a href="#" class="nav-link">|</a></li>
        <li class="nav-item"><a href="/home" class="nav-link">User Account</a></li>
          <li class="nav-item"><a href="#" class="nav-link">|</a></li>
        <li class="nav-item"><a href="/logout" class="nav-link">Logout</a></li>

      </ul>
    </header>
  </div>
  `
})

const edit_album = Vue.component('edit_album', {
    data: function() {
        return {
            songs: [],
            albumName: '',
            selectedSongs: {},
            songs_not_in_album: [],
            songs_in_album : [],
            album_id: ''
        }
    },
    template: `
      <form method="post" @submit.prevent="createAlbum">
<div class="container">
    <div class="row">
        <div class="col-md-4">
            <h2>{{ albumName }}</h2>
</div>
        <div class="col-md-4 offset-md-4">
    <input type="text" class="form-control" placeholder="Enter Album Name" name="album_name" v-model="albumName"  >
        </div>
    </div>
       <div v-for="song in songs_in_album">
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
    <div v-for="song in songs_not_in_album">
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
        let pathArray = window.location.pathname.split('/');
        this.album_id = pathArray[pathArray.length - 1];
        const response = await fetch('/api/album/edit/' + this.album_id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'music-token': sessionStorage.getItem('music-token')
                }
            });
        const album = await response.json();
        this.songs = album.songs;
        this.albumName = album.album_name;
        this.songs_in_album = album.songs_in_album;
        for(let song of this.songs_in_album){
            this.selectedSongs[song.song_id] = true
        };
        this.songs_not_in_album = album.songs_not_in_album;
    },
    methods: {
        createAlbum: async function() {
            console.log('function called')
            const data = { name: this.albumName, songs: this.selectedSongs };
            console.log(data);
            console.log(JSON.stringify(data));

            await fetch('/api/album/'+ this.album_id,{
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
            window.location.href = "/creator/dashboard";
        }
    }
})

var app = new Vue({
    el: "#app",
    beforeCreate: function() {
        if (!sessionStorage.getItem('music-token')) {
            window.location.href = '/';
        }
    }
})