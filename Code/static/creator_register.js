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
const start_creator = Vue.component('start_creator', {
    template:`
<div>
<!--    <div class="container">-->
<!--    <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">-->
<!--      <a href="/creator/dashboard" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">-->
<!--        <svg class="bi me-2" width="40" height="32"><use xlink:href="#bootstrap"></use></svg>-->
<!--        <span class="fs-4">Home</span>-->
<!--      </a>-->

<!--      <ul class="nav nav-pills">-->
<!--        <li class="nav-item"><a href="/upload/song" class="nav-link" aria-current="page">Upload Song</a></li>-->
<!--          <li class="nav-item"><a class="nav-link">|</a></li>-->
<!--        <li class="nav-item"><a href="/user" class="nav-link">User Account</a></li>-->
<!--          <li class="nav-item"><a class="nav-link">|</a></li>-->
<!--        <li class="nav-item"><a href="/logout" class="nav-link">Logout</a></li>-->

<!--      </ul>-->
<!--    </header>-->
<!--  </div>-->
<div class="container">
    <h1 align="center">Kickstart your creators journey</h1>
    <br></br>
    <h2 align="center">Start with uploading songs</h2>
    <a href="/upload/song" ><img src="/static/plus.jpg" align="center" width="200" height="200" class="img-fluid rounded mx-auto d-block" alt="Upload Song" ></a>

</div>
</div>
`
})

const creator_register = Vue.component('creator_register', {
    template: `
    <div class="box" align="center" style="border-radius: 20px; width: auto;height: auto; margin: 50px; background-color: lightgrey; padding-bottom: 50px ">
   <br/>
    <h1>Register as Creator</h1>
    <br/>
    <h5 style="font-style: italic ">Create new Songs, Albums and much more</h5>
    <br/>
    <br/>
    <form method="post" v-on:submit.prevent="creator">
    <button type="submit" class="btn"  ><img src="/static/plus-new.png" alt="plus" width="150" height="150"></button>
        </form>
</div>`,
    methods:{
        creator: async function(){
            await fetch('/api/creator',{
                method: 'PATCH',
                headers:{
                    'music-token': sessionStorage.getItem('music-token')
                }
            });
            this.$root.currentComponent = 'start_creator';
        }
    }
})



var app = new Vue({
    el: "#app",
    data: {
        currentComponent: 'creator_register'
    },
    beforeCreate: function() {
        if (!sessionStorage.getItem('music-token')) {
            window.location.href = '/';
        }
    }
})
