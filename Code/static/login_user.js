const login = Vue.component('login', {
    data: function() {
        return {
            email: '',
            password: ''
        }
    },
    template: `
    <div>
    <div id="header">
    <center><h1>User Login</h1></center>
</div>
<div class="container">
    <form @submit.prevent="login">

        <div class="mb-3">
            <label for="exampleInputEmail1" class="form-label"> Email</label>
            <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
                   v-model="email" required>
            <div id="emailHelp" class="form-text">Please enter your email ID</div>
        </div>
        <div class="mb-3">
            <label for="exampleInputPassword1" class="form-label">Password</label>
            <input type="password" class="form-control" id="exampleInputPassword1" v-model="password" required>
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
        <button type="button" class="btn btn-primary"><a href="/register"
                                                         style="text-decoration: None;color: aliceblue"> Register </a>
        </button>

    </form>
</div>
</div>
`,
    methods: {
        login: async function() {
            const data = {email: this.email, password: this.password};
            let response = await fetch('/login?include_auth_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            console.log(response);
            let ans = await response.json();

            if (ans.response.errors && ans.response.errors[0] === 'Invalid password') {
                alert('Invalid email or password');
                return window.location.href = "/user_login";
            }
            if(ans.response.errors && ans.response.errors[0] === 'Specified user does not exist') {
                alert('User does not exist. Please register or check the email id you have entered');
                return window.location.href = "/user_login";

            }
            else if (response.status === 400 ) {
                alert('You have been blacklisted. Please contact the admin for further details');
            }
            else
            {
                sessionStorage.setItem('music-token', ans.response.user.authentication_token);
                window.location.href = "/home";
            }

        }
    }
})

var app = new Vue({
    el: "#app"
})