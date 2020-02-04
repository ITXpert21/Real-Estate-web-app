export function previewImage(dwelling, replaces, defaultImageUrl) {
    let imageUrl = defaultImageUrl;
    if (dwelling) {
        if (dwelling.hasOwnProperty('headerImage') && dwelling.headerImage.hasOwnProperty('secure_url')) {
            imageUrl = replaces.length > 0 ? dwelling.headerImage.secure_url.replace(replaces[0], replaces[1])
                : dwelling.headerImage.secure_url;
        } else if (dwelling.images[0] !== undefined) {
            imageUrl = replaces.length > 0 ? dwelling.images[0].secure_url.replace(replaces[0], replaces[1])
                : dwelling.images[0].secure_url;
        }
    }

    return imageUrl;
}
