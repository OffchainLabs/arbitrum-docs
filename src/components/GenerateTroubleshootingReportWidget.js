import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export const GenerateTroubleshootingReportWidget = () => {
  let appendConfigDetailsToOutput = function (output) {
    var tabWidget = document.querySelector('.dynamic-content-tabs');
    output = appendLineToText(output, 'Operating system: ' + tabWidget.dataset.selectedOS);
    output = appendLineToText(output, 'Network: ' + tabWidget.dataset.selectedNetwork);
    output = appendLineToText(output, 'Node type: ' + tabWidget.dataset.selectedNodeType);
    return output;
  };

  let appendUserInputToOutput = function (output) {
    console.log('appending user input to output');
    let inputToRead, innerText;
    try {
      inputToRead = document.querySelector('#vn-cmd');
      innerText = inputToRead.value;
      console.log('innerText: ' + innerText);
      if (innerText) output = appendLineToText(output, 'Node command: ' + innerText);

      inputToRead = document.querySelector('#output');
      innerText = inputToRead.value;
      if (innerText) {
        output = appendLineToText(output, '---------');
        output = appendLineToText(output, 'Unexpected output: ' + innerText);
      }

      return output;
    } catch (e) {
      console.log('error appending user input to output: ' + e);
      return output;
    }
  };

  let appendChecklistDetailsToOutput = function (output) {
    try {
      const checkboxes = document.querySelectorAll('.task input[type="checkbox"]');
      const labels = document.querySelectorAll('.task label');

      output = appendLineToText(output, 'Checklist:');
      checkboxes.forEach((checkbox, index) => {
        const isChecked = checkbox.checked;
        const labelText = labels[index].textContent;
        output = appendLineToText(output, `${labelText} ${isChecked ? '✓' : '✗'}`);
      });
      output = appendLineToText(output, '---------');
    } catch (e) {
      console.log('Error appending checklist details to output: ' + e);
    }

    return output;
  };

  let generateReport = function () {
    var output = 'Troubleshooting report';
    output = appendLineToText(output, '---------');
    output = appendConfigDetailsToOutput(output);
    output = appendLineToText(output, '---------');
    output = appendChecklistDetailsToOutput(output);
    output = appendUserInputToOutput(output);

    var reportDiv = document.querySelector('#generated-report');
    reportDiv.innerHTML = output;
    console.log('report generated');
  };

  let appendLineToText = function (existingText, newLine) {
    existingText = existingText + `\n` + newLine;
    return existingText;
  };

  let getButton = function () {
    var button = document.querySelector('#generate-report');
    return button;
  };

  let bindButton = function () {
    setTimeout(function () {
      var button = getButton();
      if (button && !button.classList.contains('bound')) {
        button.addEventListener('click', function (event) {
          generateReport();
        });
        button.classList.add('bound');
      }
    }, 100);
  };

  return (
    <BrowserOnly>
      {() => {
        bindButton();
      }}
    </BrowserOnly>
  );
};
