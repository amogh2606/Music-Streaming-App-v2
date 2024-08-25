const nav_bar = Vue.component('nav_bar', {
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
        <li class="nav-item"><a href="/admin/albums" class="btn btn-outline-primary">Albums</a></li>
          <li class="nav-item"><a class="nav-link">|</a></li>
        <li class="nav-item"><a href="/user_logout" class="btn btn-danger">Logout</a></li>

      </ul>
    </header>
  </div>
  `
})

const admin_tracks = Vue.component('admin_tracks', {
    template: `
    <div class="box" style="border-radius: 20px; border: 2px solid black;padding-top: 20px;padding-left: 10px;padding-bottom: 10px;padding-right: 10px;margin: 10px">
  <div class="row">
    <div class="col-md-4">
  <h1>All Tracks</h1>
    </div>

</div>
<div class="box" style="border-radius: 20px; background-color: #EADDD7; padding-left:10px;border: 2px solid black;padding-top: 10px;padding-bottom: 10px; margin-bottom: 10px " v-for="song in songs">
  <div class="row">
    <div class="col-md-4">
      <h3> {{ song.song_name }}</h3>
    </div>
    <div class="col-md-4 offset-md-4">
      <a type="button" :href="'/song/' + song.song_id" class="btn btn-outline-success" >View Lyrics</a>
      <a type="button" v-on:click="delete_song(song.song_id)"class="btn btn-outline-danger" >Delete</a>

    </div>
  </div>
  </div>
</div>
`,
    data: function(){
        return {
            songs:[]
        }
    },
    mounted: async function(){
        console.log("mounted")
        let response = await fetch('/api/admin2/songs',{
            method: 'GET',
            headers:{
                'music-token': sessionStorage.getItem('music-token')
            }
        })
        let data = await response.json()
        this.songs = data
    },
    methods:{
        delete_song: async function(song_id){
            console.log(song_id)
            await fetch(`http://localhost:9000/api/music/${song_id}`, {
                method: 'DELETE',
                headers: {
                    'music-token': sessionStorage.getItem('music-token')
                }
            })
            window.location.href = "/admin/tracks";
        }
    }
})





var app = new Vue({
    el:"#app",
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
                if (data.access === 'User' || data.access === 'Creator') {
                    alert('You are not authorized to view this page');
                    window.location.href = '/';
                }
            });
    }
})