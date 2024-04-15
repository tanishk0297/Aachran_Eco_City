const Airtable = require('airtable');
const base = new Airtable({ apiKey: 'patfV0JYulSU9DOcp.08809586e440b983a0b352100b784d46a6b1532fa1a9b4eef0d943fcc819d695' }).base('appX0bF1xKYfzn8rA');

function fetchDonations() {
    const donationsArray = []; // Array to store donation details

    base('Donations').select({
        maxRecords: 10,
        view: 'Grid view'
    }).eachPage((records, fetchNextPage) => {
        records.forEach((record) => {
            const donorName = record.get('Donor Name');
            const donatedAmount = record.get('Donated Amount');
            const date = new Date(record.get('Date')).toLocaleString();

            // Log donation details to the console
            console.log('Donor Name:', donorName);
            console.log('Donated Amount:', donatedAmount);
            console.log('Date:', date);
            console.log('---');

            // Push donation details to the array
            donationsArray.push({
                donorName: donorName,
                donatedAmount: donatedAmount,
                date: date
            });
        });

        fetchNextPage();
    }, (err) => {
        if (err) {
            console.error('Error fetching donations:', err);
            return;
        }

        // Reverse the array of donation details
        const reversedDonationsArray = donationsArray.reverse();

        // Print reversed donation details to the console
        reversedDonationsArray.forEach((donation) => {
            console.log('Donor Name:', donation.donorName);
            console.log('Donated Amount:', donation.donatedAmount);
            console.log('Date:', donation.date);
            console.log('---');
        });

        // Append reversed list items to donations list
        const donationsList = document.getElementById('donations-list');
        reversedDonationsArray.forEach((donation) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${donation.donorName} ने ₹${donation.donatedAmount} का दान किया।`;
            donationsList.appendChild(listItem);
        });
    });
}



function fetchExpenditures() {
    const expendituresArray = []; // Array to store expenditure details

    base('Expenditures').select({
        maxRecords: 10,
        view: 'Grid view'
    }).eachPage((records, fetchNextPage) => {
        records.forEach((record) => {
            const item = record.get('Work Done');
            const amount = record.get('Expenditure Amount');
            const datee = new Date(record.get('Date')).toLocaleString();

            // Log expenditure details to the console
            console.log('Work Done:', item);
            console.log('Expenditure Amount:', amount);
            console.log('Date:', datee);
            console.log('---');

            // Push expenditure details to the array
            expendituresArray.push({
                item: item,
                amount: amount,
                date: datee
            });
        });

        fetchNextPage();
    }, (err) => {
        if (err) {
            console.error('Error fetching expenditures:', err);
            return;
        }

        // Reverse the array of expenditure details
        const reversedExpendituresArray = expendituresArray.reverse();

        // Print reversed expenditure details to the console
        reversedExpendituresArray.forEach((expenditure) => {
            console.log('Work Done:', expenditure.item);
            console.log('Expenditure Amount:', expenditure.amount);
            console.log('Date:', expenditure.datee);
            console.log('---');
        });

        // Append reversed list items to expenditures list
        const expendituresList = document.getElementById('expenditures-list');
        reversedExpendituresArray.forEach((expenditure) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${expenditure.item} के लिए ₹${expenditure.amount} का व्यय हुआ ${expenditure.date} को।`;

            expendituresList.appendChild(listItem);
        });
    });
}


function addDonation(description, amount) {
    base('Donations').create({
        "Donor Name": description,
        "Donated Amount": amount
    }, function(err, record) {
        if (err) {
            console.error('Error adding donation:', err);
            return;
        }
        console.log('New donation record created with ID:', record.getId());
        // Optionally, update the UI
    });
}

function addExpenditure(description, amount) {
    base('Expenditures').create({
        "Work Done": description,
        "Expenditure Amount": amount
    }, function(err, record) {
        if (err) {
            console.error('Error adding expenditure:', err);
            return;
        }
        console.log('New expenditure record created with ID:', record.getId());
        // Optionally, update the UI
    });
}

// Event listener for form submission
document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission behavior

    var description = document.getElementById('description').value;
    var amount = parseFloat(document.getElementById('amount').value);
    var type = event.submitter.id === 'add-donation' ? 'donation' : 'expenditure';

    if (type === 'donation') {
        addDonation(description, amount);
    } else {
        addExpenditure(description, amount);
    }

    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
});
// Total Budget
async function calculateTotalBudget() {
    let totalDonations = 0;
    let totalExpenditures = 0;

    // Fetch donations and expenditures concurrently
    await Promise.all([
        new Promise((resolve, reject) => {
            base('Donations').select({
                fields: ['Donated Amount']
            }).eachPage((records, fetchNextPage) => {
                records.forEach((record) => {
                    const amount = record.get('Donated Amount');
                    totalDonations += amount || 0; // Handle cases where amount is undefined
                });
                fetchNextPage();
            }, (err) => {
                if (err) {
                    console.error('Error fetching donations:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        }),
        new Promise((resolve, reject) => {
            base('Expenditures').select({
                fields: ['Expenditure Amount']
            }).eachPage((records, fetchNextPage) => {
                records.forEach((record) => {
                    const amount = record.get('Expenditure Amount');
                    totalExpenditures += amount || 0; // Handle cases where amount is undefined
                });
                fetchNextPage();
            }, (err) => {
                if (err) {
                    console.error('Error fetching expenditures:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
    ]);

    // Calculate total budget
    const totalBudget = totalDonations - totalExpenditures;

    return totalBudget;
}


async function updateTotalBudget() {
    try {
        // Calculate total budget
        const totalBudget = await calculateTotalBudget();
        
        // Update budget element on the HTML page
        document.getElementById('budget-amount').textContent = totalBudget.toFixed(2);
    } catch (error) {
        console.error('Error updating total budget:', error);
        // Optionally, handle the error (e.g., display an error message on the page)
    }
}
// Clear Data .........................
document.addEventListener('DOMContentLoaded', function() {
    // Select the clear donations button
    const clearDonationsButton = document.getElementById('clear-donations');

    // Add click event listener to the clear donations button
    clearDonationsButton.addEventListener('click', function() {
        // Ask for confirmation
        if (confirm("क्या आप वाकई सभी दान साफ करना चाहते हैं? यह क्रिया पूरी तरह से पूर्वानुमान नहीं की जा सकती।")) {
            if (confirm("यह कार्रवाई सभी दान रिकॉर्ड को स्थायी रूप से हटा देगी। क्या आप वाकई पूरी तरह से सुनिश्चित हैं?")) {
                // Airtable से दान साफ करने के लिए एक फ़ंक्शन को कॉल करें
                clearDonations();
            }
        }
        
            
        
    });

    // Function to clear donations from Airtable
   // Function to clear donations from Airtable
function clearDonations() {
    base('Donations').select({
        view: 'Grid view' // Specify the view if needed
    }).eachPage(function page(records, fetchNextPage) {
        // Iterate over each donation record and delete it
        records.forEach(function(record) {
            base('Donations').destroy(record.getId(), function(err, deletedRecord) {
                if (err) {
                    console.error('Error deleting donation record:', err);
                    return;
                }
                console.log('Deleted donation record:', deletedRecord.id);
            });
        });

        // Fetch the next page of records if available
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Error fetching donations:', err);
            return;
        }
        // After all donation records are deleted, display success message
        alert("All donations cleared successfully!");
        // Optionally, you can refresh the page or update the UI as needed
    });
}


    // Select the clear expenditures button
    const clearExpendituresButton = document.getElementById('clear-expenditures');

    // Add click event listener to the clear expenditures button
    clearExpendituresButton.addEventListener('click', function() {
        // Ask for confirmation
        if (confirm("क्या आप वाकई सभी व्यय साफ करना चाहते हैं? यह क्रिया पूरी तरह से पूर्वानुमान नहीं की जा सकती।")) {
            if (confirm("यह कार्रवाई सभी व्यय रिकॉर्ड को स्थायी रूप से हटा देगी। क्या आप वाकई पूरी तरह से सुनिश्चित हैं?")) {
                // Airtable से व्यय साफ करने के लिए एक फ़ंक्शन को कॉल करें
                clearExpenditures();
            }
        }
        
    });

    // Function to clear expenditures from Airtable
   // Function to clear expenditures from Airtable
function clearExpenditures() {
    base('Expenditures').select({
        view: 'Grid view' // Specify the view if needed
    }).eachPage(function page(records, fetchNextPage) {
        // Iterate over each expenditure record and delete it
        records.forEach(function(record) {
            base('Expenditures').destroy(record.getId(), function(err, deletedRecord) {
                if (err) {
                    console.error('Error deleting expenditure record:', err);
                    return;
                }
                console.log('Deleted expenditure record:', deletedRecord.id);
            });
        });

        // Fetch the next page of records if available
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Error fetching expenditures:', err);
            return;
        }
        // After all expenditure records are deleted, display success message
        alert("All expenditures cleared successfully!");
        // Optionally, you can refresh the page or update the UI as needed
    });
}

});



fetchDonations();
fetchExpenditures();
updateTotalBudget();