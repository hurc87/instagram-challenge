const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');

// Load profile model
const Profile = require('../../models/Profile');

// Load user profile
const User = require('../../models/User');


// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Profile works"}));

// @route   GET api/profile
// @desc    Get the current users profile
// @access  Private
router.get(
  '/',
  passport.authenticate('jwt', { session:false }),
  (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.user.id })
    .populate('user', ['name'])
    .then(profile => {
      if(!profile){
        errors.noprofile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/username/:username
// @desc    Get profile by username
// @access  Public

router.get('/username/:username', (req, res) => {
  const errors = {};
  Profile.findOne({ username: req.params.username })
    .populate('user', ['name'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get('/user/:user_id', (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json({profile: 'There is no profile for this user'}));
});


// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session:false }),
  (req, res) => {

    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if(!isValid){
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.username) profileFields.username = req.body.username;
    if(req.body.bio) profileFields.bio = req.body.bio;

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if(profile) {
          // Update
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          )
          .then(profile => res.json(profile));
        } else {
          // Create

          // Check to see if the username existst
          Profile.findOne({ username: profileFields.username })
            .then(profile => {
              if(profile) {
                errors.username = 'That username already exists';
                res.status(400).json(errors);
              }
              // Save profile
              new Profile(profileFields).save()
                .then(profile => res.json(profile));
            })
        }
      });
    }
);



module.exports = router;
