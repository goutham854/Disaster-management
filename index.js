if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express=require('express')
const app=express()
const ejsMate=require("ejs-mate")
const path=require("path")
const passport = require('passport');
const cookieSession = require('cookie-session');
const session=require('express-session')
const methodOverride = require('method-override')
const mongoose=require('mongoose')
const LocalStrategy = require('passport-local')
const User=require("./model/user");
const Volunteer=require("./model/volunter");
const Alert = require('./model/alerts');
const bcrypt=require("bcrypt");
const nodemailer=require("nodemailer");
const twilio=require("twilio");
const Request=require("./model/requests");
const News=require("./model/news");
const ResourceCenter=require("./model/resourceCenter");
const Donation = require('./model/donations');
const { log } = require('console');
const {isUserLoggedIn,isVolLoggedIn}=require("./middleware")
const wrapAsync=require("./utils/wrapAsync")
const browserEnv=require("browser-env");
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken='pk.eyJ1IjoiYWpheWd1cnVndWJlbGxpIiwiYSI6ImNsc3VvdmIwNjFib2UycnMwbjkyZnh5MmcifQ.bhjam1gBQ1V1i8GEwuRWfw';
const geocoder=mbxGeocoding({accessToken:mapBoxToken})
const multer = require('multer');
const { storage } = require('./cloudinary');
const upload = multer({ storage});

 

mongoose.connect("mongodb://127.0.0.1:27017/crisis")

const db=mongoose.connection
db.on("error",console.error.bind(console,"connection error"))
db.once("open",()=>{
    console.log("database connected succesfully")
})


const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))



  app.use(express.static(path.join(__dirname,'public')));
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride('_method'));
  app.engine('ejs', ejsMate)
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'))






app.use((req, res, next) => {
    res.locals.currentUser = req.session.user_id;
    // res.locals.success=req.flash('success')
    // res.locals.error=req.flash('error')
    next();
})

app.get("/",(req,res)=>{
    res.render("visitor/home");
})
app.get("/home" ,(req,res)=>{
    res.render('visitor/home');
})
app.get("/blogs",(req,res)=>{
    res.render('visitor/blogs');
})
app.get("/blogs/cyclone",(req,res)=>{
    res.render('visitor/blogs/cyclone');
})
app.get("/blogs/earthquake",(req,res)=>{
    res.render('visitor/blogs/earthquake');
})
app.get("/blogs/tsunami",(req,res)=>{
    res.render('visitor/blogs/tsunami');
})
app.get("/blogs/floods",(req,res)=>{
    res.render('visitor/blogs/floods');
})
app.get("/news",wrapAsync(async(req,res)=>{
    const news=await News.find({});
    res.render('visitor/news',{news});
}))
app.get("/alerts" ,wrapAsync(async(req,res)=>{
    const alerts=await Alert.find({});
    res.render('visitor/alerts',{alerts});
}))
app.get('/donate',(req,res)=>{
    res.render('visitor/donate')
})
app.post("/donations",wrapAsync(async(req,res)=>{
    const donation=new Donation(req.body.donate);
    console.log(donation);
    await donation.save();
    res.redirect('/donate')
}))
app.get('/contacts',(req,res)=>{
    res.render('visitor/contacts')
})
app.get('/weather',(req,res)=>{
    res.render('visitor/weather')
})


app.post('/geolocation', (req, res) => {
    // Access the latitude and longitude from the request body
    const { latitude, longitude } = req.body;
  
    // Log the received data to the console
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
  
    // Send a response back to the client
    res.send('Geolocation data received!');
  });
//user routes*******************************

app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/register",(req,res)=>{
    res.render("signup");
})

app.post("/userLogin",wrapAsync(async(req,res)=>{
    const {username,password}=req.body;
   const vteer=await User.findOne({username: username});
   if(!vteer) return res.status(400).json({error:"user not found"});
   
   const valid=await bcrypt.compareSync(password,vteer.password);
      if(valid){
        req.session.user_id=vteer._id;
    res.redirect("/user/home");
   }else{
    return res.status(400).json({error:"incorrect username or password"});
}}))
app.post("/userRegistration", async(req,res)=>{
    const {username,email,phone,password,latitude,longitude,district,postalCode,state}=req.body;
    const vteer=await User.find({email: email});
    if(!vteer) {
        console.log(vteer);
        return res.status(400).json({error: "volunteer with this email exists already"});
    }
    
    const secPass= await bcrypt.hash(password,12);
    const user = new User({username,password:secPass,phone,email,state,latitude,longitude,district,postalCode});
   console.log(user);
   await user.save();
   if(user){
    req.session.user_id=user._id;
        res.redirect('/user/home');
   }
    
})
app.get('/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.status(400).send('Unable to log out')
        } else {
          res.redirect('/home');
        }
      });
    } else {
      res.end()
    }
  })

app.get('/user/home',isUserLoggedIn,wrapAsync(async(req,res)=>{
    const alerts=await Alert.find({});

    res.render('user/home',{alerts})
}))
app.get('/user/blogs',isUserLoggedIn,(req,res)=>{
    res.render('user/blogs')
})
app.get("/user/blogs/cyclone",(req,res)=>{
    res.render('user/blogs/cyclone');
})
app.get("/user/blogs/earthquake",(req,res)=>{
    res.render('user/blogs/earthquake');
})
app.get("user/blogs/tsunami",(req,res)=>{
    res.render('user/blogs/tsunami');
})
app.get("user/blogs/floods",(req,res)=>{
    res.render('user/blogs/floods');
})
app.get('/user/alerts',isUserLoggedIn,wrapAsync(async(req,res)=>{
    const alerts=await Alert.find({});
    res.render('user/alerts',{alerts})
}))
app.get('/user/news',isUserLoggedIn,wrapAsync(async(req,res)=>{
    const news=await News.find({});
    res.render('user/news',{news})
}))
app.get('/user/requests',isUserLoggedIn,(req,res)=>{
    res.render('user/requests')
})
app.post("/user/request",isUserLoggedIn,upload.single("image"),wrapAsync(async(req,res)=>{
    const request=new Request(req.body.request);
    request.user=req.session.user_id;
    const user=await User.findById(request.user);
    
   
    request.image.url = req.file.path;
    request.image.filename = req.file.filename;

    
    request.username=user.username;
    request.phone=user.phone;
    request.address=user.address;
    request.district=user.district;
   await request.save();
   res.redirect("/user/request");
}))
app.get('/user/donate',isUserLoggedIn,(req,res)=>{
    res.render('user/donate')
})
app.post("/user/donations",isUserLoggedIn,wrapAsync(async(req,res)=>{
    const donation=new Donation(req.body.donate);
    console.log(donation);
    await donation.save();
    res.redirect('/user/home')
}))
app.get('/user/contacts',isUserLoggedIn,(req,res)=>{
    res.render('user/contacts')
})
app.get('/user/weather',isUserLoggedIn,(req,res)=>{
    res.render('user/weather')
})








// Admin Routes

app.get('/admin/dashboard',wrapAsync(async(req,res)=>{
    const alerts=await Alert.find({});
    const news=await News.find({});
    res.render('admin/dashboard',{alerts,news})
}))
app.get('/admin/donors',wrapAsync(async(req,res)=>{
    const donations=await Donation.find({});
    res.render('admin/donors',{donations})
}))
app.get('/admin/resources',wrapAsync(async(req,res)=>{
    const resources=await ResourceCenter.find({});
    res.render('admin/resources',{resources})
}))
app.post("/admin/resources/search",wrapAsync(async(req,res)=>{
    const {resourcecenter,category}=req.body;
    const resourceCenter=await ResourceCenter.findOne({name:resourcecenter});
    console.log(category);
    let resources;
     if(category==="food") { resources = resourceCenter.food ;console.log(resources);}
    else if(category==="money") { resources = resourceCenter.amount ;}
    else if(category==="medicine") { resources = resourceCenter.medicine ;}
    else if(category==="water") { resources = resourceCenter.water ;}
    else  { resources = resourceCenter.clothes ;}
    console.log(resources);
    const amount=resourceCenter.amount;
     res.render("admin/searchview",{resources,category,amount,resourceCenter})
}))
app.get("/resourcecenter/:id/view",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const resourcecenter=await ResourceCenter.findById(id);
    const foods=resourcecenter.food;
    const medicines=resourcecenter.medicine;
    const waters=resourcecenter.water;
    const amount=resourcecenter.amount;

    res.render("admin/detailview",{foods,medicines,waters,amount,resourcecenter});

}))
app.post("/:rid/food/:fname/delete",async(req,res)=>{
    const {rid,fname}=req.params;
    const resourcecenter= await ResourceCenter.findById(rid);
    let arr;
    console.log(resourcecenter.food);
    for(let i=0;i<resourcecenter.food.length;i++){
        if(resourcecenter.food[i].itemName===fname){
            arr=resourcecenter.food.splice(i,1);
            break;
        }
    }
    console.log(arr);
    //resourcecenter.food=arr;
    await resourcecenter.save();
    res.redirect("/admin/resources");
})
app.post("/:rid/medicine/:mname/delete",async(req,res)=>{
    const {rid,fname}=req.params;
    const resourcecenter= await ResourceCenter.findById(rid);
    let arr;
    console.log(resourcecenter.medicine);
    for(let i=0;i<resourcecenter.medicine.length;i++){
        if(resourcecenter.medicine[i].itemName===fname){
            arr=resourcecenter.medicine.splice(i,1);
            break;
        }
    }
    console.log(arr);
    //resourcecenter.food=arr;
    await resourcecenter.save();
    res.redirect("/admin/resources");
})

app.post("/:rid/water/:wname/delete",async(req,res)=>{
    const {rid,fname}=req.params;
    const resourcecenter= await ResourceCenter.findById(rid);
    let arr;
    console.log(resourcecenter.water);
    for(let i=0;i<resourcecenter.water.length;i++){
        if(resourcecenter.water[i].itemName===fname){
            arr=resourcecenter.water.splice(i,1);
            break;
        }
    }
    console.log(arr);
    //resourcecenter.food=arr;
    await resourcecenter.save();
    res.redirect("/admin/resources");
})


app.get('/admin/volunteers',wrapAsync(async(req,res)=>{
    const volunteers=await Volunteer.find({});
    res.render('admin/volunteers',{volunteers})
}))
app.get('/admin/complaints',(req,res)=>{
    res.render('admin/complaints')
})

app.get("/admin/recieptDonations",wrapAsync(async(req,res)=>{
    const donations=await Donation.find({isRecieved:false});
    console.log(donations);
    res.render("admin/recieptdonations",{donations})
}))


app.get("/admin/donations/:id/edit",wrapAsync(async(req,res)=>{
    const {id}=req.params;
  
    const donation=await Donation.findById(id);
    const dist=donation.district.charAt(0).toUpperCase() + donation.district.slice(1).toLowerCase();
    const resourceCenter=`RC-${dist}`;
    
    res.render("admin/donateedit",{donation,resourceCenter});
}))

app.post("/admin/donations/:id/accept",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const donation=await Donation.findById(id);
    
    const dist=donation.district.charAt(0).toUpperCase() + donation.district.slice(1).toLowerCase();
    const resourceCenter=`RC-${dist}`;
    const resourcecenter=await ResourceCenter.findOne({name:resourceCenter});
  
   
    if(donation.category==="food"){
       let flag=false;
        
       for(let i=0;i< resourcecenter.food.length;i++){
       
            if(resourcecenter.food[i].itemName.toLowerCase()===`${donation.itemName}`.toLowerCase()){
                resourcecenter.food[i].quantity+=Number(`${donation.quantity}`);
                flag=true;
                break;
            }
        }
       if(!flag){
            resourcecenter.food.push({
                itemName:`${donation.itemName}`,
                quantity:`${donation.quantity}`,
                expiryDate:`${donation.expiryDate}`
            })
       }
    }

   else if(donation.category==="medicine"){
        let flag=false;
         
        for(let i=0;i< resourcecenter.medicine.length;i++){
        
             if(resourcecenter.medicine[i].itemName.toLowerCase()===`${donation.itemName}`.toLowerCase()){
                 resourcecenter.medicine[i].quantity+=Number(`${donation.quantity}`);
                 flag=true;
                 break;
             }
         }
        if(!flag){
             resourcecenter.medicine.push({
                 itemName:`${donation.itemName}`,
                 quantity:`${donation.quantity}`
                 
             })
        }
     }

    else if(donation.category==="water"){
        let flag=false;
         
        for(let i=0;i< resourcecenter.water.length;i++){
        
             if(resourcecenter.water[i].itemName.toLowerCase()===`${donation.itemName}`.toLowerCase()){
                 resourcecenter.water[i].quantity+=Number(`${donation.quantity}`);
                 flag=true;
                 break;
             }
         }
        if(!flag){
             resourcecenter.food.push({
                 itemName:`${donation.itemName}`,
                 quantity:`${donation.quantity}`
                
             })
        }
     }
     if(donation.category==="money"){
        resourcecenter.amount+=Number(`${donation.quantity}`);
     }

        donation.isRecieved=true;
        await donation.save();
      await resourcecenter.save();
     res.redirect("/admin/dashboard");
}))



app.post("/admin/donations/:id/edit/accept",wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const donation=await Donation.findByIdAndUpdate(id,{...req.body.donate});
    await donation.save();
    const {resourceCenter}=req.body;
    const resourcecenter=await ResourceCenter.findOne({name:resourceCenter});
  
   
    if(donation.category==="food"){
       let flag=false;
        
       for(let i=0;i< resourcecenter.food.length;i++){
       
            if(resourcecenter.food[i].itemName.toLowerCase()===`${donation.itemName}`.toLowerCase()){
                resourcecenter.food[i].quantity+=Number(`${donation.quantity}`);
                flag=true;
                break;
            }
        }
       if(!flag){
            resourcecenter.food.push({
                itemName:`${donation.itemName}`,
                quantity:`${donation.quantity}`,
                expiryDate:`${donation.expiryDate}`
            })
       }
    }

   else if(donation.category==="medicine"){
        let flag=false;
         
        for(let i=0;i< resourcecenter.medicine.length;i++){
        
             if(resourcecenter.medicine[i].itemName.toLowerCase()===`${donation.itemName}`.toLowerCase()){
                 resourcecenter.medicine[i].quantity+=Number(`${donation.quantity}`);
                 flag=true;
                 break;
             }
         }
        if(!flag){
             resourcecenter.medicine.push({
                 itemName:`${donation.itemName}`,
                 quantity:`${donation.quantity}`
                 
             })
        }
     }

    else if(donation.category==="water"){
        let flag=false;
         
        for(let i=0;i< resourcecenter.water.length;i++){
        
             if(resourcecenter.water[i].itemName.toLowerCase()===`${donation.itemName}`.toLowerCase()){
                 resourcecenter.water[i].quantity+=Number(`${donation.quantity}`);
                 flag=true;
                 break;
             }
         }
        if(!flag){
             resourcecenter.food.push({
                 itemName:`${donation.itemName}`,
                 quantity:`${donation.quantity}`
                
             })
        }
     }
     if(donation.category==="money"){
        resourcecenter.amount+=Number(`${donation.quantity}`);
     }

        donation.isRecieved=true;
        await donation.save();
      await resourcecenter.save();
     res.redirect("/admin/dashboard");
}))
app.get("/admin/addUpdateResources",wrapAsync(async(req,res)=>{
    const resources=await ResourceCenter.find({});
    res.render("admin/addresource",{resources});
}))
app.post("/admin/addResources",wrapAsync(async(req,res)=>{
    const {resourceCenter,category,itemName,quantity,expiryDate}=req.body;
    const resourcecenter=await ResourceCenter.findOne({name:resourceCenter});
  
   
    if(category==="food"){
       let flag=false;
        
       for(let i=0;i< resourcecenter.food.length;i++){
       
            if(resourcecenter.food[i].itemName.toLowerCase()===`${itemName}`.toLowerCase()){
                resourcecenter.food[i].quantity+=Number(`${quantity}`);
                flag=true;
                break;
            }
        }
       if(!flag){
            resourcecenter.food.push({
                itemName:`${itemName}`,
                quantity:`${quantity}`,
                expiryDate:`${expiryDate}`
            })
       }
    }

   else if(category==="medicine"){
        let flag=false;
         
        for(let i=0;i< resourcecenter.medicine.length;i++){
        
             if(resourcecenter.medicine[i].itemName.toLowerCase()===`${itemName}`.toLowerCase()){
                 resourcecenter.medicine[i].quantity+=Number(`${quantity}`);
                 flag=true;
                 break;
             }
         }
        if(!flag){
             resourcecenter.medicine.push({
                 itemName:`${itemName}`,
                 quantity:`${quantity}`
                 
             })
        }
     }

    else if(category==="water"){
        let flag=false;
         
        for(let i=0;i< resourcecenter.water.length;i++){
        
             if(resourcecenter.water[i].itemName.toLowerCase()===`${itemName}`.toLowerCase()){
                 resourcecenter.water[i].quantity+=Number(`${quantity}`);
                 flag=true;
                 break;
             }
         }
        if(!flag){
             resourcecenter.food.push({
                 itemName:`${itemName}`,
                 quantity:`${quantity}`
                
             })
        }
     }
     if(category==="money"){
        resourcecenter.amount+=Number(`${quantity}`);
     }

     await resourcecenter.save();
     res.redirect('/admin/resources');

}))

app.get('/admin/alerts',(req,res)=>{
    res.render('admin/alerts')
})
app.get('/admin/news',(req,res)=>{
    res.render('admin/news')
})


app.post("/admin/writeNews",wrapAsync(async(req,res)=>{
    const {title,description}=req.body;
    const writtenDate=Date.now();
    const news=new News({title,description,writtenDate});
    await news.save();
    res.redirect("/admin/dashboard");
})
)

app.post("/admin/raiseAlert",wrapAsync(async(req,res)=>{
    const {disaster,expectedDateTime,state,districts,description}=req.body;
    const geoData = await geocoder.forwardGeocode({
        query: `${districts[0]},${state},India`,
        limit: 1
    }).send();
    const alert=new Alert({disaster,expectedDateTime,state,districts,description});
    alert.geometry=geoData.body.features[0].geometry;
    await alert.save();
    console.log(alert)
    console.log(state);
    console.log(districts);
    const users=await User.find({ state: state});//, districts: { $in: ['districts'] } 
    users.forEach((user) => {
        sendNotification(user,alert);
            const accountSid = process.env.TWILLIOSECRET;
            const authToken = process.env.TWILLIOAUTHTOKEN;
            const client = require('twilio')(accountSid, authToken);

            const toNumber =process.env.TONUM; // the phone number you want to send the SMS to
            const fromNumber =process.env.FROMNUM ; // your Twilio phone number 
            const message = `!!Disaster Alert!!, ${alert.disaster} may occur on ${alert.expectedDateTime}\nPlease be carefull`;

            client.messages
            .create({
                body: message,
                from: fromNumber,
                to: toNumber
            })
            .then((message) => console.log(message.sid));

                })  
                res.redirect("/admin/dashboard");
            }))



async function sendNotification(user,alert) {
    
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
           user: process.env.FROMEMAIL,
           pass: process.env.NODEPASS
         }
      });
      
       
      const mailOptions = {
         from: process.env.FROMEMAIL,
         to: process.env.TOEMAIL,
         subject: `Disasater Alert: ${alert.disaster}`,
         text: `Hello ${user.username},\nThis is a alert that the disaster ${alert.disaster} may occur in your area.\nPlease Be Carefull`
      };
     
      await transporter.sendMail(mailOptions);
      console.log(`Notification email sent for task ${user.username}`);


    }
  







  
app.get('/getItemNames', wrapAsync(async(req, res) => {
    const selectedResource = req.query.resource;
    const selectedCategory = req.query.category;
  
    // Fetch itemNames based on selectedResource and selectedCategory from your database
    // ...
    const resourcecenter=await ResourceCenter.findOne({name:selectedResource});
    let itemnames=[];
    if(selectedCategory==="food"){
        for(let i=0;i<resourcecenter.food.length;i++){
            itemnames.push(resourcecenter.food[i].itemName);
        }
        console.log(itemnames);
        res.json({itemName: itemnames});
    }
  
    
  }));

  app.get('/getQuantities', wrapAsync(async(req, res) => {
    const selectedResource = req.query.resource;
    const selectedCategory = req.query.category;
    const selectedItemName = req.query.itemName;
  
    // Fetch quantities based on selectedResource, selectedCategory, and selectedItemName from your database
    // ...
    const resourcecenter=await ResourceCenter.findOne({name:selectedResource});
    let itemnames;
    if(selectedCategory==="food"){
        for(let i=0;i<resourcecenter.food.length;i++){
           if(resourcecenter.food[i].itemName===selectedItemName){
            res.json({quantities: [resourcecenter.food[i].quantity]});
           }
        }
       
    }
  
  
  }));



//*************volunterr routes */
app.get('/volunteer/dashboard',isVolLoggedIn,wrapAsync(async(req,res)=>{
    const alerts=await Alert.find({});
    const news=await News.find({});
    res.render('volunteers/dashboard',{alerts,news});
}))
app.get('/volunteer/requests',isVolLoggedIn,wrapAsync(async(req,res)=>{
    const requests=await Request.find({}).populate("user").exec();
    console.log(requests[0]);
    res.render('volunteers/requests',{requests});
}))
app.get("/volunteer/request/:id/address",isVolLoggedIn,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const request = await Request.findById(id);
    const resources=await ResourceCenter.find({});
    res.render('volunteers/addressrequests',{resources});
}))



app.get('/volunteer/complaints',isVolLoggedIn,(req,res)=>{
    res.render('volunteers/complaints')
})
app.get('/volunteer/resources',isVolLoggedIn,wrapAsync(async(req,res)=>{
    const resources=await ResourceCenter.find({});
   
    res.render('volunteers/resources',{resources})
}))
app.post("/volunteer/resources/search",isVolLoggedIn,wrapAsync(async(req,res)=>{
    const {resourcecenter,category}=req.body;
    const resourceCenter=await ResourceCenter.findOne({name:resourcecenter});
    console.log(category);
    let resources;
     if(category==="food") { resources = resourceCenter.food ;console.log(resources);}
    else if(category==="money") { resources = resourceCenter.amount ;}
    else if(category==="medicine") { resources = resourceCenter.medicine ;}
    else if(category==="water") { resources = resourceCenter.water ;}
    else  { resources = resourceCenter.clothes ;}
    console.log(resources);
    const amount=resourceCenter.amount;
     res.render("volunteers/searchview",{resources,category,amount});
}))

app.get("/resourcecenter/:id/view",isVolLoggedIn,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const resourcecenter=await ResourceCenter.findById(id);
    const foods=resourcecenter.food;
    const medicines=resourcecenter.medicine;
    const waters=resourcecenter.water;
    const amount=resourcecenter.amount;

    res.render("volunteers/detailview",{foods,medicines,waters,amount});

}))

app.get('/volunteer/signup',(req,res)=>{
    res.render('volunteers/register.ejs')
})
app.get('/volunteer/login',(req,res)=>{
    res.render('volunteers/login.ejs')
})
app.post('/volunteer/login',wrapAsync(async(req,res)=>{
   const {username,password}=req.body;
   const vteer=await Volunteer.findOne({username: username});
   if(!vteer) return res.status(400).json({error:"user not found"});
 
   const valid=await bcrypt.compare(password,vteer.password);
      if(valid){
        req.session.user_id=vteer._id;
    res.redirect("/volunteer/dashboard");
   }else{
    return res.status(400).json({error:"incorrect username or password"});
   } 
   
  
 
}))

app.post('/volunteer/signup',upload.single("image"),wrapAsync(async(req,res)=>{
    const {username,email,phone,experience,password,address,state,district,availability,skills,}=req.body;
    const vteer=await Volunteer.find({email: email});
    if(!vteer) {
        console.log(vteer);
        return res.status(400).json({error: "volunteer with this email exists already"});
    }
    
    const secPass= await bcrypt.hash(password,12);
    const user =await Volunteer.create({username,password:secPass,phone,experience,email,address,state,district,availability,skills});
    user.aadhar.url=req.file.path;
    user.aadhar.fileename=req.file.filename;
   console.log(user.password);
   if(user){
    req.session.user_id=vteer._id;
        res.redirect('/volunteer/dashboard');
   }   
}))

app.listen(3000,()=>{
    console.log("coonnected succesfully");
})