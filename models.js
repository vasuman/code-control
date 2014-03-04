var mongoose = require('mongoose'),
Schema = mongoose.Schema;

var matchSchema = new Schema({
    versus: [{ type: Schema.Types.ObjectId, ref: 'Code' }],
    level: String,
    when: Date,
    result: Object
});
var codeSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    type: String,
    name: String,
    creation: Date,
    edited: Date,
    rating: Number,
    matches: [{ type: Schema.Types.ObjectId, ref: 'Match'}]
});
var userSchema = new Schema({
    pid: Number,
    points: Number,
    chars: [{ type: Schema.Types.ObjectId, ref: 'Code' }]
});

module.exports.User = mongoose.model('User', userSchema);
module.exports.Code = mongoose.model('Code', codeSchema);
module.exports.Match = mongoose.model('Match', matchSchema);
