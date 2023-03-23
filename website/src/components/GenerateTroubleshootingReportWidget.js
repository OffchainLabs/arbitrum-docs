import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export const GenerateTroubleshootingReportWidget = () => {

    let appendConfigDetailsToOutput = function (output) {
        var tabWidget = document.querySelector('.quickstart-tabs');
        output = appendLineToText(output, 'Operating system: ' + tabWidget.dataset.selectedOS);
        output = appendLineToText(output, 'Network: ' + tabWidget.dataset.selectedNetwork);
        output = appendLineToText(output, 'Execution client: ' + tabWidget.dataset.selectedEL);
        output = appendLineToText(output, 'EN-BN connection: ' + tabWidget.dataset.selectedENBN);
        return output;
    }

    let appendUserInputToOutput = function (output) {
        try {
            var inputToRead = document.querySelector('#el-cmd');
            var innerText = inputToRead.value;
            if (innerText)
                output = appendLineToText(output, 'Execution client command: ' + innerText);

            inputToRead = document.querySelector('#bn-cmd');
            innerText = inputToRead.value;
            if (innerText)
                output = appendLineToText(output, 'Beacon node command: ' + innerText);

            inputToRead = document.querySelector('#vn-cmd');
            innerText = inputToRead.value;
            if (innerText)
                output = appendLineToText(output, 'Validator node command: ' + innerText);

            inputToRead = document.querySelector('#output');
            innerText = inputToRead.value;
            if (innerText) {
                output = appendLineToText(output, '---------');
                output = appendLineToText(output, 'Unexpected output: ' + innerText);
            }

            return output;

        } catch {
            return output;
        }
    }

    let appendChecklistDetailsToOutput = function (output) {
        return output;
    }

    let generateReport = function () {
        var output = 'Troubleshooting report';
        output = appendLineToText(output, '---------');
        output = appendConfigDetailsToOutput(output);
        output = appendLineToText(output, '---------');
        output = appendChecklistDetailsToOutput(output);
        output = appendUserInputToOutput(output);

        var reportDiv = document.querySelector('#generated-report');
        reportDiv.innerHTML = output;
        console.log('report generated')
    }

    let appendLineToText = function (existingText, newLine) {
        existingText = existingText + `\n` + newLine;
        return existingText;
    }

    let getButton = function () {
        var button = document.querySelector('#generate-report');
        return button;
    }

    let bindButton = function () {
        setTimeout(function () {
            var button = getButton();
            if (button && !button.classList.contains('bound')) {
                button.addEventListener("click", function (event) {
                    generateReport();
                });
                button.classList.add('bound');
            }
        }, 100)
    }

    return (
        <BrowserOnly>
            {() => { bindButton() }}
        </BrowserOnly>
    );
};