function jsonToHtml(json, parentElement = document.body) {
	parentElement.innerHTML = '';

	// Начинаем процесс с корневого элемента
	for (let key in json) {
		parentElement.appendChild(createNode(key, json[key]));
	}
}

function createNode(key, value) {
	let element = fastDiv();
	// console.log(Array.isArray(value))
	console.log(typeof value === 'boolean')

	if (typeof value === 'boolean') {
		let title = fastElement('label');
		let checkbox = fastCheckbox(value);
		title.innerText = key;
		title.appendChild(checkbox);
		element.appendChild(title);

	} else if (typeof value === 'object' && value !== null) {
		let details = fastElement('details');
		details.toggleAttribute('open')
		element.appendChild(details);

		let title = fastElement('summary');
		title.innerText = key;
		details.appendChild(title);

		// Рекурсивно обрабатываем объект или массив
		if (Array.isArray(value)) {
			for (let item of value) {
				let elem = fastElement('p');
				elem.innerText = item;
				details.appendChild(elem);
			}
		} else {
			for (let childKey in value) {
				details.appendChild(createNode(childKey, value[childKey]));
			}
		}
	} else {
		// Создаем элемент для простых типов данных
		element.innerHTML = `<strong>${key}:</strong> ${value}`;
	}

	return element;
}