// import collegeData module to access functions that can return data
const collegeData = require('./modules/collegeData');

// call  initialize function to setup student and course data and then test each methods
collegeData.initialize()
    .then(() => {
        console.log("Initialization successful!");

        // get all students
        collegeData.getAllStudents()
            .then(allStudents => {
                console.log(`Successfully retrieved ${allStudents.length} students`);
            })
            .catch(error => {
                console.error("getAllStudents Error:", error);
            });

        // get all courses
        collegeData.getCourses()
            .then(allCourses => {
                console.log(`Successfully retrieved ${allCourses.length} courses`);
            })
            .catch(error => {
                console.error("getCourses Error:", error);
            });

        // get all TAs
        collegeData.getTAs()
            .then(allTAs => {
                console.log(`Successfully retrieved ${allTAs.length} TAs`);
            })
            .catch(error => {
                console.error("getTAs Error:", error);
            });
        //get studentByCourse  
        collegeData.getStudentsByCourse(5)
            .then(matchedStudents => {
                console.log(`Successfully retrieved ${matchedStudents.length} students`);
            })
            .catch(error => {
                console.error("getStudentByCourse :",error);
            });   
        //get studentByNum
        collegeData.getStudentByNum(2000)
        .then(matchedStudent => {
            console.log(`Successfully retrieved student ${matchedStudent.firstName} for student number 2`);
        })
        .catch(error => {
            console.error("getStudentByNum :",error);
        });                   
    })
    .catch(error => {
        console.error("Initialization Error:", error);
    });