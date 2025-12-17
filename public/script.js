let number = document.getElementById('number');
let b_token = document.getElementById('b_token');
let btn = document.getElementById('btn');
let btnText = document.getElementById('btnText');
let spinner2 = document.querySelector(".spinner2");
let days = document.getElementById('days');
let t_coin = document.getElementById('t_coin');
let t_bom = document.getElementById('t_bom');
const countdownEl = document.getElementById("countdown");
const sun = document.getElementById("sun");
const db_color = document.getElementById('db_color');

window.onload = () => {
  const hour = new Date().getHours();
  if (hour >= 18 || hour < 6) {
    sun.innerText = "🌙";
 //   document.body.classList.add('dark');
  } else {
    sun.innerText = "☀️";
//    document.body.classList.remove('dark');
  }
};

btn.addEventListener('click', () => {
  if (number.value.length <= 10) {
    alert('Number length must be 11');
    return;
  }
  if (!number.value.startsWith("01")) {
    alert('Number must start with 01');
    return;
  }
  let isSolved = bdCaptcha.isCaptchaSolved();
  let captchaToken = bdCaptcha.getCaptchaToken(300);
  if (isSolved) {
    spinner2.style.display = 'block';
    btnText.innerText = 'Attacking...';
    setTimeout(() => {
      req(number.value, captchaToken);
      number.value = '';
    }, 1000);
  } else {
    alert('Please captcha solv first');
  }
});
var timer;
var endTime = new Date(days.value.replace(" ", "T")).getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = endTime - now;
  if (distance <= 0) {
    countdownEl.textContent = "Expired";
    clearInterval(timer);
    return;
  }
  const d = Math.floor(distance / (1000 * 60 * 60 * 24));
  const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((distance % (1000 * 60)) / 1000);
  countdownEl.textContent = `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

updateCountdown();
timer = setInterval(updateCountdown, 1000);

async function req(phone, token) {
  try {
    const res = await fetch(`api.php?number=${encodeURIComponent(phone)}&captcha_token=${encodeURIComponent(token)}&p=${encodeURIComponent(b_token.value)}`);
    if (res.status == 200) {
      playSong();
      const data = await res.json();
      if (data && data.status === true) {
        t_coin.innerText = `💰 ${data.current_coin}`;
        t_bom.innerText = `💣 ${data.total_bom}`;
        alert(data.msg);
      } else {
        alert(data.msg);
        console.log(data);
      }
    } else {
      console.log(res.status);
    }
  } catch (error) {
    console.log(error);
  } finally {
    btnText.innerText = '🚀 ATTACK AGAIN?';
    spinner2.style.display = 'none';
  }
}

async function getWeather() {
  const apiUrl = "http://api.weatherapi.com/v1/forecast.json?key=31d2f6565ce94d958d7143927253007&q=Dhaka&days=1&aqi=no&alerts=no";
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const temp_c = data?.current?.temp_c ?? "--";
    const conditionText = data?.current?.condition?.text ?? "Unknown";
    document.getElementById('temp_c').innerText = `${temp_c}°C | ${conditionText}`;
    if(!setThemeByFriday()) {
    let bgColor = "linear-gradient(to right, #0f172a, #1e293b)";
    switch (conditionText) {
      case "Sunny":
      case "Clear": bgColor = "linear-gradient(to right bottom, #facc15, #fde047)"; break;
      case "Partly Cloudy": bgColor = "linear-gradient(to right bottom, #fcd34d, #fef08a)"; break;
      case "Cloudy": bgColor = "linear-gradient(to right bottom, #94a3b8, #64748b)"; break;
      case "Overcast": bgColor = "linear-gradient(to right bottom, #334155, #475569)"; break;
      case "Moderate rain": bgColor = "linear-gradient(to right bottom, #3b82f6, #2563eb)"; break;
      case "Light rain":
      case "Patchy rain possible": bgColor = "linear-gradient(to right bottom, #60a5fa, #93c5fd)"; break;
      case "Heavy rain": bgColor = "linear-gradient(to right bottom, #2563eb, #1d4ed8)"; break;
      case "Thundery outbreaks possible": bgColor = "linear-gradient(to right bottom, #1e3a8a, #312e81)"; break;
      case "Moderate or heavy rain with shower": bgColor = "linear-gradient(to right bottom, #1e40af, #4338ca)"; break;
      case "Light rain shower": bgColor = "linear-gradient(to right bottom, #60a5fa, #64748b)"; break;
    }
    setRootTheme(bgColor);
    }
  } catch (err) {
    console.log(err);
    setRootTheme("linear-gradient(to right, #0f172a, #1e293b)");
  }
}

// function setRootTheme(bgColor) {
//  document.documentElement.style.setProperty('--bg-color', bgColor);
//}

function setRootTheme(bgColor) {
  const hour = new Date().getHours();
  document.body.classList.add('dark');
  if (hour >= 18 || hour < 6) {
    document.documentElement.style.setProperty('--bg-color', 'black');
  } else {
    document.documentElement.style.setProperty('--bg-color', bgColor);
  }
}
getWeather();
 function setThemeByFriday() {
  const today = new Date().getDay();
  if (today === 5) {
    setRootTheme("green");
    const messageEl = document.getElementById("jummaMessage");
    if (messageEl) {
      messageEl.style.display = "block";
      messageEl.innerText = "🌙 Happy Jumma Mubarak! 🌙";
    }
    return true;
  }
  if (typeof db_color !== "undefined" && db_color.value) {
    if (db_color.value === "r_dark") {
      document.body.classList.remove("dark");
    } else if (db_color.value !== "") {
      setRootTheme(db_color.value);
    }
    return true;
  }
  return false;
}

    function playSong() {
        const audio = new Audio("music.mp3");
      audio.loop = false;
      audio.play();
}
    