const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('underscore');
const app = express();

var Movie = require('./models/movie');
mongoose.connect('mongodb://localhost/movie')

var port = process.env.PORT || 3000;

app.set('views', './views/pages');
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({extended: true}));
app.use('/static' ,express.static('public'));
app.locals.moment = require('moment');
app.listen(port);

console.log(`server started at http://localhost:${port}`);

// index page
app.get('/', (req, res) => {
    Movie.fetch( (err, movies) => {
        if(err){
            console.log(err);
        }
    
        res.render('index', {
            title: '电影首页',
            movies: movies
        });
    })
});

// detail page
app.get('/movie/:id', (req, res) => {
    var id = req.params.id;

    Movie.findById(id, (err, movie) => {
        res.render('detail', {
            title: `电影详情页${movie.title}`,
            movie: movie
        });
    });
});

// admin page
app.get('/admin/movie', (req, res) => {
    res.render('admin', {
        title: '电影录入页面',
        movie: {
            title: '',
            doctor: '',
            country: '',
            year: '',
            summary: '',
            poster: '',
            flash: '',
            language: ''
        }
    });
});

// admin post movie
app.post('/admin/movie/new', (req, res) => {
    var movieObj = req.body.movie;
    var id = movieObj._id;
    var _movie;

    if(id !== 'undefined'){
        Movie.findById(id, (err, movie) => {
            if(err){
                console.log(err);
            }

            _movie = _.extend(movie, movieObj);
            _movie.save( (err, movie) => {
                if(err){
                    console.log(err);
                }

                res.redirect('/movie/' + movie._id);
            })
        })
    }else{
        _movie = new Movie({
            title: movieObj.title,
            doctor: movieObj.doctor,
            country: movieObj.country,
            year: movieObj.year,
            summary: movieObj.summary,
            poster: movieObj.poster,
            flash: movieObj.flash,
            language: movieObj.language
        });
        _movie.save( (err, movie) => {
            if(err){
                console.log(err);
            }

            res.redirect('/movie/' + movie._id);
        })
    }
});

//admin update movie
app.get('/admin/update/:id', (req, res) => {
    var id = req.params.id;

    if(id){
        Movie.findById(id, (err, movie) => {
            if(err){
                console.log(err);
            }
        
            res.render('admin', {
                title: '后台更新页',
                movie: movie
            });
        })
    }
});

// list page
app.get('/admin/list', (req, res) => {
    Movie.fetch( (err, movies) => {
        if(err){
            console.log(err);
        }
    
        res.render('list', {
            title: '电影列表页',
            movies: movies
        });
    })
});

// list delete movie
app.delete('/admin/list', (req, res) => {
    var id = req.query.id;
    if(id){
        Movie.remove({_id: id}, (err, movies) => {
            if(err){
                console.log(err);
            }else{
                res.json({success: 1})
            }
        })
    }
});