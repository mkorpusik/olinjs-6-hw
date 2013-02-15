
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , Facebook = require('facebook-node-sdk');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('c7c48b6ffe476bd03491f4ce549441ec'));
  app.use(express.session());
  app.use(Facebook.middleware({ appId:'508074542569150', secret: 'c7c48b6ffe476bd03491f4ce549441ec' }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var models = require('./models');
var User = models.User;
var Img = models.Img;

function facebookGetUser() {
  return function(req, res, next) {
    req.facebook.getUser( function(err, user) {
      if (!user || err){
        //res.send("you need to login");
        res.render('login', {title:"Login"});
      } else {
        // console.log(user);
        req.user = user;
        next();
      }
    });
  }
}

app.get('/login', Facebook.loginRequired(
  {scope: ['user_photos', 'friends_photos', 'publish_stream']}), function (req, res) {
  var fb_id = req.facebook.user;


  req.facebook.api('/me', function(err, data) {
    ///picture?redirect=false&type=large
    // console.log("user", data);
    var image = "http://graph.facebook.com/" + data.username + "/picture?width=200&height=200";
    //res.send(data);

    var exists =  User.find({fb_id:fb_id}, function (err, docs) {
      console.log(docs.length);

      // user does not exist already
      if (docs.length==0) {
        var images = new Array();
        var user = new User({ fb_id:fb_id, img_url: image, img_urls: images, color: 'white'});
          console.log("new user "+user);
          user.save(function (err) {
            if (err)
              return console.log("error: couldn't save user");
            req.session.user = user;
            //console.log("session user "+req.session.user);
            res.redirect('/');
          });

        // get up to 5 photo urls from up to 30 friends of logged in user
        req.facebook.api('/me/friends', function(err, data) {
          n=0;
          // console.log(data.data);
          // console.log(data.data.length)
          for (var i in data.data) {
            var friend_id = data.data[i].id;
            // console.log("id", friend_id);
            req.facebook.api("/"+friend_id+"?fields=photos", function(err, data) {
              if (data.photos!=undefined){
                for (var j in data.photos.data){
                  var url = data.photos.data[j].picture;
                  var id = data.photos.data[j].id;
                  var img = new Img({ id:id, url: url});
                  img.save(function (err) {
                    if (err)
                      return console.log("error: couldn't save img");
                  });
                  images[n]=img;
                  n=n+1;
                  // limit to five photos per friend
                  if (j>5)
                    break;
                }
              }
            console.log(images);
            User.update({fb_id:fb_id}, {$set: {'img_urls': images}}, function(err){});
            // res.redirect('/'); // Why does this throw an error: can't set headers after they're sent?
            });
            // limit to 30 friends
            if (i>30)
              break;
          }

        });
      }
      // login with sessions if user exists
      else if (docs.length>0){
        var user = docs;
        // console.log("existing user "+user);
        req.session.user = user;
        //console.log("session user "+req.session.user);
        res.redirect('/');
      }

      if (err)
        return console.log("error", exists);
      
    });
 
  });
  
});

app.get('/logout', function(req, res){
  req.user = null;
  req.session.destroy();
  console.log("logged out");
  res.redirect('/');
});

app.get('/', facebookGetUser(), routes.index2);
app.post('/color', routes.color);

app.post('/comment', function(req, res){
  console.log("hello!");
  console.log(req.body);
  // how do you get id and message when the name is the id?
  id = req.body.img_id; 
  message = req.body.comment;
  req.facebook.api('/'+id+'/comments', 'post', {message:message}, function(err, data) {
    if (err)
      console.log(err);
    else
      console.log(data);
  });
  res.redirect('/');
});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
