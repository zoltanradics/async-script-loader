
export function asyncScriptLoader(baseUrl: string, queryParamObject: { [key: string]: string }): Promise<void> {
	// Validate baseUrl
	if (typeof baseUrl !== 'string') {
		return Promise.reject(new TypeError('baseUrl must be a string'));
	}
	if (baseUrl.trim() === '') {
		return Promise.reject(new Error('baseUrl cannot be empty'));
	}

	if (baseUrl.startsWith('http') || baseUrl.startsWith('https')) {
		try {
			new URL(baseUrl);
		} catch {
			return Promise.reject(new Error('baseUrl must be a valid URL'));
		}
	}

	// Validate queryParamObject
	if (queryParamObject === null || queryParamObject === undefined) {
		return Promise.reject(new TypeError('queryParamObject must be an object'));
	}
	if (typeof queryParamObject !== 'object' || Array.isArray(queryParamObject)) {
		return Promise.reject(new TypeError('queryParamObject must be a plain object'));
	}
	for (const key of Object.keys(queryParamObject)) {
		if (typeof queryParamObject[key] !== 'string') {
			return Promise.reject(new TypeError(`queryParamObject value for key "${key}" must be a string`));
		}
	}

	const timeoutDuration = 2000;
	const constructedUrl = generateUrl(baseUrl, queryParamObject);

	// Create script element
	const scriptElement = document.createElement('script');
	scriptElement.src = constructedUrl;
	scriptElement.async = true;

	// Insert element to the end of the <head> element
	const headElement = document.getElementsByTagName('head')[0];
	if (!headElement) {
		return Promise.reject(new Error('No <head> element found in document'));
	}
	headElement.insertAdjacentElement('beforeend', scriptElement);

	return new Promise(function (resolve, reject) {
		// Resolve  promise automatically when we ran out of time
		const timeout = setTimeout(() => {
			cleanup();
			resolve();
			console.warn(`${constructedUrl} was loading for too long time.`);
		}, timeoutDuration);

		const cleanup = () => {
			clearTimeout(timeout);
			scriptElement.removeEventListener('load', onLoad);
			scriptElement.removeEventListener('error', onError);
		};

		// Handle when script is loaded successfully
		const onLoad = function (event: Event) {
			cleanup();
			resolve();
		};

		// Handle when there was an error while loading the script
		const onError = function (event: Event) {
			cleanup();
			reject(new Error(`Failed to load ${constructedUrl}.`));
		};

		scriptElement.addEventListener('load', onLoad);
		scriptElement.addEventListener('error', onError);
	});
}

function generateUrl(baseUrl: string, queryParamsObject: { [key: string]: string }): string {
	// Validate baseUrl
	if (typeof baseUrl !== 'string') {
		throw new TypeError('baseUrl must be a string');
	}
	if (baseUrl.trim() === '') {
		throw new Error('baseUrl cannot be empty');
	}

	// Validate queryParamsObject
	if (queryParamsObject === null || queryParamsObject === undefined) {
		throw new TypeError('queryParamsObject must be an object');
	}
	if (typeof queryParamsObject !== 'object' || Array.isArray(queryParamsObject)) {
		throw new TypeError('queryParamsObject must be a plain object');
	}
	for (const key of Object.keys(queryParamsObject)) {
		if (typeof queryParamsObject[key] !== 'string') {
			throw new TypeError(`queryParamsObject value for key "${key}" must be a string`);
		}
	}

	const keys = Object.keys(queryParamsObject);

	// If no query params to add, return baseUrl as-is
	if (keys.length === 0) {
		return baseUrl;
	}

	// Determine the first separator based on whether baseUrl already has query params
	const firstSeparator = baseUrl.includes('?') ? '&' : '?';

	const queryString = keys.reduce((acc, key, index) => {
		const encodedKey = encodeURIComponent(key);
		const encodedValue = encodeURIComponent(queryParamsObject[key]);
		const separator = index === 0 ? firstSeparator : '&';
		return `${acc}${separator}${encodedKey}=${encodedValue}`;
	}, '');

	return `${baseUrl}${queryString}`;
}
