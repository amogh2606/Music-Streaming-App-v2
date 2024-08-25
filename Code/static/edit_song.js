const edit_song = Vue.component('edit_song', {
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
                <input type="file" class="form-control" id="songFile" placeholder="file" name="song" accept=".mp3" disabled>
            </div>
            <div class="mb-3">
                <label for="lyrics" class="form-label">Lyrics</label>
                <textarea class="form-control" id="lyrics" rows="3" name="song_lyrics" v-model="lyrics"></textarea>
            </div>
        </div>
        <center>
            <button type="submit" class="btn btn-primary">Upload</button>
        </center>
    </form>`,

    data: function () {
        return {
            songName: '',
            artist: '',
            releaseYear: null,
            genre: '',
            lyrics: '',
            songId: ''
        }
    },
    mounted: async function () {
        let pathSegments = window.location.pathname.split('/');
        this.songId = pathSegments[pathSegments.length - 1];
        const response = await fetch('/api/music/' + this.songId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'music-token': sessionStorage.getItem('music-token')
            }
        });
        const song = await response.json();
        this.songName = song.song_name;
        this.artist = song.singer;
        this.releaseYear = song.year;
        this.genre = song.genre;
        this.lyrics = song.song_lyrics;
    },
    methods: {
        async submitForm() {
            let formData = new FormData();
            console.log(formData);
            formData.append('song_name', this.songName);
            formData.append('singer', this.artist);
            formData.append('year', this.releaseYear);
            formData.append('genre', this.genre);
            formData.append('song_lyrics', this.lyrics);
            await fetch('/api/music/' + this.songId, {
                method: 'PUT',
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
                if (data.access === 'User' || data.access === 'Admin') {
                    alert('You are not authorized to view this page');
                    window.location.href = '/';
                }
            });
    }
});
