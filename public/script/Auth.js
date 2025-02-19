document.getElementById('signinform').addEventListener('submit', signinUser);
async function signinUser(event) {
    event.preventDefault(); 
    const form = event.target;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const load = form.querySelector('.loading');
    load.style.display = 'block';


    try {
        const response = await fetch('/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }) 
        });

        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/home'; 
        } else {
            document.getElementById('message').innerHTML=data.message;
        }
    } catch (error) {
        console.error('Error during signin:', error);
    }
}
// ------------------------------------------------------------------------------------------------------------------------------
function show_reset_form(){
    document.getElementById('signinform').style.display='none';
    document.getElementById('reset-otp-generate-form').style.display='block';
}

document.getElementById('reset-otp-generate-form').addEventListener('submit', sendOTP);
async function sendOTP(event) {
    console.log('in send otp form');
    event.preventDefault(); 
    const form = event.target;
    const email = form.querySelector('#email').value;
    const errorMessages = form.querySelector('.errorMessages');
    const wait = form.querySelector('.wait');
    const load = form.querySelector('.loading');
    localStorage.setItem('userEmail', email);
    const result = await generateOTP(email, 'this is your OTP to reset Password', errorMessages, wait, load);
    if(result){
    hideAll()
    document.getElementById('otpForm').style.display = 'block'
    }
}

// ------------------------------------------------------------------------------------------------------------------------------
document.getElementById('otpForm').addEventListener('submit', verifyOTP);
async function verifyOTP(event) {
        event.preventDefault();
        const form=event.target;
        const otpval = form.querySelector('#otp').value;
        const otpmessage = form.querySelector('#otpmessage');
        const response = await fetch('/auth/verifyOTP', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ otpval })
        });

        const data = await response.json();
        if (response.status === 400) {
          otpmessage.textContent = data.message;
        } else if (response.status === 200) {
            document.getElementById('otpForm').style.display='none';
            document.getElementById('reset-password-form').style.display='block';
        }
}

// ------------------------------------------------------------------------------------------------------------------------------
document.getElementById('reset-password-form').addEventListener('submit', handle_check);
function handle_check(event) {
    event.preventDefault();  // Prevent form submission

    const form = event.target;
    const password = form.querySelector('#password').value;
    const errorMessages = document.getElementById("errorMessages-2");

    // Validate password and return true if valid
    if (checkPassword(password, errorMessages)) {
        errorMessages.innerHTML = "";  // Clear previous error messages
        reset_password(password);     // Call reset password
    }
}
// ------------------------------------------------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------------------------------------------------
async function reset_password(password){
    const email = localStorage.getItem('userEmail');
    try {
        const response = await fetch('/auth/reset_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }) 
        });

        const data = await response.json();
        
        if (response.status === 200) {
            document.getElementById('reset-password-form').style.display='none';
            document.getElementById('success').style.display='block';
          } else if (response.status === 500) {
            document.getElementById('errorMessages-2').innerHTML=data.message;
          }
    } catch (error) {
        console.error('Error during signin:', error);
    }
}
// ------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------
function togglePassword(event) {
  const toggleButton = event.target;
    
  // Get the password input element from the form containing the button
  const passwordInput = toggleButton.previousElementSibling

  if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleButton.textContent = "Hide";
  } else {
      passwordInput.type = "password";
      toggleButton.textContent = "Show";
  }
}
// ------------------------------------------------------------------------------------------------------------------------------
function checkPassword(password, errorMessages) {
  errorMessages.innerHTML = "";  // Clear previous error messages
  const message = document.createElement("p");
  message.textContent = 'Password must contain:';
  errorMessages.appendChild(message);

  const criteria = [
      { regex: /.{8,}/, message: "> At least 8 characters." },
      { regex: /[A-Z]/, message: "> At least one uppercase letter." },
      { regex: /[!@#$%^&*()_\-+=~`[\]{}|:;"'<>,.?/]/, message: "> At least one special character." },
      { regex: /^\S+$/, message: "> No spaces allowed." }
  ];

  let isValid = true;
  criteria.forEach(criterion => {
      if (!criterion.regex.test(password)) {
          const message = document.createElement("p");
          message.textContent = criterion.message;
          errorMessages.appendChild(message);
          isValid = false;
      }
  });

  return isValid;  // Return true if valid, false otherwise
}
// ------------------------------------------------------------------------------------------------------------------------------
async function generateOTP(email,text,errorMessages,wait,load) {    
  wait.style.display = 'block';
  load.style.display = 'block';
  console.log('in generate otp');
  const json_data={
    email:email,
    text:text,
  }
    const response = await fetch('/auth/generateOTP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(json_data)
    });

    const data = await response.json();

    if (response.status === 400) {
      const message = document.createElement("p");
      message.textContent = data.message;
      errorMessages.appendChild(message);
      wait.style.display = 'none';
      load.style.display='none';
      return false;
    } else if (response.status === 200) {
      wait.style.display = 'none';
      load.style.display='none';
      console.log("sent");
      return true;
    }
}
// ------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------
document.getElementById('signupForm').addEventListener('submit', userExists);
async function userExists(event){
    event.preventDefault(); 
    const form = event.target;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPass', password);
    const errorMessages = form.querySelector('.errorMessages');
    const wait = form.querySelector('.wait');
    const load = form.querySelector('.loading');
    errorMessages.innerHTML = "";
    const response = await fetch('/auth/userExists', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
          });
     const data = await response.json();

     if (response.status === 400) {
            const message = document.createElement("p");
            message.textContent = data.message;
            errorMessages.appendChild(message);
      } 
      else if (response.status === 200) {
        if (checkPassword(password, errorMessages)) {
          errorMessages.innerHTML = "";
          const result = await generateOTP(email, 'this is your One Time Password to Register into Money Mind', errorMessages, wait, load);
          if(result){
            document.getElementById('signupForm').style.display='none';
            document.getElementById('otpForm-2').style.display = 'block'
            }
      }
      }
}
// ------------------------------------------------------------------------------------------------------------------------------
document.getElementById('otpForm-2').addEventListener('submit', verifyOTP_2);
async function verifyOTP_2(event) {
        event.preventDefault();
        const form = event.target;
        const otpmessage = form.querySelector('#otpmessage');
        const otpval = form.querySelector('#otp').value;
        const response = await fetch('/auth/verifyOTP', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ otpval })
        });

        const data = await response.json();

        if (response.status === 400) {
          otpmessage.textContent = data.message;
        } else if (response.status === 200) {
            document.getElementById('otpForm-2').style.display='none';
            signUpUser(otpmessage);
        }
}
// ------------------------------------------------------------------------------------------------------------------------------
async function signUpUser(otpmessage){
  const email = localStorage.getItem('userEmail');
  const password = localStorage.getItem('userPass');
  const response= await fetch('/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (response.status === 400) {
     otpmessage.textContent = data.message;
  } else if (response.status === 200) {
    window.location.href = '/home';
  } else {
    otpmessage.textContent  = 'An error occurred. Please try again.';
  }
}