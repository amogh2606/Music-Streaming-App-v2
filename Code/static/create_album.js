const nav_bar = Vue.component('nav_bar', {
    template:`
    <div class="container">
    <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
      <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
        <svg class="bi me-2" width="40" height="32"><use xlink:href="#bootstrap"></use></svg>
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
  </div>`
})

const Album = Vue.component('Album', {
    data: function() {
        return {
            songs: [],
            albumName: '',
            selectedSongs: {}
        }
    },
    template: `
<!--    <div>-->
<!--        <form @submit.prevent="createAlbum">-->
<!--            <div>-->
<!--                <label for="albumName">Album Name:</label>-->
<!--                <input type="text" id="albumName" v-model="albumName" required>-->
<!--            </div>-->
<!--            <div v-for="song in songs">-->
<!--                <input type="checkbox" :id="song.id" :value="song.id" v-model="selectedSongs">-->
<!--                <label :for="song.id">{{ song.name }}</label>-->
<!--            </div>-->
<!--            <button type="submit">Create Album</button>-->
<!--        </form>-->
<!--    </div>-->
    <form method="post" @submit.prevent="createAlbum">
<div class="container">
    <div class="row">
        <div class="col-md-4">
            <h2>New Album</h2>
</div>
        <div class="col-md-4 offset-md-4">
    <input type="text" class="form-control" placeholder="Enter Album Name" name="album_name" v-model="albumName" required>
        </div>
    </div>
    <div v-for="(song,index) in songs">
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
        await fetch('/api/album',{
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
        createAlbum: async function() {
            console.log('function called')
            const data = { name: this.albumName, songs: this.selectedSongs };
            console.log(data);
            console.log(JSON.stringify(data));

            await fetch('/api/album', {
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
            window.location.href = "/creator/dashboard";
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
                if (data.access === 'User' || data.access === 'Admin') {
                    alert('You are not authorized to view this page');
                    window.location.href = '/';
                }
            });
    }
})
