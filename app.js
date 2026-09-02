

/* =========================================================
   DATABASE / STATE
========================================================= */

const DB = {

    users:
        JSON.parse(
            localStorage.getItem("pa_users") || "[]"
        ),

    meetings:
        JSON.parse(
            localStorage.getItem("pa_meetings") || "[]"
        ),

    tasks:
        JSON.parse(
            localStorage.getItem("pa_tasks") || "[]"
        ),

    reminders:
        JSON.parse(
            localStorage.getItem("pa_reminders") || "[]"
        ),

    minutes:
        JSON.parse(
            localStorage.getItem("pa_minutes") || "[]"
        ),

    documents:
        JSON.parse(
            localStorage.getItem("pa_documents") || "[]"
        ),

    contacts:
        JSON.parse(
            localStorage.getItem("pa_contacts") || "[]"
        ),

    notifications:
        JSON.parse(
            localStorage.getItem("pa_notifications") || "[]"
        ),

    announcements:
        JSON.parse(
            localStorage.getItem("pa_announcements") || "[]"
        ),

    audit:
        JSON.parse(
            localStorage.getItem("pa_audit") || "[]"
        )

};


let currentUser =
    JSON.parse(
        sessionStorage.getItem("pa_current_user") || "null"
    );


let activeAlarm = null;

let alarmTimer = null;

let alarmAudioContext = null;

let meetingTimerInterval = null;

let meetingTimerSeconds = 0;

let calendarDate = new Date();


/* =========================================================
   STORAGE
========================================================= */

function saveDB(){

    localStorage.setItem(
        "pa_users",
        JSON.stringify(DB.users)
    );

    localStorage.setItem(
        "pa_meetings",
        JSON.stringify(DB.meetings)
    );

    localStorage.setItem(
        "pa_tasks",
        JSON.stringify(DB.tasks)
    );

    localStorage.setItem(
        "pa_reminders",
        JSON.stringify(DB.reminders)
    );

    localStorage.setItem(
        "pa_minutes",
        JSON.stringify(DB.minutes)
    );

    localStorage.setItem(
        "pa_documents",
        JSON.stringify(DB.documents)
    );

    localStorage.setItem(
        "pa_contacts",
        JSON.stringify(DB.contacts)
    );

    localStorage.setItem(
        "pa_notifications",
        JSON.stringify(DB.notifications)
    );

    localStorage.setItem(
        "pa_announcements",
        JSON.stringify(DB.announcements)
    );

    localStorage.setItem(
        "pa_audit",
        JSON.stringify(DB.audit)
    );

}


/* =========================================================
   HELPERS
========================================================= */

function id(){

    if(
        window.crypto &&
        crypto.randomUUID
    ){

        return crypto.randomUUID();

    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);

}


function escapeHTML(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


function formatDate(date){

    if(!date) return "—";

    return new Date(date).toLocaleDateString(
        undefined,
        {
            year:"numeric",
            month:"short",
            day:"numeric"
        }
    );

}


function formatTime(date){

    if(!date) return "—";

    return new Date(date).toLocaleTimeString(
        undefined,
        {
            hour:"numeric",
            minute:"2-digit"
        }
    );

}


function toast(message){

    const container =
        document.getElementById(
            "toastContainer"
        );

    const item =
        document.createElement("div");

    item.className = "toast";

    item.textContent = message;

    container.appendChild(item);

    setTimeout(
        () => item.remove(),
        3500
    );

}


function audit(action){

    DB.audit.unshift({

        id:id(),

        user:
            currentUser?.name || "System",

        action,

        timestamp:
            new Date().toISOString()

    });

    DB.audit =
        DB.audit.slice(0,500);

    saveDB();

}


/* =========================================================
   AUTH
========================================================= */

function switchAuth(type){

    document
        .getElementById("loginTab")
        .classList
        .toggle(
            "active",
            type === "login"
        );

    document
        .getElementById("signupTab")
        .classList
        .toggle(
            "active",
            type === "signup"
        );

    document
        .getElementById("loginForm")
        .classList
        .toggle(
            "active",
            type === "login"
        );

    document
        .getElementById("signupForm")
        .classList
        .toggle(
            "active",
            type === "signup"
        );

}


function togglePassword(id,button){

    const input =
        document.getElementById(id);

    if(
        input.type === "password"
    ){

        input.type = "text";

        button.textContent = "🙈";

    }else{

        input.type = "password";

        button.textContent = "👁";

    }

}


function passwordStrength(password){

    let score = 0;

    if(password.length >= 8)
        score++;

    if(/[A-Z]/.test(password))
        score++;

    if(/[a-z]/.test(password))
        score++;

    if(/[0-9]/.test(password))
        score++;

    if(/[^A-Za-z0-9]/.test(password))
        score++;

    const bar =
        document.getElementById(
            "strengthBar"
        );

    const widths =
        [
            "0%",
            "20%",
            "40%",
            "60%",
            "80%",
            "100%"
        ];

    bar.style.width =
        widths[score];


    if(score <= 2){

        bar.style.background =
            "#dc2626";

    }else if(score <= 4){

        bar.style.background =
            "#f59e0b";

    }else{

        bar.style.background =
            "#16a34a";

    }

}


function signup(event){

    event.preventDefault();

    const error =
        document.getElementById(
            "signupError"
        );

    const success =
        document.getElementById(
            "signupSuccess"
        );

    error.style.display = "none";
    success.style.display = "none";


    const name =
        document
            .getElementById("signupName")
            .value
            .trim();

    const email =
        document
            .getElementById("signupEmail")
            .value
            .trim()
            .toLowerCase();

    const phone =
        document
            .getElementById("signupPhone")
            .value
            .trim();

    const role =
        document
            .getElementById("signupRole")
            .value;

    const password =
        document
            .getElementById("signupPassword")
            .value;

    const confirm =
        document
            .getElementById("signupConfirm")
            .value;


    if(
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
    ){

        error.textContent =
            "Password must contain at least 8 characters, uppercase, lowercase, number and symbol.";

        error.style.display = "block";

        return;

    }


    if(password !== confirm){

        error.textContent =
            "Passwords do not match.";

        error.style.display = "block";

        return;

    }


    if(
        DB.users.some(
            user =>
                user.email === email
        )
    ){

        error.textContent =
            "An account with this email already exists.";

        error.style.display = "block";

        return;

    }


    const user = {

        id:id(),

        name,

        email,

        phone,

        role,

        password,

        photo:null,

        createdAt:
            new Date().toISOString(),

        lastLogin:null,

        twoFA:false

    };


    DB.users.push(user);

    saveDB();

    success.textContent =
        "Account created successfully. You can now sign in.";

    success.style.display = "block";

    audit(
        `Account created for ${email}`
    );


    document
        .getElementById("signupForm")
        .reset();


    setTimeout(
        () => {

            switchAuth("login");

            document
                .getElementById("loginEmail")
                .value = email;

        },
        1000
    );

}


function login(event){

    event.preventDefault();

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("loginPassword")
            .value;


    const error =
        document.getElementById(
            "loginError"
        );


    const user =
        DB.users.find(
            item =>
                item.email === email &&
                item.password === password
        );


    if(!user){

        error.textContent =
            "Invalid email or password.";

        error.style.display = "block";

        return;

    }


    user.lastLogin =
        new Date().toISOString();

    saveDB();


    currentUser = {

        id:user.id,

        name:user.name,

        email:user.email,

        phone:user.phone,

        role:user.role,

        photo:user.photo,

        createdAt:user.createdAt,

        lastLogin:user.lastLogin,

        twoFA:user.twoFA

    };


    sessionStorage.setItem(
        "pa_current_user",
        JSON.stringify(currentUser)
    );


    audit(
        `Successful login: ${email}`
    );


    openApp();

}


function logout(){

    audit("User logged out");

    sessionStorage.removeItem(
        "pa_current_user"
    );

    currentUser = null;

    document
        .getElementById("app")
        .style.display = "none";

    document
        .getElementById("authScreen")
        .style.display = "flex";

}


function forgotPassword(){

    const email =
        prompt(
            "Enter your registered email:"
        );

    if(!email) return;

    toast(
        "Password recovery link would be sent by the production authentication backend."
    );

}


/* =========================================================
   APP
========================================================= */

function openApp(){

    document
        .getElementById("authScreen")
        .style.display = "none";

    document
        .getElementById("app")
        .style.display = "block";

    updateUserUI();

    renderAll();

    checkMissedReminders();

    startReminderEngine();

}


function updateUserUI(){

    if(!currentUser) return;


    document
        .getElementById("topUserName")
        .textContent =
            currentUser.name;

    document
        .getElementById("topUserRole")
        .textContent =
            currentUser.role;

    document
        .getElementById("welcomeText")
        .textContent =
            `Welcome back, ${currentUser.name}`;


    document
        .getElementById("profileName")
        .textContent =
            currentUser.name;

    document
        .getElementById("profileRole")
        .textContent =
            currentUser.role;

    document
        .getElementById("profileEmail")
        .textContent =
            currentUser.email;


    document
        .getElementById("profileInfoName")
        .textContent =
            currentUser.name;

    document
        .getElementById("profileInfoEmail")
        .textContent =
            currentUser.email;

    document
        .getElementById("profileInfoPhone")
        .textContent =
            currentUser.phone || "Not provided";

    document
        .getElementById("profileInfoRole")
        .textContent =
            currentUser.role;

    document
        .getElementById("profileInfoCreated")
        .textContent =
            formatDate(
                currentUser.createdAt
            );

    document
        .getElementById("profileInfoLastLogin")
        .textContent =
            formatDate(
                currentUser.lastLogin
            );


    setAvatar(
        "topAvatar",
        currentUser
    );

    setAvatar(
        "profileLargeAvatar",
        currentUser
    );

}


function setAvatar(elementId,user){

    const element =
        document.getElementById(
            elementId
        );

    if(!element) return;


    if(user.photo){

        element.innerHTML =
            `<img src="${user.photo}" alt="Profile photo">`;

    }else{

        const initials =
            user.name
                .split(" ")
                .map(
                    word =>
                        word.charAt(0)
                )
                .join("")
                .slice(0,2)
                .toUpperCase();

        element.textContent =
            initials || "PA";

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigate(page,element){

    document
        .querySelectorAll(".page")
        .forEach(
            item =>
                item.classList.remove(
                    "active"
                )
        );


    const target =
        document.getElementById(
            `page-${page}`
        );

    if(target){

        target.classList.add("active");

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(
            item =>
                item.classList.remove(
                    "active"
                )
        );


    if(element){

        element.classList.add("active");

    }


    document
        .getElementById("profileDropdown")
        .classList.remove("open");


    document
        .getElementById("sidebar")
        .classList.remove(
            "mobile-open"
        );


    renderAll();

}


function navigateById(page){

    const item =
        [
            ...document.querySelectorAll(
                ".nav-item"
            )
        ]
        .find(
            element =>
                element
                    .getAttribute("onclick")
                    ?.includes(
                        `'${page}'`
                    )
        );

    navigate(page,item);

}


function toggleSidebar(){

    document
        .getElementById("sidebar")
        .classList.toggle(
            "mobile-open"
        );

}


function toggleProfileMenu(){

    document
        .getElementById("profileDropdown")
        .classList.toggle(
            "open"
        );

}


/* =========================================================
   MEETINGS
========================================================= */

function openMeetingModal(){

    document
        .getElementById("meetingModal")
        .classList.add("open");

}


function createMeeting(event){

    event.preventDefault();


    const date =
        document.getElementById(
            "meetingDate"
        ).value;

    const time =
        document.getElementById(
            "meetingTime"
        ).value;


    const meetingDateTime =
        new Date(
            `${date}T${time}`
        );


    const meeting = {

        id:id(),

        title:
            document.getElementById(
                "meetingTitle"
            ).value,

        date,

        time,

        endTime:
            document.getElementById(
                "meetingEndTime"
            ).value,

        venue:
            document.getElementById(
                "meetingVenue"
            ).value,

        priority:
            document.getElementById(
                "meetingPriority"
            ).value,

        description:
            document.getElementById(
                "meetingDescription"
            ).value,

        status:"Scheduled",

        createdBy:
            currentUser.name,

        createdAt:
            new Date().toISOString(),

        startTimestamp:
            meetingDateTime.getTime(),

        reminderMinutes:
            Number(
                document.getElementById(
                    "meetingReminder"
                ).value
            )

    };


    DB.meetings.push(meeting);


    /* Automatically create reminder */

    const reminderTime =
        meetingDateTime.getTime() -
        meeting.reminderMinutes * 60000;


    DB.reminders.push({

        id:id(),

        title:
            meeting.title,

        message:
            `Your meeting "${meeting.title}" is scheduled to begin.`,

        dateTime:
            new Date(
                reminderTime
            ).toISOString(),

        type:"Meeting",

        meetingId:
            meeting.id,

        status:"Scheduled",

        triggered:false,

        createdAt:
            new Date().toISOString()

    });


    saveDB();

    audit(
        `Created meeting: ${meeting.title}`
    );


    closeModal("meetingModal");

    document
        .getElementById("meetingModal")
        .querySelector("form")
        .reset();

    toast(
        "Meeting created and reminder scheduled."
    );

    renderAll();

}


function deleteMeeting(meetingId){

    if(
        !confirm(
            "Delete this meeting?"
        )
    ) return;


    const meeting =
        DB.meetings.find(
            item =>
                item.id === meetingId
        );


    DB.meetings =
        DB.meetings.filter(
            item =>
                item.id !== meetingId
        );


    DB.reminders =
        DB.reminders.filter(
            item =>
                item.meetingId !== meetingId
        );


    saveDB();

    audit(
        `Deleted meeting: ${meeting?.title || meetingId}`
    );

    toast("Meeting deleted.");

    renderAll();

}


function startMeeting(meetingId){

    const meeting =
        DB.meetings.find(
            item =>
                item.id === meetingId
        );

    if(!meeting) return;

    meeting.status =
        "In Progress";

    saveDB();

    audit(
        `Started meeting: ${meeting.title}`
    );

    document
        .getElementById("liveMeetingTitle")
        .value =
            meeting.title;

    navigateById("liveNotes");

    startMeetingTimer();

    toast(
        "Meeting started. Live notes are ready."
    );

    renderAll();

}


/* =========================================================
   TASKS
========================================================= */

function openTaskModal(){

    document
        .getElementById("taskModal")
        .classList.add("open");

}


function createTask(event){

    event.preventDefault();


    DB.tasks.push({

        id:id(),

        title:
            document.getElementById(
                "taskTitle"
            ).value,

        description:
            document.getElementById(
                "taskDescription"
            ).value,

        assigned:
            document.getElementById(
                "taskAssigned"
            ).value,

        due:
            document.getElementById(
                "taskDue"
            ).value,

        priority:
            document.getElementById(
                "taskPriority"
            ).value,

        status:"To Do",

        createdAt:
            new Date().toISOString(),

        createdBy:
            currentUser.name

    });


    saveDB();

    audit("Created a task");

    closeModal("taskModal");

    document
        .getElementById("taskModal")
        .querySelector("form")
        .reset();

    toast("Task created.");

    renderAll();

}


function completeTask(taskId){

    const task =
        DB.tasks.find(
            item =>
                item.id === taskId
        );

    if(!task) return;

    task.status =
        task.status === "Completed"
            ? "To Do"
            : "Completed";

    saveDB();

    audit(
        `${task.status === "Completed" ? "Completed" : "Reopened"} task: ${task.title}`
    );

    renderAll();

}


function deleteTask(taskId){

    if(
        !confirm(
            "Delete this task?"
        )
    ) return;


    DB.tasks =
        DB.tasks.filter(
            item =>
                item.id !== taskId
        );

    saveDB();

    audit("Deleted a task");

    renderAll();

}


/* =========================================================
   REMINDERS
========================================================= */

function openReminderModal(){

    document
        .getElementById("reminderModal")
        .classList.add("open");

}


function createReminder(event){

    event.preventDefault();


    const date =
        document.getElementById(
            "reminderDate"
        ).value;

    const time =
        document.getElementById(
            "reminderTime"
        ).value;


    const dateTime =
        new Date(
            `${date}T${time}`
        ).toISOString();


    DB.reminders.push({

        id:id(),

        title:
            document.getElementById(
                "reminderTitle"
            ).value,

        message:
            document.getElementById(
                "reminderMessage"
            ).value,

        dateTime,

        type:"Custom",

        status:"Scheduled",

        triggered:false,

        createdAt:
            new Date().toISOString()

    });


    saveDB();

    audit("Created reminder");

    closeModal("reminderModal");

    document
        .getElementById("reminderModal")
        .querySelector("form")
        .reset();

    toast("Reminder scheduled.");

    renderAll();

}


function deleteReminder(reminderId){

    if(
        !confirm(
            "Delete this reminder?"
        )
    ) return;


    DB.reminders =
        DB.reminders.filter(
            item =>
                item.id !== reminderId
        );

    saveDB();

    audit("Deleted reminder");

    renderAll();

}


/* =========================================================
   REMINDER ENGINE
========================================================= */

function startReminderEngine(){

    setInterval(
        checkReminders,
        1000
    );

}


function checkReminders(){

    const now =
        Date.now();


    DB.reminders.forEach(
        reminder => {

            if(
                reminder.status === "Scheduled" &&
                !reminder.triggered
            ){

                const trigger =
                    new Date(
                        reminder.dateTime
                    ).getTime();


                if(
                    now >= trigger &&
                    now < trigger + 60000
                ){

                    reminder.triggered =
                        true;

                    reminder.status =
                        "Triggered";

                    saveDB();

                    triggerAlarm(
                        reminder
                    );

                }

            }

        }
    );

}


function checkMissedReminders(){

    const now =
        Date.now();


    let missed = 0;


    DB.reminders.forEach(
        reminder => {

            const trigger =
                new Date(
                    reminder.dateTime
                ).getTime();


            if(
                reminder.status === "Scheduled" &&
                trigger < now - 60000
            ){

                reminder.status =
                    "Missed";

                missed++;

            }

        }
    );


    if(missed){

        saveDB();

        toast(
            `You have ${missed} missed reminder${missed > 1 ? "s" : ""}.`
        );

    }

}


/* =========================================================
   ALARM
========================================================= */

function triggerAlarm(reminder){

    activeAlarm = reminder;


    document
        .getElementById("alarmTitle")
        .textContent =
            reminder.title;

    document
        .getElementById("alarmMessage")
        .textContent =
            reminder.message;


    const meeting =
        DB.meetings.find(
            item =>
                item.id === reminder.meetingId
        );


    document
        .getElementById("alarmMeeting")
        .textContent =
            meeting?.title ||
            reminder.title;

    document
        .getElementById("alarmVenue")
        .textContent =
            meeting?.venue ||
            "—";

    document
        .getElementById("alarmStart")
        .textContent =
            meeting
                ? `${formatDate(meeting.date)} ${meeting.time}`
                : formatTime(
                    reminder.dateTime
                );


    document
        .getElementById("alarmCountdown")
        .textContent =
            "NOW";


    document
        .getElementById("alarmOverlay")
        .classList.add(
            "active"
        );


    playAlarmSound();

    vibrateDevice();

    sendBrowserNotification(
        reminder
    );


    DB.notifications.unshift({

        id:id(),

        title:
            "PA Command Center Reminder",

        message:
            reminder.message,

        type:"Reminder",

        read:false,

        createdAt:
            new Date().toISOString(),

        reminderId:
            reminder.id

    });


    saveDB();

    audit(
        `Alarm triggered: ${reminder.title}`
    );

    renderAll();

}


function testAlarm(){

    const testReminder = {

        id:"test",

        title:
            "Alarm System Test",

        message:
            "This is a test of your PA Command Center alarm system.",

        dateTime:
            new Date().toISOString(),

        type:"Test",

        status:"Triggered"

    };


    triggerAlarm(
        testReminder
    );

}


function dismissAlarm(){

    if(!activeAlarm)
        return;


    stopAlarmSound();

    stopVibration();


    activeAlarm.status =
        "Dismissed";


    if(
        activeAlarm.id !== "test"
    ){

        const stored =
            DB.reminders.find(
                item =>
                    item.id ===
                    activeAlarm.id
            );

        if(stored){

            stored.status =
                "Dismissed";

        }

    }


    saveDB();

    audit(
        `Alarm dismissed: ${activeAlarm.title}`
    );


    closeAlarm();

    renderAll();

    toast(
        "Alarm dismissed."
    );

}


function closeAlarm(){

    document
        .getElementById("alarmOverlay")
        .classList.remove(
            "active"
        );

    activeAlarm = null;

}


function snoozeAlarm(minutes){

    if(!activeAlarm)
        return;


    stopAlarmSound();

    stopVibration();


    if(
        activeAlarm.id !== "test"
    ){

        const reminder =
            DB.reminders.find(
                item =>
                    item.id ===
                    activeAlarm.id
            );

        if(reminder){

            reminder.dateTime =
                new Date(
                    Date.now() +
                    minutes * 60000
                ).toISOString();

            reminder.status =
                "Scheduled";

            reminder.triggered =
                false;

        }

    }


    saveDB();

    audit(
        `Alarm snoozed for ${minutes} minutes`
    );


    closeAlarm();

    renderAll();

    toast(
        `Alarm snoozed for ${minutes} minutes.`
    );

}


function openAlarmMeeting(){

    if(
        activeAlarm?.meetingId
    ){

        const meeting =
            DB.meetings.find(
                item =>
                    item.id ===
                    activeAlarm.meetingId
            );

        closeAlarm();

        navigateById("meetings");

        toast(
            `Opened meeting: ${meeting?.title || "Meeting"}`
        );

    }else{

        closeAlarm();

    }

}


function startAlarmMeeting(){

    if(
        activeAlarm?.meetingId
    ){

        const meeting =
            DB.meetings.find(
                item =>
                    item.id ===
                    activeAlarm.meetingId
            );

        if(meeting){

            meeting.status =
                "In Progress";

            saveDB();

            stopAlarmSound();
            stopVibration();

            closeAlarm();

            document
                .getElementById(
                    "liveMeetingTitle"
                )
                .value =
                    meeting.title;

            navigateById(
                "liveNotes"
            );

            startMeetingTimer();

            audit(
                `Started meeting from alarm: ${meeting.title}`
            );

            toast(
                "Meeting started."
            );

        }

    }else{

        closeAlarm();

        navigateById(
            "liveNotes"
        );

        startMeetingTimer();

    }

}


/* =========================================================
   ALARM SOUND
========================================================= */

function playAlarmSound(){

    const enabled =
        document
            .getElementById(
                "alarmSoundToggle"
            )
            ?.checked !== false;


    if(!enabled)
        return;


    try {

        alarmAudioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        alarmTimer =
            setInterval(
                () => {

                    if(
                        !alarmAudioContext
                    ) return;


                    const oscillator =
                        alarmAudioContext
                            .createOscillator();

                    const gain =
                        alarmAudioContext
                            .createGain();


                    oscillator.type =
                        "square";

                    oscillator.frequency.value =
                        880;

                    const volume =
                        (
                            Number(
                                document
                                    .getElementById(
                                        "alarmVolume"
                                    )
                                    ?.value || 80
                            ) / 100
                        ) * .08;


                    gain.gain.value =
                        volume;


                    oscillator.connect(
                        gain
                    );

                    gain.connect(
                        alarmAudioContext.destination
                    );


                    oscillator.start();

                    oscillator.stop(
                        alarmAudioContext.currentTime +
                        .35
                    );

                },
                700
            );

    }catch(error){

        console.warn(
            "Alarm audio unavailable.",
            error
        );

    }

}


function stopAlarmSound(){

    if(alarmTimer){

        clearInterval(
            alarmTimer
        );

        alarmTimer = null;

    }


    if(alarmAudioContext){

        alarmAudioContext.close()
            .catch(
                () => {}
            );

        alarmAudioContext = null;

    }

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

async function requestNotifications(){

    if(
        !("Notification" in window)
    ){

        toast(
            "Browser notifications are not supported."
        );

        return;

    }


    const permission =
        await Notification.requestPermission();


    if(permission === "granted"){

        toast(
            "Browser notifications enabled."
        );

    }else{

        toast(
            "Browser notification permission was not granted."
        );

    }

}


function sendBrowserNotification(reminder){

    if(
        !("Notification" in window)
    ) return;


    if(
        Notification.permission !==
        "granted"
    ) return;


    try{

        const notification =
            new Notification(
                "PA Command Center Reminder",
                {
                    body:
                        `${reminder.title}: ${reminder.message}`,
                    icon:""
                }
            );


        notification.onclick =
            () => {

                window.focus();

                if(
                    reminder.meetingId
                ){

                    navigateById(
                        "meetings"
                    );

                }

                notification.close();

            };

    }catch(error){

        console.warn(error);

    }

}


/* =========================================================
   VIBRATION
========================================================= */

function vibrateDevice(){

    const enabled =
        document
            .getElementById(
                "vibrationToggle"
            )
            ?.checked !== false;


    if(
        enabled &&
        "vibrate" in navigator
    ){

        navigator.vibrate(
            [
                500,
                300,
                500,
                300,
                1000
            ]
        );

    }

}


function stopVibration(){

    if(
        "vibrate" in navigator
    ){

        navigator.vibrate(0);

    }

}


/* =========================================================
   LIVE MEETING
========================================================= */

function startMeetingTimer(){

    if(meetingTimerInterval)
        return;


    meetingTimerInterval =
        setInterval(
            () => {

                meetingTimerSeconds++;

                const hours =
                    String(
                        Math.floor(
                            meetingTimerSeconds / 3600
                        )
                    ).padStart(2,"0");

                const minutes =
                    String(
                        Math.floor(
                            (meetingTimerSeconds % 3600) / 60
                        )
                    ).padStart(2,"0");

                const seconds =
                    String(
                        meetingTimerSeconds % 60
                    ).padStart(2,"0");


                document
                    .getElementById(
                        "meetingTimer"
                    )
                    .textContent =
                        `${hours}:${minutes}:${seconds}`;

            },
            1000
        );

}


function saveLiveNotes(){

    const title =
        document
            .getElementById(
                "liveMeetingTitle"
            )
            .value;

    const notes =
        document
            .getElementById(
                "liveNotesEditor"
            )
            .value;


    localStorage.setItem(
        "pa_live_notes",
        JSON.stringify({
            title,
            notes,
            savedAt:
                new Date().toISOString()
        })
    );


    toast(
        "Live notes saved."
    );

}


function generateMinutes(){

    const title =
        document
            .getElementById(
                "liveMeetingTitle"
            )
            .value;

    const notes =
        document
            .getElementById(
                "liveNotesEditor"
            )
            .value;


    if(!title){

        toast(
            "Enter a meeting title first."
        );

        return;

    }


    document
        .getElementById(
            "minutesTitle"
        )
        .value =
            title;


    document
        .getElementById(
            "minutesDiscussion"
        )
        .value =
            notes;


    openMinutesModal();

}


/* =========================================================
   MINUTES
========================================================= */

function openMinutesModal(){

    document
        .getElementById("minutesModal")
        .classList.add("open");

}


function createMinutes(event){

    event.preventDefault();


    DB.minutes.unshift({

        id:id(),

        title:
            document
                .getElementById(
                    "minutesTitle"
                )
                .value,

        attendance:
            document
                .getElementById(
                    "minutesAttendance"
                )
                .value,

        discussion:
            document
                .getElementById(
                    "minutesDiscussion"
                )
                .value,

        decisions:
            document
                .getElementById(
                    "minutesDecisions"
                )
                .value,

        actions:
            document
                .getElementById(
                    "minutesActions"
                )
                .value,

        status:"Draft",

        createdAt:
            new Date().toISOString(),

        createdBy:
            currentUser.name

    });


    saveDB();

    audit("Created meeting minutes");

    closeModal("minutesModal");

    toast(
        "Minutes saved as draft."
    );

    renderAll();

}


/* =========================================================
   DOCUMENTS
========================================================= */

function uploadDocument(input){

    const file =
        input.files[0];

    if(!file)
        return;


    if(
        file.size >
        10 * 1024 * 1024
    ){

        toast(
            "File is larger than 10MB."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        () => {

            DB.documents.unshift({

                id:id(),

                name:file.name,

                size:file.size,

                type:file.type,

                data:reader.result,

                uploadedBy:
                    currentUser.name,

                createdAt:
                    new Date().toISOString()

            });


            saveDB();

            audit(
                `Uploaded document: ${file.name}`
            );

            toast(
                "Document uploaded."
            );

            renderAll();

        };


    reader.readAsDataURL(file);

}


function deleteDocument(documentId){

    if(
        !confirm(
            "Delete this document?"
        )
    ) return;


    DB.documents =
        DB.documents.filter(
            item =>
                item.id !== documentId
        );

    saveDB();

    audit("Deleted document");

    renderAll();

}


/* =========================================================
   CONTACTS
========================================================= */

function openContactModal(){

    document
        .getElementById("contactModal")
        .classList.add("open");

}


function createContact(event){

    event.preventDefault();


    DB.contacts.push({

        id:id(),

        name:
            document.getElementById(
                "contactName"
            ).value,

        position:
            document.getElementById(
                "contactPosition"
            ).value,

        phone:
            document.getElementById(
                "contactPhone"
            ).value,

        email:
            document.getElementById(
                "contactEmail"
            ).value,

        createdAt:
            new Date().toISOString()

    });


    saveDB();

    closeModal("contactModal");

    document
        .getElementById("contactModal")
        .querySelector("form")
        .reset();

    audit("Created contact");

    toast(
        "Contact added."
    );

    renderAll();

}


function deleteContact(contactId){

    if(
        !confirm(
            "Delete this contact?"
        )
    ) return;


    DB.contacts =
        DB.contacts.filter(
            item =>
                item.id !== contactId
        );

    saveDB();

    audit("Deleted contact");

    renderAll();

}


/* =========================================================
   ANNOUNCEMENTS
========================================================= */

function openAnnouncementModal(){

    document
        .getElementById(
            "announcementModal"
        )
        .classList.add("open");

}


function createAnnouncement(event){

    event.preventDefault();


    DB.announcements.unshift({

        id:id(),

        title:
            document
                .getElementById(
                    "announcementTitle"
                )
                .value,

        message:
            document
                .getElementById(
                    "announcementMessage"
                )
                .value,

        priority:
            document
                .getElementById(
                    "announcementPriority"
                )
                .value,

        createdAt:
            new Date().toISOString(),

        createdBy:
            currentUser.name

    });


    saveDB();

    closeModal(
        "announcementModal"
    );

    document
        .getElementById(
            "announcementModal"
        )
        .querySelector("form")
        .reset();

    audit("Published announcement");

    toast(
        "Announcement published."
    );

    renderAll();

}


/* =========================================================
   PROFILE
========================================================= */

function openProfileEdit(){

    document
        .getElementById("editName")
        .value =
            currentUser.name;

    document
        .getElementById("editEmail")
        .value =
            currentUser.email;

    document
        .getElementById("editPhone")
        .value =
            currentUser.phone || "";

    document
        .getElementById("editRole")
        .value =
            currentUser.role;


    document
        .getElementById("profileModal")
        .classList.add("open");

}


function saveProfile(event){

    event.preventDefault();


    const name =
        document
            .getElementById(
                "editName"
            )
            .value
            .trim();

    const email =
        document
            .getElementById(
                "editEmail"
            )
            .value
            .trim()
            .toLowerCase();

    const phone =
        document
            .getElementById(
                "editPhone"
            )
            .value
            .trim();


    const user =
        DB.users.find(
            item =>
                item.id ===
                currentUser.id
        );


    if(!user)
        return;


    user.name =
        name;

    user.email =
        email;

    user.phone =
        phone;


    currentUser.name =
        name;

    currentUser.email =
        email;

    currentUser.phone =
        phone;


    sessionStorage.setItem(
        "pa_current_user",
        JSON.stringify(currentUser)
    );


    saveDB();

    audit("Updated profile");

    updateUserUI();

    closeModal("profileModal");

    toast(
        "Profile updated successfully."
    );

}


function changeProfilePhoto(input){

    const file =
        input.files[0];

    if(!file)
        return;


    if(
        ![
            "image/jpeg",
            "image/png",
            "image/webp"
        ].includes(
            file.type
        )
    ){

        toast(
            "Please select JPG, PNG or WEBP."
        );

        return;

    }


    if(
        file.size >
        2 * 1024 * 1024
    ){

        toast(
            "Profile photo must be below 2MB."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        () => {

            const user =
                DB.users.find(
                    item =>
                        item.id ===
                        currentUser.id
                );


            if(!user)
                return;


            user.photo =
                reader.result;

            currentUser.photo =
                reader.result;


            sessionStorage.setItem(
                "pa_current_user",
                JSON.stringify(currentUser)
            );


            saveDB();

            updateUserUI();

            audit(
                "Changed profile photo"
            );

            toast(
                "Profile photo updated."
            );

        };


    reader.readAsDataURL(file);

}


function removeProfilePhoto(){

    if(
        !confirm(
            "Remove your profile photo?"
        )
    ) return;


    const user =
        DB.users.find(
            item =>
                item.id ===
                currentUser.id
        );


    if(!user)
        return;


    user.photo =
        null;

    currentUser.photo =
        null;


    sessionStorage.setItem(
        "pa_current_user",
        JSON.stringify(currentUser)
    );


    saveDB();

    updateUserUI();

    audit(
        "Removed profile photo"
    );

    toast(
        "Profile photo removed."
    );

}


function changePassword(){

    const current =
        prompt(
            "Enter your current password:"
        );

    if(current === null)
        return;


    const user =
        DB.users.find(
            item =>
                item.id ===
                currentUser.id
        );


    if(
        !user ||
        user.password !== current
    ){

        toast(
            "Current password is incorrect."
        );

        return;

    }


    const next =
        prompt(
            "Enter your new password:"
        );

    if(!next)
        return;


    if(
        next.length < 8 ||
        !/[A-Z]/.test(next) ||
        !/[a-z]/.test(next) ||
        !/[0-9]/.test(next) ||
        !/[^A-Za-z0-9]/.test(next)
    ){

        toast(
            "New password must meet all security requirements."
        );

        return;

    }


    user.password =
        next;


    saveDB();

    audit(
        "Changed account password"
    );

    toast(
        "Password changed successfully."
    );

}


/* =========================================================
   SECURITY
========================================================= */

function toggle2FA(){

    const user =
        DB.users.find(
            item =>
                item.id ===
                currentUser.id
        );


    if(!user)
        return;


    user.twoFA =
        !user.twoFA;

    currentUser.twoFA =
        user.twoFA;


    sessionStorage.setItem(
        "pa_current_user",
        JSON.stringify(currentUser)
    );


    saveDB();

    audit(
        `${user.twoFA ? "Enabled" : "Disabled"} 2FA`
    );


    toast(
        user.twoFA
            ? "2FA enabled in prototype mode."
            : "2FA disabled."
    );

}


function logoutAllSessions(){

    if(
        !confirm(
            "Sign out all sessions?"
        )
    ) return;


    toast(
        "All other sessions would be revoked by the production backend."
    );

    audit(
        "Requested sign out of all sessions"
    );

}


/* =========================================================
   SETTINGS
========================================================= */

function saveSettings(){

    const settings = {

        sound:
            document
                .getElementById(
                    "alarmSoundToggle"
                )
                .checked,

        vibration:
            document
                .getElementById(
                    "vibrationToggle"
                )
                .checked,

        volume:
            document
                .getElementById(
                    "alarmVolume"
                )
                .value,

        theme:
            document
                .getElementById(
                    "themeSelect"
                )
                .value

    };


    localStorage.setItem(
        "pa_settings",
        JSON.stringify(settings)
    );

}


function loadSettings(){

    const settings =
        JSON.parse(
            localStorage.getItem(
                "pa_settings"
            ) || "{}"
        );


    if(
        settings.sound !== undefined
    ){

        document
            .getElementById(
                "alarmSoundToggle"
            )
            .checked =
                settings.sound;

    }


    if(
        settings.vibration !== undefined
    ){

        document
            .getElementById(
                "vibrationToggle"
            )
            .checked =
                settings.vibration;

    }


    if(settings.volume){

        document
            .getElementById(
                "alarmVolume"
            )
            .value =
                settings.volume;

    }


    if(settings.theme){

        document
            .getElementById(
                "themeSelect"
            )
            .value =
                settings.theme;

        applyTheme(
            settings.theme
        );

    }

}


function toggleTheme(){

    const isDark =
        document.body
            .classList
            .contains("dark");


    applyTheme(
        isDark
            ? "light"
            : "dark"
    );

}


function applyTheme(theme){

    if(theme === "dark"){

        document.body
            .classList
            .add("dark");

    }else if(theme === "light"){

        document.body
            .classList
            .remove("dark");

    }else{

        const dark =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

        document.body
            .classList
            .toggle(
                "dark",
                dark
            );

    }


    saveSettings();

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function markAllNotificationsRead(){

    DB.notifications.forEach(
        notification =>
            notification.read = true
    );

    saveDB();

    renderAll();

    toast(
        "All notifications marked as read."
    );

}


/* =========================================================
   CALENDAR
========================================================= */

function changeMonth(amount){

    calendarDate.setMonth(
        calendarDate.getMonth() +
        amount
    );

    renderCalendar();

}


/* =========================================================
   SEARCH
========================================================= */

function globalSearch(value){

    const query =
        value
            .trim()
            .toLowerCase();


    if(!query)
        return;


    const results = [

        ...DB.meetings.map(
            item => ({
                type:"Meeting",
                title:item.title
            })
        ),

        ...DB.tasks.map(
            item => ({
                type:"Task",
                title:item.title
            })
        ),

        ...DB.documents.map(
            item => ({
                type:"Document",
                title:item.name
            })
        ),

        ...DB.contacts.map(
            item => ({
                type:"Contact",
                title:item.name
            })
        )

    ].filter(
        item =>
            item.title
                .toLowerCase()
                .includes(query)
    );


    if(results.length){

        toast(
            `${results.length} result${results.length > 1 ? "s" : ""} found.`
        );

    }else{

        toast(
            "No results found."
        );

    }

}


/* =========================================================
   RENDERING
========================================================= */

function renderAll(){

    renderDashboard();

    renderMeetings();

    renderTasks();

    renderReminders();

    renderMinutes();

    renderDocuments();

    renderContacts();

    renderNotifications();

    renderAnnouncements();

    renderUsers();

    renderAudit();

    renderCalendar();

    updateBadges();

    updateUserUI();

}


function renderDashboard(){

    const upcoming =
        DB.meetings
            .filter(
                meeting =>
                    meeting.status ===
                    "Scheduled"
            )
            .sort(
                (a,b) =>
                    new Date(
                        `${a.date}T${a.time}`
                    ) -
                    new Date(
                        `${b.date}T${b.time}`
                    )
            )
            .slice(0,5);


    document
        .getElementById(
            "statMeetings"
        )
        .textContent =
            upcoming.length;


    document
        .getElementById(
            "statTasks"
        )
        .textContent =
            DB.tasks.filter(
                task =>
                    task.status !==
                    "Completed"
            ).length;


    document
        .getElementById(
            "statReminders"
        )
        .textContent =
            DB.reminders.filter(
                reminder =>
                    reminder.status ===
                    "Scheduled"
            ).length;


    document
        .getElementById(
            "statMinutes"
        )
        .textContent =
            DB.minutes.length;


    const meetingsContainer =
        document
            .getElementById(
                "dashboardMeetings"
            );


    if(!upcoming.length){

        meetingsContainer.innerHTML =
            `<div class="empty-state">
                No upcoming meetings.
            </div>`;

    }else{

        meetingsContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Meeting</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Venue</th>
                    </tr>
                </thead>
                <tbody>
                    ${upcoming.map(
                        meeting => `
                        <tr>
                            <td>
                                ${escapeHTML(meeting.title)}
                            </td>
                            <td>
                                ${formatDate(meeting.date)}
                            </td>
                            <td>
                                ${escapeHTML(meeting.time)}
                            </td>
                            <td>
                                ${escapeHTML(meeting.venue || "—")}
                            </td>
                        </tr>
                    `
                    ).join("")}
                </tbody>
            </table>
        `;

    }


    const reminders =
        DB.reminders
            .filter(
                reminder =>
                    reminder.status ===
                    "Scheduled"
            )
            .sort(
                (a,b) =>
                    new Date(a.dateTime) -
                    new Date(b.dateTime)
            )
            .slice(0,5);


    const reminderContainer =
        document
            .getElementById(
                "dashboardReminders"
            );


    if(!reminders.length){

        reminderContainer.innerHTML =
            `<div class="empty-state">
                No upcoming reminders.
            </div>`;

    }else{

        reminderContainer.innerHTML =
            reminders
                .map(
                    reminder => `
                    <div
                        style="
                            padding:12px 0;
                            border-bottom:1px solid var(--border);
                        "
                    >
                        <strong style="font-size:12px">
                            ${escapeHTML(reminder.title)}
                        </strong>

                        <div
                            class="text-muted"
                            style="font-size:10px;margin-top:4px"
                        >
                            ${formatDate(reminder.dateTime)}
                            ·
                            ${formatTime(reminder.dateTime)}
                        </div>
                    </div>
                `
                )
                .join("");

    }

}


function renderMeetings(){

    const table =
        document.getElementById(
            "meetingsTable"
        );


    if(!DB.meetings.length){

        table.innerHTML =
            `<tr>
                <td colspan="6">
                    <div class="empty-state">
                        No meetings created yet.
                    </div>
                </td>
            </tr>`;

        return;

    }


    table.innerHTML =
        DB.meetings
            .slice()
            .sort(
                (a,b) =>
                    new Date(
                        `${a.date}T${a.time}`
                    ) -
                    new Date(
                        `${b.date}T${b.time}`
                    )
            )
            .map(
                meeting => `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(meeting.title)}
                        </strong>
                    </td>

                    <td>
                        ${formatDate(meeting.date)}
                    </td>

                    <td>
                        ${escapeHTML(meeting.time)}
                    </td>

                    <td>
                        ${escapeHTML(meeting.venue || "—")}
                    </td>

                    <td>
                        <span class="badge ${
                            meeting.status === "Completed"
                                ? "badge-green"
                                : meeting.status === "Cancelled"
                                ? "badge-red"
                                : meeting.status === "In Progress"
                                ? "badge-yellow"
                                : "badge-blue"
                        }">
                            ${escapeHTML(meeting.status)}
                        </span>
                    </td>

                    <td>

                        <button
                            class="secondary-btn"
                            onclick="startMeeting('${meeting.id}')"
                        >
                            Start
                        </button>

                        <button
                            class="danger-btn"
                            onclick="deleteMeeting('${meeting.id}')"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `
            )
            .join("");

}


function renderTasks(){

    const table =
        document.getElementById(
            "tasksTable"
        );


    if(!DB.tasks.length){

        table.innerHTML =
            `<tr>
                <td colspan="6">
                    <div class="empty-state">
                        No tasks created yet.
                    </div>
                </td>
            </tr>`;

        return;

    }


    table.innerHTML =
        DB.tasks
            .map(
                task => `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(task.title)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(task.assigned)}
                    </td>

                    <td>
                        ${formatDate(task.due)}
                    </td>

                    <td>
                        ${escapeHTML(task.priority)}
                    </td>

                    <td>
                        <span class="badge ${
                            task.status === "Completed"
                                ? "badge-green"
                                : new Date(task.due) < new Date() &&
                                  task.status !== "Completed"
                                ? "badge-red"
                                : "badge-blue"
                        }">
                            ${
                                new Date(task.due) < new Date() &&
                                task.status !== "Completed"
                                    ? "Overdue"
                                    : escapeHTML(task.status)
                            }
                        </span>
                    </td>

                    <td>

                        <button
                            class="success-btn"
                            onclick="completeTask('${task.id}')"
                        >
                            ${
                                task.status === "Completed"
                                    ? "Reopen"
                                    : "Complete"
                            }
                        </button>

                        <button
                            class="danger-btn"
                            onclick="deleteTask('${task.id}')"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `
            )
            .join("");

}


function renderReminders(){

    const table =
        document.getElementById(
            "remindersTable"
        );


    if(!DB.reminders.length){

        table.innerHTML =
            `<tr>
                <td colspan="6">
                    <div class="empty-state">
                        No reminders created yet.
                    </div>
                </td>
            </tr>`;

        return;

    }


    table.innerHTML =
        DB.reminders
            .slice()
            .sort(
                (a,b) =>
                    new Date(a.dateTime) -
                    new Date(b.dateTime)
            )
            .map(
                reminder => `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(reminder.title)}
                        </strong>

                        <br>

                        <small class="text-muted">
                            ${escapeHTML(reminder.message)}
                        </small>
                    </td>

                    <td>
                        ${formatDate(reminder.dateTime)}
                    </td>

                    <td>
                        ${formatTime(reminder.dateTime)}
                    </td>

                    <td>
                        ${escapeHTML(reminder.type)}
                    </td>

                    <td>
                        <span class="badge ${
                            reminder.status === "Scheduled"
                                ? "badge-blue"
                                : reminder.status === "Missed"
                                ? "badge-red"
                                : reminder.status === "Dismissed"
                                ? "badge-green"
                                : "badge-yellow"
                        }">
                            ${escapeHTML(reminder.status)}
                        </span>
                    </td>

                    <td>

                        <button
                            class="danger-btn"
                            onclick="deleteReminder('${reminder.id}')"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `
            )
            .join("");

}


function renderMinutes(){

    const table =
        document.getElementById(
            "minutesTable"
        );


    if(!DB.minutes.length){

        table.innerHTML =
            `<tr>
                <td colspan="5">
                    <div class="empty-state">
                        No meeting minutes yet.
                    </div>
                </td>
            </tr>`;

        return;

    }


    table.innerHTML =
        DB.minutes
            .map(
                minute => `

                <tr>

                    <td>
                        ${escapeHTML(minute.title)}
                    </td>

                    <td>
                        ${formatDate(minute.createdAt)}
                    </td>

                    <td>
                        ${escapeHTML(minute.createdBy)}
                    </td>

                    <td>
                        <span class="badge badge-yellow">
                            ${escapeHTML(minute.status)}
                        </span>
                    </td>

                    <td>

                        <button
                            class="secondary-btn"
                            onclick="alert(${JSON.stringify(minute.discussion)})"
                        >
                            View
                        </button>

                    </td>

                </tr>

            `
            )
            .join("");

}


function renderDocuments(){

    const container =
        document.getElementById(
            "documentsList"
        );


    if(!DB.documents.length){

        container.innerHTML =
            `<div class="empty-state">
                No documents uploaded yet.
            </div>`;

        return;

    }


    container.innerHTML =
        DB.documents
            .map(
                document => `

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:15px;
                        padding:14px;
                        border-bottom:1px solid var(--border);
                    "
                >

                    <div>

                        <strong style="font-size:12px">
                            ${escapeHTML(document.name)}
                        </strong>

                        <br>

                        <small class="text-muted">
                            ${Math.round(document.size / 1024)} KB
                            ·
                            ${formatDate(document.createdAt)}
                        </small>

                    </div>

                    <div>

                        ${
                            document.data
                                ? `
                                <a
                                    href="${document.data}"
                                    download="${escapeHTML(document.name)}"
                                    class="secondary-btn"
                                    style="
                                        display:inline-block;
                                        text-decoration:none;
                                    "
                                >
                                    Download
                                </a>
                                `
                                : ""
                        }

                        <button
                            class="danger-btn"
                            onclick="deleteDocument('${document.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `
            )
            .join("");

}


function renderContacts(){

    const table =
        document.getElementById(
            "contactsTable"
        );


    if(!DB.contacts.length){

        table.innerHTML =
            `<tr>
                <td colspan="5">
                    <div class="empty-state">
                        No contacts yet.
                    </div>
                </td>
            </tr>`;

        return;

    }


    table.innerHTML =
        DB.contacts
            .map(
                contact => `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(contact.name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(contact.position)}
                    </td>

                    <td>
                        ${escapeHTML(contact.phone)}
                    </td>

                    <td>
                        ${escapeHTML(contact.email)}
                    </td>

                    <td>

                        <button
                            class="secondary-btn"
                            onclick="location.href='mailto:${encodeURIComponent(contact.email || "")}'"
                        >
                            Email
                        </button>

                        <button
                            class="danger-btn"
                            onclick="deleteContact('${contact.id}')"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `
            )
            .join("");

}


function renderNotifications(){

    const container =
        document.getElementById(
            "notificationsList"
        );


    if(!DB.notifications.length){

        container.innerHTML =
            `<div class="empty-state">
                No notifications.
            </div>`;

        return;

    }


    container.innerHTML =
        DB.notifications
            .map(
                notification => `

                <div
                    style="
                        padding:14px;
                        border-bottom:1px solid var(--border);
                        opacity:${notification.read ? ".65" : "1"};
                    "
                >

                    <strong style="font-size:12px">
                        ${escapeHTML(notification.title)}
                    </strong>

                    <p
                        class="text-muted"
                        style="
                            font-size:11px;
                            margin-top:5px;
                        "
                    >
                        ${escapeHTML(notification.message)}
                    </p>

                    <small class="text-muted">
                        ${formatDate(notification.createdAt)}
                        ·
                        ${formatTime(notification.createdAt)}
                    </small>

                </div>

            `
            )
            .join("");

}


function renderAnnouncements(){

    const container =
        document.getElementById(
            "announcementsList"
        );


    if(!DB.announcements.length){

        container.innerHTML =
            `<div class="empty-state">
                No announcements.
            </div>`;

        return;

    }


    container.innerHTML =
        DB.announcements
            .map(
                announcement => `

                <div
                    style="
                        padding:15px;
                        border-bottom:1px solid var(--border);
                    "
                >

                    <span class="badge ${
                        announcement.priority === "Urgent"
                            ? "badge-red"
                            : announcement.priority === "Important"
                            ? "badge-yellow"
                            : "badge-blue"
                    }">
                        ${escapeHTML(announcement.priority)}
                    </span>

                    <h3
                        style="
                            margin-top:8px;
                            font-size:14px;
                        "
                    >
                        ${escapeHTML(announcement.title)}
                    </h3>

                    <p
                        class="text-muted"
                        style="
                            margin-top:5px;
                            font-size:11px;
                            line-height:1.6;
                        "
                    >
                        ${escapeHTML(announcement.message)}
                    </p>

                    <small class="text-muted">
                        Published by
                        ${escapeHTML(announcement.createdBy)}
                        ·
                        ${formatDate(announcement.createdAt)}
                    </small>

                </div>

            `
            )
            .join("");

}


function renderUsers(){

    const table =
        document.getElementById(
            "usersTable"
        );


    table.innerHTML =
        DB.users
            .map(
                user => `

                <tr>

                    <td>
                        ${escapeHTML(user.name)}
                    </td>

                    <td>
                        ${escapeHTML(user.email)}
                    </td>

                    <td>
                        ${escapeHTML(user.role)}
                    </td>

                    <td>
                        <span class="badge badge-green">
                            Active
                        </span>
                    </td>

                    <td>
                        <button
                            class="secondary-btn"
                            onclick="toast('User profile: ${escapeHTML(user.name)}')"
                        >
                            View
                        </button>
                    </td>

                </tr>

            `
            )
            .join("");

}


function renderAudit(){

    const table =
        document.getElementById(
            "auditTable"
        );


    if(!DB.audit.length){

        table.innerHTML =
            `<tr>
                <td colspan="3">
                    <div class="empty-state">
                        No audit events.
                    </div>
                </td>
            </tr>`;

        return;

    }


    table.innerHTML =
        DB.audit
            .slice(0,100)
            .map(
                event => `

                <tr>

                    <td>
                        ${escapeHTML(event.user)}
                    </td>

                    <td>
                        ${escapeHTML(event.action)}
                    </td>

                    <td>
                        ${formatDate(event.timestamp)}
                        ${formatTime(event.timestamp)}
                    </td>

                </tr>

            `
            )
            .join("");

}


/* =========================================================
   CALENDAR RENDER
========================================================= */

function renderCalendar(){

    const title =
        document.getElementById(
            "calendarTitle"
        );


    const days =
        document.getElementById(
            "calendarDays"
        );


    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    const monthName =
        calendarDate.toLocaleDateString(
            undefined,
            {
                month:"long",
                year:"numeric"
            }
        );


    title.textContent =
        monthName;


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    let html = "";


    for(
        let i = 0;
        i < firstDay;
        i++
    ){

        html +=
            `<div class="calendar-day"></div>`;

    }


    for(
        let day = 1;
        day <= daysInMonth;
        day++
    ){

        const dateString =
            `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;


        const meetings =
            DB.meetings.filter(
                meeting =>
                    meeting.date ===
                    dateString
            );


        html += `

            <div class="calendar-day">

                <div class="calendar-day-number">
                    ${day}
                </div>

                ${
                    meetings
                        .map(
                            meeting => `
                                <div
                                    class="calendar-event"
                                    onclick="startMeeting('${meeting.id}')"
                                >
                                    ${escapeHTML(meeting.title)}
                                </div>
                            `
                        )
                        .join("")
                }

            </div>

        `;

    }


    days.innerHTML =
        html;

}


/* =========================================================
   BADGES
========================================================= */

function updateBadges(){

    const reminderCount =
        DB.reminders.filter(
            item =>
                item.status ===
                "Scheduled"
        ).length;


    const unread =
        DB.notifications.filter(
            item =>
                !item.read
        ).length;


    document
        .getElementById(
            "reminderBadge"
        )
        .textContent =
            reminderCount;


    document
        .getElementById(
            "notificationBadge"
        )
        .textContent =
            unread;


    const topBadge =
        document
            .getElementById(
                "topNotificationBadge"
            );


    topBadge.textContent =
        unread;

    topBadge.classList.toggle(
        "hidden",
        unread === 0
    );

}


/* =========================================================
   MODALS
========================================================= */

function closeModal(id){

    document
        .getElementById(id)
        .classList.remove(
            "open"
        );

}


document
    .querySelectorAll(".modal")
    .forEach(
        modal => {

            modal.addEventListener(
                "click",
                event => {

                    if(
                        event.target ===
                        modal
                    ){

                        modal.classList.remove(
                            "open"
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   REMEMBERED EMAIL
========================================================= */

const rememberedEmail =
    localStorage.getItem(
        "pa_remembered_email"
    );

if(rememberedEmail){

    document
        .getElementById(
            "loginEmail"
        )
        .value =
            rememberedEmail;

    document
        .getElementById(
            "rememberMe"
        )
        .checked = true;

}


/* =========================================================
   REMEMBER ME
========================================================= */

document
    .getElementById(
        "loginForm"
    )
    .addEventListener(
        "submit",
        () => {

            if(
                document
                    .getElementById(
                        "rememberMe"
                    )
                    .checked
            ){

                localStorage.setItem(
                    "pa_remembered_email",
                    document
                        .getElementById(
                            "loginEmail"
                        )
                        .value
                );

            }

        }
    );


/* =========================================================
   INITIALIZE
========================================================= */

loadSettings();


if(currentUser){

    const user =
        DB.users.find(
            item =>
                item.id ===
                currentUser.id
        );


    if(user){

        currentUser = {

            id:user.id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            role:user.role,
            photo:user.photo,
            createdAt:user.createdAt,
            lastLogin:user.lastLogin,
            twoFA:user.twoFA

        };

        sessionStorage.setItem(
            "pa_current_user",
            JSON.stringify(currentUser)
        );

        openApp();

    }

}


/* =========================================================
   SYSTEM THEME
========================================================= */

window
    .matchMedia(
        "(prefers-color-scheme: dark)"
    )
    .addEventListener(
        "change",
        () => {

            const settings =
                JSON.parse(
                    localStorage.getItem(
                        "pa_settings"
                    ) || "{}"
                );

            if(
                settings.theme ===
                "system"
            ){

                applyTheme("system");

            }

        }
    );



/* =========================================================
   ASSISTIFY PWA RUNTIME
========================================================= */

(() => {
    "use strict";

    let deferredPrompt = null;

    const installButton = document.getElementById("installAppButton");
    const updateToast = document.getElementById("updateToast");
    const refreshButton = document.getElementById("refreshAppButton");

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt = event;
        installButton?.classList.remove("hidden");
    });

    installButton?.addEventListener("click", async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        await deferredPrompt.userChoice;

        deferredPrompt = null;
        installButton.classList.add("hidden");
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        installButton?.classList.add("hidden");
    });

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", async () => {
            try {
                const registration = await navigator.serviceWorker.register("./sw.js");

                const showUpdate = () => updateToast?.classList.remove("hidden");

                if (registration.waiting) showUpdate();

                registration.addEventListener("updatefound", () => {
                    const worker = registration.installing;
                    if (!worker) return;

                    worker.addEventListener("statechange", () => {
                        if (worker.state === "installed" && navigator.serviceWorker.controller) {
                            showUpdate();
                        }
                    });
                });

                refreshButton?.addEventListener("click", () => {
                    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
                });

                let refreshing = false;
                navigator.serviceWorker.addEventListener("controllerchange", () => {
                    if (refreshing) return;
                    refreshing = true;
                    window.location.reload();
                });
            } catch (error) {
                console.warn("Assistify service worker registration failed:", error);
            }
        });
    }
})();
