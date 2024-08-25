const user_details = Vue.component('user_details', {
    template:`
<div>
    <div id="header">
    <center><h1>User Details</h1></center>
    </br>
    </br>
    <h2 style="padding-left: 50px">You can edit the details</h2>
</div>
<div class="container">
    <form method="post" @submit.prevent="submitForm">
     

        <div class="mb-3">

            <input type="text" class="form-control" id="exampleInputEmail1" placeholder="User Email"
                   aria-label="User Name" id="email" value="{{ user.email }}" name="email" v-model="user.email">

        </div>
        <div class="mb-3">

            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password"
                   aria-label="Password" id="password" value="" name="password" v-model="user.password">
        </div>
<div class="row">
    <div class="col-md-3">
        <button type="submit" class="btn btn-primary">Save</button>
    </div>
    </form>
        <div class="col-md-4">
        <a type="button" v-on:click="delete_user" class="btn btn-outline-danger"> Delete Account</a>
            </div>
    
</div>
</div>
</div>`
        ,
    data: function() {
        return {
            user: {
                id: '',
                email: '',
                password: ''

            }
        }
    },
    mounted: async function() {
        await fetch("/api/user",
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'music-token': sessionStorage.getItem('music-token')
                }
            })
            .then(response => response.json())
            .then(data => {
                this.user = data;
            });
    },
    methods: {
        submitForm: async function () {
            await fetch('/api/user',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'music-token': sessionStorage.getItem('music-token')
                    },
                    body: JSON.stringify(this.user)
                })
                .then(response => response.json())
                .then(data => {
                    this.user = data;
                });
            window.location.href = "/home";
        },
        delete_user: async function (id) {
            await fetch('/api/user',
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'music-token': sessionStorage.getItem('music-token')
                    }
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                });
            window.location.href = "/";
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
})