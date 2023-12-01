/********************************************************************************
* WEB700 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name:  Student ID:  Date: 
*
* Online (Cyclic) Link: 
* 
*
********************************************************************************/
//Include Dependecies 
var express = require("express");
var path = require("path");
//Import collegeData module
var collegeData = require("./modules/collegeData");
// Import express-handlebars module
const exphbs = require('express-handlebars');

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

// set the active route i.e.  determine the current active route and set it in app.locals for later reference
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

    
// set handlebars engine with express and set ,hbs file extension for handlebars helpers, file & default main layout
app.set('view engine', '.hbs');
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options) {
            return `<li class="nav-item">
                <a class="nav-link ${url == app.locals.activeRoute ? "active" : ""}" href="${url}">${options.fn(this)}</a>
            </li>`;
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper 'equal' needs 2 parameters");
            return lvalue != rvalue ? options.inverse(this) : options.fn(this);
        }
    }
});

// Set view engine of the app to handlebars and extend engine with helpers
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');


//Call initalizse from collegeData to initialzse and setup required objects like students and courses.
collegeData.initialize()
.then(()=>{

    //Route for getting all students or students for a given course.
// ... [other parts of your code]

    // Route for getting all students or students for a given course.
    app.get("/students", async (req, res) => {
        try {
            let students;
            if (req.query.course) {
                // Convert query string value to integer and store it in course variable
                var course = parseInt(req.query.course);
                // Get students with matching course id by calling getStudentsByCourse from collegeData.
                students = await collegeData.getStudentsByCourse(course);
            } else {
                // Get all students by calling getAllStudents function from collegeData.
                students = await collegeData.getAllStudents();
            }

            if (students && students.length > 0) {
                // Render the students view, passing the students data
                res.render("students", { students: students });
                
                // below to test the negative test condition by sending an empty array
                //res.render("students", { students: [], message: "No students found." });
                
            } else {
                // Render the students view with a message when no students are found
                res.render("students", { message: noResultMessage });
            }
        } catch (err) {
            // Check if the error is promise rejection message and then return no results message.
            if (err === promiseRejectionMessage) {
                res.render("students", { message: noResultMessage });
            } else {
                console.error(err);
                res.status(500).render("students", { message: internalErrorMessage });
            }
        }
    });



    //Route for getting all courses
    app.get("/courses", async (req, res) => {
        try {
            // Get all courses by calling a function like getCourses() from your data module
            const courses = await collegeData.getCourses();
            if (courses && courses.length > 0) {
                res.render("courses", { courses: courses });

                // below to test the negative test condition by sending an empty array
                //res.render("courses", { courses: [], message: "No course found." });
            } else {
                res.render("courses", { message: "no results" });
            }
        } catch (err) {
            console.error(err);
            res.render("courses", { message: "no results" });
        }
    });
    

    // Route for getting a specific course by its ID
    app.get("/course/:id", async (req, res) => {
        try {
            // Get a specific course by calling getCourseById() from your data module
            const course = await collegeData.getCourseById(req.params.id);
            if (course) {
                res.render("course", { course: course });
            } else {
                // Render the course view with a message when no course is found
                res.status(404).render("course", { message: "Course not found" });
            }
        } catch (err) {
            console.error(err);
            // Render the course view with an error message in case of any exceptions
            res.render("course", { message: "An error occurred" });
        }
    });


    // Route for getting student for a given studentNum
    app.get("/student/:num", async (req, res) => {
        try {
            // Read the request parameter string and store in a variable after converting it to int
            const num = parseInt(req.params.num);

            // Initialize object to store the student and courses
            let viewData = {};

            // Get student for the given studentNum
            const matchedStudent = await collegeData.getStudentByNum(num);
            if (matchedStudent) {
                viewData.student = matchedStudent;
            } else {
                viewData.student = null; // Set student to null if none were returned
            }

            // Get all courses
            const courses = await collegeData.getCourses();
            viewData.courses = courses; // keep course data in the "viewData" object as "courses"

            // compare and set selected course true if the student course Id exisits in course
            if (viewData.student && viewData.student.course && viewData.courses) {
                for (let i = 0; i < viewData.courses.length; i++) {
                    if (viewData.courses[i].courseId == viewData.student.course) {
                        viewData.courses[i].selected = true;
                    }
                }
            }

            // Render  "student" view
            if (viewData.student == null) {
                res.status(404).render("student", { message: "Student Not Found" });
            } else {
                res.render("student", { viewData: viewData });
            }

        } catch (err) {
            console.error(err);
            // Render the student view with an error message in case of any exceptions
            res.render("student", { message: "An error occurred" });
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
      
    // Route for updating a student in the student array
    app.post("/student/update", (req, res) => {
        collegeData.updateStudent(req.body)
            .then(() => {
                console.log("Student updated:", req.body);
                // Redirect to the "/students" route after successful update
                res.redirect("/students");
            })
            .catch(err => {
                // Handle any errors here, e.g., send an error response or redirect to an error page
                console.error(err);
                res.status(500).send("Unable to update student");
            });
    });

        // Route for adding a new course
        app.post('/courses/add', async (req, res) => {
            try {
                // Call addCourse function with req.body as input
                await collegeData.addCourse(req.body);
    
                // Redirect to the "/courses" route after successful addition
                res.redirect('/courses');
            } catch (error) {
                // Handle any errors here, e.g., send an error response or redirect to an error page
                console.error("Error adding course:", error);
                res.status(500).json({ message: "Error adding course" });
            }
        });
    
        // POST route for updating a course
        app.post('/course/update', async (req, res) => {
            try {
                // Call the updateCourse function with req.body as the parameter
                await collegeData.updateCourse(req.body);
    
                // Redirect to the "/courses" route after successful update
                res.redirect('/courses');
            } catch (error) {
                // Handle any errors here, e.g., send an error response or redirect to an error page
                console.error("Error updating course:", error);
                res.status(500).json({ message: "Error updating course" });
            }
        });

        // Route for deleting a specific course by its id
        app.get("/course/delete/:id", async (req, res) => {
            try {
                // Call the deleteCourseById() function with the given course id
                await collegeData.deleteCourseById(parseInt(req.params.id));

                // Redirect to the "/courses" route upon successful deletion
                res.redirect("/courses");
            } catch (error) {
                // Handle any errors here, e.g., send an error response or redirect to an error page
                console.error("Error deleting course:", error);
                //return 500 status code and plain text message for error
                res.status(500).send("Unable to Remove Course / Course not found");
            }
        });

        // Route for addStudent with updated course details
        app.get("/students/add", (req, res) => {
            collegeData.getCourses()
                .then(courses => {
                    // render the addStudent view with the courses data
                    if (courses && courses.length > 0) {
                        res.render("addStudent", { courses: courses });
                    } else {
                        // render the addStudent view with a message
                        res.render("addStudent", { courses: [], message: "No courses found" });
                    }
                })
                .catch(err => {
                    console.error("Error fetching courses:", err);
                    // In case of an error, render the addStudent view with an empty courses array and an error message
                    res.render("addStudent", { courses: [], message: "Error fetching course data" });
                });
        });

        // Route for deleting a specific student by their student number
        app.get("/student/delete/:studentNum", (req, res) => {
            collegeData.deleteStudentByNum(parseInt(req.params.studentNum))
                .then(() => {
                    // Redirect to the "/students" route upon successful deletion
                    res.redirect("/students");
                })
                .catch(err => {
                    // Handle any errors here, e.g., send an error response or redirect to an error page
                    console.error("Error deleting student:", err);
                    // Return 500 status code and plain text message for error
                    res.status(500).send("Unable to Remove Student / Student not found");
                });
        });

    //Route for homepage
    app.get("/",(req,res)=>{
        //res.sendFile(path.join(__dirname,"views","home.html"));
        res.render('home'); // This will render the home.hbs view within the main.hbs layout
    });
    
    //Route for about
    app.get("/about",(req,res)=>{
        //res.sendFile(path.join(__dirname,"views","about.html"));
        res.render('about'); // This will render the about.hbs view within the main.hbs layout
    });

    //Route for htmlDemo
    app.get("/htmlDemo",(req,res)=>{
        //res.sendFile(path.join(__dirname,"views","htmlDemo.html"));
        res.render('htmlDemo'); // This will render the htmlDemo.hbs view within the main.hbs layout
    });

    //Route for addCourse
    app.get("/courses/add",(req,res)=>{
        res.render('addCourse'); // This will render the addStudent.hbs view within the main.hbs layout
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
