// routes/dashboard.js

const express = require('express');
const axios = require('axios');

module.exports = function(app, sock, firebaseConfig) {

const FB_SCRIPTS = `
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>

<script>
const firebaseConfig = ${JSON.stringify(firebaseConfig)};
firebase.initializeApp(firebaseConfig);
</script>
`;


// ================= LOGIN =================
app.get('/login', (req, res) => {

res.send(`
<html>

<head>
<title>Login</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

body{
    font-family:sans-serif;
    background:#f0f2f5;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    margin:0;
}

.card{
    background:white;
    padding:30px;
    border-radius:15px;
    width:90%;
    max-width:400px;
    box-shadow:0 10px 25px rgba(0,0,0,0.1);
    box-sizing:border-box;
}

header{
    background:#002b5c;
    color:white;
    padding:15px;
    text-align:center;
    margin:-30px -30px 20px -30px;
    border-radius:15px 15px 0 0;
}

input{
    width:100%;
    padding:12px;
    margin:8px 0;
    border:1px solid #ddd;
    border-radius:8px;
    box-sizing:border-box;
}

button{
    width:100%;
    padding:12px;
    background:#002b5c;
    color:white;
    border:none;
    border-radius:8px;
    cursor:pointer;
    font-weight:bold;
}

.google-btn{
    background:#fff;
    color:#757575;
    border:1px solid #ddd;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    margin-top:15px;
}

.divider{
    margin:20px 0;
    border-top:1px solid #eee;
    position:relative;
    text-align:center;
}

.divider span{
    position:absolute;
    top:-10px;
    left:42%;
    background:white;
    padding:0 10px;
    font-size:12px;
    color:#aaa;
}

</style>
</head>

<body>

<div class="card">

<header>LOGIN</header>

<input id="email" type="email" placeholder="Email Address">
<input id="pass" type="password" placeholder="Password">

<button onclick="login()">Login</button>

<div class="divider">
<span>OR</span>
</div>

<button class="google-btn" onclick="loginWithGoogle()">
<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18">
Sign in with Google
</button>

<p style="text-align:center;font-size:12px;margin-top:15px;">
Don't have an account?
<a href="/signup">Sign up</a>
</p>

</div>

${FB_SCRIPTS}

<script>

function login(){

    const e = document.getElementById('email').value;
    const p = document.getElementById('pass').value;

    firebase.auth()
    .signInWithEmailAndPassword(e,p)

    .then(u=>{

        localStorage.setItem(
            'userName',
            u.user.displayName || 'Admin'
        );

        window.location.href='/';
    })

    .catch(err=>alert(err.message));
}

function loginWithGoogle(){

    const provider =
        new firebase.auth.GoogleAuthProvider();

    firebase.auth()
    .signInWithPopup(provider)

    .then(result=>{

        localStorage.setItem(
            'userName',
            result.user.displayName
        );

        window.location.href='/';
    })

    .catch(err=>alert(
        "Google Error: " + err.message
    ));
}

</script>

</body>
</html>
`);

});


// ================= SIGNUP =================
app.get('/signup', (req, res) => {

res.send(`
<html>

<head>
<title>Sign Up</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

body{
    font-family:sans-serif;
    background:#f0f2f5;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    margin:0;
}

.card{
    background:white;
    padding:30px;
    border-radius:15px;
    width:90%;
    max-width:400px;
    box-shadow:0 10px 25px rgba(0,0,0,0.1);
}

header{
    background:#002b5c;
    color:white;
    padding:15px;
    text-align:center;
    margin:-30px -30px 20px -30px;
    border-radius:15px 15px 0 0;
}

input{
    width:100%;
    padding:12px;
    margin:8px 0;
    border:1px solid #ddd;
    border-radius:8px;
}

button{
    width:100%;
    padding:12px;
    background:#002b5c;
    color:white;
    border:none;
    border-radius:8px;
    cursor:pointer;
}

</style>
</head>

<body>

<div class="card">

<header>CREATE ACCOUNT</header>

<input id="name" placeholder="Full Name">
<input id="email" type="email" placeholder="Email">
<input id="pass" type="password" placeholder="Password">
<input id="confirm" type="password" placeholder="Confirm Password">

<button onclick="signup()">
Create Account
</button>

</div>

${FB_SCRIPTS}

<script>

function signup(){

    const n=document.getElementById('name').value;
    const e=document.getElementById('email').value;
    const p=document.getElementById('pass').value;

    if(
        p !== document.getElementById('confirm').value
    ){
        return alert("Passwords don't match");
    }

    firebase.auth()
    .createUserWithEmailAndPassword(e,p)

    .then(u=>{

        u.user.updateProfile({
            displayName:n
        })

        .then(()=>{

            alert("Account created");
            window.location.href="/login";

        });
    })

    .catch(err=>alert(err.message));
}

</script>

</body>
</html>
`);

});


// ================= DASHBOARD =================
app.get('/', (req, res) => {

res.send(`
<html>

<head>

<title>Dashboard</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

body{
    margin:0;
    font-family:sans-serif;
    background:#f4f7f9;
}

header{
    background:#002b5c;
    color:white;
    padding:20px;
    text-align:center;
}

.container{
    padding:20px;
    max-width:800px;
    margin:auto;
}

.welcome{
    font-size:24px;
    color:#002b5c;
    margin-bottom:20px;
    font-weight:bold;
}

.card{
    background:white;
    padding:20px;
    border-radius:12px;
    margin-bottom:20px;
    box-shadow:0 2px 10px rgba(0,0,0,0.05);
}

.btn{
    display:block;
    text-align:center;
    padding:15px;
    background:#003f88;
    color:white;
    text-decoration:none;
    border-radius:8px;
    font-weight:bold;
    margin-top:10px;
}

</style>
</head>

<body>

<header>
🤖 JARVIS AI PORTAL
</header>

<div class="container">

<div class="welcome" id="greet">
Welcome
</div>

<div class="card">

<h3>Connection Status</h3>

<p id="linked">
Linked Number: Not Set
</p>

<input
    id="num"
    placeholder="234..."
    style="padding:10px;width:60%;"
/>

<button onclick="getPair()">
Pair
</button>

<div
    id="code"
    style="
    font-size:22px;
    margin-top:10px;
    color:#003f88;
    font-weight:bold;
    "
>
-- -- -- --
</div>

</div>

<div class="card">

<h3>Quick Actions</h3>

<a href="/chat" class="btn">
Chat with JARVIS
</a>

</div>

</div>

<script>

const u =
    localStorage.getItem('userName');

if(!u)
    window.location.href='/login';

document.getElementById('greet')
.innerText = "Welcome back, " + u;

async function getPair(){

    const n =
        document.getElementById('num').value;

    const res =
        await fetch('/pair?number='+n);

    document.getElementById('code')
    .innerText = await res.text();

    document.getElementById('linked')
    .innerText = "Linked: +" + n;
}

</script>

</body>
</html>
`);

});


// ================= CHAT =================
app.get('/chat', (req, res) => {

res.send(`
<html>

<head>

<title>Chat</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

body{
    margin:0;
    font-family:sans-serif;
    display:flex;
    flex-direction:column;
    height:100vh;
}

header{
    background:#002b5c;
    color:white;
    padding:15px;
    text-align:center;
}

#box{
    flex:1;
    background:#e5ddd5;
    padding:20px;
    overflow-y:auto;
}

.inp{
    padding:20px;
    background:white;
    display:flex;
    gap:10px;
}

input{
    flex:1;
    padding:12px;
    border-radius:20px;
    border:1px solid #ddd;
}

</style>
</head>

<body>

<header>
JARVIS CHAT
</header>

<div id="box">

<p style="
background:white;
padding:10px;
border-radius:8px;
display:inline-block;
">
Hello Admin
</p>

</div>

<div class="inp">

<input placeholder="Type...">

<button>
Send
</button>

</div>

<script>

if(
!localStorage.getItem('userName')
)
window.location.href='/login';

</script>

</body>
</html>
`);

});


// ================= PAIR =================
app.get('/pair', async (req, res) => {

const num =
    req.query.number?.replace(/[^0-9]/g,'');

if(!sock)
    return res.send("Bot starting...");

try{

    const code =
        await sock.requestPairingCode(num);

    res.send(code);

}catch(e){

    console.log(
        "Pair Error:",
        e.message
    );

    res.send("Error generating code");
}

});

};
