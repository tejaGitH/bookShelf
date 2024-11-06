const Friendship = require("../models/Friendship");
const User = require("../models/User");
const Review = require("../models/Review");

//send friend request
exports.sendFriendRequest = async(req,res)=>{
    try{
        const {friendId} = req.body;
        //const friendId="teja2";
        const userId = req.userId;
        //const userId = "teja";
        console.log(req.body);
        console.log("error............",userId);
         //input validation
         if(!friendId){
            return res.status(400).json({message:"Friend Id required"});
        }
        const existingFriendShip = await Friendship.findOne({user:userId, friend:friendId});
        if(existingFriendShip){
            return res.status(400).json(({message:"Friendship already exists"}));
        }
        const newFriendship = new Friendship({user: userId, friend: friendId, status:'pending'});
        await newFriendship.save();

        return res.status(201).json({message:"friend request sent"});
    }catch(error){
        console.log("error is ...........",req.body._id,error);
        return res.status(500).json({message:"error sending friend request"});
    }
}

//retrieve users friendlist
exports.getFriends=async(req,res)=>{
    try{
        const userId = req.userId;
        const friends = await Friendship.find({user:userId,status:'accepted'}).populate('friend');
        return res.status(200).json(friends);
    }catch(error){
        return res.status(500).json({message:'error retreiving friends'});
    }
}

//update friendship status
exports.updateFriendshipStatus = async(req,res)=>{
    try{
        const {friendshipId, status} =req.body;
        //inpit validation
        if(!friendshipId || !status){
            return res.status(400).json({message:"friendship Id and status are required"});
        }
        const friendship = await  Friendship.findById(friendshipId);
        if(!friendship){
            return res.status(404).json({message:"Friendship not found"});
        }
        friendship.status = status;
        await friendship.save();
        return res.status(200).json({message:"friendship status updated"});
    }catch(error){
        return res.status(500).json({message:'error updating friendship status'});
    }
}

//Remove friend
exports.removeFriend = async(req,res)=>{
    try{
        const {friendshipId} = req.params;
        await Friendship.findByIdAndDelete(friendshipId);
        return res.status(200).json({message:"friend removed"});
    }catch{
        return res.status(500).json({message:"error removing friend"});
    }
}

//get friend updates
exports.getFriendUpdates= async(req,res)=>{
    try{
        const userId = req.userId;
        const friends = await Friendship.find({user:userId, status: 'accepted'}).populate('friend');
        const friendId = friends.map(friend=>friend.friend._id);
        const reviews = await Review.find({user:{$in:friendId}}).populate('book').populate('user');
        return res.status(200).json(reviews);
    }catch(error){
        return res.status(500).json({message:"error retrieving friend updates"});
    }
}

//get dashboard data

exports.getDashboard= async(req,res)=>{
    try{
        const userId=req.userId;
        const friendUpdates= await this.getFriendUpdates(req,res);
        return res.status(200).json(friendUpdates);
    }catch(error){
        return res.status(500).json({message:"error retrieving dashboard data"});
    }
}