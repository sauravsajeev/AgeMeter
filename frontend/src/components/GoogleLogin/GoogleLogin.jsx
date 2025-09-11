"use client"

import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GoogleLogin.css";

function GoogleLogin({ setUser, saveUserToDB }) {
  const navigate = useNavigate();

  const [showAbout, setShowAbout] = useState(false)
  useEffect(() => {
    // Parse query params from URL if redirected back from backend
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    const name = params.get("name");
    const google_id = params.get("google_id");
    const dob = null;
    if (email && name && google_id) {
      const user = { google_id ,email,name , dob };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      
      // Set user state
      setUser(user);
      saveUserToDB(user)
      // Navigate to home page
      navigate("/");
    }
  }, [navigate, setUser,saveUserToDB]);

  const handleLogin = () => {
    window.location.href = (import.meta.env.VITE_LOGIN_REDIRECT_URL);
  };
 const toggleAbout = () => {
    setShowAbout(!showAbout)
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
       <img
        src="/images/age.png"   // put your GIF in public/images/
        alt="Handwritten Logo Animation"
        className="logoimg"
      />
      <button
        onClick={handleLogin}
        className="signinbutton"
      >
        Sign in with <b className="text-red-600">G<b className="text-blue-600">oo</b>gle</b>
      </button>
     <button
         onClick={toggleAbout}
        onMouseEnter={() => setShowAbout(true)}
      //onMouseLeave={() => setShowAbout(false)}
        className="about text-sm transition-colors duration-200"
      >
        About Us
      </button>

       <div className="relative w-full flex justify-center">
        <div
          className={`mt-4 transition-all duration-300 ease-in-out ${
            showAbout ? "transform translate-y-0 opacity-100 max-h-96" : "transform translate-y-8 opacity-0 max-h-0"
          } overflow-hidden`}
        >
          <div className="p-4 rounded-lg max-w-md text-center text-gray-300 text-sm leading-relaxed">
            <h3 className="text-white font-semibold mb-2">About Us</h3>
            <p>
              At Agemeter, we make it simple to track your life’s journey in real time. Our interactive tool visualizes your age as dynamic points and milestones, letting you set goals for the years ahead. Whether it’s personal growth, career achievements, or life aspirations, Agemeter helps you stay motivated, organized, and intentional about your future.<br /><br />Developed by <i style={{color:"red",fontStyle:"normal"}}>Saudu</i>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleLogin;
