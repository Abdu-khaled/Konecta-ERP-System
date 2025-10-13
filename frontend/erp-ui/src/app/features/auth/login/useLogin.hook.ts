export function useLogin() {
  const validateInputs = (email: string, password: string) => {
    let emailError = '';
    let passwordError = '';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      emailError = 'Email is required';
    } else if (!emailPattern.test(email)) {
      emailError = 'Please enter a valid email address';
    }

    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/;
    if (!password.trim()) {
      passwordError = 'Password is required';
    } else if (!passwordPattern.test(password)) {
      passwordError =
        'Password must be 6–12 characters long and include at least one letter, one number, and one special character (@, #, $, etc.)';
    }

    return { emailError, passwordError };
  };

  const handleLogin = (email: string, password: string, remember: boolean) => {
    console.log('✅ Login successful:', { email, password, remember });
  };

  const signInWithGoogle = () => {
    console.log('Google login clicked');
  };

  return { handleLogin, signInWithGoogle, validateInputs };
}
