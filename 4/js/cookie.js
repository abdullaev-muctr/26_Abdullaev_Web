function setCookie(name, value, days) {
  if (typeof days === "undefined") days = 30;
  let date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + ";expires=" + date.toUTCString() + ";path=/;SameSite=Lax";
}

function getCookie(name) {
  let prefix = encodeURIComponent(name) + "=";
  let parts = document.cookie.split(";");
  for (let i = 0; i < parts.length; i++) {
    let c = parts[i].trim();
    if (c.indexOf(prefix) === 0) return decodeURIComponent(c.substring(prefix.length));
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = encodeURIComponent(name) + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax";
}

function saveJSON(name, data, days) {
  try {
    setCookie(name, JSON.stringify(data), days);
    return true;
  } catch (e) {
    console.error("cookie.js: ошибка сериализации —", e);
    return false;
  }
}

function loadJSON(name) {
  let raw = getCookie(name);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("cookie.js: ошибка парсинга —", e);
    return null;
  }
}