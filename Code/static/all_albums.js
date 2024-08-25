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
        await fetch("/api/access",{
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


const all_albums = Vue.component('all_albums', {
    template: `
    <div class="box"
     style="border-radius: 20px; border: 2px solid black;padding-top: 20px;padding-left: 10px;padding-bottom: 10px;padding-right: 10px;margin: 10px">
    <div class="row">
        <div class="col-md-4">
            <h1>Albums</h1>
        </div>


    </div>

    <div v-if="albums.length > 0">
    <div class="box" v-for="album in albums"
         style="border-radius: 20px; background-color: #EADDD7; padding-left:10px;border: 2px solid black;padding-top: 10px;padding-bottom: 10px ; margin-bottom: 10px">
        <div class="row">
            <div class="col-md-4">
                <h3> {{ album.album_name }}</h3>
            </div>
            <div class="col-md-4 offset-md-4">
                <a type="button" :href="'/album/' + album.album_id" class="btn btn-outline-success">View Album</a>
                <!--      <a type="button" class="btn btn-outline-primary" >Play</a>-->

            </div>
        </div>
    </div>
    </div>
    <div v-else>
    <h3>No album to display</h3>
    </div>
</div>`,
    data: function(){
        return {
            albums: []
        }
    },
    mounted: async function(){
        await fetch("/api/album/all",{
            method: 'GET',
            headers: {
                'music-token': sessionStorage.getItem('music-token')
            }
        }).then(response => response.json())
            .then(data => {
                this.albums = data;
            })
    }
});

var app = new Vue({
    el: '#app'
});