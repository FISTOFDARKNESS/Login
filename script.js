// Initialize EmailJS with your public key (API key)
emailjs.init('rbzxQsqsqS1lbs8Y1');  // Replace 'YOUR_PUBLIC_KEY' with the actual public key

const subjectInput = document.getElementById('subject');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('sendBtn');
const statusDiv = document.getElementById('status');

// Enable send button when both subject and message fields are filled
function enableSendButton() {
  if (subjectInput.value && messageInput.value) {
    sendBtn.disabled = false;
  } else {
    sendBtn.disabled = true;
  }
}

// Add event listeners to enable the send button
subjectInput.addEventListener('input', enableSendButton);
messageInput.addEventListener('input', enableSendButton);

// Handle form submission
document.getElementById('emailForm').addEventListener('submit', function(event) {
  event.preventDefault();  // Prevent form from refreshing the page

  const subject = subjectInput.value;
  const message = messageInput.value;

  // Email data to send via EmailJS
  const emailData = {
    subject: subject,
    message: message,
    to_email: 'kaioadrik08@gmail.com'  // Replace with your Gmail address
  };

  // Reset the status message before starting the request
  statusDiv.classList.remove('success', 'error');
  statusDiv.textContent = '';  // Clear the message

  // Show a loading message or waiting state
  statusDiv.textContent = 'Sending...';
  statusDiv.classList.remove('hidden');  // Ensure the status message is visible

  // Send the email using EmailJS with the public key
  emailjs.send('service_774xxto', 'template_i2dsm05', emailData)  // Replace with your Service ID and Template ID
    .then(function(response) {
      console.log('Success:', response);
      // Success - Show green message
      statusDiv.textContent = 'Message sent successfully!';
      statusDiv.classList.remove('hidden');
      statusDiv.classList.add('success');
    }, function(error) {
      console.log('Failed:', error);
      // Failed - Show red message and remove success state
      statusDiv.textContent = 'Failed to send message!';
      statusDiv.classList.remove('hidden');
      statusDiv.classList.add('error');
    });
});
