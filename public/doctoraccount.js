// An why html meal-toggle-popup-form logoutButton while fetching recommendations.
    // Toggle Profile Sidebar logout
    document.addEventListener('DOMContentLoaded', function () {
 
        fetch('/get-doctor-user')
          .then(response => response.json())
          .then(data => {
       //     console.log('Fetched username from server:', data.username, data.currentAccount, data.accountBallance, data.accountPhonenumber, data.accountEmail, data.invitationLink );
     const username = data.username;
     const email = data.email;
     const contact = data.contact;
     const username3 = data.username;
     
     function getInitials(username3) {
       // Split the username by spaces to handle multiple names
       const nameParts = username3.split(' ');
     
       // Initialize an empty string to hold the initials
       let initials = '';
     
       // If there is at least one name, take the first letter of the first name
       if (nameParts.length > 0) {
         initials += nameParts[0][0].toUpperCase();
       }
     
       // If there is a second name, take the first letter of the second name
       if (nameParts.length > 1) {
         initials += nameParts[1][0].toUpperCase();
       }
     
       // If there is a third name, take the first letter of the third name
       if (nameParts.length > 2) {
         initials += nameParts[2][0].toUpperCase();
       }
     
       return initials;
     }
     
     // Example usage
     const initials = getInitials(username3);
     
        // Set the initials as the textContent of a given element by ID
        document.getElementById('dpinnitials').textContent = initials;
        document.getElementById('navinitials').textContent = initials;
        document.getElementById('dashboard-heading').textContent = `Dr. ${username}`;
        document.getElementById('emailContent').textContent = `${email}`;
        document.getElementById('contactContent').textContent = `${contact}`;
        
    
          })
          .catch(error => {
            console.error('Error fetching username:', error);
            // Handle the error and maybe redirect to the login page showLoadingSpinner()
          });
      });



document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logout");

    logoutButton.addEventListener("click", () => {
        // Create modal overlay
        const modal = document.createElement("div");
        modal.classList.add("modal");
    
        // Create modal content container
        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");
    
        // Create the message element
        const message = document.createElement("p");
        message.textContent = "Are you sure you want to logout?";
    
        // Create a container for buttons in a row
        const buttonRow = document.createElement("div");
        buttonRow.classList.add("button-row");
    
        // Create confirm (logout) button
        const confirmButton = document.createElement("button");
        confirmButton.textContent = "Log Out";
        confirmButton.classList.add("logout-btn");
    
        // Create cancel button
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("cancel-btn");
    
        // Append buttons to the row
        buttonRow.appendChild(confirmButton);
        buttonRow.appendChild(cancelButton);
    
        // Append message and button row to modal content
        modalContent.appendChild(message);
        modalContent.appendChild(buttonRow);
        
        // Append modal content to modal overlay
        modal.appendChild(modalContent);
        
        // Append modal overlay to body
        document.body.appendChild(modal);
    
        // Show modal
        modal.style.display = "flex";
    
        // Cancel button: remove modal on click
        cancelButton.addEventListener("click", () => {
            modal.remove();
        });
    
        // Confirm button: perform logout action
        confirmButton.addEventListener("click", async () => {
            modal.remove(); // Remove modal from DOM
            try {
                const response = await fetch("/doctor_logout", { method: "GET" });
                if (response.ok) {
                    window.location.href = "/doctor_login"; // Redirect on successful logout
                } else {
                    console.error("Error during logout:", response.statusText);
                }
            } catch (error) {
                console.error("Network error:", error);
            }
        });
    });
});

const profileToggle = document.getElementById('profile-toggle');
const profileSidebar = document.getElementById('profile-sidebar');
const menuToggle = document.getElementById('menu-toggle');

profileToggle.addEventListener('click', () => {
    profileSidebar.classList.toggle('visible');
});

// menuToggle.addEventListener('click', () => {
//     profileSidebar.classList.toggle('visible');
// });


const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('visible');
});

// Filter Buttons
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get filter type
        const filterType = button.textContent;
        
        // Get all meal cards
        const mealCards = document.querySelectorAll('.meal-card');
        
        // Filter meals based on selected type
        mealCards.forEach(card => {
            const mealTag = card.querySelector('.meal-tag').textContent;
            
            if (filterType === 'Common Meals') {
                card.style.display = 'block';
            } else if (mealTag === filterType) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Add to Plan functionality
const addButtons = document.querySelectorAll('.btn-primary');
addButtons.forEach(button => {
    button.addEventListener('click', () => {
        const mealCard = button.closest('.meal-card');
        const mealTitle = mealCard.querySelector('.meal-title').textContent;
        
        // Show notification
        showNotification(`${mealTitle} added to your meal plan!`);
        
        // Change button text temporarily
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.classList.add('added');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('added');
        }, 2000);
    });
});

// Details button functionality
const detailButtons = document.querySelectorAll('.btn-outline');
detailButtons.forEach(button => {
    button.addEventListener('click', () => {
        const mealCard = button.closest('.meal-card');
        const mealTitle = mealCard.querySelector('.meal-title').textContent;
        
        // In a real application, this would open a modal or navigate to details page
        alert(`Viewing details for ${mealTitle}`);
    });
});

// Show notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    notification.style.zIndex = '10000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'all 0.3s ease';
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Responsive behavior for window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        profileSidebar.classList.remove('visible');
    }
});

// Initialize progress animations
document.addEventListener('DOMContentLoaded', () => {
    // Animate progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        
        setTimeout(() => {
            bar.style.transition = 'width 1s ease';
            bar.style.width = width;
        }, 300);
    });
    
    // Load meal recommendations (simulating API call)
    simulateLoading();
});

// Simulate loading data
function simulateLoading() {
    const mealCards = document.querySelectorAll('.meal-card');
    mealCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}


// from dashboard

document.addEventListener("DOMContentLoaded", () => {
    const recommendationsSection = document.getElementById("recommendations-section");
  
    // Helper function to create recommendation cards
    const createCard = (mealType, mealName, description, description2, description3) => {
      const card = document.createElement("div");
      card.classList.add("results-card");
  
      // Add HTML content to the card
      card.innerHTML = `
        <div class="banner"><b style="color: white; font-size: 18px">DietMaster ${mealType} is ready.</b></div><br>
        <h2 style="color: lightseagreen">${mealName} <i class="fas fa-check-circle"></i></h2><br>
        <p>${description}</p><br>
  
        <span style="color: lightseagreen">Why this meal? <i class="fas fa-notes-medical"></i></span><br>
        <p><b style="color: lightseagreen">It contains:</b> ${description2}<br><p style="color: lightseagreen">This meal<b> ${mealName}</b> is good for your child health based on the health conditions and allergies as per our records<p></p><br>
        <span style="color: lightseagreen">Ingredients to prepare this meal <i class="fas fa-thumbs-up"></i></span><br>
  
        <p>${description3}</p>
        
        <!-- Add close button -->
        <div class="close-button">Close Recommendation</div>
      `;
  
      // Attach event listener to the close button
      const closeButton = card.querySelector(".close-button");
      closeButton.addEventListener("click", () => {
        closeCard(card);
      });
  
      return card;
    };
  
    // Function to close the card
    const closeCard = (card) => {
      card.remove();
    };
  

    const floatingCard = document.getElementById("recommend-floating-card");
  const floatingCardMessage = document.getElementById("recommend-floating-card-message");
  const closeCardBtn = document.getElementById("close-card-btn");

  // Function to show the floating card
  const showFloatingCard = (message) => {
    floatingCardMessage.textContent = message;

    // Remove hidden class and add the show class to make the card visible
    floatingCard.classList.remove("hidden");
    floatingCard.classList.add("show");
  };

  // Close button functionality
  closeCardBtn.addEventListener("click", () => {
    floatingCard.classList.remove("show");
    floatingCard.classList.add("hidden");
  });
  
    // Fetch recommendations from the server
    const loadingOverlay = document.getElementById("loading-overlay");
    const fetchRecommendation = async (mealType) => {
      showLoadingSpinner();
      try {
        const response = await fetch(`/recommend/${mealType}`);
        if (!response.ok) throw new Error("Failed to fetch recommendation.");
  
        const data = await response.json();
        hideLoadingSpinner();
  
        // Debugging log to inspect server response
        console.log("Server Response:", data);
  
        // Clear previous recommendations
        recommendationsSection.innerHTML = "";
  
        // Check for undefined or error messages
        if (!data.mealName || !data.description) {
          // alert(data.message || "No recommendation available. Please update your preferences.");
          // return;
          showFloatingCard(data.message || "No recommendation available. Please update your preferences.");
          return;
        }
  
        // Add new recommendation card
        const card = createCard(data.mealType, data.mealName, data.description, data.description2, data.description3);
        recommendationsSection.appendChild(card);
  
        // Scroll to results
        // window.location.href = "#recommendationresults";
      } catch (error) {
        console.error("Error fetching recommendation:", error);
        hideLoadingSpinner();
        alert("An error occurred while fetching recommendations.");
      }
    };
  // Event listeners for buttons
  document.getElementById("brakfast_btn").addEventListener("click", () => {
    fetchRecommendation("breakfast");
  });

  document.getElementById("lunch_btn").addEventListener("click", () => {
    fetchRecommendation("lunch");
  });

  document.getElementById("supper_btn").addEventListener("click", () => {
    fetchRecommendation("supper");
  });

  
  function showLoadingSpinner() {
    loadingOverlay.classList.add('active');
  }

  function hideLoadingSpinner() {
    loadingOverlay.classList.remove('active');
  }
 
});

   
  

// basket

// Basket functionality for meal planning
document.addEventListener('DOMContentLoaded', () => {
    // Create basket elements and add to navbar
    setupBasketUI();
    
    // Initialize meals array in localStorage if it doesn't exist
    if (!localStorage.getItem('mealPlan')) {
        localStorage.setItem('mealPlan', JSON.stringify([]));
    }
    
    // Update basket count from localStorage
    updateBasketCount();
    
    // Modify existing Add to Plan functionality
    const addButtons = document.querySelectorAll('.btn-primary');
    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mealCard = button.closest('.meal-card');
            const mealTitle = mealCard.querySelector('.meal-title').textContent;
            const mealTag = mealCard.querySelector('.meal-tag').textContent;
            const caloriesEl = mealCard.querySelector('.meal-info-item:nth-child(1) .value');
            const proteinEl = mealCard.querySelector('.meal-info-item:nth-child(2) .value');
            const carbsEl = mealCard.querySelector('.meal-info-item:nth-child(3) .value');
            
            // Extract meal details
            const mealDetails = {
                id: Date.now(), // Unique ID using timestamp
                title: mealTitle,
                type: mealTag,
                calories: caloriesEl ? caloriesEl.textContent : 'N/A',
                protein: proteinEl ? proteinEl.textContent : 'N/A',
                carbs: carbsEl ? carbsEl.textContent : 'N/A',
                dateAdded: new Date().toLocaleString()
            };
            
            // Add to meal plan
            addToMealPlan(mealDetails);
            
            // Show notification
            showNotification(`${mealTitle} added to your meal plan!`);
            
            // Change button text temporarily
            const originalText = button.textContent;
            button.textContent = 'Added!';
            button.classList.add('added');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('added');
            }, 2000);
        });
    });
    
    // Toggle basket card when basket icon is clicked
    document.getElementById('basket-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBasketCard();
    });
    
    // Close basket card when clicking outside
    document.addEventListener('click', (e) => {
        const basketCard = document.getElementById('basket-card');
        if (basketCard && basketCard.classList.contains('active') && 
            !basketCard.contains(e.target) && e.target.id !== 'basket-icon') {
            basketCard.classList.remove('active');
        }
    });
});

// Set up basket UI elements
function setupBasketUI() {
    // Create basket icon with counter
    const basketContainer = document.createElement('div');
    basketContainer.className = 'basket-container';
    basketContainer.innerHTML = `
        <div id="basket-icon" class="basket-icon">
            <i>🧺</i>
            <span id="basket-count" class="basket-count">0</span>
        </div>
        <div id="basket-card" class="basket-card">
            <div class="basket-card-header">
                <h3>Your Meal Plan</h3>
                <button id="clear-basket" class="clear-basket">Clear All</button>
            </div>
            <div id="basket-items" class="basket-items">
                <!-- Meal items will be added here dynamically -->
            </div>
            <div class="basket-card-footer">
                <button id="view-full-plan" class="view-full-plan">View Full Plan</button>
            </div>
        </div>
    `;
    
    // Add basket to navbar before profile-nav
    const navLinks = document.querySelector('.nav-links');
    const profileNav = document.querySelector('.profile-nav');
    
    if (navLinks && profileNav) {
        navLinks.parentNode.insertBefore(basketContainer, profileNav);
    }
    
    // Add CSS for basket elements
    const basketStyles = document.createElement('style');
    basketStyles.textContent = `
        .basket-container {
    position: absolute; /* Removes it from the document flow */
    top: 10px; /* Adjust top position as needed */
    right: 80px; /* Position it towards the right */
    margin-left: auto;
    margin-right: auto; /* Ensure proper alignment */
}

        
        .basket-icon {
            font-size: 24px;
            cursor: pointer;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
        }
        
        .basket-count {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #e74c3c;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        .basket-card {
            position: absolute;
            top: 50px;
            right: 0;
            width: 600px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1000;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
        }
        
        .basket-card.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .basket-card-header {
            padding: 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .basket-card-header h3 {
            margin: 0;
            color: #333;
        }
        
        .clear-basket {
            background: none;
            border: none;
            color: #e74c3c;
            cursor: pointer;
            font-size: 14px;
            padding: 5px 10px;
            border-radius: 4px;
        }
        
        .clear-basket:hover {
            background-color: #f8f8f8;
        }
        
        .basket-items {
            padding: 15px;
            overflow-y: auto;
            max-height: 50vh;
            flex-grow: 1;
        }
        
        .basket-item {
            padding: 12px;
            border-bottom: 1px solid #eee;
            position: relative;
            transition: background-color 0.2s;
        }
        
        .basket-item:last-child {
            border-bottom: none;
        }
        
        .basket-item:hover {
            background-color: #f9f9f9;
        }
        
        .basket-item-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }
        
        .basket-item-details {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .basket-item-date {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }
        
        .basket-item-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
        }
        
        .basket-item-actions button {
            padding: 5px 10px;
            font-size: 12px;
            border-radius: 4px;
            margin-left: 8px;
            cursor: pointer;
            border: none;
        }
        
        .remove-item {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .view-details {
            background-color: #e2f0fb;
            color: #0c63e4;
        }
        
        .basket-card-footer {
            padding: 15px;
            border-top: 1px solid #eee;
            text-align: center;
        }
        
        .view-full-plan {
            background-color: #20c997;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
        }
        
        .view-full-plan:hover {
            background-color: #1ba385;
        }
        
        .empty-basket-message {
            text-align: center;
            padding: 30px 15px;
            color: #999;
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            .basket-card {
                
                width: 350px;
                left:-270px;
            }
        }
    `;
    
    document.head.appendChild(basketStyles);
    
    // Add event listeners for basket actions
    document.addEventListener('click', (e) => {
        if (e.target.id === 'clear-basket') {
            clearBasket();
        } else if (e.target.classList.contains('remove-item')) {
            const itemId = e.target.closest('.basket-item').dataset.id;
            removeFromMealPlan(itemId);
        } else if (e.target.classList.contains('view-details')) {
            const itemId = e.target.closest('.basket-item').dataset.id;
            const mealPlan = JSON.parse(localStorage.getItem('mealPlan') || '[]');
            const meal = mealPlan.find(item => item.id.toString() === itemId);
            
            if (meal) {
                alert(`Viewing details for ${meal.title}`);
                // In a real app, you could show a modal with more details here
            }
        } else if (e.target.id === 'view-full-plan') {
            // Navigate to meal plans page or show a full modal
            alert('Navigating to full meal plan page');
            // In a real app: window.location.href = '/meal-plans';
        }
    });
}

// Add meal to plan
function addToMealPlan(mealDetails) {
    const mealPlan = JSON.parse(localStorage.getItem('mealPlan') || '[]');
    mealPlan.push(mealDetails);
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    updateBasketCount();
    updateBasketItems();
}

// Remove meal from plan
function removeFromMealPlan(itemId) {
    const mealPlan = JSON.parse(localStorage.getItem('mealPlan') || '[]');
    const updatedPlan = mealPlan.filter(item => item.id.toString() !== itemId);
    localStorage.setItem('mealPlan', JSON.stringify(updatedPlan));
    updateBasketCount();
    updateBasketItems();
    showNotification('Meal removed from plan');
}

// Clear all meals from plan
function clearBasket() {
    localStorage.setItem('mealPlan', JSON.stringify([]));
    updateBasketCount();
    updateBasketItems();
    showNotification('Meal plan cleared');
    
    const basketCard = document.getElementById('basket-card');
    if (basketCard) {
        basketCard.classList.remove('active');
    }
}

// Update basket count badge
function updateBasketCount() {
    const mealPlan = JSON.parse(localStorage.getItem('mealPlan') || '[]');
    const basketCount = document.getElementById('basket-count');
    if (basketCount) {
        basketCount.textContent = mealPlan.length;
        
        // Add animation effect for count changes
        basketCount.classList.add('pulse');
        setTimeout(() => basketCount.classList.remove('pulse'), 300);
    }
}

// Update basket items list
function updateBasketItems() {
    const basketItems = document.getElementById('basket-items');
    if (!basketItems) return;
    
    const mealPlan = JSON.parse(localStorage.getItem('mealPlan') || '[]');
    
    if (mealPlan.length === 0) {
        basketItems.innerHTML = `
            <div class="empty-basket-message">
                Your meal plan is empty. Add meals to get started!
            </div>
        `;
        return;
    }
    
    basketItems.innerHTML = '';
    
    // Sort meals by most recently added
    const sortedMeals = [...mealPlan].sort((a, b) => {
        return new Date(b.dateAdded) - new Date(a.dateAdded);
    });
    
    sortedMeals.forEach(meal => {
        const mealItem = document.createElement('div');
        mealItem.className = 'basket-item';
        mealItem.dataset.id = meal.id;
        
        mealItem.innerHTML = `
            <div class="basket-item-title">${meal.title}</div>
            <div class="basket-item-details">
                <span>${meal.type}</span>
                <span>${meal.calories} cal</span>
            </div>
            <div class="basket-item-details">
                <span>Protein: ${meal.protein}</span>
                <span>Carbs: ${meal.carbs}</span>
            </div>
            <div class="basket-item-date">Added: ${meal.dateAdded}</div>
            <div class="basket-item-actions">
                <button class="view-details">Details</button>
                <button class="remove-item">Remove</button>
            </div>
        `;
        
        basketItems.appendChild(mealItem);
    });
}

// Toggle basket card visibility
function toggleBasketCard() {
    const basketCard = document.getElementById('basket-card');
    if (basketCard) {
        basketCard.classList.toggle('active');
        
        if (basketCard.classList.contains('active')) {
            updateBasketItems();
        }
    }
}

// Add CSS animation for pulse effect
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .pulse {
        animation: pulse 0.3s ease;
    }
`;
document.head.appendChild(pulseStyle);



document.getElementById('dataclearing').addEventListener('click', function () {
    document.getElementById('deletion-popup').classList.add('visible');
  });
  
  document.getElementById('close-deletion-form').addEventListener('click', function () {
    document.getElementById('deletion-popup').classList.remove('visible');
  });
    
  document.getElementById('deletion-popup').addEventListener('click', function (e) {
    if (e.target === this) {
        document.getElementById('deletion-popup').classList.remove('visible');
    }
  });
  
  
  
  // Submit details and send to the server
  document.getElementById('data-deletion-button').addEventListener('click', async () => {
      
    // showLoadingSpinner();
    try {
      const response = await fetch('/delete-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
      });
  
      const data = await response.json();
      if (response.ok) {
      // displayFloatingCard(data.message, 'success');
  
      // hideLoadingSpinner();
        alert(data.message); // Show success message
      } else {
        // displayFloatingCard(data.message, 'error');
        alert(data.error); // Show error message
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the details. Please try again later.');
      // displayFloatingCard(data.message, 'error');
    }
    // hideLoadingSpinner();
  });
  //end of premium payment premiumUpgrade close-deletion-form
  


document.getElementById('tutionpayment').addEventListener('click', function () {
    document.getElementById('payment-popup').classList.add('visible');
  });
   
    
  document.getElementById('close-payment-form').addEventListener('click', function () {
    document.getElementById('payment-popup').classList.remove('visible');
  });
    
  document.getElementById('payment-popup').addEventListener('click', function (e) {
    if (e.target === this) {
        document.getElementById('payment-popup').classList.remove('visible');
    }
  });
  
  // Show or hide sections and dynamically set the 'required' attribute
  document.getElementById('payment_type').addEventListener('change', function () {
    const allergySection = document.getElementById('alergy_list_section');
    const allergyInput = document.getElementById('allergy_list');
  
    if (this.value === 'yes') {
      allergySection.style.display = 'block';
      allergyInput.setAttribute('required', 'true');
    } else {
      allergySection.style.display = 'none';
      allergyInput.removeAttribute('required');
    }
  });
  
  document.getElementById('health_conditions').addEventListener('change', function () {
    const healthSection = document.getElementById('health_list_section');
    const healthInput = document.getElementById('health_list');
  
    if (this.value === 'yes') {
      healthSection.style.display = 'block';
      healthInput.setAttribute('required', 'true');
    } else {
      healthSection.style.display = 'none';
      healthInput.removeAttribute('required');
    }
  });
  
  document.getElementById('payment_mode').addEventListener('change', function () {
    const favoriteSection = document.getElementById('favorite_list_section');
    const favoriteInput = document.getElementById('favorite_list');
  
    if (this.value === 'yes') {
      favoriteSection.style.display = 'block';
      favoriteInput.setAttribute('required', 'true');
    } else {
      favoriteSection.style.display = 'none';
      favoriteInput.removeAttribute('required');
    }
  });
  
  
  
  
  // Form validation function
  function validateInput(value) {
    // Regular expression to allow words separated by commas, hyphens, and underscores (no spaces between words)
    const regex = /^([a-zA-Z0-9-_]+(?:\s*,\s*[a-zA-Z0-9-_]+)*)$/;
    return regex.test(value);
  }
  
  // Handle form submission
  document.getElementById('payment-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    // Collect form data
    const allergyValue = document.getElementById('payment_type').value === 'yes'
      ? document.getElementById('allergy_list').value
      : 'NO';
  
    // Collect selected health conditions as a comma-separated string
    let healthValue = 'NO';
    if (document.getElementById('health_conditions').value === 'yes') {
      const healthConditions = [];
      document.querySelectorAll("input[name='health_condition']:checked").forEach(function (checkbox) {
        healthConditions.push(checkbox.value);
      });
      healthValue = healthConditions.length > 0 ? healthConditions.join(',') : 'NO';
    } else {
      // If "NO" is selected, uncheck all health condition checkboxes
      document.querySelectorAll("input[name='health_condition']").forEach(function (checkbox) {
        checkbox.checked = false;
      });
    }
  
    const favoriteValue = document.getElementById('payment_mode').value === 'yes'
      ? document.getElementById('favorite_list').value
      : 'NO';
  
    const child_age = document.getElementById('child_age').value;
  
    // Validate inputs
    if ((allergyValue !== 'NO' && !validateInput(allergyValue)) ||
        (healthValue !== 'NO' && !validateInput(healthValue)) ||
        (favoriteValue !== 'NO' && !validateInput(favoriteValue))) {
      
      document.getElementById('data-error').style.display = 'block';
      document.getElementById('data-error').textContent = 'Separate your words with commas (,) or use hyphens (-) or underscores (_) to join separate words.';
      return;
    }
  
    document.getElementById('data-error').style.display = 'none';
    document.getElementById('data-error').textContent = '';
  
    // Redirect to confirmation page with parameters
    const params = new URLSearchParams({
      allergies: Array.isArray(allergyValue) ? allergyValue.split(',').map(item => item.trim()).join(',') : allergyValue,
      health: Array.isArray(healthValue) ? healthValue.split(',').map(item => item.trim()).join(',') : healthValue,
      favorites: Array.isArray(favoriteValue) ? favoriteValue.split(',').map(item => item.trim()).join(',') : favoriteValue,
      age: Array.isArray(child_age) ? child_age.join(',') : child_age,
    });
  
    window.location.href = `updates?${params.toString()}`;
  });
  
  // Handle health condition selection (update checkbox state)
  document.getElementById('health_conditions').addEventListener('change', function () {
    const healthSelection = document.getElementById('health_conditions').value;
    
    // Show health condition list if "yes" is selected, hide if "no"
    if (healthSelection === 'yes') {
      document.getElementById('health_list_section').style.display = 'block';
    } else {
      document.getElementById('health_list_section').style.display = 'none';
      
      // Uncheck all checkboxes when "NO" is selected
      document.querySelectorAll("input[name='health_condition']").forEach(function (checkbox) {
        checkbox.checked = false;
      });
    }
  });



  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function() {
        // Find the section content within this sidebar link
        const content = this.querySelector('.section-content');
        
        // Toggle the active class on the content
        content.classList.toggle('active');
        
        // Close other open sections
        document.querySelectorAll('.section-content').forEach(item => {
            if (item !== content && item.classList.contains('active')) {
                item.classList.remove('active');
            }
        });
    });
});


document.addEventListener('DOMContentLoaded', async () => {
    const allergiesContent = document.getElementById('allergiesContent');
    const favoriteMealsContent = document.getElementById('favoritemealsContent');
    const healthconditionContent = document.getElementById('healthconditionContent');
    const ageContent = document.getElementById('ageContent');
    
  
    try {
        // Fetch user data from the server
        const response = await fetch('/get-user-data');
        const data = await response.json();
  
        // Update allergies section
        if (data.allergies && data.allergies.length > 0) {
            allergiesContent.innerHTML = '';
            data.allergies.forEach(allergy => {
                const allergyItem = document.createElement('p');
                allergyItem.style.marginBottom = '15px'; // Optional styling
                allergyItem.style.borderBottom = 'dotted lightseagreen 1pt';
                allergyItem.textContent = allergy;
                allergiesContent.appendChild(allergyItem);
    
            });
        } else {
            allergiesContent.innerHTML = '<p>No allergies found.</p>';
        }
  
        // Update favorite meals section
        if (data.health_conditions && data.health_conditions.length > 0) {
            healthconditionContent.innerHTML = '';
            data.health_conditions.forEach(meal => {
                const healthItem = document.createElement('p');
                healthItem.style.marginBottom = '15px'; // Optional styling
                healthItem.style.borderBottom = 'dotted lightseagreen 1pt';
                healthItem.textContent = meal;
                healthconditionContent.appendChild(healthItem);
  
            });
        } else {
          healthconditionContent.innerHTML = '<p>No health condition found.</p>';
        }
  
        // Update favorite meals section
        if (data.favoriteMeals && data.favoriteMeals.length > 0) {
          favoriteMealsContent.innerHTML = '';
          data.favoriteMeals.forEach(meal => {
              const mealItem = document.createElement('p');
              mealItem.style.marginBottom = '15px'; // Optional styling
              mealItem.style.borderBottom = 'dotted lightseagreen 1pt';
              mealItem.textContent = meal;
              favoriteMealsContent.appendChild(mealItem);
  
          });
      } else {
          favoriteMealsContent.innerHTML = '<p>No favorite meals found.</p>';
      }
  
      // Update favorite meals section
      if (data.child_age && data.child_age.length > 0) {
        ageContent.innerHTML = '';
        data.child_age.forEach(meal => {
            const ageItem = document.createElement('p');
            ageItem.style.marginBottom = '15px'; // Optional styling
            ageItem.style.borderBottom = 'dotted lightseagreen 1pt';
            ageItem.textContent = meal;
            ageContent.appendChild(ageItem);
  
        });
    } else {
      ageContent.innerHTML = '<p>No age Data found.</p>';
    }
  
    } catch (error) {
        console.error('Error fetching user data:', error);
        allergiesContent.innerHTML = '<p>Error loading allergies.</p>';
        favoriteMealsContent.innerHTML = '<p>Error loading favorite meals.</p>';
        healthconditionContent.innerHTML = '<p>Error loading Health conditions.</p>';
        ageContent.innerHTML = '<p>Error loading age data.</p>';
    }
  });