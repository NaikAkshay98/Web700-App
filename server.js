/********************************************************************************
* WEB700 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Akshayarekha Subhramaniyan Student ID: 166557223 Date: 15-10-2023
*
********************************************************************************/
//Include Dependecies 
var express = require("express");
var path = require("path");
//Import collegeData module
var collegeData = require("./modules/collegeData");

//Define default HTTP port
var HTTP_PORT = process.env.PORT || 8080;

//Define Display messages 
const promiseRejectionMessage = "No results returned";
const noResultMessage = "no results";
const internalErrorMessage = "Internal server error";

//Initalizse express app
var app = express();

// Define the static middleware to serve files from the 'public' folder
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


//Call initalizse from collegeData to initialzse and setup required objects like students and courses.
collegeData.initialize()
.then(()=>{

    //Route for getting all students or students for a given course.
    app.get("/students",async(req,res)=>{
        try{
            if(req.query.course){
                //convert query string value to integer and store it in course variable
                var course = parseInt(req.query.course);
                //Get students with matching course id by calling getStudentsByCourse from collegeData.
                var students = await collegeData.getStudentsByCourse(course);
                if(students && students.length > 0){
                    res.json(students);
                }else{
                    res.json({message:noResultMessage});
                }
            }else{
                // Get all students by calling getAllStudents function from collegeData.
                const students = await collegeData.getAllStudents();
                if(students && students.length > 0){
                    res.json(students);
                }else{
                    res.json({message:noResultMessage});
                }
            }
        }catch(err){
            //Check if the error is promise rejection message and then return no results message.
            if(err === promiseRejectionMessage)
            {
                res.json({message:noResultMessage});
            }else{
                console.error(err);
                res.status(500).json({message:internalErrorMessage});
            }
        }
    });
    //Route for getting TAs with async support
    app.get("/tas",async(req,res)=>{
        try{
            //Get all TAs using getTAs function from collegeData module (rejections due to empty or undefined is handld in catch block)
            //This else block is added as a safety fallback to ensure a response in sent any situation
            const TAs = await collegeData.getTAs();
            if(TAs && TAs.length > 0){
                res.json(TAs);
            }else{
                res.json({message:noResultMessage});
            }
        }catch(err){
            //Check if the error is promise rejection message and then return no results message.
            if(err === promiseRejectionMessage)
            {
                res.json({message:noResultMessage});
            }else{
                console.error(err);
                res.status(500).json({message:internalErrorMessage});
            }
        }
    });

    //Route for getting all courses
    app.get("/courses",async(req,res)=>{
        try{
            //Get all course using getCourses from collegeData module.
            const courses = await collegeData.getCourses();
            if(courses && courses.length > 0){
                res.json(courses);
            }else{
                res.json({message:noResultMessage});
            }
        }catch(err){
            //Check if the error is promise rejection message and then return no results message.
            if(err === promiseRejectionMessage ){
                res.json({message:noResultMessage});
            }else{
                console.error(err);
                res.status(500).json({message:internalErrorMessage});
            }
        }
    });

    // Route for getting student for a given studentNum
    app.get("/student/:num", async (req, res) => {
        try{
            //read the request parameter string and store in a variable after converting it to int
            const num = parseInt(req.params.num); 
            //Get student for the given studentNum by calling getStudentByNum function from collegeData.
            const matchedStudent = await collegeData.getStudentByNum(num);
            if(matchedStudent){
                res.json(matchedStudent);
            }else{
                res.json({message:noResultMessage});
            }
            }catch(err){
                 //Check if the error is promise rejection message and then return no results message.
                if(err === promiseRejectionMessage ){
                    res.json({message:noResultMessage});
                }else{
                    console.error(err);
                    res.status(500).json({message:internalErrorMessage});
                }
            }
    });
    
    //Route for adding student to the student array
    app.post('/students/add', async (req, res) => {
        try {
          // Call the addStudent function with req.body as the parameter
         const createdStudent = await collegeData.addStudent(req.body);
      
          // Redirect to the "/students" route after successful addition
          res.redirect('/students');
        } catch (error) {
          // Handle any errors here, e.g., send an error response or redirect to an error page
          res.status(500).json({message:"Error adding student"});
        }
      });
      
      

    //Route for homepage
    app.get("/",(req,res)=>{
        res.sendFile(path.join(__dirname,"views","home.html"));
    });
    
    //Route for about
    app.get("/about",(req,res)=>{
        res.sendFile(path.join(__dirname,"views","about.html"));
    });

    //Route for htmlDemo
    app.get("/htmlDemo",(req,res)=>{
        res.sendFile(path.join(__dirname,"views","htmlDemo.html"));
    });

     //Route for addStudent
     app.get("/students/add",(req,res)=>{
        res.sendFile(path.join(__dirname,"views","addStudent.html"));
    });

    //Below Line will be invoked for any undefined routes than above.
    app.use((req,res)=>{
      //  res.status(404).send("Page Not Found");
      res.status(404).sendFile(path.join(__dirname,"views","pageNotFound.html"));
        
    });

    // Setup HTTP server to listen on HTTP_PORT
    app.listen(HTTP_PORT, () => {
        console.log("Server listening on port: " + HTTP_PORT);
    });

})
.catch(err => {
    //handle the rejection by outputing an error to console.
    console.error("Initalizastion error",err);
});
