import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export const MultiDimensionalContentWidget = () => {

    let getAllTabElements = function () {
        console.log('getting all tab elements...');
        var tabElements = document.querySelectorAll('.dynamic-content-tabs .tabs__item');
        return tabElements;
    }

    let getByText = function (text) {
        var allElements = getAllTabElements();
        var selectedElement;
        // docusaurus seems to be stripping away some array extensions like find()...
        allElements.forEach(el => {
            if (el.innerHTML == text) {
                selectedElement = el;
            }
        })
        return selectedElement;
    }

    let disableByText = function (text) {
        var targetElement = getByText(text);
        targetElement.classList.add('disabled-tab');
    }

    let enableByText = function (text) {
        var targetElement = getByText(text);
        targetElement.classList.remove('disabled-tab');
    }

    let selectByText = function (text) {
        console.log("selecting " + text + '...');
        var targetElement = getByText(text);
        targetElement.click();
    }

    let isSelectedByText = function (text) {
        var targetElement = getByText(text);
        var isSelected = targetElement.classList.contains('tabs__item--active');
        return isSelected;
    }

    let toggleUpdated = function (element) {
        // this displays the "updated" animation on the tab
        // to ensure that it's obvious to the user that the content is changing
        var parent = element.parentElement;
        parent.classList.remove('updated');
        parent.classList.add('updated');
        setTimeout(function () {
            console.log("removing updated")
            parent.classList.remove('updated');
        }, 2000)
    }

    let stashConfig = function () {
        var selectedOS, selectedNetwork, selectedEL, selectedENBN;
        // todo: we do this because we want the selection to be remembered when the user navigates away from the page (and between pages)

        // this could probably be a one-liner
        if (isSelectedByText('Windows'))
            selectedOS = "Windows";
        else
            selectedOS = "Linux, MacOS, Arm64";

        if (isSelectedByText('Localhost'))
            selectedNetwork = "Localhost";
        else if (isSelectedByText('Arbitrum Goerli'))
            selectedNetwork = "Arbitrum Goerli";
        else if (isSelectedByText('Arbitrum One'))
            selectedNetwork = "Arbitrum One";
        else if (isSelectedByText('Arbitrum Nova'))
            selectedNetwork = "Arbitrum Nova";


        var tabWidget = document.querySelector('.dynamic-content-tabs');
        tabWidget.dataset.selectedOS = selectedOS;
        tabWidget.dataset.selectedNetwork = selectedNetwork;
    }

    let bindTabs = function () {
        // I think I used timeouts because I don't know how to wire up a direct connection to docusaurus's rendering lifecycle; this is a hack; there are probably some docs I should read
        setTimeout(function () {
            var tabElements = getAllTabElements();
            tabElements.forEach(element => {
                var isLabel = element.textContent.indexOf(":") > -1;

                if (isLabel) {
                    // we're just repurposing the OOB docusaurus tab widget to display labels
                    // so we'll always turn the label tabs into unselectable labels
                    // we do this by unbinding the click event handler so that the tab can't be selected
                    // then we treat the tab at index 1 as the first selectable tab
                    element.outerHTML = element.outerHTML;
                } else {
                    element.addEventListener("click", function (event) {
                        // when we click a selectable tab, we want to display the "updated" animation and then stash the config so it persists between navs
                        var targetElement = event.target;
                        toggleUpdated(targetElement);
                        stashConfig();
                    }, false)
                }
            });
            stashConfig();
        }, 100)
    }

    return (
        <BrowserOnly>
            {() => { bindTabs() }}
        </BrowserOnly>
    );
};