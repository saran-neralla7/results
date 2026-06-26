document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Logic
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  });

  // DOM Elements
  const uploadScreen = document.getElementById('upload-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const uploadAnotherBtn = document.getElementById('upload-another-btn');
  const loadDemoBtn = document.getElementById('load-demo-btn');
  
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const workspace = document.getElementById('workspace');
  const loadingSpinner = document.getElementById('loading-spinner');
  
  // File Selector for Batch
  const fileSelectorContainer = document.getElementById('file-selector-container');
  const activeFileSelect = document.getElementById('active-file-select');
  
  const viewOriginal = document.getElementById('view-original');
  const viewStructured = document.getElementById('view-structured');
  const structuredTablesContainer = document.getElementById('structured-tables-container');
  
  const tabOriginal = document.getElementById('tab-original');
  const tabStructured = document.getElementById('tab-structured');
  const tabAnalytics = document.getElementById('tab-analytics');
  const viewAnalytics = document.getElementById('view-analytics');
  const tabMemos = document.getElementById('tab-memos');
  const viewMemos = document.getElementById('view-memos');
  const memoSearchInput = document.getElementById('memo-search-input');
  const memoStudentList = document.getElementById('memo-student-list');
  const memoGradeCardContainer = document.getElementById('memo-grade-card-container');
  const printMemoBtn = document.getElementById('print-memo-btn');
  
  const downloadExactBtn = document.getElementById('download-exact-btn');
  const downloadCleanBtn = document.getElementById('download-clean-btn');
  const exportScopeSelect = document.getElementById('export-scope-select');
  
  // Table Controls (Search & Filter)
  const studentSearchInput = document.getElementById('student-search-input');
  const statusFilterSelect = document.getElementById('status-filter-select');
  
  // Stats Elements
  const statCollege = document.getElementById('stat-college');
  const statGroup = document.getElementById('stat-group');
  const statTotal = document.getElementById('stat-total');
  const statPassRate = document.getElementById('stat-pass-rate');
  const statAvgSgpa = document.getElementById('stat-avg-sgpa');
  const statMaxSgpa = document.getElementById('stat-max-sgpa');

  // Custom Success Modal Elements
  const successModal = document.getElementById('success-modal');
  const modalSuccessDesc = document.getElementById('modal-success-desc');
  const previewCollege = document.getElementById('preview-college');
  const previewGroup = document.getElementById('preview-group');
  const previewSubjects = document.getElementById('preview-subjects');
  const modalViewReportBtn = document.getElementById('modal-view-report-btn');

  // Analytics Elements
  const analyticsContainer = document.getElementById('analytics-container');
  const printAnalyticsBtn = document.getElementById('print-analytics-btn');

  // State (Batch Processing)
  let reports = []; // Array of { filename, sheetName, collegeName, groupName, subjects, students, html }
  let activeReportIdx = 0;
  let parsedData = null; // Points to current active report details
  let currentFileName = "marks_gally";

  // Drag and Drop Handlers
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  });

  // Demo Button Click Handler
  loadDemoBtn.addEventListener('click', () => {
    showLoading(true);
    fetch('B 19 MKGLYgr.html')
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw new Error("Could not find the sample B 19 MKGLYgr.html file.");
      })
      .then(htmlText => {
        // Simulate file object
        const demoFiles = [{
          name: "B 19 MKGLYgr.html",
          text: () => Promise.resolve(htmlText)
        }];
        handleDemoFile(demoFiles[0]);
      })
      .catch(err => {
        showLoading(false);
        alert(err.message + "\n\nPlease drag and drop or select your own marks gally report file instead.");
      });
  });

  // Modal View Report CTA Handler
  modalViewReportBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
    uploadScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    uploadAnotherBtn.classList.remove('hidden');
  });

  // Upload Another File Handler (Go back to Landing page)
  uploadAnotherBtn.addEventListener('click', () => {
    dashboardScreen.classList.add('hidden');
    uploadAnotherBtn.classList.add('hidden');
    uploadScreen.classList.remove('hidden');
    fileInput.value = ""; // Clear file choice
  });

  // Tab switching
  [tabOriginal, tabStructured, tabAnalytics, tabMemos].forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const activeTab = tabBtn.getAttribute('data-tab');
      
      tabOriginal.classList.remove('active');
      tabStructured.classList.remove('active');
      tabAnalytics.classList.remove('active');
      tabMemos.classList.remove('active');
      tabBtn.classList.add('active');
      
      // Update body class for print queries
      document.body.classList.remove('active-tab-original', 'active-tab-structured', 'active-tab-analytics', 'active-tab-memos');
      document.body.classList.add(`active-tab-${activeTab}`);
      
      if (activeTab === 'original') {
        viewOriginal.classList.remove('hidden');
        viewStructured.classList.add('hidden');
        viewAnalytics.classList.add('hidden');
        viewMemos.classList.add('hidden');
      } else if (activeTab === 'structured') {
        viewOriginal.classList.add('hidden');
        viewStructured.classList.remove('hidden');
        viewAnalytics.classList.add('hidden');
        viewMemos.classList.add('hidden');
      } else if (activeTab === 'analytics') {
        viewOriginal.classList.add('hidden');
        viewStructured.classList.add('hidden');
        viewAnalytics.classList.remove('hidden');
        viewMemos.classList.add('hidden');
      } else if (activeTab === 'memos') {
        viewOriginal.classList.add('hidden');
        viewStructured.classList.add('hidden');
        viewAnalytics.classList.add('hidden');
        viewMemos.classList.remove('hidden');
        // Render memo sidebar list on tab activation
        renderMemoSidebar();
      }
    });
  });

  // Print PDF Event Listeners
  printAnalyticsBtn.addEventListener('click', () => {
    window.print();
  });

  printMemoBtn.addEventListener('click', () => {
    window.print();
  });

  // Export Scope Selector Listener (updates Clean Table & Report Cards instantly)
  exportScopeSelect.addEventListener('change', () => {
    if (parsedData) {
      renderStructuredTable(parsedData);
      filterTable(); // Re-apply search/filters if any
    }
    const activeMemoItem = memoStudentList.querySelector('.memo-student-item.active');
    if (activeMemoItem) {
      activeMemoItem.click(); // Re-trigger rendering to hide/show columns
    }
  });

  // Switch Active File Selector Event Listener
  activeFileSelect.addEventListener('change', (e) => {
    activeReportIdx = parseInt(e.target.value, 10);
    if (reports[activeReportIdx]) {
      displayReport(reports[activeReportIdx]);
    }
  });

  // Parse complete report (supporting multi-page Oracle Reports with multiple tables)
  function parseReportFromHtml(htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const sourceTables = Array.from(doc.querySelectorAll('table'));
    
    if (sourceTables.length === 0) {
      throw new Error("Could not find any table elements inside the report.");
    }
    
    let collegeName = "GAYATRI VIDYA PARISHAD COLLEGE";
    let groupName = "";
    const subjects = [];
    const students = [];
    const pages = [];
    const htmlParts = [];
    
    sourceTables.forEach((tableEl, tblIdx) => {
      const grid = buildGridFromTable(tableEl);
      if (grid.length > 0) {
        const metadata = extractData(grid);
        
        // Only merge if the table contains student records (ignores signature-only tables)
        if (metadata && metadata.students && metadata.students.length > 0) {
          if (!collegeName || collegeName === "GAYATRI VIDYA PARISHAD COLLEGE") {
            if (metadata.collegeName) collegeName = metadata.collegeName;
          }
          if (!groupName) {
            if (metadata.groupName) groupName = metadata.groupName;
          }
          
          // Merge subjects (uniquely by name)
          metadata.subjects.forEach(sub => {
            if (!subjects.some(existingSub => existingSub.name === sub.name)) {
              subjects.push(sub);
            }
          });
          
          // Merge students (uniquely by regdNo)
          metadata.students.forEach(stud => {
            if (!students.some(existingStud => existingStud.regdNo === stud.regdNo)) {
              students.push(stud);
            }
          });

          // Extract page number from text inside tableEl
          let pageNo = pages.length + 1;
          const pageMatch = tableEl.textContent.match(/Page\s*No\s*:\s*(\d+)/i);
          if (pageMatch) {
            pageNo = parseInt(pageMatch[1], 10);
          }

          pages.push({
            pageNo: pageNo,
            groupName: metadata.groupName || groupName || "B.Tech",
            subjects: metadata.subjects,
            students: metadata.students
          });
        }
        
        // Save HTML for original view
        tableEl.classList.add('oracle-report-table');
        htmlParts.push(tableEl.outerHTML);
      }
    });
    
    if (students.length === 0) {
      throw new Error("No student records could be parsed from the file.");
    }
    
    return {
      collegeName: collegeName,
      groupName: groupName || "B.Tech",
      subjects: subjects,
      students: students,
      pages: pages,
      html: htmlParts.join('<div class="page-separator"><hr size="5" noshade></div>')
    };
  }

  // Read and parse multiple files sequentially (Batch Processing)
  function handleFiles(filesList) {
    showLoading(true);
    reports = []; // Reset reports
    
    const files = Array.from(filesList);
    let index = 0;
    
    function readNext() {
      if (index >= files.length) {
        if (reports.length > 0) {
          setupDashboard();
        } else {
          showLoading(false);
        }
        return;
      }
      
      const file = files[index];
      const filename = file.name.replace(/\.[^/.]+$/, "");
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const htmlText = e.target.result;
        try {
          const reportMetadata = parseReportFromHtml(htmlText);
          
          // Shorten filename to 30 characters for Excel sheet name limit (31 chars)
          const sheetName = filename.replace(/[\\\/\?\*\[\]]/g, "").substring(0, 30) || `Sheet ${index + 1}`;
          
          reports.push({
            filename: filename,
            sheetName: sheetName,
            collegeName: reportMetadata.collegeName,
            groupName: reportMetadata.groupName,
            subjects: reportMetadata.subjects,
            students: reportMetadata.students,
            pages: reportMetadata.pages,
            html: reportMetadata.html
          });
        } catch (err) {
          console.error(err);
          alert(`Error parsing file "${file.name}": ${err.message}`);
        }
        index++;
        readNext();
      };
      
      reader.onerror = () => {
        alert(`Error reading file "${file.name}"`);
        index++;
        readNext();
      };
      
      reader.readAsText(file);
    }
    
    readNext();
  }

  // Handle Demo file specifically
  function handleDemoFile(demoFile) {
    demoFile.text().then(htmlText => {
      try {
        reports = [];
        const reportMetadata = parseReportFromHtml(htmlText);
        
        reports.push({
          filename: "B 19 MKGLYgr",
          sheetName: "B 19 MKGLYgr",
          collegeName: reportMetadata.collegeName,
          groupName: reportMetadata.groupName,
          subjects: reportMetadata.subjects,
          students: reportMetadata.students,
          pages: reportMetadata.pages,
          html: reportMetadata.html
        });
        
        setupDashboard();
      } catch (err) {
        showLoading(false);
        alert("Demo file parsing error: " + err.message);
      }
    });
  }

  // Initialize and pop success modal
  function setupDashboard() {
    showLoading(false);
    
    // Handle File Selector
    if (reports.length > 1) {
      fileSelectorContainer.classList.remove('hidden');
      activeFileSelect.innerHTML = "";
      reports.forEach((report, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = report.filename;
        activeFileSelect.appendChild(option);
      });
      activeFileSelect.value = 0;
    } else {
      fileSelectorContainer.classList.add('hidden');
    }
    
    activeReportIdx = 0;
    displayReport(reports[activeReportIdx]);
    
    // Set success modal description
    const fileCount = reports.length;
    const totalStudents = reports.reduce((sum, r) => sum + r.students.length, 0);
    
    if (fileCount === 1) {
      modalSuccessDesc.textContent = `Your file has been processed successfully. We parsed ${totalStudents} candidate record${totalStudents === 1 ? '' : 's'}.`;
    } else {
      modalSuccessDesc.textContent = `Successfully processed ${fileCount} files. We parsed ${totalStudents} candidate record${totalStudents === 1 ? '' : 's'} in total.`;
    }
    
    const activeRep = reports[0];
    previewCollege.textContent = activeRep.collegeName.replace(/\(AUTONOMOUS\).*/, " (AUTONOMOUS)");
    previewGroup.textContent = fileCount === 1 ? activeRep.groupName : `${fileCount} Reports (e.g. ${activeRep.groupName})`;
    previewSubjects.textContent = activeRep.subjects.map(s => s.name).join(', ');
    
    successModal.classList.remove('hidden');
  }

  // Render currently selected report in dashboard
  function displayReport(report) {
    parsedData = report;
    currentFileName = report.filename;
    
    // 1. Render original report layout
    viewOriginal.innerHTML = report.html;
    
    // 2. Update stats panels
    updateStats(report);
    
    // 3. Render Cleaned structured table
    renderStructuredTable(report);
    
    // 4. Render Analytics calculations
    renderAnalytics(report);
    
    // 5. Reset Search and Filter states
    studentSearchInput.value = "";
    statusFilterSelect.value = "all";
  }

  // Show/Hide Loading spinner
  function showLoading(show) {
    if (show) {
      loadingSpinner.style.display = 'flex';
    } else {
      loadingSpinner.style.display = 'none';
    }
  }

  // Build dense 2D grid matrix expanding rowspans and colspans
  function buildGridFromTable(tableEl) {
    const trs = Array.from(tableEl.querySelectorAll('tr'));
    if (trs.length === 0) return [];

    let totalCols = 0;
    const firstRowCells = Array.from(trs[0].querySelectorAll('td, th'));
    firstRowCells.forEach(cell => {
      totalCols += parseInt(cell.getAttribute('colspan') || '1', 10);
    });

    if (totalCols === 0) {
      totalCols = 56; // Standard fallback for GVP gally report
    }

    const totalRows = trs.length;
    const grid = Array.from({ length: totalRows }, () => Array(totalCols).fill(null));

    trs.forEach((tr, rIdx) => {
      const cells = Array.from(tr.querySelectorAll('td, th'));
      let colIdx = 0;

      cells.forEach(cell => {
        while (colIdx < totalCols && grid[rIdx][colIdx] !== null) {
          colIdx++;
        }

        if (colIdx >= totalCols) return;

        const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
        const rowspan = parseInt(cell.getAttribute('rowspan') || '1', 10);
        const text = cell.textContent ? cell.textContent.trim() : "";

        const cellInfo = {
          text: text,
          colspan: colspan,
          rowspan: rowspan,
          align: cell.getAttribute('align') || 'left',
          isOrigin: true
        };

        for (let dr = 0; dr < rowspan; dr++) {
          for (let dc = 0; dc < colspan; dc++) {
            const trgRow = rIdx + dr;
            const trgCol = colIdx + dc;

            if (trgRow < totalRows && trgCol < totalCols) {
              grid[trgRow][trgCol] = {
                ...cellInfo,
                isOrigin: (dr === 0 && dc === 0),
                originR: rIdx,
                originC: colIdx
              };
            }
          }
        }
        colIdx += colspan;
      });
    });

    return grid;
  }

  // Extract structured data from grid matrix
  function extractData(grid) {
    const numRows = grid.length;
    const numCols = grid[0].length;

    let collegeName = "GAYATRI VIDYA PARISHAD COLLEGE";
    let groupName = "B.Tech - M E";
    let headerRowIdx = -1;
    
    const students = [];
    const subjects = [];

    // Find College Name and Group Name
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const cell = grid[r][c];
        if (cell && cell.isOrigin) {
          const text = cell.text;
          
          if (text.includes("GAYATRI VIDYA PARISHAD")) {
            collegeName = text.split("\n")[0].trim();
          }
          if (text.includes("GROUP :")) {
            for (let c2 = c + 1; c2 < numCols; c2++) {
              if (grid[r][c2] && grid[r][c2].isOrigin && grid[r][c2].text) {
                groupName = grid[r][c2].text.trim();
                break;
              }
            }
          }
          if (text === "REGD NO") {
            headerRowIdx = r;
          }
        }
      }
    }

    if (headerRowIdx === -1) {
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          if (grid[r][c] && grid[r][c].text.toLowerCase().includes("regd no")) {
            headerRowIdx = r;
            break;
          }
        }
        if (headerRowIdx !== -1) break;
      }
    }

    if (headerRowIdx === -1) {
      return {
        collegeName: collegeName,
        groupName: groupName,
        subjects: [],
        students: []
      };
    }

    let regdNoColStart = 4;
    let regdNoColEnd = 7;
    let nameColStart = 12;
    let nameColEnd = 14;
    let sgpaColStart = 29;
    let sgpaColEnd = 34;
    let cgpaColStart = 37;
    let cgpaColEnd = 38;
    let statusColStart = 42;
    let statusColEnd = 43;

    if (headerRowIdx !== -1) {
      const headerRow = grid[headerRowIdx];
      let currentCol = 0;
      
      while (currentCol < numCols) {
        const cell = headerRow[currentCol];
        if (cell && cell.isOrigin) {
          const text = cell.text.toUpperCase();
          const colSpan = cell.colspan;
          const colStart = currentCol;
          const colEnd = currentCol + colSpan - 1;

          if (text.includes("REGD")) {
            regdNoColStart = colStart;
            regdNoColEnd = colEnd;
          } else if (text.includes("NAME")) {
            nameColStart = colStart;
            nameColEnd = colEnd;
          } else if (text.includes("SGPA")) {
            sgpaColStart = colStart;
            sgpaColEnd = colEnd;
          } else if (text.includes("CGPA")) {
            cgpaColStart = colStart;
            cgpaColEnd = colEnd;
          } else if (text.includes("STATUS")) {
            statusColStart = colStart;
            statusColEnd = colEnd;
          } else if (text && text !== "SIGNATURE" && text !== "REGD NO" && text !== "NAME OF THE STUDENT") {
            subjects.push({
              name: cell.text.trim(),
              colStart: colStart,
              colEnd: colEnd
            });
          }
          currentCol += colSpan;
        } else {
          currentCol++;
        }
      }
    }

    if (subjects.length === 0) {
      subjects.push({ name: "PHY", colStart: 21, colEnd: 25 });
    }

    // Scan for student data rows
    for (let r = 0; r < numRows; r++) {
      let regdCell = null;

      for (let c = 0; c < numCols; c++) {
        const cell = grid[r][c];
        if (cell && cell.isOrigin) {
          const text = cell.text;
          if (/^\d{10}$/.test(text) || (/^[A-Z0-9]{10}$/i.test(text) && text.match(/\d/))) {
            regdCell = cell;
            break;
          }
        }
      }

      if (regdCell) {
        const regdNo = regdCell.text;
        
        let studentName = "";
        for (let c = nameColStart - 2; c <= nameColEnd + 3; c++) {
          if (c >= 0 && c < numCols && grid[r][c] && grid[r][c].isOrigin) {
            const txt = grid[r][c].text;
            if (txt && txt !== regdNo && !/^\d{10}$/.test(txt) && txt.length > 3 && txt === txt.toUpperCase()) {
              studentName = txt.split("\n")[0].trim();
              break;
            }
          }
        }

        let gender = "M"; 
        const searchGenderLimit = subjects[0].colStart;
        for (let c = nameColEnd + 1; c < searchGenderLimit; c++) {
          if (grid[r][c] && grid[r][c].isOrigin) {
            const txt = grid[r][c].text.trim();
            if (txt === "M" || txt === "F") {
              gender = txt;
              break;
            }
          }
        }

        let sgpa = "0.00";
        let cgpa = "0.00";
        let status = "PASS";

        // Parse SGPA: try exact column first, allowing integers and decimals
        let foundSgpa = false;
        for (let c = sgpaColStart; c <= sgpaColEnd; c++) {
          if (c >= 0 && c < numCols && grid[r][c] && grid[r][c].isOrigin) {
            const txt = grid[r][c].text.trim();
            if (/^\d+(\.\d+)?$/.test(txt)) {
              sgpa = txt;
              foundSgpa = true;
              break;
            }
          }
        }
        // Fallback: search adjacent columns
        if (!foundSgpa) {
          for (let c = sgpaColStart - 1; c <= sgpaColEnd + 2; c++) {
            if (c >= 0 && c < numCols && grid[r][c] && grid[r][c].isOrigin) {
              const txt = grid[r][c].text.trim();
              if (/^\d+(\.\d+)?$/.test(txt)) {
                sgpa = txt;
                break;
              }
            }
          }
        }

        // Parse CGPA: try exact column first, allowing integers and decimals
        let foundCgpa = false;
        for (let c = cgpaColStart; c <= cgpaColEnd; c++) {
          if (c >= 0 && c < numCols && grid[r][c] && grid[r][c].isOrigin) {
            const txt = grid[r][c].text.trim();
            if (/^\d+(\.\d+)?$/.test(txt)) {
              cgpa = txt;
              foundCgpa = true;
              break;
            }
          }
        }
        // Fallback: search adjacent columns
        if (!foundCgpa) {
          for (let c = cgpaColStart - 1; c <= cgpaColEnd + 2; c++) {
            if (c >= 0 && c < numCols && grid[r][c] && grid[r][c].isOrigin) {
              const txt = grid[r][c].text.trim();
              if (/^\d+(\.\d+)?$/.test(txt)) {
                cgpa = txt;
                break;
              }
            }
          }
        }

        for (let c = statusColStart - 1; c <= statusColEnd + 2; c++) {
          if (c >= 0 && c < numCols && grid[r][c] && grid[r][c].isOrigin) {
            const txt = grid[r][c].text.toUpperCase();
            if (txt === "PASS" || txt === "FAIL") {
              status = txt;
              break;
            }
          }
        }

        const subjectDetails = {};
        subjects.forEach(subj => {
          const cellValues = [];
          for (let c = subj.colStart - 1; c <= subj.colEnd + 1; c++) {
            if (c >= 0 && c < numCols && grid[r][c] && grid[r][c].isOrigin) {
              const txt = grid[r][c].text.trim();
              if (txt && txt !== studentName && txt !== regdNo && txt !== sgpa && txt !== cgpa && txt !== status && txt !== gender) {
                if (!cellValues.includes(txt)) {
                  cellValues.push(txt);
                }
              }
            }
          }

          let gradePoints = "-";
          let grade = "-";
          let credits = "-";

          const gradeIdx = cellValues.findIndex(v => /^[a-z\+\-]+$/i.test(v) && v !== "-");

          if (gradeIdx !== -1) {
            grade = cellValues[gradeIdx];
            
            if (gradeIdx === 1 && cellValues.length >= 3) {
              gradePoints = cellValues[0];
              credits = cellValues[2];
            } else if (gradeIdx === 0 && cellValues.length >= 3) {
              gradePoints = cellValues[1];
              credits = cellValues[2];
            } else if (cellValues.length === 2) {
              if (gradeIdx === 0) {
                credits = cellValues[1];
              } else {
                credits = cellValues[0];
              }
            }
          } else {
            cellValues.forEach(val => {
              if (/^[OABCDEFP]$/i.test(val) || val === "Ab" || val === "F" || val === "S" || val === "A+" || val === "B+") {
                grade = val;
              } else if (/^\d+$/.test(val)) {
                const numVal = parseInt(val, 10);
                if (numVal >= 1 && numVal <= 5) {
                  credits = numVal;
                } else if (numVal >= 0 && numVal <= 10) {
                  gradePoints = numVal;
                }
              }
            });
          }

          subjectDetails[subj.name] = {
            points: gradePoints,
            grade: grade,
            credits: credits,
            rawValues: cellValues
          };
        });

        students.push({
          regdNo: regdNo,
          name: studentName,
          gender: gender,
          branch: groupName,
          subjects: subjectDetails,
          sgpa: sgpa,
          cgpa: cgpa,
          status: status
        });
      }
    }

    return {
      collegeName: collegeName,
      groupName: groupName,
      subjects: subjects,
      students: students
    };
  }

  // Update Stats Cards
  function updateStats(report) {
    statCollege.textContent = report.collegeName;
    statGroup.textContent = report.groupName;
    statTotal.textContent = report.students.length;
    
    if (report.students.length > 0) {
      const passCount = report.students.filter(s => s.status.toUpperCase() === "PASS").length;
      const passRate = ((passCount / report.students.length) * 100).toFixed(0);
      statPassRate.textContent = `Pass Rate: ${passRate}% (${passCount}/${report.students.length})`;
      
      const sgpaSum = report.students.reduce((acc, curr) => acc + parseFloat(curr.sgpa || 0), 0);
      const avgSgpa = (sgpaSum / report.students.length).toFixed(2);
      statAvgSgpa.textContent = avgSgpa;
      
      const maxSgpa = Math.max(...report.students.map(s => parseFloat(s.sgpa || 0))).toFixed(2);
      statMaxSgpa.textContent = `Max SGPA: ${maxSgpa}`;
    } else {
      statPassRate.textContent = "Pass Rate: 0%";
      statAvgSgpa.textContent = "0.00";
      statMaxSgpa.textContent = "Max SGPA: 0.00";
    }
  }

  // Render Cleaned Data Table
  function renderStructuredTable(report) {
    const scope = exportScopeSelect.value;
    let tablesHtml = "";
    
    report.pages.forEach((page, pageIdx) => {
      let pageHeaderCols = `
        <th>Register No</th>
        <th>Student Name</th>
        <th>Gender</th>
        <th>Branch</th>
      `;
      
      page.subjects.forEach(subj => {
        pageHeaderCols += `<th>${subj.name} Grade</th>`;
        if (scope !== 'grades-only') {
          pageHeaderCols += `
            <th style="text-align: center;">${subj.name} Points</th>
            <th style="text-align: center;">${subj.name} Credits</th>
          `;
        }
      });
      
      pageHeaderCols += `
        <th>SGPA</th>
        <th>CGPA</th>
        <th>Status</th>
        <th style="text-align: center;">Actions</th>
      `;
      
      let rowsHtml = "";
      page.students.forEach(student => {
        let rowHtml = `
          <td style="font-weight: 600;">${student.regdNo}</td>
          <td style="font-weight: 500;">${student.name}</td>
          <td><span class="badge badge-info">${student.gender}</span></td>
          <td style="font-size: 12px; font-weight: 500; color: var(--text-secondary);">${student.branch || page.groupName}</td>
        `;
        
        page.subjects.forEach(subj => {
          const details = student.subjects[subj.name] || { grade: '-', points: '-', credits: '-' };
          const gradeClass = details.grade === 'F' || details.grade === 'Ab' ? 'badge-danger' : 'badge-success';
          rowHtml += `
            <td><span class="badge ${gradeClass}">${details.grade}</span></td>
          `;
          if (scope !== 'grades-only') {
            rowHtml += `
              <td style="text-align: center;">${details.points}</td>
              <td style="text-align: center;">${details.credits}</td>
            `;
          }
        });
        
        const statusBadgeClass = student.status === "PASS" ? "badge-success" : "badge-danger";
        rowHtml += `
          <td style="font-weight: 700; color: var(--primary);">${student.sgpa}</td>
          <td>${student.cgpa}</td>
          <td><span class="badge ${statusBadgeClass}">${student.status}</span></td>
          <td style="text-align: center;">
            <button class="btn-action-icon view-card-btn" data-regd="${student.regdNo}" data-report-idx="${activeReportIdx}" title="View & Print Report Card">
              <svg class="icon" viewBox="0 0 24 24" style="width: 15px; height: 15px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </button>
          </td>
        `;
        
        rowsHtml += `<tr data-status="${student.status}">${rowHtml}</tr>`;
      });
      
      tablesHtml += `
        <div class="page-structured-block" data-page-idx="${pageIdx}">
          <div class="page-structured-header">
            <h4 class="page-structured-title">
              <svg class="icon" viewBox="0 0 24 24" style="width: 18px; height: 18px; color: var(--primary);">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              ${page.groupName}
            </h4>
            <span class="page-structured-badge">Page ${page.pageNo}</span>
          </div>
          <div class="page-table-wrapper">
            <table class="structured-table">
              <thead>
                <tr>
                  ${pageHeaderCols}
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
    
    structuredTablesContainer.innerHTML = tablesHtml;
  }

  // Filter Table function (Search & Status combined)
  function filterTable() {
    const query = studentSearchInput.value.toLowerCase().trim();
    const statusFilter = statusFilterSelect.value;
    
    const blocks = Array.from(structuredTablesContainer.querySelectorAll('.page-structured-block'));
    
    blocks.forEach(block => {
      const rows = Array.from(block.querySelectorAll('.structured-table tbody tr'));
      let visibleRowsInBlock = 0;
      
      rows.forEach(row => {
        const regdNo = row.cells[0] ? row.cells[0].textContent.toLowerCase() : "";
        const name = row.cells[1] ? row.cells[1].textContent.toLowerCase() : "";
        const matchesQuery = regdNo.includes(query) || name.includes(query);
        
        const statusAttr = row.getAttribute('data-status') ? row.getAttribute('data-status').toLowerCase() : "";
        let matchesStatus = true;
        if (statusFilter === 'pass') {
          matchesStatus = statusAttr === 'pass';
        } else if (statusFilter === 'fail') {
          matchesStatus = statusAttr === 'fail';
        }
        
        if (matchesQuery && matchesStatus) {
          row.classList.remove('hidden');
          visibleRowsInBlock++;
        } else {
          row.classList.add('hidden');
        }
      });
      
      if (visibleRowsInBlock > 0) {
        block.classList.remove('hidden');
      } else {
        block.classList.add('hidden');
      }
    });
  }

  // Hook Search & Filter Events
  studentSearchInput.addEventListener('input', filterTable);
  statusFilterSelect.addEventListener('change', filterTable);

  // Render Subject-Wise Results Analytics
  function renderAnalytics(report) {
    analyticsContainer.innerHTML = "";
    
    // Group students by branch
    const branchMap = {};
    report.students.forEach(student => {
      const b = student.branch || report.groupName || "B.Tech";
      if (!branchMap[b]) {
        branchMap[b] = [];
      }
      branchMap[b].push(student);
    });
    
    // For each branch, build the analytics card
    Object.keys(branchMap).forEach(branchName => {
      const branchStudents = branchMap[branchName];
      
      // Determine subjects active for this branch
      const branchSubjects = report.subjects.filter(subj => {
        return branchStudents.some(s => {
          const detail = s.subjects[subj.name];
          return detail && detail.grade !== "-";
        });
      });
      
      const totalStudents = branchStudents.length;
      const totalPassed = branchStudents.filter(s => s.status.toUpperCase() === "PASS").length;
      const totalFailed = totalStudents - totalPassed;
      const overallPercent = totalStudents > 0 ? ((totalPassed / totalStudents) * 100).toFixed(1) + "%" : "0.0%";
      
      let tableRowsHtml = "";
      branchSubjects.forEach(subj => {
        let registered = 0;
        let passed = 0;
        let failed = 0;
        
        branchStudents.forEach(student => {
          const detail = student.subjects[subj.name];
          if (detail && detail.grade !== "-") {
            registered++;
            const grade = detail.grade.toUpperCase();
            if (grade !== "F" && grade !== "AB" && grade !== "Ab") {
              passed++;
            } else {
              failed++;
            }
          }
        });
        
        const passPercent = registered > 0 ? ((passed / registered) * 100).toFixed(1) + "%" : "0.0%";
        
        tableRowsHtml += `
          <tr>
            <td style="font-weight: 600; color: var(--text-primary);">${subj.name}</td>
            <td style="text-align: center; font-weight: 500;">${registered}</td>
            <td style="text-align: center; font-weight: 600; color: var(--success);">${passed}</td>
            <td style="text-align: center; font-weight: 600; color: ${failed > 0 ? 'var(--danger)' : 'var(--text-secondary)'};">${failed}</td>
            <td style="text-align: center; font-weight: 700; color: var(--primary);">${passPercent}</td>
          </tr>
        `;
      });
      
      let cleanCollege = report.collegeName;
      if (cleanCollege.includes("GAYATRI VIDYA PARISHAD")) {
        cleanCollege = "GAYATRI VIDYA PARISHAD COLLEGE FOR DEGREE & P.G. COURSES (AUTONOMOUS)";
      }
      
      const cardHtml = `
        <div class="analytics-card" style="margin-bottom: 30px;">
          <div class="analytics-print-header">
            <h2>${cleanCollege}</h2>
            <h3>Subject-Wise Results Analysis</h3>
            <p>Branch / Course Group: ${branchName}</p>
          </div>
          
          <div class="analytics-grid">
            <div class="analytics-summary-item">
              <span class="label">Total Students</span>
              <span class="value">${totalStudents}</span>
            </div>
            <div class="analytics-summary-item success">
              <span class="label">Total Passed</span>
              <span class="value">${totalPassed}</span>
            </div>
            <div class="analytics-summary-item danger">
              <span class="label">Total Failed</span>
              <span class="value">${totalFailed}</span>
            </div>
            <div class="analytics-summary-item teal">
              <span class="label">Overall Pass %</span>
              <span class="value">${overallPercent}</span>
            </div>
          </div>

          <table class="analytics-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th style="text-align: center;">Candidates Registered</th>
                <th style="text-align: center;">Passed</th>
                <th style="text-align: center;">Failed / Absent</th>
                <th style="text-align: center;">Pass Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </div>
      `;
      
      analyticsContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
  }

  // Excel Downloads
  
  // 1. Download Exact Layout (Supports Multi-Sheet Workbooks for Batch)
  downloadExactBtn.addEventListener('click', () => {
    if (reports.length === 0) return;

    try {
      const wb = XLSX.utils.book_new();
      const tempDiv = document.createElement('div');

      reports.forEach(report => {
        tempDiv.innerHTML = report.html;
        const table = tempDiv.querySelector('table');
        const ws = XLSX.utils.table_to_sheet(table, { raw: true });
        XLSX.utils.book_append_sheet(wb, ws, report.sheetName);
      });

      const outputFileName = reports.length === 1 ? `${currentFileName}_original.xlsx` : "combined_reports_original.xlsx";
      XLSX.writeFile(wb, outputFileName);
    } catch (err) {
      console.error(err);
      alert("Failed to export Excel exact layout: " + err.message);
    }
  });

  // 2. Download Clean Structured Table (Supports Multi-Sheet Workbooks for Batch)
  downloadCleanBtn.addEventListener('click', () => {
    if (reports.length === 0) return;

    const scope = exportScopeSelect.value;
    const wb = XLSX.utils.book_new();

    try {
      reports.forEach(report => {
        // Group students by branch name
        const branchMap = {};
        report.students.forEach(student => {
          const b = student.branch || report.groupName || "B.Tech";
          if (!branchMap[b]) {
            branchMap[b] = [];
          }
          branchMap[b].push(student);
        });

        // For each branch, create a separate sheet
        Object.keys(branchMap).forEach(branchName => {
          const branchStudents = branchMap[branchName];
          
          // Determine subjects active for this branch
          const branchSubjects = report.subjects.filter(subj => {
            return branchStudents.some(s => {
              const detail = s.subjects[subj.name];
              return detail && detail.grade !== "-";
            });
          });

          const sheetData = branchStudents.map(student => {
            const row = {
              "Register No": student.regdNo,
              "Student Name": student.name,
              "Gender": student.gender,
              "Branch": branchName
            };

            branchSubjects.forEach(subj => {
              const details = student.subjects[subj.name] || { grade: '-', points: '-', credits: '-' };
              row[`${subj.name} Grade`] = details.grade;
              if (scope !== 'grades-only') {
                row[`${subj.name} Points`] = details.points;
                row[`${subj.name} Credits`] = details.credits;
              }
            });

            row["SGPA"] = parseFloat(student.sgpa) || 0;
            row["CGPA"] = parseFloat(student.cgpa) || 0;
            row["Status"] = student.status;

            return row;
          });

          const ws = XLSX.utils.json_to_sheet(sheetData);
          
          // Auto-fit column widths
          const colWidths = Object.keys(sheetData[0]).map(key => {
            let maxLen = key.length;
            sheetData.forEach(row => {
              const val = row[key] ? row[key].toString() : "";
              if (val.length > maxLen) maxLen = val.length;
            });
            return { wch: maxLen + 2 };
          });
          ws['!cols'] = colWidths;

          // Determine sheet name (Excel limits sheet names to 31 characters)
          let finalSheetName = "";
          if (reports.length === 1) {
            finalSheetName = branchName.replace(/[\\\/\?\*\[\]]/g, "").substring(0, 30);
          } else {
            const shortReport = report.sheetName.substring(0, 15);
            const shortBranch = branchName.replace("B.Tech - ", "").replace(/[\\\/\?\*\[\]]/g, "").substring(0, 10);
            finalSheetName = `${shortReport} - ${shortBranch}`;
          }

          XLSX.utils.book_append_sheet(wb, ws, finalSheetName);
        });
      });

      const outputFileName = reports.length === 1 ? `${currentFileName}_clean.xlsx` : "combined_reports_clean.xlsx";
      XLSX.writeFile(wb, outputFileName);
    } catch (err) {
      console.error(err);
      alert("Failed to export clean Excel: " + err.message);
    }
  });

  // Redirect from Structured Table row action to Student Report Cards tab
  structuredTablesContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-card-btn');
    if (btn) {
      const regdNo = btn.getAttribute('data-regd');
      const repIdx = parseInt(btn.getAttribute('data-report-idx'), 10);
      
      // Select appropriate report context
      if (repIdx !== activeReportIdx) {
        activeReportIdx = repIdx;
        activeFileSelect.value = repIdx;
        displayReport(reports[activeReportIdx]);
      }
      
      // Go to memos tab
      tabMemos.click();
      
      // Search or select this student in report card view
      memoSearchInput.value = regdNo;
      renderMemoSidebar(regdNo);
      
      // Select the student item and display
      const firstItem = memoStudentList.querySelector('.memo-student-item');
      if (firstItem) {
        firstItem.click();
      }
    }
  });

  // Hook Search for Memos tab
  memoSearchInput.addEventListener('input', (e) => {
    renderMemoSidebar(e.target.value);
  });

  // 1. Render Student Sidebar for Report Cards
  function renderMemoSidebar(searchQuery = '') {
    const query = searchQuery.toLowerCase().trim();
    memoStudentList.innerHTML = '';
    
    let matchedStudents = [];
    
    // If query is empty, show all students in current active file (parsedData)
    if (!query) {
      if (parsedData) {
        matchedStudents = parsedData.students.map(s => ({
          student: s,
          report: parsedData,
          reportIdx: activeReportIdx
        }));
      }
    } else {
      // Search across ALL uploaded files
      reports.forEach((rep, repIdx) => {
        rep.students.forEach(s => {
          if (s.regdNo.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)) {
            matchedStudents.push({
              student: s,
              report: rep,
              reportIdx: repIdx
            });
          }
        });
      });
    }
    
    if (matchedStudents.length === 0) {
      memoStudentList.innerHTML = `
        <div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 20px;">
          No students found.
        </div>
      `;
      return;
    }
    
    // Render the student items
    matchedStudents.forEach(({ student, report, reportIdx }) => {
      const item = document.createElement('div');
      item.className = 'memo-student-item';
      
      // Check if this item is currently selected
      const activeCard = memoGradeCardContainer.querySelector('.student-memo-card');
      const isCurrentlySelected = activeCard && 
        memoGradeCardContainer.querySelector('.info-row .value').textContent === student.regdNo;
        
      if (isCurrentlySelected) {
        item.classList.add('active');
      }
      
      const badgeHtml = reports.length > 1 ? `<span class="student-badge">${report.sheetName}</span>` : '';
      
      item.innerHTML = `
        <div class="student-name">${student.name}</div>
        <div class="student-meta">
          <span>${student.regdNo}</span>
          ${badgeHtml}
        </div>
      `;
      
      item.addEventListener('click', () => {
        // Remove active class from all items
        Array.from(memoStudentList.querySelectorAll('.memo-student-item')).forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        
        // Render Grade Card
        renderStudentGradeCard(student, report, reportIdx);
      });
      
      memoStudentList.appendChild(item);
    });
  }

  // 2. Render Student Grade Card
  function renderStudentGradeCard(student, report, reportIdx) {
    const scope = exportScopeSelect.value;
    
    // Switch active report context if different
    if (reportIdx !== activeReportIdx) {
      activeReportIdx = reportIdx;
      activeFileSelect.value = reportIdx;
      displayReport(reports[activeReportIdx]);
      // Re-trigger sidebar search view to keep it synchronized
      renderMemoSidebar(memoSearchInput.value);
    }
    
    // Build grades table rows
    let gradesRowsHtml = '';
    report.subjects.forEach(subj => {
      const details = student.subjects[subj.name] || { grade: '-', points: '-', credits: '-' };
      const pointsCol = scope !== 'grades-only' ? `<td style="text-align: center;">${details.points}</td>` : '';
      const creditsCol = scope !== 'grades-only' ? `<td style="text-align: center;">${details.credits}</td>` : '';
      
      const gradeText = details.grade === 'Ab' ? 'Absent' : details.grade;
      const isPass = details.grade !== 'F' && details.grade !== 'Ab' && details.grade !== '-';
      const resultText = details.grade === '-' ? '-' : (isPass ? 'PASS' : 'FAIL');
      const resultStyle = isPass ? 'color: var(--success); font-weight: 600;' : 'color: var(--danger); font-weight: 600;';
      
      gradesRowsHtml += `
        <tr>
          <td style="font-weight: 600;">${subj.name}</td>
          <td style="text-align: center; font-weight: 700;">${details.grade}</td>
          ${pointsCol}
          ${creditsCol}
          <td style="text-align: center; ${resultStyle}">${resultText}</td>
        </tr>
      `;
    });
    
    const pointsHeader = scope !== 'grades-only' ? `<th style="text-align: center;">Grade Points</th>` : '';
    const creditsHeader = scope !== 'grades-only' ? `<th style="text-align: center;">Credits</th>` : '';
    
    const statusClass = student.status === 'PASS' ? 'pass' : 'fail';
    
    // Clean college name: strip "(AUTONOMOUS)" formatting if duplicated
    let cleanCollege = report.collegeName;
    if (cleanCollege.includes("GAYATRI VIDYA PARISHAD")) {
      cleanCollege = "GAYATRI VIDYA PARISHAD COLLEGE FOR DEGREE & P.G. COURSES (AUTONOMOUS)";
    }
    
    memoGradeCardContainer.innerHTML = `
      <div class="student-memo-card">
        <div class="memo-header">
          <div class="college-name">${cleanCollege}</div>
          <div class="accreditation">Re-accredited by NAAC with 'A' Grade | Affiliated to Andhra University</div>
          <div class="location">Madhurawada, Visakhapatnam - 530048</div>
        </div>
        
        <div class="memo-title">Provisional Marks Memorandum</div>
        
        <div class="memo-student-info">
          <div class="info-row">
            <span class="label">Register Number:</span>
            <span class="value">${student.regdNo}</span>
          </div>
          <div class="info-row">
            <span class="label">Student Name:</span>
            <span class="value">${student.name}</span>
          </div>
          <div class="info-row">
            <span class="label">Course & Branch:</span>
            <span class="value">${student.branch || report.groupName}</span>
          </div>
          <div class="info-row">
            <span class="label">Gender:</span>
            <span class="value">${student.gender === 'M' ? 'MALE' : 'FEMALE'}</span>
          </div>
        </div>
        
        <div class="memo-grades-table-wrapper">
          <table class="memo-grades-table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th style="text-align: center;">Grade Obtained</th>
                ${pointsHeader}
                ${creditsHeader}
                <th style="text-align: center;">Result</th>
              </tr>
            </thead>
            <tbody>
              ${gradesRowsHtml}
            </tbody>
          </table>
        </div>
        
        <div class="memo-summary-footer">
          <div>SGPA: <span style="color: var(--primary); margin-left: 5px;">${student.sgpa}</span></div>
          <div>CGPA: <span style="color: var(--text-primary); margin-left: 5px;">${student.cgpa}</span></div>
          <div style="display: flex; align-items: center; gap: 8px;">
            Result: 
            <span class="result-badge ${statusClass}">${student.status}</span>
          </div>
        </div>
        
        <div class="memo-signatures">
          <div class="sig-col">
            <div class="sig-line"></div>
            <span>Prepared By</span>
          </div>
          <div class="sig-col">
            <div class="sig-line"></div>
            <span>Checked By</span>
          </div>
          <div class="sig-col">
            <div class="sig-line"></div>
            <span>Controller of Examinations</span>
          </div>
        </div>
      </div>
    `;
  }
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('[PWA] Service Worker registered successfully with scope:', reg.scope);
        
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available, ready to activate.');
            }
          });
        });
      })
      .catch(err => console.log('[PWA] Service Worker registration failed:', err));
  });

  // Reload page when new service worker takes control
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[PWA] Controller changed, reloading page...');
      window.location.reload();
    }
  });
}
