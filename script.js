// Simulação de dados de usuários registrados
var registeredUsers = [];

// Função para exibir o formulário de login
function showLoginForm() {
    document.getElementById('registration-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

// Função para realizar o registro
function register() {
    var username = document.getElementById('username-input').value;
    var password = document.getElementById('password-input').value;

    // Verificar se o usuário já está registrado
    var userExists = registeredUsers.some(function(user) {
        return user.username === username;
    });

    if (userExists) {
        // Usuário já registrado
        alert('O nome de usuário já está em uso. Por favor, escolha outro nome.');
    } else {
        // Registrar o novo usuário
        var newUser = {
            username: username,
            password: password
        };

        registeredUsers.push(newUser);
        alert('Registro realizado com sucesso!');
        showLoginForm();
    }
}

// Função para realizar o login
function login() {
    var username = document.getElementById('login-username-input').value;
    var password = document.getElementById('login-password-input').value;

    // Verificar se as credenciais de login estão corretas
    var user = registeredUsers.find(function(user) {
        return user.username === username && user.password === password;
    });

    if (user) {
        // Login bem-sucedido
        alert('Login realizado com sucesso! Redirecionando para o chat...');
        // Aqui você pode redirecionar o usuário para outro site (chat), por exemplo:
        window.location.href = 'https://www.example.com/chat';
    } else {
        // Login inválido
        alert('Usuário ou senha inválidos!');
    }
}

// Evento de clique no botão de registro
document.getElementById('register-button').addEventListener('click', register);

// Evento de clique no botão de login
document.getElementById('login-button').addEventListener('click', login);
