const user_registration = Vue.component('user_registration', {
    data: function() {
        return {
            email: '',
            password: '',
            password_confirm: ''
        }
    },
    template:`
 <div>  
<div id="header">
    <center><h1>User Registration</h1></center>
</div>
<div class="container">
    <form @submit.prevent="register">

        <div class="mb-3">

            <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Email"
                   aria-label="email" v-model="email" required>

        </div>
        <div class="mb-3">

            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password"
                   aria-label="Password" v-model="password">
            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password Confirm"
                   aria-label="Password" v-model="password_confirm">
        </div>

        <button type="submit" class="btn btn-primary">Register</button>

    </form>
</div>
</div> 
`,
    methods: {
        register: async function() {
            const data = { email: this.email, password: this.password, password_confirm: this.password_confirm};
            console.log("method entered")
            console.log(JSON.stringify(data))
            await fetch('/user_register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)

            })
                .then(response => response.json())
                .then(data => {console.log(data);
                    if (data.error && data.error === 'User already exists') {
                        alert('User Already Exists');
                        window.location.href = "/user_registration";
                    };
                    if (data.error && data.error === 'Passwords do not match') {
                        alert('Passwords do not match');
                        window.location.href = "/user_registration";}
                    else {
                        alert("User Registered Successfully. Login with your credentials.");
                        window.location.href = "/user_login";
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);

                });

        }
    }
})

var app = new Vue({
    el: "#app"
})