const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const app = express();
// this is the new instance of express

app.use(express.static("public"));
// public is a folder where we keep static details
app.use(bodyParser.urlencoded({extended: true}));
app.get("/", function(req, res){
    res.sendFile(__dirname + "/signup.html");
});

// now we have to do post route... i.e. to fetch the details typed by user, body parser is used for that

app.post("/", function(req, res){
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const email = req.body.email;

    // console.log(firstName, lastName, email);
    // we can pull up the values by referring to name tag in html

    // create JS Object which we will be sending to mailchimp API
    const data = {
        // in mailchimp.com-> request body paramters has key members
        //it represents array of objects -> email address + subscription status for specific list, each has some properties
        members: [
            {
                email_address: email, 
                status: "subscribed", 
                merge_fields: {
                    FNAME: firstName, 
                    LNAME: lastName
                }
            }
        ]
    };

    // we need flat JSON
    const jsonData = JSON.stringify(data);

    // https.get(url, function());
    // from this we only get the getRequests, but we want to post data to external resources

    const url = "https://us9.api.mailchimp.com/3.0/lists/0c9be541ac";
    // we have added the listID where we want our subscribers to be added

    const options = {
        method: "POST", 
        auth: "dhruv24: d7a84ef80549524ed6acb23d35e3f549-us9"
        // we have pasted the API key such that us9 -> this 9 should match with us9.api in url....
    }
    const request = https.request(url, options, function(response){
        if(response.statusCode === 200){
            // res.send("Successfully Subscribed");
            res.sendFile(__dirname + "/success.html")
        } else{
            // res.send("There was an error with signing up, please try again!");
            res.sendFile(__dirname + "/failure.html");
        }
        response.on("data", function(data){
            // we need to see what mailchimp sent to us
            console.log(JSON.parse(data));
        })
    });

    request.write(jsonData);
    request.end();
});


app.post("/failure", function(req,res){
    res.redirect("/");
});
app.listen(process.env.PORT || 3004, function(){
    console.log("Server is running on port 3004");
});
// since this is running on 3004
// but we need it to have on dynamic port assigned by heroku's server so add for heroku server as well
// we can test both locally and for heroku server

