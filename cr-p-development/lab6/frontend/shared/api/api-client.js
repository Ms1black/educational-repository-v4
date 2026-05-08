window.FSD = window.FSD || {};
window.FSD.shared = window.FSD.shared || {};
window.FSD.shared.api = window.FSD.shared.api || {};

window.FSD.shared.api.API_URL = "./api.php";

window.FSD.shared.api.request = async function request(action, payload, method, dict) {
  const isGet = method === "GET";
  const url = isGet
    ? `${window.FSD.shared.api.API_URL}?action=${encodeURIComponent(action)}`
    : window.FSD.shared.api.API_URL;
  const options = { method, credentials: "same-origin" };

  if (!isGet) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify({ action, ...payload });
  }

  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || !data || !data.ok) {
    throw new Error((data && data.error) || dict.msgRequestError);
  }
  return data;
};

window.FSD.shared.api.requestFormData = async function requestFormData(formData, dict) {
  const response = await fetch(window.FSD.shared.api.API_URL, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok || !data || !data.ok) {
    throw new Error((data && data.error) || dict.msgRequestError);
  }
  return data;
};
