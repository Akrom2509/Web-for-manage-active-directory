var express = require('express');
var app = express();
const path = require("path");
var ldap = require('ldapjs');
var UserAdd1;// username add by super admin >>use in enable user
var UserAdd2;// username add by admin>> use in enable user
var base;//keep root of user >> user use to search 
var base2; // keep root of OU >> admin use to search the user in specific OU
var ouname;// keep root of every admin use for bind
var ouname2;//keep OU name in user login(user need to identify its OU)
var userName;
var userName2;
var newpass;
var newpass2;
var Changepass =[]; //use for make change in normal user
var Changepass2 =[]; //use for make change for newuser and admin
var usernameN;// keep username in user login
var passwordN;// keep password in user login
var pass= "XXXXXX";//use for bind every user that need some specific privilage
var username4= "CN=Administrator,CN=Users,DC=mfu,DC=ac,DC=th" //use for bind every user that need some specific privilage
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); 
app.use(express.static(__dirname+'/public'));
//ldap connection
var options ={
  url: 'ldap://X.X.X.X:389'
  //,tlsOptions: tlsOptions
  //ldaps://plat.com:636',tlsOptions: tlsOptions
 // reconnect:true
}
var client = ldap.createClient(options);
    client.on('error',function(err){
      console.warn('reconnect',err);
    });
///login admin
app.post("/login3", function (req, res) {
  let username2 = req.body.username;
  let password = req.body.password;
  let succes= "/welcome3";
  let fail= "fail";
 
 let username ="CN="+username2+",OU=Admin,DC=mfu,DC=ac,DC=th";
 let username3 ="OU="+username2+",DC=mfu,DC=ac,DC=th";
 
 console.log(username);

 client.bind(username, password, function(err) {
  if(err)
  {
    res.send(fail)
      console.log("Error in new connection"+err)
      

  }else{
    ouname = username2;
    app.put("/test2",function(req,res){
      res.send(ouname)
    
    })
      console.log("Success");
      res.send(succes)
      console.log(username3)
      base2 = username3;  
      client.bind(username4, pass, function(err) {
        if(err)
        {
            console.log("Error in new connection"+err)
        }else{
      console.log("Success");   }})
      app.put("/adminuser",function(req,callback){
        var results = [];
        var opts = {
          filter: '(objectClass=*)',
          scope: 'sub',
          attributes: ['sn', 'cn','mail','name','userPrincipalName','uid','givenName','sAMAccountName']
      };
      console.log(base2)
      
        client.search(base2, opts, function (err, res) {
          if (err) {
              console.log("Error in search" + err)
          } else {
              res.on('searchEntry', function (entry) {
                  if (entry.object.cn) {
                     // console.log('entry: ' + JSON.stringify(entry.object));
                       //use this if you want only some fields
                       var ldapUserDetails={};
                       ldapUserDetails.sn = entry.object.sn 
                       ldapUserDetails.cn = entry.object.cn;
                       ldapUserDetails.mail = entry.object.mail;
                       ldapUserDetails.name = entry.object.name;
                       ldapUserDetails.userPrincipalName = entry.object.userPrincipalName;
                       ldapUserDetails.uid = entry.object.uid;
                       ldapUserDetails.givenName = entry.object.givenName;
                       ldapUserDetails.sAMAccountName = entry.object.sAMAccountName;

                       //  var ldap=[];
                      // var ldap = [ldapUserDetails.cn ,ldapUserDetails.sn]
                      //  var jsonArray = JSON.parse(JSON.stringify(ldapUserDetails.sn))
                      //  results.push(jsonArray);
                      // results.push(ldap);
                      results.push(ldapUserDetails);
                      // results.push(entry.object);
                  }
                 
              });
              res.on('searchReference', function (referral) {
                  console.log('referral: ' + referral.uris.join());
              });
              res.on('error', function (err) {
                  console.error('error: ' + err.message);
              });
              res.on('end', function (result) {
                  console.log('status: ' + result.status);
                  return callback.json({
                      statusCode: 200,
                      message: "success",
                      data: results
                  });
               
              });
            }
          });
        });  
     
      }
  });
});

///login user
app.post("/login2", function (req, res) {
  // let username2 = req.body.username;
  usernameN = req.body.username;
  passwordN = req.body.password;
  ouname2 =req.body.ou;
  let succes= "/welcome2";
  let fail= "fail";

  client.bind(username4,pass, function (err) {
    if (err) {
        console.log("Error in new connection"+err)
    }
    else {
        console.log("success")   
    

    var opts = {
        filter: '(sAMAccountName='+usernameN+')',
        scope: 'sub',
        attributes: ['cn']
      };
    client.search('OU='+ouname2+',DC=mfu,DC=ac,DC=th', opts, function (err, res) {

        if(err){
            console.log("Error in search" + err)
        }else{

        res.on('searchEntry', function(entry) {
          CNauthen(entry.object.cn,passwordN,ouname2)
          UserCN=entry.object.cn;
          console.log('entry: ' + JSON.stringify(entry.object.cn));

        });
        
      }
    });
  }
});
function CNauthen(CN,pass,ou){
let username ="CN="+CN+",OU="+ou+",DC=mfu,DC=ac,DC=th";
 
 console.log(username);
 console.log(usernameN);
 console.log(passwordN);


 client.bind(username, pass, function(err) {
  if(err)
  {
    res.send(fail)
      console.log("Error in new connection"+err)
      

  }else{
      console.log("Success");
      res.send(succes)
      console.log(username)
      base = username;    
      client.bind("CN=Administrator,CN=Users,DC=mfu,DC=ac,DC=th", "XXXXXXXX", function(err) {
        if(err)
        {
            console.log("Error in new connection"+err)
        }else{
      console.log("Success");  }})
      app.put("/specificuser",function(req,callback){
        var results = [];
        var opts = {
          filter: '(objectClass=*)',
          scope: 'sub',
          attributes: ['sn', 'cn','mail','name','physicalDeliveryOfficeName','userPrincipalName','uid','givenName','sAMAccountName']
      };
      console.log(base)
      
        client.search(base, opts, function (err, res) {
          if (err) {
              console.log("Error in search" + err)
          } else {
              res.on('searchEntry', function (entry) {
                  if (entry.object.cn) {
                     // console.log('entry: ' + JSON.stringify(entry.object));
                       //use this if you want only some fields
                       var ldapUserDetails={};
                       ldapUserDetails.sn = entry.object.sn 
                       ldapUserDetails.cn = entry.object.cn;
                       ldapUserDetails.mail = entry.object.mail;
                       ldapUserDetails.name = entry.object.name;
                       ldapUserDetails.physicalDeliveryOfficeName = entry.object.physicalDeliveryOfficeName;
                       ldapUserDetails.userPrincipalName = entry.object.userPrincipalName;
                       ldapUserDetails.uid = entry.object.uid;
                       ldapUserDetails.givenName = entry.object.givenName;
                       ldapUserDetails.sAMAccountName = entry.object.sAMAccountName;
                       //  var ldap=[];
                      // var ldap = [ldapUserDetails.cn ,ldapUserDetails.sn]
                      //  var jsonArray = JSON.parse(JSON.stringify(ldapUserDetails.sn))
                      //  results.push(jsonArray);
                      // results.push(ldap);
                      results.push(ldapUserDetails);
                      // results.push(entry.object);
                  }
              });
              res.on('searchReference', function (referral) {
                  console.log('referral: ' + referral.uris.join());
              });
              res.on('error', function (err) {
                  console.error('error: ' + err.message);
              });
              res.on('end', function (result) {
                  console.log('status: ' + result.status);
                  return callback.json({
                      statusCode: 200,
                      message: "success",
                      data: results
                  });
               
              });
            }
          });
        });  
      }
  });
 
}
});
//use in Changepassword page
app.get("/Username",function(req,res){
  res.send(usernameN);
})
//login for super admin    
app.post("/login", function (req, res) {
  const username2 = req.body.username;
  const password = req.body.password;
  let succes= "/welcome";
  let fail= "fail";
 
// const username2 = "Administrator";
// const password = "Nantapong1998";


let username ="CN="+username2+",CN=Users,DC=mfu,DC=ac,DC=th"


 client.bind(username, password, function(err) {
  if(err)
  {
    res.send(fail)
      console.log("Error in new connection"+err)
      

  }else{        
       console.log("Success");
       res.send(succes)
  
  }

});
  });

app.post("/test3",function(req,res){
  ouname2 =req.body.ouname;
  console.log(ouname2)
  res.send(ouname2);
})
//Change for normal user
app.put("/change",function(req,res){
  userName =req.body.username;
  newpass =req.body.newpass;
   Changepass = [userName,newpass]; 
    res.send("success");   
   console.log("succcess")
  console.log(Changepass);
})
//change for admin/newuser/
app.put("/change2",function(req,res){
  userName2 =req.body.username;
  newpass2 =req.body.newpass;
   Changepass2 = [userName2,newpass2]; 
   res.send("success");
  
})
//change for admin/newuser/
app.get("/chang4", function (req, res) {
 if(userName2 != null && newpass2 != null){
  res.send(Changepass2);
  Changepass2=[];
 }else{
  let arraytest2=[];
  res.send(arraytest2)
 }
});
//Change for normal user
app.get("/chang3", function (req, res) {
  if( userName != null && newpass != null){
   res.send(Changepass);
   Changepass=[];
  }else{
   let arraytest=[];
   res.send(arraytest)
  }
 });

// Enable User added
 app.get("/enable", function (req, res) {
  if(UserAdd1 != null){
   res.send(UserAdd1);
   UserAdd1= null;
  }else if(UserAdd2 != null){
    res.send(UserAdd2);
    UserAdd2= null;
  } else{
  let arraytest = "";
   res.send(arraytest)
  }
 });

 app.put("/users",function(req,callback){
    var base = "OU="+ouname2+",DC=mfu,DC=ac,DC=th";
    var results = [];
    var opts = {
        filter: '(objectClass=*)',
        scope: 'sub',
        attributes: ['sn', 'cn','mail','name','userPrincipalName','uid','givenName','sAMAccountName']
    };
    client.search(base, opts, function (err, res) {
        if (err) {
            console.log("Error in search" + err)
        } else {
            res.on('searchEntry', function (entry) {
                if (entry.object.cn) {
                   // console.log('entry: ' + JSON.stringify(entry.object));
                     //use this if you want only some fields
                     var ldapUserDetails={};
                       ldapUserDetails.sn = entry.object.sn 
                       ldapUserDetails.cn = entry.object.cn;
                       ldapUserDetails.mail = entry.object.mail;
                       ldapUserDetails.name = entry.object.name;
                       ldapUserDetails.userPrincipalName = entry.object.userPrincipalName;
                       ldapUserDetails.uid = entry.object.uid;
                       ldapUserDetails.givenName = entry.object.givenName;
                       ldapUserDetails.sAMAccountName = entry.object.sAMAccountName;
                     //  var ldap=[];
                    // var ldap = [ldapUserDetails.cn ,ldapUserDetails.sn]
                    //  var jsonArray = JSON.parse(JSON.stringify(ldapUserDetails.sn))
                    //  results.push(jsonArray);
                    // results.push(ldap);
                    results.push(ldapUserDetails);

                    // results.push(entry.object);
                }
            });
            res.on('searchReference', function (referral) {
                console.log('referral: ' + referral.uris.join());
            });
            res.on('error', function (err) {
                console.error('error: ' + err.message);
            });
            res.on('end', function (result) {
                console.log('status: ' + result.status);
                return callback.json({
                    statusCode: 200,
                    message: "success",
                    data: results
                });
            });
        }
        });
});

/// super admin add
app.post("/adduser", function (req, res) {     
  let user = req.body.user;     
  let name = req.body.name; 
  let surname = req.body.surname;   
  let email = req.body.email;  
  let ou = req.body.ou; 
  let CN=name+" "+surname ;
  UserAdd1 =user;
  let userPrin = user+"@mfu.ac.th";
  let dis =surname+","+name;
  console.log(ou)
  var entry = {
    cn:CN,
    sn:surname,
    mail:email,
    name:CN,
    givenName:name,
    userPrincipalName:userPrin,
    sAMAccountName:user,
    displayName:dis,
    objectClass:['organizationalPerson','person','top','user']
  };
  client.add('cn='+CN+',OU='+ou+',DC=mfu,DC=ac,DC=th', entry, function(err) {
    if(err){
        console.log("err in add new user"+err);
    }else{
        console.log("added user");
        app.get("/enable", function (req, res) {
          res.send(UserAdd1);  
        });
    }
  });
});

//// add admin
app.post("/addstaff", function (req, res) {     
  let user = req.body.user;     
  let name = req.body.name; 
  let surname = req.body.surname;    
  let email = req.body.email;   
  let ou =req.body.ou;
  UserAdd2=user;
  let CNUserAdd = name+" "+surname; 
  let userPrin = user+"@mfu.ac.th";
  let dis =surname+","+name;

  var entry = {
    cn:CNUserAdd,
    sn:surname,
    mail:email,
    name:CNUserAdd,
    givenName:name,
    userPrincipalName:userPrin,
    sAMAccountName:user,
    displayName:dis,
    objectClass:['organizationalPerson','person','top','user']
  };
  client.add('cn='+ CNUserAdd +',OU='+ ou +',DC=mfu,DC=ac,DC=th', entry, function(err) {
    if(err){
        console.log("err in add new user"+err);
    }else{
        app.get("/enable", function (req, res) {
        res.send(UserAdd2);  
        });
        console.log("added user");
    }
  });
});
////delete user
app.delete("/user/:userID", function (req, res) {
  // let ou = reg.body.ou;
  let userId = req.params.userID; 
  client.del('cn='+ userId +',OU='+ouname2+',DC=mfu,DC=ac,DC=th', function(err) {
    if(err){
        console.log("err in del new user"+err);
    }else{
        console.log("deleted user");
      
    }
  });
});
////delete admin
app.delete("/user2/:userID", function (req, res) {
  let ou = req.body.test;
  let userId = req.params.userID; 
  client.del('cn='+ userId +',OU='+ou+',DC=mfu,DC=ac,DC=th', function(err) {
    if(err){
        console.log("err in del new user"+err);
    }else{
        console.log("deleted user");
      
    }
  });
});



///update admin
app.put("/user/update/:id", function (req, res) {
  let userId = req.params.id;
  let nname = req.body.name;
  let surname = req.body.surname;
  let mail = req.body.mail;
  let ou = req.body.OU;
  


  var change1 = new ldap.Change({
    operation: 'replace',
    modification: {
      sn: surname,
    }
  });
  var change2 = new ldap.Change({
    operation: 'replace',
    modification: {
      mail: mail,
    }
  });

  var change4 = new ldap.Change({
    operation: 'replace',
    modification: {
      displayName:surname+","+nname ,
    }
  });
 
  var change5 = new ldap.Change({
    operation: 'replace',
    modification: {
     givenName:nname,
    }
  });
  for(i=1;i<=7;i++){

 
  client.modify('cn='+userId+',OU='+ou+',DC=mfu,DC=ac,DC=th',change1, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
});
  client.modify('cn='+userId+',OU='+ou+',DC=mfu,DC=ac,DC=th',change2, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  
  });
  client.modify('cn='+userId+',OU='+ou+',DC=mfu,DC=ac,DC=th',change4, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  });
  client.modify('cn='+userId+',OU='+ou+',DC=mfu,DC=ac,DC=th',change5, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  
  });
}
});
// update for super admin
app.put("/user2/update/:id", function (req, res) {
  let userId = req.params.id;
  let nname = req.body.name;
  let surname = req.body.surname;
  let mail = req.body.mail;
  
 console.log(username)
  var change1 = new ldap.Change({
    operation: 'replace',
    modification: {
      sn: surname,
    }
  });
  var change2 = new ldap.Change({
    operation: 'replace',
    modification: {
      mail: mail,
    }
  });
 
  var change4 = new ldap.Change({
    operation: 'replace',
    modification: {
      displayName:surname+","+nname ,
    }
  });
  var change5 = new ldap.Change({
    operation: 'replace',
    modification: {
     givenName:nname,
    }
  });
  for(i=1;i<=5;i++){

 
  client.modify('cn='+userId+',OU='+ouname2+',DC=mfu,DC=ac,DC=th',change1, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  });
  client.modify('cn='+userId+',OU='+ouname2+',DC=mfu,DC=ac,DC=th',change2, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  
  });
  client.modify('cn='+userId+',OU='+ouname2+',DC=mfu,DC=ac,DC=th',change4, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  
  });
  client.modify('cn='+userId+',OU='+ouname2+',DC=mfu,DC=ac,DC=th',change5, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  
  });
}
});

////user update
app.put("/user3/update/:id", function (req, res) {
  let userId = req.params.id;
  let nname = req.body.name;
  let surname = req.body.surname;
  let mail = req.body.mail;
 //console.log(username)
 console.log(userId)
  var change1 = new ldap.Change({
    operation: 'replace',
    modification: {
      sn: surname,
    }
  });
  var change2 = new ldap.Change({
    operation: 'replace',
    modification: {
      mail: mail,
    }
  });
  var change4 = new ldap.Change({
    operation: 'replace',
    modification: {
      displayName:surname+","+nname ,
    }
  });
  var change5 = new ldap.Change({
    operation: 'replace',
    modification: {
     givenName:nname,
    }
  });
  for(i=1;i<=5;i++){

 
  client.modify('cn='+userId+',OU='+ouname2+',DC=mfu,DC=ac,DC=th',change1, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  });
  client.modify('cn='+userId+',OU='+ouname2+',DC=mfu,DC=ac,DC=th',change2, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  
  });

  client.modify('cn='+userId+',OU='+ouname2+',DC=mfu,DC=ac,DC=th',change4, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  
  });
  client.modify('cn='+userId+',OU='+ouname2+',DC=mfu,DC=ac,DC=th',change5, function(err) {
    if(err){
      console.log("err in add new user"+ err);
  }else{
      console.log("updated");
  }
  
  });
}

});

      

       
app.get("/loginadmin", function(req, res) {
  res.sendFile(path.join(__dirname, "/login2.html"));
});

app.get("/superadmin", function(req, res) {
  res.sendFile(path.join(__dirname, "/loginadmin.html"));
});


app.get("/addpage", function(req, res) {
  res.sendFile(path.join(__dirname, "/addsuperadmin.html"));
});


app.get("/addpagestaff", function(req, res) {
  res.sendFile(path.join(__dirname, "/addadmin.html"));
  // res.send("test")
});

app.get("/Home", function(req, res) {
  res.sendFile(path.join(__dirname, "/HomePage.html"));
});

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "/login.html"));
    
});


app.get("/welcome", function (req, res) {
  res.sendFile(path.join(__dirname, "/HomePage.html"));
 });


app.get("/welcome2", function (req, res) {
  res.sendFile(path.join(__dirname, "/userwelcome.html"));
 });
app.get("/welcome3", function (req, res) {
  res.sendFile(path.join(__dirname, "/adminuser.html"));
 });

       
const port = process.env.PORT || 8080;
app.listen(port, function(){
    console.log("Server is ready at " + port);
});
