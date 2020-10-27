const express = require('express');
const messageRouter = express.Router();
const bodyParser = require('body-parser');

const Messages = require('../models/messages');
const { MongoError } = require('mongodb');

messageRouter.use(bodyParser.json());



//========== Message router ROOT ==========//
messageRouter.route('/')
.get((req, res, next) => {
    Messages.find({})
    .then((messages) => {
        console.log("All messages ", messages);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(messages);
    });
})
.post((req, res, next) => {
    //creates a new message-object from http-body
    Messages.create(req.body)
    .then((msg) => {
        console.log('Message Created: ', msg);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(msg);
    });
})
.delete(() => {
    Messages.deleteMany({}).exec()
    .then((resp) => {
        console.log("All " + resp.n + " messages removed");
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    });
});
//TODO: Could handle PUT here as well... Maybe if the user gives the ID in the body, we can use that to update the corresponding message with the rest of the body content?
//=========================================//



//========== /messageId ==========//
messageRouter.route('/:messageId')
.get((req, res, next) => {
    Messages.findById(req.params.messageId)
    .then((msg) => {
        if(msg !== null)
        {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(msg);
        }
        else
            ErrorResponse(res, "ERROR: ID not found!");
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
})
.put((req, res, next) => {
    //find by id, update with body content, return updated message (new: true)
    Messages.findByIdAndUpdate(req.params.messageId, req.body, {new: true})
    .then((msg) => {
        if(msg !== null)
        {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(msg);
        }
        else
            ErrorResponse(res, "ERROR: ID not found!");
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
})
.delete((req, res, next) => {
    Messages.findByIdAndDelete(req.params.messageId)
    .then((msg) => {
        if(msg !== null)
        {
            console.log("Message removed: ", msg);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(msg);
        }
        else
            ErrorResponse(res, "ERROR: ID not found!");
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
});
//=================================//



//========== /messageId/comments ==========//
messageRouter.route('/:messageId/comments')
.get((req, res, next) => {
    Messages.findById(req.params.messageId)
    .then((msg) => {
        if(msg !== null)
        {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(msg.comments);
        }
        else
            ErrorResponse(res, "ERROR: ID not found!");
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
})
.post((req, res, next) => {
    Messages.findById(req.params.messageId)
    .then((msg) => {
        if(msg !== null)
        {
            msg.comments.push(req.body);
            msg.save()
            .then(() => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(msg);
            }).catch((err) => {
                ErrorResponse(res, "ERROR: " + err.message);
            });
        }
        else
            ErrorResponse(res, "ERROR: ID not found!");
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
});
//=========================================//



//========== /messageId/comments/commentId ==========//
messageRouter.route('/:messageId/comments/:commentId')

//TODO: Test this
.delete((req, res, next) => {
    Messages.findOneAndUpdate({_id: req.params.messageId}, {$pull: {_id: req.params.commentId}}, {new: true})
    .then((msg) => {
        if(msg !== null)
        {
            console.log("Comment removed. New Message content: ", msg);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(msg);
        }
        else
            ErrorResponse(res, "ERROR: ID not found!");
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
})
put((req, res, next) => {
    //TODO: this
});
//===================================================//



module.exports = messageRouter;


function ErrorResponse(resOBJ, errorMsg, statusCode = 404, ContentType = 'text/html')
{
    resOBJ.statusCode = statusCode;
    resOBJ.setHeader('Content-Type', ContentType);
    resOBJ.end(errorMsg);
}