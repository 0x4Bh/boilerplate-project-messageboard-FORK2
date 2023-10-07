'use strict';
const { BoardModel, ThreadModel, ReplyModel } = require('../models');

module.exports = function (app) {
  app
    .route('/api/threads/:board')
    .post((req, res) => {
      const { text, delete_password } = req.body;
      let board = req.body.board;
      if (!board) {
        board = req.params.board;
      }

      // Check if the board exists
      BoardModel.findOne({ name: board })
        .then(data => {
          if (!data) {
            // Create a new board
            const newBoard = new BoardModel({
              name: board
            });
            newBoard.save().then(savedBoard => {
              // Create a new thread
              const newThread = new ThreadModel({
                board_id: savedBoard._id,
                text: text,
                delete_password: delete_password
              });
              newThread.save().then(threadData => {
                savedBoard.threads = [threadData._id];
                savedBoard.save().then(() => {
                  res.send([threadData].reverse());
                });
              });
            });
          } else {
            // Update the existing board

            // Create a new thread
            const newThread = new ThreadModel({
              board_id: data._id,
              text: text,
              delete_password: delete_password
            });
            newThread.save().then(threadData => {
              data.threads.push(threadData._id);
              data
                .save()
                .then(updatedBoard => updatedBoard.populate('threads'))
                .then(board => {
                  res.send(board.threads.reverse());
                });
            });
          }
        })
        .catch(err => {
          console.log(err);
          res.send(err);
        });
    })
    .get((req, res) => {
      const board = req.params.board;
      BoardModel.findOne({ name: board })
        .populate({
          path: 'threads',
          options: { sort: { bumped_on: -1 }, limit: 10 },
          select: '-reported -delete_password',
          populate: {
            path: 'replies',
            options: { sort: { created_on: -1 }, limit: 3 },
            select: '-reported -delete_password'
          }
        })
        .then(data => {
          res.send(data.threads);
        });
    })
    .delete((req, res) => {
      const { thread_id, delete_password } = req.body;
      ThreadModel.findOneAndDelete({
        _id: thread_id,
        delete_password: delete_password
      })
        .then(foundThread => {
          if (!foundThread) {
            console.log('incorrect password');
            res.send('incorrect password');
          } else {
            res.send('success');
          }
        })
        .catch(err => {
          console.log(err);
          res.send(err);
        });
    })
    .put((req, res) => {
      const { thread_id } = req.body;
      if (!thread_id) {
        console.log('thread_id is empty');
        res.send('thread_id is empty');
      } else {
        ThreadModel.findByIdAndUpdate(
          thread_id,
          { reported: true },
          { new: true }
        )
          .then(data => {
            if (!data) {
              console.log(
                'Something wrong happened while reporting the thread'
              );
              res.send('Something wrong happened while reporting the thread');
            } else {
              res.send('reported');
            }
          })
          .catch(err => {
            console.log(err);
            res.send(err);
          });
      }
    });

  app
    .route('/api/replies/:board')
    .post((req, res) => {
      const { text, delete_password, thread_id } = req.body;

      const newReply = new ReplyModel({
        text: text,
        delete_password: delete_password,
        thread_id: thread_id
      });
      newReply
        .save()
        .then(savedReply => {
          ThreadModel.findByIdAndUpdate(
            thread_id,
            {
              $push: { replies: savedReply._id },
              bumped_on: savedReply.created_on
            },
            { new: true }
          )
            .then(updatedThread => updatedThread.populate('replies'))
            .then(updatedThread => {
              res.send(updatedThread);
            });
        })
        .catch(err => {
          console.log(err);
          res.send(err);
        });
    })
    .get((req, res) => {
      const thread_id = req.query.thread_id;
      ThreadModel.findById(thread_id)
        .select('-reported -delete_password')
        .populate({ path: 'replies', select: '-reported -delete_password' })
        .then(thread => {
          res.send(thread);
        });
    })
    .delete((req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;
      ReplyModel.findOneAndUpdate(
        {
          thread_id: thread_id,
          _id: reply_id,
          delete_password: delete_password
        },
        { text: '[deleted]' },
        { new: true }
      ).then(deletedReply => {
        if (!deletedReply) {
          console.log('incorrect password');
          res.send('incorrect password');
        } else {
          res.send('success');
        }
      });
    })
    .put((req, res) => {
      const { thread_id, reply_id } = req.body;
      ReplyModel.findByIdAndUpdate(
        reply_id,
        { reported: true },
        { new: true }
      ).then(() => {
        res.send('reported');
      }).catch;
      err => {
        console.log(err);
        res.send(err);
      };
    });
};
