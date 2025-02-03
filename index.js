_id('fileInput').addEventListener('change', handleFiles, false);

/* utils */
function _id(id) {
    return document.getElementById(id);
}
function _find(selector, target) {
    target = target ? target : document;
    return target.querySelector(selector);
}
function _findAll(selector, target) {
    target = target ? target : document;
    return target.querySelectorAll(selector);
}
function _dom(str) {
    var divdom = document.createElement('div');
    divdom.innerHTML = str;
    return divdom.childNodes;
}
/* utils end */

let fileContents = {};
let queryHistory = [];
let queryResult = {};
let currentQueryResult = null;

function handleFiles(event) {
    const files = event.target.files;
    const fileList = _id('fileList');
    fileList.innerHTML = '';
    // Clear previous list  

    fileContents = {};
    // Clear previous contents  

    Array.from(files).forEach(file => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const arrayBuffer = e.target.result;

            mammoth.convertToHtml({
                arrayBuffer: arrayBuffer
            }).then(result => {
                const {value: html, messages} = result;
                fileContents[file.name] = html;
                addFileToList(file.name);
            }
            ).catch(err => {
                console.error("Failed to parse file:", err);
            }
            );
        }
        ;

        reader.readAsArrayBuffer(file);
    }
    );
}

function addFileToList(fileName) {
    const listItem = document.createElement('li');
    listItem.textContent = fileName;
    listItem.addEventListener('click', () => {
        displayContent(fileName);
    }
    );
    _id('fileList').appendChild(listItem);
}

function displayContent(fileName) {
    const contentArea = _id('contentArea');
    contentArea.innerHTML = fileContents[fileName] || 'File content not available.';
    const label = _find('.content-area h2');
    label.style.display = fileContents[fileName] ? 'none' : '';
    currentQueryResult = null;
}

//_find(".btn-query").addEventListener('click')
function doQuery() {
    var resultDom = _find('.query-result');
    resultDom.innerHTML = '';

    var queryStr = _find('.query input').value;
    var fileNameResult = '';
    queryResult = [];
    for (var filename in fileContents) {
        var value = fileContents[filename];
        var match = fileContents[filename].matchAll(queryStr).toArray();
        if (match.length > 0) {
            addToResult(filename, value, match);
            !fileNameResult && (fileNameResult = filename);
        }
    }
    if (fileNameResult) {
        displayContent(fileNameResult);
        highlight(queryStr);
    }
    currentQueryResult = null;
    queryHistory.push(queryStr);
}

function highlight(highlightStr) {
    const contentArea = _id('contentArea');
    contentArea.innerHTML = contentArea.innerHTML.replaceAll(highlightStr, '<span class="highlight">' + highlightStr + '</span>');
}

function lastResult() {
    var list = _findAll('.highlight');
    if (!currentQueryResult && list.length > 0) {
        currentQueryResult = list[0];
        scrollToView();
        return;
    }
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] === currentQueryResult) {
            var index = i - 1 <= 0 ? 0 : i - 1;
            currentQueryResult = list[index];
            scrollToView();
            return;
        }
    }
}
function nextResult() {
    var list = _findAll('.highlight');
    if (!currentQueryResult && list.length > 0) {
        currentQueryResult = list[0];
        scrollToView();
        return;
    }
    for (var i = 0; i < list.length; i++) {
        if (list[i] === currentQueryResult) {
            var index = i + 1 >= list.length ? 0 : i + 1;
            currentQueryResult = list[index];
            scrollToView();
            return;
        }
    }
}

function scrollToView() {
    currentQueryResult.scrollIntoView();
}

function doQueryHis(hisStr) {
    alert(hisStr);
}

/* query result */
function addToResult(filename, content, match) {
    queryResult[filename] = match.length;
    var resultDom = _find('.query-result');

    //for(var key in queryResult){
    let itemDom = _dom('<div class="item"><div class="label">' + '<div>' + '<button class="btn-show-detail">></button>' + '<a href="javascript: openQueryFromReqult(\'' + filename + '\')">' + filename + '</a>' + '</div>' + '<div>' + match.length + '</div>' + '</div><div class="detail"></div></div>')[0];
    let detailDom = _find('.detail', itemDom);
  //  let indexDom = _find('.index', detailDom);
  //  let contentDom = _find('.content', detailDom);
    var btnShowDetail = _find('.btn-show-detail', itemDom);
 //   const rowDom = _dom('<div class="row">' + '<div class="index"></div>' + '<div class="content"></div>' + '</div>');
    btnShowDetail.onclick = function() {
        btnShowDetail.isShow = !btnShowDetail.isShow;
        if (!btnShowDetail.isShow) {
            detailDom.innerHTML = '';
            return;
        }
        btnShowDetail.innerHTML = btnShowDetail.isShow?"V":">";
        let value = fileContents[filename];
        const currentQueryValue = queryHistory[queryHistory.length - 1];
        let match = value.matchAll('(.{10})(' + currentQueryValue + ')(.{10})');
        match.forEach( (item, index) => {
            const rowDom = _dom('<div class="row"></div>')[0];
            const indexDom = _dom('<div class="index"></div>')[0];
            const contentDom = _dom('<div class="content"></div>')[0];

            let itemDomStr = item[0].replaceAll(currentQueryValue,'<span class="highlight">'+currentQueryValue+'</span>');
            let itemDom = _dom('<div class="detail-item">' + itemDomStr + '</div>')[0];
            indexDom.innerHTML = index + 1 + ':';
            contentDom.appendChild(itemDom);
            
            rowDom.appendChild(indexDom);
            rowDom.appendChild(contentDom);
            detailDom.appendChild(rowDom);
        }
        );
    }
    resultDom.appendChild(itemDom);
    //}
}
function openQueryFromReqult(key) {
    displayContent(key);
    highlight(queryHistory[queryHistory.length - 1]);
    nextResult();
}
/* query result end */
