/**
 * Sends JSON or FormData to an API route and normalises every outcome into
 * { ok, data, errors, message } so forms only need one way of handling results.
 */
export async function submitJson(url, body, method = "POST") {
  return request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function submitForm(url, formData, method = "POST") {
  // Do not set Content-Type: the browser adds the multipart boundary itself.
  return request(url, { method, body: formData });
}

export async function sendAction(url, method, body) {
  return request(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function request(url, options) {
  try {
    const res = await fetch(url, { credentials: "same-origin", ...options });
    let data = null;
    try {
      data = await res.json();
    } catch {
      /* non-JSON response */
    }

    if (res.ok) return { ok: true, data: data || {}, errors: {}, message: "" };

    if (res.status === 429) {
      return { ok: false, data, errors: {}, message: data?.error || "Too many attempts. Please wait and try again." };
    }
    return {
      ok: false,
      data,
      errors: data?.errors || {},
      message: data?.error || (data?.errors ? "" : "Something went wrong. Please try again."),
    };
  } catch {
    return {
      ok: false,
      data: null,
      errors: {},
      message: "We could not reach the server. Check your internet connection and try again.",
    };
  }
}
