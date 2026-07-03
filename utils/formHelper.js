export function setHelper(element, message) {
  if (!element) return;

  element.textContent = message;
  element.className = message ? "helper-text error" : "helper-text";
}

export function clearHelpers(...elements) {
  elements.forEach((element) => setHelper(element, ""));
}

export function setMessage(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.className = type ? `message ${type}` : "message";
}