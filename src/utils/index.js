/**
 *
 * @param {*} name  获取存储内容的name
 *
 */
export function getLocalStorage(name) {
  try {
    return JSON.parse(localStorage.getItem(name))
  } catch (error) {
    return ''
  }
}

export function setLocalStorage(name, value) {
  localStorage.setItem(name, JSON.stringify(value))
}

export function getSessionStorage(name) {
  try {
    return JSON.parse(sessionStorage.getItem(name))
  } catch (error) {
    return ''
  }
}

export function setSessionStorage(name, value) {
  sessionStorage.setItem(name, JSON.stringify(value))
}
