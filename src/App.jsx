function App(){
  console.log(import.meta.env)
  const iframeUrl = import.meta.env.VITE_IFRAME_URL  

  const createToken = async (payload, secretKey) => {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };
  
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
  
    const encodedToken = `${encodedHeader}.${encodedPayload}`;
  
    const secretKeyBuffer = new TextEncoder().encode(secretKey);
    const cryptoKeyPromise = window.crypto.subtle.importKey(
      'raw',
      secretKeyBuffer,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );
  
  
    try {
      const cryptoKey = await cryptoKeyPromise;
      const signatureBuffer = await window.crypto.subtle.sign(
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        cryptoKey,
        new TextEncoder().encode(encodedToken)
      );
  
      const signature = String.fromCharCode.apply(null, new Uint8Array(signatureBuffer));
      const encodedSignature = btoa(signature);
  
      return `${encodedToken}.${encodedSignature}`;
    } catch (error) {
      console.error('Error signing the token:', error);
      throw error; 
    }
  };


  const loadFunction = async() => {
      const secret =  import.meta.env.VITE_SECRET;
      const currentHourDate = `${(new Date().toISOString().split("T")[0]).replaceAll("-", "")}T${(new Date()).toTimeString().split(":")[0]}`;
      const token =  await createToken({
        "cityId": 107,
        "journal": "allHospitals",
        "isAdmin": true
      } , secret + currentHourDate);

      console.log(secret + currentHourDate, token);

      document.querySelector("iframe").contentWindow.postMessage(token , iframeUrl);
  }
   
  return  <iframe
  style={{width:"70vw", height: "90vh"}}
  id="target_website"
  src={iframeUrl}
  onLoad={loadFunction}
>
</iframe>
}

export default App
