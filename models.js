var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/facebook');

var imgSchema = mongoose.Schema({
	id: String,
	url: String
});

var Img = mongoose.model('Img', imgSchema);

var userSchema = mongoose.Schema({
	fb_id: String,
	img_url: String,
	// img_urls: [String],
	img_urls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Img' }],
	color: String
});

var User = mongoose.model('User', userSchema);

module.exports.User = User;
module.exports.Img = Img;
