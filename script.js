let price = 1.87;
let cid = [
  ['PENNY', 1.01],
  ['NICKEL', 2.05],
  ['DIME', 3.1],
  ['QUARTER', 4.25],
  ['ONE', 90],
  ['FIVE', 55],
  ['TEN', 20],
  ['TWENTY', 60],
  ['ONE HUNDRED', 100]
]; 

let totalPriceElement = document.getElementById('total-price');
let btn1 = document.getElementById('btn1');
let btn2 = document.getElementById('btn2');
let btn3 = document.getElementById('btn3');
let purchaseBtn = document.getElementById('purchase-btn');
let cashInput = document.getElementById('cash');
let changeDueElement = document.getElementById('change-due');
let cidElement = document.getElementById('cid');

let value1Price = parseFloat(document.getElementById('value1').textContent.replace('$', ''));
let value2Price = parseFloat(document.getElementById('value2').textContent.replace('$', ''));
let value3Price = parseFloat(document.getElementById('value3').textContent.replace('$', ''));

price = 0;

function updateTotal() {
    totalPriceElement.textContent = `Total Price: $${price.toFixed(2)}`;
}

// Helper function to add to total
function addToCart(itemPrice) {
    price += itemPrice; // Update the price variable
    updateTotal();      // Update the display
}

// Event listeners for "Add to Cart" buttons
btn1.addEventListener('click', () => addToCart(value1Price));
btn2.addEventListener('click', () => addToCart(value2Price));
btn3.addEventListener('click', () => addToCart(value3Price));

// Function to update the cash in drawer display
function updateCidDisplay() {
    cidElement.textContent = `Cash in Drawer: ${JSON.stringify(cid)}`;
}

// Event listener for the purchase button
purchaseBtn.addEventListener('click', () => {
    let cashValue = parseFloat(cashInput.value);

    // Ensure we have a valid cash value
    if (isNaN(cashValue) || cashValue < 0) {
        alert("Please enter a valid amount of cash.");
        return;
    }

    // Convert cashValue and price to cents to avoid floating point issues
    let priceInCents = Math.round(price * 100);
    let cashValueInCents = Math.round(cashValue * 100);

    // Check if cash input is less than the price
    if (cashValueInCents < priceInCents) {
        alert("Customer does not have enough money to purchase the item");
        changeDueElement.textContent = ''; // Clear previous messages
    } 
    // Check if cash input is equal to the price
    else if (cashValueInCents === priceInCents) {
        changeDueElement.textContent = "No change due - customer paid with exact cash";
        updateCidDisplay(); // Update the cash in drawer display
    } 
    // If cash input is greater than the price, calculate change
    else {
        let changeDueInCents = cashValueInCents - priceInCents;
        let totalCidInCents = Math.round(getTotalCid() * 100);

        // Check if total cash in drawer is less than change due
        if (totalCidInCents < changeDueInCents) {
            changeDueElement.textContent = "Status: INSUFFICIENT_FUNDS";
        } else {
            let changeMessage = calculateChange(changeDueInCents);

            // Check if total cash in drawer is equal to change due
            if (totalCidInCents === changeDueInCents) {
                changeDueElement.textContent = `Status: CLOSED ${changeMessage}`;
                updateCidAfterPurchase(changeDueInCents);  // Update cid after purchase is completed
            } else {
                // If the cash drawer can provide the exact change
                if (changeMessage === "Status: INSUFFICIENT_FUNDS") {
                    changeDueElement.textContent = changeMessage;
                } else {
                    changeDueElement.textContent = `Status: OPEN ${changeMessage}`;
                    updateCidAfterPurchase(changeDueInCents);  // Update cid after purchase is completed
                }
            }
        }
    }
    // Update the cash in drawer display after every purchase
    updateCidDisplay();
});

// Function to get the total cash in the drawer (cid)
function getTotalCid() {
    return cid.reduce((total, coin) => total + coin[1], 0);
}

// Function to update the cash in drawer (cid) after a purchase
function updateCidAfterPurchase(changeDueInCents) {
    let sortedCid = cid.slice().sort((a, b) => denomValue[b[0]] - denomValue[a[0]]);
    for (let i = 0; i < sortedCid.length; i++) {
        let coinName = sortedCid[i][0];
        let coinValueInCents = Math.round(denomValue[coinName] * 100);
        let availableAmountInCents = Math.round(sortedCid[i][1] * 100);

        // Subtract change from cash in drawer
        while (changeDueInCents >= coinValueInCents && availableAmountInCents > 0) {
            changeDueInCents -= coinValueInCents;
            availableAmountInCents -= coinValueInCents;
        }

        // Ensure that the available amount doesn't go negative
        sortedCid[i][1] = Math.max(availableAmountInCents / 100, 0);
    }

    // Update the global CID with the modified values
    cid = sortedCid;
}

// Function to calculate change and format the output
function calculateChange(changeDueInCents) {
    let changeDetails = [];
    let totalCidInCents = Math.round(getTotalCid() * 100);

    // Sort denominations from highest to lowest
    let sortedCid = cid.slice().sort((a, b) => denomValue[b[0]] - denomValue[a[0]]);

    for (let i = 0; i < sortedCid.length; i++) {
        let coinName = sortedCid[i][0];
        let coinValueInCents = Math.round(denomValue[coinName] * 100);
        let availableAmountInCents = Math.round(sortedCid[i][1] * 100);
        let coinAmountInCents = 0;

        // Calculate how much of this coin can be used to give change
        while (changeDueInCents >= coinValueInCents && availableAmountInCents > 0) {
            changeDueInCents -= coinValueInCents;
            coinAmountInCents += coinValueInCents;
            availableAmountInCents -= coinValueInCents; // Decrease cash in drawer value
        }

        if (coinAmountInCents > 0) {
            changeDetails.push(`${coinName}: $${(coinAmountInCents / 100).toFixed(2)}`); // Add to change details
        }
    }

    // If there's still change due, we can't provide it
    if (changeDueInCents > 0) {
        return "Status: INSUFFICIENT_FUNDS";
    }

    // Prepare the final message
    return changeDetails.join(' ');
}

// Denomination values for easy reference
const denomValue = {
    "PENNY": 0.01,
    "NICKEL": 0.05,
    "DIME": 0.1,
    "QUARTER": 0.25,
    "ONE": 1.0,
    "FIVE": 5.0,
    "TEN": 10.0,
    "TWENTY": 20.0,
    "ONE HUNDRED": 100.0
};

// Initialize the display of total and cash in drawer
updateTotal();
updateCidDisplay();