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
                feedbackSubmit.value = 'Send Email';
                console.log(JSON.stringify(err));
            });
    });
});

function showThankYou() {
    let messageArea = document.getElementById('feedback-form');
    let thankMessage = `
    <h3>YOUR MESSAGE HAS BEEN SENT</h3>
    <br>
    <p>THANKS FOR YOUR FEEDBACK. I REALLY APPRECIATE IT!</p>`;
    messageArea.innerHTML = thankMessage;
}
