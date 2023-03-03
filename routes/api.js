/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const bookCollection = require('../dbcollection.js');
const { ObjectId } = require('mongodb');

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const options = {
        projection: { title: 1, commentcount: 1 }
      };
      
      bookCollection
        .find({}, options)
        .toArray()
        .then(result => {
          res.json(result);
        })
        .catch(err => console.error(err));
      
    })
    
    .post(function (req, res){
      if (!req.body.title) return res.send('missing required field title');
      if (/^\s+$/.test(req.body.title)) return res.send('missing required field title');
      
      let newBook = { title: req.body.title, comments: [], commentcount: 0 };
      //response will contain new book object including atleast _id and title
      bookCollection
        .insertOne(newBook)
        .then(result => {
          res.json({ _id: result.insertedId, title: req.body.title });
        })
        .catch(err => console.error(err));
      
      
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      bookCollection
        .deleteMany({})
        .then(result => {
          console.log(`${result.deletedCount} record(s) deleted`);
          res.send('complete delete successful');
        })
        .catch(err => console.error(err));
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookId = req.params.id;
      let hexRegex = /^[a-f0-9]{24}$/i;

      if ((!bookId) || (!hexRegex.test(bookId))) {
        return res.send('no book exists');
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const options = {
        projection: { title: 1, comments: 1, commentcount: 1 }
      };
      
      bookCollection
        .findOne({ _id: new ObjectId(bookId) }, options)
        .then(result => {
          if (!result) {
            res.send('no book exists');
          } else {
            res.json(result);
          }
          
        })
        .catch(err => console.error(err));
    })
    
    .post(function(req, res){
      let bookId = req.params.id;
      let comment = req.body.comment;
      let hexRegex = /^[a-f0-9]{24}$/i;

      if ((!bookId) || (!hexRegex.test(bookId))) {
        return res.send('no book exists');
      }
      
      if ((!comment) || /^\s*$/.test(comment)) {
        return res.send('missing required field comment');
      }
      
      //json res format same as .get
      const updateDoc = {
        $push: { comments: comment },
        $inc: { commentcount: 1 }
      };
      
      const options = {
        projection: { title: 1, comments: 1, commentcount: 1 },
        returnDocument: 'after'
      };
      
      bookCollection
        .findOneAndUpdate({ _id: new ObjectId(bookId) }, updateDoc, options)
        .then(result => {
          if (!result.value) {
            res.send('no book exists');
          } else {
            res.json(result.value);
          }
        })
        .catch(err => console.error(err));
    })
    
    .delete(function(req, res){
      if (req.params.id.length !== 24) return res.send('no book exists');
      let bookId = req.params.id;
      //if successful response will be 'delete successful'
      bookCollection
        .deleteOne({ _id: new ObjectId(bookId) })
        .then(result => {
          if (result.deletedCount === 1) {
            console.log(`${result.deletedCount} record(s) deleted`);
            res.send('delete successful');
          } else {
            console.log(`${result.deletedCount} record(s) deleted`);
            res.send('no book exists');
          }
          
        })
        .catch(err => console.error(err));
    });
  
};
