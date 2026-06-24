document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Logic
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  
  // App starts with light theme by default. Toggle adds dark-theme class.
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
  
  const viewOriginal = document.getElementById('view-original');
  const viewStructured = document.getElementById('view-structured');
  const structuredHeaders = document.getElementById('structured-headers');
  const structuredBody = document.getElementById('structured-body');
  
  const tabOriginal = document.getElementById('tab-original');
  const tabStructured = document.getElementById('tab-structured');
  
  const downloadExactBtn = document.getElementById('download-exact-btn');
  const downloadCleanBtn = document.getElementById('download-clean-btn');
  const exportScopeSelect = document.getElementById('export-scope-select');
  
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

  // State
  let parsedData = null;
  let currentFileContent = "";
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
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
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
        currentFileContent = htmlText;
        currentFileName = "B 19 MKGLYgr";
        processHTML(htmlText);
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
  [tabOriginal, tabStructured].forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const activeTab = tabBtn.getAttribute('data-tab');
      
      tabOriginal.classList.remove('active');
      tabStructured.classList.remove('active');
      tabBtn.classList.add('active');
      
      if (activeTab === 'original') {
        viewOriginal.classList.remove('hidden');
        viewStructured.classList.add('hidden');
      } else {
        viewOriginal.classList.add('hidden');
        viewStructured.classList.remove('hidden');
      }
    });
  });

  // Export Scope Selector Event Listener
  exportScopeSelect.addEventListener('change', () => {
    if (parsedData) {
      renderStructuredTable(parsedData);
    }
  });

  // Read file contents
  function handleFile(file) {
    currentFileName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
    const reader = new FileReader();
    reader.onloadstart = () => {
      showLoading(true);
    };
    reader.onload = (e) => {
      currentFileContent = e.target.result;
      processHTML(currentFileContent);
    };
    reader.onerror = () => {
      alert("Error reading file!");
      showLoading(false);
    };
    reader.readAsText(file);
  }

  // Show/Hide Loading
  function showLoading(show) {
    if (show) {
      loadingSpinner.style.display = 'flex';
    } else {
      loadingSpinner.style.display = 'none';
    }
  }

  // Parse HTML content
  function processHTML(htmlText) {
    try {
      // 1. Parse table
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const sourceTable = doc.querySelector('table');
      
      if (!sourceTable) {
        throw new Error("Could not find table in the HTML file.");
      }

      // Add a specific class to style it
      sourceTable.classList.add('oracle-report-table');
      viewOriginal.innerHTML = "";
      viewOriginal.appendChild(sourceTable.cloneNode(true));

      // 2. Parse into dense 2D grid matrix
      const grid = buildGridFromTable(sourceTable);
      
      if (grid.length === 0) {
        throw new Error("Table contains no rows.");
      }

      // 3. Extract metadata, subjects, and student records
      const reportMetadata = extractData(grid);
      parsedData = reportMetadata;

      // 4. Update stats cards
      updateStats(reportMetadata);

      // 5. Render structured table
      renderStructuredTable(reportMetadata);

      // 6. Populate Success Modal Details
      const studentCount = reportMetadata.students.length;
      modalSuccessDesc.textContent = `Your file has been processed successfully. We parsed ${studentCount} candidate record${studentCount === 1 ? '' : 's'}.`;
      previewCollege.textContent = reportMetadata.collegeName.replace(/\(AUTONOMOUS\).*/, " (AUTONOMOUS)");
      previewGroup.textContent = reportMetadata.groupName;
      previewSubjects.textContent = reportMetadata.subjects.map(s => s.name).join(', ');

      // 7. Show success popup modal
      showLoading(false);
      successModal.classList.remove('hidden');
      
    } catch (err) {
      showLoading(false);
      console.error(err);
      alert("Failed to parse the marks gally file: " + err.message);
    }
  }

  // Build dense 2D grid matrix expanding rowspans and colspans
  function buildGridFromTable(tableEl) {
    const trs = Array.from(tableEl.querySelectorAll('tr'));
    if (trs.length === 0) return [];

    // Compute total column count by summing the colspans of the first row (the spacer row)
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
        // Find next unoccupied column in this grid row
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

    // Find College Name and Group Name (pre-headers)
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const cell = grid[r][c];
        if (cell && cell.isOrigin) {
          const text = cell.text;
          
          if (text.includes("GAYATRI VIDYA PARISHAD")) {
            collegeName = text.split("\n")[0].trim();
          }
          if (text.includes("GROUP :")) {
            // Find next non-empty cell in the row which contains group name
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
      // Fallback search for REGD NO
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

    // Default column boundaries based on header positioning
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

    // Detect subjects and columns from the header row
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
            // It is a Subject! (e.g. PHY)
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

    // If no subjects found, default to PHY spanning 21..25
    if (subjects.length === 0) {
      subjects.push({
        name: "PHY",
        colStart: 21,
        colEnd: 25
      });
    }

    // Now, scan for student data rows
    for (let r = 0; r < numRows; r++) {
      let regdCell = null;
      let regdCol = -1;

      for (let c = 0; c < numCols; c++) {
        const cell = grid[r][c];
        if (cell && cell.isOrigin) {
          const text = cell.text;
          // Look for register numbers (alphanumeric or numeric, usually 10 characters)
          if (/^\d{10}$/.test(text) || (/^[A-Z0-9]{10}$/i.test(text) && text.match(/\d/))) {
            regdCell = cell;
            regdCol = c;
            break;
          }
        }
      }

      if (regdCell) {
        const regdNo = regdCell.text;
        
        // Extract Name - look in the Name column range
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

        // Extract Gender (usually 'M' or 'F' positioned between Name and the first subject)
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

        // Extract SGPA, CGPA, Status
        let sgpa = "0.00";
        let cgpa = "0.00";
        let status = "PASS";

        // Find SGPA
        for (let c = sgpaColStart - 1; c <= sgpaColEnd + 2; c++) {
          if (c >= 0 && c < numCols && grid[r][c] && grid[r][c].isOrigin) {
            const txt = grid[r][c].text;
            if (/^\d\.\d{2}$/.test(txt) || /^\d+\.\d+$/.test(txt)) {
              sgpa = txt;
              break;
            }
          }
        }

        // Find CGPA
        for (let c = cgpaColStart - 1; c <= cgpaColEnd + 2; c++) {
          if (c >= 0 && c < numCols && grid[r][c] && grid[r][c].isOrigin) {
            const txt = grid[r][c].text;
            if (/^\d\.\d{2}$/.test(txt) || /^\d+\.\d+$/.test(txt)) {
              cgpa = txt;
            }
          }
        }

        // Find Status
        for (let c = statusColStart - 1; c <= statusColEnd + 2; c++) {
          if (c >= 0 && c < numCols && grid[r][c] && grid[r][c].isOrigin) {
            const txt = grid[r][c].text.toUpperCase();
            if (txt === "PASS" || txt === "FAIL") {
              status = txt;
              break;
            }
          }
        }

        // Extract details for each subject
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

          // Find where the grade is in the cell values
          // Grade is a letter string (excluding hyphens or purely numbers)
          const gradeIdx = cellValues.findIndex(v => /^[a-z\+\-]+$/i.test(v) && v !== "-");

          if (gradeIdx !== -1) {
            grade = cellValues[gradeIdx];
            
            if (gradeIdx === 1 && cellValues.length >= 3) {
              // Order is [Points, Grade, Credits] (e.g. B 19 MKGLYgr.html)
              gradePoints = cellValues[0];
              credits = cellValues[2];
            } else if (gradeIdx === 0 && cellValues.length >= 3) {
              // Order is [Grade, Points, Credits] (e.g. B.Tech - C E report)
              gradePoints = cellValues[1];
              credits = cellValues[2];
            } else if (cellValues.length === 2) {
              // Fallback for 2 values (e.g. if Points are omitted)
              if (gradeIdx === 0) {
                credits = cellValues[1];
              } else {
                credits = cellValues[0];
              }
            }
          } else {
            // Fallback to old heuristic if no alphabetical grade letter is found
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
  function updateStats(data) {
    statCollege.textContent = data.collegeName;
    statGroup.textContent = data.groupName;
    statTotal.textContent = data.students.length;
    
    if (data.students.length > 0) {
      const passCount = data.students.filter(s => s.status.toUpperCase() === "PASS").length;
      const passRate = ((passCount / data.students.length) * 100).toFixed(0);
      statPassRate.textContent = `Pass Rate: ${passRate}% (${passCount}/${data.students.length})`;
      
      const sgpaSum = data.students.reduce((acc, curr) => acc + parseFloat(curr.sgpa || 0), 0);
      const avgSgpa = (sgpaSum / data.students.length).toFixed(2);
      statAvgSgpa.textContent = avgSgpa;
      
      const maxSgpa = Math.max(...data.students.map(s => parseFloat(s.sgpa || 0))).toFixed(2);
      statMaxSgpa.textContent = `Max SGPA: ${maxSgpa}`;
    } else {
      statPassRate.textContent = "Pass Rate: 0%";
      statAvgSgpa.textContent = "0.00";
      statMaxSgpa.textContent = "Max SGPA: 0.00";
    }
  }

  // Render Cleaned Data Table
  function renderStructuredTable(data) {
    const scope = exportScopeSelect.value;
    
    let headerHtml = `
      <th>Register No</th>
      <th>Student Name</th>
      <th>Gender</th>
    `;

    data.subjects.forEach(subj => {
      headerHtml += `
        <th>${subj.name} Grade</th>
      `;
      if (scope !== 'grades-only') {
        headerHtml += `
          <th>${subj.name} Points</th>
          <th>${subj.name} Credits</th>
        `;
      }
    });

    headerHtml += `
      <th>SGPA</th>
      <th>CGPA</th>
      <th>Status</th>
    `;
    structuredHeaders.innerHTML = headerHtml;

    let bodyHtml = "";
    data.students.forEach(student => {
      let rowHtml = `
        <td style="font-weight: 600;">${student.regdNo}</td>
        <td style="font-weight: 500;">${student.name}</td>
        <td><span class="badge badge-info">${student.gender}</span></td>
      `;

      data.subjects.forEach(subj => {
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
      `;

      bodyHtml += `<tr>${rowHtml}</tr>`;
    });

    structuredBody.innerHTML = bodyHtml;
  }

  // Excel Downloads
  
  // 1. Download Exact Layout
  downloadExactBtn.addEventListener('click', () => {
    if (!parsedData) return;
    
    const tableEl = viewOriginal.querySelector('table');
    if (!tableEl) {
      alert("No original table element found to export.");
      return;
    }

    try {
      const wb = XLSX.utils.table_to_book(tableEl, { raw: true });
      XLSX.writeFile(wb, `${currentFileName}_original.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Failed to export Excel exact layout: " + err.message);
    }
  });

  // 2. Download Clean Structured Table
  downloadCleanBtn.addEventListener('click', () => {
    if (!parsedData || parsedData.students.length === 0) return;

    const scope = exportScopeSelect.value;

    try {
      const sheetData = parsedData.students.map(student => {
        const row = {
          "Register No": student.regdNo,
          "Student Name": student.name,
          "Gender": student.gender
        };

        parsedData.subjects.forEach(subj => {
          const details = student.subjects[subj.name] || { grade: '-', points: '-', credits: '-' };
          row[`${subj.name} Grade`] = details.grade;
          if (scope !== 'grades-only') {
            row[`${subj.name} Points`] = details.points;
            row[`${subj.name} Credits`] = details.credits;
          }
        });

        row["SGPA"] = parseFloat(student.sgpa);
        row["CGPA"] = parseFloat(student.cgpa);
        row["Status"] = student.status;

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(sheetData);
      
      const colWidths = Object.keys(sheetData[0]).map(key => {
        let maxLen = key.length;
        sheetData.forEach(row => {
          const val = row[key] ? row[key].toString() : "";
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: maxLen + 2 };
      });
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Marks Structured");
      XLSX.writeFile(wb, `${currentFileName}_clean.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Failed to export clean Excel: " + err.message);
    }
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('[PWA] Service Worker registered successfully with scope:', reg.scope))
      .catch(err => console.log('[PWA] Service Worker registration failed:', err));
  });
}
