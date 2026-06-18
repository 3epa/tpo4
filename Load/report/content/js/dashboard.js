/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 63.888888888888886, "KoPercent": 36.111111111111114};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4842592592592593, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Config 1 ($ 2100)"], "isController": false}, {"data": [0.9944444444444445, 500, 1500, "Config 3 ($ 5000)"], "isController": false}, {"data": [0.4583333333333333, 500, 1500, "Config 2 ($ 2900)"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 540, 195, 36.111111111111114, 587.3907407407405, 314, 846, 601.0, 783.9000000000001, 791.0, 821.0, 4.861361181130717, 1.09665471957148, 0.7548402615232265], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Config 1 ($ 2100)", 180, 180, 100.0, 769.6111111111115, 715, 846, 769.5, 796.9, 814.0, 835.47, 1.6204537270435722, 0.36555157319049336, 0.25161342050774216], "isController": false}, {"data": ["Config 3 ($ 5000)", 180, 0, 0.0, 390.161111111111, 314, 570, 385.0, 436.9, 457.0, 546.51, 1.626457034426674, 0.366905834914611, 0.2525455746814855], "isController": false}, {"data": ["Config 2 ($ 2900)", 180, 15, 8.333333333333334, 602.4000000000004, 522, 687, 601.0, 659.7, 666.95, 683.76, 1.6246073865482509, 0.366488580363912, 0.2522583734972382], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 798 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 760 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 777 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 781 milliseconds, but should not have lasted longer than 660 milliseconds.", 5, 2.5641025641025643, 0.9259259259259259], "isController": false}, {"data": ["The operation lasted too long: It took 745 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 683 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 750 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 770 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 801 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 663 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 756 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 755 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 817 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 719 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 821 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 776 milliseconds, but should not have lasted longer than 660 milliseconds.", 4, 2.051282051282051, 0.7407407407407407], "isController": false}, {"data": ["The operation lasted too long: It took 771 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 766 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 792 milliseconds, but should not have lasted longer than 660 milliseconds.", 4, 2.051282051282051, 0.7407407407407407], "isController": false}, {"data": ["The operation lasted too long: It took 832 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 668 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 787 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 730 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 736 milliseconds, but should not have lasted longer than 660 milliseconds.", 4, 2.051282051282051, 0.7407407407407407], "isController": false}, {"data": ["The operation lasted too long: It took 762 milliseconds, but should not have lasted longer than 660 milliseconds.", 5, 2.5641025641025643, 0.9259259259259259], "isController": false}, {"data": ["The operation lasted too long: It took 739 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 723 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 797 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 765 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 768 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 782 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 794 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 743 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 791 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 785 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 746 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 830 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 740 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 788 milliseconds, but should not have lasted longer than 660 milliseconds.", 5, 2.5641025641025643, 0.9259259259259259], "isController": false}, {"data": ["The operation lasted too long: It took 833 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 778 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 772 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 749 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 775 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 759 milliseconds, but should not have lasted longer than 660 milliseconds.", 4, 2.051282051282051, 0.7407407407407407], "isController": false}, {"data": ["The operation lasted too long: It took 742 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 738 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 732 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 748 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 753 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 666 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 846 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 687 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 773 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 731 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 814 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 769 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 752 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 779 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 784 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 665 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 758 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 803 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 737 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 763 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, 3.076923076923077, 1.1111111111111112], "isController": false}, {"data": ["The operation lasted too long: It took 667 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, 3.076923076923077, 1.1111111111111112], "isController": false}, {"data": ["The operation lasted too long: It took 747 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 789 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, 3.076923076923077, 1.1111111111111112], "isController": false}, {"data": ["The operation lasted too long: It took 786 milliseconds, but should not have lasted longer than 660 milliseconds.", 7, 3.58974358974359, 1.2962962962962963], "isController": false}, {"data": ["The operation lasted too long: It took 790 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 783 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 741 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 715 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 744 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 718 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 725 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 764 milliseconds, but should not have lasted longer than 660 milliseconds.", 5, 2.5641025641025643, 0.9259259259259259], "isController": false}, {"data": ["The operation lasted too long: It took 805 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 802 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 796 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 757 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 754 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, 1.5384615384615385, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 780 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, 3.076923076923077, 1.1111111111111112], "isController": false}, {"data": ["The operation lasted too long: It took 728 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, 1.0256410256410255, 0.37037037037037035], "isController": false}, {"data": ["The operation lasted too long: It took 799 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}, {"data": ["The operation lasted too long: It took 751 milliseconds, but should not have lasted longer than 660 milliseconds.", 4, 2.051282051282051, 0.7407407407407407], "isController": false}, {"data": ["The operation lasted too long: It took 818 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, 0.5128205128205128, 0.18518518518518517], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 540, 195, "The operation lasted too long: It took 786 milliseconds, but should not have lasted longer than 660 milliseconds.", 7, "The operation lasted too long: It took 763 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, "The operation lasted too long: It took 667 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, "The operation lasted too long: It took 789 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, "The operation lasted too long: It took 780 milliseconds, but should not have lasted longer than 660 milliseconds.", 6], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Config 1 ($ 2100)", 180, 180, "The operation lasted too long: It took 786 milliseconds, but should not have lasted longer than 660 milliseconds.", 7, "The operation lasted too long: It took 763 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, "The operation lasted too long: It took 789 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, "The operation lasted too long: It took 780 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, "The operation lasted too long: It took 781 milliseconds, but should not have lasted longer than 660 milliseconds.", 5], "isController": false}, {"data": [], "isController": false}, {"data": ["Config 2 ($ 2900)", 180, 15, "The operation lasted too long: It took 667 milliseconds, but should not have lasted longer than 660 milliseconds.", 6, "The operation lasted too long: It took 666 milliseconds, but should not have lasted longer than 660 milliseconds.", 3, "The operation lasted too long: It took 665 milliseconds, but should not have lasted longer than 660 milliseconds.", 2, "The operation lasted too long: It took 683 milliseconds, but should not have lasted longer than 660 milliseconds.", 1, "The operation lasted too long: It took 663 milliseconds, but should not have lasted longer than 660 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
