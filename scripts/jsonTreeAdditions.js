function addTreeElement(path, parent, editorCallbacks) {
    let selectorSafePath = path.replace(/\//g, '_').replace('.json', '');

    if(document.querySelector(`#file-window-${selectorSafePath}`) !== null) return false;

    // DOM GENERATION

    // Container
    const div = fastDiv("file-window");
    div.id = `file-window-${selectorSafePath}`;
    const jsontreeEle = fastDiv( "jsontree-container");
    div.appendChild(jsontreeEle);
    parent.appendChild(div);

    if (path === "murdermanifest.sodso.json") {
        // Manifest Panel
        let filesOrderList = fastDiv("files-order");
        parent.appendChild(filesOrderList);
        let ul = fastElement("ul");
        filesOrderList.appendChild(ul);
        jsontreeEle.classList.add("hidden");
    } else {
        //Tree Panel
        // Editor bar
        const editorBar = document.createElement("nav");
		editorBar.className = "editor-bar";
		jsontreeEle.appendChild(editorBar);
		const ul_left = document.createElement("ul");
		editorBar.appendChild(ul_left);

		const titleEle = document.createElement("li");
		titleEle.innerHTML = `<h5 title=${path}>${path.split('.')[0]}</h5>`;
		ul_left.appendChild(titleEle);

		const buttons = document.createElement("li");
		ul_left.appendChild(buttons);

		const group = document.createElement("div");
		group.setAttribute("role", "group");
		buttons.appendChild(group);

		const saveChanges = document.createElement("button");
		saveChanges.innerText = "Save";
		saveChanges.addEventListener('click', () => editorCallbacks.save(true))
		group.appendChild(saveChanges);

		const copySource = document.createElement("button");
		copySource.innerText = "Copy";
		copySource.addEventListener('click',editorCallbacks.copySource)
		group.appendChild(copySource);

		if(path !== 'murdermanifest') {
			const closeCross = document.createElement("button");
			closeCross.innerText = 'Close';
			closeCross.addEventListener('click', () => {
				deleteTree(div);
			})
			group.appendChild(closeCross);
		}
    }

    return jsontreeEle;
}

function deleteTree(treeEleToClose) {
    treeEleToClose.remove();
}

function getJSONPointer(node) {
    if (node.isRoot) {
        return "";
    }

    return getJSONPointer(node.parent) + "/" + node.label;
}

function createInputElement(domNode, readOnly, onUpdateCallback) {
    let inputElement = document.createElement("input");
    let initialValue = domNode.innerText.replace(/"/g, '');
    inputElement.value = initialValue;
    inputElement.readOnly = readOnly;
    inputElement.disabled = readOnly;
    inputElement.setAttribute('size', Math.max(initialValue.length, 5));
    inputElement.addEventListener('input', (e) => {
        e.target.setAttribute('size', Math.max(e.target.value.length, 5));
    });
    domNode.replaceChildren(inputElement);

    inputElement.addEventListener('blur', async (e) => {
        if(initialValue != e.target.value)
        {
            onUpdateCallback(e.target.value);
        }
    });
}

function createSOSelectElement(domNode, options, selectedSO, readOnly, onUpdateCallback) {
    var selectedOptionMatch = selectedSO.match(/REF.*\|([\w-]+).*/);
    var selectedOption = selectedOptionMatch ? options.indexOf(selectedOptionMatch[1]) : -1;

    var createdNodes = createEnumSelectElement(domNode, options, selectedOption, true, readOnly, onUpdateCallback);

    createdNodes.selectedCustomOption.text = `Custom: ${selectedSO.replace(/"/g, "").replace("REF:", "").replace(/\w+\|/, '').trim()}`;

    var selectElement = $(domNode).find('select');

    // Инициализация select2
    selectElement.select2({dropdownParent: $('#trees')});

    // Синхронизация select2 и обычного select
    selectElement.on('change', function() {
        let value = selectElement[0].value;
        let newCustomValue;
        if(value == -2)
        {
            let res = prompt('Enter prefab name', '');

            if (res === null) {
                return;
            }

            if ((res != 'null' && res !== null)) {
                res = makeCSVSafe(res);
            }

            newCustomValue = JSON.parse(res);
        }
        onUpdateCallback(value, newCustomValue);
    });

    return createdNodes;
}

function createEnumSelectElement(domNode, options, selectedIndex, allowCustom, readOnly, onUpdateCallback) {
    //Create and append select list
    let selectList = document.createElement("select");
    domNode.replaceChildren(selectList);

    let selectedCustomOption;

    selectList.disabled = readOnly;

    if(allowCustom) {
        var option = document.createElement("option");

        option.value = -2;
        option.text = "Custom...";
        option.selected = -2 == selectedIndex;

        selectedCustomOption = document.createElement("option");
        selectedCustomOption.value = -1;
        selectedCustomOption.text = "Custom:";
        selectedCustomOption.selected = -1 == selectedIndex;
        selectedCustomOption.style.display = -1 == selectedIndex ? "block" : "none";

        selectList.appendChild(option);
        selectList.appendChild(selectedCustomOption);
        // console.log('=======');
        // console.log(selectedIndex);
        if(selectedIndex == -1)
        {
            var linkButton = document.createElement("span");
            linkButton.innerText = "➥";
            linkButton.addEventListener('click', () => {
                const refPath = selectedCustomOption.text.replace("Custom:", "").trim();
                loadFile(refPath, false);
            });
            domNode.appendChild(linkButton);
        }
    }
    
    //Create and append the options
    for (var i = 0; i < options.length; i++) {
        var option = document.createElement("option");
        
        option.value = i;
        option.text = options[i];
        option.selected = i == selectedIndex;

        selectList.appendChild(option);
    }

    // console.log(selectList)
    // $(selectList).select2();
    selectList.addEventListener('change', async (e) => {
        let newCustomValue;
        if(e.target.value == -2)
        {
            let res = prompt('Enter prefab name', '');

            if (res === null) {
                return;
            }

            if ((res != 'null' && res !== null)) {
                res = makeCSVSafe(res);
            }

            newCustomValue = JSON.parse(res);
        }
        onUpdateCallback(e.target.value, newCustomValue);
    });
    return { list: selectList, selectedCustomOption };
}