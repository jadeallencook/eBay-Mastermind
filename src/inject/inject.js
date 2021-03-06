// setup chrome extension
chrome.extension.sendMessage({}, (response) => {
	let loaded = 0,
		broken = false,
		badESN = [];
	var readyStateCheckInterval = setInterval(() => {
		if (document.readyState === 'complete') {
			if (loaded === 6) clearInterval(readyStateCheckInterval);
			// insert mastermind ui into ebay layout
			const container = document.querySelector('#LeftPanel');
			if (loaded == 0) container.innerHTML = '<h3 style="margin: 0px;">Average Price</h3><span id="mastermind-price">Loading...</span><br /><br />' + container.innerHTML;
			// for debugging purposes
			const debug = true;
			// make sure url is running plugin
			if (window.location.hash === '#mastermind') {
				// cache chrome storage
				const storage = chrome.storage.local;
				// get chrome storage data
				storage.get((data) => {
					if (debug) console.log('Mastermind: Getting average price for "' + data.search.join(' ') + '"');
					// cache all result elements
					const results = document.getElementsByClassName('sresult');
					// go over each result to get average
					let average = [];
					for (let result of results) {
						// build 
						let test = true;
						// get data from elements
						const title = result.getElementsByClassName('lvtitle')[0].innerText.toLowerCase();
						const price = parseFloat(result.getElementsByClassName('lvprice')[0].innerText.replace('$', ''));
						// reset bad esn param 
						badESN = [];
						// tests each word in title
						for (let word of data.search) {
							if (word === 'broken' || word === 'cracked') broken = true;
							word = word.toLowerCase();
							if (title.indexOf(word) === -1) {
								if (word === 'att' && title.indexOf('at&t') !== -1) {
									test = true;
								} else if (word === 'tmobile' && title.indexOf('t-mobile') !== -1) {
									test = true;
								} else {
									test = false;
									if (debug) console.error('REMOVED (Listing title didn\'t contain "' + word + '"): ' + title);
								}
							} else if (word === 'cracked') {
								if (title.indexOf('bad lcd') !== -1 || title.indexOf('broken display') !== -1) {
									test = false;
									if (debug) console.error('REMOVED (Cracked or broke LCD): ' + title);
								}
							}
							if (word === 'bad' || word === 'esn') badESN.push(word);
						}
						// test for multiple gigs
						let gbsInTitle = 0;
						for (let gb of ['16', '32', '64', '128', '256']) {
							if (title.indexOf(gb) !== -1) {
								gbsInTitle++;
							}
							if (gbsInTitle > 1) {
								test = false;
								if (debug) console.error('REMOVED (Title contain multiple gigs): ' + title);
							}
						}
						// check condition
						let condition = false;
						if (result.getElementsByClassName('lvsubtitle')[0]) {
							condition = result.getElementsByClassName('lvsubtitle');
							condition = condition[condition.length - 1].innerText.toLowerCase();
						}
						if (!condition || condition === 'brand new') {
							if (debug) console.error('REMOVED (Not in the right condition): ' + condition);
							test = false;
						}
						if (condition && !broken && condition === 'parts only' && badESN.length !== 2) {
							test = false;
							if (debug) console.error('REMOVED (Not in the right condition): ' + condition);
						}
						// spam filters
						if (price < 15) {
							test = false;
							if (debug) console.error('REMOVED (Price was way too low, we needed to cut it): $' + price);
						}
						// add to average array
						if (test) {
							if (debug) console.log('ADDED (Everything checked out): ' + title + ' selling for $' + price + ' with a condition of ' + condition);
							average.push(price);
						} else {
							result.remove();
						}
					}
					// calculate average from array
					let avgCount = 0,
						avgSum = 0;
					for (let num of average) {
						avgCount++;
						avgSum += num;
					}
					average = Math.floor(avgSum / avgCount);
					// output information
					var html = '';
					if (avgCount !== 0) {
						if (loaded < 6) html = '$' + average + ' out of ' + avgCount + ' device(s)';
						else html = '<span style="color: green;"><b>$' + average + '</b></span> out of <b>' + avgCount + '</b> device(s)';
					} else {
						html = 'Could not find any devices'
					}
					document.getElementById('mastermind-price').innerHTML = html;
					if (debug) console.log('Mastermind: ' + html);
					loaded++;
				});
			}
		}
	}, 1000);
});