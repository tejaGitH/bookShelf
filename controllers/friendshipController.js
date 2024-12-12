const Friendship = require("../models/Friendship");
const User = require("../models/User");
const Review = require("../models/Review");
const mongoose = require('mongoose');

//send friend request
// friendshipController.js
// friendshipController.js
exports.sendFriendRequest = async (req, res) => {
    try {
        const {  friendId } = req.body;
        const userId = req.userId;

        // Input validation
        if (!friendId) {
            return res.status(400).json({ message: "Friend Id required" });
        }
        if (userId === friendId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        // Check if the friendship status already exists
        const existingFriendship = await Friendship.findOne({
            $or: [
                { user: userId, friend: friendId, status: 'pending' },
                { user: friendId, friend: userId, status: 'pending' }
            ]
        });

        if (existingFriendship) {
            return res.status(400).json({ message: "Friendship already exists" });
        }

        // Create new friendship request with status pending
        const newFriendship = new Friendship({
            user: userId,
            friend: friendId,
            status: 'pending'
        });
        await newFriendship.save();

        // Update sender's sentRequests
        await User.findByIdAndUpdate(userId, {
            $addToSet: { sentRequests: friendId }
        });

        // Update receiver's receivedRequests
        await User.findByIdAndUpdate(friendId, {
            $addToSet: { receivedRequests: userId }
        });

        console.log("Friend request sent from:", userId, "to:", friendId);
        return res.status(201).json({ message: "Friend request sent" });
    } catch (error) {
        console.log("Error sending friend request:", error);
        return res.status(500).json({ message: "Error sending friend request", error: error.message || error });
    }
};


//retrieve users friendlist
exports.getFriends=async(req,res)=>{
    try{
        const userId = req.userId;
        //get friends where the status is accepted
        const friends = await Friendship.find({
            $or: [{user: userId}, {friend: userId}],
            status: 'accepted',
        }).populate('user friend', 'user email'); //populate both user and friend details
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

// exports.getEligibleUsers = async (req, res) => {
//     try {
//         const currentUserId = req.userId;

//         // Pagination inputs: limit and offset
//         const { limit = 6, offset = 0 } = req.query; // Default: 6 users per request, starting at 0

//         // Fetch existing friendships
//         const existingFriendships = await Friendship.find({
//             $or: [{ user: currentUserId }, { friend: currentUserId }],
//         }).populate('user friend');  // Ensure that `user` and `friend` fields are populated

//         // Exclude friends, pending requests, and the current user
//         const excludedUserIds = new Set();

//         existingFriendships.forEach((friendship => {
//             // Ensure that user and friend are defined before accessing _id
//             if (friendship.user && friendship.user._id && friendship.user._id.toString() !== currentUserId) {
//                 excludedUserIds.add(friendship.user._id.toString());
//             }
//             if (friendship.friend && friendship.friend._id && friendship.friend._id.toString() !== currentUserId) {
//                 excludedUserIds.add(friendship.friend._id.toString());
//             }

//             // Exclude users with a pending friendship request
//             if (friendship.status === 'pending') {
//                 if (friendship.user && friendship.user._id.toString() !== currentUserId) {
//                     excludedUserIds.add(friendship.user._id.toString());
//                 } else if (friendship.friend && friendship.friend._id.toString() !== currentUserId) {
//                     excludedUserIds.add(friendship.friend._id.toString());
//                 }
//             }
//         });

//         excludedUserIds.add(currentUserId); // Exclude the current user

//         // Fetch eligible users
//         const eligibleUsers = await User.find({
//             _id: { $nin: Array.from(excludedUserIds) },
//         })
//             .select('_id username email')
//             .skip(Number(offset))
//             .limit(Number(limit)); // Pagination applied

//         res.status(200).json(eligibleUsers);
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to fetch eligible users', error: error.message });
//     }
// };

// exports.getEligibleUsers = async (req, res) => {
//     try {
//       const currentUserId = req.userId;
  
//       // Fetch existing friendships
//       const existingFriendships = await Friendship.find({
//         $or: [{ user: currentUserId }, { friend: currentUserId }],
//       });
  
//       // Extract IDs of friends and users with pending requests
//       const excludedUserIds = new Set();
//       existingFriendships.forEach((friendship) => {
//         if (friendship.user && friendship.user._id) {
//           excludedUserIds.add(friendship.user._id.toString());
//         }
//         if (friendship.friend && friendship.friend._id) {
//           excludedUserIds.add(friendship.friend._id.toString());
//         }
//       });
  
//       // Also exclude the current user
//       excludedUserIds.add(currentUserId.toString());
  
//       // Find eligible users (users not in the excluded set)
//       const eligibleUsers = await User.find({
//         _id: { $nin: Array.from(excludedUserIds) },
//       }).select('_id username email');
  
//       // Return only necessary fields
//       res.status(200).json(eligibleUsers);
//     } catch (error) {
//       res.status(500).json({
//         message: 'Failed to fetch eligible users',
//         error: error.message,
//       });
//     }
//   };

// exports.getEligibleUsers = async (req, res) => {
//     try {
//         const currentUserId = req.userId;

//         // Pagination inputs: limit and offset
//         const { limit = 6, offset = 0 } = req.query; // Default: 6 users per request, starting at 0

//         // Fetch existing friendships
//         const existingFriendships = await Friendship.find({
//             $or: [{ user: currentUserId }, { friend: currentUserId }],
//         }).populate('user friend');  // Ensure that `user` and `friend` fields are populated

//         // Exclude friends, pending requests, and the current user
//         const excludedUserIds = new Set();

//         existingFriendships.forEach(friendship => {
//             // Ensure that user and friend are defined before accessing _id
//             if (friendship.user && friendship.user._id && friendship.user._id.toString() !== currentUserId) {
//                 excludedUserIds.add(friendship.user._id.toString());
//             }
//             if (friendship.friend && friendship.friend._id && friendship.friend._id.toString() !== currentUserId) {
//                 excludedUserIds.add(friendship.friend._id.toString());
//             }

//             // Exclude users with a pending friendship request
//             if (friendship.status === 'pending') {
//                 if (friendship.user && friendship.user._id.toString() !== currentUserId) {
//                     excludedUserIds.add(friendship.user._id.toString());
//                 } else if (friendship.friend && friendship.friend._id.toString() !== currentUserId) {
//                     excludedUserIds.add(friendship.friend._id.toString());
//                 }
//             }
//         });

//         excludedUserIds.add(currentUserId); // Exclude the current user

//         // Fetch eligible users
//         const eligibleUsers = await User.find({
//             _id: { $nin: Array.from(excludedUserIds) },
//         })
//             .select('_id username email')
//             .skip(Number(offset))
//             .limit(Number(limit)); // Pagination applied

//         res.status(200).json(eligibleUsers);
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to fetch eligible users', error: error.message });
//     }
// };
// exports.getEligibleUsers = async (req, res) => {
//     try {
//       const currentUserId = req.userId;
  
//       // Find the current user's document
//       const currentUser = await User.findById(currentUserId).populate('sentRequests');
  
//       // Find all users who are not friends with the current user
//       // and to whom the current user has not sent a friend request
//       const eligibleUsers = await User.find({
//         _id: { $ne: currentUserId },
//         _id: { $nin: currentUser.sentRequests.map((user) => id.toString()) },
//       })
//         .select('_id username email')
//         .limit(5);
  
//       res.status(200).json(eligibleUsers);
//     } catch (error) {
//       console.log('Error fetching eligible users:', error);
//       res.status(500).json({ message: 'Error fetching eligible users', error: error.message });
//     }
//   };

// friendshipController.js
// friendshipController.js
// friendshipController.js
// friendshipController.js
// friendshipController.js

// exports.getEligibleUsers = async (req, res) => {
//     try {
//         const currentUserId = req.userId;
//         const { limit = 5, offset = 0 } = req.query;

//         const currentUser = await User.findById(currentUserId).populate('sentRequests');

//         if (!currentUser) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const sentRequestsIds = currentUser.sentRequests.map((user) => user._id.toString());
//         sentRequestsIds.push(currentUserId); // Add current user ID to exclusion list

//         const eligibleUsersQuery = User.aggregate([
//             {
//                 $match: {
//                     _id: { $nin: sentRequestsIds.map((id) => new mongoose.Types.ObjectId(id)) }, // Correct use of `new`
//                 },
//             },
//             {
//                 $lookup: {
//                     from: 'friendships',
//                     let: { userId: '$_id' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ['$user', '$$userId'] },
//                                         { $eq: ['$friend', new mongoose.Types.ObjectId(currentUserId)] },
//                                     ],
//                                 },
//                             },
//                         },
//                     ],
//                     as: 'friendshipStatus',
//                 },
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     username: 1,
//                     email: 1,
//                     status: { $arrayElemAt: ['$friendshipStatus.status', 0] },
//                 },
//             },
//         ]);

//         const eligibleUsers = await eligibleUsersQuery
//             .skip(Number(offset))
//             .limit(Number(limit));

//         const totalEligibleUsers = await User.countDocuments({
//             _id: { $nin: sentRequestsIds.map((id) => new mongoose.Types.ObjectId(id)) },
//         });

//         const hasMore = Number(offset) + eligibleUsers.length < totalEligibleUsers;

//         res.status(200).json({
//             users: eligibleUsers,
//             hasMore,
//             total: totalEligibleUsers,
//         });
//     } catch (error) {
//         console.error('Error fetching eligible users:', error);
//         res.status(500).json({ message: 'Error fetching eligible users', error: error.message });
//     }
// };
// exports.getEligibleUsers = async (req, res) => {
//     try {
//         const currentUserId = req.userId;
//         const { limit = 5, offset = 0 } = req.query;

//         // Fetching sent requests using the Friendship model
//         const sentRequests = await Friendship.find({ user: currentUserId }).populate('friend');
//         const receivedRequests = await Friendship.find({ friend: currentUserId }).populate('user');

//         // Safely handle undefined values in sentRequests and receivedRequests arrays
//         const sentRequestsIds = sentRequests.map(friendship => friendship.friend?._id?.toString()).filter(Boolean);
//         const receivedRequestsIds = receivedRequests.map(friendship => friendship.user?._id?.toString()).filter(Boolean);

//         const exclusionIds = new Set([...sentRequestsIds, ...receivedRequestsIds, currentUserId]);

//         const eligibleUsersQuery = User.find({
//             _id: { $nin: Array.from(exclusionIds) }
//         }).select('_id username email');

//         const eligibleUsers = await eligibleUsersQuery.skip(Number(offset)).limit(Number(limit));
//         const totalEligibleUsers = await User.countDocuments({
//             _id: { $nin: Array.from(exclusionIds) }
//         });

//         const hasMore = Number(offset) + eligibleUsers.length < totalEligibleUsers;

//         res.status(200).json({
//             users: eligibleUsers,
//             hasMore,
//             total: totalEligibleUsers
//         });
//     } catch (error) {
//         console.log('Error fetching eligible users:', error);
//         res.status(500).json({ message: 'Error fetching eligible users', error: error.message });
//     }
// };



// exports.getEligibleUsers = async (req, res) => {
//     try {
//         const { limit = 5, offset = 0 } = req.query;
//         const userId = req.userId;

//         const sentRequests = await Friendship.find({ user: userId, status: 'pending' }).populate('friend');
//         const receivedRequests = await Friendship.find({ friend: userId, status: 'pending' }).populate('user');

//         const excludedIds = new Set([...sentRequests.map(f => f.friend._id), ...receivedRequests.map(f => f.user._id), userId]);

//         const eligibleUsers = await User.find({ _id: { $nin: Array.from(excludedIds) } })
//             .skip(Number(offset))
//             .limit(Number(limit))
//             .select('_id username email');

//         const totalEligibleUsers = await User.countDocuments({ _id: { $nin: Array.from(excludedIds) } });

//         res.status(200).json({
//             users: eligibleUsers,
//             total: totalEligibleUsers,
//             hasMore: Number(offset) + eligibleUsers.length < totalEligibleUsers
//         });
//     } catch (error) {
//         console.error('Error fetching eligible users:', error);
//         res.status(500).json({ message: 'Error fetching eligible users', error: error.message });
//     }
// };

exports.getEligibleUsers = async (req, res) => {
    try {
        const { limit = 5, offset = 0 } = req.query;
        const userId = req.userId;

        const sentRequests = await Friendship.find({ user: userId, status: 'pending' }).populate('friend');
        const receivedRequests = await Friendship.find({ friend: userId, status: 'pending' }).populate('user');

        const excludedIds = new Set([
            ...sentRequests.map(f => f.friend && f.friend._id).filter(Boolean), 
            ...receivedRequests.map(f => f.user && f.user._id).filter(Boolean), 
            userId
        ]);

        const eligibleUsers = await User.find({ _id: { $nin: Array.from(excludedIds) } })
            .skip(Number(offset))
            .limit(Number(limit))
            .select('_id username email');

        const totalEligibleUsers = await User.countDocuments({ _id: { $nin: Array.from(excludedIds) } });

        res.status(200).json({
            users: eligibleUsers,
            total: totalEligibleUsers,
            hasMore: Number(offset) + eligibleUsers.length < totalEligibleUsers
        });
    } catch (error) {
        console.error('Error fetching eligible users:', error);
        res.status(500).json({ message: 'Error fetching eligible users', error: error.message });
    }
};


// friendshipController.js
// exports.getSocialUpdates = async (req, res) => {
//     try {
//         const userId = req.userId;
//         console.log("User ID:", userId); // Logging

//         const friendships = await Friendship.find({
//             $or: [{ user: userId }, { friend: userId }],
//             status: "accepted"
//         }).populate("user friend");
//         console.log("Friendships found:", friendships); // Logging

//         // Safely handle undefined values in friendships array
//         const friendIds = friendships.map(f => {
//             if (!f.user || !f.friend) {
//                 console.error("Undefined user or friend in friendship:", f);
//                 return null;
//             }
//             return f.user._id.toString() === userId ? f.friend._id.toString() : f.user._id.toString();
//         }).filter(Boolean);
//         console.log("Friend IDs:", friendIds); // Logging

//         const updates = await Review.find({ user: { $in: friendIds } })
//             .populate("user", "username")
//             .populate("book", "title");
//         console.log("Updates found:", updates); // Logging

//         res.status(200).json(updates);
//     } catch (error) {
//         console.error("Error fetching updates:", error); // Logging
//         res.status(500).json({ message: "Error fetching updates", error: error.message });
//     }
// };


exports.getSocialUpdates = async (req, res) => {
    try {
        const userId = req.userId;
        const friendships = await Friendship.find({
            $or: [{ user: userId }, { friend: userId }],
            status: "accepted"
        }).populate("user friend");

        const friendIds = friendships.map(f => {
            return f.user._id.toString() === userId ? f.friend._id.toString() : f.user._id.toString();
        }).filter(Boolean);

        const updates = await Review.find({ user: { $in: friendIds.concat(userId) } })
            .populate("user", "username")
            .populate({
                path: 'book',
                select: 'title author' // Ensure 'author' is populated
            });

        res.status(200).json(updates);
    } catch (error) {
        console.error('Error fetching updates:', error);
        res.status(500).json({ message: 'Error fetching updates', error });
    }
};



// exports.getCombinedFriendUpdates = async (req, res) => {
//     try {
//         const userId = req.userId;
//         console.log("User ID:", userId); // Logging

//         const friendships = await Friendship.find({
//             $or: [{ user: userId }, { friend: userId }],
//             status: "accepted"
//         }).populate("user friend", "username email");
//         console.log("Friendships found:", friendships); // Logging

//         // Safely handle undefined values in friendships array
//         const friendIds = friendships.map(f => {
//             if (!f.user || !f.friend) {
//                 console.error("Undefined user or friend in friendship:", f);
//                 return null;
//             }
//             return f.user._id.toString() === userId ? f.friend._id.toString() : f.user._id.toString();
//         }).filter(Boolean);
//         console.log("Friend IDs:", friendIds); // Logging

//         const updates = await Review.find({ user: { $in: friendIds } })
//             .populate("user", "username")
//             .populate("book", "title");
//         console.log("Updates found:", updates); // Logging

//         res.status(200).json(updates);
//     } catch (error) {
//         console.error("Error fetching updates:", error); // Logging
//         res.status(500).json({ message: "Error retrieving friend updates", error: error.message });
//     }
// };
// 





// fetchEligibleUsers = createAsyncThunk(
//     'friendships/fetchEligibleUsers',
//     async (_, { rejectWithValue }) => {
//       try {
//         const response = await axiosInstance.get('/eligible-users');
//         return response.data;
//       } catch (error) {
//         console.error('Error fetching eligible users:', error);
//         return rejectWithValue(error.response?.data || 'Failed to fetch eligible users');
//       }
//     }
//   );           export const sendFriendRequest = createAsyncThunk(
//       'friendships/sendFriendRequest',
//       async({userId,friendId}, { rejectWithValue })=>{
//           try{
//               const response = await axiosInstance.post('/friendships/friend-requests',{userId, friendId});
//               console.log("Sending Friend Request with:", { userId, friendId });
//               return response.data;
//           }catch(error){
//             console.error("Error sending friend request:", error);
//             return rejectWithValue(error.response?.data || 'Failed to send friend request');
//           }
//       }
//   ).