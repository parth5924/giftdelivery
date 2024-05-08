const express = require('express');
var cors = require('cors');
const app = express();
const port = 3000;
const router = express.Router();

// These lines will be explained in detail later in the unit
app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
// These lines will be explained in detail later in the unit

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://12216019:parth5924@cluster0.be44lcs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Global for general use
var userCollection;
var orderCollection;

client.connect(err => {
   userCollection = client.db("giftdelivery").collection("users");
   orderCollection = client.db("giftdelivery").collection("orders");
   

  // perform actions on the collection object
  console.log ('Database up!\n')
 
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})
// Route to handle user registration
app.post('/register', async (req, res) => {
    const userData = req.body;

    try {
        // Check if user already exists with the provided email
        const existingUser = await userCollection.findOne({ email: userData.email });

        if (existingUser) {
            // User already exists, send a response to prompt login
            return res.status(409).json({ message: 'Email already registered. Please log in.' });
        }

        // Insert user data into MongoDB
        const result = await userCollection.insertOne(userData);
        console.log('User registered successfully:', result.acknowledged);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Failed to register user:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
});

 
app.get('/getUserDataTest', (req, res) => {

	userCollection.find({}, {projection:{_id:0}}).toArray( function(err,docs) {
		if(err) {
		  console.log("Some error.. " + err + "\n");
		} else {
		   console.log( JSON.stringify(docs) + " have been retrieved.\n");
		   var str = "<h1>" + JSON.stringify(docs) + "</h1>"
		   str+= "<h1> Error: " +  err +  "</h1>"
		   res.send(str); 
		}

	});

});

app.get('/getOrderDataTest', (req, res) => {

	orderCollection.find({},{projection:{_id:0}}).toArray( function(err,docs) {
		if(err) {
		  console.log("Some error.. " + err + "\n");
		} else {
		   console.log( JSON.stringify(docs) + " have been retrieved.\n");
		   var str = "<h1>" + JSON.stringify(docs) + "</h1>"
		   str+= "<h1> Error: " +  err +  "</h1>"
		   res.send(str); 
		}

	});

});



app.post('/verifyUser', (req, res) => {

	loginData = req.body;

	console.log(loginData);

	userCollection.find({email:loginData.email, password:loginData.password}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  console.log("Some error.. " + err + "\n");
		} else {
		    console.log(JSON.stringify(docs) + " have been retrieved.\n");
		   	res.status(200).send(docs);
		}	   
		
	  });

});

// app.get('/getOrderData', (req, res) => {

// 	orderCollection.find({}, {projection:{_id:0}}).toArray( function(err, docs) {
// 		if(err) {
// 		  console.log("Some error.. " + err + "\n");
// 		} else {
// 		   console.log( JSON.stringify(docs) + " have been retrieved.\n");
// 		   res.json(docs);
// 		}	   
		
// 	  });

// });


app.get('/getOrderData/:email/:firstName/:lastName', (req, res) => {
    const email = req.params.email;
    const firstName = req.params.firstName;
    const lastName = req.params.lastName;

    // Find orders for the given first name and last name
    orderCollection.find({ customerfName: firstName, customerlName: lastName }, { projection: { _id: 0 } }).toArray(function(err, docs) {
        if (err) {
            console.log("Error: " + err);
            res.status(500).json({ error: "Failed to retrieve orders" });
        } else {
            console.log("Orders for user " + firstName + " " + lastName + " retrieved successfully");
            res.json(docs);
        }
    });
});
// ---------------------------------Delete Orders---------
app.delete('/deleteUserOrders', (req, res) => {
    const customerfName = req.body.firstName;
    const customerlName = req.body.lastName;
    console.log(customerfName);
    console.log(customerlName);

    // Delete orders for the given user
    orderCollection.deleteMany({ customerfName: customerfName, customerlName: customerlName }, function(err, result) {
        if (err) {
            console.log("Error: " + err);
            res.status(500).json({ error: "Failed to delete orders" });
        } else {
            const deletedOrdersCount = result.deletedCount || 0;
            console.log(`Deleted ${deletedOrdersCount} orders for user ${customerfName} ${customerlName}`);
            res.json({ deletedOrdersCount });
        }
    });
});



app.post('/postOrderData', function (req, res) {
    
    console.log("POST request received : " + JSON.stringify(req.body)); 
    
    orderCollection.insertOne(req.body, function(err, result) {
	       if (err) {
				console.log("Some error.. " + err + "\n");
	       }else {
			    console.log(JSON.stringify(req.body) + " have been uploaded\n"); 
		    	res.send(JSON.stringify(req.body));
		 }
		
	});
       

});


  
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`) 
});
