const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');
const favouriteRouter = express.Router();
favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.find({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err)); 
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
    .then((favorites) => {
        if (favorites.length === 0) {
            Favorites.create({
                user: req.user._id,
                dishes: []
            })
            .then((favorite) => {
                req.body.forEach((dish) => {
                    favorite.dishes.push(dish._id);
                })
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }, (err) => next(err));
        }else {
            const favorite = favorites[0];
            req.body.forEach((dish) => {
                if(!favorite.dishes.includes(dish._id)) {
                    favorite.dishes.push(dish._id);
                }
            })
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({ user: req.user._id })
    .populate('dishes')
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err)); 
});

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
    .then((favorites) => {
        if (favorites.length === 0) {
            Favorites.create({
                user: req.user._id,
                dishes: [req.params.dishId]
            })
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }else {
            const favorite = favorites[0];
            if(!favorite.dishes.includes(req.params.dishId)) {
                favorite.dishes.push(req.params.dishId);
            }
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
    .then((favorites) => {
        if (favorites.length === 0) {
            err = new Error('Favourites not found for this user');
            err.status = 404;
            return next(err);
        }else {
            const favorite = favorites[0];
            const index = favorite.dishes.indexOf(req.params.dishId);
            if(index !== -1) {
                favorite.dishes.splice(index, 1);
            }else {
                err = new Error('Dish not found in favorites');
                err.status = 404;
                return next(err);
            }
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favouriteRouter;
