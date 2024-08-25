const nav_bar = Vue.component('nav_bar', {
    template: `
<div class="container">
    <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
        <a href="/creator/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
            <svg class="bi me-2" width="40" height="32">
                <use xlink:href="#bootstrap"></use>
            </svg>
            <span class="fs-4">Creator Account</span>
        </a>

        <ul class="nav nav-pills">
            <li class="nav-item"><a href="/upload/song" class="nav-link" aria-current="page">Upload Song</a></li>
            <li class="nav-item"><a href="#" class="nav-link">|</a></li>
            <li class="nav-item"><a href="/user" class="nav-link">User Account</a></li>
            <li class="nav-item"><a href="#" class="nav-link">|</a></li>
            <li class="nav-item"><a href="/user_logout" class="nav-link">Logout</a></li>

        </ul>
    </header>
</div>
        `
});
const upload_song = Vue.component('upload-song', {
    template: `
    <form method="post" enctype="multipart/form-data" @submit.prevent="submitForm" id="upload-song">
        <h1 align="center">Upload Song</h1>
        <div class="container">
            <div class="mb-3">
                <label for="songName" class="form-label"  >Song Name</label>
                <input type="text" class="form-control" v-model="songName" id="songName" placeholder="Song Name" name="song_name">
            </div>
            <div class="mb-3">
                <label for="artist" class="form-label" >Singer or Artist</label>
                <input type="text" class="form-control" v-model="artist" id="artist" placeholder="singer / artist" name="singer">
            </div>
            <div class="mb-3">
                <label for="releaseYear" class="form-label" >Release Year</label>
                <input type="number" class="form-control" v-model="releaseYear" id="releaseYear" placeholder="Year" name="year">
            </div>
            <div class="mb-3">
                <label for="genre" class="form-label" >Genre</label>
                <input type="text" class="form-control" id="genre" v-model="genre" placeholder="Genre" name="genre">
            </div>
            <div class="mb-3">
                <label for="songFile" class="form-label">Song File</label>
                <input type="file" class="form-control" id="songFile" @change="handleFileUpload" placeholder="file" name="song" accept=".mp3">
            </div>
            <div class="mb-3">
                <label for="lyrics" class="form-label">Lyrics</label>
                <textarea class="form-control" id="lyrics" rows="3" name="song_lyrics" v-model="lyrics"></textarea>
            </div>
        </div>
        <center>
            <button type="submit" class="btn btn-primary">Upload</button>
        </center>
    </form>
    `,
    data: function() {
        return {
            songName: '',
            artist: '',
            releaseYear: null,
            genre: '',
            song: null,
            lyrics: ''
        }
    },
    methods: {
        handleFileUpload(event) {
            this.song = event.target.files[0];
        },
        async submitForm() {
            let formData = new FormData();
            console.log(formData);
            formData.append('song_name', this.songName);
            formData.append('singer', this.artist);
            formData.append('year', this.releaseYear);
            formData.append('genre', this.genre);
            formData.append('song', this.song);
            formData.append('song_lyrics', this.lyrics);

            await fetch('/api/music', {
                method: 'POST',
                headers: {
                    'music-token': sessionStorage.getItem('music-token')
                },
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    // handle success
                })
                .catch(error => {
                    console.error(error);
                    // handle error
                });
            window.location.href = "/creator/dashboard";
        }
    }

});

var app = new Vue({
    el: "#app",
    beforeCreate: function() {
        if (!sessionStorage.getItem('music-token')) {
            window.location.href = '/';
        }
    }
});
