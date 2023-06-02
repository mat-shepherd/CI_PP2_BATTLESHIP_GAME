// FEEDBACK FORM FUNCTIONALITY

/* 
 * Wait for the DOM to finish loading, and add form submit event listener
 * Code adapated from EmailJS tutoiral at
 * https://www.emailjs.com/docs/tutorial/creating-contact-form/
 */
document.addEventListener('DOMContentLoaded', function () {
    const feedbackSubmit = document.getElementsByClassName("submit-feedback-button");

    document.getElementById('feedback-form').addEventListener('submit', function (event) {
        event.preventDefault();
        emailjs.init("KosZVXKDwJTEq1mcE");
        feedbackSubmit.value = 'Sending...';

        emailjs.sendForm('ci_battleship_feedback', 'battleship_feedback', this)
            .then(function () {
                feedbackSubmit.value = 'Send Email';
                showThankYou();
            }, function (error) {
                console.log(JSON.stringify(err));
            });
    });
});

/**
 * Shows a thank you message in the form area once the form
 * has been sent
 * @function showThankYou
 */
function showThankYou() {
    let messageArea = document.getElementById('intro-modal-contents');
    let thankyouMessage = `
    <h2>YOUR MESSAGE HAS BEEN SENT</h2>
    <br>
    <p>THANKS FOR YOUR FEEDBACK. I REALLY APPRECIATE IT!</p>
    <br>
    <button type="button" id="new-game-button" aria-label="New game">NEW GAME</button>`;

    messageArea.style.backgroundColor = '#fff';
    messageArea.style.padding = '2rem';
    messageArea.innerHTML = thankyouMessage;
    // Add click listener to new game button
    document.getElementById('new-game-button').addEventListener('click', loadIndex);
}
