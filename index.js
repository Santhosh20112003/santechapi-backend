const express = require ("express");
const cors = require ("cors");
const mongoose = require ("mongoose");
const dotenv = require ("dotenv");
const UserModel = require ('./models/users.js');
const apihubModel = require ("./models/apihub.js");
const decodeToken = require ('./verify.js');
const jwt = require ('jsonwebtoken');

dotenv.config();

const app = express();
const port = 5000;

app.use(cors({
  origin:["https://santechapihubs.vercel.app"],
  methods:["GET","POST","DELETE","PUT"],
  credentials:true
}));
app.use(express.json());

mongoose
  .connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("MongoDB database connection established successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); 
  });
  

  app.get("/", (req, res) => {
    res.send("Welcome to Santhosh Technologies Api Hub Backend");
  });

app.get('/getapiKeys',decodeToken,(req,res)=>{
  const email = req.userdetails.email;

  UserModel.find({ email: email }, { tokens: 1 })
  .then(user => {
    if (user) {
      const apiKeys = user[0].tokens;
      res.json(apiKeys);
    } else {
      res.status(404).json('User not found');
    }
  })
  .catch(err => {
    res.status(400).json('Error: ' + err);
  });

})

app.get('/getcounts',decodeToken,async(req,res)=>{
  const email = req.userdetails.email;

  try{
    const apiResults = await UserModel.find({email:email});
    const Results = await apihubModel.find();
    if(apiResults){
      const details = apiResults[0];
      res.json({"apicount":details.subscribed.length,"apikeycount":details.tokens.length,"totalcount":Results.length});
    }
    else{
      res.status(404).json('Unable to fetch details.');
    }
  }
  catch(error){
    res.status(400).json('Error: ' + err);
  }
  
})

app.get('/getallapis', decodeToken, async (req, res) => {
  try {
    const email = req.userdetails.email;

    const apiResults = await apihubModel.find();

    if (apiResults) {
      const userModel = await UserModel.findOne({ email }, { subscribed: 1 });

      const subscribedApis = userModel ? userModel.subscribed : [];

      const updatedResults = apiResults.map((api) => {
        const isSubscribed = subscribedApis.includes(api.name);
        return {
          ...api._doc,
          subscribed: isSubscribed,
        };
      });

      res.json(updatedResults);
    } else {
      res.status(404).json('Unable to fetch details.');
    }
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

app.get('/getapis',(req,res)=>{

  try{
    apihubModel.find()
    .then(result=>{
      if(result) {
        res.json(result);
      } else {
        res.status(404).json('Unable to fetch details.');
      }
    })
    .catch(err=>{
      res.status(400).json('Error: ' + err);
    })
  }
  catch(err){
    res.status(400).json('Error: ' + err);
  }

})

app.get('/getsubscribedapis', decodeToken, (req, res) => {
  const email = req.userdetails.email;

  UserModel.findOne({ email: email }, { subscribed: 1 })
    .then(user => {
      if (user) {
        const apiKeys = user.subscribed;
        apihubModel.find({ name: { $in: apiKeys } })
          .then(result => {
            res.json(result);
          })
          .catch(err => {
            res.status(404).json('Details not found');
          });
      } else {
        res.status(404).json('Details not found');
      }
    })
    .catch(err => {
      res.status(400).json('Error: ' + err);
    });
});
 
app.get('/createapikey', decodeToken, (req, res) => {
  const email = req.userdetails.email;
  UserModel.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.tokens.length >= 3) {
          return res.status(403).json('API key limit reached');
        }

        const token = jwt.sign({ email }, process.env.ADMIN_SECRET_KEY);
        user.tokens.push(token);

        user.save()
          .then(() => {
            res.json({ token: token });
          })
          .catch(err => {
            res.status(400).json('Error: ' + err);
          });
      } else {
        const token = jwt.sign({ email }, process.env.ADMIN_SECRET_KEY);
        const newUser = new UserModel({
          email: email,
          tokens: [token]
        });

        newUser.save()
          .then(() => {
            res.json({ token: token });
          })
          .catch(err => {
            res.status(400).json('Error: ' + err);
          });
      }
    })
    .catch(err => {
      res.status(400).json('Error: ' + err);
    })
    .finally(() => {
      console.log('API Key creation process completed');
    });
});

app.delete('/deleteapiKeys/:token',decodeToken, (req, res) => {
  const email = req.userdetails.email;
  const apikey = req.params.token;

  UserModel.updateOne(
    {
      email: email,
      tokens: apikey
    },
    {
      $pull: {
        tokens: apikey
      }
    }
  )
    .then((result) => {
      console.log(result)
      if (result.modifiedCount > 0) {
        res.sendStatus(200); 
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500); 
    });
    console.log(`Api Key Deleted ${apikey}`)
});

app.get('/addSubscribeApi/:api', decodeToken, (req, res) => {
  const email = req.userdetails.email;
  const api = req.params.api;

  UserModel.findOneAndUpdate(
    { email: email },
    { $addToSet: { subscribed: api } },
    { new: true }
  )
    .then((user) => {
      if (user) {
        res.status(200).json({ email: user.email, subscribed: user.subscribed });
      } else {
        res.status(403).json({ message: "User not found" });
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "Error appending element", error: error });
    });
});

app.get('/removeSubscribeApi/:api', decodeToken, (req, res) => {
  const email = req.userdetails.email;
  const api = req.params.api;

  UserModel.findOneAndUpdate(
    { email: email },
    { $pull: { subscribed: api } },
    { new: true }
  )
    .then((user) => {
      if (user) {
        res.status(200).json({ email: user.email, subscribed: user.subscribed });
      } else {
        res.status(403).json({ message: "User not found" });
      }
    })
    .catch((error) => {
      res.status(400).json({ message: "Error removing element", error: error });
    });
});
             
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});