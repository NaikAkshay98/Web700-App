// Import sample data from JSON files to make them accessible throughout the module.
const courses = require("../data/courses.json");
const students = require("../data/students.json");
//Define Display messages 
const noResultReturnMessage = "No results returned";

// Data class to manage students and courses datasets.
class Data {
    // Constructor accepts students and courses data as parameters and assigns them to properties.
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

// Declare a variable to hold the Data class instance and make it accessible throughout the module.
let dataCollection = null;

// Function that initializes the data by instantiating the Data class with the given students and courses data datasets.
// Returns a promise that resolves after successful instantiation or rejects if data is missing.
function initialize() {
    return new Promise((resolve, reject) => {
        if (!students || !courses || students.length === 0 || courses.length === 0) {
            reject("Data is missing");
        } else {
            dataCollection = new Data(students, courses);
            resolve();
        }
    });
}

// Function that retrieves all student data.
function getAllStudents() {
    return new Promise((resolve, reject) => {
        if (dataCollection.students.length === 0) {
            reject(noResultReturnMessage);
        } else {
            resolve(dataCollection.students);
        }
    });
}

// Function that retrieves data of students who are TAs (students with TA property set to true).
function getTAs() {
    return new Promise((resolve, reject) => {
        const TAs = dataCollection.students.filter(student => student.TA === true);

        if (TAs.length === 0) {
            reject(noResultReturnMessage);
        } else {
            resolve(TAs);
        }
    });
}

// Function that retrieves all course data.
function getCourses() {
    return new Promise((resolve, reject) => {
        if (dataCollection.courses.length === 0) {
            reject(noResultReturnMessage);
        } else {
            resolve(dataCollection.courses);
        }
    });
}

//function to select data of students for a given course Id
function getStudentsByCourse(course) {
    return new Promise((resolve, reject) => {
        // Check for valid student object and then filter students by given course Id
        if(!dataCollection?.students?.length){
            reject(noResultReturnMessage);
        }else{
            const matchedStudents = dataCollection.students.filter(student => student.course === parseInt(course));
            if(matchedStudents.length === 0){
                reject(noResultReturnMessage);
            } else{
                resolve(matchedStudents);
            }              
        }
              
    });
}

function getStudentByNum(num){
    return new Promise((resolve,reject) => {
        // Check for valid student object and then find student by given studentNum
        if(!dataCollection?.students?.length){
            reject(noResultReturnMessage);
        } else{
            const matchedStudent = dataCollection.students.find(student => student.studentNum === parseInt(num));
            if(!matchedStudent){
                reject(noResultReturnMessage);
            }else{
                resolve(matchedStudent);
            }
        } 
    });
}

function addStudent(studentData){
    return new Promise((resolve,reject) => {
        if(studentData){
        //Check TA property and set to false if undefined
        if (studentData.TA === undefined) {
            studentData.TA = false;
          } else {
            studentData.TA = true;
          }
          //Set the student number as current student count plus 1
          studentData.studentNum = dataCollection.students.length + 1;
          dataCollection.students.push(studentData);
          resolve(studentData);
        }else{
            reject("please provide valid input");
        }
    })
}



  

// Exporting all functions so they can be imported and used elsewhere.
module.exports = {
    initialize,
    getAllStudents,
    getTAs,
    getStudentsByCourse,
    getStudentByNum,
    getCourses,
    addStudent
};