const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

require('dotenv').config();
//setting the view engine as ejs
app.set('view engine','ejs');
app.set('views','./views');

// Serve static files
// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
const uri=`mongodb+srv://trulyias:trulyias23@cluster0.riz6jje.mongodb.net/ias?retryWrites=true&w=majority`

// Connect to MongoDB
mongoose.connect(uri);

//creating question schema
const questionSchema = new mongoose.Schema({
    title: String,
    questionText: String,
    answer: String,
    image: String,
    url: String,
    submitTime: Date,
    subject: String,
    topic: String,
  });
  
const Question = mongoose.model('Question', questionSchema);
  


app.get('/',async (req,res)=>{
    try{
        const questions = await Question.find().sort({submitTime:-1});
        res.render('user/homepage',{questions});
    }catch(err){
        console.log(err);
        res.status(500).send('Server Error');
    }
});

//route for individual quesstion
app.get('/question/:id',async (req,res)=>{
    const  id  = req.params.id;
    try {
        const question = await Question.findById(id);
        const allQuestions = await Question.find().sort({ submitTime: -1 });
        const currentIndex = allQuestions.findIndex(q => q.id === id);
        const previousQuestionId = currentIndex > 0 ? allQuestions[currentIndex - 1].id : null;
        const nextQuestionId = currentIndex < allQuestions.length - 1 ? allQuestions[currentIndex + 1].id : null;

        res.render('user/questionPage', {
        question,
        previousQuestionId,
        nextQuestionId,
        });
    } catch (err) {
        console.error(err);
        res.status(404).send('Question not found');
    }
})


//get the add question form
app.get('/add-question',(req,res)=>{
    res.render('admin/addQuestion');
})

//handling the question submission
app.post('/add-question',async (req,res)=>{
    const data=await req.body;
    const newQuestion = new Question({
        title: data.title,
        questionText: data.questionText,
        answer: data.answer,
        image: data.image,
        url:data.url,
        submitTime:data.submitTime,
        subject:data.subject,
        topic:data.topic,
      });
      try{
        await newQuestion.save();
        res.redirect('/');
      }
      catch(err){
        console.log(err);
        res.status(500).send('Server Error');
      }
})


const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log('Server Sarted!');
});

