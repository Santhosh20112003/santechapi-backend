import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UserModel from './models/users.js';
import apihubModel from "./models/apihub.js";
import decodeToken from './verify.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => {
    console.log("MongoDB database connection established successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
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

app.get('/getallapis',(req,res)=>{

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
  console.log(email, apikey);

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

                                                     
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});