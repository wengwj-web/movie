var express = require('express')
var path = require('path')
var mongoose = require('mongoose')
var Movie = require('./modules/movie')
var _ = require('underscore')
var bodyParser = require('body-parser')
var port = process.env.PORT || 3000
var app = express()

mongoose.connect('mongodb://localhost/imooc')

app.set('views','./views/pages')
app.set('view engine','jade')
/*通过 Express 内置的 express.static 可以方便地托管静态文件，例如图片、CSS、JavaScript 文件等。
将静态资源文件所在的目录作为参数传递给 express.static 中间件就可以提供静态资源文件的访问了。
注意：express 4.x版本之后值保留了express.static这个方法，其他方法都分为中间件另外安装引入
*/
// app.use(express.bodyParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')))
app.locals.moment = require('moment')
app.listen(port)

console.log('node start on port ' + port)

// index page
app.get('/',function(req,res){
    Movie.fetch(function(err,movies) {
        if (err) {
            console.log(err)
        }

        res.render('index',{
            title: '电影网站首页',
            movies: movies
        })
    })
})

// detail page
app.get('/movie/:id',function(req,res){
    var id = req.params.id

    Movie.findById(id,function(err, movie) {
        res.render('detail',{
            title: '电影详情 ' + movie.title,
            movie: movie
        })
    })
})

// admin page
app.get('/admin/movie',function(req,res){
    res.render('admin',{
        title: '电影录入',
        movie: {
            title: '',
            doctor: '',
            country: '',
            year: '',
            poster: '',
            flash: '',
            summary: '',
            language: ''
        }
    })
})

// admin update movie
app.get('/admin/update/:id', function(req, res){
    var id = req.params.id
    if (id) {
        Movie.findById(id, function(err, movie) {
            res.render('admin', {
                title: '后台更新页',
                movie: movie
            })
        })
    }
})

// admin post movie
app.post('/admin/movie/new', function(req, res) {
    var id = req.body.movie._id
    var movieObj = req.body.movie
    var _movie

    if (id !== 'undefined') {
        Movie.findById(id, function(err, movie) {
            if(err) {
                console.log(err)
            }

            _movie = _.extend(movie, movieObj)
            _movie.save(function(err, movie) {
                if(err) {
                    console.log(err)
                }
                res.redirect('/movie/' + movie._id)
            })
        })
    } else {
        _movie = new Movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            country: movieObj.country,
            language: movieObj.language,
            year: movieObj.year,
            poster: movieObj.poster,
            summary: movieObj.summary,
            flash: movieObj.flash
        })

        _movie.save(function(err, movie) {
            if(err) {
                console.log(err)
            }
            res.redirect('/movie/' + movie._id)
        })
    }
})

// http://r3.yking.com/05160000530EEB63675839160D0B79D5

// list page
app.get('/admin/list',function(req,res){
    Movie.fetch(function(err,movies) {
        if (err) {
            console.log(err)
        }

        res.render('list',{
            title: '电影列表',
            movies: movies
        })
    })
})

// list delete movie
app.delete('/admin/list',function(req, res) {
    var id = req.query.id
    if (id) {
        Movie.remove({_id: id},function(err, movie) {
            if (err) {
                console.log(err)
            } else {
                res.json({success: 1})
            }
        })
    }
})