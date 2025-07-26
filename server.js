/**
 * @name: Final Group Project.
 * @Course Code: SODV1201
 * @class: Software Development Diploma program.
 * @author: 457647 - Yosita Jasamut
 */

// Import library or dependencies
var express = require('express');
const session = require('express-session');
var path = require('path');
var fs = require('fs');




var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

// Config Session
const sessionConfig = {
    secret: 'secret',
    resave: true, // save session every request
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000,
};

app.use(session(sessionConfig));


// Check if user_file.json exists or not
const user_file = 'user_file.json' // user account file
const user_exists = fs.existsSync('user_file.json');
let obj_user;

if (user_exists) {
    console.log('loading user file');
    const mydata = fs.readFileSync(user_file, 'utf8'); // Read the file
    obj_user = JSON.parse(mydata); // Parse it back to object
} else { // Otherwise start with a blank array object
    console.log('Created new object');
    obj_user = { user: [] };
}

// Check if property_file.json exists or not
const property_file = 'property_file.json' // properties file
const property_exists = fs.existsSync(property_file);
let obj_property;

if (property_exists) {
    console.log('loading property file');
    const mydata = fs.readFileSync(property_file, 'utf8'); // Read the file
    obj_property = JSON.parse(mydata); // Parse it back to object
} else { // Otherwise start with a blank array object
    console.log('Created new object');
    obj_property = { property: [] };
}


app.get('/', function (req, res) { // localhost:3001 go to index.html file
    res.sendFile(__dirname + "/" + "index.html");
});


app.post('/signin', function (req, res) {
    const response = { // get data
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
        status: req.body.status
    };

    session.user = req.body.name; // define current user account in session

    let reply = {
        msg: 'Not found this user',
    };

    if (!response.email) { // signin mode

        obj_user.user.forEach(element => {

            if (element.name == response.name) {
                if (element.password == response.password) {
                    reply = {
                        msg: element.status
                    };
                    // res.send(reply);
                } else {
                    reply = {
                        msg: 'Wrong password'
                    };
                    // res.send(reply);
                }
            }
        });

        res.send(reply);



    } else { // register mode
        if (!response.name || !response.phone || !response.email || !response.status || !response.password) {
            reply = {
                msg: 'Please complete the form before you submit it',
            };
            res.send(reply);
        } else {
            obj_user.user.push(response);

            const data = JSON.stringify(obj_user, null, 2);
            fs.writeFile(user_file, data, function (err) {
                reply = {
                    status: 'success',
                    msg: 'thank you'
                };
                res.redirect("/"); // go to index.html page
            });
        }
    }
});

app.get('/coworker', (req, res) => {
    const { name, email } = req.query;
    res.sendFile(__dirname + "/" + "coworker.html");

});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + "/" + "register.html");
});

app.get('/owner', (req, res) => {
    res.sendFile(__dirname + "/" + "owner.html");
});

app.get('/property-add', (req, res) => {
    res.sendFile(__dirname + "/" + "property-add.html");
});

app.get('/property-modify', (req, res) => {
    res.sendFile(__dirname + "/" + "property-modify.html");
});

app.get('/property-view', (req, res) => {
    res.sendFile(__dirname + "/" + "property-view.html");
});

app.get('/property-view/:name', function (req, res) {
    const name = req.params.name;

    obj_property.property.forEach(element => {
        if (name == element.name) {
            res.send(name); // provide data each property
        }
    });

});

app.get('/property-delete/:name', function (req, res) {
    const name = req.params.name;

    for (var i = 0; i < obj_property.property.length; i++) {
        if (obj_property.property[i].name == name) {
            obj_property.property.splice(i, 1); // delete property
        }
    }

    const data = JSON.stringify(obj_property, null, 2);
    fs.writeFile(property_file, data, function (err) {
        res.redirect('/owner'); // go to owner home page
    });
});

app.post('/property-obj', function (req, res) { // add new property
    var parking = "true";
    if (!req.body.parking) {
        parking = "false";
    }
    var public_transportation = "true";
    if (!req.body.public_transportation) {
        public_transportation = "false";
    }
    const response = {
        name: req.body.name,
        address: req.body.address,
        squarefeet: req.body.squarefeet,
        neighborhood: req.body.neighborhood,
        parking: parking,
        public_transportation: public_transportation,
        owner: session.user,
        workspace: []
    };

    if (!response.name || !response.address || !response.squarefeet || !response.neighborhood) {
        const reply = {
            msg: 'Please complete the form before you submit it',
        };
        res.send(reply);
        console.log(reply);

    } else {
        let modify = false;
        for (var i = 0; i < obj_property.property.length; i++) {
            if (obj_property.property[i].name == response.name) { // check if property exist, it's mean update data of property
                obj_property.property[i].name = req.body.name;
                obj_property.property[i].address = req.body.address;
                obj_property.property[i].squarefeet = req.body.squarefeet;
                obj_property.property[i].neighborhood = req.body.neighborhood;
                obj_property.property[i].parking = parking;
                obj_property.property[i].public_transportation = public_transportation;
                modify = true;
            }
        }
        if(modify==false){ // if new property, push data to property obj
            obj_property.property.push(response);
        }
        

        const data = JSON.stringify(obj_property, null, 2);
        fs.writeFile(property_file, data, function (err) {
            res.redirect('/owner'); // go to owner home page
        });
    }
});


app.post('/workspace-add', function (req, res) {  // add workspace
    const property = req.body.property;

    var smoking = "true";
    if (!req.body.smoking) {
        smoking = "false";
    }
    var pet = "true";
    if (!req.body.pet) {
        pet = "false";
    }

    const response = {
        type: req.body.type,
        seats: req.body.seats,
        date: req.body.date,
        lease: req.body.lease,
        price: req.body.price,
        smoking: smoking,
        pet: pet
    };

    if (!response.type || !response.seats || !response.lease || !response.price) {
        const reply = {
            msg: 'Please complete the form before you submit it',
        };
        res.send(reply);
        console.log(reply);

    } else {
        for (var i = 0; i < obj_property.property.length; i++) {
            if (obj_property.property[i].name == property) {
                obj_property.property[i].workspace.push(response);
            }
        }

        const data = JSON.stringify(obj_property, null, 2);
        fs.writeFile(property_file, data, function (err) {
            res.redirect('/property-modify?name=' + property);
        });
    }
});


app.get('/workspace-delete/:property/:id', function (req, res) { // delete workspace
    const property = req.params.property;
    const id = req.params.id;

    for (var i = 0; i < obj_property.property.length; i++) {
        if (obj_property.property[i].name == property) {
            obj_property.property[i].workspace.splice(id, 1);
        }
    }
    const data = JSON.stringify(obj_property, null, 2);
    fs.writeFile(property_file, data, function (err) {
        res.redirect('/property-modify?name=' + property);
    });
});

app.post('/workspace-modify/:property/:id', function (req, res) { // modify workspace information
    const property = req.params.property;
    const id = req.params.id;

    var smoking = "true";
    if (!req.body.smoking) {
        smoking = "false";
    }
    var pet = "true";
    if (!req.body.pet) {
        pet = "false";
    }

    const response = {
        type: req.body.type,
        seats: req.body.seats,
        date: req.body.date,
        lease: req.body.lease,
        price: req.body.price,
        smoking: smoking,
        pet: pet
    };

    for (var i = 0; i < obj_property.property.length; i++) {
        if (obj_property.property[i].name == property) {

            obj_property.property[i].workspace[id] = response;
        }
    }
    const data = JSON.stringify(obj_property, null, 2);
    fs.writeFile(property_file, data, function (err) {
        res.redirect('/property-modify?name=' + property);
    });
});


app.get('/user-data', function (req, res) { // response all user acoount data in json format
    res.send(obj_user);
});

app.get('/user-data/:name', function (req, res) { // response all information of user by name
    const name = req.params.name;
    let data;
    for (var i = 0; i < obj_user.user.length; i++) {

        if (obj_user.user[i].name == name) {
            data = obj_user.user[i]
        }
    }
    res.send(data);
});

app.get('/property-data', function (req, res) { // response all property data
    res.send(obj_property);
});

app.get('/property-data/:name', function (req, res) { // response all information of property by name
    const name = req.params.name;
    let data;
    for (var i = 0; i < obj_property.property.length; i++) {
        if (obj_property.property[i].name == name) {
            data = obj_property.property[i]
        }
    }
    res.send(data);
});

app.get('/workspace-data/:property', function (req, res) { // response workspace data by property's name
    const name = req.params.property;
    let data;
    for (var i = 0; i < obj_property.property.length; i++) {
        if (obj_property.property[i].name == name) {
            data = obj_property.property[i].workspace;
        }
    }
    res.send(data);
});

app.get('/workspace-data/:property/:id', function (req, res) { // response workspace data by property's name and workspace's id
    const name = req.params.property;
    const id = req.params.id;
    let data;

    for (var i = 0; i < obj_property.property.length; i++) {
        if (obj_property.property[i].name == name) {
            data = obj_property.property[i].workspace[id];
        }
    }
    res.send(data);
});

app.get('/workspace-data', function (req, res) { // response workspace data with information of property
    let data = [];

    for (var i = 0; i < obj_property.property.length; i++) {
        if (obj_property.property[i].workspace) {
            for (var j = 0; j < obj_property.property[i].workspace.length; j++) {
                let element = obj_property.property[i].workspace[j];
                element.property = obj_property.property[i].name;
                element.address = obj_property.property[i].address;
                element.squarefeet = obj_property.property[i].squarefeet;
                element.neighborhood = obj_property.property[i].neighborhood;
                element.parking = obj_property.property[i].parking;
                element.public_transportation = obj_property.property[i].public_transportation;
                data.push(element);
            }
        }
    }
    res.send(data);
});


app.get('/user-name', function (req, res) { // response user data of current user who using website
    for (var i = 0; i < obj_user.user.length; i++) {
        if (obj_user.user[i].name == session.user) {
            res.send(obj_user.user[i]);
        }
    }
});

app.get('/signout', function (req, res) { // sign out
    session.user = ''; // clear data of current user
    res.redirect("/");
});

// start the server in the port 3001
var callback = function () {
    console.log('Example app listening on port 3001');
}
app.listen(3001, callback);