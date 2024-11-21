const Friendship = require("../models/Friendship");
const User = require("../models/User");
const Review = require("../models/Review");

//send friend request
exports.sendFriendRequest = async(req,res)=>{
    try{
        const {userId, friendId} = req.body;
        // const userId = req.userId;
        // console.log("userId",userId);
        // console.log("friendId",friendId);

        //input validation
        if(!friendId){
            return res.status(400).json({message:"Friend Id required"});
        }
        if(userId === friendId){
            return res.status(400).json({message: "you cannot send a friend to yourself"});
        }
        //check if the friendship status already exists
        const existingFriendShip = await Friendship.findOne({
            $or: [
                {user: userId, friend: friendId},
                {user: friendId, friend: userId},
             ]
            // user: userId, friend: friendId
        });
        
        if(existingFriendShip){
            return res.status(400).json(({message:"Friendship already exists"}));
        }

        //create new friendShip req with status pending
        const newFriendship = new Friendship({
            user: userId,
            friend: friendId, 
            status:'pending'
        });
        await newFriendship.save();
        return res.status(201).json({message:"friend request sent"});
    }catch(error){    
        console.log("error sending friend request:", error);
        return res.status(500).json({message:"error sending friend request",error:error});
    }
}

//retrieve users friendlist
exports.getFriends=async(req,res)=>{
    try{
        const userId = req.userId;
        //get friends where the status is accepted
        const friends = await Friendship.find({
            $or: [{user: userId}, {friend: userId}],
            status: 'accepted',
        }).populate('user', 'user email'); //populate both user and friend details
        return res.status(200).json(friends);
    }catch(error){
        return res.status(500).json({message:'error retreiving friends'});
    }
}

//update friendship status
exports.updateFriendshipStatus = async(req,res)=>{
    try{
        const {friendshipId, status} =req.body;
        console.log(friendshipId,status);
        //inpit validation
        if(!friendshipId || !["accepted", "declined"].includes(status)){
            return res.status(400).json({message:"friendship Id and status are required"});
        }
        const friendship = await  Friendship.findById(friendshipId);
        // console.log("friendship",friendship);
        if(!friendship){
            return res.status(404).json({message:"Friendship not found"});
        }
        //ensure the user is part of the friendship//checking whether userId is friendship.user or friendship.friend
        // if(![friendship.user.toString(),friendship.friend.toString()].includes(req.userId)){
        //     return res.status(403).json({ message: "You are not authorized to update this friendship" }); 
        // }
        //update status
        friendship.status = status;
        console.log(friendship.status);
        await friendship.save();
        return res.status(200).json({message:"friendship status updated"});
    }catch(error){
       // console.log("in error",friendship);
        return res.status(500).json({message:'error updating friendship status'});
    }
}

//Remove friend
exports.removeFriend = async(req,res)=>{
    try{
        const {friendshipId} = req.params;
        console.log("friendshipidId",friendshipId);
        const friendship = await Friendship.findById(friendshipId);
        if(!friendship){
            return res.status(404).json({message:"friendship not found"});
        }
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
        //get all accepted friends
        const friends = await Friendship.find({
            $or:[{user:userId, friend: userId}], 
            status: 'accepted',
        }).populate('user friend', 'username email');

        const friendIds = friends.map((friendship) => {
            return friendship.user._id.toString() === userId ? friendship.friend._id : friendship.user._id;
        });
        //get updates from friends(revies)
        const reviews = await Review.find({
            user:{$in:friendIds}
        }).populate('book user','title username');
        return res.status(200).json(reviews);
    }catch(error){
        return res.status(500).json({message:"error retrieving friend updates"});
    }
}

exports.getPendingFriendRequests = async (req, res) => {
    try {
        const userId = req.userId;
        console.log("pendigUserId",userId);

        // Find all pending friend requests where the user is the recipient (friend).
        const pendingRequests = await Friendship.find({
            friend: userId,
            status: 'pending'
        }).populate('user', 'username email');  // Populate sender details for easy reference
        console.log("Pending Friend Requests:", pendingRequests);
        res.status(200).json(pendingRequests);
    } catch (error) {
        console.log("Error retrieving pending friend requests:", error);
        res.status(500).json({ message: "Error retrieving pending friend requests" });
    }
};

// //get dashboard data

// exports.getDashboard= async(req,res)=>{
//     try {
//         const friendUpdates = await this.getFriendUpdates(req, res);
//         return res.status(200).json(friendUpdates);
//       } catch (error) {
//         console.log("Error retrieving dashboard data:", error);
//         return res.status(500).json({ message: "Error retrieving dashboard data" });
//       }
// }


exports.getEligibleUsers = async (req, res) => {
    try {
        const currentUserId = req.userId; // Extracted from verifyToken middleware

        // Fetch all friendships involving the current user
        const existingFriendships = await Friendship.find({
            $or: [
                { user: currentUserId },
                { friend: currentUserId },
            ],
        });

        // Extract IDs of friends and users with pending requests
        const excludedUserIds = new Set(
            existingFriendships.flatMap((friendship) => [
                friendship.user.toString(),
                friendship.friend.toString(),
            ])
        );

        // Also exclude the current user
        excludedUserIds.add(currentUserId);

        // Find eligible users (users not in the excluded set)
        const eligibleUsers = await User.find({
            _id: { $nin: Array.from(excludedUserIds) },
        }).select('_id username email'); // Return only necessary fields

        res.status(200).json(eligibleUsers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch eligible users', error: error.message });
    }
};
