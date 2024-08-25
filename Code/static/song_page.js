
const nav_bar_user= Vue.component('nav_bar_user', {
    template: `
    <div class="container">
        <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
            <a href="/home" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                <svg class="bi me-2" width="40" height="32">
                    <use xlink:href="#bootstrap"></use>
                </svg>
                <span class="fs-4"> Home </span>
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
        <span class="fs-4">Administrator Dashboard</span>
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



const song_page = Vue.component('song_page', {
    template: `
    <div class="container">
    <div class="box" align="center"
         style="width: 900px; height: auto; border: 2px solid black; padding: 10px; border-radius: 20px; background-color: #F9F0FC">

        <div class="row">
            <div class="col-md-4">
                <h1>{{ this.song.song_name }}</h1>
                <h4>{{ this.song.singer }} | {{ this.song.year }} | {{ this.song.genre }}</h4>
                <h5 > Average Rating : {{ this.rating }} </h5>
            </div>
<!--{% if flag %}-->
            <div class="col-md-4 offset-md-4">
                <br/>
                <form method="post" @submit.prevent="submitRating(song.song_id)" > 
                    <label for="customRange3" class="form-label">Rate the song out of 5</label>
                    <input type="range" class="form-range" min="0" max="5" step="1" id="customRange3" v-model="myrating" name="rating">
                    <h5>0&emsp;&emsp;1 &emsp;&emsp;2 &emsp;&ensp;3 &emsp;&ensp; 4&emsp;&ensp;&ensp;5</h5>
                    <button class="btn btn-warning">&emsp;&emsp;Rate&emsp;&emsp;</button>
                </form>
            </div>
<!-- {% endif %}-->
        </div>

        <div class="row">
            <div class="col-md-4">
                <a type="button" class="btn btn-outline-secondary" v-on:click="playSong">Play Song</a>
            </div>
        </div>

        <br/>
        <br/>
        <div class="box" align="center"
             style="width: 700px; height: auto; border: 2px solid black; padding: 10px; margin-bottom:75px; border-radius: 20px; background-color: #F9F0FC">
            <h5>{{ this.song.song_lyrics }}</h5>

        </div>
    </div>
        <div  v-if="isPlaying" class="sticky-bottom" align="center" id="audiocontrol">
        <audio controls autoplay>
            <source :src="'/' + this.song.song_path" type="audio/mpeg">
<!--            Your browser does not support the audio element.-->
        </audio>
    </div>
<!--    <player v-if="isPlaying"></player>-->
</div>


`,
    data: function () {
        return {
            song: {},
            rating: '',
            myrating:3,
            isPlaying: false
        }
    },
    mounted: async function () {
        const pathArray = window.location.pathname.split('/');
        const parameter = pathArray[pathArray.length - 1];
        // console.log(parameter); // This will log '2' to the console
        await fetch('/api/music/' + parameter, {
            method: 'GET',
            headers: {
                'music-token': sessionStorage.getItem('music-token')
            }
        })
            .then(response => response.json())
            .then(data => {
                this.song = data
            });
        // console.log(this.song);
        const rate=await fetch('/api/rating/' + parameter, {

            method: 'GET',
            headers: {
                'music-token': sessionStorage.getItem('music-token')
            }
        });
        this.rating=await rate.json();
        // console.log(this.rating);

    },
    methods: {
        submitRating: async function (song_id) {
            // console.log(parameter); // This will log '2' to the console
            await fetch('/api/rating/' + song_id, {
                method: 'POST',
                headers: {
                    'music-token': sessionStorage.getItem('music-token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({rating: this.myrating})
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                });
            alert("You have rated this song " + this.myrating+"/5");
            await fetch('/api/rating/' + this.song.song_id, {

                    method: 'GET',
                    headers: {
                        'music-token': sessionStorage.getItem('music-token')
                    }
                }).then(response => response.json())
                    .then(data => {
                        this.rating = data;
                    });
            console.log(this.rating);
            // const rate=await fetch('/api/rating/' + parameter, {
            //
            //     method: 'GET',
            //     headers: {
            //         'music-token': sessionStorage.getItem('music-token')
            //     }
            // });
            // this.rating=rate.json();
            // console.log(this.rating);

        },
        playSong: function () {
            this.isPlaying = true;
        }
    }

})


var app = new Vue({
    el: "#app",
    data: {
        access: '',
        navbarComponent:''
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