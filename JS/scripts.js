// Kandidatnr: 131
// Task 3
// get data, process data, get input value, filter data and call the results function and clear input field
function searchByTitle(event) {
  event.preventDefault(); // Prevent the form from submitting by default
  const apiUrl = 'https://api.npoint.io/c5da54637bcc788d4cad';
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      let courses = data.courses;
      let searchInputElement = document.getElementById('course-search');
      let searchInput = searchInputElement.value.toLowerCase();
      let filteredCourses = courses.filter(course => course.title.toLowerCase().includes(searchInput));
      updateResults(filteredCourses);
      searchInputElement.value = '';
    })
    .catch(error => {
      const message = document.getElementById('resultMessage');
      message.textContent = 'Error fetching data';
      console.log('Error fetching data:', error)
    });
}


// Function to fetch course data, process it and call the applyFilters function
function fetchCourseData() {
  const url = 'https://api.npoint.io/c5da54637bcc788d4cad';
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const courses = data.courses;
      console.log(courses);
      applyFilters(courses)
    })
    .catch(error => { 
      const message = document.getElementById('resultMessage');
      message.textContent = 'Error fetching data';
      console.log('Error fetching data:', error)
    });
}


// Function to apply filters to the courses and call the updateResults function
// The logic behind filtering data could be done in many ways and in more refined way to suits many combinations
// I chose to filter data on the basis of student type (either/or), field of study, education level and study program together.
function applyFilters(courses) {
  // student
  let studentChecked = document.getElementById('checkbox1').checked;
  let universityStudent = studentChecked ? "universitystudent" : null;
  
  let externalParticipantChecked = document.getElementById('checkbox2').checked;
  let externalParticipant = externalParticipantChecked ? "externalstudent" : null;
  
  // field of study
  let studyFieldOption = document.querySelector('select[name="studyField"]').value;
  let studyField = studyFieldOption !== 'all' ? studyFieldOption.replace(/-/g, " ") : null;
  
  // education level bachelor or master or professional
  let educationLevelOption = document.querySelector('select[name="education-level"]').value;
  let educationLevel = educationLevelOption !== 'all' ? educationLevelOption : null;

  // study program
  let studyProgramOption = document.querySelector('select[name="type"]').value;
  let studyProgram = studyProgramOption !== 'all' ? studyProgramOption.replace(/-/g, " ") : null;

  //console.log(universityStudent, externalParticipant, studyField, educationLevel, studyProgram);
  
  // looping throe the courses to filter and using set() to avoid duplicates
  let filteredCourses = new Set();
  for (let i = 0; i < courses.length; i++) {
    let course = courses[i];
    // 1. student and 2. field of study and 3. education level: bachelor and  4. study program
    if ((course.studentBackgrounds[0].type.toLowerCase() === universityStudent &&
      course.studentBackgrounds[0].fieldsOfStudy.map(item => item.toLowerCase()).includes(studyField)) &&
      (course.studentBackgrounds[0].educationLevel.toLowerCase() === educationLevel &&
      (course.eligiblePrograms.UniversityOfBergen.map(item => item.toLowerCase()).includes(studyProgram) ||
        course.eligiblePrograms.WesternNorwayUniversityOfAppliedSciences.map(item => item.toLowerCase()).includes(studyProgram)))) {
      filteredCourses.add(courses[i]);
    }

    // 2. student and 2. field of study and 3. education level: master and  4. study program
    if ((course.studentBackgrounds[0].type.toLowerCase() === universityStudent &&
      course.studentBackgrounds[0].fieldsOfStudy.map(item => item.toLowerCase()).includes(studyField)) &&
      (course.studentBackgrounds[0].educationLevel.toLowerCase() === educationLevel &&
      (course.eligiblePrograms.UniversityOfBergen.map(item => item.toLowerCase()).includes(studyProgram) ||
      course.eligiblePrograms.WesternNorwayUniversityOfAppliedSciences.map(item => item.toLowerCase()).includes(studyProgram)))) {
      filteredCourses.add(courses[i]);
    }

    // 3. external participant and 2. field of study and 3. education level: professional and  4. study program
    if ((course.studentBackgrounds[1].type.toLowerCase() === externalParticipant &&
      course.studentBackgrounds[1].fieldsOfStudy.map(item => item.toLowerCase()).includes(studyField)) &&
      (course.studentBackgrounds[1].educationLevel.toLowerCase() === educationLevel)) {
      filteredCourses.add(courses[i]);
    }
  }
  // converting set to array
  let arrayFilteredCourses = Array.from(filteredCourses);
  updateResults(arrayFilteredCourses); 
}


//Function to display the results of search or filter on the page
function updateResults(courses) {
  // Clear existing results and apppending h2 element
    if (courses.length === 0) {
      let message = document.getElementById("resultMessage");
      message.textContent = 'Select all filters with (related eduaction Field / Level / Program) to see the results.';
      return; // Exit the function, no need to execute the rest of the code
    }
  
    let resultsSection = document.querySelector('.results');
    resultsSection.innerHTML = ''; // Clear current results
    let h2 = document.createElement('h2');
    h2.textContent = 'Results:';
    resultsSection.appendChild(h2);
  
    courses.forEach((course, index) => {
    // highchart data
    let totalEnrollment = Number(course.enrollment.totalEnrolled);
    let externalStudents = Number(course.enrollment.externalStudents);
    let universityStudents = Number(course.enrollment.universityStudents);
    let totalSuccessfulCompletion = Number(course.enrollment.successfulCompletion.externalStudents) + Number(course.enrollment.successfulCompletion.universityStudents);
    let universityStudentsSuccessfulCompletion = Number(course.enrollment.successfulCompletion.universityStudents);
    let externalStudentsSuccessfulCompletion = Number(course.enrollment.successfulCompletion.externalStudents);
    let averageGradeUni = course.gradesHistory.averageExternalStudents;
    let averageGradeExter = course.gradesHistory.averageInternalStudents;
      
    // creating the article element for each course and details
    const article = document.createElement('article');
    const div = document.createElement('div');
    let h2 = document.createElement('h2');
    h2.textContent = course.title;
    div.appendChild(h2);
    article.appendChild(div);
    resultsSection.appendChild(article); // Append the article to the results section

    let div2 = document.createElement('div');
    div2.classList.add('course-info');
    let htmlInfo = `
    <h4>Course ID:</h4>
    <p>${course.courseId}</p>
    <h4>Available For Credit:</h4>
    <p>${course.availableForCredit}</p>
    <h4>Course CreditECTS:</h4>
    <p>${course.creditECTS}</p>
    <h4>Course Description:</h4>
    <p>${course.description}</p>
    <h3>Course Eligible Programs:</h3>
    <h4 class="uni">University of Bergen</h4>
    <p>${course.eligiblePrograms.UniversityOfBergen[0]}</p>
    <p>${course.eligiblePrograms.UniversityOfBergen[1]}</p>
    <h4 class="uni">Western Norway University of Applied Sciences</h4>
    <p>${course.eligiblePrograms.WesternNorwayUniversityOfAppliedSciences[0]}</p>
    <p>${course.eligiblePrograms.WesternNorwayUniversityOfAppliedSciences[1]}</p>
    `
    div2.innerHTML = htmlInfo;
    article.appendChild(div2);

    //creating chart container: <div id="container" style="width:100%; height:400px;"></div>
    let div3 = document.createElement('div');
    let chartID = "container" + index;
    div3.id = chartID;
    div3.style.width = '100%';
    div3.style.height = '400px';
    article.appendChild(div3);

    // calling drawChart function to draw the chart for each course
    drawChart(chartID, totalEnrollment, externalStudents, universityStudents, totalSuccessfulCompletion, universityStudentsSuccessfulCompletion, externalStudentsSuccessfulCompletion, averageGradeUni, averageGradeExter);

    
    //Reviw selection 3 options for each course
    let div4 = document.createElement('div');
    div4.classList.add('review');
    let reviewHtml = `
    <h2>Reviews by</h2>
    <select name="reviewBy">
      <option value="">Select:</option>
      <option value="all">All students</option>
      <option value="universityStudent">University Students</option>
      <option value="externalStudent">External Students</option>
    </select>
    `;
    div4.innerHTML = reviewHtml;
    article.appendChild(div4);
    
    // Review by all students, university students and external students
    let selectElement = div4.querySelector('select[name="reviewBy"]'); //option class
    selectElement.addEventListener('change', function () {
      article.querySelectorAll('.review-container').forEach(review => review.remove());

      // to get the values of overall, difficulty and usefulness
      let averageScoreOverall = course.reviews.averageScores.overall;
      let averageScoreDifficulty = course.reviews.averageScores.difficulty;
      let averageScoreUsefulness = course.reviews.averageScores.usefulness;

      let individualReviews = course.reviews.individualReviews;
        // clear existing review containers
      if (this.value === 'all') {
        reviewByAllStudents(article, averageScoreOverall, averageScoreDifficulty, averageScoreUsefulness);
        return;
      }
      course.reviews.individualReviews.forEach(review => {
        if (this.value === review.studentType) {
          //reviewByUniOrExterStudents(article, reuniScore, uniDifficulty, uniUsefulness, uniText);
          reviewByUniOrExterStudents(article, review.score, review.difficulty, review.usefulness, review.text);
        } else if (this.value === review.studentType) {
          reviewByUniOrExterStudents(article, review.score, review.difficulty, review.usefulness, review.text);
        }
        });
  });

    });
}

// Function to display the review by all students
function reviewByAllStudents(article, overall, difficulty, usefulness) {
  let div5 = document.createElement('div');
    div5.classList.add('course-review-container', 'review-container');
    let reviewContainerHtml = `
    <div class="slider-container">
      <label for="overall">Course Score:</label>
      <input type="range" id="overall" name="courseScore" min="1" max="10" value=${overall} disabled>
      <span id="overallValue">${overall}</span>

      <label for="difficulty">Difficulty:</label>
      <input type="range" id="difficulty" name="difficulty" min="1" max="10" value=${difficulty} disabled>
      <span id="difficultyValue">${difficulty}</span>

      <label for="usefulness">Usefulness:</label>
      <input type="range" id="usefulness" name="usefulness" min="1" max="10" value=${usefulness} disabled>
      <span id="usefulnessValue">${usefulness}</span>
    </div>
    `
  div5.innerHTML = reviewContainerHtml;
  article.appendChild(div5);
}

// Function to display the review by university students or external students
function reviewByUniOrExterStudents(article, score, difficulty, usefulness, text) {
  let div6 = document.createElement('div');
    div6.classList.add('feedback', 'review-container');
    let feedbackHtml = `
    <div class="ratings">
      <p>Course Score: ${score}/10</p>
      <p>Difficulty: ${difficulty}/10</p>
      <p>Usefulness: ${usefulness}/10</p>
    </div>
    <blockquote>"${text}"</blockquote>
    `
  div6.innerHTML = feedbackHtml;
  article.appendChild(div6);
}


// chart function Attention: 
// in the json data some  courses have the same data for enrollment and successful completion 
// which shows the similar data in the chart for different courses
function drawChart(chartID, totalEnrollment, externalStudents, universityStudents, totalSuccessfulCompletion, universityStudentsSuccessfulCompletion, externalStudentsSuccessfulCompletion, averageGradeUni, averageGradeExter) { 
  Highcharts.chart(chartID, {
    chart: {
        type: 'column',
        backgroundColor: '#f7f7f7', // Light grey background
        borderRadius: 5,
        style: {
            fontFamily: 'Arial, sans-serif' // Font styling
        }
    },
    title: {
      text: 'Course Enrollment and Completion Overview',
        align: 'center',
        style: {
            color: '#333333', // Dark grey text for the title
            fontSize: '18px'
        }
    },
    subtitle: {
      useHTML: true,
      text: `<div style="text-align:center;">
              <span style="font-size:14px;color:#333333;">University Students Average Grades: ${averageGradeUni}</span><br/>
              <span style="font-size:14px;color:#333333;">External Students Average Grades: ${averageGradeExter}</span>
            </div>`,
      align: 'center'
  },
    xAxis: {
        categories: ['Course Data'],
        lineColor: '#999999',
        tickColor: '#999999',
        labels: {
            style: {
                color: '#333333' // Dark grey text for the labels
            }
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Number of Students',
            style: {
                color: '#333333' // Dark grey text for the title
            }
        },
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: '#333333' // Dark grey text for the stack labels
            }
        },
        gridLineColor: '#e6e6e6' // Light grey lines for the grid
    },
    legend: {
        borderColor: '#CCCCCC', // Light grey border for the legend
        borderWidth: 1,
        shadow: false
    },
    tooltip: {
        backgroundColor: 'white',
        borderColor: '#CCCCCC',
        borderRadius: 5,
        style: {
            color: '#333333'
        }
    },
    plotOptions: {
        column: {
            dataLabels: {
                enabled: true,
                style: {
                    textOutline: 'none', // Removes halo around the text
                    fontWeight: 'normal',
                    color: '#333333' // Dark grey text for data labels
                }
            }
        }
    },
    //     drawChart(chartID, totalEnrollment, externalStudents, universityStudents, totalSuccessfulCompletion, universityStudentsSuccessfulCompletion, externalStudentsSuccessfulCompletion);
    series: [{
        name: 'Total Enrollment',
        data: [totalEnrollment], // replace with data.totalEnrollment
        color: '#2f7ed8' // Blue for total enrollment
    }, {
        name: 'External Students',
        data: [externalStudents],
        color: '#0d233a' // Dark blue for external students
    }, {
        name: 'University Students',
        data: [universityStudents],
        color: '#8bbc21' // Green for university students
    }, {
        name: 'Total Successful Completion',
        data: [totalSuccessfulCompletion],
        color: '#910000' // Dark red for total completion
    }, {
        name: 'University Students Successful Completion',
        data: [universityStudentsSuccessfulCompletion],
        color: '#1aadce' // Light blue for university completion
    }, {
        name: 'External Students Successful Completion',
        data: [externalStudentsSuccessfulCompletion],
        color: '#492970' // Purple for external completion
    }]
});

}



//Function to reset filters and fetch all data again
function clearFilters() {
  document.getElementById('search-filter-form').reset();
}

// End of task 3