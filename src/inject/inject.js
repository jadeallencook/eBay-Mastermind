// setup chrome extension
chrome.extension.sendMessage({}, function (response) {
	var readyStateCheckInterval = setInterval(function () {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);
			// make sure url is running plugin
			if (window.location.hash === '#mastermind') {
				// insert mastermind ui into ebay layout
				const container = document.querySelector('#e1-12 > div.rlp-h');
				container.innerHTML = '<h3>Average Price</h3><br /><span id="mastermind-price">Loading...</span><br /><br />' + container.innerHTML;
				// cache chrome storage
				const storage = chrome.storage.local;
				// get chrome storage data
				storage.get((data) => {
					console.log('Mastermind: Getting average price for "' + data.search.join(' ') + '"')
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
						// check condition
						let condition = false;
						if (result.getElementsByClassName('lvsubtitle')[0]) {
							condition = result.getElementsByClassName('lvsubtitle');
							condition = condition[condition.length - 1].innerText.toLowerCase();
						}
						if (!condition || condition === 'brand new' || condition === 'parts only') {
							if (!condition) condition = 'no condition was found on listing'
							console.error('REMOVED (Not in the right condition): ' + condition);
							test = false;
						}
						// tests each word in title
						for (let word of data.search) {
							word = word.toLowerCase();
							if (title.indexOf(word) === -1) {
								test = false;
								console.error('REMOVED (Listing title didn\'t contain "' + word + '"): ' + title);
							}
						}
						// spam filters
						if (price < 5) {
							test = false;
							console.error('REMOVED (Price was way too low, we needed to cut it): $' + price);
						}
						// add to average array
						if (test) {
							console.log('ADDED (Everything checked out): ' + title + ' selling for $' + price + ' with a condition of ' + condition);
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
					document.getElementById('mastermind-price').innerText = '$' + average + ' out of ' + avgCount + ' device(s)';
					console.log('Mastermind: Average price device is $' + average + ' out of ' + avgCount + ' device(s)');
				});
			}
		}
	}, 10);
});