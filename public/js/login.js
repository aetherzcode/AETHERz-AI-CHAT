document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBox = document.querySelector('.login-box');
    
    // Add fade-in animation
    loginBox.style.opacity = '0';
    loginBox.style.transform = 'translateY(20px)';
    loginBox.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        loginBox.style.opacity = '1';
        loginBox.style.transform = 'translateY(0)';
    }, 200);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });
            
            if (response.ok) {
                loginBox.style.opacity = '0';
                loginBox.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    window.location.href = '/';
                }, 500);
            } else {
                alert('Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
