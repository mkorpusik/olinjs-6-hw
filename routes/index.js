
/*
 * GET home page.
 */

var models = require('../models');
var util = require('util');
var User = models.User;

exports.index = function(req, res){
  console.log("home page");
  res.render('index', {title: 'MyFacebookSpace' });
};

exports.index2 = function(req, res){
  console.log(util.inspect(req.session.user));
  console.log("session user ", req.session.user);

  // when user exists, it is an array, so user is first element
  if (req.session.user instanceof Array) {
    console.log('user is an array');
    id = req.session.user[0].fb_id;
  }
  //when user is first created, it's not an array
  else {
    console.log('user is not an array');
    id = req.session.user.fb_id;
  }
  
  var user = User.findOne({fb_id:id}, function (err, loggedInUser) {
    if (err)
        return console.log("error");
    console.log("docs ", loggedInUser);
    res.render('index2', {loggedInUser:loggedInUser, title: 'MyFacebookSpace' });
  });
  
};

exports.color = function(req, res){
  console.log("changing color");
  var color = req.body.color;
  console.log(color);
  if (req.session.user instanceof Array) {
    console.log('user is an array');
    id = req.session.user[0].fb_id;
  }
  else {
    console.log('user is not an array');
    id = req.session.user.fb_id;
  }
  User.update({fb_id:id}, {$set: {'color': color}}, function(err){
  	console.log("test");
    res.redirect('/');
  });

};