
export function removeAllChildNodes(element: HTMLElement): HTMLElement
{
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    return element;
}

export function innerWidth(element: HTMLElement) : number
{
    // need to check for zero?
	//return Math.max(element.scrollWidth, element.offsetWidth, element.clientWidth);
    return Math.min(element.scrollWidth, element.offsetWidth, element.clientWidth);
}

export function innerHeight(element: HTMLElement): number
{
    // need to check for zero?
	//return Math.max(element.scrollHeight, element.offsetHeight, element.clientHeight);
	return Math.min(element.scrollHeight, element.offsetHeight, element.clientHeight);
}