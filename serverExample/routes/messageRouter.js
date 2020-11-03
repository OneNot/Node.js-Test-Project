const express = require('express');
const messageRouter = express.Router();
const bodyParser = require('body-parser');

const Messages = require('../models/messages');
const { MongoError } = require('mongodb');

messageRouter.use(bodyParser.json());



//========== Message router ROOT ==========//
//#region
messageRouter.route('/')
//GET ALL MESSAGES
.get((req, res, next) => {
    Messages.find({})
    .then((messages) => {
        console.log("All messages ", messages);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(messages);
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
})
//CREATE A NEW MESSAGE
.post((req, res, next) => {
    //creates a new message-object from http-body
    Messages.create(req.body)
    .then((msg) => {
        console.log('Message Created: ', msg);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(msg);
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
})
//DELETE ALL MESSAGES
.delete(() => {
    Messages.deleteMany({}).exec()
    .then((resp) => {
        console.log("All " + resp.n + " messages removed");
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
});
//TODO: Could handle PUT here as well... Maybe if the user gives the ID in the body, we can use that to update the corresponding message with the rest of the body content?
//#endregion
//=========================================//



//========== /messageId ==========//
//#region 
messageRouter.route('/:messageId')
//GET SPECIFIC MESSAGE
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
//UPDATE SPECIFIC MESSAGE
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
//DELETE SPECIFIC MESSAGE
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
//#endregion
//=================================//



//========== /messageId/comments ==========//
//#region 
messageRouter.route('/:messageId/comments')
//GET COMMENTS OF SPECIFIC MESSAGE
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
//ADD A COMMENT TO SPECIFIC MESSAGE
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
//#endregion
//=========================================//



//========== /messageId/comments/commentId ==========//
//#region 
messageRouter.route('/:messageId/comments/:commentId')
//GET SPECIFIC COMMENT FROM SPECIFIC MESSAGE
.get((req, res, next) => {
    Messages.findById(req.params.messageId)
    .then((msg) => {
        if(msg !== null)
        {
            let comment = msg.comments.id(req.params.commentId);
            if(comment !== null)
            {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            }
            else
                ErrorResponse(res, "ERROR: Comment ID not found!");
        }
        else
            ErrorResponse(res, "ERROR: Message ID not found!");
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
})
//DELETE SPECIFIC COMMENT FROM SPECIFIC MESSAGE
.delete((req, res, next) => {
    Messages.findOneAndUpdate({_id: req.params.messageId}, {$pull:{comments:{_id: req.params.commentId}}}, {new: true})
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
}).
//UPDATE SPECIFIC COMMENT FROM SPECIFIC MESSAGE
put((req, res, next) => {
    Messages.findById(req.params.messageId)
    .then((msg) => {
        if(msg !== null)
        {
            let comment = msg.comments.id(req.params.commentId);
            if(comment !== null)
            {
                comment.set(req.body);
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
                ErrorResponse(res, "ERROR: Comment ID not found!");
        }
        else
            ErrorResponse(res, "ERROR: Message ID not found!");
    }).catch((err) => {
        ErrorResponse(res, "ERROR: " + err.message);
    });
});
//#endregion
//===================================================//



module.exports = messageRouter;


function ErrorResponse(resOBJ, errorMsg, statusCode = 404, ContentType = 'text/html')
{
    resOBJ.statusCode = statusCode;
    resOBJ.setHeader('Content-Type', ContentType);
    resOBJ.end(errorMsg);
}