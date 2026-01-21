chrome.commands.onCommand.addListener((command) => {
  if (command === "trash-photo") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: trashPhotoAndConfirm
      });
    });
  }
});

function trashPhotoAndConfirm() {
  function deepQuerySelectorAll(root, selector) {
    let elements = Array.from(root.querySelectorAll(selector));
    const shadowHosts = Array.from(root.querySelectorAll('*')).filter(el => el.shadowRoot);
    for (const host of shadowHosts) {
      elements = elements.concat(deepQuerySelectorAll(host.shadowRoot, selector));
    }
    return elements;
  }

  function clickButtonWithText(targetText) {
    const allButtons = deepQuerySelectorAll(document, 'button');
    for (const btn of allButtons) {
      const text = btn.innerText?.trim().toLowerCase();
      if (text === targetText.toLowerCase()) {
        btn.click();
        return true;
      }
    }
    return false;
  }

  function clickDeleteAndConfirm() {
    const allButtons = deepQuerySelectorAll(document, 'button');
    const deleteButton = allButtons.find((btn) => {
      const label = btn.getAttribute('aria-label') || btn.title || '';
      return label.toLowerCase().includes('delete') || label.toLowerCase().includes('trash') || label.toLowerCase().includes('bin');
    });

    if (deleteButton) {
      deleteButton.click();
      // Wait for modal to appear, then confirm
      setTimeout(() => {
        const success = clickButtonWithText("move to trash");
        if (!success) {
          console.warn("Could not find 'Move to trash' confirmation.");
        }
      }, 500); // delay may be adjusted if needed
    } else {
      alert("Delete button not found — ensure you're viewing a single photo.");
    }
  }

  clickDeleteAndConfirm();
}
