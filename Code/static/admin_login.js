const admin_login = Vue.component('admin_login', {
    template:`
    <div>
    <div id="header">
    <center><h2>Administrator Login</h2></center>
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
   
        <br/>
            <br/>
            <p align="center" style="color:gray" >Dont have admin access ? Go to User Login</p>

    </form>
</div>
</div>
`,
    methods :{
        login: async function () {
            const data = {email: this.email, password: this.password};
            let response = await fetch('http://localhost:9000/login?include_auth_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            let ans = await response.json();
            if (ans.response.errors && ans.response.errors[0] === 'Invalid password') {
                alert('Invalid email or password');
                window.location.href = "/user_login";
            }
            if (ans.response.errors && ans.response.errors[0] === 'Specified user does not exist') {
                alert('User does not exist. Please register or check the email id you have entered');
                window.location.href = "/user_login";

            } else {
                sessionStorage.setItem('music-token', ans.response.user.authentication_token);
                window.location.href = "/admin/dashboard";
            }
            ;

        }
    }
})


var app = new Vue({
    el: "#app"
})