// @ts-nocheck
// Chrome Extension Content Script for extracting job listing details
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobDetails') {
    const pageTitle = document.title || ''
    const bodyText = document.body ? document.body.innerText.substring(0, 3000) : ''
    
    // Attempt DOM extractions
    const titleEl = document.querySelector('h1') || document.querySelector('.job-title')
    const companyEl = document.querySelector('.company-name') || document.querySelector('[data-company]')

    sendResponse({
      title: titleEl ? (titleEl as HTMLElement).innerText.trim() : pageTitle,
      company: companyEl ? (companyEl as HTMLElement).innerText.trim() : 'Detected Employer',
      location: 'Remote / US',
      url: window.location.href,
      description: bodyText,
    })
  }
})
