const express = require("express");

module.exports = (
    app,
    sock,
    firebaseConfig
) => {

    // =====================================================
    // LOGIN PAGE
    // =====================================================

    app.get("/login", (req, res) => {

        res.send(`

<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width,initial-scale=1.0">

<title>Flexi Login</title>

<style>

body{
    margin:0;
    padding:0;
    font-family:Arial,sans-serif;
    background:#0f172a;
    color:white;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
}

.box{
    width:90%;
    max-width:400px;
    background:#1e293b;
    padding:30px;
    border-radius:20px;
}

input{
    width:100%;
    padding:14px;
    margin-top:15px;
    border:none;
    border-radius:10px;
    background:#334155;
    color:white;
}

button{
    width:100%;
    padding:14px;
    margin-top:20px;
    border:none;
    border-radius:10px;
    background:#2563eb;
    color:white;
    font-size:16px;
    cursor:pointer;
}

a{
    color:#60a5fa;
}

</style>

</head>

<body>

<div class="box">

<h1>Flexi Dashboard</h1>

<input
type="email"
id="email"
placeholder="Email">

<input
type="password"
id="password"
placeholder="Password">

<button onclick="login()">
Login
</button>

<p>
No account?
<a href="/signup">
Signup
</a>
</p>

</div>

<script type="module">

import {
initializeApp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
signInWithEmailAndPassword
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig =
${JSON.stringify(firebaseConfig)};

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

window.login = async () => {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        location.href = "/";

    } catch(err){

        alert(err.message);
    }
};

</script>

</body>
</html>

        `);
    });

    // =====================================================
    // SIGNUP PAGE
    // =====================================================

    app.get("/signup", (req, res) => {

        res.send(`

<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width,initial-scale=1.0">

<title>Flexi Signup</title>

<style>

body{
    margin:0;
    padding:0;
    font-family:Arial,sans-serif;
    background:#020617;
    color:white;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
}

.box{
    width:90%;
    max-width:400px;
    background:#111827;
    padding:30px;
    border-radius:20px;
}

input{
    width:100%;
    padding:14px;
    margin-top:15px;
    border:none;
    border-radius:10px;
    background:#1f2937;
    color:white;
}

button{
    width:100%;
    padding:14px;
    margin-top:20px;
    border:none;
    border-radius:10px;
    background:#16a34a;
    color:white;
    font-size:16px;
    cursor:pointer;
}

</style>

</head>

<body>

<div class="box">

<h1>Create Account</h1>

<input
type="email"
id="email"
placeholder="Email">

<input
type="password"
id="password"
placeholder="Password">

<button onclick="signup()">
Create Account
</button>

</div>

<script type="module">

import {
initializeApp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig =
${JSON.stringify(firebaseConfig)};

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

window.signup = async () => {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert("Signup successful");

        location.href = "/login";

    } catch(err){

        alert(err.message);
    }
};

</script>

</body>
</html>

        `);
    });

    // =====================================================
    // MAIN DASHBOARD
    // =====================================================

    app.get("/", (req, res) => {

        res.send(`

<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width,initial-scale=1.0">

<title>Flexi Dashboard</title>

<style>

body{
    margin:0;
    padding:0;
    font-family:Arial,sans-serif;
    background:#0f172a;
    color:white;
}

.top{
    background:#111827;
    padding:20px;
    font-size:20px;
    font-weight:bold;
}

.grid{
    display:grid;
    grid-template-columns:
    repeat(auto-fit,minmax(250px,1fr));
    gap:20px;
    padding:20px;
}

.card{
    background:#1e293b;
    padding:20px;
    border-radius:20px;
}

button{
    margin-top:15px;
    padding:12px;
    border:none;
    border-radius:10px;
    background:#2563eb;
    color:white;
    cursor:pointer;
}

</style>

</head>

<body>

<div class="top">
Flexi Digital Dashboard
</div>

<div class="grid">

<div class="card">

<h2>Bot Status</h2>

<p id="status">
ONLINE
</p>

</div>

<div class="card">

<h2>Pair WhatsApp</h2>

<button onclick="location.href='/pair'">
Open Pairing
</button>

</div>

<div class="card">

<h2>Chat System</h2>

<button onclick="location.href='/chat'">
Open Chat
</button>

</div>

</div>

</body>
</html>

        `);
    });

    // =====================================================
    // CHAT PAGE
    // =====================================================

    app.get("/chat", (req, res) => {

        res.send(`

<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width,initial-scale=1.0">

<title>Flexi Chat</title>

<style>

body{
    margin:0;
    background:#0f172a;
    color:white;
    font-family:Arial,sans-serif;
}

.chat{
    height:80vh;
    overflow:auto;
    padding:20px;
}

.msg{
    background:#1e293b;
    padding:12px;
    margin-bottom:10px;
    border-radius:12px;
}

.bar{
    position:fixed;
    bottom:0;
    width:100%;
    display:flex;
    background:#111827;
    padding:10px;
}

input{
    flex:1;
    padding:14px;
    border:none;
    border-radius:10px;
}

button{
    margin-left:10px;
    padding:14px;
    border:none;
    border-radius:10px;
    background:#2563eb;
    color:white;
}

</style>

</head>

<body>

<div class="chat" id="chat"></div>

<div class="bar">

<input
id="message"
placeholder="Type message">

<button onclick="sendMessage()">
Send
</button>

</div>

<script>

window.sendMessage = async () => {

    const text =
        document.getElementById(
            "message"
        ).value;

    if(!text) return;

    const div =
        document.createElement("div");

    div.className = "msg";

    div.innerText = text;

    document
        .getElementById("chat")
        .appendChild(div);

    document.getElementById(
        "message"
    ).value = "";
};

</script>

</body>
</html>

        `);
    });

    // =====================================================
    // PAIR PAGE
    // =====================================================

    app.get("/pair", (req, res) => {

        res.send(`

<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width,initial-scale=1.0">

<title>Pair WhatsApp</title>

<style>

body{
    background:#020617;
    color:white;
    font-family:Arial,sans-serif;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
}

.box{
    width:90%;
    max-width:400px;
    background:#111827;
    padding:30px;
    border-radius:20px;
}

input{
    width:100%;
    padding:14px;
    border:none;
    border-radius:10px;
    background:#1f2937;
    color:white;
}

button{
    width:100%;
    padding:14px;
    margin-top:20px;
    border:none;
    border-radius:10px;
    background:#16a34a;
    color:white;
}

.code{
    margin-top:20px;
    font-size:30px;
    text-align:center;
}

</style>

</head>

<body>

<div class="box">

<h1>WhatsApp Pairing</h1>

<input
id="number"
placeholder="234XXXXXXXXXX">

<button onclick="pair()">
Generate Code
</button>

<div class="code" id="code">
----
</div>

</div>

<script>

window.pair = async () => {

    const number =
        document.getElementById(
            "number"
        ).value;

    const res =
        await fetch("/pair-code",{

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({
                number
            })
        });

    const data =
        await res.json();

    document.getElementById(
        "code"
    ).innerText =
        data.code || "ERROR";
};

</script>

</body>
</html>

        `);
    });

    // =====================================================
    // PAIR CODE API
    // =====================================================

    app.post(
        "/pair-code",

        async (req, res) => {

            try {

                const {
                    number
                } = req.body;

                if (!number) {

                    return res.json({

                        success:false,
                        error:"Number required"
                    });
                }

                const code =
                    await sock.requestPairingCode(
                        number
                    );

                return res.json({

                    success:true,
                    code
                });

            } catch(err){

                return res.json({

                    success:false,

                    error:
                        err.message
                });
            }
        }
    );
};
