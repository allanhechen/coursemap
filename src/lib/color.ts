// the code to map colors found here https://stackoverflow.com/a/21682946
export function stringToColor(
    string: string,
    saturation: number = 100,
    lightness: number = 40
) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
}

export function stringToDeg(string: string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return `${hash % 360}deg`;
}

export function getBackgroundColor() {
    const time = new Date().toISOString();
    return {
        background: `linear-gradient(${stringToDeg(
            time + "hi there"
        )}, ${stringToColor(time + "these are some", 100, 30)}, ${stringToColor(
            time + "random values!",
            100,
            30
        )})`,
    };
}
