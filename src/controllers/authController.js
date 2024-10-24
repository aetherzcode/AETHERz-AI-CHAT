const users = [];

exports.renderLoginPage = (req, res) => {
  res.render('login');
};

exports.renderRegisterPage = (req, res) => {
  res.render('register');
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user;
    res.redirect('/chat');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
};

exports.register = (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    res.render('register', { error: 'Username already exists' });
  } else {
    users.push({ username, password });
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};
