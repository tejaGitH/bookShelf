const express = require('express');
const router = express.Router();
const friendshipController = require("../controllers/friendshipController");

//send friend request
router.post('/friend-requests',friendshipController.sendFriendRequest);
//retrieve user's friendlist
router.get('/friends',friendshipController.getFriends);
//update friendship status
router.patch('/friendships',friendshipController.updateFriendshipStatus);
//remoove friend
router.delete('/friends/:id',friendshipController.removeFriend);
//get friend updates
router.get('/friend-updates',friendshipController.getFriendUpdates);
//get dashboard data
router.get('/dashboard',friendshipController.getDashboard);

module.exports = router;