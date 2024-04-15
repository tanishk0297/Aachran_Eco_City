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
            listItem.textContent = `${donation.donorName} ने ₹${donation.donatedAmount} का दान किया, तारीख: ${donation.date}।`;
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





// Event listener for form submission

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


fetchDonations();
fetchExpenditures();
updateTotalBudget();