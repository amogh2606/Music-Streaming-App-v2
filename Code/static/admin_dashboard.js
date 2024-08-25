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
        <li class="nav-item"><a href="/admin/tracks" class="btn btn-outline-primary" aria-current="page">Tracks</a></li>
          <li class="nav-item"><a class="nav-link">|</a></li>
        <li class="nav-item"><a href="/admin/albums" class="btn btn-outline-primary">Albums</a></li>
          <li class="nav-item"><a class="nav-link">|</a></li>
        <li class="nav-item"><a href="/user_logout" class="btn btn-danger">Logout</a></li>

      </ul>
    </header>
  </div>
  `
})

const admin_dashboard = Vue.component('admin_dashboard', {
    template:`
    <div>
<div class="container">
        <div class="row">
            <div class="col-sm-3">
                <div class="box" style="border-radius: 20px;border: 1px solid black;text-align: center;padding-bottom: 50px;padding-top: 50px; margin-bottom: 50px; background-color: burlywood">
                    <h3>Normal Users</h3>
                    <h3>{{ normal_user }}</h3>
                </div>
            </div>
            <div class="col-md-3 offset-md-1">
                <h3>App Performance</h3>
            <div class="col-md-2">
                <div class="box" style="border: 1px solid black;width: 250px; text-align: center; padding-bottom: 20px;padding-top: 20px; background-color: burlywood">
                    <h3>Tracks</h3>
                    <h4>{{ number_of_songs }}</h4>
                </div>
            </div>
            </div>
                <div class="col-md-3">
                    <h3>&ensp;</h3>
                <div class="box" style="border: 1px solid black;width: 250px;text-align: center; padding-bottom: 20px;padding-top: 20px; background-color: burlywood">
                    <h3>Albums</h3>
                    <h4>{{ number_of_albums }}</h4>
                </div>
                </div>
            <div class="col-md-2">
                <h3>&ensp;</h3>
                <div class="box" style="border: 1px solid black;width: 250px;text-align: center; padding-bottom: 20px;padding-top: 20px; background-color: burlywood">
                    <h3>Genre</h3>
                    <h4>{{ number_of_genre }}</h4>
                </div>
            </div>
            </div>

        </div>
<div class="container">
    <div class="row">
        <div class="col-sm-3">
            <div class="box" style="border-radius: 20px;border: 1px solid black;text-align: center;padding-bottom: 50px;padding-top: 50px; background-color: burlywood">
                <h3>Creators</h3>
                <h3>{{ creators }}</h3>
        </div>
    </div>
        <div class="col-sm-2">
        <h1>&ensp;&ensp;<u>Metrics</u></h1>
            <img src="/static/user_vs_playlist.png" alt="plot" >
        </div>
            <div class="col-sm-2 offset-sm-2">
                <h1>&ensp;</h1>
            <img src="/static/user_vs_uploads.png" alt="plot" >
        </div>
    </div>

            <div class="row">
           <div class="col-sm-2 offset-md-3">
                <h1>&ensp;</h1>
            <img src="/static/genre_vs_rating.png" alt="plot" >
        </div>

           <div class="col-sm-2 offset-sm-2">
                <h1>&ensp;</h1>
            <img src="/static/song_vs_rating.png" alt="plot" >
        </div>
    </div>


</div>
</div>`,
    data: function(){
        return {
            normal_user: "",
            creators: "",
            number_of_songs: "",
            number_of_albums: "",
            number_of_genre: "",
            path_of_song_vs_rating: "",
            path_of_genre_vs_rating: "",
            path_of_user_vs_uploads: "",
            path_of_user_vs_playlist: "",
        }
    },
    mounted: async function() {
        var response = await fetch("http://localhost:9000/api/admin/dashboard",
            {
                method: 'GET',
                headers: {
                    'music-token': sessionStorage.getItem('music-token')
                }
            });
        var data = await response.json();
        console.log(data);
        this.normal_user = data.no_of_users;
        this.creators = data.no_of_creators;
        this.number_of_songs = data.no_of_songs;
        this.number_of_albums = data.no_of_albums;
        this.number_of_genre = data.no_of_genres;
        this.path_of_song_vs_rating = data.path_of_song_vs_rating;
        this.path_of_genre_vs_rating = data.path_of_genre_vs_rating;
        this.path_of_user_vs_uploads = data.path_of_user_vs_uploads;
        this.path_of_user_vs_playlist = data.path_of_user_vs_playlist;
    }
})
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
                if (data.access === 'User' || data.access === 'Creator') {
                    alert('You are not authorized to view this page');
                    sessionStorage.removeItem('music-token');
                    window.location.href = '/';
                }
            });
    }
    
})