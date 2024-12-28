type Base64<imageType extends string> =
    `data:image/${imageType};base64${string}`;

export interface User {
    displayName: string;
    userPhoto: Base64<"png"> | Base64<"jpg"> | Base64<"jpeg">;
}
