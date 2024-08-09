const User=require("./model/user");
const Volunteer=require("./model/volunter")
const isUserLoggedIn = async(req, res, next) => {
    if (!req.session.user_id) {
        
       
        return res.redirect('/login');
   
    }
    if(req.session.user_id){
        const user=await User.findById(req.session.user_id);
        if(!user){
            return res.redirect('/login');
        }
    }
    next();
}

const isVolLoggedIn = async(req, res, next) => {
    if (!req.session.user_id) {
        
       
        return res.redirect('/volunteer/login');
   
    }
    if(req.session.user_id){
        const volunteer=await Volunteer.findById(req.session.user_id);
        if(!volunteer){
            return res.redirect('/volunteer/login');
        }
    }
    next();
}

module.exports={isUserLoggedIn,isVolLoggedIn};
