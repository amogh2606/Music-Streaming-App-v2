const nav_bar = Vue.component('nav_bar', {
    template: `
    <div class="container">
    <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
      <a href="/admin/dashboard" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
        <svg class="bi me-2" width="40" height="32"><use xlink:href="#bootstrap"></use></svg>
        <span class="fs-4">Administrator</span>
      </a>

      <ul class="nav nav-pills">
         
          <li class="nav-item"><a href="/admin/dashboard" class="btn btn-outline-primary" aria-current="page">Dashboard</a></li>
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

const users = Vue.component('users', {
    template: `
    <div class="box" style="border-radius: 20px; border: 2px solid black;padding-top: 20px;padding-left: 10px;padding-bottom: 10px;padding-right: 10px;margin: 10px">
  <div class="row">
    <div class="col-md-4">
  <h1>Users</h1>
    </div>
  <div class="col-md-4 offset-md-4">

</div>
</div>
<!-- {% for user in users %}-->
<div class="box" v-for="user in users" style="border-radius: 20px; background-color: #EADDD7; padding-left:10px;border: 2px solid black;padding-top: 10px;padding-bottom: 10px;margin-bottom: 10px ">
  <div class="row">
    <div class="col-md-4">
      <h3> {{ user.username }}</h3>
    </div>
    <div class="col-md-4 offset-md-4">
<!--{% if user.blacklist >= 2 %}-->

<!--{% endif %}-->
          <a v-if="user.active === true" type="button" v-on:click="blacklist(user.id)"class="btn btn-outline-danger" >Blacklist</a>

        <a v-else type="button" v-on:click="blacklist(user.id)" class="btn btn-outline-success" > Revoke </a>
<!--{% else %}-->
     
<!--{% endif %}-->
        <a type="button" v-on:click="delete_user(user.id)"class="btn btn-outline-danger" >Delete User</a>
    </div>
  </div>
  </div>
<!-- {% endfor %}-->
</div>`
,

    data: function(){
        return {
            users: []
        }
    },
mounted: async function(){
        let response = await fetch('/api/admin2/users',{
            method: 'GET',
            headers:{
                'Content-Type': 'application/json',
                'music-token': sessionStorage.getItem('music-token')
            }
        })
        let data = await response.json()
        this.users = data
    },
methods:{
    delete_user : async function(user_id){
        console.log(user_id)
        await fetch('/api/admin/' + user_id,{
            method: 'DELETE',
            headers:{
                'Content-Type': 'application/json',
                'music-token': sessionStorage.getItem('music-token')
            }
        })
        window.location.href = "/admin/users";
    },
    blacklist: async function(user_id){
        await fetch('/api/admin/' + user_id,{
            method: 'PATCH',
            headers:{
                'Content-Type': 'application/json',
                'music-token': sessionStorage.getItem('music-token')
            }
        })
        window.location.href = "/admin/users";
    },
}
})

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
                if (data.access === 'User' || data.access === 'Creator') {
                    alert('You are not authorized to view this page');
                    window.location.href = '/';
                }
            });
    }
})