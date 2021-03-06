const express = require('express');
const router = express.Router();
const middlewares = require('../middlewares/middlewares')
const Professional = require('../models/professional')
const DateModel = require('../models/dateModel')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Appointment = require('../models/appointment')

/* GET users listing. */
router.get('/', middlewares.requireUser , (req, res, next) => {
  const currentUser = req.session.currentUser
  let user = null;
  if(currentUser.role === "client"){
    user = {client: currentUser._id}
  } else if(currentUser.role === "professional"){
    user = {professional: currentUser._id}
  }
  Appointment.find(user)
  .populate('professional')
  .populate('date')
  .populate('client')
  .then(appointments => {
    res.render('profile',{appointments})
    
  })
  .catch(next)

})

router.get('/edit', middlewares.requireUser , (req, res, next) => {
  res.render('profile-edit')
})

router.post('/edit', middlewares.requireUser , (req, res, next) => {
  const id = req.session.currentUser._id;
  const {email, image, description} = req.body

  if (!email || !description) {
    req.flash('error', 'all fields are required')
    return res.redirect('/profile/edit')
  }

  Professional.findByIdAndUpdate(id, {$set :{email: email, image:image, description:description}},{new : true})
  .then(professional => {
    req.session.currentUser = professional;
    res.redirect('/profile/edit')
  })
  .catch(next)
})

router.post('/delete/services/:service',middlewares.requireUser,(req, res, next) => {
  const service = req.params.service
  const id = req.session.currentUser._id;

  Professional.findById(id)
  .then(professional => {
    professional.services.forEach((item, idx) => {
      if(item.name === service){
        professional.services.splice(idx, 1)
      }
    })
    professional.save()
    .then(result => {
      req.session.currentUser = result;
      res.redirect('/profile/edit')
    })
    .catch(next)
  })
  .catch(next)
})
router.post('/add-service',middlewares.requireUser,(req, res, next) => {
  const {name, duration}= req.body
  const id = req.session.currentUser._id;

  Professional.findById(id)
  .then(professional => {
    professional.services.push({name: name, duration: duration})
    professional.save()
    .then(succes => {
      req.flash('info', 'Añadido correctamente');
      req.session.currentUser = succes;
      return res.redirect('/profile/edit');
    })
    .catch(next)

  })
  .catch(next)
})


router.post('/delete/employees/:employee', middlewares.requireUser ,(req, res, next) => {
  const employee = req.params.employee
  const id = req.session.currentUser._id;

  Professional.findById(id)
  .then(professional => {
    professional.employees.forEach((item, idx) => {
      if(item.name === employee){
        professional.employees.splice(idx, 1)
      }
    })
    professional.save()
    .then(result => {
      req.session.currentUser = result;
      res.redirect('/profile/edit')
    })
    .catch(next)
  })
  .catch(next)
})


router.post('/add-employee', middlewares.requireUser ,(req, res, next) => {
  const {name}= req.body
  const id = req.session.currentUser._id;
  let timeBlock = [];
  DateModel.find({year: 2018})
  .then(dates => {
    dates.forEach(date => {
      dateId = date._id
      timeBlock.push({date: ObjectId(dateId)})
    })
    Professional.findById(id)
    .then(professional => {
  
      professional.employees.push({name: name, timeBlock: timeBlock})
      professional.save()
      .then(succes => {
        req.flash('info', 'Añadido correctamente');
        req.session.currentUser = succes;
        return res.redirect('/profile/edit');
      })
      .catch(next)
  
    })
    .catch(next)
  })
  .catch(next)
})




module.exports = router;
