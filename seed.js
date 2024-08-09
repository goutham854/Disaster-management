
const mongoose=require('mongoose')
const ResourceCenter=require("./model/resourceCenter")



mongoose.connect("mongodb://127.0.0.1:27017/crisis")

const db=mongoose.connection
db.on("error",console.error.bind(console,"connection error"))
db.once("open",()=>{
    console.log("database connected succesfully")
})


const seedDB = async () => {
    const districts = [ "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (Rural)", "Warangal (Urban)", "Yadadri Bhuvanagiri", "Jogulamba Gadwal", "Mulugu", "Narayanpet" ];
    for(let i=0;i<33;i++){
        const resourceCenter=new ResourceCenter({
            name:`RC-${districts[i]}`,
            address:`Collector Office, ${districts[i]},Telangana`,
            food:[{
                itemName:"bread",
                quantity:1000,
                expiryDate:new Date("2024-02-24")
            },
            {
                itemName:"milk",
                quantity:3000,
                expiryDate:new Date("2024-02-25")
            },
            {
                itemName:"cookedrice",
                quantity:5000,
                expiryDate:new Date("2024-02-24")
            }],
            medicine:[
                {
                    itemName:"dolo-650",
                    quantity:5000,
                    
                },
                {
                    itemName:"cheston-cold",
                    quantity:5000,
                    
                },
                {
                    itemName:"paracetamol",
                    quantity:5000,
                    
                }
            ],
            water:[{
                itemName:"bisleri-bottle-1ltr",
                quantity:10000
            },
            {
                itemName:"tata-bottle-250ml",
                quantity:10000
            },
            {
                itemName:"aqua-bottle-1ltr",
                quantity:10000
            }
        ],
        amount:10000000000,
            
        })
        await resourceCenter.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})