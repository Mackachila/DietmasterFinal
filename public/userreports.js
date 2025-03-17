// success-message



document.addEventListener("DOMContentLoaded", () => {
    
    // Pagination state
    let currentPage = 1;
    const reportsPerPage = 5;
    let totalPages = 1;

        // Initialize - fetch first page of reports

     fetchSentReports(currentPage); // Load reports

    // Fetch Sent Reports
    async function fetchSentReports(page) {
        try {
            const response = await fetch(`/fetch-usersent-reports?page=${page}&limit=${reportsPerPage}`);
            // const reports = await response.json();
            const data = await response.json();
            
            // Extract reports and pagination metadata
            const reports = data.reports;
            totalPages = data.totalPages;
            currentPage = data.currentPage;

           // Update reports display
            const reportDiv = document.getElementById("report-list");
            reportDiv.innerHTML = "";

            reports.forEach(report => {
                const reportItem = document.createElement("div");
                reportItem.classList.add("report-card");

                const reportDate = new Date(report.date).toLocaleString();

                reportItem.innerHTML = `
                    <div class="report-card-header">
                        <span class="report-recipient"><strong style= "color:#4a90e2">Report from Dr.</strong> ${report.doctor}</span>
                        <span class="report-date">${reportDate}</span>
                    </div>
                    <div class="report-title">
                        <strong style= "color:#4a90e2">Title:</strong> ${report.title}
                        <span class="report-status read">${report.category}</span>
                    </div>
                    <strong style= "color:#4a90e2">Content:</strong><div class="report-content">
                     ${report.content}
                       
                    </div>
                    <div class="report-actions">
                        <button class="report-action-btn view" data-id="${report.report_id}" data-patient="${report.email}" 
                            data-date="${reportDate}" data-title="${report.title}" data-category="${report.category}"
                            data-status="${report.status || 'Sent'}" data-content="${report.content}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        
                        <button class="report-action-btn delete" data-id="${report.report_id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                `;

                reportDiv.appendChild(reportItem);
            });

            // Update pagination buttons
            updatePaginationButtons();

            // Add event listeners for view, edit, and delete buttons
            setupModalEventListeners();
            
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    }

// Update pagination buttons based on current state
function updatePaginationButtons() {
    const paginationDiv = document.querySelector(".pagination");
    paginationDiv.innerHTML = "";
    
    // Add previous button
    const prevButton = document.createElement("button");
    prevButton.className = "pagination-btn" + (currentPage === 1 ? " disabled" : "");
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            fetchSentReports(currentPage - 1);
        }
    });
    paginationDiv.appendChild(prevButton);
    
    // Generate page buttons
    // Determine range of page numbers to show
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);
    
    // Ensure we always try to show 3 page numbers if possible
    if (endPage - startPage + 1 < 3) {
        if (startPage === 1) {
            endPage = Math.min(startPage + 2, totalPages);
        } else if (endPage === totalPages) {
            startPage = Math.max(endPage - 2, 1);
        }
    }
    
    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button");
        pageButton.className = "pagination-btn" + (i === currentPage ? " active" : "");
        pageButton.textContent = i;
        pageButton.addEventListener("click", () => {
            fetchSentReports(i);
        });
        paginationDiv.appendChild(pageButton);
    }
    
    // Add next button
    const nextButton = document.createElement("button");
    nextButton.className = "pagination-btn" + (currentPage === totalPages ? " disabled" : "");
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            fetchSentReports(currentPage + 1);
        }
    });
    paginationDiv.appendChild(nextButton);
}

   // Setup modal event listeners
   function setupModalEventListeners() {
    // View Modal Functionality
    document.querySelectorAll('.report-action-btn.view').forEach(button => {
        button.addEventListener('click', function() {
            showViewModal(this.dataset);
        });
    });
    
    // Edit Modal Functionality
    document.querySelectorAll('.report-action-btn.edit').forEach(button => {
        button.addEventListener('click', function() {
            showEditModal(this.dataset);
        });
    });
    
    // Delete Functionality
    document.querySelectorAll('.report-action-btn.delete').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this report?')) {
                deleteReport(this.dataset.id);
            }
        });
    });
}

    // Function to dynamically create and show the view modal
    function showViewModal(reportData) {
        // Remove any existing view modal first
        const existingModal = document.getElementById('report-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create the modal dynamically
        const viewModal = document.createElement('div');
        viewModal.className = 'report-modal show';
        viewModal.id = 'report-modal';
        
        viewModal.innerHTML = `
            <div class="report-modal-content">
                <div class="report-modal-header">
                    <h3>Report Details</h3>
                    <button class="report-modal-close" id="report-modal-close">&times;</button>
                </div>
                <div class="report-modal-body">
                    <div class="report-detail-item">
                        <div class="report-detail-label">Patient</div>
                        <div class="report-detail-value" id="modal-patient">${reportData.patient}</div>
                    </div>
                    <div class="report-detail-item">
                        <div class="report-detail-label">Date</div>
                        <div class="report-detail-value" id="modal-date">${reportData.date}</div>
                    </div>
                    <div class="report-detail-item">
                        <div class="report-detail-label">Title</div>
                        <div class="report-detail-value" id="modal-title">${reportData.title}</div>
                    </div>
                    <div class="report-detail-item">
                        <div class="report-detail-label">Category</div>
                        <div class="report-detail-value" id="modal-category">${reportData.category}</div>
                    </div>
                    <div class="report-detail-item">
                        <div class="report-detail-label">Status</div>
                        <div class="report-detail-value" id="modal-status">${reportData.status}</div>
                    </div>
                    <div class="report-detail-item">
                        <div class="report-detail-label">Content</div>
                        <div class="report-detail-value" id="modal-content">${reportData.content}</div>
                    </div>
                </div>
                <div class="report-modal-footer">
                    <button class="report-modal-btn secondary" id="report-modal-close-btn">Close</button>
                    <button class="download-pdf-btn" data-id="${reportData.patient}" data-description="${reportData.date}" data-email="${reportData.title}" data-status="${reportData.category}">⬇ Download PDF</button>
                    <button class="report-modal-btn primary" id="report-print-btn">Print Report</button>
                </div>
            </div>
        `;
        
        // Append the modal to the body
        document.body.appendChild(viewModal);
        
        // Setup close handlers
        document.getElementById('report-modal-close').addEventListener('click', function() {
            viewModal.classList.remove('show');
            setTimeout(() => viewModal.remove(), 300); // Give time for animation
        });
        
        document.getElementById('report-modal-close-btn').addEventListener('click', function() {
            viewModal.classList.remove('show');
            setTimeout(() => viewModal.remove(), 300); // Give time for animation
        });
        
        // Setup print handler
        document.getElementById('report-print-btn').addEventListener('click', function() {
            printReport(reportData.id);
        });
    }


     // Attach event listeners to download buttons
     document.querySelectorAll(".download-pdf-btn").forEach(button => {
        button.addEventListener("click", function() {
            downloadReportAsPDF(this.reportData.patient, this.reportData.date, this.reportData.category, this.reportData.title);
            
        });
    });




    // Function to dynamically create and show the edit modal
    function showEditModal(reportData) {
        // Remove any existing edit modal first
        const existingModal = document.getElementById('edit-report-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create the modal dynamically
        const editModal = document.createElement('div');
        editModal.className = 'report-modal edit-report-modal show';
        editModal.id = 'edit-report-modal';
        
        editModal.innerHTML = `
            <div class="report-modal-content">
                <div class="report-modal-header">
                    <h3>Edit Report</h3>
                    <button class="report-modal-close" id="edit-modal-close">&times;</button>
                </div>
                <div class="report-modal-body">
                    <form id="edit-report-form">
                        <input type="hidden" id="edit-report-id" value="${reportData.id}">
                        <div class="report-edit-item">
                            <label for="edit-title">Title</label>
                            <input type="text" id="edit-title" value="${reportData.title}" required>
                        </div>
                        <div class="report-edit-item">
                            <label for="edit-category">Category</label>
                            <input type="text" id="edit-category" value="${reportData.category}" required>
                        </div>
                        <div class="report-edit-item">
                            <label for="edit-content">Content</label>
                            <textarea id="edit-content" rows="6" required>${reportData.content}</textarea>
                        </div>
                    </form>
                </div>
                <div class="report-modal-footer">
                    <button class="report-modal-btn secondary" id="edit-modal-cancel">Cancel</button>
                    <button class="report-modal-btn primary" id="edit-modal-save">Save Changes</button>
                </div>
            </div>
        `;
        
        // Append the modal to the body
        document.body.appendChild(editModal);
        
        // Setup close handlers
        document.getElementById('edit-modal-close').addEventListener('click', function() {
            editModal.classList.remove('show');
            setTimeout(() => editModal.remove(), 300); // Give time for animation
        });
        
        document.getElementById('edit-modal-cancel').addEventListener('click', function() {
            editModal.classList.remove('show');
            setTimeout(() => editModal.remove(), 300); // Give time for animation
        });
        
        // Setup save handler
        document.getElementById('edit-modal-save').addEventListener('click', function() {
            saveReportChanges();
        });
    }

     // Function to save report changes
     async function saveReportChanges() {
        const id = document.getElementById('edit-report-id').value;
        const title = document.getElementById('edit-title').value;
        const category = document.getElementById('edit-category').value;
        const content = document.getElementById('edit-content').value;
        
        try {
            const response = await fetch(`/edit-report/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, category, content })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Report updated successfully!');
                // Close the edit modal
                const editModal = document.getElementById('edit-report-modal');
                editModal.classList.remove('show');
                setTimeout(() => editModal.remove(), 300);
                
                // Refresh the current page of reports
                fetchSentReports(currentPage);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error updating report:', error);
            alert('Failed to update report. Please try again.');
        }
    }

     // Function to delete a report
     async function deleteReport(id) {
        try {
            const response = await fetch(`/delete-report/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Report deleted successfully!');
                
                // If we've deleted the last item on the current page and it's not the first page,
                // go to the previous page
                const reportsOnCurrentPage = document.querySelectorAll('.report-card').length;
                if (reportsOnCurrentPage === 1 && currentPage > 1) {
                    fetchSentReports(currentPage - 1);
                } else {
                    // Otherwise, refresh the current page
                    fetchSentReports(currentPage);
                }
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            alert('Failed to delete report. Please try again.');
        }
    }

    // Function to print a report (placeholder)
    function printReport(id) {
        // Implementation for printing
        const printWindow = window.open('', '_blank');
        
        // Get the report content from the modal
        const patient = document.getElementById('modal-patient').textContent;
        const date = document.getElementById('modal-date').textContent;
        const title = document.getElementById('modal-title').textContent;
        const category = document.getElementById('modal-category').textContent;
        const content = document.getElementById('modal-content').textContent;
        
        // Create print content
        const printContent = `
            <html>
            <head>
                <title>Report: ${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .report-header { margin-bottom: 20px; }
                    .report-content { margin-top: 20px; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>${title}</h1>
                    <p><strong>Patient:</strong> ${patient}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Category:</strong> ${category}</p>
                </div>
                <div class="report-content">
                    ${content}
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Print after the content is loaded
        printWindow.onload = function() {
            printWindow.print();
        };
    }
});



// search
// Add this function to your existing JavaScript code

document.addEventListener("DOMContentLoaded", () => {
    // Existing code...
    
    // Add this section to initialize the search functionality
    initializeSearchFeature();
    
    // Initialize search functionality
    function initializeSearchFeature() {
        const searchInput = document.getElementById("report-search");
        const searchButton = searchInput.nextElementSibling; // Button next to search input
        const filterButtons = document.querySelectorAll(".report-filter-btn");
        
        // Search when user types and presses Enter
        searchInput.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                searchReports(this.value);
            }
        });
        
        // Search when search button is clicked
        searchButton.addEventListener("click", function() {
            searchReports(searchInput.value);
        });
        
        // Filter when filter buttons are clicked
        filterButtons.forEach(button => {
            button.addEventListener("click", function() {
                // Toggle active class
                filterButtons.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active");
                
                // Get the filter value
                const filter = this.getAttribute("data-filter");
                
                // Apply filter
                if (filter === "all") {
                    // Reset to first page with no filter
                    searchReports("");
                    searchInput.value = "";
                } else {
                    // Apply this filter
                    searchReports(filter);
                    searchInput.value = filter;
                }
            });
        });
    }
    
    // Search/filter reports function
    async function searchReports(query) {
        try {
            // Convert query to lowercase for case-insensitive comparison
            query = query.trim().toLowerCase();
            
            // If empty query, fetch all reports (first page)
            if (query === "") {
                fetchSentReports(1);
                return;
            }
            
            // Fetch all reports from the server (we'll filter client-side)
            // In a real application, you might want to filter server-side instead
            const response = await fetch(`/fetch-usersent-reports?page=1&limit=1000`);
            const data = await response.json();
            
            // Filter reports based on query (category matching)
            const filteredReports = data.reports.filter(report => 
                report.category.toLowerCase().includes(query)
            );
            
            // Update the report list with filtered reports
            displayFilteredReports(filteredReports);
            
            // Hide pagination when filtering
            document.querySelector(".pagination").style.display = "none";
            
        } catch (error) {
            console.error("Error searching reports:", error);
        }
    }
    
    // Display filtered reports
    function displayFilteredReports(reports) {
        const reportDiv = document.getElementById("report-list");
        reportDiv.innerHTML = "";
        
        if (reports.length === 0) {
            reportDiv.innerHTML = "<p>No reports found matching your search.</p>";
            return;
        }
        
        reports.forEach(report => {
            const reportItem = document.createElement("div");
            reportItem.classList.add("report-card");
            
            const reportDate = new Date(report.date).toLocaleString();
            
            reportItem.innerHTML = `
                <div class="report-card-header">
                    <span class="report-recipient"><strong style= "color:#4a90e2">Report to:</strong> ${report.email}</span>
                    <span class="report-date">${reportDate}</span>
                </div>
                <div class="report-title">
                    <strong style= "color:#4a90e2">Title:</strong> ${report.title}
                    <span class="report-status read">${report.category}</span>
                </div>
                <strong style= "color:#4a90e2">Content:</strong><div class="report-content">
                 ${report.content}
                   
                </div>
                <div class="report-actions">
                    <button class="report-action-btn view" data-id="${report.report_id}" data-patient="${report.email}" 
                        data-date="${reportDate}" data-title="${report.title}" data-category="${report.category}"
                        data-status="${report.status || 'Sent'}" data-content="${report.content}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="report-action-btn edit" data-id="${report.report_id}" data-patient="${report.email}"
                        data-date="${reportDate}" data-title="${report.title}" data-category="${report.category}"
                        data-content="${report.content}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="report-action-btn delete" data-id="${report.report_id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            reportDiv.appendChild(reportItem);
        });
        
        // Re-attach event listeners for the new buttons
        setupModalEventListeners();
    }
    
    // Function to reset search and show all reports
    function resetSearch() {
        const searchInput = document.getElementById("report-search");
        searchInput.value = "";
        
        // Reset filter button active state
        document.querySelectorAll(".report-filter-btn").forEach(btn => {
            btn.classList.remove("active");
            if (btn.getAttribute("data-filter") === "all") {
                btn.classList.add("active");
            }
        });
        
        // Show pagination again
        document.querySelector(".pagination").style.display = "flex";
        
        // Fetch first page of reports
        fetchSentReports(1);
    }
    
    // Add a clear search button if desired
    function addClearSearchButton() {
        const searchDiv = document.querySelector(".report-search");
        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.innerHTML = '<i class="fas fa-times"></i>';
        clearButton.className = "clear-search-btn";
        clearButton.title = "Clear search";
        clearButton.addEventListener("click", resetSearch);
        
        searchDiv.appendChild(clearButton);
    }
    
    // Add this if you want a clear search button
    addClearSearchButton();
});




// dropdown


function downloadReportAsPDF(patient, date, title, category) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        // Add Title to the PDF
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("NeuroCare Medical Report", 105, 20, null, null, "center"); // Title at the top of the page
    
        // Add Report ID
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Report ID: ${patient}`, 10, 30);
    
        // Add Patient's Email
        doc.text(`Patient Email: ${date}`, 10, 40);
    
        // Add Description
        doc.text(`Description:`, 10, 50);
        doc.setFontSize(10);
        doc.text(title, 10, 55, { maxWidth: 180 }); // Description with word wrap
    
        // Add Status
        doc.setFontSize(12);
        doc.text(`Status: ${category}`, 10, 70);
    
        // Add Date
        doc.text(`Date: ${new Date().toLocaleString()}`, 10, 80);
    
        // Add a line for separation
        doc.setLineWidth(0.5);
        doc.line(10, 90, 200, 90);  // Draw a horizontal line
    
        // Add Footer (if needed)
        doc.setFontSize(8);
        doc.text("This is a generated report from NeuroCare Medical.", 10, 280);
    
        // Save the PDF with a dynamic file name
        doc.save(`Report_${patient}.pdf`);
    }