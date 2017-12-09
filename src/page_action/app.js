(() => {
  // add event to appraisal button
  document.getElementById('appraisal').addEventListener('click', () => {
    // get phone from search box
    const search = document.getElementById('phone').value,
      searchArray = search.split(' ');
    // add other options to search array 
    
    // add search options to google storage
    const storage = chrome.storage.local;
    storage.set({
      search: searchArray
    });
    // open new tab with search criteria
    chrome.tabs.create({
      url: 'https://www.ebay.com/sch/i.html?_nkw=' + search + '&LH_Sold=1#mastermind'
    });
  });
})();