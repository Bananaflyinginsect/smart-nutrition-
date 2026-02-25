// home page
async function analyzeFruits() {
    try {
        const response = await fetch("https://www.fruityvice.com/api/fruit/all");
        const data = await response.json();

        const goal = document.getElementById("healthGoal").value;
        const container = document.getElementById("fruitDisplay");
        container.innerHTML = "";

        let maxSugar = 0;
        let maxSugarName = "";

        for (let i = 0; i < data.length; i++) {
            let f = data[i];
            let show = false;

            if (goal == "all") {
                show = true;
            }
            else if (goal == "cut" && f.nutritions.calories <= 60) {
                show = true;
            }
            else if (goal == "bulk" && f.nutritions.protein >= 1) {
                show = true;
            }
            else if (goal == "reduceSugar" && f.nutritions.sugar < 10) {
                show = true;
            }

            if (f.nutritions.sugar > maxSugar) {
                maxSugar = f.nutritions.sugar;
                maxSugarName = f.name;
            }

            if (show == true) {
                let card = '<div class="fruit-card">';
                card += '<h3>' + f.name + '</h3>';
                card += '<p>Calories: ' + f.nutritions.calories + '</p>';
                card += '<p>Sugar: ' + f.nutritions.sugar + 'g</p>';
                card += '<p>Protein: ' + f.nutritions.protein + 'g</p>';
                card += '<p>Fat: ' + f.nutritions.fat + 'g</p>';
                card += '<p>Carbs: ' + f.nutritions.carbohydrates + 'g</p>';
                card += '<button onclick="addToPlan(\'' + f.name + '\',' + f.nutritions.calories + ',' + f.nutritions.sugar + ',' + f.nutritions.protein + ',' + f.nutritions.fat + ',' + f.nutritions.carbohydrates + ')">+ Add</button>';
                card += '</div>';
                
                container.innerHTML = container.innerHTML + card;
            }
        }

        let sugarElement = document.getElementById("topSugarResult");
        if (sugarElement) {
            sugarElement.innerText = "Highest Sugar: " + maxSugarName + " (" + maxSugar + "g)";
        }

    } catch (error) {
        console.log("Cannot load fruits");
    }
}

// Add fruit to plan
function addToPlan(name, calories, sugar, protein, fat, carbs) {
    let records = localStorage.getItem("nutritionRecords");
    
    if (records == null) {
        records = [];
    } else {
        records = JSON.parse(records);
    }
    
    let found = false;
    for (let i = 0; i < records.length; i++) {
        if (records[i].fruitName == name) {
            records[i].quantity = records[i].quantity + 1;
            found = true;
            break;
        }
    }
    
    if (found == false) {
        let newFruit = {
            fruitName: name,
            quantity: 1,
            calories: calories,
            sugar: sugar,
            protein: protein,
            fat: fat,
            carbs: carbs
        };
        records.push(newFruit);
    }
    
    localStorage.setItem("nutritionRecords", JSON.stringify(records));
    
    let btn = event.target;
    btn.innerText = "Added!";
    setTimeout(function() {
        btn.innerText = "+ Add";
    }, 300);
}

// For old code compatibility
function storeFruit(name, calories, sugar) {
    addToPlan(name, calories, sugar, 0, 0, 0);
}

// plan page functions updated with all nutrients
function loadPlan() {
    let records = localStorage.getItem("nutritionRecords");
    
    if (records == null) {
        records = [];
    } else {
        records = JSON.parse(records);
    }
    
    let container = document.getElementById("planContainer");
    if (!container) {
        return;
    }
    
    container.innerHTML = "";

    if (records.length == 0) {
        container.innerHTML = "<p style='text-align:center; padding:30px;'>No fruits added yet</p>";
        
        let totalCalEl = document.getElementById("totalCal");
        let avgCalEl = document.getElementById("avgCal");
        
        if (totalCalEl) totalCalEl.innerText = "Total: 0";
        if (avgCalEl) avgCalEl.innerText = "Average: 0";
        return;
    }

    let totalCalories = 0;
    
    for (let i = 0; i < records.length; i++) {
        let f = records[i];
        
        let totalCal = f.calories * f.quantity;
        let totalSugar = f.sugar * f.quantity;
        let totalProtein = f.protein * f.quantity;
        let totalFat = f.fat * f.quantity;
        let totalCarbs = f.carbs * f.quantity;
        
        totalCalories = totalCalories + totalCal;
        
        let card = '<div class="plan-card">';
        card += '<h4>' + f.fruitName + '</h4>';
        card += '<p>Quantity: ' + f.quantity + '</p>';
        card += '<p>Calories: ' + totalCal + '</p>';
        card += '<p>Total Sugar: ' + totalSugar.toFixed(1) + 'g</p>';
        card += '<p>Total Protein: ' + totalProtein.toFixed(1) + 'g</p>';
        card += '<p>Total Fat: ' + totalFat.toFixed(1) + 'g</p>';
        card += '<p>Total Carbs: ' + totalCarbs.toFixed(1) + 'g</p>';
        card += '<div>';
        card += '<button onclick="editQuantity(' + i + ')">Edit</button> ';
        card += '<button onclick="deleteFruit(' + i + ')" style="background:#b33;">Delete</button>';
        card += '</div></div>';
        
        container.innerHTML = container.innerHTML + card;
    }

    let avgCalories = totalCalories / records.length;
    
    let totalCalEl = document.getElementById("totalCal");
    let avgCalEl = document.getElementById("avgCal");
    
    if (totalCalEl) totalCalEl.innerText = "Total: " + totalCalories;
    if (avgCalEl) avgCalEl.innerText = "Average: " + avgCalories.toFixed(1);
}

// Edit quantity - fill form
function editQuantity(i) {
    let records = JSON.parse(localStorage.getItem("nutritionRecords"));
    
    let nameField = document.getElementById("editName");
    let qtyField = document.getElementById("editQuantity");
    
    if (nameField) nameField.value = records[i].fruitName;
    if (qtyField) qtyField.value = records[i].quantity;
    
    localStorage.setItem("editingIndex", i);
}

// Update quantity after edit
function updateQuantity() {
    let records = JSON.parse(localStorage.getItem("nutritionRecords"));
    let index = localStorage.getItem("editingIndex");
    
    if (index == null) {
        return;
    }
    
    let qtyField = document.getElementById("editQuantity");
    let newQty = qtyField.value;
    
    if (newQty == "") {
        return;
    }
    
    newQty = parseInt(newQty);
    if (newQty < 1) newQty = 1;
    
    records[index].quantity = newQty;
    
    localStorage.setItem("nutritionRecords", JSON.stringify(records));
    
    document.getElementById("editName").value = "";
    document.getElementById("editQuantity").value = "";
    
    localStorage.removeItem("editingIndex");
    
    loadPlan();
}

// delete fruit
function deleteFruit(i) {
    let records = JSON.parse(localStorage.getItem("nutritionRecords"));
    records.splice(i, 1);
    localStorage.setItem("nutritionRecords", JSON.stringify(records));
    loadPlan();
}

window.analyzeFruits = analyzeFruits;
window.addToPlan = addToPlan;
window.storeFruit = storeFruit;
window.loadPlan = loadPlan;
window.editQuantity = editQuantity;
window.updateQuantity = updateQuantity;
window.deleteFruit = deleteFruit;

if (window.location.href.indexOf("recommend") > -1) {
    window.onload = loadPlan;
}