/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const CONNECTION_STRING = process.env.MONGO_DB;

let db;
let Books

//Connect to database
MongoClient.connect(CONNECTION_STRING, function(err, database) {
  if(err){ 
    console.error(err)
  }else{ 
    console.log("Connected to database")
    db = database.db("PersonalLibrary")
    Books = db.collection("Books")
  }
});

function createBook(bookTitle, res){
  // console.log("Trying to insert book with title: ", bookTitle)
  Books.insertOne({title: bookTitle, comments: [], commentcount: 0}, (err, doc) => {
    if(err) return console.error(err)
    res.send(doc.ops[0])
  })
}

function getBooks(res){
  Books.find({}, {title:1, commentcount:1}).toArray().then(function(docs) {
    res.send(docs)
  });
}

function getBookById(id, res){
  Books.findOne({_id: new ObjectId(id)}, {title:1, comments:1}, function(err, docs){
    if(err || !docs) return res.send("no book exists")
    res.send(docs)
  })
}

function postComment(bookid, comment, res){
  Books.findAndModify({_id: new ObjectId(bookid)}, {}, { $push: { "comments": comment}, $inc: { "commentcount": 1} },  (err, doc) => {
    if(err) return console.error(err)
    // console.log(doc.value)
    res.send(doc.value)
  })
}

function deleteBook(bookid, res){
  Books.deleteOne({_id: new ObjectId(bookid)}, (err, result) => {
    if(err) return console.error(err)
    res.send("delete successful")
  })
}

function deleteAllBooks(res){
  Books.deleteMany({}, (err, result) => {
    if(err) return console.erro(err)
    res.send("complete delete successful")
  })
}


module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      getBooks(res)
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(!title || title == "") return res.send("missing title")
      createBook(title, res)
    })
    
    .delete(function(req, res){
      deleteAllBooks(res)
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      getBookById(bookid, res)
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      postComment(bookid, comment, res)
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      deleteBook(bookid, res)
    });
  
};
