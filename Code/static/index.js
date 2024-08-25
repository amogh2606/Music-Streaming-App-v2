Vue.component('index', {
    props: ['title'],
    template: `

<div class="container">
    <div class="row">
        <header align='center'
                class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
            <h5>Music Streaming Application</h5>
            <div class="col-md-4 offset-md-4">
                <a href='/admin_login' type="button" class="btn btn-outline-dark">Admin Login</a>
            </div>
        </header>
    </div>
    <br/>
    <br/>
    <br/>
    <h1 align="center">Welcome to Music Streaming Application</h1>
    <br/>
    <br/>
    <br/>
    <br/>
    <div class="container">
        <div class="row">
            <div class="col-md-3 offset-md-2">
                <a href="/user_login" type="button" class="btn btn-outline-dark">&emsp;&emsp;&emsp;Login&emsp;
                    &emsp;&emsp;</a>
            </div>
            <div class="col-md-4 offset-md-2">
                <a href="/user_registration" type="button" class="btn btn-outline-dark">&emsp;&emsp;&emsp;Register&emsp;&emsp;&emsp;</a>
            </div>
        </div>
    </div>

</div>

`,
})

const app = new Vue({
    el: '#app'
})
