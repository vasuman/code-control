var mongoose = require('mongoose'),
Schema = mongoose.Schema;

const MATCH_TYPES = ['versus', 'train'];
const CHAR_TYPES

function Map(level, jsonPath) {
    this.level = level;
    this.jsonPath = jsonPath;
}

var matchSchema = new Schema({
    contenders: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
    type: { type: String, enum: MATCH_TYPES },
    map: Object,
    when: Date,
    winner: { type: Schema.Types.ObjectId, ref: 'Character' },
    replay: Object
});

var requestSchema = new Schema({
    map: Object,
    jsonPath: String,
    challenger: { type: Schema.Types.ObjectId, ref: 'Character' }
});

var charSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['warrior'] },
    name: String,
    creation: Date,
    edited: Date,
    passed: Boolean,
    experience: Number,
    code: String,
    matches: [{ type: Schema.Types.ObjectId, ref: 'Match'}]
});

var userSchema = new Schema({
    pid: Number,
    chars: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
    requests: [{ type: Schema.Types.ObjectId, ref: 'Request' }]
});

module.exports.User = mongoose.model('User', userSchema);
module.exports.Character = mongoose.model('Character', charSchema);
module.exports.Match = mongoose.model('Match', matchSchema);
