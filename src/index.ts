interface ValidationResult {
	valid: boolean;
	error?: Error;
}

function validateInputs(
	baseUrl: unknown,
	queryParamsObject: unknown
): ValidationResult {
	// Validate baseUrl
	if (typeof baseUrl !== 'string') {
		return { valid: false, error: new TypeError('baseUrl must be a string') };
	}
	if (baseUrl.trim() === '') {
		return { valid: false, error: new Error('baseUrl cannot be empty') };
	}

	// Validate URL and enforce safe protocols
	try {
		const url = new URL(baseUrl, window.location.origin);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			return { valid: false, error: new Error('baseUrl must use http: or https: protocol') };
		}
	} catch {
		return { valid: false, error: new Error('baseUrl must be a valid URL') };
	}

	// Validate queryParamsObject
	if (queryParamsObject === null || queryParamsObject === undefined) {
		return { valid: false, error: new TypeError('queryParamsObject must be an object') };
	}
	if (typeof queryParamsObject !== 'object' || Array.isArray(queryParamsObject)) {
		return { valid: false, error: new TypeError('queryParamsObject must be a plain object') };
	}

	const params = queryParamsObject as Record<string, unknown>;
	for (const key of Object.keys(params)) {
		if (key.trim() === '') {
			return { valid: false, error: new Error('queryParamsObject keys cannot be empty') };
		}
		if (typeof params[key] !== 'string') {
			return { valid: false, error: new TypeError(`queryParamsObject value for key "${key}" must be a string`) };
		}
	}

	return { valid: true };
}

export function asyncScriptLoader(baseUrl: string, queryParamObject: Record<string, string>): Promise<void> {
	// Check if script is loaded into a browser environment
	if (typeof window === 'undefined') {
		return Promise.reject(new Error('asyncScriptLoader requires a browser environment'));
	}

	// Validate inputs using shared helper
	const validation = validateInputs(baseUrl, queryParamObject);
	if (!validation.valid) {
		return Promise.reject(validation.error);
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
		const cleanup = (removeElement: boolean = false) => {
			clearTimeout(timeout);
			scriptElement.removeEventListener('load', onLoad);
			scriptElement.removeEventListener('error', onError);
			if (removeElement && scriptElement.parentNode) {
				scriptElement.parentNode.removeChild(scriptElement);
			}
		};

		// Reject promise when script loading times out
		const timeout = setTimeout(() => {
			cleanup(true);
			reject(new Error(`Script loading timed out after ${timeoutDuration}ms: ${constructedUrl}`));
		}, timeoutDuration);

		// Handle when script is loaded successfully
		const onLoad = function (_event: Event) {
			cleanup();
			resolve();
		};

		// Handle when there was an error while loading the script
		const onError = function (_event: Event) {
			cleanup(true);
			reject(new Error(`Failed to load ${constructedUrl}.`));
		};

		scriptElement.addEventListener('load', onLoad);
		scriptElement.addEventListener('error', onError);
	});
}

function generateUrl(baseUrl: string, queryParamsObject: Record<string, string>): string {
	// Validation is already done in asyncScriptLoader, but validate if called directly
	const validation = validateInputs(baseUrl, queryParamsObject);
	if (!validation.valid) {
		throw validation.error;
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
