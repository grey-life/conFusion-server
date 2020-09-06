const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
    },
    dishes: [{
        type: ObjectId,
        ref: 'Dish',
    }],
},{
    timestamps: true,
}); 

const Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;
