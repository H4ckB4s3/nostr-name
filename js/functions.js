document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const domain = urlParams.get('dcall');
  
  if (domain) {
    // Simulate natural typing behavior
    simulateTyping(domainInput, domain, () => {
      handleDomainInput();
      domainInput.focus();
    });
  }
});

// New function to simulate natural typing
function simulateTyping(input, text, callback) {
  let i = 0;
  input.value = ''; // Start empty
  input.focus();
  
  function typeCharacter() {
    if (i < text.length) {
      // Add next character
      input.value += text.charAt(i);
      
      // Trigger both input and keyup events
      const inputEvent = new Event('input', { bubbles: true });
      const keyupEvent = new Event('keyup', { bubbles: true });
      input.dispatchEvent(inputEvent);
      input.dispatchEvent(keyupEvent);
      
      i++;
      setTimeout(typeCharacter, 88 + Math.random() * 88); // Random typing speed
    } else {
      // Trigger final change event
      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);
      
      if (callback) callback();
    }
  }
  
  typeCharacter();
}

document.addEventListener('DOMContentLoaded', function() {
  // Handle both /?lookup=example.hns and /example.hns
  const urlParams = new URLSearchParams(window.location.search);
  let domain = urlParams.get('npub');
  
  // If no query param, check the pathname
  if (!domain && window.location.pathname !== '/') {
    domain = window.location.pathname.substring(1).replace(/\//g, '');
    
    // Clean the URL in browser history
    if (domain && !window.history.state) {
      window.history.replaceState({ cleaned: true }, '', '/?npub=' + domain);
    }
  }
  
  if (domain) {
    simulateTyping(domainInput, domain, () => {
      handleDomainInput();
      domainInput.focus();
    });
  }
});
