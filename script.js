let data = []; // Will hold questions and answers loaded from JSON
let fuse; // Will hold the Fuse.js instance

// Load JSON data
fetch('questions.json')
    .then(response => response.json())
    .then(json => {
        // Convert JSON to array of question-answer objects
        data = Object.entries(json).map(([question, answerObj]) => ({
            question: question,
            answer: answerObj["Answer:"]
        }));

        // Initialize Fuse.js after data is loaded
        fuse = new Fuse(data, {
            keys: ["question"],
            threshold: 0.3 // Adjust sensitivity as needed
        });
    })
    .catch(error => console.error('Error loading questions:', error));

// Autofill suggestion dropdown and arrow navigation
let currentIndex = -1;
const suggestionList = document.getElementById("suggestions");
const inputField = document.getElementById("user-question");

// Trigger findAnswer function when Enter key is pressed
inputField.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();

        if (currentIndex > -1) {
            // If a suggestion is selected, use it
            const selectedSuggestion = suggestionList.children[currentIndex];
            inputField.value = selectedSuggestion.innerText;
            showSuggestions(""); // Clear suggestions
            findAnswer();
        } else {
            // If no suggestion is selected, search for input text
            findAnswer();
        }
    } else if (event.key === "ArrowDown") {
        // Navigate Down in Suggestions
        navigateSuggestions(1);
    } else if (event.key === "ArrowUp") {
        // Navigate Up in Suggestions
        navigateSuggestions(-1);
    }
});

// Function to navigate suggestions
function navigateSuggestions(direction) {
    const suggestions = suggestionList.children;

    if (suggestions.length > 0) {
        // Remove highlighting from the previous selection
        if (currentIndex > -1) {
            suggestions[currentIndex].classList.remove("highlight");
        }

        // Update currentIndex with wrapping behavior
        currentIndex = (currentIndex + direction + suggestions.length) % suggestions.length;

        // Highlight the new selection
        suggestions[currentIndex].classList.add("highlight");

        // Update input value to match the highlighted suggestion
        inputField.value = suggestions[currentIndex].innerText;
    }
}

// Function to find an answer
function findAnswer() {
    const userQuestion = inputField.value.trim();
    const result = fuse.search(userQuestion);

    // Display the best match or a message if no match is found
    if (result.length > 0) {
        document.getElementById("answer-display").innerText = result[0].item.answer;
    } else {
        document.getElementById("answer-display").innerText = "Sorry, no matching question found.";
    }

    // Clear suggestions and reset index
    suggestionList.innerHTML = "";
    currentIndex = -1;
}

// Function to show suggestions dynamically
function showSuggestions(input) {
    // Clear previous suggestions
    suggestionList.innerHTML = "";
    currentIndex = -1;

    // Skip if input is empty or if Fuse.js isn't initialized yet
    if (!input || !fuse) return;

    // Perform fuzzy search
    const results = fuse.search(input);

    // Display up to 3 suggestions
    results.forEach((result, index) => {
        if (index < 3) {
            const suggestion = document.createElement("div");
            suggestion.innerText = result.item.question;

            // Add click event to autofill the input field
            suggestion.onclick = () => {
                inputField.value = result.item.question;
                findAnswer();
                suggestionList.innerHTML = ""; // Clear suggestions
            };

            suggestionList.appendChild(suggestion);
        }
    });
}
const header = document.getElementById('reset-header');
        header.addEventListener('click', function() {
            document.getElementById('user-question').value = ''; // Reset the search input
            document.getElementById('suggestions').innerHTML = ''; // Clear suggestions
            document.getElementById('answer-display').innerText = ''; // Clear the answer display
        });