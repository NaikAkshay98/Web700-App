// sequelize required to point to our postgres database
const Sequelize = require('sequelize');
/* 
Below variables will be set with the required values only in the local version.
This is commented for git checking and cyclic deployment as these variables are already set in cyclic environment variables.
process.env.PGHOST = '';
process.env.PGDATABASE = '';
process.env.PGUSER = '';
process.env.PGPASSWORD = '';
process.env.ENDPOINT_ID = '';
*/


// set up sequelize to point to our postgres database
var sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
  });

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

    // Define the Student model
const Student = sequelize.define('Student', {
    // Define columns and their data types
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, // Marks this column as the primary key
        autoIncrement: true // Automatically increments the value for new entries
    },
    firstName: {
        type: Sequelize.STRING // Defines a string column
    },
    lastName: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    addressStreet: {
        type: Sequelize.STRING
    },
    addressCity: {
        type: Sequelize.STRING
    },
    addressProvince: {
        type: Sequelize.STRING
    },
    TA: {
        type: Sequelize.BOOLEAN // Defines a boolean column
    },
    status: {
        type: Sequelize.STRING
    }
}, {
    // Additional model options
    tableName: 'students', // Explicitly specifying table name
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

// Define the Course model
const Course = sequelize.define('Course', {
    // Define columns and their data types
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: {
        type: Sequelize.STRING
    },
    courseDescription: {
        type: Sequelize.STRING
    }
}, {
    tableName: 'courses',
    timestamps: false // disable the automatic creation of timestamp fields like createdAt, updatedAt
});

// Define the relationship between Course and Student
Course.hasMany(Student, {
    foreignKey: 'course', // Adds a 'course' column to the Student table as a foreign key
    onDelete: 'SET NULL'  // If a Course is deleted, the 'course' field in Student is set to null
});

//Define Display messages 
const noResultReturnMessage = "No results returned";

// Initialize to sync database models
function initialize() {
    return new Promise((resolve, reject) => {
        // sync all models with the database
        sequelize.sync().then(() => {
            // resolves the promise if sync was successful
            resolve(); 
        }).catch(err => {
            // rejects the promise if an error occurred
            console.error("Failed to sync with database:", err);
            reject("Failed to sync with database");
        });
    });
}

// Function to return all students from student table
function getAllStudents() {
    return new Promise((resolve, reject) => {
        Student.findAll().then(data => {
            if (data) {
                // resolves the promise if sync was successful
                resolve(data); 
            } else {
                // Reject if no student data is found 
                reject("No results returned"); 
            }
        }).catch(err => {
            // rejects the promise if an error occurred
            console.error("Failed to sync and get students:", err);
            reject("Failed to sync with database");
        });
    });
}


// Function to return students for a given course id
function getStudentsByCourse(course) {
    return new Promise((resolve, reject) => {
        // select all students after filterling by the given course Id
        Student.findAll({
            where: { course: parseInt(course) } 
        }).then(data => {
            if (data && data.length > 0) {
                // Resolve with the data if one or more student found
                resolve(data); 
            } else {
                // Reject if no student found for the given course Id
                reject("No results returned"); 
            }
        }).catch(err => {
            // rejects the promise if an error occurred
            console.error("Failed to sync and get students for the course:", err);
            reject("Failed to sync with database");
        });
    });
}

// Function to return student for the givens tudent Number
function getStudentByNum(num) {
    return new Promise((resolve, reject) => {
        // select a student record after filterling by the given student Number
        Student.findAll({
            where: { studentNum: parseInt(num) } 
        }).then(data => {
            if (data && data.length > 0) {
                // Resolve with the first student object assuming only one student for the given Number
                resolve(data[0]); 
            } else {
                // Reject if no student is found for the given student Number
                reject("No results returned"); 
            }
        }).catch(err => {
            // rejects the promise if an error occurred
            console.error("Failed to sync and get student for the student Number:", err);
            reject("Failed to sync with database");
        });
    });
}

// Function to return all courses
function getCourses() {
    return new Promise((resolve, reject) => {
        Course.findAll().then(data => {
            if (data && data.length > 0) {
                // Resolve with the course data
                resolve(data); 
            } else {
                // Reject if no course data is found
                reject("No results returned"); 
            }
        }).catch(err => {
            // rejects the promise if an error occurred
            console.error("Failed to sync and get courses:", err);
            reject("Failed to sync with database");
        });
    });
}

// Function to return  a course for given id
function getCourseById(id) {
    return new Promise((resolve, reject) => {
        //filter the course for the given Id
        Course.findAll({
            where: { courseId: parseInt(id)} 
        }).then(data => {
            if (data && data.length > 0) {
                // Resolve with the first course object assuming one course for the given Id
                resolve(data[0]); 
            } else {
                // Reject if no course is found for the Id
                reject("No results returned"); 
            }
        }).catch(err => {
            console.error("Failed to sync and get course for a given id:", err);
            reject("Failed to sync with database");
        });
    });
}


// Function to add new student
function addStudent(studentData) {
    return new Promise((resolve, reject) => {

        if(studentData){
        //Check TA property and set to false if undefined
        if (studentData.TA === undefined) {
            studentData.TA = false;
          } else {
            studentData.TA = true;
          }
          
        //convert course to int so the selected dropdown value (courseId) is saved as numeric in student table
        studentData.course= parseInt(studentData.course);

        // check for empty string values and replace with null value
        for (let property in studentData) {
            if (studentData.hasOwnProperty(property) && studentData[property] === "") {
                studentData[property] = null;
            }
        }

        // call Student.create() to add  new student
        Student.create(studentData).then(() => {
            // Resolve the promise after successful student record creation
            resolve(); 
        }).catch(err => {
            console.error("Failed to sync and create new student:", err);
            reject("Unable to create student");
        });
    }else{
        reject("please provide valid input");
    }
    });
}

// Function to modify existing student details
function updateStudent(studentData) {
    return new Promise((resolve, reject) => {
        
        // set "TA" based suppplied checkbox value
        studentData.TA = studentData.TA === 'on' ? true : false;

        //convert course to int so the selected dropdown value (courseId) is saved as numeric in student table
        studentData.course= parseInt(studentData.course);

        // check for empty string values and replace with null value
        for (let property in studentData) {
            if (studentData.hasOwnProperty(property) && studentData[property] === "") {
                studentData[property] = null;
            }
        }

        // below excludes the student number from update operation as number does not change for student
        const studentNum = studentData.studentNum;
        delete studentData.studentNum;

        // call Student.update() to modify student data based on the input
        Student.update(studentData, { where: { studentNum: parseInt(studentNum) } }).then(() => {
            // Resolve the promise after successful record update
            resolve(); 
        }).catch(err => {
            console.error("Failed to sync and update student:", err);
            reject("Unable to update student");
        });
    });
}

// Function to add a new course
function addCourse(courseData) {
    return new Promise((resolve, reject) => {
        // check for empty string values and replace with null value
        for (let property in courseData) {
            if (courseData.hasOwnProperty(property) && courseData[property] === "") {
                courseData[property] = null;
            }
        }

        // call Course.create() to add new course
        Course.create(courseData).then(() => {
            // Resolve the promise after successful course record creation
            resolve(); 
        }).catch(err => {
            console.error("Failed to sync and create new course:", err);
            reject("Unable to create course");
        });
    });
}

// Function to modify existing course based on the given input
function updateCourse(courseData) {
    return new Promise((resolve, reject) => {
        // check for empty string values and replace with null value
        for (let property in courseData) {
            if (courseData.hasOwnProperty(property) && courseData[property] === "") {
                courseData[property] = null;
            }
        }

        // below excludes the course Id from update operation as id does not change for course
        const courseId = courseData.courseId;
        delete courseData.courseId;

        // call Course.update() to update course based on given input
        Course.update(courseData, { where: { courseId: courseId } }).then(() => {
            // Resolve the promise after successful course update
            resolve(); 
        }).catch(err => {
            console.error("Failed to sync and update course:", err);
            reject("Unable to update course");
        });
    });
}

// Function to delete course  based on the given course id
function deleteCourseById(id) {
    return new Promise((resolve, reject) => {
        // delete the course record using the given course Id
        Course.destroy({
            where: { courseId: parseInt(id) } 
        }).then(deleted => {
            if (deleted) {
                // Resolve the promise after successful course record deletion
                resolve(); 
            } else {
                // Reject if no course was deleted
                reject("Course not found or already deleted"); 
            }
        }).catch(err => {
            console.error("Failed to sync and delete course:", err);
            reject("Unable to delete course"); // Reject on any error
        });
    });
}

// Function to delete a student based on the given student number
function deleteStudentByNum(studentNum) {
    return new Promise((resolve, reject) => {
        // Delete the student record using the given student number
        Student.destroy({
            where: { studentNum: parseInt(studentNum) } 
        }).then(deleted => {
            if (deleted) {
                // Resolve the promise after successful student record deletion
                resolve(); 
            } else {
                // Reject if no student was deleted (e.g., student not found)
                reject("Student not found or already deleted"); 
            }
        }).catch(err => {
            console.error("Failed to sync and delete student:", err);
            reject("Unable to delete student"); // Reject on any error
        });
    });
}

// Exporting all functions so they can be imported and used elsewhere.
module.exports = {
    Student,
    Course,
    initialize,
    getAllStudents,
    getStudentsByCourse,
    getStudentByNum,
    getCourses,
    addStudent,
    getCourseById,
    updateStudent,
    addCourse,
    updateCourse,
    deleteCourseById,
    deleteStudentByNum
};