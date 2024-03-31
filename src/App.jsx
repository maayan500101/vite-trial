function App() {
  const iframeUrl = import.meta.env.VITE_IFRAME_URL;

  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  const createToken = async (payload, secretKey) => {
    const header = {
      alg: "HS256",
      typ: "JWT",
    };

    const encodedHeader = utf8ToBase64(JSON.stringify(header));
    const encodedPayload = utf8ToBase64(JSON.stringify(payload));

    const encodedToken = `${encodedHeader}.${encodedPayload}`
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const secretKeyBuffer = new TextEncoder().encode(secretKey);
    const cryptoKeyPromise = window.crypto.subtle.importKey(
      "raw",
      secretKeyBuffer,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );

    try {
      const cryptoKey = await cryptoKeyPromise;
      const signatureBuffer = await window.crypto.subtle.sign(
        { name: "HMAC", hash: { name: "SHA-256" } },
        cryptoKey,
        new TextEncoder().encode(encodedToken)
      );

      const signature = String.fromCharCode.apply(
        null,
        new Uint8Array(signatureBuffer)
      );
      const encodedSignature = btoa(signature);

      return `${encodedToken}.${encodedSignature}`
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    } catch (error) {
      console.error("Error signing the token:", error);
      throw error;
    }
  };

  const loadFunction = async () => {
    const secret = import.meta.env.VITE_SECRET;
    const currentHourDate = `${new Date()
      .toISOString()
      .split("T")[0]
      .replaceAll("-", "")}T${new Date().toTimeString().split(":")[0]}`;

    const token = await createToken(
      JSON.parse(import.meta.env.VITE_PAYLOAD),
      secret + currentHourDate
    );

    // console.log(token, secret + currentHourDate);

    document
      .querySelector("iframe")
      .contentWindow.postMessage(token, iframeUrl);
  };

  return (
    <iframe
      style={{ width: "81vw", height: "91vh" }}
      id="target_website"
      src={iframeUrl}
      onLoad={loadFunction}
    ></iframe>
  );
}

export default App;
