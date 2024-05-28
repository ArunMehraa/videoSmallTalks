const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');


const accessChat = asyncHandler(async (req,res) => {
    const {userId} = req.body;
    if(!userId) {
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            {users: {$elemMatch: {$eq: req.user._id}}},
            {users: {$elemMatch: {$eq: userId}}},
        ],
    }).populate("users","-password")
        .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name pic email"
        });
    
    if(isChat.length > 0) {
        res.send(isChat[0]);
    }
    else{
        var chatData = {
            chatName : "sender",
            isGroupChat : false,
            users : [req.user._id, userId],
        };

        try{
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({_id:createdChat._id}).populate("users","-password");
            res.status(200).json(FullChat);
        }
        catch(err) {
            res.status(400);
            throw new Error(err.message);
        }
    }
});

const fetchChat = asyncHandler(async (req,res) => {
    try{
        Chat.find({users: {$elemMatch: {$eq: req.user._id}}})
        .populate("users","-password")
        .populate("latestMessage")
        .populate("groupAdmin","-password")

        .sort({updatedAt: -1})

        .then(async results => {
            results = await User.populate(results, {
                path: "latestMessage.sender",
                select: "name pic email"
            });
            res.status(200).send(results);
        })
    }
    catch(err) {
        res.status(400);
        throw new Error(err.message);
    }
});

const createGroupChat = asyncHandler(async (req,res) => {
    if(!req.body.users || !req.body.name) {
        return res.sendStatus(400).send('Please enter all fields');
    }

    var users = JSON.parse(req.body.users);

    if(users.length < 2) {
        return res.sendStatus(400).send('Please select more than one user');
    }

    users.push(req.user);

    try{
        const groupChat = await Chat.create({
            chatName: req.body.name,
            isGroupChat: true,
            users: users,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({_id: groupChat._id})
        .populate("users","-password")
        .populate("groupAdmin","-password");

        res.status(200).json(fullGroupChat);
    }
    catch(err) {
        res.status(400);
        throw new Error(error.message);
    }
}   
); 

const renameGroup = asyncHandler(async (req,res) => {
    const {chatID,chatName} = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
        chatID,
        {chatName: chatName},
        {new: true}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");
    
    if(updatedChat) {
        res.status(200).json(updatedChat);
    }
    else{
        res.status(400).send('Chat not found');
    }

}
);

const addToGroup = asyncHandler(async (req,res) => {
    const {chatID,userId} = req.body;

    const added= await Chat.findByIdAndUpdate(
        chatID,
        {$push: {users: userId}},
        {new: true}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    if(!added) {
        res.status(404).send('Chat not found');
    }
    else{
        res.status(200).json(added);
    }
}   
);

const removeFromGroup = asyncHandler(async (req,res) => {
    const {chatID,userId} = req.body;

    const removed= await Chat.findByIdAndUpdate(
        chatID,
        {$pull: {users: userId}},
        {new: true}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    if(!removed) {
        res.status(404).send('Chat not found');
    }
    else{
        res.status(200).json(removed);
    }
}   
);

module.exports = {accessChat,fetchChat,createGroupChat,renameGroup,addToGroup,removeFromGroup};