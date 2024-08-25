


var app = new Vue({
    el: '#app',
    mounted: function () {
        alert("do you want to log out?");
        sessionStorage.clear();
    }
})
