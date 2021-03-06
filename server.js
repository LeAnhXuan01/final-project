import express from "express";
import bcrypt from "bcrypt";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, setDoc, getDoc, updateDoc, getDocs, query, where, deleteDoc} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlEmx69tbLtt9iFgk1dmazZ2Yn0yhrCIw",
  authDomain: "final-project-v1-dacef.firebaseapp.com",
  projectId: "final-project-v1-dacef",
  storageBucket: "final-project-v1-dacef.appspot.com",
  messagingSenderId: "749439892178",
  appId: "1:749439892178:web:c4eaa301d4484ec9238b0b"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore();

// init server
const app = express();

// middlewares
app.use(express.static("public"));
app.use(express.json()) // enables form sharing

// routes
// home routes
app.get('/', (req, res) => {
    res.sendFile("index.html", { root : "public" })
})

// signup
app.get('/signup', (req, res) => {
    res.sendFile("signup.html", { root : "public" })
})

app.post('/signup', (req, res) => {
    const { name, email, password, number, tac } = req.body;

    // form validations
    if(name.length < 3){
       res.json({ 'alert' : 'name must be 3 letters long'});
    } else  if(!email.length){
        res.json({ 'alert' : 'enter your email'});
    } else  if(password.length < 8){
        res.json({ 'alert' : 'password must be 8 letters long'});
    } else  if(!Number(number) || number.length < 10){
        res.json({ 'alert' : 'invalid number, please enter valid one'});
    } else  if(!tac){
        res.json({ 'alert' : 'you must agree to our terms and condition'});
    } else{
        // store the data in db
        const users = collection(db, "users");

        getDoc(doc(users, email)).then(user => {
            if(user.exists()){
                return res.json({ 'alert' : 'email already exists' })
            } else{
                // encrypt the password
                bcrypt.genSalt(10, (err,salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        req.body.password = hash;
                        req.body.seller = false;

                        // set the doc
                        setDoc(doc(users, email), req.body).then(data => {
                            res.json({
                                name: req.body.name,
                                email: req.body.email,
                                seller: req.body.seller,
                            })
                        })
                    })
                })
            }
        })
    }
})

// login 
app.get('/login', (req, res) => {
    res.sendFile("login.html", { root : "public" })
})

app.post('/login', (req, res) => {
    let { email, password } = req.body;

    if(!email.length || !password.length){
        res.json({ 'alert' : 'fill all the inputs'})
    }

    const users = collection(db, "users");

    getDoc(doc(users, email))
    .then(user => {
        if(!user.exists()){
            return res.json({ 'alert' : 'email does not exists' });
        } else{
            bcrypt.compare(password, user.data().password, (err, result) => {
                if(result) {
                    let data = user.data();
                    return res.json({
                        name: data.name,
                        email: data.email,
                        seller: data.seller
                    })
                } else{
                    return res.json({ 'alert' : 'password is incorrect' })
                }
            })
        }
    })
})

//seller route
app.get('/seller',(req, res) => {
    res.sendFile("seller.html", { root : "public" })
})

app.post('/seller',(req, res) => {
    let { name, address, about, number, email} = req.body;

    if(!name.length || !address.length || !about.length || number.length < 10 || !Number(number) )
        {
            return res.json({ 'alert' : 'some information(s) is/are incorrect' });
    }else{
        //update the seller status
        const sellers = collection(db, "sellers");
        setDoc(doc(sellers, email), req.body).then(data =>{
            const users = collection(db, "users");
            updateDoc(doc(users, email),{
                seller : true
            })
            .then(data => {
                res.json({'seller' : true})
            })
        })
    }
})

// dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile("dashboard.html", { root : "public"})
})

// add product
app.get('/add-product', (req, res) => {
    res.sendFile("add-product.html", { root : "public" });
})

app.post('/add-product', (req, res) => {
    let { name, shortDes, detail, price, image, tags, email, draft, id} = req.body;
    if(!draft){
        if(!name.length){
            res.json({'alert' : 'shold enter product name'});
        } else if(!shortDes.length){
            res.json({'alert' : 'short des must bo 80 letters long'});
        } else if(!price.length || !Number(price)){
            res.json({'alert' : 'enter valid price'});
        } else if(!detail.length){
            res.json({'alert' : 'must enter the detail'});
        } else if(!tags.length){
            res.json({'alert' : 'enter tag'});
        }
    }

    //add-product
    let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() *50000)}` :id;

    let products = collection(db, "products");
    setDoc(doc(product, docName), req.body)
    .then(data => {
        res.json({'product': name})
    })
    .catch(err => {
        res.json({'alert': 'some error occured.'})
    })
})

app.post('/get-products', (req, res) => {
    let{ email, id, tag } = req.body

    let products = collection(db, "products");
    let docRef;

    if(id){
        docRef = getDoc(doc(products, id));
    }else if(tag){
        docRef = getDocs(query(products,where("tags","array-contains", tag)))
    }else{
        docRef = getDocs(query(products, where("email","==",email)))
    }

    docRef.then(products => {
        if(products.empty){
            return res.json('no product');
        }
        let productArr = [];
        
        if(id){
            return res.json(products.data());
        }else{
            products.forEach(item => {
                let data = item.data();
                data.id = item.id;
                productArr.push(data);
            })
        }

        res.json(productArr);
    })
})

app.post('/delete-product', (req, res) => {
    let { id } = req.body;
    
    deleteDoc(doc(collection(db, "products"), id))
    .then(data => {
        res.json('success');
    }).catch(err =>{
        res.json('err');
    })
})

app.get('/product', (req, res) => {
    res.sendFile("product.html", {root : "public" })
})

app.get('/product-1', (req, res) => {
    res.sendFile("product-1.html", {root : "public" })
})

app.get('/product-2', (req, res) => {
    res.sendFile("product-2.html", {root : "public" })
})

app.get('/product-3', (req, res) => {
    res.sendFile("product-3.html", {root : "public" })
})

app.get('/product-4', (req, res) => {
    res.sendFile("product-4.html", {root : "public" })
})

app.get('/search', (req, res) => {
    res.sendFile("search.html", {root : "public" })
})

app.get('/cart', (req, res) => {
    res.sendFile("cart.html", { root : "public" })
})

// 404 route
app.get('/404', (req, res) => {
    res.sendFile("404.html", { root : "public" })
})

app.use((req, res) => {
    res.redirect('/404')
})

app.listen(3000, () => {
    console.log('listening on port 3000');
})