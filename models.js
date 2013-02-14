var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/facebook');

var userSchema = mongoose.Schema({
	fb_id: String,
	img_url: String,
	img_urls: [String],
	color: String
});

var User = mongoose.model('User', userSchema);

module.exports.User = User;
