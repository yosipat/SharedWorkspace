const { response } = require("express");
var username;

function getusername() {
    const f = fetch('http://localhost:3001/user-name');
    f.then(response => response.json()).then((json) => {
        username = json.name;
        document.getElementById('name').innerHTML = "(" + username + ")";
    });
}

function signin() {
    const url = 'http://localhost:3001/signin';

    let username = document.getElementById('name').value;
    let password = document.getElementById('password').value;

    let data = {
        name: username,
        password: password
    }

    fetch(url, {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },

        //make sure to serialize your JSON body
        body: JSON.stringify(data)
    })
        .then(response => response.json()).then((json) => {
            //do something awesome that makes the world a better place
            let response = json.msg;
            if (response == 'owner') {
                window.location.replace("http://localhost:3001/owner");
            }
            else if (response == 'coworker') {
                window.location.replace("http://localhost:3001/coworker");
            } else {
                alert(response);
            }
        });
}


var obj_property;

function property_data(sort) {
    const f = fetch('http://localhost:3001/property-data');
    f.then(Response => Response.json())
        .then((data) => {

            obj_property = data.property;
            console.log(obj_property);

            if (sort != '') {
                obj_property = obj_property.sort(sort);
            }

            lists();
        });
}

function lists() { // lists of property on owner page
    console.log(obj_property);
    console.log(username);
    var p = obj_property;
    var lists = "";
    p.forEach(element => {
        if (element.owner == username) {

            lists += `<div class="col">
            <div class="card" style="width:100%;height:100%;">
                <img src="bg4.jpg" class="card-img-top" style="height:200px;object-fit:cover;">
                <div class="card-body">
                    <h5 class="card-title text-primary">${element.name} </h5>
                    <p class="card-text"><small>${element.address}<br>${element.neighborhood}
                    <ul class="">
                    <li>${element.squarefeet} sq ft</li>
                    <li>Parking - ${element.parking}</li>
                    <li>Public transportation - ${element.public_transportation}</li>
                    </ul></small>
                    </p>
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-primary" onclick="location.href='http://localhost:3001/property-modify?name=${element.name}'">Add workspace</button>
                        <button type="button" class="btn btn-sm btn-warning" onclick="location.href='http://localhost:3001/property-add?name=${element.name}'">Modify</button>
                        <button type="button" class="btn btn-sm btn-danger" onclick="location.href='http://localhost:3001/property-delete/${element.name}'">Delete</button>
                    </div>
                </div>
            </div>
        </div>`
            console.log(element.name);
        }
    });
    document.getElementById('lists').innerHTML = lists;
}


var obj_workspace;

function workspace_data(property, user) {
    if (property != null) {
        const f = fetch('http://localhost:3001/workspace-data/' + property);
        f.then(Response => Response.json())
            .then((data) => {

                obj_workspace = data;
                console.log(obj_workspace);

                list_workspace(property, user);
            });
    }
}

function list_workspace(property, user) { // lists of workspace as table on details page
    console.log(obj_workspace);
    var p = obj_workspace;
    var lists = '<table class="table table-striped table-hover align-text-center" style="vertical-align: middle;">';
    let id = 0;
    p.forEach(element => {

        // console.log(element);

        lists += `<tr>
          <td>
                 <img src="icon7.png" style="height:60px;">
                    </td>
                    <td>
                   <b class="text-primary">${element.type}</b><br>
                   <small>Seat(s) : <i class="text-primary">${element.seats}</i><br>
                Availability date : <i class="text-primary">${element.date}</i><br>
                Lease term : <i class="text-primary">${element.lease} day(s)</i></small>
                    </td>
                    <td>             
             <small>Smoking - ${element.smoking}<br>
             Pet-friendly - ${element.pet}</small>
                    </td>
                      <td>             
                <i class="text-success">${element.price} CAD</i>
                    </td>`
        if (user == "owner") {
            lists += `<td><button type="button" class="btn btn-sm btn-outline-warning" onclick="location.href='http://localhost:3001/property-modify?name=${property}&workspace=${id}'">Modify</button>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="location.href='http://localhost:3001/workspace-delete/${property}/${id}'">Delete</button>`
        }

        lists += `</tr>`

        id++;


    });
    document.getElementById('lists').innerHTML = lists + '</table>';
}

function workspace_all(filter) { // lists of workspace on coworker page

    const f = fetch('http://localhost:3001/workspace-data');
    f.then(Response => Response.json())
        .then((data) => {

            obj_workspace = [];

            if (filter != null) {
                let text = document.getElementById('text').value;
                let neighborhood = document.getElementById('neighborhood').value;
                let seats = document.getElementById('seats').value;
                let sqft = document.getElementById('sqft').value;
                let lease = document.getElementById('lease').value;
                let price = document.getElementById('price').value;

                let parking = document.getElementById('parking').checked;
                let public_transportation = document.getElementById('public_transportation').checked;
                let smoking = document.getElementById('smoking').checked;
                let pet = document.getElementById('pet').checked;

                // Filter by search
                data = data.filter((data) => data.property.includes(text) || data.type.includes(text) || data.address.includes(text));
                data = data.filter((data) => data.neighborhood.includes(neighborhood));
                data = data.filter((data) => parseInt(data.seats) > seats);
                data = data.filter((data) => parseInt(data.squarefeet) > sqft);
                data = data.filter((data) => parseInt(data.lease) > lease);
                data = data.filter((data) => parseInt(data.price) > price);

                if (parking) {
                    data = data.filter((data) => data.parking == "true");
                }

                if (public_transportation) {
                    data = data.filter((data) => data.public_transportation == "true");
                }
                if (pet) {
                    data = data.filter((data) => data.pet == "true");
                }
                if (smoking) {
                    data = data.filter((data) => data.smoking == "true");
                }

            }

            obj_workspace = data;
            console.log(obj_workspace);

            var lists = "";
            obj_workspace.forEach(element => {

                var parking = "text-decoration-line-through";
                var public_transportation = "text-decoration-line-through";
                var pet = "text-decoration-line-through";
                var smoking = "text-decoration-line-through";
                if (element.parking == 'true') {
                    parking = "text-success";
                }

                if (element.public_transportation == 'true') {
                    public_transportation = "text-success";
                }

                if (element.pet == 'true') {
                    pet = "text-success";
                }

                if (element.smoking == 'true') {
                    smoking = "text-success";
                }



                lists += `<div class="col"><div class="card mb-3" style="max-width: 540px;">
  <div class="row g-0">
    <div class="col-md-4 align-text-center justify-contents-center d-flex text-center">
      <img src="bg4.jpg" class="card-img-top" style="width:100%; object-fit:cover">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title text-primary"><a href="http://localhost:3001/property-view?name=${element.property}">${element.type}</a></h5>
        <p class=""><small><b>${element.property}</b> - ${element.neighborhood} - (${element.squarefeet} sqft.)<br>${element.address}</small></p>
        <p class="card-text"><small>
        Available on ${element.date}<br>
      <span class="badge text-bg-success">${element.lease} day(s)</span>
      <span class="badge text-bg-warning">${element.seats} seat(s)</span>
    
  <li class="form-check-inline ${parking}">parking</li>
  <li class="form-check-inline ${public_transportation}">public transportation</li>
  <li class="form-check-inline ${smoking}">smoking</li>
    <li class="form-check-inline ${pet}">pet-friendly</li>
</small>
        </p>
        <h4 class="card-text text-end text-primary"">${element.price} CAD</h4>
      </div>
    </div>
  </div>
</div></div>`
            });
            document.getElementById('lists').innerHTML = lists;

        });

}



