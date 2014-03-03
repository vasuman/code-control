var mongoose = require('mongoose'),
Schema = mongoose.schema;

var matchSchema = new Schema({
    players: [{ type: Schema.Types.ObjectId, ref: 'Code' }],
    level: String,
    result: Object
});
var codeSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    type: String,
    rating: Number,
    matches: [{ type: Schema.Types.ObjectId, ref: 'Match'}]
});
var userSchema = new Schema({
    handle: String,
    points: Number,
    prag_id: Number,
    chars: [{ type: Schema.Types.ObjectId, ref: 'Code' }]
});

module.exports.User = mongoose.model('User', userSchema);
module.exports.Code = mongoose.model('Code', codeSchema);
module.exports.Match = mongoose.model('Match', matchSchema);
