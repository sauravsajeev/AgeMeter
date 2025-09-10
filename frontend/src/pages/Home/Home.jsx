"use client"

import { useState, useEffect ,useCallback, use} from "react"
import { TypeAnimation } from "react-type-animation" 
import CountUp from "react-countup"
import { motion } from "framer-motion";
import "./Home.css"
import GoogleLogin from "../../components/GoogleLogin/GoogleLogin"
import DropDown from "../../components/DropDown/DropDown"
import Sidebar from "../../components/Sidebar/Sidebar"
import Counter from '../../components/Counter/Counter';
import { Alert } from "../../components/Message/Message"
export default function Home() {
  const [birthDate, setBirthDate] = useState(null)
  const [liveAge, setLiveAge] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [dobInput, setDobInput] = useState("")
  const [AnimationNum,SetAnimationNum] = useState(3)
  const [tempage,settempage] = useState(0)
  const [user, setUser] = useState(null)
  const [done, setDone] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showGoalPopup,setShowGoalPopup] = useState(false);
  const [goals,setGoal] = useState([]);
  const [goalT,setGoalT] = useState({title:"", des:"" ,targetage :""})
  const [showAge,setShowAge] = useState(false)
  const [reminder,setReminder] = useState({day:false,week:false,month:false})
  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState({ type: "info", message: "" })
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000"

  const fetchUserFromDB = useCallback(
    async (googleId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/${googleId}`)
        if (response.ok) {
          const userData = await response.json()
          return userData
        }
        return null
      } catch (error) {
        console.error("Error fetching user:", error)
        return null
      }
    },
    [API_BASE_URL],
  )

  const saveUserToDB = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const savedUser = await response.json()
        return savedUser
      }
      throw new Error("Failed to save user")
    } catch (error) {
      console.error("Error saving user:", error)
      throw error
    }
  }

  const updateUserDOB = async (googleId, dob) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${googleId}/dob`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dob }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        return updatedUser
      }
      throw new Error("Failed to update DOB")
    } catch (error) {
      console.error("Error updating DOB:", error)
      throw error
    }
  }
  
  const updateUserGoal = async (googleId, goal) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${googleId}/goals`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify( goal ),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        return updatedUser
      }
      throw new Error("Failed to update Goal")
    } catch (error) {
      console.error("Error updating Goal:", error)
      throw error
    }
  }
  useEffect(()=> {
     const tempgoals = JSON.parse(localStorage.getItem("goals"));
     if (tempgoals){
      setGoal(tempgoals)
     }
  }, [setGoal])
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const dbUser = await fetchUserFromDB((JSON.parse(storedUser)).google_id)
        console.log("in stored User")
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        if (parsedUser.dob != null){
              console.log("in parsedUser not null")
              const savedDate = new Date(parsedUser.dob)
              setBirthDate(savedDate)
              setDobInput(parsedUser.dob)
              if (dbUser.goals.length > 0 ){
                 setGoal(dbUser.goals)
                 localStorage.setItem("goals",JSON.stringify(dbUser.goals))
              }
        }
        else{
          console.log("in parsedUser null")
          console.log(dbUser)
          if (dbUser !=null){
             console.log("in Database")
             if ((dbUser.goals.length)> 0){
                 setGoal(dbUser.goals)
                 localStorage.setItem("goals",JSON.stringify(dbUser.goals))
             }
           if (dbUser.dob ) {
              console.log("in Database there is dob")
              const {goals , ...rest} = dbUser
              const savedDate = new Date(dbUser.dob)
              setBirthDate(savedDate)
              setDobInput(dbUser.dob)
              localStorage.setItem("user", JSON.stringify(rest));
            } else {
              setShowPopup(true)
            }
      
          }
          else{
            setShowPopup(true)
          }
          }
      }
      else{
         setShowPopup(true)
      }

        // Fetch latest user data from databas
    }

    loadUser()
  }, [fetchUserFromDB])
  useEffect(() => {
    if (!birthDate) return;
    let interval
  
      const now = new Date();
      const age = (now.getTime() - birthDate.getTime()) / (1000*60*60*24*365.25);
      settempage(age); // fixed value for CountUp
      interval = setInterval(() => {
        const now = new Date()
        const ageInMilliseconds = now.getTime() - birthDate.getTime()
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25)
        setLiveAge(ageInYears)
      }, 10)
    
    

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [birthDate])
  useEffect(() => {
    async function subscribeUser(googleId) {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/service-worker.js")
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
        })

        await fetch(`${API_BASE_URL}/api/subscribe/${googleId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription)
        })
      }
    }
    const storedUser = JSON.parse(localStorage.getItem("user"))
    if (storedUser) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        subscribeUser(storedUser.google_id)
      }
      else {
    console.log("Notification permission denied.");
      }
    
    })
  }
  }, [API_BASE_URL])
  const handleInputChange = (e) => {
    const value = e.target.value
    setDobInput(value)
  }
  const handleInputChangeGoalT = (e) => {
    const value = e.target.value;
    setGoalT(prev => ({ ...prev, title: value}));
  }
    const handleInputChangeGoalD = (e) => {
    const value = e.target.value;
    setGoalT(prev => ({ ...prev, des: value}));
  }
  const handleInputChangeGoalA = (e) =>{
    const value = e.target.value;
    setGoalT(prev => ({ ...prev, day: null,targetage: value}));
  }
  const handleInputChangeGoalE = (value) =>{
      setGoalT(prev => ({ ...prev, day: value.value,targetage:null}));
  }
  const AddGoal = () =>{
    setShowGoalPopup(!showGoalPopup)
  }
  const saveGoal= async () =>{
    const dbback = await updateUserGoal(user.google_id,{title:goalT.title,des:goalT.des,day:goalT.day,targetage:goalT.targetage,reminder: reminder })
    setGoal(dbback.goals)
    localStorage.setItem("goals",JSON.stringify(dbback.goals))
    console.log(goals,dbback)
    setShowGoalPopup(!showGoalPopup)
     setShowAlert(true)
      setAlertData({ type: "success", message: "Added your new goal! Start your work" })
  }
  const deleteSavedGoal = (title) => {
   const tempgoals = goals.filter((goal) => goal.title !== title)
   setGoal(tempgoals)
   updateUserGoal(user.google_id,{title:title})
  }
  const saveDateOfBirth = async () => {
    if (dobInput && user) {
      const inputDate = new Date(dobInput)
      const now = new Date()
      const age = (now.getTime() - birthDate.getTime()) / (1000*60*60*24*365.25);
      if (!isNaN(inputDate.getTime()) && inputDate <= now && age < 100) {
        try {
          const {goals, ...rest} = await updateUserDOB(user.google_id, dobInput)
          setBirthDate(inputDate)
          setUser(rest)
          localStorage.setItem("user", JSON.stringify(rest))
          setShowPopup(false)
        } catch (error) {
          console.error("Failed to save date of birth:", error)
          // Fallback to localStorage if API fails
          const updatedUser = { ...user, dob: dobInput }
          setUser(updatedUser)
          localStorage.setItem("user", JSON.stringify(updatedUser))
          setBirthDate(inputDate)
          setShowPopup(false)
        } 
      }else if( age >= 100){
            setShowAlert(true)
            setAlertData({ type: "warning", message: "Age can't be more than 99" })
      }
    }
  }

  const formatAge = (age) => {
    return age.toFixed(8)
  }

  return (
    <div className="flex justify-center w-screen overflow-x-hidden  overflow-y-hidden">
    {!user ? (
        <div className="signinp">
          <GoogleLogin setUser={setUser} saveUserToDB= {saveUserToDB} />
        </div>
      ) : (
    <div className="h-screen min-w-screen bg-transparent text-gray-300 font-nothing flex flex-col items-center justify-around ">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            savedDocuments={goals}
            deleteSavedDoc={deleteSavedGoal}
          />
         
      {user && (
        <div className="w-full flex justify-between p-5 lg:p-10">
          <h1 className="text-3xl transform transition-transform duration-300 hover:scale-110" onClick={()=> {setSidebarOpen(true)}}>AgeMeter</h1>
           {showAlert && <Alert type={alertData.type} message={alertData.message} setShowAlert={setShowAlert}/>}
          <button className="border hover:bg-amber-50 hover:text-black rounded-sm w-20"
          onClick={()=>{
            localStorage.removeItem("user")
            setUser(null)
            localStorage.removeItem("goals")
            setGoal([])
          }}>
            Logout
          </button>
        </div>
      )}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex  items-center justify-center z-50">
          <div className="bg-black p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6 text-center font-nothing">Enter Your Date of Birth</h2>

            <div className="space-y-4">
              <input
                type="date"
                value={dobInput}
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
                className="w-full p-3 text-center text-lg bg-black text-white border border-white font-nothing focus:outline-none 
                    [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert 
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100"
              />

              <button
                onClick={saveDateOfBirth}
                disabled={!dobInput}
                className="w-full py-3 bg-white text-black font-medium font-nothing hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {!showPopup && (
        <div className="text-center  flex flex-col items-center">
          <div className="sm:text-5xl h-20 text-gray-300 uppercase tracking-wider mb-5 font-nothing lg:text-6xl">{(AnimationNum < 4) &&<TypeAnimation 
            sequence={[1000,"You are",500,()=>SetAnimationNum(2)] 
            }
            repeat ={0}
            speed={25}
            cursor={false}/>}</div>
          <div className="saudu bg-transparent"> {(!done) ? ((AnimationNum == 2) &&
        <CountUp

          start={0.00000000}
          end={formatAge(tempage)}
          duration={1}
          decimals={9}
          onEnd={() => {
            setDone(true)
            SetAnimationNum(1)
          }}  // when finished → switch to static value
        />
      ) : (<Counter
  value={formatAge(liveAge)}
  fontSize={(window.innerWidth < 768) ? 50 : 110}
  places={[10, 1, 0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001, 0.0000001, 0.00000001]}
  textColor="white"
  />
         // static text
      )}</div>
          <div className="sm:text-lg text-gray-300 uppercase tracking-wider font-nothing mb-4  lg:min-h-[5rem]">{(AnimationNum < 2) &&<TypeAnimation 
            sequence={[500,"Years Old",1000,()=>SetAnimationNum(0)] 
            }
            repeat ={0}
            cursor={false}/>}</div>
              <div className="w-[20rem] text-lg text-gray-300 uppercase tracking-wider font-nothing min-h-[5rem]"> {(AnimationNum < 1) && <motion.button
  onClick={() => { AddGoal() }}
  className="w-full py-3 bg-white text-black font-medium font-nothing hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400"
  initial={{ opacity: 0, y: 20 }}   // start hidden + slightly down
  animate={{ opacity: 1, y: 0 }}    // fade in + slide up
  transition={{ duration: 0.5 }}    // animation speed
>
  <b>+</b> Add Goals
</motion.button>
              }</div> 
        </div>
        
      )}
      {showGoalPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-black p-8 max-w-md w-full mx-4">
            <div className = "flex justify-between">
            <h2 className="text-2xl font-bold text-white mb-6 text-center font-nothing">Goal</h2>
            <button onClick={() =>{setShowGoalPopup(false)}} className="text-2xl mb-10">X</button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={goalT.title}
                onChange={handleInputChangeGoalT}
                placeholder="Enter your goal/target"
                className="w-full p-3 text-center text-lg bg-black text-white border border-white font-nothing focus:outline-none 
                    [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert 
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100"
              />
              <input
                type="text"
                value={goalT.des}
                onChange={handleInputChangeGoalD}
                placeholder="Description"
                className="w-full p-3 text-center text-lg bg-black text-white border border-white font-nothing focus:outline-none 
                    [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert 
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100"
              />
              <label>Enter Age<input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-border accent-blue-600 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={showAge}
                  onChange={(e) => setShowAge(e.target.checked)}
                /></label>
              {showAge ? (<input
                type="number"
                value={goalT.targetage}
                onChange={handleInputChangeGoalA}
                placeholder="Enter the Target Age"
                className="max-w-xs w-70 ml-2 p-3 text-center text-lg bg-black text-white border border-white font-nothing focus:outline-none 
                    [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert 
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100"
              />):(<DropDown onSelect={handleInputChangeGoalE} className="mx-auto ml-2" />)}
                 <label >Do you want us to remind you of the goal? <label>everyday
                  <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-border accent-blue-600 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={reminder.day}
                  onChange={(e) => setReminder({day:e.target.checked,week:false,month:false})}
                /></label>
                <label>Weekly
                  <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-border accent-blue-600 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={reminder.week}
                  onChange={(e) => setReminder({day:false,week:e.target.checked,month:false})}
                /></label>
                <label>Monthly
                  <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-border accent-blue-600 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={reminder.month}
                  onChange={(e) => setReminder({day:false,week:false,month:e.target.checked})}
                /></label></label>
              <button
                onClick={saveGoal}
                disabled={!showGoalPopup}
                className="w-full py-3 bg-white text-black font-medium font-nothing hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>

      )}
    </div>
      )}
    </div>
  )
}
